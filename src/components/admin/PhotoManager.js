// src/components/admin/PhotoManager.js
import React, { useState, useEffect } from "react";
import "../../styles/AdminPage.css";
import { 
  loadPhotoLibrary, 
  PHOTO_CATEGORIES, 
  getCategoryEmoji, 
  getCategoryLabel,
  getAllTags,
  getAllPhotoCategories,
  addPhotoCategory,
  removePhotoCategory
} from "../../utils/photoLoader";
import { githubAPI } from "../../lib/githubAPI";

const PhotoManager = () => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [allTags, setAllTags] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("📷");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    id: 0,
    title: "",
    description: "",
    category: PHOTO_CATEGORIES.NOUS,
    file: "",
    date: "",
    tags: [],
    isDateUnknown: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les photos depuis GitHub
      const photoData = await githubAPI.getPhotos();
      setPhotos(Array.isArray(photoData) ? photoData : []);
      
      // Charger les autres données localement (tags, catégories, etc.)
      setAllTags(getAllTags());
      setAllCategories(getAllPhotoCategories());
    } catch (err) {
      setError('Erreur lors du chargement des photos: ' + err.message);
      console.error('Error loading photos:', err);
      
      // Fallback vers les données locales
      const photoData = loadPhotoLibrary();
      setPhotos(photoData);
      setAllTags(getAllTags());
      setAllCategories(getAllPhotoCategories());
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      title: "",
      description: "",
      category: PHOTO_CATEGORIES.NOUS,
      file: "",
      date: new Date().toISOString().split('T')[0],
      tags: [],
      isDateUnknown: false
    });
    setSelectedPhoto(null);
    setIsEditing(false);
    setShowTagDropdown(false);
    setSelectedFile(null);
    setUploadProgress("");
  };

  const handleEdit = (photo) => {
    setFormData({
      id: photo.id,
      title: photo.title,
      description: photo.description || "",
      category: photo.category,
      file: photo.file,
      date: photo.date === "unknown" ? "" : photo.date,
      tags: photo.tags || [],
      isDateUnknown: photo.date === "unknown"
    });
    setSelectedPhoto(photo);
    setIsEditing(true);
    setSelectedFile(null);
    setUploadProgress("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        e.target.value = '';
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (max 5MB)');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      setUploadProgress(`Image sélectionnée: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleAddNewTag = () => {
    if (newTag.trim() && !allTags.includes(newTag.trim())) {
      const updatedTags = [...allTags, newTag.trim()];
      setAllTags(updatedTags);
      handleTagToggle(newTag.trim());
      setNewTag("");
    }
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      try {
        const newCategory = addPhotoCategory({
          name: newCategoryName.trim(),
          emoji: newCategoryEmoji
        });
        
        setNewCategoryName("");
        setNewCategoryEmoji("📷");
        setShowNewCategoryForm(false);
        setFormData(prev => ({ ...prev, category: newCategory.id }));
        
        // Reload data to show new category
        loadData();
        
        alert(`Catégorie "${newCategory.label}" ajoutée avec succès !`);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setUploadProgress("Préparation...");

      // Generate ID for new photos
      let finalData = { ...formData };
      if (!finalData.id) {
        finalData.id = Date.now();
      }

      // Handle unknown date
      finalData.date = formData.isDateUnknown ? "unknown" : formData.date;

      // Upload de l'image si nécessaire
      if (selectedFile) {
        setUploadProgress("Upload de l'image...");
        try {
          const uploadResult = await githubAPI.uploadFile(selectedFile, 'public/images');
          finalData.file = uploadResult.fileName;
          setUploadProgress("Image uploadée avec succès !");
        } catch (uploadErr) {
          throw new Error(`Erreur upload image: ${uploadErr.message}`);
        }
      } else if (!isEditing && !finalData.file) {
        throw new Error('Une image est requise');
      }

      // Get current photos from GitHub
      setUploadProgress("Mise à jour de la bibliothèque...");
      const currentPhotos = await githubAPI.getPhotos();
      
      let updatedPhotos;
      if (isEditing) {
        updatedPhotos = currentPhotos.map(photo => 
          photo.id === finalData.id ? finalData : photo
        );
      } else {
        updatedPhotos = [...currentPhotos, finalData];
      }

      // Save to GitHub
      setUploadProgress("Sauvegarde sur GitHub...");
      await githubAPI.updatePhotosFile(updatedPhotos);

      setUploadProgress("Terminé !");
      alert(`Photo "${finalData.title}" ${isEditing ? 'modifiée' : 'ajoutée'} avec succès!`);

      resetForm();
      await loadData();
    } catch (err) {
      setError('Erreur lors de la sauvegarde: ' + err.message);
      console.error('Error saving photo:', err);
      
      // Note: Pas de fallback localStorage pour les photos car l'image ne serait pas accessible
      alert('Erreur lors de la sauvegarde. Vérifiez votre connexion et réessayez.');
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  const handleDelete = async (photoId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) {
      try {
        setLoading(true);
        setError(null);
        
        const currentPhotos = await githubAPI.getPhotos();
        const photoToDelete = currentPhotos.find(photo => photo.id === photoId);
        
        // Supprimer le fichier image si il existe
        if (photoToDelete && photoToDelete.file) {
          try {
            await githubAPI.deleteFile(`public/images/${photoToDelete.file}`);
            console.log(`Fichier image ${photoToDelete.file} supprimé`);
          } catch (deleteFileErr) {
            console.warn(`Erreur suppression fichier image: ${deleteFileErr.message}`);
            // On continue même si la suppression du fichier échoue
          }
        }
        
        const updatedPhotos = currentPhotos.filter(photo => photo.id !== photoId);
        
        await githubAPI.updatePhotosFile(updatedPhotos);
        
        alert("Photo supprimée avec succès!");
        resetForm();
        await loadData();
      } catch (err) {
        setError('Erreur lors de la suppression: ' + err.message);
        console.error('Error deleting photo:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getAllCategories = () => {
    return allCategories;
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || photo.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const currentCategories = getAllCategories();

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Gestion des Photos</h2>
        <button className="btn-primary" onClick={resetForm} disabled={loading}>
          📸 Nouvelle Photo
        </button>
      </div>

      {error && (
        <div className="message error">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          Chargement...
          {uploadProgress && <div className="upload-progress">{uploadProgress}</div>}
        </div>
      )}

      {uploadProgress && !loading && (
        <div className="message info">
          {uploadProgress}
        </div>
      )}

      {/* Search and Filter */}
      <div className="manager-filters">
        <input
          type="text"
          placeholder="Rechercher une photo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">Toutes les catégories</option>
          {currentCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.emoji} {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="manager-content">
        {/* Photo List */}
        <div className="items-list">
          <h3>Photos ({filteredPhotos.length})</h3>
          <div className="photos-grid">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="photo-item">
                <div className="photo-preview">
                  <img 
                    src={photo.fullPath || `/images/${photo.file}`}
                    alt={photo.title}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x150/9370db/ffffff?text=No+Image';
                    }}
                  />
                  <div className="photo-overlay">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(photo)}
                      title="Modifier"
                      disabled={loading}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(photo.id)}
                      title="Supprimer"
                      disabled={loading}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="photo-info">
                  <h4>{photo.title}</h4>
                  <p className="photo-category">
                    {currentCategories.find(cat => cat.id === photo.category)?.emoji || "📷"} 
                    {" "}{currentCategories.find(cat => cat.id === photo.category)?.label || photo.category}
                  </p>
                  <p className="photo-date">
                    {photo.date === "unknown" ? "Date inconnue" : photo.date}
                  </p>
                  {photo.tags && photo.tags.length > 0 && (
                    <div className="photo-tags">
                      {photo.tags.map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Form */}
        <div className="item-form">
          <h3>{isEditing ? "Modifier la Photo" : "Nouvelle Photo"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Titre *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Titre de la photo"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description de la photo"
                rows="3"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Catégorie *</label>
              <div className="category-selector">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  {currentCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.emoji} {category.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-add-category"
                  onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                  disabled={loading}
                >
                  ➕
                </button>
              </div>
              
              {showNewCategoryForm && (
                <div className="new-category-form">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nom de la nouvelle catégorie"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    value={newCategoryEmoji}
                    onChange={(e) => setNewCategoryEmoji(e.target.value)}
                    placeholder="📷"
                    maxLength="2"
                    style={{ width: '60px' }}
                    disabled={loading}
                  />
                  <button type="button" onClick={handleAddNewCategory} className="btn-primary" disabled={loading}>
                    Ajouter
                  </button>
                  <button type="button" onClick={() => setShowNewCategoryForm(false)} className="btn-secondary" disabled={loading}>
                    Annuler
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Fichier Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required={!isEditing}
                disabled={loading}
              />
              {formData.file && !selectedFile && (
                <p className="file-info">Fichier actuel: {formData.file}</p>
              )}
              {selectedFile && (
                <p className="file-info">Nouvelle image: {selectedFile.name}</p>
              )}
              <small className="form-hint">
                Formats supportés: JPG, PNG, GIF, WebP (max 5MB)
              </small>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isDateUnknown"
                  checked={formData.isDateUnknown}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                Date inconnue
              </label>
            </div>

            {!formData.isDateUnknown && (
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div className="form-group">
              <label>Tags</label>
              <div className="tags-selector">
                <div className="selected-tags">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="selected-tag">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className="remove-tag"
                        disabled={loading}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                
                <button
                  type="button"
                  className="btn-toggle-tags"
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  disabled={loading}
                >
                  {showTagDropdown ? "Masquer les tags" : "Sélectionner des tags"}
                </button>

                {showTagDropdown && (
                  <div className="tags-dropdown">
                    <div className="existing-tags">
                      {allTags.map(tag => (
                        <label key={tag} className="tag-option">
                          <input
                            type="checkbox"
                            checked={formData.tags.includes(tag)}
                            onChange={() => handleTagToggle(tag)}
                            disabled={loading}
                          />
                          #{tag}
                        </label>
                      ))}
                    </div>
                    
                    <div className="new-tag-form">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Nouveau tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewTag())}
                        disabled={loading}
                      />
                      <button type="button" onClick={handleAddNewTag} className="btn-primary" disabled={loading}>
                        Ajouter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sauvegarde...' : (isEditing ? "Mettre à jour" : "Créer")}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm} disabled={loading}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PhotoManager;
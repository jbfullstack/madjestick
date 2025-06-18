// src/components/admin/PhotoManager.js
import React, { useState, useEffect } from "react";
import "../../styles/AdminPage.css";
import { 
  PHOTO_CATEGORIES, 
  getCategoryEmoji, 
  getCategoryLabel
} from "../../utils/photoLoader";
import { githubAPI } from "../../lib/githubAPI";

const PhotoManager = () => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [allTags, setAllTags] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const photoData = await githubAPI.getPhotos();
      setPhotos(Array.isArray(photoData) ? photoData : []);
      
      // Extract all unique tags
      const validData = Array.isArray(photoData) ? photoData : [];
      const tags = validData.reduce((acc, photo) => {
        if (photo.tags && Array.isArray(photo.tags)) {
          return [...acc, ...photo.tags];
        }
        return acc;
      }, []);
      setAllTags([...new Set(tags)]);
      
      // Load custom categories from localStorage
      const savedCategories = localStorage.getItem('customPhotoCategories');
      if (savedCategories) {
        try {
          const parsedCategories = JSON.parse(savedCategories);
          setCustomCategories(Array.isArray(parsedCategories) ? parsedCategories : []);
        } catch (parseError) {
          console.error('Error parsing custom categories:', parseError);
          setCustomCategories([]);
        }
      }
    } catch (err) {
      setError('Erreur lors du chargement des photos: ' + err.message);
      console.error('Error loading photos:', err);
      
      // Fallback to localStorage
      const localData = localStorage.getItem('photosLibrary');
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          const validData = Array.isArray(parsedData) ? parsedData : [];
          setPhotos(validData);
          const tags = validData.reduce((acc, photo) => {
            if (photo.tags && Array.isArray(photo.tags)) return [...acc, ...photo.tags];
            return acc;
          }, []);
          setAllTags([...new Set(tags)]);
        } catch (parseError) {
          console.error('Error parsing local photos:', parseError);
          setPhotos([]);
          setAllTags([]);
        }
      } else {
        setPhotos([]);
        setAllTags([]);
      }
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
      setFormData(prev => ({
        ...prev,
        file: file.name
      }));
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
      const newCategory = {
        id: newCategoryName.toLowerCase().replace(/\s+/g, '_'),
        label: newCategoryName.trim(),
        emoji: "📷"
      };
      
      const updatedCategories = [...customCategories, newCategory];
      setCustomCategories(updatedCategories);
      localStorage.setItem('customPhotoCategories', JSON.stringify(updatedCategories));
      
      setNewCategoryName("");
      setShowNewCategoryForm(false);
      setFormData(prev => ({ ...prev, category: newCategory.id }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // Prepare data
      let finalData = { ...formData };
      if (!finalData.id) {
        finalData.id = Date.now();
      }
      finalData.date = formData.isDateUnknown ? "unknown" : formData.date;

      // Get current photos from GitHub
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
      await githubAPI.updatePhotosFile(updatedPhotos);
      
      // Also save to localStorage as backup
      localStorage.setItem('photosLibrary', JSON.stringify(updatedPhotos));

      alert(`Photo "${finalData.title}" ${isEditing ? 'modifiée' : 'ajoutée'} avec succès! Déploiement en cours...`);

      resetForm();
      await loadData();
    } catch (err) {
      setError('Erreur lors de la sauvegarde: ' + err.message);
      console.error('Error saving photo:', err);
      
      // Fallback to localStorage only
      try {
        let finalData = { ...formData };
        if (!finalData.id) {
          finalData.id = Date.now();
        }
        finalData.date = formData.isDateUnknown ? "unknown" : formData.date;

        const localPhotos = JSON.parse(localStorage.getItem('photosLibrary') || '[]');
        let updatedPhotos;
        if (isEditing) {
          updatedPhotos = localPhotos.map(photo => 
            photo.id === finalData.id ? finalData : photo
          );
        } else {
          updatedPhotos = [...localPhotos, finalData];
        }
        
        localStorage.setItem('photosLibrary', JSON.stringify(updatedPhotos));
        alert('Sauvegarde locale réussie (GitHub indisponible)');
        resetForm();
        await loadData();
      } catch (localErr) {
        setError('Erreur complète de sauvegarde: ' + localErr.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (photoId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) {
      try {
        setLoading(true);
        setError(null);
        
        const currentPhotos = await githubAPI.getPhotos();
        const updatedPhotos = currentPhotos.filter(photo => photo.id !== photoId);
        
        await githubAPI.updatePhotosFile(updatedPhotos);
        localStorage.setItem('photosLibrary', JSON.stringify(updatedPhotos));
        
        alert("Photo supprimée avec succès! Déploiement en cours...");
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
    const defaultCategories = Object.values(PHOTO_CATEGORIES).map(cat => ({
      id: cat,
      label: getCategoryLabel(cat),
      emoji: getCategoryEmoji(cat)
    }));
    return [...defaultCategories, ...customCategories];
  };

  const filteredPhotos = Array.isArray(photos) 
    ? photos.filter(photo => {
        const matchesSearch = photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             photo.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || photo.category === filterCategory;
        return matchesSearch && matchesCategory;
      })
    : [];

  const allCategories = getAllCategories();

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
        </div>
      )}

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
          {allCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.emoji} {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="manager-content">
        <div className="items-list">
          <h3>Photos ({filteredPhotos.length})</h3>
          <div className="photos-grid">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="photo-item">
                <div className="photo-preview">
                  <img 
                    src={`/images/${photo.file}`}
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
                    {allCategories.find(cat => cat.id === photo.category)?.emoji || "📷"} 
                    {" "}{allCategories.find(cat => cat.id === photo.category)?.label || photo.category}
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
                >
                  {allCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.emoji} {category.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-add-category"
                  onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
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
                  />
                  <button type="button" onClick={handleAddNewCategory} className="btn-primary">
                    Ajouter
                  </button>
                  <button type="button" onClick={() => setShowNewCategoryForm(false)} className="btn-secondary">
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
              />
              {formData.file && (
                <p className="file-info">Fichier: {formData.file}</p>
              )}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isDateUnknown"
                  checked={formData.isDateUnknown}
                  onChange={handleInputChange}
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
                      />
                      <button type="button" onClick={handleAddNewTag} className="btn-primary">
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
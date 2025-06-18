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

  const loadData = () => {
    const photoData = loadPhotoLibrary();
    setPhotos(photoData);
    setAllTags(getAllTags());
    setAllCategories(getAllPhotoCategories());
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate ID for new photos
    if (!formData.id) {
      const newId = Date.now();
      setFormData(prev => ({ ...prev, id: newId }));
    }

    // Handle unknown date
    const finalDate = formData.isDateUnknown ? "unknown" : formData.date;
    const dataToSave = { ...formData, date: finalDate };

    // In a real app, you would save to backend/localStorage
    console.log("Photo data to save:", dataToSave);
    alert(`Photo "${formData.title}" ${isEditing ? 'updated' : 'created'} successfully!`);
    
    resetForm();
    loadData();
  };

  const handleDelete = (photoId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) {
      // In a real app, you would delete from backend/localStorage
      console.log("Delete photo:", photoId);
      alert("Photo supprimée!");
      resetForm();
      loadData();
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
        <button className="btn-primary" onClick={resetForm}>
          📸 Nouvelle Photo
        </button>
      </div>

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
                    src={photo.fullPath} 
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
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(photo.id)}
                      title="Supprimer"
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
                  <input
                    type="text"
                    value={newCategoryEmoji}
                    onChange={(e) => setNewCategoryEmoji(e.target.value)}
                    placeholder="📷"
                    maxLength="2"
                    style={{ width: '60px' }}
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
              <button type="submit" className="btn-primary">
                {isEditing ? "Mettre à jour" : "Créer"}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
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
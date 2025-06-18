// src/components/admin/PhotoManager.js
import React, { useState, useEffect } from "react";
import "../../styles/AdminPage.css";
import { 
  loadPhotoLibrary, 
  PHOTO_CATEGORIES, 
  getCategoryEmoji, 
  getCategoryLabel,
  getAllTags 
} from "../../utils/photoLoader";

const PhotoManager = () => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [allTags, setAllTags] = useState([]);

  const [formData, setFormData] = useState({
    id: 0,
    title: "",
    description: "",
    category: PHOTO_CATEGORIES.NOUS,
    file: "",
    date: "",
    tags: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const photoData = loadPhotoLibrary();
    setPhotos(photoData);
    setAllTags(getAllTags());
  };

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      description: "",
      category: PHOTO_CATEGORIES.NOUS,
      file: "",
      date: new Date().toISOString().split('T')[0],
      tags: []
    });
    setSelectedPhoto(null);
    setIsEditing(false);
  };

  const handleEdit = (photo) => {
    setFormData({
      id: photo.id,
      title: photo.title,
      description: photo.description || "",
      category: photo.category,
      file: photo.file,
      date: photo.date,
      tags: photo.tags || []
    });
    setSelectedPhoto(photo);
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags: tagsArray
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate ID for new photos
    if (!formData.id) {
      const newId = Date.now();
      setFormData(prev => ({ ...prev, id: newId }));
    }

    // In a real app, you would save to backend/localStorage
    console.log("Photo data to save:", formData);
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

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || photo.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
          {Object.values(PHOTO_CATEGORIES).map(category => (
            <option key={category} value={category}>
              {getCategoryEmoji(category)} {getCategoryLabel(category)}
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
                    {getCategoryEmoji(photo.category)} {getCategoryLabel(photo.category)}
                  </p>
                  <p className="photo-date">{photo.date}</p>
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
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {Object.values(PHOTO_CATEGORIES).map(category => (
                  <option key={category} value={category}>
                    {getCategoryEmoji(category)} {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
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
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={handleTagsChange}
                placeholder="couple, romantique, restaurant (séparés par des virgules)"
              />
              <small>Tags disponibles: {allTags.join(', ')}</small>
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
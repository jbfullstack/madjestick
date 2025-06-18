// src/components/pages/PhotoPage.js
import React, { useState, useEffect } from "react";
import "../../styles/PhotoPage.css";
import { 
  PHOTO_CATEGORIES, 
  getCategoryLabel 
} from "../../utils/photoLoader";
import { githubAPI } from "../../lib/githubAPI";

const PhotoPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPhotos();
  }, [selectedCategory]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load from GitHub first
      let allPhotos;
      try {
        allPhotos = await githubAPI.getPhotos();
      } catch (githubError) {
        console.warn('GitHub API failed, falling back to localStorage:', githubError);
        // Fallback to localStorage
        const localData = localStorage.getItem('photosLibrary');
        if (localData) {
          allPhotos = JSON.parse(localData);
        } else {
          // Final fallback to default photos
          allPhotos = [
            {
              id: 1,
              title: "Photo 1",
              category: "nous",
              file: "photo1.jpg",
              description: "Photo par défaut"
            }
          ];
        }
      }

      // Add full path for images
      allPhotos = allPhotos.map(photo => ({
        ...photo,
        fullPath: `/images/${photo.file}` // Chemin public/ au lieu de src/
      }));

      if (selectedCategory === "all") {
        setPhotos(allPhotos);
      } else {
        setPhotos(allPhotos.filter(photo => photo.category === selectedCategory));
      }
    } catch (err) {
      setError('Erreur lors du chargement des photos: ' + err.message);
      console.error('Error loading photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", label: "All Photos" },
    { id: PHOTO_CATEGORIES.NOUS, label: getCategoryLabel(PHOTO_CATEGORIES.NOUS) },
    { id: PHOTO_CATEGORIES.MOMENTS, label: getCategoryLabel(PHOTO_CATEGORIES.MOMENTS) },
    { id: PHOTO_CATEGORIES.AUTRES, label: getCategoryLabel(PHOTO_CATEGORIES.AUTRES) },
  ];

  const groupedPhotos = selectedCategory === "all" 
    ? Object.values(PHOTO_CATEGORIES).reduce((acc, category) => {
        acc[category] = photos.filter(photo => photo.category === category);
        return acc;
      }, {})
    : { [selectedCategory]: photos };

  if (loading) {
    return (
      <div className="photo-page">
        <h1>Madjestick Photo Gallery</h1>
        <div className="loading">Chargement des photos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="photo-page">
        <h1>Madjestick Photo Gallery</h1>
        <div className="message error">{error}</div>
      </div>
    );
  }

  return (
    <div className="photo-page">
      <h1>Madjestick Photo Gallery</h1>

      <div className="photo-filters">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`filter-button ${
              selectedCategory === category.id ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="photos-container">
        {selectedCategory === "all" ? (
          Object.entries(groupedPhotos).map(([category, categoryPhotos]) => (
            <div key={category} className="photo-category">
              <h2>{getCategoryLabel(category)}</h2>
              <div className="images-grid">
                {categoryPhotos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.fullPath}
                    alt={photo.title}
                    className="photo-gallery"
                    title={photo.description}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300/9370db/ffffff?text=No+Image';
                    }}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="images-grid">
            {photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.fullPath}
                alt={photo.title}
                className="photo-gallery"
                title={photo.description}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300/9370db/ffffff?text=No+Image';
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoPage;
// src/components/pages/PhotoPage.js
import React, { useState, useEffect } from "react";
import "../../styles/PhotoPage.css";
import { 
  loadPhotoLibrary, 
  getPhotosByCategory, 
  PHOTO_CATEGORIES, 
  getCategoryLabel,
  getAllPhotoCategories
} from "../../utils/photoLoader";

const PhotoPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    loadPhotos();
  }, [selectedCategory]);

  const loadPhotos = () => {
    if (selectedCategory === "all") {
      setPhotos(loadPhotoLibrary());
    } else {
      setPhotos(getPhotosByCategory(selectedCategory));
    }
  };

  const categories = [
    { id: "all", label: "All Photos" },
    ...getAllPhotoCategories().map(cat => ({ id: cat.id, label: cat.label }))
  ];

  const groupedPhotos = selectedCategory === "all" 
    ? getAllPhotoCategories().reduce((acc, category) => {
        acc[category.id] = photos.filter(photo => photo.category === category.id);
        return acc;
      }, {})
    : { [selectedCategory]: photos };

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
// src/components/pages/PhotoPage.js
import React, { useState, useEffect } from "react";
import "../../styles/PhotoPage.css";
import { 
  PHOTO_CATEGORIES, 
  getCategoryLabel 
} from "../../utils/photoLoader";

const PhotoPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    loadPhotos();
  }, [selectedCategory]);

  const loadPhotos = () => {
    // Try to load from localStorage first, then fallback to photo loader
    const savedPhotos = localStorage.getItem('photosLibrary');
    let allPhotos;
    
    if (savedPhotos) {
      allPhotos = JSON.parse(savedPhotos);
    } else {
      // Fallback to default photos
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

    // Add full path for images
    allPhotos = allPhotos.map(photo => ({
      ...photo,
      fullPath: `/src/images/${photo.file}` // You might need to adjust this path
    }));

    if (selectedCategory === "all") {
      setPhotos(allPhotos);
    } else {
      setPhotos(allPhotos.filter(photo => photo.category === selectedCategory));
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
// src/components/pages/PhotoPage.js
import React, { useState, useEffect } from "react";
import "../../styles/PhotoPage.css";
import {
  loadPhotoLibrary,
  getPhotosByCategory,
  getCategoryLabel,
  getAllPhotoCategories,
} from "../../utils/photoLoader";

const PhotoPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const loadPhotos = React.useCallback(() => {
    if (selectedCategory === "all") {
      setPhotos(loadPhotoLibrary());
    } else {
      setPhotos(getPhotosByCategory(selectedCategory));
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const openLightbox = (photo) => {
    setSelectedPhoto(photo);
    document.body.style.overflow = "hidden"; // Empêcher le scroll
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    document.body.style.overflow = "auto"; // Réautoriser le scroll
  };

  // Fermer avec la touche Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedPhoto) {
        closeLightbox();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto]);

  const categories = [
    { id: "all", label: "All Photos" },
    ...getAllPhotoCategories().map((cat) => ({ id: cat.id, label: cat.label })),
  ];

  const groupedPhotos =
    selectedCategory === "all"
      ? getAllPhotoCategories().reduce((acc, category) => {
          acc[category.id] = photos.filter(
            (photo) => photo.category === category.id
          );
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
                    onClick={() => openLightbox(photo)}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x300/9370db/ffffff?text=No+Image";
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
                onClick={() => openLightbox(photo)}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x300/9370db/ffffff?text=No+Image";
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-container">
            <button className="lightbox-close" onClick={closeLightbox}>
              ✕
            </button>
            <img
              src={selectedPhoto.fullPath}
              alt={selectedPhoto.title}
              className="lightbox-image"
              onClick={(e) => e.stopPropagation()} // Empêcher la fermeture en cliquant sur l'image
            />
            <div className="lightbox-info">
              <h3>{selectedPhoto.title}</h3>
              {selectedPhoto.description && <p>{selectedPhoto.description}</p>}
              <div className="lightbox-meta">
                <span className="lightbox-date">
                  {selectedPhoto.date === "unknown"
                    ? "Date inconnue"
                    : selectedPhoto.date}
                </span>
                {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                  <div className="lightbox-tags">
                    {selectedPhoto.tags.map((tag, index) => (
                      <span key={index} className="lightbox-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoPage;

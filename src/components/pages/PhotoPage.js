// src/components/pages/PhotoPage.js
import React, { useState } from "react";
import "../../styles/PhotoPage.css";

// Import your additional photos here
// import CeremonyPhoto1 from "../../images/ceremony1.jpg";
// import CeremonyPhoto2 from "../../images/ceremony2.jpg";
// ... etc

const PhotoPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Replace these placeholders with your actual photo imports
  const photoGalleries = {
    nous: [
      "https://via.placeholder.com/300x300/ff69b4/ffffff?text=Ceremony+1",
      "https://via.placeholder.com/300x300/ff1493/ffffff?text=Ceremony+2",
      "https://via.placeholder.com/300x300/db7093/ffffff?text=Ceremony+3",
      "https://via.placeholder.com/300x300/ff69b4/ffffff?text=Ceremony+4",
    ],
    moments: [
      "https://via.placeholder.com/300x300/ff69b4/ffffff?text=Reception+1",
      "https://via.placeholder.com/300x300/ff1493/ffffff?text=Reception+2",
      "https://via.placeholder.com/300x300/db7093/ffffff?text=Reception+3",
      "https://via.placeholder.com/300x300/ff69b4/ffffff?text=Reception+4",
    ],
    autres: [
      "https://via.placeholder.com/300x300/ff69b4/ffffff?text=Candid+1",
      "https://via.placeholder.com/300x300/ff1493/ffffff?text=Candid+2",
      "https://via.placeholder.com/300x300/db7093/ffffff?text=Candid+3",
      "https://via.placeholder.com/300x300/ff69b4/ffffff?text=Candid+4",
    ],
  };

  const categories = [
    { id: "all", label: "All Photos" },
    { id: "nous", label: "Nous" },
    { id: "moments", label: "Moments" },
    { id: "autres", label: "Autres" },
  ];

  const getPhotosToShow = () => {
    if (selectedCategory === "all") {
      return Object.values(photoGalleries).flat();
    }
    return photoGalleries[selectedCategory] || [];
  };

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
          Object.entries(photoGalleries).map(([category, photos]) => (
            <div key={category} className="photo-category">
              <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
              <div className="images-grid">
                {photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${category} photo ${index + 1}`}
                    className="photo-gallery"
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="images-grid">
            {getPhotosToShow().map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`${selectedCategory} photo ${index + 1}`}
                className="photo-gallery"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoPage;

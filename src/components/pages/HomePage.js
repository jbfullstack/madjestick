// src/components/pages/HomePage.js
import React from "react";
import Counter from "../common/Counter";
import useWeddingCounter from "../../hooks/useWeddingCounter";
import useTypingEffect from "../../hooks/useTypingEffect";
import "../../styles/HomePage.css";

// ANCIEN (ne marche pas avec public/) :
// import Photo1 from "../../images/photo1.jpg";
// import Photo2 from "../../images/photo2.jpg";
// import Photo3 from "../../images/photo3.jpg";
// import Photo4 from "../../images/photo4.jpg";
// import Photo5 from "../../images/photo5.jpg";

const HomePage = () => {
  const timeSinceWedding = useWeddingCounter();
  const displayedText = useTypingEffect();

  // NOUVEAU (marche avec public/) :
  const homePhotos = [
    "/images/photo1.jpg",
    "/images/photo2.jpg", 
    "/images/photo3.jpg",
    "/images/photo4.jpg",
    "/images/photo5.jpg"
  ];

  return (
    <div className="home-page">
      <h1>Happy Times Since !</h1>
      <Counter timeSinceWedding={timeSinceWedding} />
      <div className="images-grid">
        {homePhotos.map((photo, index) => (
          <img
            key={index}
            src={photo}
            alt={`Wedding memory ${index + 1}`}
            className="photo-thumbnail"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/200x200/9370db/ffffff?text=No+Image';
            }}
          />
        ))}
      </div>
      <div className="sentence">
        <p>{displayedText}</p>
      </div>
    </div>
  );
};

export default HomePage;
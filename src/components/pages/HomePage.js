// src/components/pages/HomePage.js
import React from "react";
import Counter from "../common/Counter";
import useWeddingCounter from "../../hooks/useWeddingCounter";
import useTypingEffect from "../../hooks/useTypingEffect";
import "../../styles/HomePage.css";

// Import your actual photos here
import Photo1 from "../../images/photo1.jpg";
import Photo2 from "../../images/photo2.jpg";
import Photo3 from "../../images/photo3.jpg";
import Photo4 from "../../images/photo4.jpg";
import Photo5 from "../../images/photo5.jpg";

const HomePage = () => {
  const timeSinceWedding = useWeddingCounter();
  const displayedText = useTypingEffect();

  // Replace these placeholder URLs with your actual photo imports
  const homePhotos = [Photo1, Photo2, Photo3, Photo4, Photo5];

  // When you have your actual photos, replace the array above with:
  // const homePhotos = [Photo1, Photo2, Photo3, Photo4, Photo5];

  return (
    <div className="home-page">
      <h1>Happy Times Since !</h1>
      <Counter timeSinceWedding={timeSinceWedding} />
      <div className="images-grid">
        {homePhotos.map((photo, index) => (
          <img
            key={index}
            src={photo}
            alt={`Wedding photo ${index + 1}`}
            className="photo-thumbnail"
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

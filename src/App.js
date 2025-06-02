import React, { useState, useEffect } from "react";
import "./App.css";

import Photo1 from "./images/photo1.jpg";
import Photo2 from "./images/photo2.jpg";
import Photo3 from "./images/photo3.jpg";
import Photo4 from "./images/photo4.jpg";
import Photo5 from "./images/photo5.jpg";

function App() {
  const weddingDate = new Date("2024-10-19T13:00:00");
  const [timeSinceWedding, setTimeSinceWedding] = useState({});
  const [currentSentence, setCurrentSentence] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);

  const typingSpeed = 100; // milliseconds per character
  const pauseTime = 2000; // milliseconds to wait after typing is complete

  const sentences = [
    "Tout est entendable si c’est bien argumenté (2025)",
    "Vous laisser gagner une bataille pour pouvoir gagner la guerre (23 avril 2025)",
    "La vie c’est aussi d’avancer, sinon ça serait chiant (29 avril 2025)",
    "Même en Ehpad On n’est pas des yaourts ! (2025)",
  ];

  // Initialize the first sentence
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * sentences.length);
    setCurrentSentence(sentences[randomIndex]);
  }, []);

  // Typing effect
  useEffect(() => {
    if (typingIndex < currentSentence.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + currentSentence.charAt(typingIndex));
        setTypingIndex((prev) => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timeout);
    } else {
      // Typing complete, wait before starting the next sentence
      const pauseTimeout = setTimeout(() => {
        let nextSentence = currentSentence;
        // Ensure the new sentence is different from the current one
        while (nextSentence === currentSentence && sentences.length > 1) {
          const randomIndex = Math.floor(Math.random() * sentences.length);
          nextSentence = sentences[randomIndex];
        }
        setCurrentSentence(nextSentence);
        setDisplayedText("");
        setTypingIndex(0);
      }, pauseTime);

      return () => clearTimeout(pauseTimeout);
    }
  }, [typingIndex, currentSentence]);

  // Update counter
  useEffect(() => {
    updateTimeSinceWedding(); // Initial call to set the state
    const interval = setInterval(() => {
      updateTimeSinceWedding();
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const updateTimeSinceWedding = () => {
    const now = new Date();
    let diff = Math.abs(now - weddingDate);

    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    diff -= years * (1000 * 60 * 60 * 24 * 365);

    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    diff -= months * (1000 * 60 * 60 * 24 * 30);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);

    const seconds = Math.floor(diff / 1000);

    setTimeSinceWedding({ years, months, days, hours, minutes, seconds });
  };

  return (
    <div className="App">
      <h1>Happy Times Since Your Wedding!</h1>
      <div className="counter">
        <p>{timeSinceWedding.years} Years</p>
        <p>{timeSinceWedding.months} Months</p>
        <p>{timeSinceWedding.days} Days</p>
        <p>{timeSinceWedding.hours} Hours</p>
        <p>{timeSinceWedding.minutes} Minutes</p>
        <p>{timeSinceWedding.seconds} Seconds</p>
      </div>
      <div className="images-grid">
        <img src={Photo1} alt="La belle photo" />
        <img src={Photo2} alt="La plus belle photo" />
        <img src={Photo3} alt="Woow quelle est belle cette photo" />
        <img src={Photo4} alt="Celle ci est vraiment mieux !" />
        <img src={Photo5} alt="Omg ça ne s'arrête pas !! :D " />
      </div>
      <div className="sentence">
        <p>{displayedText}</p>
      </div>
    </div>
  );
}

export default App;

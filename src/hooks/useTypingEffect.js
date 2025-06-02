// src/hooks/useTypingEffect.js
import { useState, useEffect } from "react";

const useTypingEffect = () => {
  const [currentSentence, setCurrentSentence] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);

  const typingSpeed = 100;
  const pauseTime = 2000;

  const sentences = [
    "Tout est entendable si c'est bien argumenté (2025)",
    "Vous laisser gagner une bataille pour pouvoir gagner la guerre (23 avril 2025)",
    "La vie c'est aussi d'avancer, sinon ça serait chiant (29 avril 2025)",
    "Même en Ehpad On n'est pas des yaourts ! (2025)",
  ];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * sentences.length);
    setCurrentSentence(sentences[randomIndex]);
  }, []);

  useEffect(() => {
    if (typingIndex < currentSentence.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + currentSentence.charAt(typingIndex));
        setTypingIndex((prev) => prev + 1);
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else {
      const pauseTimeout = setTimeout(() => {
        let nextSentence = currentSentence;
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

  return displayedText;
};

export default useTypingEffect;

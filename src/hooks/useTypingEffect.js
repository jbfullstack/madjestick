// src/hooks/useTypingEffect.js
import { useState, useEffect } from "react";
import { getFavoriteCitations } from "../utils/citationsLoader";

const useTypingEffect = () => {
  const [currentSentence, setCurrentSentence] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [citations, setCitations] = useState([]);

  const typingSpeed = 100;
  const pauseTime = 2000;

  // Load citations on component mount
  useEffect(() => {
    // Try to load from localStorage first, then fallback to JSON
    const savedCitations = localStorage.getItem('citationsLibrary');
    const allCitations = savedCitations ? JSON.parse(savedCitations) : [];
    
    const favoriteCitations = allCitations.filter(citation => citation.isFavorite);
    const sentences = favoriteCitations.map(citation => 
      `${citation.text} (${citation.date === "unknown" ? "date inconnue" : citation.date})`
    );
    
    // Fallback to original sentences if no citations available
    const fallbackSentences = [
      "Tout est entendable si c'est bien argumenté (2025)",
      "Vous laisser gagner une bataille pour pouvoir gagner la guerre (23 avril 2025)",
      "La vie c'est aussi d'avancer, sinon ça serait chiant (29 avril 2025)",
      "Même en Ehpad On n'est pas des yaourts ! (2025)",
    ];

    setCitations(sentences.length > 0 ? sentences : fallbackSentences);
  }, []);

  useEffect(() => {
    if (citations.length > 0) {
      const randomIndex = Math.floor(Math.random() * citations.length);
      setCurrentSentence(citations[randomIndex]);
    }
  }, [citations]);

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
        while (nextSentence === currentSentence && citations.length > 1) {
          const randomIndex = Math.floor(Math.random() * citations.length);
          nextSentence = citations[randomIndex];
        }
        setCurrentSentence(nextSentence);
        setDisplayedText("");
        setTypingIndex(0);
      }, pauseTime);
      return () => clearTimeout(pauseTimeout);
    }
  }, [typingIndex, currentSentence, citations]);

  return displayedText;
};

export default useTypingEffect;
// src/components/pages/ChronoPage.js
import React from "react";
import Counter from "../common/Counter";
import useWeddingCounter from "../../hooks/useWeddingCounter";
import "../../styles/ChronoPage.css";

const ChronoPage = () => {
  const timeSinceWedding = useWeddingCounter();

  return (
    <div className="chrono-page">
      <h1>Madjestick Chronomètre</h1>
      <div className="chrono-display">
        <Counter timeSinceWedding={timeSinceWedding} />
        <div className="chrono-details">
          <p>Depuis le 2 may 2025 à 22h00</p>
          <p>Every second counts in your beautiful journey together!</p>
          <div className="chrono-stats">
            <div className="stat-item">
              <span className="stat-number">
                {(timeSinceWedding.days || 0) +
                  (timeSinceWedding.months || 0) * 30 +
                  (timeSinceWedding.years || 0) * 365}
              </span>
              <span className="stat-label"> Jours</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {((timeSinceWedding.days || 0) +
                  (timeSinceWedding.months || 0) * 30 +
                  (timeSinceWedding.years || 0) * 365) *
                  24 +
                  (timeSinceWedding.hours || 0)}
              </span>
              <span className="stat-label"> Heures</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChronoPage;

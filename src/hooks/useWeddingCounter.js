// src/hooks/useWeddingCounter.js
import { useState, useEffect } from "react";

const useWeddingCounter = () => {
  const weddingDate = new Date("2025-05-02T22:00:00");
  const [timeSinceWedding, setTimeSinceWedding] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateTimeSinceWedding = () => {
      const now = new Date();

      // Calendar-based calculation
      let years = now.getFullYear() - weddingDate.getFullYear();
      let months = now.getMonth() - weddingDate.getMonth();
      let days = now.getDate() - weddingDate.getDate();
      let hours = now.getHours() - weddingDate.getHours();
      let minutes = now.getMinutes() - weddingDate.getMinutes();
      let seconds = now.getSeconds() - weddingDate.getSeconds();

      // Adjust for negative seconds
      if (seconds < 0) {
        seconds += 60;
        minutes--;
      }

      // Adjust for negative minutes
      if (minutes < 0) {
        minutes += 60;
        hours--;
      }

      // Adjust for negative hours
      if (hours < 0) {
        hours += 24;
        days--;
      }

      // Adjust for negative days
      if (days < 0) {
        // Get the last day of the previous month
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
        months--;
      }

      // Adjust for negative months
      if (months < 0) {
        months += 12;
        years--;
      }

      setTimeSinceWedding({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
      });
    };

    // Initial calculation
    updateTimeSinceWedding();

    // Update every second
    const interval = setInterval(updateTimeSinceWedding, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [weddingDate]);

  return timeSinceWedding;
};

export default useWeddingCounter;

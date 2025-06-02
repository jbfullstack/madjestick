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
      const diffMs = Math.abs(now - weddingDate);

      // More accurate calculation
      const seconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const totalDays = Math.floor(hours / 24);

      // Calculate years (approximate)
      const years = Math.floor(totalDays / 365);
      const remainingDaysAfterYears = totalDays - years * 365;

      // Calculate months (approximate)
      const months = Math.floor(remainingDaysAfterYears / 30);
      const days = remainingDaysAfterYears - months * 30;

      // Calculate remaining time units
      const remainingHours = hours % 24;
      const remainingMinutes = minutes % 60;
      const remainingSeconds = seconds % 60;

      setTimeSinceWedding({
        years,
        months,
        days,
        hours: remainingHours,
        minutes: remainingMinutes,
        seconds: remainingSeconds,
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

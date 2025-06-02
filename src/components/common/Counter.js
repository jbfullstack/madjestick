// src/components/common/Counter.js
import React from "react";
import "../../styles/Counter.css";

const Counter = ({ timeSinceWedding }) => (
  <div className="counter">
    <p>{timeSinceWedding.years} Years</p>
    <p>{timeSinceWedding.months} Months</p>
    <p>{timeSinceWedding.days} Days</p>
    <p>{timeSinceWedding.hours} Hours</p>
    <p>{timeSinceWedding.minutes} Minutes</p>
    <p>{timeSinceWedding.seconds} Seconds</p>
  </div>
);

export default Counter;

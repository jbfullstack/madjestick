// src/components/common/Navigation.js
import React from "react";
import "../../styles/Navigation.css";

const Navigation = ({ currentPage, setCurrentPage }) => {
  const menuItems = [
    { id: "home", label: "Home" },
    { id: "chrono", label: "Chrono" },
    { id: "photos", label: "Photos" },
    { id: "musiques", label: "Musiques" },
    { id: "admin", label: "Admin" },
  ];

  return (
    <nav className="navigation">
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`nav-button ${currentPage === item.id ? "active" : ""}`}
          onClick={() => setCurrentPage(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
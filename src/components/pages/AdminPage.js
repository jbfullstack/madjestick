// src/components/pages/AdminPage.js
import React, { useState } from "react";
import "../../styles/AdminPage.css";
import PhotoManager from "../admin/PhotoManager";
import MusicManager from "../admin/MusicManager";
import CitationManager from "../admin/CitationManager";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("photos");

  const tabs = [
    { id: "photos", label: "Photos", icon: "📸" },
    { id: "music", label: "Musiques/Textes", icon: "🎵" },
    { id: "citations", label: "Citations", icon: "💭" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "photos":
        return <PhotoManager />;
      case "music":
        return <MusicManager />;
      case "citations":
        return <CitationManager />;
      default:
        return <PhotoManager />;
    }
  };

  return (
    <div className="admin-page">
      <h1>Madjestitration</h1>
      
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPage;
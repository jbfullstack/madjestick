// src/App.js
import React, { useState } from "react";
import Navigation from "./components/common/Navigation";
import HomePage from "./components/pages/HomePage";
import ChronoPage from "./components/pages/ChronoPage";
import PhotoPage from "./components/pages/PhotoPage";
import MusiquePage from "./components/pages/MusiquePage";
import AdminPage from "./components/pages/AdminPage";
import "./styles/App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "chrono":
        return <ChronoPage />;
      case "photos":
        return <PhotoPage />;
      case "musiques":
        return <MusiquePage />;
      case "admin":
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;
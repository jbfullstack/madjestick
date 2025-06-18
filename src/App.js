// src/App.js
import React, { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
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
        return (
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <AuthProvider>
      <div className="App">
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
        {renderPage()}
      </div>
    </AuthProvider>
  );
}

export default App;
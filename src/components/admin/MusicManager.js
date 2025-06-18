// src/components/admin/MusicManager.js
import React, { useState, useEffect } from "react";
import "../../styles/AdminPage.css";
import { 
  getTypeEmoji, 
  hasAudio, 
  MUSIC_TYPES 
} from "../../utils/musicLoader";
import { githubAPI } from "../../lib/githubAPI";

const MusicManager = () => {
  const [musicItems, setMusicItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    id: 0,
    title: "",
    artist: "",
    type: MUSIC_TYPES.AUDIO,
    file: "",
    lyrics: "",
    date: "",
    isDateUnknown: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const musicData = await githubAPI.getMusic();
      // S'assurer que musicData est un tableau
      setMusicItems(Array.isArray(musicData) ? musicData : []);
    } catch (err) {
      setError('Erreur lors du chargement de la musique: ' + err.message);
      console.error('Error loading music:', err);
      
      // Fallback to localStorage
      const localData = localStorage.getItem('musicLibrary');
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          setMusicItems(Array.isArray(parsedData) ? parsedData : []);
        } catch (parseError) {
          console.error('Error parsing local music data:', parseError);
          setMusicItems([]);
        }
      } else {
        setMusicItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      title: "",
      artist: "",
      type: MUSIC_TYPES.AUDIO,
      file: "",
      lyrics: "",
      date: new Date().toISOString().split('T')[0],
      isDateUnknown: false
    });
    setSelectedItem(null);
    setIsEditing(false);
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      title: item.title,
      artist: item.artist,
      type: item.type,
      file: item.file || "",
      lyrics: item.lyrics || "",
      date: item.date === "unknown" ? "" : (item.date || ""),
      isDateUnknown: item.date === "unknown"
    });
    setSelectedItem(item);
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // Prepare data
      let finalData = { ...formData };
      if (!finalData.id) {
        finalData.id = Date.now();
      }
      finalData.date = formData.isDateUnknown ? "unknown" : formData.date;

      // Get current music from GitHub
      const currentMusic = await githubAPI.getMusic();
      
      let updatedMusic;
      if (isEditing) {
        updatedMusic = currentMusic.map(item => 
          item.id === finalData.id ? finalData : item
        );
      } else {
        updatedMusic = [...currentMusic, finalData];
      }

      // Save to GitHub
      await githubAPI.updateMusicFile(updatedMusic);
      
      // Also save to localStorage as backup
      localStorage.setItem('musicLibrary', JSON.stringify(updatedMusic));

      alert(`${finalData.type === MUSIC_TYPES.TEXT ? 'Texte' : 'Musique'} "${finalData.title}" ${isEditing ? 'modifié(e)' : 'ajouté(e)'} avec succès! Déploiement en cours...`);

      resetForm();
      await loadData();
    } catch (err) {
      setError('Erreur lors de la sauvegarde: ' + err.message);
      console.error('Error saving music:', err);
      
      // Fallback to localStorage only
      try {
        let finalData = { ...formData };
        if (!finalData.id) {
          finalData.id = Date.now();
        }
        finalData.date = formData.isDateUnknown ? "unknown" : formData.date;

        const localMusic = JSON.parse(localStorage.getItem('musicLibrary') || '[]');
        let updatedMusic;
        if (isEditing) {
          updatedMusic = localMusic.map(item => 
            item.id === finalData.id ? finalData : item
          );
        } else {
          updatedMusic = [...localMusic, finalData];
        }
        
        localStorage.setItem('musicLibrary', JSON.stringify(updatedMusic));
        alert('Sauvegarde locale réussie (GitHub indisponible)');
        resetForm();
        await loadData();
      } catch (localErr) {
        setError('Erreur complète de sauvegarde: ' + localErr.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      try {
        setLoading(true);
        setError(null);
        
        const currentMusic = await githubAPI.getMusic();
        const updatedMusic = currentMusic.filter(item => item.id !== itemId);
        
        await githubAPI.updateMusicFile(updatedMusic);
        localStorage.setItem('musicLibrary', JSON.stringify(updatedMusic));
        
        alert("Élément supprimé avec succès! Déploiement en cours...");
        resetForm();
        await loadData();
      } catch (err) {
        setError('Erreur lors de la suppression: ' + err.message);
        console.error('Error deleting music:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredItems = Array.isArray(musicItems) 
    ? musicItems.filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.lyrics?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "all" || item.type === filterType;
        return matchesSearch && matchesType;
      })
    : [];

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Gestion des Musiques et Textes</h2>
        <button className="btn-primary" onClick={resetForm} disabled={loading}>
          🎵 Nouveau Contenu
        </button>
      </div>

      {error && (
        <div className="message error">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          Chargement...
        </div>
      )}

      <div className="manager-filters">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tous les types</option>
          {Object.values(MUSIC_TYPES).map(type => (
            <option key={type} value={type}>
              {getTypeEmoji(type)} {type === MUSIC_TYPES.AUDIO ? 'Musique' : 'Texte'}
            </option>
          ))}
        </select>
      </div>

      <div className="manager-content">
        <div className="items-list">
          <h3>Contenu Musical ({filteredItems.length})</h3>
          <div className="music-list">
            {filteredItems.map((item) => (
              <div key={item.id} className="music-item">
                <div className="music-content">
                  <div className="music-header">
                    <h4>{item.title}</h4>
                    <span className="music-type">
                      {getTypeEmoji(item.type)} {item.type === MUSIC_TYPES.AUDIO ? 'Musique' : 'Texte'}
                    </span>
                  </div>
                  <p className="music-artist">par {item.artist}</p>
                  {item.date && (
                    <p className="music-date">
                      {item.date === "unknown" ? "Date inconnue" : item.date}
                    </p>
                  )}
                  {item.file && hasAudio(item.type) && (
                    <p className="music-file">🎵 {item.file}</p>
                  )}
                  {item.lyrics && (
                    <div className="music-lyrics-preview">
                      <strong>Paroles:</strong>
                      <p>{item.lyrics.substring(0, 100)}...</p>
                    </div>
                  )}
                </div>
                <div className="music-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(item)}
                    title="Modifier"
                    disabled={loading}
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(item.id)}
                    title="Supprimer"
                    disabled={loading}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="item-form">
          <h3>{isEditing ? "Modifier le Contenu" : "Nouveau Contenu"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Type de contenu *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                {Object.values(MUSIC_TYPES).map(type => (
                  <option key={type} value={type}>
                    {getTypeEmoji(type)} {type === MUSIC_TYPES.AUDIO ? 'Musique avec fichier audio' : 'Texte seulement'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Titre *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Titre de la chanson ou du texte"
              />
            </div>

            <div className="form-group">
              <label>Artiste/Auteur *</label>
              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleInputChange}
                required
                placeholder="Qui a créé ce contenu ?"
              />
            </div>

            {hasAudio(formData.type) && (
              <div className="form-group">
                <label>Fichier Audio {formData.type === MUSIC_TYPES.AUDIO ? '*' : ''}</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  required={formData.type === MUSIC_TYPES.AUDIO && !isEditing}
                />
                {formData.file && (
                  <p className="file-info">Fichier: {formData.file}</p>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isDateUnknown"
                  checked={formData.isDateUnknown}
                  onChange={handleInputChange}
                />
                Date inconnue
              </label>
            </div>

            {!formData.isDateUnknown && (
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div className="form-group">
              <label>Paroles/Texte</label>
              <textarea
                name="lyrics"
                value={formData.lyrics}
                onChange={handleInputChange}
                placeholder="Les paroles de la chanson ou le texte complet"
                rows="8"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sauvegarde...' : (isEditing ? "Mettre à jour" : "Créer")}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm} disabled={loading}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MusicManager;
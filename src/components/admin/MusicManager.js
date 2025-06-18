// src/components/admin/MusicManager.js
import React, { useState, useEffect } from "react";
import "../../styles/AdminPage.css";
import { 
  loadMusicLibrary, 
  getTypeEmoji, 
  hasAudio, 
  MUSIC_TYPES 
} from "../../utils/musicLoader";

const MusicManager = () => {
  const [musicItems, setMusicItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [formData, setFormData] = useState({
    id: 0,
    title: "",
    artist: "",
    type: MUSIC_TYPES.AUDIO,
    file: "",
    lyrics: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const musicData = loadMusicLibrary();
    setMusicItems(musicData);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      artist: "",
      type: MUSIC_TYPES.AUDIO,
      file: "",
      lyrics: ""
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
      lyrics: item.lyrics || ""
    });
    setSelectedItem(item);
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate ID for new items
    if (!formData.id) {
      const newId = `music${Date.now()}`;
      setFormData(prev => ({ ...prev, id: newId }));
    }

    // In a real app, you would save to backend/localStorage
    console.log("Music data to save:", formData);
    alert(`${formData.type === MUSIC_TYPES.TEXT ? 'Texte' : 'Musique'} "${formData.title}" ${isEditing ? 'updated' : 'created'} successfully!`);
    
    resetForm();
    loadData();
  };

  const handleDelete = (itemId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      // In a real app, you would delete from backend/localStorage
      console.log("Delete item:", itemId);
      alert("Élément supprimé!");
      resetForm();
      loadData();
    }
  };

  const filteredItems = musicItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.lyrics?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Gestion des Musiques et Textes</h2>
        <button className="btn-primary" onClick={resetForm}>
          🎵 Nouveau Contenu
        </button>
      </div>

      {/* Search and Filter */}
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
        {/* Music List */}
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
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(item.id)}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Music Form */}
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
              <button type="submit" className="btn-primary">
                {isEditing ? "Mettre à jour" : "Créer"}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
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
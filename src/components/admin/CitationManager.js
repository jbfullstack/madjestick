// src/components/admin/CitationManager.js
import React, { useState, useEffect } from "react";
import "../../styles/AdminPage.css";
import { 
  CITATION_CATEGORIES, 
  getCategoryEmoji, 
  getCategoryLabel
} from "../../utils/citationsLoader";
import { githubAPI } from "../../lib/githubAPI";

const CitationManager = () => {
  const [citations, setCitations] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAuthor, setFilterAuthor] = useState("all");
  const [allAuthors, setAllAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    id: 0,
    text: "",
    author: "",
    date: "",
    context: "",
    category: CITATION_CATEGORIES.QUOTIDIEN,
    isFavorite: false,
    isDateUnknown: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const citationData = await githubAPI.getCitations();
      setCitations(Array.isArray(citationData) ? citationData : []);
      
      // Extract all unique authors
      const validData = Array.isArray(citationData) ? citationData : [];
      const authors = validData.map(citation => citation.author).filter(Boolean);
      setAllAuthors([...new Set(authors)]);
    } catch (err) {
      setError('Erreur lors du chargement des citations: ' + err.message);
      console.error('Error loading citations:', err);
      
      // Fallback to localStorage if GitHub fails
      const localData = localStorage.getItem('citationsLibrary');
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          const validData = Array.isArray(parsedData) ? parsedData : [];
          setCitations(validData);
          const authors = validData.map(citation => citation.author).filter(Boolean);
          setAllAuthors([...new Set(authors)]);
        } catch (parseError) {
          console.error('Error parsing local citations:', parseError);
          setCitations([]);
          setAllAuthors([]);
        }
      } else {
        setCitations([]);
        setAllAuthors([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      text: "",
      author: "",
      date: new Date().toISOString().split('T')[0],
      context: "",
      category: CITATION_CATEGORIES.QUOTIDIEN,
      isFavorite: false,
      isDateUnknown: false
    });
    setSelectedCitation(null);
    setIsEditing(false);
  };

  const handleEdit = (citation) => {
    setFormData({
      id: citation.id,
      text: citation.text,
      author: citation.author,
      date: citation.date === "unknown" ? "" : citation.date,
      context: citation.context || "",
      category: citation.category,
      isFavorite: citation.isFavorite || false,
      isDateUnknown: citation.date === "unknown"
    });
    setSelectedCitation(citation);
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

      // Get current citations from GitHub
      const currentCitations = await githubAPI.getCitations();
      
      let updatedCitations;
      if (isEditing) {
        updatedCitations = currentCitations.map(citation => 
          citation.id === finalData.id ? finalData : citation
        );
      } else {
        updatedCitations = [...currentCitations, finalData];
      }

      // Save to GitHub (triggers Vercel deployment)
      await githubAPI.updateCitationsFile(updatedCitations);
      
      // Also save to localStorage as backup
      localStorage.setItem('citationsLibrary', JSON.stringify(updatedCitations));

      alert(`Citation "${finalData.text.substring(0, 30)}..." ${isEditing ? 'modifiée' : 'ajoutée'} avec succès! Déploiement en cours...`);

      resetForm();
      await loadData(); // Reload data
    } catch (err) {
      setError('Erreur lors de la sauvegarde: ' + err.message);
      console.error('Error saving citation:', err);
      
      // Fallback to localStorage only
      try {
        let finalData = { ...formData };
        if (!finalData.id) {
          finalData.id = Date.now();
        }
        finalData.date = formData.isDateUnknown ? "unknown" : formData.date;

        const localCitations = JSON.parse(localStorage.getItem('citationsLibrary') || '[]');
        let updatedCitations;
        if (isEditing) {
          updatedCitations = localCitations.map(citation => 
            citation.id === finalData.id ? finalData : citation
          );
        } else {
          updatedCitations = [...localCitations, finalData];
        }
        
        localStorage.setItem('citationsLibrary', JSON.stringify(updatedCitations));
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

  const handleDelete = async (citationId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette citation ?")) {
      try {
        setLoading(true);
        setError(null);
        
        // Get current citations from GitHub
        const currentCitations = await githubAPI.getCitations();
        const updatedCitations = currentCitations.filter(citation => citation.id !== citationId);
        
        // Save to GitHub
        await githubAPI.updateCitationsFile(updatedCitations);
        
        // Also update localStorage
        localStorage.setItem('citationsLibrary', JSON.stringify(updatedCitations));
        
        alert("Citation supprimée avec succès! Déploiement en cours...");
        resetForm();
        await loadData();
      } catch (err) {
        setError('Erreur lors de la suppression: ' + err.message);
        console.error('Error deleting citation:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredCitations = Array.isArray(citations) 
    ? citations.filter(citation => {
        const matchesSearch = citation.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             citation.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             citation.context?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || citation.category === filterCategory;
        const matchesAuthor = filterAuthor === "all" || citation.author === filterAuthor;
        return matchesSearch && matchesCategory && matchesAuthor;
      })
    : [];

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Gestion des Citations</h2>
        <button className="btn-primary" onClick={resetForm} disabled={loading}>
          💭 Nouvelle Citation
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

      {/* Search and Filter */}
      <div className="manager-filters">
        <input
          type="text"
          placeholder="Rechercher une citation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">Toutes les catégories</option>
          {Object.values(CITATION_CATEGORIES).map(category => (
            <option key={category} value={category}>
              {getCategoryEmoji(category)} {getCategoryLabel(category)}
            </option>
          ))}
        </select>
        <select
          value={filterAuthor}
          onChange={(e) => setFilterAuthor(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tous les auteurs</option>
          {allAuthors.map(author => (
            <option key={author} value={author}>
              {author}
            </option>
          ))}
        </select>
      </div>

      <div className="manager-content">
        {/* Citations List */}
        <div className="items-list">
          <h3>Citations ({filteredCitations.length})</h3>
          <div className="citations-list">
            {filteredCitations.map((citation) => (
              <div key={citation.id} className="citation-item">
                <div className="citation-content">
                  <div className="citation-header">
                    <span className="citation-category">
                      {getCategoryEmoji(citation.category)} {getCategoryLabel(citation.category)}
                    </span>
                    {citation.isFavorite && <span className="favorite-indicator">⭐</span>}
                    <span className="citation-date">
                      {citation.date === "unknown" ? "Date inconnue" : citation.date}
                    </span>
                  </div>
                  <blockquote className="citation-text">
                    "{citation.text}"
                  </blockquote>
                  <div className="citation-footer">
                    <cite className="citation-author">— {citation.author}</cite>
                    {citation.context && (
                      <p className="citation-context">{citation.context}</p>
                    )}
                  </div>
                </div>
                <div className="citation-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(citation)}
                    title="Modifier"
                    disabled={loading}
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(citation.id)}
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

        {/* Citation Form */}
        <div className="item-form">
          <h3>{isEditing ? "Modifier la Citation" : "Nouvelle Citation"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Texte de la citation *</label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                required
                placeholder="Le texte de la citation"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Auteur *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                placeholder="Qui a dit cette citation ?"
                list="authors-list"
              />
              <datalist id="authors-list">
                {allAuthors.map(author => (
                  <option key={author} value={author} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label>Catégorie *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {Object.values(CITATION_CATEGORIES).map(category => (
                  <option key={category} value={category}>
                    {getCategoryEmoji(category)} {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>

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
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Contexte</label>
              <textarea
                name="context"
                value={formData.context}
                onChange={handleInputChange}
                placeholder="Dans quel contexte cette citation a-t-elle été dite ?"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFavorite"
                  checked={formData.isFavorite}
                  onChange={handleInputChange}
                />
                Citation favorite ⭐
              </label>
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

export default CitationManager;
// src/components/admin/CitationManager.js
import React, { useState, useEffect } from "react";
import "../../styles/AdminPage.css";
import { 
  loadCitationsLibrary, 
  CITATION_CATEGORIES, 
  getCategoryEmoji, 
  getCategoryLabel,
  getAllAuthors 
} from "../../utils/citationsLoader";

const CitationManager = () => {
  const [citations, setCitations] = useState([]);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAuthor, setFilterAuthor] = useState("all");
  const [allAuthors, setAllAuthors] = useState([]);

  const [formData, setFormData] = useState({
    id: 0,
    text: "",
    author: "",
    date: "",
    context: "",
    category: CITATION_CATEGORIES.QUOTIDIEN,
    isFavorite: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const citationData = loadCitationsLibrary();
    setCitations(citationData);
    setAllAuthors(getAllAuthors());
  };

  const resetForm = () => {
    setFormData({
      id: "",
      text: "",
      author: "",
      date: new Date().toISOString().split('T')[0],
      context: "",
      category: CITATION_CATEGORIES.QUOTIDIEN,
      isFavorite: false
    });
    setSelectedCitation(null);
    setIsEditing(false);
  };

  const handleEdit = (citation) => {
    setFormData({
      id: citation.id,
      text: citation.text,
      author: citation.author,
      date: citation.date,
      context: citation.context || "",
      category: citation.category,
      isFavorite: citation.isFavorite || false
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate ID for new citations
    if (!formData.id) {
      const newId = `citation${Date.now()}`;
      setFormData(prev => ({ ...prev, id: newId }));
    }

    // In a real app, you would save to backend/localStorage
    console.log("Citation data to save:", formData);
    alert(`Citation "${formData.text.substring(0, 30)}..." ${isEditing ? 'updated' : 'created'} successfully!`);
    
    resetForm();
    loadData();
  };

  const handleDelete = (citationId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette citation ?")) {
      // In a real app, you would delete from backend/localStorage
      console.log("Delete citation:", citationId);
      alert("Citation supprimée!");
      resetForm();
      loadData();
    }
  };

  const filteredCitations = citations.filter(citation => {
    const matchesSearch = citation.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         citation.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         citation.context?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || citation.category === filterCategory;
    const matchesAuthor = filterAuthor === "all" || citation.author === filterAuthor;
    return matchesSearch && matchesCategory && matchesAuthor;
  });

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Gestion des Citations</h2>
        <button className="btn-primary" onClick={resetForm}>
          💭 Nouvelle Citation
        </button>
      </div>

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
                    <span className="citation-date">{citation.date}</span>
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
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(citation.id)}
                    title="Supprimer"
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
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

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

export default CitationManager;
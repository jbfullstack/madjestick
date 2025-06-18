// src/utils/citationsLoader.js
import citationsLibrary from '../data/citationsLibrary.json';

// Citation categories
export const CITATION_CATEGORIES = {
  PHILOSOPHIE: 'philosophie',
  STRATEGIE: 'stratégie',
  MOTIVATION: 'motivation',
  HUMOUR: 'humour',
  AMOUR: 'amour',
  QUOTIDIEN: 'quotidien'
};

// Get category emoji
export const getCategoryEmoji = (category) => {
  switch (category) {
    case CITATION_CATEGORIES.PHILOSOPHIE:
      return '🤔';
    case CITATION_CATEGORIES.STRATEGIE:
      return '♟️';
    case CITATION_CATEGORIES.MOTIVATION:
      return '💪';
    case CITATION_CATEGORIES.HUMOUR:
      return '😄';
    case CITATION_CATEGORIES.AMOUR:
      return '❤️';
    case CITATION_CATEGORIES.QUOTIDIEN:
      return '🏠';
    default:
      return '💭';
  }
};

// Get category label
export const getCategoryLabel = (category) => {
  switch (category) {
    case CITATION_CATEGORIES.PHILOSOPHIE:
      return 'Philosophie';
    case CITATION_CATEGORIES.STRATEGIE:
      return 'Stratégie';
    case CITATION_CATEGORIES.MOTIVATION:
      return 'Motivation';
    case CITATION_CATEGORIES.HUMOUR:
      return 'Humour';
    case CITATION_CATEGORIES.AMOUR:
      return 'Amour';
    case CITATION_CATEGORIES.QUOTIDIEN:
      return 'Quotidien';
    default:
      return 'Autre';
  }
};

// Load citations library
export const loadCitationsLibrary = () => {
  try {
    return citationsLibrary.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error loading citations library:', error);
    return [];
  }
};

// Get citations by category
export const getCitationsByCategory = (category) => {
  const citations = loadCitationsLibrary();
  if (category === 'all') {
    return citations;
  }
  return citations.filter(citation => citation.category === category);
};

// Get citation by ID
export const getCitationById = (id) => {
  const citations = loadCitationsLibrary();
  return citations.find(citation => citation.id === id);
};

// Get favorite citations
export const getFavoriteCitations = () => {
  const citations = loadCitationsLibrary();
  return citations.filter(citation => citation.isFavorite);
};

// Get citations by author
export const getCitationsByAuthor = (author) => {
  const citations = loadCitationsLibrary();
  return citations.filter(citation => 
    citation.author.toLowerCase().includes(author.toLowerCase())
  );
};

// Get random citation
export const getRandomCitation = () => {
  const citations = loadCitationsLibrary();
  if (citations.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * citations.length);
  return citations[randomIndex];
};

// Get all available authors
export const getAllAuthors = () => {
  const citations = loadCitationsLibrary();
  const authors = citations.map(citation => citation.author);
  return [...new Set(authors)]; // Remove duplicates
};
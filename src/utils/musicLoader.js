// src/utils/musicLoader.js
import musicLibrary from '../data/musicLibrary.json';

// Music types
export const MUSIC_TYPES = {
  AUDIO: 'audio',
  TEXT: 'text'
};

// Get type emoji
export const getTypeEmoji = (type) => {
  switch (type) {
    case MUSIC_TYPES.AUDIO:
      return '🎵';
    case MUSIC_TYPES.TEXT:
      return '📝';
    default:
      return '🎼';
  }
};

// Check if type has audio
export const hasAudio = (type) => {
  return type === MUSIC_TYPES.AUDIO;
};

// Load music library
export const loadMusicLibrary = () => {
  try {
    // Nouveau format : array direct au lieu de {songs: [...]}
    if (Array.isArray(musicLibrary)) {
      return musicLibrary.map(item => ({
        ...item,
        file: item.file || item.fileName, // Support both formats
        // Ajouter le chemin complet pour les fichiers audio
        fullPath: item.file ? `/sounds/${item.file}` : null
      }));
    }
    
    // Fallback pour ancien format si nécessaire
    if (musicLibrary.songs && Array.isArray(musicLibrary.songs)) {
      return musicLibrary.songs.map(item => ({
        ...item,
        file: item.file || item.fileName,
        fullPath: item.file ? `/sounds/${item.file}` : null
      }));
    }
    
    console.error('Invalid music library format');
    return [];
  } catch (error) {
    console.error('Error loading music library:', error);
    return [];
  }
};

// Get music by type
export const getMusicByType = (type) => {
  const music = loadMusicLibrary();
  if (type === 'all') {
    return music;
  }
  return music.filter(item => item.type === type);
};

// Get music by ID
export const getMusicById = (id) => {
  const music = loadMusicLibrary();
  return music.find(item => item.id === id);
};
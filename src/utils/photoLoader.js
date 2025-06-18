// src/utils/photoLoader.js
import photoLibrary from '../data/photoLibrary.json';

// Photo categories
export const PHOTO_CATEGORIES = {
  NOUS: 'nous',
  MOMENTS: 'moments',
  AUTRES: 'autres'
};

// Get category emoji
export const getCategoryEmoji = (category) => {
  switch (category) {
    case PHOTO_CATEGORIES.NOUS:
      return '💕';
    case PHOTO_CATEGORIES.MOMENTS:
      return '✨';
    case PHOTO_CATEGORIES.AUTRES:
      return '📸';
    default:
      return '📷';
  }
};

// Get category label
export const getCategoryLabel = (category) => {
  switch (category) {
    case PHOTO_CATEGORIES.NOUS:
      return 'Nous';
    case PHOTO_CATEGORIES.MOMENTS:  
      return 'Moments';
    case PHOTO_CATEGORIES.AUTRES:
      return 'Autres';
    default:
      return 'Unknown';
  }
};

// Load photo library
export const loadPhotoLibrary = () => {
  try {
    // Add full image path to each photo
    return photoLibrary.map(photo => ({
      ...photo,
      fullPath: require(`../images/${photo.file}`)
    }));
  } catch (error) {
    console.error('Error loading photo library:', error);
    return [];
  }
};

// Get photos by category
export const getPhotosByCategory = (category) => {
  const photos = loadPhotoLibrary();
  if (category === 'all') {
    return photos;
  }
  return photos.filter(photo => photo.category === category);
};

// Get photo by ID
export const getPhotoById = (id) => {
  const photos = loadPhotoLibrary();
  return photos.find(photo => photo.id === id);
};

// Get photos by tags
export const getPhotosByTags = (tags) => {
  const photos = loadPhotoLibrary();
  return photos.filter(photo => 
    photo.tags && photo.tags.some(tag => 
      tags.some(searchTag => 
        tag.toLowerCase().includes(searchTag.toLowerCase())
      )
    )
  );
};

// Get all available tags
export const getAllTags = () => {
  const photos = loadPhotoLibrary();
  const allTags = photos.reduce((tags, photo) => {
    if (photo.tags) {
      return [...tags, ...photo.tags];
    }
    return tags;
  }, []);
  
  return [...new Set(allTags)]; // Remove duplicates
};
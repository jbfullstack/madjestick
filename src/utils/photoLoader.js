// src/utils/photoLoader.js
import photoLibrary from '../data/photoLibrary.json';
import photoCategories from '../data/photoCategories.json';

// Photo categories constant for backward compatibility only
export const PHOTO_CATEGORIES = {
  NOUS: 'nous',
  MOMENTS: 'moments',
  AUTRES: 'autres'
};

// Load all categories from JSON file
export const loadPhotoCategories = () => {
  try {
    return photoCategories;
  } catch (error) {
    console.error('Error loading photo categories:', error);
    return [];
  }
};

// Get category emoji from JSON
export const getCategoryEmoji = (categoryId) => {
  const categories = loadPhotoCategories();
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.emoji : '📷';
};

// Get category label from JSON
export const getCategoryLabel = (categoryId) => {
  const categories = loadPhotoCategories();
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.label : categoryId;
};

// Add a new category (stored in localStorage temporarily)
export const addPhotoCategory = (categoryData) => {
  const categories = loadPhotoCategories();
  const newCategory = {
    id: categoryData.name.toLowerCase().replace(/\s+/g, '_'),
    label: categoryData.name.trim(),
    emoji: categoryData.emoji || "📷"
  };
  
  // Check if category already exists
  if (categories.find(cat => cat.id === newCategory.id)) {
    throw new Error('Cette catégorie existe déjà');
  }
  
  // Save to localStorage as backup (in real app would save to backend/JSON)
  const savedCategories = localStorage.getItem('additionalPhotoCategories');
  const additionalCategories = savedCategories ? JSON.parse(savedCategories) : [];
  
  additionalCategories.push(newCategory);
  localStorage.setItem('additionalPhotoCategories', JSON.stringify(additionalCategories));
  
  console.log('New category added (saved to localStorage):', newCategory);
  return newCategory;
};

// Get all categories (JSON + additional from localStorage)
export const getAllPhotoCategories = () => {
  const baseCategories = loadPhotoCategories();
  
  try {
    const savedCategories = localStorage.getItem('additionalPhotoCategories');
    const additionalCategories = savedCategories ? JSON.parse(savedCategories) : [];
    return [...baseCategories, ...additionalCategories];
  } catch (error) {
    console.error('Error loading additional categories:', error);
    return baseCategories;
  }
};

// Remove a category (only additional ones from localStorage)
export const removePhotoCategory = (categoryId) => {
  // Don't allow removal of base categories from JSON
  const baseCategories = loadPhotoCategories();
  if (baseCategories.find(cat => cat.id === categoryId)) {
    throw new Error('Impossible de supprimer une catégorie de base');
  }
  
  try {
    const savedCategories = localStorage.getItem('additionalPhotoCategories');
    const additionalCategories = savedCategories ? JSON.parse(savedCategories) : [];
    const updatedCategories = additionalCategories.filter(cat => cat.id !== categoryId);
    localStorage.setItem('additionalPhotoCategories', JSON.stringify(updatedCategories));
    
    console.log('Category removed:', categoryId);
    return true;
  } catch (error) {
    console.error('Error removing category:', error);
    return false;
  }
};

// Dynamic image loader based on photoLibrary.json
export const loadPhotoLibrary = () => {
  try {
    return photoLibrary.map(photo => {
      // Si le fichier est "placeholder", utiliser un placeholder personnalisé
      if (photo.file === "placeholder") {
        return {
          ...photo,
          fullPath: `https://via.placeholder.com/300x300/ba55d3/ffffff?text=${encodeURIComponent(photo.title)}`
        };
      }
      
      // Try to load the image dynamically based on filename from JSON
      try {
        const imagePath = require(`../images/${photo.file}`);
        return {
          ...photo,
          fullPath: imagePath
        };
      } catch (error) {
        console.warn(`Image not found: ${photo.file}, using placeholder with title`);
        return {
          ...photo,
          fullPath: `https://via.placeholder.com/300x300/9370db/ffffff?text=${encodeURIComponent(photo.title || 'Photo')}`
        };
      }
    });
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

// Get all available tags from JSON data
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
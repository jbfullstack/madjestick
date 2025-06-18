// src/lib/githubAPI.js
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
const REPO_OWNER = process.env.REACT_APP_GITHUB_OWNER;
const REPO_NAME = process.env.REACT_APP_GITHUB_REPO;

// Helper function pour décoder base64 de manière sécurisée avec UTF-8
const safeBase64Decode = (encodedContent) => {
  try {
    // Nettoyer le contenu (supprimer les retours à la ligne et espaces)
    const cleanContent = encodedContent.replace(/\s/g, '');
    
    // Décoder base64 puis convertir en UTF-8 proprement
    const decoded = atob(cleanContent);
    
    // Convertir les bytes en UTF-8 correct
    const utf8Decoded = decodeURIComponent(escape(decoded));
    
    return utf8Decoded;
  } catch (error) {
    console.error('Erreur décodage base64:', error);
    
    // Fallback : décodage simple si UTF-8 échoue
    try {
      const cleanContent = encodedContent.replace(/\s/g, '');
      return atob(cleanContent);
    } catch (fallbackError) {
      console.error('Erreur décodage fallback:', fallbackError);
      throw new Error('Impossible de décoder le contenu du fichier');
    }
  }
};

// Helper function pour encoder base64 de manière sécurisée avec UTF-8
const safeBase64Encode = (content) => {
  try {
    // Encoder en UTF-8 puis en base64
    const utf8Encoded = unescape(encodeURIComponent(content));
    return btoa(utf8Encoded);
  } catch (error) {
    console.error('Erreur encodage base64:', error);
    throw new Error('Impossible d\'encoder le contenu du fichier');
  }
};

// Helper function pour encoder un fichier en base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Enlever le préfixe "data:type/subtype;base64,"
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper function pour nettoyer les caractères mal encodés
const cleanEncodingIssues = (text) => {
  if (typeof text !== 'string') return text;
  
  return text
    // Corrections spécifiques pour les erreurs d'encodage courantes
    .replace(/ÃÂ©/g, 'é')
    .replace(/ÃÂ§/g, 'ç') 
    .replace(/ÃÂª/g, 'ê')
    .replace(/ÃÂ¨/g, 'è')
    .replace(/ÃÂ /g, 'à')
    .replace(/ÃÂ´/g, 'ô')
    .replace(/ÃÂ¹/g, 'ù')
    .replace(/ÃÂ»/g, 'û')
    .replace(/ÃÂ®/g, 'î')
    .replace(/ÃÂ¯/g, 'ï')
    .replace(/ÃÂ¢/g, 'â')
    .replace(/ÃÂ«/g, 'ë')
    .replace(/ÃÂ¶/g, 'ö')
    .replace(/ÃÂ¼/g, 'ü')
    .replace(/ÃÂ/g, 'É')
    .replace(/ÃÂ/g, 'È')
    .replace(/ÃÂ/g, 'À')
    .replace(/ÃÂ/g, 'Ç')
    // Nettoyer les doubles espaces
    .replace(/\s+/g, ' ')
    .trim();
};

// Helper function pour nettoyer récursivement un objet
const cleanObjectEncoding = (obj) => {
  if (typeof obj === 'string') {
    return cleanEncodingIssues(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObjectEncoding(item));
  }
  
  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = cleanObjectEncoding(value);
    }
    return cleaned;
  }
  
  return obj;
};

// Helper function pour sanitiser un nom de fichier
const sanitizeFileName = (fileName) => {
  if (!fileName) return fileName;
  
  const parts = fileName.split('.');
  const extension = parts.pop();
  const nameWithoutExtension = parts.join('.');
  
  // Sanitiser le nom : 
  // - Remplacer espaces par underscores
  // - Supprimer caractères spéciaux dangereux
  // - Garder seulement alphanumériques, underscores, tirets
  // - Éviter les noms vides
  const sanitizedName = nameWithoutExtension
    .replace(/\s+/g, '_')                    // Espaces -> underscores
    .replace(/[^\w\-_.]/g, '')               // Garder seulement word chars, tirets, points, underscores
    .replace(/_{2,}/g, '_')                  // Multiples underscores -> un seul
    .replace(/^_+|_+$/g, '')                 // Supprimer underscores début/fin
    .substring(0, 100);                      // Limiter la longueur
  
  // Si le nom devient vide après sanitisation, utiliser un nom par défaut
  const finalName = sanitizedName || 'file';
  
  return `${finalName}.${extension}`;
};

// Helper function pour générer un nom de fichier unique ET sanitisé
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  // D'abord sanitiser le nom original
  const sanitizedName = sanitizeFileName(originalName);
  
  const parts = sanitizedName.split('.');
  const extension = parts.pop();
  const nameWithoutExtension = parts.join('.');
  
  return `${nameWithoutExtension}_${timestamp}_${random}.${extension}`;
};

export const githubAPI = {
  // Créer un fichier s'il n'existe pas
  async createFileIfNotExists(filePath, initialContent) {
    try {
      // Essayer de récupérer le fichier
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      if (response.status === 404) {
        // Le fichier n'existe pas, le créer
        const content = safeBase64Encode(JSON.stringify(initialContent, null, 2));
        
        const createResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Create ${filePath}`,
            content: content,
          })
        });
        
        if (!createResponse.ok) {
          throw new Error(`Erreur lors de la création du fichier: ${createResponse.status}`);
        }
        
        console.log(`Fichier ${filePath} créé avec succès`);
        return initialContent;
      } else if (response.ok) {
        // Le fichier existe déjà
        const fileData = await response.json();
        const content = safeBase64Decode(fileData.content);
        return JSON.parse(content);
      } else {
        throw new Error(`Erreur GitHub API: ${response.status}`);
      }
    } catch (error) {
      console.error(`Erreur création/lecture fichier ${filePath}:`, error);
      throw error;
    }
  },

  // Upload d'un fichier vers GitHub
  async uploadFile(file, targetPath) {
    try {
      if (!file) {
        throw new Error('Aucun fichier fourni');
      }

      // Convertir le fichier en base64
      const base64Content = await fileToBase64(file);
      
      // Générer un nom de fichier unique ET sanitisé
      const sanitizedFileName = generateUniqueFileName(file.name);
      const fullPath = `${targetPath}/${sanitizedFileName}`;

      console.log(`Upload: "${file.name}" -> "${sanitizedFileName}"`);
      
      // Informer si le nom a été modifié
      if (file.name !== sanitizedFileName) {
        console.log(`⚠️ Nom de fichier sanitisé: "${file.name}" -> "${sanitizedFileName}"`);
      }

      // Vérifier si le fichier existe déjà (très peu probable avec timestamp + random)
      const checkResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fullPath}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      let sha = null;
      if (checkResponse.ok) {
        const existingFile = await checkResponse.json();
        sha = existingFile.sha;
        console.log(`Fichier existant trouvé, mise à jour avec SHA: ${sha}`);
      }

      // Upload du fichier
      const uploadPayload = {
        message: `Upload ${file.type.includes('image') ? 'image' : 'audio'}: ${sanitizedFileName}${file.name !== sanitizedFileName ? ` (sanitized from: ${file.name})` : ''}`,
        content: base64Content,
      };

      if (sha) {
        uploadPayload.sha = sha;
      }

      const uploadResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fullPath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadPayload)
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`Erreur upload: ${uploadResponse.status} - ${errorData.message || 'Erreur inconnue'}`);
      }

      const result = await uploadResponse.json();
      console.log(`✅ Fichier uploadé avec succès: ${sanitizedFileName}`);
      
      return {
        fileName: sanitizedFileName,
        originalName: file.name,
        path: fullPath,
        downloadUrl: result.content.download_url,
        wasSanitized: file.name !== sanitizedFileName
      };
    } catch (error) {
      console.error('Erreur upload fichier:', error);
      throw error;
    }
  },

  // Supprimer un fichier de GitHub
  async deleteFile(filePath) {
    try {
      // Récupérer les infos du fichier pour obtenir le SHA
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      if (response.status === 404) {
        console.log(`Fichier ${filePath} n'existe pas, suppression ignorée`);
        return;
      }

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du fichier: ${response.status}`);
      }

      const fileData = await response.json();

      // Supprimer le fichier
      const deleteResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Delete file: ${filePath}`,
          sha: fileData.sha,
        })
      });

      if (!deleteResponse.ok) {
        throw new Error(`Erreur lors de la suppression: ${deleteResponse.status}`);
      }

      console.log(`Fichier supprimé avec succès: ${filePath}`);
    } catch (error) {
      console.error('Erreur suppression fichier:', error);
      throw error;
    }
  },

  // Mettre à jour le fichier citations sur GitHub
  async updateCitationsFile(citations) {
    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/src/data/citationsLibrary.json`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const fileData = await response.json();
      const content = safeBase64Encode(JSON.stringify(citations, null, 2));
      
      const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/src/data/citationsLibrary.json`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update citations - ${new Date().toISOString()}`,
          content: content,
          sha: fileData.sha,
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Erreur lors de la mise à jour du fichier: ${updateResponse.status}`);
      }
      
      return await updateResponse.json();
    } catch (error) {
      console.error('Erreur GitHub API citations:', error);
      throw error;
    }
  },

  // Récupérer les citations depuis GitHub
  async getCitations() {
    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/src/data/citationsLibrary.json`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const fileData = await response.json();
      const content = safeBase64Decode(fileData.content);
      const parsedData = JSON.parse(content);
      
      // Nettoyer les problèmes d'encodage
      return cleanObjectEncoding(parsedData);
    } catch (error) {
      console.error('Erreur récupération citations:', error);
      throw error;
    }
  },

  // Mettre à jour le fichier photos sur GitHub
  async updatePhotosFile(photos) {
    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/src/data/photoLibrary.json`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const fileData = await response.json();
      const content = safeBase64Encode(JSON.stringify(photos, null, 2));
      
      const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/src/data/photoLibrary.json`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update photos - ${new Date().toISOString()}`,
          content: content,
          sha: fileData.sha,
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Erreur lors de la mise à jour du fichier photos: ${updateResponse.status}`);
      }
      
      return await updateResponse.json();
    } catch (error) {
      console.error('Erreur GitHub API photos:', error);
      throw error;
    }
  },

  // Récupérer les photos depuis GitHub
  async getPhotos() {
    try {
      // Essayer de créer le fichier s'il n'existe pas
      let photos = await this.createFileIfNotExists('src/data/photoLibrary.json', [
        {
          id: 1,
          title: "Première photo ensemble",
          description: "Notre première sortie officielle",
          category: "nous",
          file: "photo1.jpg",
          date: "2025-04-15",
          tags: ["couple", "première fois", "restaurant"]
        }
      ]);

      // S'assurer que toutes les photos ont un fullPath
      photos = photos.map(photo => {
        if (!photo.fullPath && photo.file) {
          photo.fullPath = `/images/${photo.file}`;
          console.log(`fullPath ajouté automatiquement pour ${photo.title}: ${photo.fullPath}`);
        }
        return photo;
      });

      return photos;
    } catch (error) {
      console.error('Erreur récupération photos:', error);
      throw error;
    }
  },

  // Mettre à jour le fichier musique sur GitHub
  async updateMusicFile(music) {
    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/src/data/musicLibrary.json`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const fileData = await response.json();
      const content = safeBase64Encode(JSON.stringify(music, null, 2));
      
      const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/src/data/musicLibrary.json`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update music - ${new Date().toISOString()}`,
          content: content,
          sha: fileData.sha,
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Erreur lors de la mise à jour du fichier musique: ${updateResponse.status}`);
      }
      
      return await updateResponse.json();
    } catch (error) {
      console.error('Erreur GitHub API musique:', error);
      throw error;
    }
  },

  // Fonction pour corriger les noms de fichiers avec espaces
  async fixFileNamesWithSpaces() {
    try {
      console.log('Correction des noms de fichiers...');
      
      // Récupérer les photos actuelles
      const photos = await this.getPhotos();
      let hasChanges = false;
      
      // Traiter chaque photo
      for (const photo of photos) {
        if (photo.file && photo.file.includes(' ')) {
          const oldFileName = photo.file;
          const newFileName = oldFileName
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9._-]/g, '')
            .replace(/_{2,}/g, '_')
            .replace(/^_+|_+$/g, '');
          
          console.log(`Correction: ${oldFileName} -> ${newFileName}`);
          
          try {
            // Récupérer le fichier avec l'ancien nom
            const oldFileResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/public/images/${oldFileName}`, {
              headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
              }
            });
            
            if (oldFileResponse.ok) {
              const oldFileData = await oldFileResponse.json();
              
              // Créer le fichier avec le nouveau nom
              await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/public/images/${newFileName}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `token ${GITHUB_TOKEN}`,
                  'Accept': 'application/vnd.github.v3+json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  message: `Rename file: ${oldFileName} -> ${newFileName}`,
                  content: oldFileData.content,
                })
              });
              
              // Supprimer l'ancien fichier
              await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/public/images/${oldFileName}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `token ${GITHUB_TOKEN}`,
                  'Accept': 'application/vnd.github.v3+json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  message: `Delete old file: ${oldFileName}`,
                  sha: oldFileData.sha,
                })
              });
              
              // Mettre à jour les données de la photo
              photo.file = newFileName;
              photo.fullPath = `/images/${newFileName}`;
              hasChanges = true;
            }
          } catch (fileError) {
            console.warn(`Erreur correction fichier ${oldFileName}:`, fileError);
          }
        }
      }
      
      // Sauvegarder les changements dans le JSON si nécessaire
      if (hasChanges) {
        await this.updatePhotosFile(photos);
        console.log('Noms de fichiers corrigés avec succès!');
      } else {
        console.log('Aucun fichier à corriger.');
      }
      
      return photos;
    } catch (error) {
      console.error('Erreur correction noms de fichiers:', error);
      throw error;
    }
  },
  async getMusic() {
    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/src/data/musicLibrary.json`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const fileData = await response.json();
      const content = safeBase64Decode(fileData.content);
      const parsedData = JSON.parse(content);
      
      // Nettoyer les problèmes d'encodage
      return cleanObjectEncoding(parsedData);
    } catch (error) {
      console.error('Erreur récupération musique:', error);
      throw error;
    }
  }
};
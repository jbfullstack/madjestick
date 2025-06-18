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

// Helper function pour nettoyer les caractères mal encodés
const cleanEncodingIssues = (text) => {
  if (typeof text !== 'string') return text;
  
  return text
    // Corrections spécifiques pour les erreurs d'encodage courantes
    .replace(/ÃÂ©/g, 'é')
    .replace(/ÃÂ§/g, 'ç') 
    .replace(/ÃÂª/g, 'ê')
    .replace(/ÃÂ¨/g, 'è')
    .replace(/ÃÂ /g, 'à')
    .replace(/ÃÂ´/g, 'ô')
    .replace(/ÃÂ¹/g, 'ù')
    .replace(/ÃÂ»/g, 'û')
    .replace(/ÃÂ®/g, 'î')
    .replace(/ÃÂ¯/g, 'ï')
    .replace(/ÃÂ¢/g, 'â')
    .replace(/ÃÂ«/g, 'ë')
    .replace(/ÃÂ¶/g, 'ö')
    .replace(/ÃÂ¼/g, 'ü')
    .replace(/ÃÂ/g, 'É')
    .replace(/ÃÂ/g, 'È')
    .replace(/ÃÂ/g, 'À')
    .replace(/ÃÂ/g, 'Ç')
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
      return await this.createFileIfNotExists('src/data/photoLibrary.json', [
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

  // Récupérer la musique depuis GitHub
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
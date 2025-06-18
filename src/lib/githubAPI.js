// src/lib/githubAPI.js
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
const REPO_OWNER = process.env.REACT_APP_GITHUB_OWNER;
const REPO_NAME = process.env.REACT_APP_GITHUB_REPO;

// Helper function pour décoder base64 de manière sécurisée avec UTF-8
const safeBase64Decode = (encodedContent) => {
  try {
    // Nettoyer le contenu (supprimer les retours à la ligne et espaces)
    const cleanContent = encodedContent.replace(/\s/g, '');
    // Décoder avec support UTF-8 complet
    const decoded = atob(cleanContent);
    return decodeURIComponent(escape(decoded));
  } catch (error) {
    console.error('Erreur décodage base64:', error);
    throw new Error('Impossible de décoder le contenu du fichier');
  }
};

// Helper function pour encoder base64 de manière sécurisée avec UTF-8
const safeBase64Encode = (content) => {
  try {
    return btoa(unescape(encodeURIComponent(content)));
  } catch (error) {
    console.error('Erreur encodage base64:', error);
    throw new Error('Impossible d\'encoder le contenu du fichier');
  }
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
      return JSON.parse(content);
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
      return JSON.parse(content);
    } catch (error) {
      console.error('Erreur récupération musique:', error);
      throw error;
    }
  }
};
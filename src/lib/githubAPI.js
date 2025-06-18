// src/lib/githubAPI.js
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
const REPO_OWNER = process.env.REACT_APP_GITHUB_OWNER;
const REPO_NAME = process.env.REACT_APP_GITHUB_REPO;

console.log('Token:', process.env.REACT_APP_GITHUB_TOKEN);
console.log('Owner:', process.env.REACT_APP_GITHUB_OWNER);
console.log('Repo:', process.env.REACT_APP_GITHUB_REPO);

// Helper function pour décoder base64 de manière sécurisée
const safeBase64Decode = (encodedContent) => {
  try {
    // Nettoyer le contenu (supprimer les retours à la ligne et espaces)
    const cleanContent = encodedContent.replace(/\s/g, '');
    // Décoder
    const decoded = atob(cleanContent);
    return decoded;
  } catch (error) {
    console.error('Erreur décodage base64:', error);
    throw new Error('Impossible de décoder le contenu du fichier');
  }
};

// Helper function pour encoder base64 de manière sécurisée
const safeBase64Encode = (content) => {
  try {
    return btoa(unescape(encodeURIComponent(content)));
  } catch (error) {
    console.error('Erreur encodage base64:', error);
    throw new Error('Impossible d\'encoder le contenu du fichier');
  }
};

export const githubAPI = {
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
      const content = safeBase64Decode(fileData.content);
      return JSON.parse(content);
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
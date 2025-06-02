// src/utils/musicLoader.js
import musicLibraryData from "../data/musicLibrary.json";
// Import des fichiers audio (ajoutez vos fichiers ici)
import Song1 from "../sounds/first_guitare_compo.mp3";
// import Song2 from '../sounds/autre-chanson.mp3';
// import Song3 from '../sounds/encore-une-autre.wav';

// Types/Enums définis directement ici pour éviter les problèmes d'imports
export const MUSIC_TYPES = {
  GUITAR: "guitar",
  MUSIC: "music",
  TEXT: "text",
};

// Fonction pour valider le type
export const isValidMusicType = (type) => {
  return Object.values(MUSIC_TYPES).includes(type);
};

// Fonction pour obtenir l'emoji correspondant au type
export const getTypeEmoji = (type) => {
  switch (type) {
    case MUSIC_TYPES.GUITAR:
      return "🎸";
    case MUSIC_TYPES.MUSIC:
      return "🎵";
    case MUSIC_TYPES.TEXT:
      return "📝";
    default:
      return "❓";
  }
};

// Fonction pour vérifier si un type a de l'audio
export const hasAudio = (type) => {
  return type === MUSIC_TYPES.GUITAR || type === MUSIC_TYPES.MUSIC;
};

// Mapping des noms de fichiers vers les imports
const audioFiles = {
  "first_guitare_compo.mp3": Song1,
  // 'autre-chanson.mp3': Song2,
  // 'encore-une-autre.wav': Song3,
};

// Fonction pour charger et valider la librairie musicale
export const loadMusicLibrary = () => {
  try {
    // Validation et transformation des données
    const processedSongs = musicLibraryData.songs
      .map((song) => {
        // Validation du type
        if (!isValidMusicType(song.type)) {
          console.warn(
            `Type invalide pour la chanson "${song.title}": ${song.type}`
          );
          return null;
        }

        // Résolution du fichier audio
        let audioFile = null;
        if (song.fileName && hasAudio(song.type)) {
          audioFile = audioFiles[song.fileName];
          if (!audioFile) {
            console.warn(
              `Fichier audio non trouvé: ${song.fileName} pour "${song.title}"`
            );
          }
        }

        return {
          ...song,
          file: audioFile,
          // Validation que les champs requis sont présents
          id: song.id || Date.now(),
          title: song.title || "Titre inconnu",
          artist: song.artist || "Artiste inconnu",
          lyrics: song.lyrics || "Pas de paroles disponibles",
          type: song.type,
        };
      })
      .filter((song) => song !== null); // Enlever les chansons invalides

    console.log(
      `Librairie musicale chargée: ${processedSongs.length} éléments`
    );
    return processedSongs;
  } catch (error) {
    console.error("Erreur lors du chargement de la librairie musicale:", error);
    // Retourner une librairie par défaut en cas d'erreur
    return [
      {
        id: 1,
        title: "Erreur de chargement",
        artist: "Système",
        file: null,
        type: MUSIC_TYPES.TEXT,
        lyrics:
          "Impossible de charger la librairie musicale. Vérifiez les fichiers de configuration.",
      },
    ];
  }
};

// Fonction pour ajouter dynamiquement un nouveau fichier audio
export const registerAudioFile = (fileName, audioImport) => {
  audioFiles[fileName] = audioImport;
  console.log(`Fichier audio enregistré: ${fileName}`);
};

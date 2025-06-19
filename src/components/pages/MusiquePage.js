// src/components/pages/MusiquePage.js
import React, { useState, useRef, useEffect } from "react";
import "../../styles/MusiquePage.css";
import { getTypeEmoji, hasAudio, MUSIC_TYPES } from "../../utils/musicLoader";
import { githubAPI } from "../../lib/githubAPI";

const MusiquePage = () => {
  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [musicLibrary, setMusicLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  // Charger la music library au montage du composant
  useEffect(() => {
    loadMusicLibrary();
  }, []);

  const loadMusicLibrary = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger depuis GitHub
      const allMusic = await githubAPI.getMusic();

      // Filtrer seulement les éléments disponibles pour le public
      const availableMusic = allMusic.filter(
        (item) => item.isAvailable !== false
      );

      setMusicLibrary(availableMusic);

      console.log(
        `Chargé ${availableMusic.length} éléments disponibles sur ${allMusic.length} total`
      );
    } catch (err) {
      setError("Erreur lors du chargement de la musique");
      console.error("Error loading music:", err);

      // Fallback vers localStorage
      const localData = localStorage.getItem("musicLibrary");
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          const availableMusic = parsedData.filter(
            (item) => item.isAvailable !== false
          );
          setMusicLibrary(availableMusic);
        } catch (parseError) {
          console.error("Error parsing local music data:", parseError);
          setMusicLibrary([]);
        }
      } else {
        setMusicLibrary([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedSong = musicLibrary[currentSong] || {};

  // Effect pour gérer l'audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasAudio(selectedSong.type)) return;

    const updateTime = () => setCurrentTime(audio.currentTime || 0);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentSong, selectedSong.type]);

  const playPauseHandler = () => {
    const audio = audioRef.current;
    if (!audio || !hasAudio(selectedSong.type)) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        alert(`Impossible de lire le fichier audio: ${selectedSong.title}`);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const selectSong = (index) => {
    if (currentSong !== index && index >= 0 && index < musicLibrary.length) {
      const wasPlaying = isPlaying;
      setCurrentSong(index);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      // Auto-play the new song if the previous one was playing and new song has audio
      const newSong = musicLibrary[index];
      if (wasPlaying && hasAudio(newSong.type)) {
        setTimeout(() => {
          setIsPlaying(true);
        }, 100);
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    // Only handle progress click if there's an audio file
    if (!audio || !selectedSong.file || !hasAudio(selectedSong.type)) return;

    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const newTime = (clickX / width) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Afficher un message de chargement si la librairie n'est pas encore chargée
  if (loading) {
    return (
      <div className="musique-page">
        <h1>Musiques et Textes</h1>
        <div className="music-player">
          <p>Chargement de la librairie musicale...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="musique-page">
        <h1>Musiques et Textes</h1>
        <div className="music-player">
          <p style={{ color: "#c53030" }}>{error}</p>
          <button onClick={loadMusicLibrary} className="retry-button">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (musicLibrary.length === 0) {
    return (
      <div className="musique-page">
        <h1>Musiques et Textes</h1>
        <div className="music-player">
          <p>Aucun contenu musical disponible pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="musique-page">
      <h1>Musiques et Textes</h1>

      <div className="music-player">
        <div className="playlist">
          <h3>Playlist ({musicLibrary.length} éléments)</h3>
          {musicLibrary.map((song, index) => (
            <div
              key={song.id}
              className={`song-item ${currentSong === index ? "active" : ""}`}
              onClick={() => selectSong(index)}
            >
              <div className="song-info">
                <div className="song-title">
                  {song.title}
                  <span className="text-only-badge">
                    {" "}
                    {getTypeEmoji(song.type)}
                  </span>
                </div>
                <div className="song-artist">by {song.artist}</div>
              </div>
              {currentSong === index && isPlaying && hasAudio(song.type) && (
                <div className="playing-indicator">♪</div>
              )}
            </div>
          ))}
        </div>

        <div className="player-controls">
          <div className="now-playing">
            <h3>
              {selectedSong.title} {getTypeEmoji(selectedSong.type)}
            </h3>
            <p>by {selectedSong.artist}</p>
          </div>

          {/* Progress bar - only show if current song has audio */}
          {hasAudio(selectedSong.type) && (
            <div className="progress-container">
              <span className="time">{formatTime(currentTime)}</span>
              <div className="progress-bar" onClick={handleProgressClick}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <span className="time">{formatTime(duration)}</span>
            </div>
          )}

          {/* Show static progress bar for text-only */}
          {selectedSong.type === MUSIC_TYPES.TEXT && (
            <div className="progress-container">
              <span className="time">--:--</span>
              <div className="progress-bar-disabled">
                <div className="progress-fill-disabled"></div>
              </div>
              <span className="time">--:--</span>
            </div>
          )}

          {/* Only show controls if current song has audio */}
          {hasAudio(selectedSong.type) && (
            <div className="controls">
              <button
                className="control-btn"
                onClick={() =>
                  selectSong(
                    currentSong > 0 ? currentSong - 1 : musicLibrary.length - 1
                  )
                }
                title="Previous song"
              >
                ⏮️
              </button>
              <button
                className="play-pause-btn"
                onClick={playPauseHandler}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? "⏸️" : "▶️"}
              </button>
              <button
                className="control-btn"
                onClick={() =>
                  selectSong(
                    currentSong < musicLibrary.length - 1 ? currentSong + 1 : 0
                  )
                }
                title="Next song"
              >
                ⏭️
              </button>
            </div>
          )}

          {/* Show message for text-only entries */}
          {selectedSong.type === MUSIC_TYPES.TEXT && (
            <div className="text-only-message">
              <p>📝 Texte seulement - Pas de musique disponible</p>
              <div className="text-controls">
                <button
                  className="control-btn"
                  onClick={() =>
                    selectSong(
                      currentSong > 0
                        ? currentSong - 1
                        : musicLibrary.length - 1
                    )
                  }
                  title="Texte précédent"
                >
                  ⏮️
                </button>
                <button
                  className="control-btn"
                  onClick={() =>
                    selectSong(
                      currentSong < musicLibrary.length - 1
                        ? currentSong + 1
                        : 0
                    )
                  }
                  title="Texte suivant"
                >
                  ⏭️
                </button>
              </div>
            </div>
          )}

          {/* Audio element only for songs with files */}
          {selectedSong.file && hasAudio(selectedSong.type) && (
            <audio
              ref={audioRef}
              src={`/sounds/${selectedSong.file}`}
              preload="metadata"
              onError={(e) => {
                console.error("Audio error:", e);
                console.log("Trying to load:", `/sounds/${selectedSong.file}`);
              }}
            />
          )}
        </div>

        <div className="lyrics">
          <h3>Paroles</h3>
          <div className="lyrics-text">
            {(selectedSong.lyrics || "Pas de paroles disponibles")
              .split("\n")
              .map((line, index) => (
                <p key={index}>{line}</p>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusiquePage;

// src/components/pages/MusiquePage.js
import React, { useState, useRef, useEffect } from "react";
import "../../styles/MusiquePage.css";

// Import your actual music files from the sounds folder
// Uncomment and add your actual files:
// import Song1 from "../../sounds/first-dance.mp3";
// import Song2 from "../../sounds/wedding-march.wav";
// import Song3 from "../../sounds/our-song.mp3";

const MusiquePage = () => {
  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Replace with your actual music files from /sounds folder
  const musicLibrary = [
    {
      id: 1,
      title: "Première compo guitare",
      artist: "Djé",
      // file: Song1, // Use this when you import your actual file
      file: "/sounds/first_guitare_compo.mp3", // Direct path to your file
      lyrics: `[Verse 1]
Diladidadouu

[Chorus]
Diladidadouu

[Verse 2]
Diladidadouu`,
    },
    {
      id: 2,
      title: "Mes doigts entre leurs tripes",
      artist: "Djé",
      // file: Song2, // Use this when you import your actual file
      file: "/sounds/....wav", // Direct path to your file
      lyrics: `

Ils ton dit de venir
Petite soirée sympa en devenir
Tu les connais, tu ne t'es pas méfié, 
Vous alliez juste festoyer 
En plus ils sont pompiers,
Qu'est ce qu'il pourrait mal ce passer?

Le réveil est sans souvenir
Premier fois de ta vie oû ta mémoire est partir fuir
On t'expliques que tas était drogué 
Certains voudrais te voir le chapeau porter
Comme si c'est toi qui tavais agressé 
Le tout en bande organisé 

On leur souhaite aucun avenir
Même pas, on leur prédit vraiment le pire
34 et 37 ans
La crasse le pire de ce qui ce fait de vivant
Prémédité, les preuve sont là 
Les audio des échanges téléphoniques ne trompes pas


Mes doigts qui traînent entre leurs tripes
Ambiance sonore à base de mauvais soupirs
Et ca tristement , suplie "pardon"
J'écoute pas, jme concentre sur comment corriger cet affront 

Je trouve l'équilibre dans votre douleur
Malsainement j'aime la couleur de vos plies en sueurs 
Et ca tombe au sol régulier comme le temps qui passe
Lui qui se dilate, pendant que tu trépasse
J'aime le travail bien fait
La fin du supplice se fondra dans la rosé...

..Du matin
2 de moins, c'est bien
J'aurais jamais cru vouloir le faire
Être satisfait d'avoir calmé 2 corps à terres`,
    },
    //     {
    //       id: 3,
    //       title: "Our Song",
    //       artist: "Romantic Duo",
    //       // file: Song3, // Use this when you import your actual file
    //       file: "/sounds/our-song.mp3", // Direct path to your file
    //       lyrics: `[Verse 1]
    // Remember when we first met
    // That magic I can't forget
    // Your laughter filled the air
    // I knew that you would always care

    // [Chorus]
    // This is our song, our melody
    // Playing through eternity
    // Every note tells our story
    // Of love and endless glory`,
    //     },
    // Add more songs here as needed:
    // {
    //   id: 4,
    //   title: "Another Song",
    //   artist: "Artist Name",
    //   file: "/sounds/another-song.wav",
    //   lyrics: `Your lyrics here...`
    // },
  ];

  const selectedSong = musicLibrary[currentSong];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [currentSong]);

  const playPauseHandler = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        // Handle audio play errors (e.g., file not found)
      });
    }
    setIsPlaying(!isPlaying);
  };

  const selectSong = (index) => {
    if (currentSong !== index) {
      const wasPlaying = isPlaying;
      setCurrentSong(index);
      setIsPlaying(false);
      setCurrentTime(0);

      // Auto-play the new song if the previous one was playing
      if (wasPlaying) {
        setTimeout(() => {
          setIsPlaying(true);
        }, 100);
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const newTime = (clickX / width) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="musique-page">
      <h1>Wedding Music</h1>

      <div className="music-player">
        <div className="playlist">
          <h3>Playlist</h3>
          {musicLibrary.map((song, index) => (
            <div
              key={song.id}
              className={`song-item ${currentSong === index ? "active" : ""}`}
              onClick={() => selectSong(index)}
            >
              <div className="song-info">
                <div className="song-title">{song.title}</div>
                <div className="song-artist">by {song.artist}</div>
              </div>
              {currentSong === index && isPlaying && (
                <div className="playing-indicator">♪</div>
              )}
            </div>
          ))}
        </div>

        <div className="player-controls">
          <div className="now-playing">
            <h3>{selectedSong.title}</h3>
            <p>by {selectedSong.artist}</p>
          </div>

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

          <audio
            ref={audioRef}
            src={selectedSong.file}
            preload="metadata"
            onError={(e) => {
              console.error("Audio error:", e);
              // You can add user feedback here if needed
            }}
          />
        </div>

        <div className="lyrics">
          <h3>Lyrics</h3>
          <div className="lyrics-text">
            {selectedSong.lyrics.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusiquePage;

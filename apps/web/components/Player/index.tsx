"use client";

/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { FC, useEffect, useRef, useState, useCallback } from "react";
import styles from "./Player.module.scss";
import { getAllSongs, getSongById } from "utils/songs";
import { ISong } from "utils/types/song";

export const Player: FC = () => {
  const [songs, setSongs] = useState<ISong[]>([]);
  const [currentPlay, setCurrentPlay] = useState<ISong | null>(null);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [pause, setPause] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs with proper typing
  const playerRef = useRef<HTMLAudioElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const hoverPlayheadRef = useRef<HTMLDivElement>(null);

  // Load songs from Supabase with signed URLs
  useEffect(() => {
    const loadSongs = async () => {
      try {
        setLoading(true);
        const songsData = await getAllSongs();
        setSongs(songsData);

        if (songsData.length > 0) {
          setCurrentPlay(songsData[0]);
        }
      } catch (err) {
        console.error("Error loading songs:", err);
        setError("Failed to load songs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadSongs();
  }, []);

  // Refresh signed URLs periodically to ensure they don't expire while playing
  useEffect(() => {
    if (!currentPlay) return;

    // Refresh current song URL every 30 minutes
    const refreshInterval = setInterval(
      async () => {
        if (!currentPlay) return;

        try {
          const refreshedSong = await getSongById(currentPlay.id);
          if (refreshedSong) {
            setCurrentPlay(refreshedSong);
          }
        } catch (err) {
          console.error("Error refreshing signed URL:", err);
        }
      },
      30 * 60 * 1000
    ); // 30 minutes

    return () => clearInterval(refreshInterval);
  }, [currentPlay]);

  const formatTime = useCallback((currentTime: number) => {
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const secondsStr = seconds >= 10 ? seconds.toString() : "0" + (seconds % 60);
    return minutes + ":" + secondsStr;
  }, []);

  const timeUpdate = useCallback(() => {
    const player = playerRef.current;
    const playhead = playheadRef.current;

    if (!player || !playhead) return;

    const audioDuration = player.duration;
    const currentTimeValue = player.currentTime;

    // Handle case where metadata is not fully loaded yet
    if (isNaN(audioDuration) || !isFinite(audioDuration) || audioDuration <= 0) return;

    // Calculate playhead position as percentage
    const playPercent = Math.min(100, Math.max(0, (currentTimeValue / audioDuration) * 100));

    // Update the playhead position
    playhead.style.width = `${playPercent}%`;

    // Format and update the current time display
    const formattedTime = formatTime(currentTimeValue);
    setCurrentTime(formattedTime);

    // If duration wasn't previously set, set it now
    if (duration === "0:00") {
      const durationFormatted = formatTime(audioDuration);
      setDuration(durationFormatted);
    }
  }, [formatTime, duration]);

  const handleTimelineClick = useCallback((e: MouseEvent) => {
    const player = playerRef.current;
    const timeline = timelineRef.current;
    const playhead = playheadRef.current;

    if (!player || !timeline || !playhead) return;

    const audioDuration = player.duration;

    // Handle case where metadata is not fully loaded yet
    if (isNaN(audioDuration) || !isFinite(audioDuration) || audioDuration <= 0) return;

    // Calculate click position percentage
    const playheadWidth = timeline.offsetWidth;
    const offsetWidth = timeline.getBoundingClientRect().left;
    const userClickWidth = e.clientX - offsetWidth;
    const userClickWidthInPercent = Math.min(
      100,
      Math.max(0, (userClickWidth * 100) / playheadWidth)
    );

    // Update the playhead position
    playhead.style.width = `${userClickWidthInPercent}%`;

    // Update the player's current time
    player.currentTime = (audioDuration * userClickWidthInPercent) / 100;
  }, []);

  const handleTimelineHover = useCallback(
    (e: MouseEvent) => {
      const player = playerRef.current;
      const timeline = timelineRef.current;
      const hoverPlayhead = hoverPlayheadRef.current;

      if (!timeline || !hoverPlayhead) return;

      // Calculate hover position percentage
      const playheadWidth = timeline.offsetWidth;
      const offsetWidth = timeline.getBoundingClientRect().left;
      const userClickWidth = e.clientX - offsetWidth;
      const userClickWidthInPercent = Math.min(
        100,
        Math.max(0, (userClickWidth * 100) / playheadWidth)
      );

      // Update the hover playhead position
      hoverPlayhead.style.width = `${userClickWidthInPercent}%`;

      // Only update content if we have valid duration
      if (player && !isNaN(player.duration) && isFinite(player.duration) && player.duration > 0) {
        const hoverTime = (player.duration * userClickWidthInPercent) / 100;
        hoverPlayhead.dataset.content = formatTime(hoverTime);
      }
    },
    [formatTime]
  );

  const resetTimeLine = useCallback(() => {
    const hoverPlayhead = hoverPlayheadRef.current;
    if (!hoverPlayhead) return;
    hoverPlayhead.style.width = "0%";
  }, []);

  // React event handlers for the JSX elements
  const onTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleTimelineClick(e.nativeEvent);
  };

  const onTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
    handleTimelineHover(e.nativeEvent);
  };

  useEffect(() => {
    const playerRefCur = playerRef?.current;
    const timelineRefCur = timelineRef.current;

    if (playerRefCur && timelineRefCur) {
      playerRefCur.addEventListener("timeupdate", timeUpdate, false);
      timelineRefCur.addEventListener("click", handleTimelineClick, false);
      timelineRefCur.addEventListener("mousemove", handleTimelineHover, false);
      timelineRefCur.addEventListener("mouseout", resetTimeLine, false);

      return () => {
        playerRefCur.removeEventListener("timeupdate", timeUpdate);
        timelineRefCur.removeEventListener("click", handleTimelineClick);
        timelineRefCur.removeEventListener("mousemove", handleTimelineHover);
        timelineRefCur.removeEventListener("mouseout", resetTimeLine);
      };
    }
  }, [handleTimelineClick, handleTimelineHover, resetTimeLine, timeUpdate]);

  useEffect(() => {
    if (!currentPlay) return;

    // Ensure audio element is fully reset before loading new source
    if (playerRef?.current) {
      playerRef.current.pause();
      playerRef.current.currentTime = 0;

      // Reset the timeline playhead
      if (playheadRef.current) {
        playheadRef.current.style.width = "0%";
      }

      // Set the current time display to 0:00
      setCurrentTime("0:00");

      // Force a reload of the audio element
      playerRef.current.load();

      // Attempt to play with better error handling
      playerRef.current
        .play()
        .then(() => {
          setPause(false);
        })
        .catch(err => {
          console.error("Error playing song:", err);
          setPause(true);
        });
    }
  }, [currentPlay]);

  const updatePlayer = async (index: number) => {
    if (index >= 0 && index < songs.length) {
      const song = songs[index];
      // Refresh the signed URL before playing
      const refreshedSong = await getSongById(song.id);
      if (refreshedSong) {
        setCurrentPlay(refreshedSong);
      } else {
        setCurrentPlay(song);
      }
    }
  };

  const nextSong = async () => {
    if (pause) {
      setPause(false);
    }
    if (!currentPlay || songs.length === 0) return;

    const nextId = songs.findIndex(x => x.id === currentPlay.id) + 1;
    await updatePlayer(nextId % songs.length);
  };

  const prevSong = async () => {
    if (pause) {
      setPause(false);
    }
    if (!currentPlay || songs.length === 0) return;

    const prevId = songs.findIndex(x => x.id === currentPlay.id) + songs.length - 1;
    await updatePlayer(prevId % songs.length);
  };

  const playOrPause = async () => {
    if (pause) {
      await playerRef?.current?.play();
    } else {
      playerRef?.current?.pause();
    }
    setPause(!pause);
  };

  const clickAudio = async (index: number) => {
    await updatePlayer(index);
  };

  // Add a handler for the loadedmetadata event
  const handleLoadedMetadata = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    // Set the duration once metadata is loaded
    const durationFormatted = formatTime(player.duration);
    setDuration(durationFormatted);

    // Update the current song with duration property if needed
    if (currentPlay && !currentPlay.duration) {
      setCurrentPlay({
        ...currentPlay,
        duration: durationFormatted,
      });
    }

    // Initialize the timeline without calling timeUpdate directly
    const playhead = playheadRef.current;
    if (playhead && player.duration) {
      playhead.style.width = "0%";
      setCurrentTime("0:00");
    }
  }, [currentPlay, formatTime]);

  if (loading) {
    return <div className={styles.card}>Loading songs...</div>;
  }

  if (error) {
    return <div className={styles.card}>Error: {error}</div>;
  }

  if (songs.length === 0) {
    return <div className={styles.card}>No songs available</div>;
  }

  if (!currentPlay) {
    return <div className={styles.card}>No song selected</div>;
  }

  return (
    <div className={styles.card}>
      <div className={styles.currentSong}>
        <audio
          ref={playerRef}
          onEnded={nextSong}
          src={currentPlay.audio}
          onLoadedMetadata={handleLoadedMetadata}
          preload="auto"
          autoPlay
          className={styles.audioPlayer}
        >
          Your browser does not support the audio element.
        </audio>
        <div className={styles.imgWrap}>
          <img src={currentPlay.img} alt={currentPlay.name} />
        </div>
        <span className={styles.songName}>{currentPlay.name}</span>
        <span className={styles.songAuthor}>{currentPlay.author || "Unknown"}</span>

        <div className={styles.timeContainer}>
          <div className={styles.currentTime}>{currentTime}</div>
          <div className={styles.endTime}>{duration}</div>
        </div>

        <div
          ref={timelineRef}
          className={styles.timeline}
          onClick={onTimelineClick}
          onMouseMove={onTimelineHover}
          onMouseLeave={resetTimeLine}
        >
          <div ref={playheadRef} className={styles.playhead}></div>
          <div ref={hoverPlayheadRef} className={styles.hoverPlayhead} data-content="0:00"></div>
        </div>

        <div className={styles.controls}>
          <button onClick={prevSong} className={styles.prevNextButton}>
            <Image src="/icons/previous.svg" width={20} height={20} alt="Previous" />
          </button>

          <button onClick={playOrPause} className={styles.playButton}>
            {pause ? (
              <Image src="/icons/play.svg" width={20} height={20} alt="Play" />
            ) : (
              <Image src="/icons/pause.svg" width={20} height={20} alt="Pause" />
            )}
          </button>
          <button onClick={nextSong} className={styles.prevNextButton}>
            <Image src="/icons/next.svg" width={20} height={20} alt="Next" />
          </button>
        </div>
      </div>
      <div className={styles.playlist}>
        {songs.map((music, index) => (
          <div
            key={index}
            onClick={() => clickAudio(index)}
            className={`${styles.track} ${
              currentPlay.id === music.id && pause ? styles.currentAudio : ""
            } ${currentPlay.id === music.id && !pause ? styles.playNow : ""}`}
          >
            <img className={styles.trackImg} src={music.img} alt="" />
            <div className={styles.trackDescription}>
              <span className={styles.trackName}>{music.name}</span>
              <span className={styles.trackAuthor}>{music.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

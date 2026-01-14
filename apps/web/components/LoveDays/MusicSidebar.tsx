"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Repeat,
  Repeat1,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ISong } from "@love-days/utils";
import Image from "next/image";
import { YouTubeEmbed } from "./YouTubeEmbed";

interface MusicSidebarProps {
  songs: ISong[];
}

const MusicSidebar = ({ songs }: MusicSidebarProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");

  const currentSong: ISong = songs[currentTrack];
  const isYouTube = currentSong?.sourceType === "youtube";

  // Handle next track logic
  const handleNextTrack = useCallback(() => {
    if (repeatMode === "one") {
      // Restart current track (YouTube: user must click play in embed)
      if (isYouTube) {
        setProgress(0);
        return;
      }
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeatMode === "all" || currentTrack < songs.length - 1) {
      // Move to next track
      const nextIndex = isShuffle
        ? (() => {
            let next = currentTrack;
            while (next === currentTrack && songs.length > 1) {
              next = Math.floor(Math.random() * songs.length);
            }
            return next;
          })()
        : (currentTrack + 1) % songs.length;

      setCurrentTrack(nextIndex);
      setProgress(0);

      // Only auto-play if next song is upload type
      const nextSong = songs[nextIndex];
      if (nextSong?.sourceType !== "youtube") {
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(false);
    }
  }, [currentTrack, repeatMode, isShuffle, isYouTube, songs]);

  // Audio event handlers (for uploaded songs)
  useEffect(() => {
    if (isYouTube) return; // Skip if YouTube

    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isYouTube, handleNextTrack]);

  // Volume control (upload songs only)
  useEffect(() => {
    if (!isYouTube) {
      const audio = audioRef.current;
      if (audio) {
        audio.volume = isMuted ? 0 : volume / 100;
      }
    }
  }, [volume, isMuted, isYouTube]);

  // Play/pause control (upload songs only)
  useEffect(() => {
    if (!isYouTube) {
      const audio = audioRef.current;
      if (audio) {
        if (isPlaying) {
          audio.play().catch(() => setIsPlaying(false));
        } else {
          audio.pause();
        }
      }
    }
  }, [isPlaying, isYouTube]);

  // Track change - auto-play only for upload songs
  useEffect(() => {
    if (!isYouTube && audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack, isYouTube, isPlaying]);

  // YouTube auto-next: Listen for postMessage events from YouTube iframe
  useEffect(() => {
    if (!isYouTube) return;

    // Tell YouTube iframe to start sending events
    const iframe = document.getElementById("youtube-player-iframe") as HTMLIFrameElement;
    if (!iframe?.contentWindow) return;

    // Send "listening" event to YouTube to start receiving state updates
    iframe.contentWindow.postMessage('{"event":"listening"}', "*");

    const handleYouTubeMessage = (event: MessageEvent) => {
      // Security: Only accept messages from YouTube
      if (event.origin !== "https://www.youtube.com") return;

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        // YouTube sends "infoDelivery" events with playerState inside info object
        // playerState: 0 = ended, 1 = playing, 2 = paused
        if (data.event === "infoDelivery" && data.info?.playerState === 0) {
          console.log("Video ended, playing next track");
          handleNextTrack();
        }
      } catch (error) {
        console.log("Failed to parse YouTube message:", error);
      }
    };

    window.addEventListener("message", handleYouTubeMessage);
    return () => window.removeEventListener("message", handleYouTubeMessage);
  }, [isYouTube, currentTrack, handleNextTrack]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (isShuffle) {
      let next = currentTrack;
      while (next === currentTrack && songs.length > 1) {
        next = Math.floor(Math.random() * songs.length);
      }
      setCurrentTrack(next);
    } else {
      setCurrentTrack(prev => (prev === songs.length - 1 ? 0 : prev + 1));
    }
    setProgress(0);
    setIsPlaying(true);
  }, [currentTrack, isShuffle, songs.length]);

  const handlePrev = useCallback(() => {
    if (isYouTube) {
      // For YouTube, just go to previous track
      setCurrentTrack(prev => (prev === 0 ? songs.length - 1 : prev - 1));
      setProgress(0);
    } else {
      const audio = audioRef.current;
      if (audio && audio.currentTime > 3) {
        audio.currentTime = 0;
      } else {
        setCurrentTrack(prev => (prev === 0 ? songs.length - 1 : prev - 1));
        setProgress(0);
      }
    }
  }, [isYouTube, songs.length]);

  const handleSeek = useCallback(
    (value: number[]) => {
      // Seek only works for upload songs (YouTube uses native seek control)
      if (!isYouTube) {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = value[0];
          setProgress(value[0]);
        }
      }
    },
    [isYouTube]
  );

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const selectTrack = useCallback((index: number) => {
    setCurrentTrack(index);
    setProgress(0);
    setIsPlaying(true);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Hidden Audio Element (for uploaded songs) */}
      {!isYouTube && currentSong.fileUrl && (
        <audio ref={audioRef} src={currentSong.fileUrl} preload="metadata" />
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-50 p-2 bg-card/90 backdrop-blur-md border border-border/50 rounded-l-lg transition-all duration-300",
          isOpen ? "right-72 md:right-80" : "right-0"
        )}
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5 text-primary" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-primary" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-72 md:w-80 bg-card/95 backdrop-blur-xl border-l border-border/50 z-40 transition-transform duration-300 flex flex-col font-sans-clean",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/30">
          <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            Our Playlist
          </h2>
        </div>

        {/* Now Playing */}
        <div className="p-4 border-b border-border/30">
          {/* YouTube Player (when playing YouTube song) */}
          {isYouTube && currentSong.youtubeVideoId && (
            <div className="mb-4">
              <YouTubeEmbed
                videoId={currentSong.youtubeVideoId}
                className="aspect-video w-full shadow-lg glow-primary border border-primary/30"
              />
              <div className="mt-3 text-center">
                <h3 className="font-display text-lg font-semibold text-foreground truncate">
                  {currentSong.title}
                </h3>
                <p className="text-sm text-muted-foreground font-body truncate">
                  {currentSong.artist}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">Use YouTube controls above</p>
              </div>
            </div>
          )}

          {/* Upload Song Player (thumbnail + controls) */}
          {!isYouTube && (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg glow-primary">
                  {currentSong.thumbnailUrl ? (
                    <Image
                      src={currentSong.thumbnailUrl}
                      alt={currentSong.title}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <Music className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Now Playing
                  </p>
                  <h3 className="font-display text-lg font-semibold text-foreground truncate">
                    {currentSong.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body truncate">
                    {currentSong.artist}
                  </p>
                </div>
              </div>

              {/* Progress Bar (upload only) */}
              <Slider
                value={[progress]}
                max={duration || 100}
                step={1}
                className="cursor-pointer mb-2"
                onValueChange={handleSeek}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Playback Controls (upload only) */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={toggleShuffle}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isShuffle
                      ? "text-primary bg-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
                <button
                  onClick={cycleRepeat}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    repeatMode !== "off"
                      ? "text-primary bg-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {repeatMode === "one" ? (
                    <Repeat1 className="w-4 h-4" />
                  ) : (
                    <Repeat className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Volume Control (upload only) */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={toggleMute}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  className="flex-1"
                  onValueChange={handleVolumeChange}
                />
              </div>
            </>
          )}
        </div>

        {/* Playlist */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Playlist
          </h3>
          <div className="space-y-2">
            {songs.map((track, index) => (
              <button
                key={track.id}
                onClick={() => selectTrack(index)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                  currentTrack === index
                    ? "bg-primary/20 border border-primary/30"
                    : "hover:bg-secondary/50"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg overflow-hidden",
                    currentTrack === index && "ring-2 ring-primary"
                  )}
                >
                  {track.thumbnailUrl ? (
                    <Image
                      src={track.thumbnailUrl}
                      alt={track.title}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <Music className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        currentTrack === index ? "text-primary" : "text-foreground"
                      )}
                    >
                      {track.title}
                    </p>
                    {track.sourceType === "youtube" && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-600/80 text-white rounded flex-shrink-0">
                        YT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                {currentTrack === index && isPlaying && (
                  <div className="flex items-end gap-0.5 h-4">
                    <span
                      className="w-1 bg-primary rounded-full animate-pulse"
                      style={{ height: "60%" }}
                    />
                    <span
                      className="w-1 bg-primary rounded-full animate-pulse"
                      style={{ height: "100%", animationDelay: "0.2s" }}
                    />
                    <span
                      className="w-1 bg-primary rounded-full animate-pulse"
                      style={{ height: "40%", animationDelay: "0.4s" }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicSidebar;

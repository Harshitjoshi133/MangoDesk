// app/components/AudioPlayer.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Fallback audio URL for testing
const FALLBACK_AUDIO_URL =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
}

export default function AudioPlayer({
  audioUrl = FALLBACK_AUDIO_URL,
  title = "Now Playing",
  onPlay,
  onPause,
  onTimeUpdate,
  onDurationChange,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleTimeInput = (newTime: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      const [minutes, seconds] = newTime.split(":").map(Number);
      const timeInSeconds = (minutes || 0) * 60 + (seconds || 0);
      const clampedTime = Math.min(Math.max(0, timeInSeconds), duration);

      audio.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    } catch {
      // ignore invalid input
    }
  };

  const calculateTimeFromPos = useCallback(
    (clientX: number) => {
      if (!progressBarRef.current) return 0;
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      return pos * duration;
    },
    [duration]
  );

  const startScrubbing = useCallback(
    (clientX: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      const newTime = calculateTimeFromPos(clientX);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
      setIsDragging(true);
    },
    [calculateTimeFromPos]
  );

  const handleProgressMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      startScrubbing(e.clientX);

      const handleMouseMove = (e: MouseEvent) => {
        const newTime = calculateTimeFromPos(e.clientX);
        if (audioRef.current) audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [calculateTimeFromPos, startScrubbing]
  );

  const handleProgressTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      startScrubbing(touch.clientX);

      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        const newTime = calculateTimeFromPos(touch.clientX);
        if (audioRef.current) audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      };

      const handleTouchEnd = () => {
        setIsDragging(false);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    },
    [calculateTimeFromPos, startScrubbing]
  );

  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        onPause?.();
      } else {
        await audio.play();
        setIsPlaying(true);
        onPlay?.();
      }
    } catch (error) {
      console.error("Playback failed:", error);
      setIsPlaying(false);
    }
  }, [isPlaying, onPlay, onPause]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    },
    []
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      onDurationChange?.(audio.duration);
    };

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
        onTimeUpdate?.(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
      onPause?.();
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.volume = volume;

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isDragging, volume, onTimeUpdate, onDurationChange, onPause]);

  // Manage audio src and reset playback when URL changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    audio.pause();
    audio.currentTime = 0;
    audio.src = audioUrl;

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    // Optional: auto-play the new track
    // const playPromise = audio.play();
    // if (playPromise !== undefined) {
    //   playPromise.then(() => setIsPlaying(true)).catch(console.error);
    // }

  }, [audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isVolumeOpen && !(e.target as Element)?.closest(".volume-control")) {
        setIsVolumeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVolumeOpen]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      <motion.div
        className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 shadow-2xl overflow-hidden w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 animate-pulse" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyan-300 font-medium text-sm uppercase tracking-wider truncate flex-1">
              {title}
            </h3>
            <div className="relative volume-control">
              <motion.button
                onClick={() => setIsVolumeOpen(!isVolumeOpen)}
                className="text-slate-400 hover:text-cyan-300 p-1.5 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {volume === 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M11 5L6 9H2v6h4l5 4V5z"></path> <line x1="23" y1="9" x2="17" y2="15"></line> <line x1="17" y1="9" x2="23" y2="15"></line> </svg>
                ) : volume < 0.5 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon> </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon> <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path> </svg>
                )}
              </motion.button>

              <AnimatePresence>
                {isVolumeOpen && (
                  <motion.div
                    className="absolute right-0 bottom-full mb-2 bg-slate-800/90 backdrop-blur-lg p-3 rounded-lg shadow-xl z-20 volume-control"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-24 h-1.5 accent-cyan-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div
            ref={progressBarRef}
            className="relative h-1.5 bg-slate-700/50 rounded-full mb-4 cursor-pointer overflow-hidden group"
            onMouseDown={handleProgressMouseDown}
            onTouchStart={handleProgressTouchStart}
          >
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            >
              <motion.div
                className={`absolute right-0 top-1/2 -mt-1.5 w-3 h-3 bg-white rounded-full shadow-lg transition-all
                  ${isDragging ? "opacity-100 scale-125" : "opacity-0 scale-100 group-hover:opacity-100"}`}
              />
            </motion.div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={formatTime(currentTime)}
                onChange={(e) => handleTimeInput(e.target.value)}
                className="w-12 bg-transparent text-xs text-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1"
              />
              <span className="text-xs text-slate-500">/</span>
              <span className="text-xs text-slate-400 font-mono">
                {formatTime(duration)}
              </span>
            </div>

            <motion.button
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white shadow-lg hover:shadow-cyan-500/30 transition-all duration-200 relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!duration}
            >
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div
                    key="pause"
                    className="w-5 h-5 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="w-1 h-4 bg-white mx-0.5 rounded-full" />
                    <div className="w-1 h-4 bg-white mx-0.5 rounded-full" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="play"
                    className="w-0 h-0 border-l-[10px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </AnimatePresence>

              {isPlaying && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 0, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                />
              )}
            </motion.button>

            <div className="text-xs text-slate-400 font-mono min-w-[2.5rem] text-right">
              {formatTime(duration)}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent transition-all duration-300"
            style={{
              transform: `translateX(${progressPercentage - 50}%)`,
              opacity: isPlaying ? 0.6 : 0.2,
            }}
          />
        </div>
      </motion.div>
    </>
  );
}
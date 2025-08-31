"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Fallback audio URL for testing
const FALLBACK_AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
}

export default function AudioPlayer({
  audioUrl = FALLBACK_AUDIO_URL,
  title = 'Now Playing',
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onSeek,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.8);
  const [isHovered, setIsHovered] = useState(false);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Format time in seconds to MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Update time as audio plays
  const updateTime = () => {
    if (audioRef.current) {
      animationRef.current = requestAnimationFrame(updateTime);
    }
  };

  // Handle seeking with better mouse interaction
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = Math.min(Math.max(0, pos * duration), duration);
    
    onSeek(newTime);
  };

  // Handle play/pause with better state management
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      // setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      // setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      // setIsPlaying(false);
      // setCurrentTime(0);
      // if (animationRef.current) {
      //   cancelAnimationFrame(animationRef.current);
      // }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.volume = volume;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioUrl, volume]);

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <motion.div 
        className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 shadow-2xl overflow-hidden w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Audio Visualizer */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 animate-pulse" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />
        </div>

        <div className="relative z-10">
          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-cyan-300 font-medium text-sm uppercase tracking-wider">{title}</h3>
              <div className="relative flex items-center">
                <motion.button
                  onClick={() => setIsVolumeOpen(!isVolumeOpen)}
                  className="text-slate-400 hover:text-cyan-300 p-1.5 rounded-full transition-colors flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {volume === 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                      <line x1="23" y1="9" x2="17" y2="15"></line>
                      <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  )}
                </motion.button>
                
                <AnimatePresence>
                  {isVolumeOpen && (
                    <motion.div 
                      className="absolute left-full top-0 h-full flex items-center ml-2 bg-slate-800/90 backdrop-blur-lg p-3 rounded-lg shadow-xl z-20"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-24 h-1.5 accent-cyan-400 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:-mt-1"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div 
            ref={progressBarRef}
            className="relative h-1.5 bg-slate-700/50 rounded-full mb-4 cursor-pointer overflow-hidden group"
            onClick={handleSeek}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            >
              <div 
                className="absolute right-0 top-1/2 -mt-1.5 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono">
              {formatTime(currentTime)}
            </div>
            
            <motion.button
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white shadow-lg hover:shadow-cyan-500/30 transition-all duration-200 relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div
                    key="pause"
                    className="w-5 h-5 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="w-1 h-4 bg-white mx-0.5 rounded-full" />
                    <div className="w-1 h-4 bg-white mx-0.5 rounded-full" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="play"
                    className="w-0 h-0 border-l-[10px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
              
              {/* Pulsing effect when playing */}
              {isPlaying && (
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                />
              )}
            </motion.button>
            
            <div className="text-xs text-slate-400 font-mono">
              {formatTime(duration)}
            </div>
          </div>
        </div>
        
        {/* Waveform effect at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-wave" />
        </div>
      </motion.div>
    </>
  );
}
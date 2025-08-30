"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioPlayerProps {
  audioUrl?: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  currentTime?: number;
  duration?: number;
  title?: string;
}

export default function AudioPlayer({
  audioUrl,
  isPlaying = false,
  onPlay,
  onPause,
  onSeek,
  currentTime = 0,
  duration = 0,
  title = 'Now Playing'
}: AudioPlayerProps) {
  const [volume, setVolume] = useState(0.8);
  const [isHovered, setIsHovered] = useState(false);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !onSeek) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = Math.min(Math.max(0, pos * duration), duration);
    onSeek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    // You can add volume control logic here if needed
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div 
      className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 shadow-2xl overflow-hidden"
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
          <h3 className="text-cyan-300 font-medium text-sm uppercase tracking-wider">{title}</h3>
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setIsVolumeOpen(!isVolumeOpen)}
              className="text-slate-400 hover:text-cyan-300 p-1.5 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Volume Control */}
        <AnimatePresence>
          {isVolumeOpen && (
            <motion.div 
              className="absolute right-0 top-12 bg-slate-800/90 backdrop-blur-lg p-3 rounded-lg shadow-xl z-20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 accent-cyan-400 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <div 
          ref={progressBarRef}
          className="relative h-1.5 bg-slate-700/50 rounded-full mb-4 cursor-pointer overflow-hidden"
          onClick={handleSeek}
        >
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="absolute right-0 top-1/2 -mt-1.5 w-3 h-3 bg-white rounded-full shadow-lg"
              animate={{ 
                scale: isHovered ? 1.2 : 1,
                opacity: isHovered ? 1 : 0.8
              }}
            />
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            {formatTime(currentTime)}
          </div>
          
          <motion.button
            onClick={isPlaying ? onPause : onPlay}
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
  );
}
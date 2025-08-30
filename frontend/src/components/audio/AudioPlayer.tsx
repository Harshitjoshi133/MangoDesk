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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onSeek?.(newTime);
  };

  return (
    <motion.div 
      className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <motion.button
          onClick={isPlaying ? onPause : onPlay}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 flex items-center justify-center text-white shadow-lg hover:shadow-violet-500/30 transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isPlaying ? (
            <motion.div
              className="w-4 h-4 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-1 h-4 bg-white mx-0.5" />
              <div className="w-1 h-4 bg-white mx-0.5" />
            </motion.div>
          ) : (
            <motion.div
              className="w-0 h-0 border-l-4 border-l-white border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
        </motion.button>

        {/* Progress Bar */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs text-slate-400">{formatTime(currentTime)}</span>
            <div className="flex-1 relative">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${(currentTime / (duration || 1)) * 100}%, rgb(71, 85, 105) ${(currentTime / (duration || 1)) * 100}%, rgb(71, 85, 105) 100%)`
                }}
              />
            </div>
            <span className="text-xs text-slate-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      {/* Waveform effect at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-wave" />
      </div>
    </motion.div>
  );
}

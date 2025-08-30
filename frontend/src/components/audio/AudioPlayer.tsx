"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
  audioUrl?: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  currentTime?: number;
  duration?: number;
}

export default function AudioPlayer({
  audioUrl,
  isPlaying = false,
  onPlay,
  onPause,
  onSeek,
  currentTime = 0,
  duration = 0
}: AudioPlayerProps) {
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [lastVolume, setLastVolume] = useState(0.8);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onSeek?.(newTime);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(lastVolume);
    } else {
      setLastVolume(volume);
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setLastVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <motion.div
      className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <motion.button
          onClick={isPlaying ? onPause : onPlay}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 flex items-center justify-center text-white shadow-lg hover:shadow-violet-500/40 transition-all duration-200 relative overflow-hidden group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-violet-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {isPlaying ? (
            <motion.div
              className="w-5 h-5 flex items-center justify-center relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key="pause"
            >
              <div className="w-1 h-5 bg-white mx-0.5 rounded-full" />
              <div className="w-1 h-5 bg-white mx-0.5 rounded-full" />
            </motion.div>
          ) : (
            <motion.div
              className="w-5 h-5 flex items-center justify-center relative ml-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key="play"
            >
              <div className="w-0 h-0 border-t-3 border-t-transparent border-b-3 border-b-transparent border-l-5 border-l-white ml-1" />
            </motion.div>
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

        {/* Volume Controls */}
        <div className="flex items-center space-x-3">
          {/* Mute/Unmute Button */}
          <motion.button
            onClick={toggleMute}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : volume > 0.5 ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 5l7.071 7.071M12 19l-7.071-7.07" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              </svg>
            )}
          </motion.button>
          
          {/* Volume Slider */}
          <div className="w-20 flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 bg-slate-600 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(volume / 1) * 100}%, #4b5563 ${(volume / 1) * 100}%, #4b5563 100%)`
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: rgb(139, 92, 246);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: rgb(139, 92, 246);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </motion.div>
  );
}

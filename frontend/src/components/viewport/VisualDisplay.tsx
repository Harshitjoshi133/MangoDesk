"use client";

import { motion } from 'framer-motion';

interface VisualDisplayProps {
  imageUrl?: string;
  isLoading?: boolean;
  onImageError?: () => void;
}

export default function VisualDisplay({ 
  imageUrl, 
  isLoading = false, 
  onImageError 
}: VisualDisplayProps) {
  return (
    <motion.div
      className="relative w-full h-full min-h-[400px] bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <motion.div
            className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt="Story visualization"
          className="w-full h-full object-cover"
          onError={onImageError}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-slate-500">
          <p className="text-lg">Visual content will appear here</p>
        </div>
      )}
    </motion.div>
  );
}

"use client";

import { motion } from 'framer-motion';

interface NarrativeTextProps {
  text: string;
  isTyping?: boolean;
}

export default function NarrativeText({ text, isTyping = false }: NarrativeTextProps) {
  return (
    <motion.div
      className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-white text-lg leading-relaxed overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 pr-2">
        {isTyping ? (
          <motion.span
            className="inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            {text}
            <motion.span
              className="inline-block w-2 h-6 bg-violet-400 ml-1"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </motion.span>
        ) : (
          <span>{text}</span>
        )}
      </div>
    </motion.div>
  );
}

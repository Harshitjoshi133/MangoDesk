"use client";

import { motion } from 'framer-motion';

interface Choice {
  id: string;
  text: string;
}

interface ChoicePanelProps {
  choices: Choice[];
  onChoiceSelect: (choiceId: string) => void;
  isLoading?: boolean;
}

export default function ChoicePanel({ choices, onChoiceSelect, isLoading = false }: ChoicePanelProps) {
  return (
    <motion.div
      className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-violet-300 font-semibold mb-4 text-lg">What happens next?</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <motion.div
            className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="ml-3 text-slate-400">Generating choices...</span>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-64 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 pr-2">
          {choices.map((choice, index) => (
            <motion.button
              key={choice.id}
              onClick={() => onChoiceSelect(choice.id)}
              className="w-full text-left p-4 rounded-lg bg-slate-800/50 border border-slate-600/50 text-white hover:border-violet-500/50 hover:bg-slate-700/50 transition-all duration-200"
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <span className="text-violet-400 font-medium mr-2">→</span>
              {choice.text}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

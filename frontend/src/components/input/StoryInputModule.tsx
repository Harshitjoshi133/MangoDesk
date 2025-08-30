"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

interface StoryInputModuleProps {
  onStorySubmit: (prompt: string) => void;
}

export default function StoryInputModule({ onStorySubmit }: StoryInputModuleProps) {
  const [storyPrompt, setStoryPrompt] = useState('');
  const [tone, setTone] = useState('Epic');
  const [visualStyle, setVisualStyle] = useState('Anime');

  const tones = ['Epic', 'Mysterious', 'Whimsical', 'Dark', 'Romantic', 'Adventure'];
  const visualStyles = ['Anime', 'Photorealistic', 'Oil Painting', 'Digital Art', 'Watercolor', 'Cinematic'];

  const handleBeginWeaving = () => {
    if (storyPrompt.trim()) {
      onStorySubmit(storyPrompt);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-violet-300 mb-4">
          Weave Your Legend
        </h2>
        <p className="text-lg text-slate-400">
          Share your story idea and watch it come to life
        </p>
      </motion.div>

      <motion.div
        className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
      >
        {/* Story Input Area */}
        <div className="mb-8">
          <label className="block text-violet-300 font-semibold mb-4 text-lg">
            Your Story Prompt
          </label>
          <motion.div
            className="relative"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <textarea
              value={storyPrompt}
              onChange={(e) => setStoryPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleBeginWeaving();
                }
              }}
              placeholder="Describe your story idea, character, or the world you want to explore..."
              className="w-full h-32 bg-slate-900/50 border border-slate-600/50 rounded-xl p-6 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 resize-none backdrop-blur-sm"
              style={{
                boxShadow: storyPrompt ? '0 0 20px rgba(139, 92, 246, 0.3)' : 'none'
              }}
            />
            {storyPrompt && (
              <motion.div
                className="absolute inset-0 border border-violet-500/30 rounded-xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.div>
        </div>

        {/* Parameter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Tone Selection */}
          <div>
            <label className="block text-cyan-300 font-semibold mb-3">
              Tone
            </label>
            <div className="flex flex-wrap gap-2">
              {tones.map((toneOption) => (
                <motion.button
                  key={toneOption}
                  onClick={() => setTone(toneOption)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tone === toneOption
                      ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {toneOption}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Visual Style Selection */}
          <div>
            <label className="block text-rose-300 font-semibold mb-3">
              Visual Style
            </label>
            <div className="flex flex-wrap gap-2">
              {visualStyles.map((style) => (
                <motion.button
                  key={style}
                  onClick={() => setVisualStyle(style)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    visualStyle === style
                      ? 'bg-rose-500/20 border border-rose-400/50 text-rose-300 shadow-lg shadow-rose-500/20'
                      : 'bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:border-rose-400/30 hover:text-rose-200 hover:bg-rose-500/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {style}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Begin Weaving Button */}
        <motion.div className="text-center">
          <motion.button
            onClick={handleBeginWeaving}
            disabled={!storyPrompt.trim()}
            className={`relative px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              storyPrompt.trim()
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50'
                : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            }`}
            whileHover={storyPrompt.trim() ? { scale: 1.05, y: -2 } : {}}
            whileTap={storyPrompt.trim() ? { scale: 0.95 } : {}}
          >
            <span className="relative z-10">Begin Weaving</span>
            {storyPrompt.trim() && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl opacity-0"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StoryInputModule from '../components/input/StoryInputModule';
import ModalitySelector from '../components/input/ModalitySelector';

export default function Home() {
  const [step, setStep] = useState<'prompt' | 'modality' | 'generating'>('prompt');
  const [storyPrompt, setStoryPrompt] = useState('');

  const handleStorySubmit = (prompt: string) => {
    setStoryPrompt(prompt);
    setStep('modality');
  };

  const handleModalitySelect = (modality: string) => {
    setStep('generating');
    // TODO: Navigate to story page with prompt and modality
    console.log('Selected modality:', modality, 'for prompt:', storyPrompt);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-black relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-violet-400 rounded-full animate-pulse opacity-40" />
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-magenta-400 rounded-full animate-pulse opacity-30" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse opacity-50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-magenta-400 bg-clip-text text-transparent">
              Smart Cultural Storyteller
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Where your imagination meets AI to weave legends that transcend time and culture
          </motion.p>
        </motion.div>

        {/* Step-based Content */}
        <AnimatePresence mode="wait">
          {step === 'prompt' && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.6 }}
            >
              <StoryInputModule onStorySubmit={handleStorySubmit} />
            </motion.div>
          )}

          {step === 'modality' && (
            <motion.div
              key="modality"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.6 }}
            >
              <ModalitySelector 
                storyPrompt={storyPrompt}
                onModalitySelect={handleModalitySelect}
              />
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 shadow-2xl">
                <motion.div
                  className="w-24 h-24 border-4 border-violet-500/30 border-t-violet-500 rounded-full mx-auto mb-8"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <h2 className="text-3xl font-bold text-violet-300 mb-4">
                  Weaving Your Story
                </h2>
                <p className="text-slate-300 text-lg">
                  AI is crafting your unique narrative experience...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

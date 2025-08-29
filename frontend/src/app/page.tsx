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
    <main className="min-h-screen relative overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles */}
        {[...Array(50)].map((_, i) => {
          const size = Math.random() * 6 + 2;
          const duration = Math.random() * 15 + 10;
          const delay = Math.random() * 5;
          const distance = Math.random() * 50 + 20;
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-blue-400/50 to-purple-400/50"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                filter: 'blur(1px)',
              }}
              animate={{
                y: [0, -distance, 0],
                x: [0, (Math.random() - 0.5) * 40],
                opacity: [0.1, 0.8, 0.1],
              }}
              transition={{
                duration: duration,
                delay: delay,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          );
        })}

        {/* Animated Grid */}
        <motion.div 
          className="absolute inset-0 bg-grid-white/[0.03] bg-[length:40px_40px]"
          animate={{
            backgroundPosition: ['0 0', '40px 40px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Glowing Orbs */}
        <motion.div 
          className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div 
          className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-6rem)]">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="relative text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative inline-block">
              <motion.h1 
                className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 relative z-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, type: 'spring', stiffness: 100 }}
              >
                <span className="relative">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent filter blur-md">
                    Smart Cultural Storyteller
                  </span>
                  <span className="relative bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-lg">
                    Smart Cultural Storyteller
                  </span>
                </span>
              </motion.h1>
              
              <motion.div 
                className="absolute -inset-6 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-xl -z-10 blur-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0.2, 0.4, 0.2],
                  scale: [0.95, 1.05, 0.95]
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </div>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 font-light tracking-wider mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                textShadow: [
                  '0 0 8px rgba(96, 165, 250, 0)',
                  '0 0 16px rgba(192, 132, 252, 0.3)',
                  '0 0 8px rgba(96, 165, 250, 0)'
                ]
              }}
              transition={{ 
                duration: 0.8, 
                delay: 0.4,
                textShadow: {
                  duration: 6,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }
              }}
            >
              Where your imagination meets AI to weave legends that transcend time and culture
            </motion.p>
            <motion.div 
              className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur-xl -z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
            />
          </motion.div>
          
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

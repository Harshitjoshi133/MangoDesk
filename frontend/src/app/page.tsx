"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import StoryInputModule from '../components/input/StoryInputModule';

export default function Home() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStorySubmit = async (prompt: string) => {
    setIsGenerating(true);
    // In a real app, you would call an API to generate the story
    // For now, we'll just navigate to the story page with the prompt
    router.push(`/story/new?prompt=${encodeURIComponent(prompt)}`);
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
        </motion.div>
        {/* Story Input Module */}
        <StoryInputModule onStorySubmit={handleStorySubmit} />
        
        {/* Loading Overlay */}
        {isGenerating && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center p-8 bg-slate-800/90 rounded-2xl border border-slate-700/50">
              <div className="text-2xl text-violet-300 mb-6">Weaving your story...</div>
              <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-6 text-slate-400">This may take a moment as we craft your unique adventure</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

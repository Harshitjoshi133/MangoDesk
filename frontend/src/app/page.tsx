"use client";

import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import StoryInputModule from '../components/input/StoryInputModule';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/30 to-slate-950 relative overflow-hidden">
      {/* Sci-fi grid overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54 20H40V6h2v12h12v2zM6 40H0v-2h6v-6H4v-2h6v-2H2v-2h8v12h-4v-2zm0 2v2h2v-2H6zM0 18h2v-2h2v2h2v2H2v2H0v-4zm0 24h2v-2h2v2h2v2H2v2H0v-4zm0-12h2v-2h2v2h2v2H2v2H0v-4z' fill='%233b82f6' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />
      
      {/* Animated background particles with connecting lines */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid animation */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(56,189,248,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => {
          const size = Math.random() * 2 + 1;
          const duration = Math.random() * 10 + 10;
          const delay = Math.random() * -20;
          const posX = Math.random() * 100;
          const posY = Math.random() * 100;
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-cyan-400"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${posX}%`,
                top: `${posY}%`,
                opacity: 0.6,
                boxShadow: '0 0 10px 2px rgba(56, 189, 248, 0.5)'
              }}
              animate={{
                y: [0, -50, 0],
                x: [0, (Math.random() - 0.5) * 100, 0],
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{
                duration: duration,
                delay: delay,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }}
            />
          );
        })}

        {/* Glowing orbs */}
        <motion.div 
          className="absolute w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          style={{
            top: '20%',
            left: '20%'
          }}
        />
        <motion.div 
          className="absolute w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: 2
          }}
          style={{
            bottom: '10%',
            right: '15%'
          }}
        />
      </div>
      
      {/* UFO Animation */}
      <motion.div 
        className="absolute z-20"
        initial={{ x: '-200px', y: '20%' }}
        animate={{ 
          x: 'calc(100vw + 200px)',
          y: ['20%', '30%', '15%', '25%', '20%']
        }}
        transition={{
          x: {
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          },
          y: {
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'reverse'
          }
        }}
      >
        {/* UFO Body */}
        <div className="relative">
          {/* Glow */}
          <div className="absolute -inset-4 bg-blue-400 rounded-full blur-xl opacity-30" />
          
          {/* UFO Main Body */}
          <div className="relative w-32 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" 
               style={{
                 boxShadow: '0 0 20px 5px rgba(56, 189, 248, 0.6)',
               }}>
            {/* UFO Dome */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-20 h-12 bg-gradient-to-b from-cyan-200 to-cyan-400 rounded-t-full border-t-2 border-l-2 border-r-2 border-cyan-300" 
                 style={{
                   boxShadow: '0 0 15px 3px rgba(165, 243, 252, 0.5)'
                 }} />
            
            {/* UFO Lights */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-yellow-300 via-pink-400 to-blue-400 rounded-full" />
            
            {/* Beam */}
            <motion.div 
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-8 h-80 origin-top"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ 
                scaleY: [0, 1, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 5,
                ease: 'easeInOut',
                times: [0, 0.3, 1]
              }}
              style={{
                background: 'linear-gradient(to bottom, rgba(96, 165, 250, 0.3), rgba(192, 132, 252, 0.2), transparent)'
              }}
            >
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-yellow-200 rounded-full blur-xl opacity-30" />
            </motion.div>
          </div>
          
          {/* Small orbiting lights */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white"
              initial={{
                x: Math.cos((i / 3) * Math.PI * 2) * 20,
                y: Math.sin((i / 3) * Math.PI * 2) * 5 - 10,
              }}
              animate={{
                x: Math.cos((i / 3) * Math.PI * 2 + Date.now() / 1000) * 20,
                y: Math.sin((i / 3) * Math.PI * 2 + Date.now() / 1000) * 5 - 10,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{
                boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.8)'
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)50%,rgba(0,0,0,0.2)50%)] bg-[length:100%_4px] opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 backdrop-blur-sm">
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
            <motion.span 
              className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent relative z-10"
              animate={{
                textShadow: [
                  '0 0 8px rgba(34, 211, 238, 0.8)',
                  '0 0 16px rgba(96, 165, 250, 0.8)',
                  '0 0 24px rgba(139, 92, 246, 0.8)',
                  '0 0 16px rgba(96, 165, 250, 0.8)',
                  '0 0 8px rgba(34, 211, 238, 0.8)'
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            >
              SMART CULTURAL STORYTELLER
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-slate-100 max-w-4xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Where your imagination meets AI to weave legends that transcend time and culture
          </motion.p>
        </motion.div>

        {/* Story Input Module */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <StoryInputModule />
        </motion.div>
      </div>

      {/* Feature Buttons */}
      <div className="w-full mt-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Interactive Storytelling */}
            <motion.div 
              className="bg-slate-900/80 backdrop-blur-md rounded-xl p-6 border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 cursor-pointer group"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(34, 211, 238, 0.2)' }}
            >
              <div className="text-cyan-400 group-hover:text-cyan-300 mb-3 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Interactive Storytelling</h3>
              <p className="text-slate-300 text-sm">Engage with dynamic stories that respond to your choices</p>
            </motion.div>

            {/* Visual Storytelling */}
            <motion.div 
              className="bg-slate-900/80 backdrop-blur-md rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 cursor-pointer group"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.2)' }}
            >
              <div className="text-purple-400 group-hover:text-purple-300 mb-3 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Visual Storytelling</h3>
              <p className="text-slate-300 text-sm">Experience stories come alive with stunning visuals</p>
            </motion.div>

            {/* Audio Narration */}
            <motion.div 
              className="bg-slate-900/80 backdrop-blur-md rounded-xl p-6 border border-pink-500/30 hover:border-pink-400/60 transition-all duration-300 cursor-pointer group"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.2)' }}
            >
              <div className="text-pink-400 group-hover:text-pink-300 mb-3 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 010-7.072m0 0a9 9 0 000-12.728" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Audio Narration</h3>
              <p className="text-slate-300 text-sm">Listen to immersive audio narrations of your favorite tales</p>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Add some space at the bottom */}
      <div className="h-16"></div>
    </main>
  );
}

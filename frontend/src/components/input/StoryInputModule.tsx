"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { StoryInput, SUPPORTED_LANGUAGES } from '../../types/story';
import { storyApi } from '../../lib/api';

interface StoryInputModuleProps {
  onStorySubmit: (data: Omit<StoryInput, 'story_type'>) => void;
}

export default function StoryInputModule({ onStorySubmit }: StoryInputModuleProps) {
  const [storyPrompt, setStoryPrompt] = useState('');
  const [tone, setTone] = useState('Epic');
  const [visualStyle, setVisualStyle] = useState('Anime');
  const [language, setLanguage] = useState<StoryInput['language']>('en');
  const [file, setFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const tones = ['Epic', 'Mysterious', 'Whimsical', 'Dark', 'Romantic', 'Adventure'];
  const visualStyles = ['Anime', 'Photorealistic', 'Oil Painting', 'Digital Art', 'Watercolor', 'Cinematic'];

  const handleBeginWeaving = async () => {
    try {
      if (file) {
        // Read the file content
        const text = await file.text();
        // Truncate to 200 characters as per backend validation
        const truncatedText = text.slice(0, 200);
        
        // Create the story input
        const storyInput = {
          title: file.name.split('.')[0],
          content: truncatedText,
          story_type: 'folk_tale' as const,
          language,
          culture: 'general',
          target_age_group: 'all'
        };
        
        // Send to stories/create endpoint
        const response = await fetch('http://localhost:8000/api/v1/stories/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(storyInput),
        });

        if (!response.ok) {
          throw new Error('Failed to create story');
        }

        const result = await response.json();
        
        // Send the result to the parent component
        onStorySubmit({
          prompt: result.enhanced_content,
          tone,
          visualStyle,
          language
        });
      } else if (audioBlob) {
        // If audio is recorded, send audio and start story for village in India
        onStorySubmit({
          prompt: 'Start a story for a village in India.',
          tone,
          visualStyle,
          language
        });
      } else if (storyPrompt.trim()) {
        onStorySubmit({
          prompt: storyPrompt,
          tone,
          visualStyle,
          language
        });
      }
    } catch (error) {
      console.error('Error in handleBeginWeaving:', error);
    }
  };

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStoryPrompt(''); // Clear prompt if file is uploaded
    }
  };

  // Audio recording handlers
  const handleStartRecording = async () => {
    setIsRecording(true);
    setAudioBlob(null);
    setAudioUrl(null);
    if (navigator.mediaDevices) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setIsRecording(false);
      };
      recorder.start();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
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
          <motion.div className="relative" whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <textarea
              value={storyPrompt}
              onChange={(e) => { setStoryPrompt(e.target.value); setFile(null); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleBeginWeaving();
                }
              }}
              placeholder="Describe your story idea, character, or the world you want to explore..."
              className="w-full h-32 bg-slate-900/50 border border-slate-600/50 rounded-xl p-6 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 resize-none backdrop-blur-sm"
              style={{ boxShadow: storyPrompt ? '0 0 20px rgba(139, 92, 246, 0.3)' : 'none' }}
              disabled={!!file}
            />
            {storyPrompt && !file && (
              <motion.div
                className="absolute inset-0 border border-violet-500/30 rounded-xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.div>
          {/* Upload File Button */}
          <div className="mt-4 flex gap-4 items-center">
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
              Upload File
              <input type="file" accept=".txt" className="hidden" onChange={handleFileChange} />
            </label>
            {file && <span className="text-green-400">{file.name} selected</span>}
          </div>
          {/* Record Audio Button */}
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              {!isRecording ? (
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={handleStartRecording}
                  type="button"
                >
                  Record Audio
                </button>
              ) : (
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors animate-pulse"
                  onClick={handleStopRecording}
                  type="button"
                >
                  Stop Recording
                </button>
              )}
              {isRecording && (
                <span className="text-red-400 animate-pulse">Recording in progress...</span>
              )}
            </div>
            
            {audioUrl && (
              <div className="w-full max-w-md bg-slate-700/50 rounded-lg p-4">
                <audio 
                  src={audioUrl} 
                  controls 
                  className="w-full focus:outline-none"
                  controlsList="nodownload"
                  onPlay={() => {
                    // You can add any additional logic when audio starts playing
                  }}
                  onEnded={() => {
                    // You can add any additional logic when audio finishes playing
                  }}
                >
                  <track kind="captions" />
                  Your browser does not support the audio element.
                </audio>
                <div className="flex justify-between text-sm text-slate-400 mt-2">
                  <span>Recorded Audio</span>
                  {audioBlob && (
                    <span>{Math.round(audioBlob.size / 1024)} KB</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Parameter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tone Selection (Cyan Color) */}
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

          {/* Visual Style Selection (Rose Color) */}
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

          {/* Language Selector */}
          <div>
            <label className="block text-violet-300 font-medium mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as StoryInput['language'])}
              className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Begin Weaving Button */}
        <motion.div className="text-center">
          <motion.button
            onClick={handleBeginWeaving}
            disabled={!storyPrompt.trim() && !file && !audioBlob}
            className={`relative px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              storyPrompt.trim() || file || audioBlob
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50'
                : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            }`}
            whileHover={(storyPrompt.trim() || file || audioBlob) ? { scale: 1.05, y: -2 } : {}}
            whileTap={(storyPrompt.trim() || file || audioBlob) ? { scale: 0.95 } : {}}
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

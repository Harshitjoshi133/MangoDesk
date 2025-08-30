"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { storyApi } from '../../../lib/api';
import { StoryInput, StorySegment, StoryType } from '../../../types/story';
import VisualDisplay from '../../../components/viewport/VisualDisplay';
import NarrativeText from '../../../components/viewport/NarrativeText';
import ChoicePanel from '../../../components/viewport/ChoicePanel';
import AudioPlayer from '../../../components/audio/AudioPlayer';

interface StoryPageProps {
  params: {
    storyId: string;
  };
}

export default function StoryPage({ params }: StoryPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentSegment, setCurrentSegment] = useState<StorySegment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const storyPrompt = searchParams.get('prompt') || 'Your story begins here...';
  const modality = searchParams.get('modality') || 'interactive';
  const tone = searchParams.get('tone') || 'mysterious';
  const visualStyle = searchParams.get('visualStyle') || 'fantasy';

  // Map modality to valid story types (case-insensitive)
  const getStoryType = (modality: string): StoryType => {
    const lowerModality = modality.toLowerCase();
    
    // First check for exact matches
    if (lowerModality === 'folk' || lowerModality === 'folk_tale') return 'folk_tale';
    if (lowerModality === 'historical') return 'historical';
    if (lowerModality === 'myth' || lowerModality === 'mythology') return 'mythology';
    if (lowerModality === 'cultural' || lowerModality === 'cultural_tradition') return 'cultural_tradition';
    
    // Then check for partial matches
    if (lowerModality.includes('folk')) return 'folk_tale';
    if (lowerModality.includes('hist')) return 'historical';
    if (lowerModality.includes('myth')) return 'mythology';
    if (lowerModality.includes('cult')) return 'cultural_tradition';
    
    // Default to folk_tale for any other case
    return 'folk_tale';
  };

  // Cleanup audio element on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        URL.revokeObjectURL(audioElement.src);
      }
    };
  }, [audioElement]);

  const handleAudioPlay = async () => {
    if (!currentSegment) return;

    // If we already have an audio URL, just play it
    if (currentSegment.audioUrl) {
      const audio = new Audio(currentSegment.audioUrl);
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        setError('Failed to play audio');
      });
      setAudioElement(audio);
      setIsAudioPlaying(true);
      return;
    }

    // Generate and play new audio
    try {
      setIsLoading(true);
      const audioUrl = await storyApi.generateAudio(currentSegment.text);
      const audio = new Audio(audioUrl);
      
      audio.onplay = () => setIsAudioPlaying(true);
      audio.onpause = () => setIsAudioPlaying(false);
      audio.onended = () => setIsAudioPlaying(false);
      
      await audio.play();
      
      setCurrentSegment(prev => prev ? { ...prev, audioUrl } : null);
      setAudioElement(audio);
    } catch (err) {
      console.error('Error generating/playing audio:', err);
      setError('Failed to generate audio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioPause = () => {
    if (audioElement) {
      audioElement.pause();
      setIsAudioPlaying(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const initStory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const storyType = getStoryType(modality);
        console.log('Modality:', modality, 'Mapped story type:', storyType);
        
        const storyInput: StoryInput = {
          prompt: storyPrompt,
          tone,
          visualStyle,
          story_type: storyType,
        };
        
        console.log('Calling generateInitialSegment with:', storyInput);
        const segment = await storyApi.generateInitialSegment(storyInput);
        console.log('Received segment:', segment);
        
        if (isMounted) {
          setCurrentSegment(segment);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (error) {
        console.error('Error initializing story:', error);
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to start the story';
          setError(`Error: ${errorMessage}. Please try again.`);
          
          // Set a fallback segment with error information
          setCurrentSegment({
            id: 'error-' + Date.now(),
            text: `Error: ${errorMessage}. Please try again or refresh the page.`,
            imageUrl: '',
            audioUrl: '',
            choices: [
              { id: 'retry', text: 'Retry' },
              { id: 'home', text: 'Go to Home' }
            ]
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initStory();
    
    return () => {
      isMounted = false;
      // Clean up any audio elements
      if (audioElement) {
        audioElement.pause();
        URL.revokeObjectURL(audioElement.src);
      }
    };
  }, [storyPrompt, tone, visualStyle, modality]);

  const handleChoiceSelect = async (choiceId: string) => {
    if (!currentSegment?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Pause any currently playing audio
      if (audioElement) {
        audioElement.pause();
        setIsAudioPlaying(false);
      }
      
      const segment = await storyApi.generateNextSegment(choiceId, currentSegment.id);
      setCurrentSegment(segment);
      
      // Scroll to top of the content when new segment loads
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error processing choice:', err);
      setError('Failed to process your choice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getModalityInfo = () => {
    switch (modality) {
      case 'interactive':
        return { title: 'Interactive Storytelling', icon: '🎮', color: 'violet' };
      case 'visual':
        return { title: 'Visual Storytelling', icon: '🎨', color: 'cyan' };
      case 'audio':
        return { title: 'Audio Narration', icon: '🎧', color: 'magenta' };
      default:
        return { title: 'Story Experience', icon: '📖', color: 'violet' };
    }
  };

  const modalityInfo = getModalityInfo();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-black relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-violet-400 rounded-full animate-pulse opacity-40" />
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-magenta-400 rounded-full animate-pulse opacity-30" />
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between p-6 backdrop-blur-xl bg-slate-900/30 border-b border-slate-700/50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => router.push('/')}
              className="text-violet-300 hover:text-violet-200 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ← Back to Genesis
            </motion.button>
            <div className="w-px h-6 bg-slate-600" />
            <span className={`text-${modalityInfo.color}-300 flex items-center space-x-2`}>
              <span>{modalityInfo.icon}</span>
              <span>{modalityInfo.title}</span>
            </span>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 relative p-6 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Display - Takes up 2/3 of the screen on large displays */}
            <div className="lg:col-span-2 h-full">
              <VisualDisplay 
                imageUrl={currentSegment?.imageUrl}
                isLoading={isLoading}
                onImageError={() => {
                  // Handle image loading error
                  console.error('Failed to load story image');
                }}
              />
            </div>

            {/* Right Panel - Controls and Info */}
            <div className="space-y-6 overflow-y-auto max-h-full pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {/* Story Info */}
              <motion.div
                className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-violet-300 font-semibold mb-2">Your Story:</h3>
                <p className="text-slate-300 text-sm italic break-words whitespace-normal overflow-wrap-anywhere">"{storyPrompt}"</p>
              </motion.div>

              {/* Error Message */}
              {error && (
                <div className="text-red-400 text-sm p-2 bg-red-900/30 rounded overflow-y-auto max-h-32 scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-red-900">
                  {error}
                </div>
              )}

              {/* Audio Player */}
              <AudioPlayer
                audioUrl={currentSegment?.audioUrl}
                isPlaying={isAudioPlaying}
                currentTime={audioElement?.currentTime || 0}
                duration={audioElement?.duration || 0}
                onPlay={handleAudioPlay}
                onPause={handleAudioPause}
                onSeek={(time) => {
                  if (audioElement) {
                    audioElement.currentTime = time;
                  }
                }}
              />

              {/* Narrative Text */}
              <NarrativeText
                text={currentSegment?.text || "Loading your story..."}
                isTyping={isLoading}
              />

              {/* Choice Panel */}
              <ChoicePanel
                choices={currentSegment?.choices || []}
                onChoiceSelect={handleChoiceSelect}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

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
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isAudioGenerated, setIsAudioGenerated] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [isVisualGenerated, setIsVisualGenerated] = useState(false);
  
  const storyPrompt = searchParams.get('prompt') || 'Your story begins here...';
  const modality = searchParams.get('modality') || 'interactive';
  const tone = searchParams.get('tone') || 'mysterious';
  const visualStyle = searchParams.get('visualStyle') || 'fantasy';
  const language = searchParams.get('language') || 'en';

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
    if (lowerModality.includes('cultural') || lowerModality.includes('tradition')) return 'cultural_tradition';
    
    // Default to folk_tale if no match found
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

  const handleGenerateAudio = async () => {
    if (!currentSegment) return;

    setIsGeneratingAudio(true);
    try {
      const audioUrl = await storyApi.generateAudio(currentSegment.text);
      setCurrentSegment(prev => prev ? { ...prev, audioUrl } : null);
      setIsAudioGenerated(true);
    } catch (err) {
      console.error('Error generating audio:', err);
      setError('Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleGenerateVisual = async () => {
    if (!currentSegment) return;

    setIsGeneratingVisual(true);
    try {
      const imageUrl = await storyApi.generateImage(currentSegment.text, visualStyle);
      setCurrentSegment(prev => prev ? { ...prev, imageUrl } : null);
      setIsVisualGenerated(true);
    } catch (err) {
      console.error('Error generating visual:', err);
      setError('Failed to generate visual');
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  const handleChoiceSelect = async (choiceId: string) => {
    console.log('=== Starting handleChoiceSelect ===');
    console.log('Current segment:', currentSegment);
    console.log('Selected choice ID:', choiceId);
    
    if (!currentSegment?.session_id) {
      const error = 'No session ID available in current segment';
      console.error(error);
      setError(error);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Calling generateNextSegment with:', {
        choiceId,
        sessionId: currentSegment.session_id
      });
      
      const nextSegment = await storyApi.generateNextSegment(
        choiceId, 
        currentSegment.session_id
      );
      
      console.log('Received next segment:', nextSegment);
      
      if (!nextSegment) {
        throw new Error('No segment returned from API');
      }
      
      const updatedSegment = {
        ...nextSegment,
        id: nextSegment.id || currentSegment.session_id,
        session_id: nextSegment.session_id || currentSegment.session_id,
        text: nextSegment.text || nextSegment.current_scene || 'The story continues...',
        imageUrl: nextSegment.imageUrl || '',
        audioUrl: nextSegment.audioUrl || '',
        choices: nextSegment.choices || []
      };
      
      console.log('Updating segment with:', updatedSegment);
      setCurrentSegment(updatedSegment);
      
      setIsAudioGenerated(false);
      setIsVisualGenerated(false);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process your choice';
      console.error('Error in handleChoiceSelect:', {
        error: err,
        message: errorMessage,
        choiceId,
        sessionId: currentSegment?.session_id
      });
      setError(`Error: ${errorMessage}. Please try again.`);
    } finally {
      setIsLoading(false);
      console.log('=== Finished handleChoiceSelect ===');
    }
  };

  useEffect(() => {
    const initializeStory = async () => {
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
          language: language as any // Type assertion since we've validated the language
        };
        
        console.log('Initializing story with input:', storyInput);
        
        const segment = await storyApi.generateInitialSegment(storyInput);
        setCurrentSegment(segment);
        
        // Reset generation flags
        setIsAudioGenerated(false);
        setIsVisualGenerated(false);
        
      } catch (err) {
        console.error('Error initializing story:', err);
        setError('Failed to initialize the story. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeStory();
  }, [params.storyId, storyPrompt, modality, tone, visualStyle, language]);

  const getModalityInfo = () => {
    switch (modality) {
      default:
        return { title: ' ', icon: ' ', color: 'violet' };
    }
  };

  const modalityInfo = getModalityInfo();

  return (
    <main className="h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-black relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-violet-400 rounded-full animate-pulse opacity-40" />
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-magenta-400 rounded-full animate-pulse opacity-30" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <motion.div
          className="flex-shrink-0 flex items-center justify-between p-6 backdrop-blur-xl bg-slate-900/30 border-b border-slate-700/50"
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

        {/* Main Content Area - Single scrollable container */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full p-6">
            <div className="min-h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Visual Display - Takes up 2/3 of the screen on large displays */}
              <div className="lg:col-span-2">
                {isVisualGenerated && currentSegment?.imageUrl && (
                  <VisualDisplay imageUrl={currentSegment.imageUrl} />
                )}
              </div>

              {/* Right Panel - Controls and Info */}
              <div className="space-y-6">
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
                  <div className="text-red-500 text-sm">
                    {error}
                  </div>
                )}

                {/* Narrative Text */}
                <div className="min-h-[200px] bg-white/10 p-6 rounded-lg">
                  <NarrativeText text={currentSegment?.text || ''} />
                </div>

                {/* Generation Controls */}
                <div className="flex gap-4">
                  <button
                    onClick={handleGenerateAudio}
                    disabled={isGeneratingAudio || isAudioGenerated}
                    className={`px-4 py-2 rounded-lg ${
                      isAudioGenerated 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } disabled:opacity-50`}
                  >
                    {isGeneratingAudio ? 'Generating...' : isAudioGenerated ? 'Audio Ready' : 'Generate Audio'}
                  </button>
                  
                  <button
                    onClick={handleGenerateVisual}
                    disabled={isGeneratingVisual || isVisualGenerated}
                    className={`px-4 py-2 rounded-lg ${
                      isVisualGenerated 
                        ? 'bg-green-600 text-white' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    } disabled:opacity-50`}
                  >
                    {isGeneratingVisual ? 'Generating...' : isVisualGenerated ? 'Visual Ready' : 'Generate Visual'}
                  </button>
                </div>

                {/* Audio Player - Only show if audio is generated */}
                {isAudioGenerated && currentSegment?.audioUrl && (
                  <div className="mt-6">
                    <AudioPlayer
                      audioUrl={currentSegment.audioUrl}
                      isPlaying={isAudioPlaying}
                      currentTime={audioElement?.currentTime || 0}
                      duration={audioElement?.duration || 0}
                      onPlay={handleAudioPlay}
                      onPause={handleAudioPause}
                      onSeek={(time: number) => {
                        if (audioElement) {
                          audioElement.currentTime = time;
                        }
                      }}
                    />
                  </div>
                )}

                {/* Choice Panel */}
                <div className="pb-6">
                  <ChoicePanel
                    choices={currentSegment?.choices || []}
                    onChoiceSelect={handleChoiceSelect}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// app/[storyId]/page.tsx
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
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isAudioGenerated, setIsAudioGenerated] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [isVisualGenerated, setIsVisualGenerated] = useState(false);
  
  // --- Removed unnecessary audio state ---
  // const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  // const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  const storyPrompt = searchParams.get('prompt') || 'Your story begins here...';
  const modality = searchParams.get('modality') || 'interactive';
  const tone = searchParams.get('tone') || 'mysterious';
  const visualStyle = searchParams.get('visualStyle') || 'fantasy';
  const language = searchParams.get('language') || 'en';

  const getStoryType = (modality: string): StoryType => {
    const lowerModality = modality.toLowerCase();
    if (lowerModality === 'folk' || lowerModality === 'folk_tale') return 'folk_tale';
    if (lowerModality === 'historical') return 'historical';
    if (lowerModality === 'myth' || lowerModality === 'mythology') return 'mythology';
    if (lowerModality === 'cultural' || lowerModality === 'cultural_tradition') return 'cultural_tradition';
    if (lowerModality.includes('folk')) return 'folk_tale';
    if (lowerModality.includes('hist')) return 'historical';
    if (lowerModality.includes('myth')) return 'mythology';
    if (lowerModality.includes('cultural') || lowerModality.includes('tradition')) return 'cultural_tradition';
    return 'folk_tale';
  };

  // --- Removed useEffect for audioElement as it's no longer needed ---
  // The AudioPlayer component handles its own cleanup internally.

  // --- Removed handleAudioPlay and handleAudioPause ---
  // The AudioPlayer is now self-contained and handles its own clicks.

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
    if (!currentSegment?.session_id) {
      setError('No session ID available in current segment');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const nextSegment = await storyApi.generateNextSegment(
        choiceId, 
        currentSegment.session_id
      );
      
      if (!nextSegment) throw new Error('No segment returned from API');
      
      setCurrentSegment(nextSegment);
      setIsAudioGenerated(!!nextSegment.audioUrl);
      setIsVisualGenerated(!!nextSegment.imageUrl);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process your choice';
      setError(`Error: ${errorMessage}. Please try again.`);
      console.error('Error in handleChoiceSelect:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeStory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storyType = getStoryType(modality);
        const storyInput: StoryInput = {
          prompt: storyPrompt,
          tone,
          visualStyle,
          story_type: storyType,
          language: language as any,
        };
        const segment = await storyApi.generateInitialSegment(storyInput);
        setCurrentSegment(segment);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.storyId]);

  const getModalityInfo = () => {
    // You can expand this later
    return { title: modality, icon: '✨', color: 'violet' };
  };

  const modalityInfo = getModalityInfo();

  // (The JSX below remains largely the same, but the AudioPlayer props are simplified)

  return (
    <main className="h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-black relative overflow-hidden">
      {/* ... Animated background ... */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-violet-400 rounded-full animate-pulse opacity-40" />
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-magenta-400 rounded-full animate-pulse opacity-30" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* ... Header ... */}
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
              <span className="capitalize">{modalityInfo.title}</span>
            </span>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full p-6">
            <div className="min-h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {currentSegment?.imageUrl && (
                  <VisualDisplay imageUrl={currentSegment.imageUrl} />
                )}
              </div>

              <div className="space-y-6">
                <motion.div
                  className="backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 shadow-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className="text-violet-300 font-semibold mb-2">Your Story:</h3>
                  <p className="text-slate-300 text-sm italic break-words whitespace-normal overflow-wrap-anywhere">"{storyPrompt}"</p>
                </motion.div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <div className="min-h-[200px] bg-white/10 p-6 rounded-lg">
                  <NarrativeText text={currentSegment?.text || ''} isTyping={isLoading} />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleGenerateAudio}
                    disabled={isGeneratingAudio || isAudioGenerated}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isAudioGenerated 
                        ? 'bg-green-600 text-white cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } disabled:opacity-50`}
                  >
                    {isGeneratingAudio ? 'Generating...' : isAudioGenerated ? 'Audio Ready' : 'Generate Audio'}
                  </button>
                  
                  <button
                    onClick={handleGenerateVisual}
                    disabled={isGeneratingVisual || !currentSegment || !!currentSegment.imageUrl}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentSegment?.imageUrl
                        ? 'bg-green-600 text-white cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    } disabled:opacity-50`}
                  >
                    {isGeneratingVisual ? 'Generating...' : currentSegment?.imageUrl ? 'Visual Ready' : 'Generate Visual'}
                  </button>
                </div>

                {isAudioGenerated && currentSegment?.audioUrl && (
                  <div className="mt-6">
                    {/* --- CORRECTED AUDIOPLAYER USAGE --- */}
                    <AudioPlayer
                      key={currentSegment.audioUrl} // Use key to force re-mount on URL change
                      audioUrl={currentSegment.audioUrl}
                      title="Story Narration"
                    />
                  </div>
                )}

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
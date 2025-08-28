"use client";

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
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
  
  const storyPrompt = searchParams.get('prompt') || 'Your story begins here...';
  const modality = searchParams.get('modality') || 'interactive';
  
  // Mock data for demonstration
  const mockChoices = [
    { id: '1', text: 'Explore the ancient ruins' },
    { id: '2', text: 'Follow the mysterious light' },
    { id: '3', text: 'Return to the village' }
  ];

  const handleChoiceSelect = (choiceId: string) => {
    console.log('Selected choice:', choiceId);
    // TODO: Handle choice selection and story progression
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
            <span className="text-slate-400">Story ID: {params.storyId}</span>
            <div className="w-px h-6 bg-slate-600" />
            <span className={`text-${modalityInfo.color}-300 flex items-center space-x-2`}>
              <span>{modalityInfo.icon}</span>
              <span>{modalityInfo.title}</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-cyan-300 text-sm">🎵</span>
            <span className="text-magenta-300 text-sm">🎨</span>
            <span className="text-violet-300 text-sm">⚙️</span>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 relative p-6">
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Display - Takes up 2/3 of the screen on large displays */}
            <div className="lg:col-span-2 h-full">
              <VisualDisplay 
                imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                isLoading={false}
              />
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
                <p className="text-slate-300 text-sm italic">"{storyPrompt}"</p>
              </motion.div>

              {/* Audio Player */}
              <AudioPlayer
                isPlaying={false}
                currentTime={45}
                duration={180}
                onPlay={() => console.log('Play audio')}
                onPause={() => console.log('Pause audio')}
                onSeek={(time) => console.log('Seek to:', time)}
              />

              {/* Narrative Text */}
              <NarrativeText
                text="As you stand at the crossroads of destiny, the ancient stones whisper secrets of forgotten times. The path before you splits into three, each leading to a different fate. Your choice will shape not just your journey, but the very fabric of this mystical realm."
                isTyping={false}
              />

              {/* Choice Panel */}
              <ChoicePanel
                choices={mockChoices}
                onChoiceSelect={handleChoiceSelect}
                isLoading={false}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

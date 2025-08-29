"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface ModalitySelectorProps {
  storyPrompt: string;
  onModalitySelect: (modality: string) => void;
}

interface ModalityOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
}

export default function ModalitySelector({ storyPrompt, onModalitySelect }: ModalitySelectorProps) {
  const router = useRouter();

  const modalities: ModalityOption[] = [
    {
      id: 'interactive',
      title: 'Interactive Storytelling',
      description: 'Choose your own adventure with branching narratives and dynamic choices',
      icon: '🎮',
      color: 'violet',
      gradient: 'from-violet-600 to-purple-600'
    },
    {
      id: 'visual',
      title: 'Visual Storytelling',
      description: 'Immerse yourself in stunning AI-generated visuals and animations',
      icon: '🎨',
      color: 'cyan',
      gradient: 'from-cyan-600 to-blue-600'
    },
    {
      id: 'audio',
      title: 'Audio Narration',
      description: 'Experience rich audio storytelling with emotion and authentic voices',
      icon: '🎧',
      color: 'magenta',
      gradient: 'from-magenta-600 to-pink-600'
    }
  ];

  const handleModalitySelect = (modality: ModalityOption) => {
    onModalitySelect(modality.id);
    
    // Generate story ID and navigate after a brief delay for animation
    setTimeout(() => {
      const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      router.push(`/story/${storyId}?prompt=${encodeURIComponent(storyPrompt)}&modality=${modality.id}`);
    }, 500);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-violet-300 mb-4">
          Choose Your Experience
        </h2>
        <p className="text-lg text-slate-400 mb-6">
          How would you like to experience your story?
        </p>
        
        {/* Story Preview */}
        <motion.div
          className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-violet-300 font-semibold mb-2">Your Story:</h3>
          <p className="text-slate-300 italic break-words whitespace-normal overflow-wrap-anywhere">"{storyPrompt}"</p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {modalities.map((modality, index) => (
          <motion.div
            key={modality.id}
            className="group cursor-pointer"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -10 }}
            onClick={() => handleModalitySelect(modality)}
          >
            <motion.div
              className={`backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-${modality.color}-500/50 group-hover:shadow-2xl group-hover:shadow-${modality.color}-500/20`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Icon */}
              <motion.div
                className={`text-6xl mb-6 text-center group-hover:scale-110 transition-transform duration-300`}
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {modality.icon}
              </motion.div>

              {/* Title */}
              <h3 className={`text-2xl font-bold text-${modality.color}-300 mb-4 text-center group-hover:text-${modality.color}-200 transition-colors duration-300`}>
                {modality.title}
              </h3>

              {/* Description */}
              <p className="text-slate-300 text-center leading-relaxed mb-6">
                {modality.description}
              </p>

              {/* Action Button */}
              <motion.div className="text-center">
                <motion.button
                  className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${modality.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Experience This
                </motion.button>
              </motion.div>

              {/* Hover Glow Effect */}
              <motion.div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${modality.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}
                initial={false}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Back Button */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <motion.button
          className="text-slate-400 hover:text-slate-300 transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.back()}
        >
          ← Back to Story Input
        </motion.button>
      </motion.div>
    </div>
  );
}

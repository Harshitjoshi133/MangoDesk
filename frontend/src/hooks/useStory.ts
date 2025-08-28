import { useState, useCallback } from 'react';
import { StorySegment, StoryInput, StoryProgress } from '../types/story';

export const useStory = () => {
  const [storyProgress, setStoryProgress] = useState<StoryProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initializeStory = useCallback(async (storyInput: StoryInput) => {
    setIsLoading(true);
    try {
      // TODO: Call API to generate initial story segment
      const initialSegment: StorySegment = {
        id: '1',
        text: 'Your story begins here...',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        audioUrl: '',
        choices: [
          { id: '1', text: 'Begin the journey' },
          { id: '2', text: 'Explore the surroundings' }
        ]
      };

      const progress: StoryProgress = {
        currentSegmentId: '1',
        segments: [initialSegment],
        userChoices: []
      };

      setStoryProgress(progress);
    } catch (error) {
      console.error('Failed to initialize story:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const makeChoice = useCallback(async (choiceId: string) => {
    if (!storyProgress) return;

    setIsLoading(true);
    try {
      // TODO: Call API to generate next story segment based on choice
      const newSegment: StorySegment = {
        id: (storyProgress.segments.length + 1).toString(),
        text: 'The story continues based on your choice...',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        audioUrl: '',
        choices: [
          { id: '1', text: 'Continue forward' },
          { id: '2', text: 'Take a different path' }
        ]
      };

      setStoryProgress(prev => prev ? {
        ...prev,
        currentSegmentId: newSegment.id,
        segments: [...prev.segments, newSegment],
        userChoices: [...prev.userChoices, choiceId]
      } : null);
    } catch (error) {
      console.error('Failed to make choice:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storyProgress]);

  const getCurrentSegment = useCallback(() => {
    if (!storyProgress) return null;
    return storyProgress.segments.find(segment => segment.id === storyProgress.currentSegmentId);
  }, [storyProgress]);

  return {
    storyProgress,
    isLoading,
    initializeStory,
    makeChoice,
    getCurrentSegment
  };
};

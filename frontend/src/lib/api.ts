import { StoryInput, StorySegment } from '../types/story';

// TODO: Replace with actual API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const storyApi = {
  // Generate initial story segment based on user input
  async generateInitialSegment(storyInput: StoryInput): Promise<StorySegment> {
    // TODO: Implement actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: '1',
          text: `Based on your prompt about "${storyInput.prompt}", the story begins with a ${storyInput.tone.toLowerCase()} tone and ${storyInput.visualStyle.toLowerCase()} visual style. The adventure awaits...`,
          imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          audioUrl: '', // TODO: Generate TTS audio
          choices: [
            { id: '1', text: 'Begin the journey' },
            { id: '2', text: 'Explore the surroundings' },
            { id: '3', text: 'Gather more information' }
          ]
        });
      }, 2000); // Simulate API delay
    });
  },

  // Generate next story segment based on user choice
  async generateNextSegment(choiceId: string, storyContext: any): Promise<StorySegment> {
    // TODO: Implement actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: (parseInt(storyContext.currentSegmentId) + 1).toString(),
          text: 'The story continues based on your choice. New paths unfold before you...',
          imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
          audioUrl: '', // TODO: Generate TTS audio
          choices: [
            { id: '1', text: 'Continue forward' },
            { id: '2', text: 'Take a different path' },
            { id: '3', text: 'Investigate further' }
          ]
        });
      }, 1500); // Simulate API delay
    });
  },

  // Generate TTS audio for story text
  async generateAudio(text: string, voice: string = 'default'): Promise<string> {
    // TODO: Implement actual TTS API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('https://example.com/audio.mp3'); // Placeholder audio URL
      }, 1000);
    });
  },

  // Generate image based on story description
  async generateImage(prompt: string, style: string): Promise<string> {
    // TODO: Implement actual image generation API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop');
      }, 2000);
    });
  }
};

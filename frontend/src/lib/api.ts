import { StoryInput, StorySegment } from '../types/story';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Helper function to handle API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    
    if (!response.ok) {
      let errorData;
      const responseText = await response.text();
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}\n${responseText}`);
      }
      
      const errorMessage = errorData.detail || 
                         errorData.message || 
                         `HTTP error! status: ${response.status} ${response.statusText}`;
      console.error('Error message:', errorMessage);
      throw new Error(errorMessage);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) return {};
    
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON response from server');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown network or API error';
    throw new Error(`Failed to fetch from API: ${errorMessage}`);
  }
}

export const storyApi = {
  // Upload a text file and create a story from it
  async uploadTextFile(file: File, storyInput: Omit<StoryInput, 'prompt'>): Promise<StorySegment> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.split('.')[0]);
      formData.append('story_type', storyInput.story_type);
      formData.append('language', storyInput.language);
      formData.append('culture', 'general');
      formData.append('target_age_group', 'all');

      // Make the upload request without using fetchAPI since it's a FormData request
      const response = await fetch(`${API_BASE_URL}/stories/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error uploading file');
      }

      const result = await response.json();

      // Start an interactive session with the created story
      const sessionResponse = await fetchAPI(`/interactive/start/${result.story_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': storyInput.language
        },
        body: JSON.stringify({ language: storyInput.language })
      });

      // Return the story segment
      return {
        id: sessionResponse.session_id,
        session_id: sessionResponse.session_id,
        text: result.enhanced_content,
        imageUrl: '',
        audioUrl: '',
        choices: sessionResponse.choices || [],
        current_scene: result.enhanced_content
      };
    } catch (error) {
      console.error('Error uploading text file:', error);
      throw error;
    }
  },

  // Start a new interactive story session
  async generateInitialSegment(storyInput: StoryInput): Promise<StorySegment> {
    try { 
      console.log('Creating new story with input:', storyInput);
      
      const storyResponse = await fetchAPI('/stories/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': storyInput.language
        },
        body: JSON.stringify({
          title: storyInput.prompt,
          content: storyInput.prompt,
          story_type: storyInput.story_type,
          tone: storyInput.tone,
          visual_style: storyInput.visualStyle,
          language: storyInput.language,
          culture: 'general',
          target_age_group: 'all',
          tags: []
        }),
      });
      
      if (!storyResponse.story_id) {
        throw new Error('Invalid story response: missing story_id');
      }

      console.log('Starting interactive session for story:', storyResponse.story_id);
      const sessionResponse = await fetchAPI(`/interactive/start/${storyResponse.story_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': storyInput.language
        },
        body: JSON.stringify({
          language: storyInput.language
        }),
      });
         
      if (!sessionResponse.session_id) {
        throw new Error('Invalid session response: missing session_id');
      }

      console.log('Session created:', sessionResponse);
      
      // Map the choices correctly from the response
      const choices = Array.isArray(sessionResponse.choices) 
        ? sessionResponse.choices.map((choice: any) => ({
            choice_id: String(choice.choice_id || `choice-${Math.random().toString(36).substr(2, 9)}`),
            choice_text: String(choice.choice_text || 'Continue'),
            consequence: String(choice.consequence || choice.choice_text || 'Continue the story')
          }))
        : [];
      
      // Create the initial segment with all required fields
      const segment: StorySegment = {
        id: sessionResponse.session_id,
        session_id: sessionResponse.session_id,
        text: sessionResponse.current_scene || storyResponse.enhanced_content || 'Welcome to your interactive story!',
        current_scene: sessionResponse.current_scene,
        imageUrl: '',
        audioUrl: '',
        choices: choices,
        previous_choice: undefined
      };
      
      console.log('Generated initial segment:', segment);
      return segment;
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error generating initial segment:', {
        error,
        message: errorMessage,
        input: storyInput
      });
      
      // Return a fallback segment with error information
      return {
        id: `error-${Date.now()}`,
        text: `Error: ${errorMessage}. Please try again.`,
        imageUrl: '',
        audioUrl: '',
        choices: [
          { 
            choice_id: 'retry', 
            choice_text: 'Try Again', 
            consequence: 'Retry loading the story' 
          }
        ]
      };
    }
  },

  // Generate next story segment based on user choice
  async generateNextSegment(choiceId: string, sessionId: string): Promise<StorySegment> {
    try {
      console.log('Sending request to /interactive/choose with:', { sessionId, choiceId });
      const response = await fetchAPI(`/interactive/choose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          choice_id: choiceId,
        }),
      });
      
      console.log('Received response from /interactive/choose:', response);
      
      if (!response) {
        throw new Error('Empty response from server');
      }

      // Generate image for the new scene if needed
      const currentScene = response.current_scene || response.scene || 'The story continues...';
      const imageUrl = currentScene 
        ? await this.generateImage(
            `Create an image for this story scene: ${currentScene.substring(0, 200)}`,
            'vivid'
          )
        : '';

      // Map the choices correctly from the response
      const choices = Array.isArray(response.choices) 
        ? response.choices.map((choice: any) => ({
            choice_id: String(choice.choice_id || `choice-${Math.random().toString(36).substr(2, 9)}`),
            choice_text: String(choice.choice_text || 'Continue'),
            consequence: String(choice.consequence || choice.choice_text || 'Continue the story')
          }))
        : [];

      const segment: StorySegment = {
        id: sessionId,
        text: currentScene,
        imageUrl: imageUrl,
        audioUrl: response.audio_url || '',
        session_id: sessionId,
        current_scene: currentScene,
        choices: choices,
        previous_choice: response.previous_choice
      };

      console.log('Generated segment:', segment);
      return segment;
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error generating next segment:', {
        error,
        message: errorMessage,
        choiceId,
        sessionId
      });
      
      // Return a fallback segment with error information
      return {
        id: sessionId,
        text: `Error: Could not process your choice. (${errorMessage})`,
        imageUrl: '',
        audioUrl: '',
        session_id: sessionId,
        choices: [
          { 
            choice_id: 'retry', 
            choice_text: 'Try again', 
            consequence: 'Retry the last action' 
          }
        ]
      };
    }
  },

  // Generate TTS audio for story text
  async generateAudio(text: string, voiceStyle: string = 'narrative'): Promise<string> {
    if (!text) return '';
    
    try {
      const response = await fetchAPI('/media/generate-audio', {
        method: 'POST',
        body: JSON.stringify({ 
          text: text,
          voice_style: voiceStyle,
          language: 'en',
          accent: 'us'
        }),
      });
      console.log(response);
      const audioId = response.audio_id || '';
      if (audioId) {
        return `${API_BASE_URL}/media/audio/audio_${audioId}.mp3`;
      }
      return '';
    } catch (error) {
      console.error('Error generating audio:', error);
      return '';
    }
  },

  // Generate image based on story description
  async generateImage(description: string, style: string = 'illustration'): Promise<string> {
    if (!description) return '';
    
    try {
      const response = await fetchAPI('/media/generate-visual', {
        method: 'POST',
        body: JSON.stringify({ 
          description:"String",
          story_context: description,
          style: "illustration"
        }),
      });
      
      const imageId = response.image_id || '';
      if (imageId) {
        return `${API_BASE_URL}/media/image/image_${imageId}.png`;
      }
      return '';
    } catch (error) {
      console.error('Error generating image:', error);
      return '';
    }
  }
};

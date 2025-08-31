export interface Story {
  id: string;
  title: string;
  description: string;
  coverImage: string;
}

export type StorySegment = {
  id: string;
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  choices: {
    choice_id: string;
    choice_text: string;
    consequence: string;
  }[];
  session_id?: string;
  current_scene?: string;
  previous_choice?: {
    choice_id: string;
    choice_text: string;
    consequence: string;
  };
};

export type StoryType = 'folk_tale' | 'historical' | 'mythology' | 'cultural_tradition';

export interface StoryInput {
  prompt: string;
  tone: string;
  visualStyle: string;
  story_type: StoryType;
}

export interface StoryProgress {
  currentSegmentId: string;
  segments: StorySegment[];
  userChoices: string[];
}

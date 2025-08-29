export interface Story {
  id: string;
  title: string;
  description: string;
  coverImage: string;
}

export type StorySegment = {
  id: string;
  text: string;
  imageUrl: string;
  audioUrl?: string;
  choices: {
    id: string;
    text: string;
  }[];
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

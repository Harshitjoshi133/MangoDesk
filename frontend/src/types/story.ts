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

export type LanguageCode = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ar';

export const SUPPORTED_LANGUAGES: { code: LanguageCode; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'it', name: 'Italiano (Italian)' },
  { code: 'pt', name: 'Português (Portuguese)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'ar', name: 'العربية (Arabic)' },
];

export interface StoryInput {
  prompt: string;
  tone: string;
  visualStyle: string;
  story_type: StoryType;
  language: LanguageCode;
}

export interface StoryProgress {
  currentSegmentId: string;
  segments: StorySegment[];
  userChoices: string[];
}

# Smart Cultural Storyteller

An ultra-futuristic, AI-powered interactive storytelling platform that revives cultural narratives through cutting-edge technology. Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## 🚀 Features

- **Genesis Page**: Stunning interactive story input with glassmorphism effects
- **Story Weaving Viewport**: Immersive story display with AI-generated visuals
- **Interactive Narrative**: Choose-your-own-adventure format powered by language models
- **Audio Narration**: Text-to-speech with emotion and authentic accents
- **Visual Storytelling**: AI-generated images and animations
- **Ultra-Futuristic Design**: Dark theme with neon accents (violets, cyans, magentas)
- **Fluid Animations**: Meaningful interactions with Framer Motion

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Styling**: Glassmorphism, neon effects, dark theme
- **Architecture**: Modular component structure with custom hooks

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout with metadata
│   ├── page.tsx                      # Genesis page (homepage)
│   └── story/[storyId]/page.tsx      # Story weaving viewport
├── components/
│   ├── common/                       # Generic reusable UI elements
│   ├── input/
│   │   └── StoryInputModule.tsx      # Futuristic story input interface
│   ├── viewport/
│   │   ├── VisualDisplay.tsx         # AI-generated image display
│   │   ├── NarrativeText.tsx         # Story text with typewriter effect
│   │   └── ChoicePanel.tsx           # Interactive choice buttons
│   └── audio/
│       └── AudioPlayer.tsx           # Custom TTS player
├── hooks/
│   └── useStory.ts                   # Story state management
├── lib/
│   ├── api.ts                        # API utility functions
│   └── mockData.ts                   # Mock story data
└── types/
    └── story.ts                      # TypeScript type definitions
```

## 🎨 Design System

- **Background**: Dark gradient (`bg-gradient-to-br from-slate-900 via-purple-900/20 to-black`)
- **Glassmorphism**: `backdrop-blur-xl bg-slate-800/30 border border-slate-700/50`
- **Neon Accents**: 
  - Violet: `text-violet-400`, `border-violet-500`
  - Cyan: `text-cyan-400`, `border-cyan-500`
  - Magenta: `text-magenta-400`, `border-magenta-500`
- **Animations**: Smooth transitions, hover effects, loading states
- **Typography**: Gradient text effects, proper hierarchy

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 User Flow

1. **Genesis Page** (`/`): User inputs their story idea with tone and visual style preferences
2. **Story Weaving** (`/story/[storyId]`): Immersive story experience with:
   - AI-generated visuals
   - Interactive narrative text
   - Choice-based progression
   - Audio narration

## 🔧 TypeScript Types

```typescript
interface StorySegment {
  id: string;
  text: string;
  imageUrl: string;
  audioUrl: string;
  choices: { id: string; text: string; }[];
}

interface StoryInput {
  prompt: string;
  tone: string;
  visualStyle: string;
}
```

## 🎯 Core Components

### StoryInputModule
- Futuristic textarea with neon glow effects
- Tone and visual style parameter toggles
- Animated "Begin Weaving" button with gradient effects

### VisualDisplay
- Full-screen AI-generated image display
- Loading animations with neon spinners
- Responsive design with glassmorphism borders

### NarrativeText
- Typewriter animation effect
- Glassmorphism background with blur effects
- Smooth text transitions

### ChoicePanel
- Interactive choice buttons with hover animations
- Staggered entrance animations
- Loading states for choice generation

### AudioPlayer
- Custom-designed TTS player
- Progress bar with neon styling
- Volume controls and seek functionality

## 🔮 Future Enhancements

- **AI Integration**: Connect to language models for story generation
- **Image Generation**: Integrate with DALL-E, Midjourney, or Stable Diffusion
- **TTS Services**: Implement ElevenLabs or similar for voice synthesis
- **User Accounts**: Save and share story progress
- **Multi-language Support**: International cultural stories
- **VR/AR Integration**: Immersive storytelling experiences
- **Social Features**: Share and collaborate on stories

## 🎨 Animation Philosophy

Every interaction is meaningful and purposeful:
- **Entrance Animations**: Staggered reveals for visual hierarchy
- **Hover Effects**: Subtle scaling and color transitions
- **Loading States**: Animated spinners with brand colors
- **Micro-interactions**: Button presses, form focus states
- **Page Transitions**: Smooth navigation between views

## 🌟 Key Features

- **Responsive Design**: Works seamlessly across all devices
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Optimized animations and lazy loading
- **Modular Architecture**: Reusable components and hooks
- **Type Safety**: Full TypeScript coverage

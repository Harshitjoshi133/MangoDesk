import { Story } from '../types/story';

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  return (
    <div className="group relative bg-slate-800 rounded-lg border border-slate-700 p-6 transition-all duration-300 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 cursor-pointer">
      <div className="aspect-video mb-4 overflow-hidden rounded-md">
        <img
          src={story.coverImage}
          alt={story.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors duration-300">
        {story.title}
      </h3>
      
      <p className="text-slate-300 text-sm leading-relaxed">
        {story.description}
      </p>
      
      <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-violet-500/0 to-violet-500/0 group-hover:from-violet-500/5 group-hover:to-violet-500/10 transition-all duration-300 pointer-events-none" />
    </div>
  );
}

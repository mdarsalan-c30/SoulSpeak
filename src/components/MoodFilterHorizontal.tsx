
import { Heart, Sun, Cloud, Sparkles, Zap } from 'lucide-react';

const moods = [
  { name: 'all', label: 'All', icon: null, color: 'bg-slate-100' },
  { name: 'love', label: 'Love', icon: Heart, color: 'bg-pink-100' },
  { name: 'joy', label: 'Joy', icon: Sun, color: 'bg-yellow-100' },
  { name: 'melancholy', label: 'Calm', icon: Cloud, color: 'bg-blue-100' },
  { name: 'wanderlust', label: 'Wonder', icon: Sparkles, color: 'bg-green-100' },
  { name: 'excitement', label: 'Energy', icon: Zap, color: 'bg-orange-100' },
];

interface MoodFilterHorizontalProps {
  selectedMood: string;
  onMoodChange: (mood: string) => void;
}

export const MoodFilterHorizontal = ({ selectedMood, onMoodChange }: MoodFilterHorizontalProps) => {
  return (
    <div className="flex space-x-3 overflow-x-auto pb-2 mb-4 scrollbar-hide">
      {moods.map(({ name, label, icon: Icon, color }) => (
        <button
          key={name}
          onClick={() => onMoodChange(name)}
          className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
            selectedMood === name
              ? `${color} shadow-md border-2 border-slate-300`
              : 'bg-white border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {Icon && <Icon className="w-4 h-4 text-slate-600" />}
          <span className="text-sm font-medium text-slate-700">{label}</span>
        </button>
      ))}
    </div>
  );
};


import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const moodFilters = [
  { value: 'all', label: '✨ All Feelings', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { value: 'love', label: '❤️ In Love', color: 'bg-pink-500' },
  { value: 'heartbreak', label: '💔 Heartbreak', color: 'bg-purple-500' },
  { value: 'wanderlust', label: '🌍 Wanderlust', color: 'bg-blue-500' },
  { value: 'lost', label: '😶 Lost', color: 'bg-gray-500' },
  { value: 'hopeful', label: '🌈 Hopeful', color: 'bg-yellow-500' },
  { value: 'nostalgic', label: '🍂 Nostalgic', color: 'bg-orange-500' },
  { value: 'peaceful', label: '☁️ Peaceful', color: 'bg-green-500' }
];

interface MoodFilterProps {
  selectedMood: string;
  onMoodChange: (mood: string) => void;
  className?: string;
}

export const MoodFilter = ({ selectedMood, onMoodChange, className }: MoodFilterProps) => {
  return (
    <Card className={`shadow-lg border-0 bg-white/90 backdrop-blur-sm ${className}`}>
      <CardContent className="p-6">
        <h3 className="text-slate-700 font-medium mb-4">Filter by mood</h3>
        <div className="space-y-2">
          {moodFilters.map((mood) => (
            <Button
              key={mood.value}
              variant={selectedMood === mood.value ? "default" : "ghost"}
              onClick={() => onMoodChange(mood.value)}
              className={`w-full justify-start text-sm ${
                selectedMood === mood.value
                  ? `${mood.color} text-white hover:opacity-90`
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {mood.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

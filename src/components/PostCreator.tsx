
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { Post } from '@/pages/Index';

const moods = [
  { value: 'love', label: '❤️ In Love', color: 'bg-pink-100' },
  { value: 'heartbreak', label: '💔 Heartbreak', color: 'bg-purple-100' },
  { value: 'wanderlust', label: '🌍 Wanderlust', color: 'bg-blue-100' },
  { value: 'lost', label: '😶 Lost', color: 'bg-gray-100' },
  { value: 'hopeful', label: '🌈 Hopeful', color: 'bg-yellow-100' },
  { value: 'nostalgic', label: '🍂 Nostalgic', color: 'bg-orange-100' },
  { value: 'peaceful', label: '☁️ Peaceful', color: 'bg-green-100' }
];

interface PostCreatorProps {
  onSubmit: (post: Omit<Post, 'id' | 'timestamp'>) => void;
}

export const PostCreator = ({ onSubmit }: PostCreatorProps) => {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('love');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const selectedMoodData = moods.find(m => m.value === selectedMood);
    
    onSubmit({
      content: content.trim(),
      mood: selectedMood,
      color: selectedMoodData?.color || 'bg-gray-100',
      isAnonymous,
      author: isAnonymous ? undefined : author || undefined,
      location: location || undefined
    });

    setContent('');
    setLocation('');
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-slate-700 font-medium mb-3 block">How are you feeling?</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, feelings, or a moment you're experiencing..."
              className="min-h-[100px] border-slate-200 focus:ring-purple-400 resize-none"
            />
          </div>

          <div>
            <Label className="text-slate-700 font-medium mb-3 block">Choose your mood</Label>
            <div className="grid grid-cols-1 gap-2">
              {moods.map((mood) => (
                <label
                  key={mood.value}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                    selectedMood === mood.value
                      ? `${mood.color} border-2 border-slate-300`
                      : 'hover:bg-slate-50 border-2 border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="mood"
                    value={mood.value}
                    checked={selectedMood === mood.value}
                    onChange={(e) => setSelectedMood(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{mood.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you? (optional)"
              className="border-slate-200 focus:ring-purple-400"
            />
          </div>

          <div className="flex items-center space-x-3 py-2">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous" className="text-sm text-slate-600">
              Post anonymously
            </Label>
          </div>

          {!isAnonymous && (
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name (optional)"
              className="border-slate-200 focus:ring-purple-400"
            />
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            disabled={!content.trim()}
          >
            Share Your Soul
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

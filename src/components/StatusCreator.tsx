
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Sparkles, Cloud, Sun, Zap, Mic, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const moods = [
  { name: 'love', color: 'bg-pink-100', icon: Heart, emoji: '💖' },
  { name: 'joy', color: 'bg-yellow-100', icon: Sun, emoji: '😊' },
  { name: 'melancholy', color: 'bg-blue-100', icon: Cloud, emoji: '😔' },
  { name: 'wanderlust', color: 'bg-green-100', icon: Sparkles, emoji: '✨' },
  { name: 'excitement', color: 'bg-orange-100', icon: Zap, emoji: '⚡' },
];

interface StatusCreatorProps {
  onStatusCreated: () => void;
}

export const StatusCreator = ({ onStatusCreated }: StatusCreatorProps) => {
  const [selectedMood, setSelectedMood] = useState('love');
  const [content, setContent] = useState('');
  const [emoji, setEmoji] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to share status",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim() && !emoji && !audioFile) {
      toast({
        title: "Empty status",
        description: "Please add some content to your status",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let audioUrl = null;
      
      if (audioFile) {
        const fileExt = audioFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, audioFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);
        
        audioUrl = publicUrl;
      }

      const selectedMoodData = moods.find(m => m.name === selectedMood);
      
      const { error } = await supabase
        .from('status_updates')
        .insert({
          user_id: user.id,
          content: content.trim() || null,
          mood: selectedMood,
          color: selectedMoodData?.color || 'bg-gray-100',
          emoji: emoji || selectedMoodData?.emoji,
          audio_url: audioUrl
        });

      if (error) throw error;

      // Reset form
      setContent('');
      setEmoji('');
      setAudioFile(null);
      
      toast({
        title: "Status shared!",
        description: "Your mood has been shared with everyone ✨"
      });

      onStatusCreated();
    } catch (error) {
      console.error('Error creating status:', error);
      toast({
        title: "Error",
        description: "Failed to share status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-serif">
            {user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1">
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 10))}
              placeholder="Share your mood... (10 chars max)"
              className="border-0 bg-transparent text-lg placeholder:text-slate-400 focus:ring-0"
              maxLength={10}
            />
            <p className="text-xs text-slate-400 mt-1">{content.length}/10 characters</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            {moods.map(({ name, color, icon: Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedMood(name)}
                className={`p-2 rounded-full transition-all ${
                  selectedMood === name
                    ? `${color} shadow-md scale-110`
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-600" />
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="😊"
              className="w-12 h-8 text-center border-0 bg-slate-50"
              maxLength={2}
            />
            
            <label className="cursor-pointer">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <div className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                <Mic className="w-4 h-4 text-slate-600" />
              </div>
            </label>
          </div>
        </div>

        {audioFile && (
          <div className="mb-4 p-2 bg-slate-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-slate-600">🎵 {audioFile.name}</span>
            <button
              onClick={() => setAudioFile(null)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && !emoji && !audioFile)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          {isSubmitting ? 'Sharing...' : 'Share Status'}
        </Button>
      </CardContent>
    </Card>
  );
};

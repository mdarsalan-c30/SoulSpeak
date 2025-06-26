
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MediaUpload } from './MediaUpload';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  const [location, setLocation] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      const selectedMoodData = moods.find(m => m.value === selectedMood);
      
      const postData = {
        content: content.trim(),
        mood: selectedMood,
        color: selectedMoodData?.color || 'bg-gray-100',
        is_anonymous: isAnonymous,
        location: location || null,
        media_url: mediaUrl || null,
        media_type: mediaType || null,
        user_id: user?.id
      };

      if (user) {
        // Save to database if user is logged in and database is set up
        try {
          // Type assertion to bypass TypeScript errors until database is set up
          const { error } = await (supabase as any)
            .from('posts')
            .insert([postData]);

          if (error) {
            if (error.message.includes('relation "public.posts" does not exist')) {
              toast({
                title: "Database not set up",
                description: "Please run the SQL migration first. Your post will be saved locally for now.",
                variant: "destructive"
              });
              // Fall back to local state
              onSubmit({
                content: postData.content,
                mood: postData.mood,
                color: postData.color,
                isAnonymous: postData.is_anonymous,
                location: postData.location,
                author: undefined
              });
            } else {
              throw error;
            }
          } else {
            toast({
              title: "Post shared successfully!",
              description: "Your feeling has been shared with the community."
            });
          }
        } catch (error) {
          console.error('Database error, falling back to local state:', error);
          // Fall back to local state
          onSubmit({
            content: postData.content,
            mood: postData.mood,
            color: postData.color,
            isAnonymous: postData.is_anonymous,
            location: postData.location,
            author: undefined
          });
        }
      } else {
        // Local state for non-authenticated users
        onSubmit({
          content: postData.content,
          mood: postData.mood,
          color: postData.color,
          isAnonymous: postData.is_anonymous,
          location: postData.location,
          author: undefined
        });
      }

      // Reset form
      setContent('');
      setLocation('');
      setMediaUrl('');
      setMediaType('');
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error sharing post",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUpload = (url: string, type: string) => {
    setMediaUrl(url);
    setMediaType(type);
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardContent className="p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-slate-700 font-medium mb-3 block">How are you feeling?</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, feelings, or a moment you're experiencing..."
              className="min-h-[80px] md:min-h-[100px] border-slate-200 focus:ring-purple-400 resize-none text-sm md:text-base"
            />
          </div>

          <div>
            <Label className="text-slate-700 font-medium mb-3 block">Choose your mood</Label>
            <div className="grid grid-cols-1 gap-2">
              {moods.map((mood) => (
                <label
                  key={mood.value}
                  className={`flex items-center p-2 md:p-3 rounded-lg cursor-pointer transition-all text-sm md:text-base ${
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
                  <span className="font-medium">{mood.label}</span>
                </label>
              ))}
            </div>
          </div>

          {user && (
            <MediaUpload 
              onMediaUpload={handleMediaUpload}
              currentMedia={mediaUrl ? { url: mediaUrl, type: mediaType } : null}
            />
          )}

          <div>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you? (optional)"
              className="border-slate-200 focus:ring-purple-400 text-sm md:text-base"
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

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 text-sm md:text-base py-2 md:py-3"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? 'Sharing...' : 'Share Your Soul'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MapPin, Heart, Sparkles, Cloud, Sun, Zap } from 'lucide-react';
import { MediaUpload } from '@/components/MediaUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Post } from '@/pages/Index';

const moods = [
  { name: 'love', color: 'bg-pink-100', icon: Heart },
  { name: 'joy', color: 'bg-yellow-100', icon: Sun },
  { name: 'melancholy', color: 'bg-blue-100', icon: Cloud },
  { name: 'wanderlust', color: 'bg-green-100', icon: Sparkles },
  { name: 'excitement', color: 'bg-orange-100', icon: Zap },
];

interface PostCreatorProps {
  onSubmit: (post: Omit<Post, 'id' | 'timestamp'>) => void;
  onPostSaved?: () => void;
}

export const PostCreator = ({ onSubmit, onPostSaved }: PostCreatorProps) => {
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedMood, setSelectedMood] = useState('love');
  const [media, setMedia] = useState<{ url: string; type: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedMoodData = moods.find(m => m.name === selectedMood);
      const postData = {
        content: content.trim(),
        mood: selectedMood,
        color: selectedMoodData?.color || 'bg-gray-100',
        is_anonymous: isAnonymous,
        location: location.trim() || null,
        media_url: media?.url || null,
        media_type: media?.type || null,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create local post for immediate UI update
      const localPost: Omit<Post, 'id' | 'timestamp'> = {
        content: content.trim(),
        mood: selectedMood,
        color: selectedMoodData?.color || 'bg-gray-100',
        isAnonymous,
        location: location.trim() || undefined,
        mediaUrl: media?.url,
        mediaType: media?.type,
        author: isAnonymous ? undefined : user.email?.split('@')[0]
      };

      onSubmit(localPost);
      onPostSaved?.(); // Trigger refresh of posts

      // Reset form
      setContent('');
      setLocation('');
      setMedia(null);
      
      toast({
        title: "Post created!",
        description: "Your feelings have been shared."
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUpload = (url: string, type: string) => {
    if (url && type) {
      setMedia({ url, type });
    } else {
      setMedia(null);
    }
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block">
              How are you feeling?
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {moods.map(({ name, color, icon: Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedMood(name)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedMood === name
                      ? `${color} border-slate-300 shadow-md`
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1 text-slate-600" />
                  <div className="text-xs text-slate-700 capitalize">{name}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share what's on your heart..."
              className="min-h-[120px] resize-none border-slate-200 focus:border-purple-300"
            />
          </div>

          <div className="flex items-center space-x-3">
            <MapPin className="w-4 h-4 text-slate-500" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you? (optional)"
              className="flex-1 border-slate-200 focus:border-purple-300"
            />
          </div>

          <MediaUpload onMediaUpload={handleMediaUpload} currentMedia={media} />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Switch
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
                id="anonymous"
              />
              <Label htmlFor="anonymous" className="text-sm text-slate-600">
                Share anonymously
              </Label>
            </div>
            
            <Button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6"
            >
              {isSubmitting ? 'Sharing...' : 'Share'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

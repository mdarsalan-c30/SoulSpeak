
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MapPin, Heart, Sparkles, Cloud, Sun, Zap, Image, Music } from 'lucide-react';
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
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
      let mediaUrl = null;
      let mediaType = null;

      // Upload image if present
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);
        
        mediaUrl = publicUrl;
        mediaType = 'image';
      }
      // Upload audio if present and no image
      else if (audioFile) {
        const fileExt = audioFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, audioFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);
        
        mediaUrl = publicUrl;
        mediaType = 'audio';
      }

      const selectedMoodData = moods.find(m => m.name === selectedMood);
      const postData = {
        content: content.trim(),
        mood: selectedMood,
        color: selectedMoodData?.color || 'bg-gray-100',
        is_anonymous: isAnonymous,
        location: location.trim() || null,
        media_url: mediaUrl,
        media_type: mediaType,
        user_id: user.id
      };

      console.log('Submitting post data:', postData);

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();

      if (error) {
        console.error('Post creation error:', error);
        throw error;
      }

      console.log('Post created successfully:', data);

      // Reset form
      setContent('');
      setLocation('');
      setImageFile(null);
      setAudioFile(null);
      
      toast({
        title: "Post created!",
        description: "Your feelings have been shared."
      });

      // Trigger refresh of posts feed
      if (onPostSaved) {
        onPostSaved();
      }
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

          {/* Media Upload Section */}
          <div className="space-y-3">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setImageFile(e.target.files?.[0] || null);
                      if (e.target.files?.[0]) setAudioFile(null);
                    }}
                    className="hidden"
                  />
                  <div className="flex items-center space-x-2 p-3 border-2 border-dashed border-slate-200 rounded-lg hover:border-purple-300 transition-colors">
                    <Image className="w-5 h-5 text-slate-500" />
                    <span className="text-sm text-slate-600">Add Image</span>
                  </div>
                </label>
              </div>
              
              <div className="flex-1">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      setAudioFile(e.target.files?.[0] || null);
                      if (e.target.files?.[0]) setImageFile(null);
                    }}
                    className="hidden"
                  />
                  <div className="flex items-center space-x-2 p-3 border-2 border-dashed border-slate-200 rounded-lg hover:border-purple-300 transition-colors">
                    <Music className="w-5 h-5 text-slate-500" />
                    <span className="text-sm text-slate-600">Add Audio</span>
                  </div>
                </label>
              </div>
            </div>

            {/* File previews */}
            {imageFile && (
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-slate-600">🖼️ {imageFile.name}</span>
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            )}

            {audioFile && (
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-slate-600">🎵 {audioFile.name}</span>
                <button
                  type="button"
                  onClick={() => setAudioFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

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

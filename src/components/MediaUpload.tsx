
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Music, Video, X } from 'lucide-react';

interface MediaUploadProps {
  onMediaUpload: (url: string, type: string) => void;
  currentMedia?: { url: string; type: string } | null;
}

export const MediaUpload = ({ onMediaUpload, currentMedia }: MediaUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file type
    const isAudio = file.type.startsWith('audio/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isAudio && !isVideo) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio or video file",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 50MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Type assertion to bypass TypeScript errors until storage is set up
      const { error: uploadError } = await (supabase.storage as any)
        .from('media')
        .upload(fileName, file);

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          toast({
            title: "Storage not set up",
            description: "Please run the SQL migration first to create the media storage bucket.",
            variant: "destructive"
          });
          return;
        }
        throw uploadError;
      }

      const { data } = (supabase.storage as any).from('media').getPublicUrl(fileName);
      
      onMediaUpload(data.publicUrl, isAudio ? 'audio' : 'video');
      
      toast({
        title: "Success!",
        description: "Media uploaded successfully"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload media. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = () => {
    onMediaUpload('', '');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Uploading...' : 'Add Music/Video'}</span>
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {currentMedia && currentMedia.url && (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-2">
            {currentMedia.type === 'audio' ? (
              <Music className="w-4 h-4 text-purple-500" />
            ) : (
              <Video className="w-4 h-4 text-purple-500" />
            )}
            <span className="text-sm text-slate-600">
              {currentMedia.type === 'audio' ? 'Audio' : 'Video'} attached
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeMedia}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};


import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Music, Play, Pause } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Status {
  id: string;
  content: string | null;
  mood: string;
  color: string;
  emoji: string | null;
  audio_url: string | null;
  like_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export const StatusFeed = () => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [likedStatuses, setLikedStatuses] = useState<Set<string>>(new Set());
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{[key: string]: HTMLAudioElement}>({});
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchStatuses();
    if (user) {
      fetchLikedStatuses();
    }
  }, [user]);

  const fetchStatuses = async () => {
    try {
      // First get the status updates
      const { data: statusData, error: statusError } = await supabase
        .from('status_updates')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (statusError) throw statusError;

      if (!statusData || statusData.length === 0) {
        setStatuses([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(statusData.map(status => status.user_id))];

      // Fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue with statuses but without profile data
      }

      // Combine the data
      const statusesWithProfiles = statusData.map(status => ({
        ...status,
        profiles: profilesData?.find(profile => profile.id === status.user_id) || null
      }));

      setStatuses(statusesWithProfiles);
    } catch (error) {
      console.error('Error fetching statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedStatuses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('status_likes')
        .select('status_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      setLikedStatuses(new Set(data.map(like => like.status_id)));
    } catch (error) {
      console.error('Error fetching liked statuses:', error);
    }
  };

  const handleLike = async (statusId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like statuses",
        variant: "destructive"
      });
      return;
    }

    const isLiked = likedStatuses.has(statusId);

    try {
      if (isLiked) {
        await supabase
          .from('status_likes')
          .delete()
          .eq('status_id', statusId)
          .eq('user_id', user.id);
        
        setLikedStatuses(prev => {
          const newSet = new Set(prev);
          newSet.delete(statusId);
          return newSet;
        });
        
        setStatuses(prev => 
          prev.map(status => 
            status.id === statusId 
              ? { ...status, like_count: Math.max(0, status.like_count - 1) }
              : status
          )
        );
      } else {
        await supabase
          .from('status_likes')
          .insert({ status_id: statusId, user_id: user.id });
        
        setLikedStatuses(prev => new Set([...prev, statusId]));
        
        setStatuses(prev => 
          prev.map(status => 
            status.id === statusId 
              ? { ...status, like_count: status.like_count + 1 }
              : status
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    }
  };

  const toggleAudio = (statusId: string, audioUrl: string) => {
    if (playingAudio === statusId) {
      // Stop current audio
      if (audioElements[statusId]) {
        audioElements[statusId].pause();
        audioElements[statusId].currentTime = 0;
      }
      setPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      if (playingAudio && audioElements[playingAudio]) {
        audioElements[playingAudio].pause();
        audioElements[playingAudio].currentTime = 0;
      }
      
      // Create or get audio element
      let audio = audioElements[statusId];
      if (!audio) {
        audio = new Audio(audioUrl);
        audio.onended = () => setPlayingAudio(null);
        setAudioElements(prev => ({ ...prev, [statusId]: audio }));
      }
      
      // Play new audio
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Error",
          description: "Failed to play audio",
          variant: "destructive"
        });
      });
      
      setPlayingAudio(statusId);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex space-x-3 overflow-x-auto pb-4 mb-6 px-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-16 h-24 bg-gradient-to-b from-gray-200 to-gray-300 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (statuses.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 px-4">
        <div className="text-4xl mb-2">✨</div>
        <p>No status updates yet</p>
      </div>
    );
  }

  return (
    <div className="flex space-x-3 overflow-x-auto pb-4 mb-6 px-4 scrollbar-hide">
      {statuses.map((status) => (
        <div
          key={status.id}
          className={`flex-shrink-0 w-16 h-24 rounded-xl p-2 ${status.color} border-2 ${
            user?.id === status.user_id ? 'border-purple-400 ring-2 ring-purple-200' : 'border-white/50'
          } relative cursor-pointer hover:scale-105 transition-all duration-200 shadow-lg`}
          style={{
            background: `linear-gradient(135deg, ${status.color.replace('bg-', 'var(--')}), ${status.color.replace('bg-', 'var(--')}-600)`
          }}
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold mb-1 mx-auto border-2 border-white/30 shadow-sm">
            {status.profiles?.avatar_url ? (
              <img 
                src={status.profiles.avatar_url} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-slate-700">
                {status.profiles?.username?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="text-center flex-1 flex flex-col items-center justify-center">
            {status.emoji && (
              <div className="text-sm mb-1">{status.emoji}</div>
            )}
            {status.content && (
              <p className="text-xs text-white font-semibold truncate max-w-full drop-shadow-sm">
                {status.content}
              </p>
            )}
          </div>

          {/* Audio button */}
          {status.audio_url && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleAudio(status.id, status.audio_url);
              }}
              className="absolute bottom-8 right-1 p-1 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"
            >
              {playingAudio === status.id ? (
                <Pause className="w-3 h-3 text-purple-600" />
              ) : (
                <Play className="w-3 h-3 text-purple-600" />
              )}
            </button>
          )}

          {/* Like button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike(status.id);
            }}
            className="absolute bottom-1 right-1 p-1 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"
          >
            <Heart 
              className={`w-3 h-3 ${
                likedStatuses.has(status.id) ? 'fill-red-500 text-red-500' : 'text-slate-600'
              }`} 
            />
          </button>

          {/* Like count */}
          {status.like_count > 0 && (
            <div className="absolute top-1 right-1 text-xs bg-white/90 rounded-full px-1.5 py-0.5 text-slate-700 font-bold shadow-sm">
              {status.like_count}
            </div>
          )}

          {/* Time */}
          <div className="absolute bottom-1 left-1 text-xs text-white/90 bg-black/20 rounded-full px-1.5 py-0.5 font-medium">
            {formatTimeAgo(status.created_at)}
          </div>
        </div>
      ))}
    </div>
  );
};

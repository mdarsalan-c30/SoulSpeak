
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
      const { data, error } = await supabase
        .from('status_updates')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setStatuses(data || []);
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

  const toggleAudio = (statusId: string) => {
    if (playingAudio === statusId) {
      setPlayingAudio(null);
    } else {
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
      <div className="flex space-x-4 overflow-x-auto pb-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-20 h-28 bg-slate-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (statuses.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <div className="text-4xl mb-2">✨</div>
        <p>No status updates yet</p>
      </div>
    );
  }

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4 mb-6 scrollbar-hide">
      {statuses.map((status) => (
        <div
          key={status.id}
          className={`flex-shrink-0 w-20 h-28 rounded-xl p-3 ${status.color} border-2 ${
            user?.id === status.user_id ? 'border-purple-400' : 'border-transparent'
          } relative cursor-pointer hover:scale-105 transition-transform`}
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-medium mb-2 mx-auto">
            {status.profiles?.avatar_url ? (
              <img 
                src={status.profiles.avatar_url} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-slate-600">
                {status.profiles?.username?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="text-center">
            {status.emoji && (
              <div className="text-lg mb-1">{status.emoji}</div>
            )}
            {status.content && (
              <p className="text-xs text-slate-700 font-medium truncate">
                {status.content}
              </p>
            )}
            {status.audio_url && (
              <button
                onClick={() => toggleAudio(status.id)}
                className="mt-1 p-1 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
              >
                {playingAudio === status.id ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
              </button>
            )}
          </div>

          {/* Like button */}
          <button
            onClick={() => handleLike(status.id)}
            className="absolute bottom-1 right-1 p-1 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
          >
            <Heart 
              className={`w-3 h-3 ${
                likedStatuses.has(status.id) ? 'fill-red-500 text-red-500' : 'text-slate-600'
              }`} 
            />
          </button>

          {/* Like count */}
          {status.like_count > 0 && (
            <div className="absolute top-1 right-1 text-xs bg-white/80 rounded-full px-1 py-0.5 text-slate-600">
              {status.like_count}
            </div>
          )}

          {/* Time */}
          <div className="absolute bottom-1 left-1 text-xs text-slate-500 bg-white/50 rounded px-1">
            {formatTimeAgo(status.created_at)}
          </div>

          {/* Audio player */}
          {status.audio_url && playingAudio === status.id && (
            <audio
              autoPlay
              onEnded={() => setPlayingAudio(null)}
              className="hidden"
            >
              <source src={status.audio_url} />
            </audio>
          )}
        </div>
      ))}
    </div>
  );
};

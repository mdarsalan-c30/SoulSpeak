
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PostActionsProps {
  postId: string;
  authorId?: string;
  isAnonymous: boolean;
  initialLikeCount: number;
  onShare?: () => void;
  onComment?: () => void;
}

export const PostActions = ({ postId, authorId, isAnonymous, initialLikeCount, onShare, onComment }: PostActionsProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount || 0);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkLikeStatus();
      if (!isAnonymous && authorId && authorId !== user.id) {
        checkFollowStatus();
      }
    }
  }, [user, postId, authorId]);

  const checkLikeStatus = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();
      
      setLiked(!!data);
    } catch (error) {
      // No like found, which is fine
      setLiked(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !authorId || authorId === user.id) return;
    
    try {
      const { data } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', authorId)
        .single();
      
      setFollowing(!!data);
    } catch (error) {
      // No follow found, which is fine
      setFollowing(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (liked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;
        
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user || !authorId) return;

    setLoading(true);
    try {
      if (following) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', authorId);

        if (error) throw error;
        
        setFollowing(false);
        toast({
          title: "Unfollowed",
          description: "You are no longer following this soul",
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({ follower_id: user.id, following_id: authorId });

        if (error) throw error;
        
        setFollowing(true);
        toast({
          title: "Following",
          description: "You are now following this beautiful soul ✨",
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SoulSpeak Post',
          text: 'Check out this heartfelt post on SoulSpeak',
          url: window.location.href
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard"
      });
    }
    onShare?.();
  };

  return (
    <div className="space-y-2">
      {/* Action Buttons Row - Instagram Style */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={loading}
            className={`p-2 hover:bg-gray-100 transition-all duration-200 ${
              liked ? 'text-red-500' : 'text-slate-700'
            }`}
          >
            <Heart className={`w-6 h-6 ${liked ? 'fill-current animate-pulse' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onComment}
            className="p-2 text-slate-700 hover:bg-gray-100 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="p-2 text-slate-700 hover:bg-gray-100 transition-colors"
          >
            <Send className="w-6 h-6" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-slate-700 hover:bg-gray-100 transition-colors"
        >
          <Bookmark className="w-6 h-6" />
        </Button>
      </div>

      {/* Like Count */}
      {likeCount > 0 && (
        <div className="px-2">
          <span className="text-sm font-semibold text-slate-900">
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </span>
        </div>
      )}

      {/* Follow Button for Non-Anonymous Posts */}
      {!isAnonymous && authorId && user && authorId !== user.id && (
        <div className="px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFollow}
            disabled={loading}
            className={`text-sm font-semibold ${
              following 
                ? 'text-slate-500 hover:text-slate-700' 
                : 'text-blue-500 hover:text-blue-700'
            }`}
          >
            {following ? 'Following' : 'Follow'}
          </Button>
        </div>
      )}
    </div>
  );
};

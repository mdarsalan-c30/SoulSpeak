import { Card, CardContent } from '@/components/ui/card';
import { Music, Video, Globe2 } from 'lucide-react';
import { PostActions } from '@/components/PostActions';
import type { Post } from '@/pages/Index';

interface PostsFeedProps {
  posts: Post[];
}

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours === 1) return '1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return '1 day ago';
  return `${diffInDays} days ago`;
};

const getMoodEmoji = (mood: string) => {
  const moodMap = {
    love: '❤️',
    joy: '☀️',
    melancholy: '☁️',
    wanderlust: '🌍',
    excitement: '⚡',
    heartbreak: '💔',
    lost: '😶',
    hopeful: '🌈',
    nostalgic: '🍂',
    peaceful: '☁️'
  };
  return moodMap[mood as keyof typeof moodMap] || '✨';
};

const getMoodGradient = (mood: string) => {
  const gradients = {
    love: 'from-pink-100 via-rose-50 to-red-50',
    joy: 'from-yellow-100 via-amber-50 to-orange-50',
    melancholy: 'from-blue-100 via-indigo-50 to-purple-50',
    wanderlust: 'from-green-100 via-emerald-50 to-teal-50',
    excitement: 'from-orange-100 via-yellow-50 to-red-50'
  };
  return gradients[mood as keyof typeof gradients] || 'from-gray-50 via-slate-50 to-gray-100';
};

export const PostsFeed = ({ posts }: PostsFeedProps) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-8xl mb-6 opacity-40">🤍</div>
        <h3 className="text-2xl font-serif text-slate-600 mb-3">No souls have spoken yet</h3>
        <p className="text-slate-500">Be the first to share your beautiful feelings</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {posts.map((post) => (
        <Card
          key={post.id}
          className="border-0 shadow-none border-b border-gray-100 rounded-none bg-white"
        >
          <CardContent className="p-0">
            {/* Post Header */}
            <div className="p-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-serif shadow-sm">
                    {post.isAnonymous ? '🎭' : (post.author?.[0]?.toUpperCase() || '?')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {post.isAnonymous ? 'Anonymous Soul' : (post.author || 'Unknown Soul')}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                      <span>{formatTimeAgo(post.timestamp)}</span>
                      {post.location && (
                        <>
                          <span>•</span>
                          <span>📍 {post.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-lg">{getMoodEmoji(post.mood)}</div>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
              <p className="text-slate-800 leading-relaxed">
                {post.content}
              </p>
            </div>
            
            {/* Media Content */}
            {post.mediaUrl && (
              <div className="mb-3">
                {post.mediaType === 'image' ? (
                  <img 
                    src={post.mediaUrl} 
                    alt="Post content"
                    className="w-full max-h-96 object-cover"
                  />
                ) : post.mediaType === 'audio' ? (
                  <div className="px-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                        <Music className="w-5 h-5 text-white" />
                      </div>
                      <audio controls className="flex-1">
                        <source src={post.mediaUrl} />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            
            {/* Post Actions */}
            <div className="px-4 pb-4">
              <PostActions
                postId={post.id}
                authorId={post.authorId}
                isAnonymous={post.isAnonymous}
                initialLikeCount={post.likeCount || 0}
                onComment={() => console.log('Comment clicked for post:', post.id)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

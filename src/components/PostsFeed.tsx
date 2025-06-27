
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
      <div className="text-center py-16">
        <div className="text-8xl mb-6 opacity-40">🤍</div>
        <h3 className="text-2xl font-serif text-slate-600 mb-3">No souls have spoken yet</h3>
        <p className="text-slate-500">Be the first to share your beautiful feelings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-serif text-slate-800 flex items-center">
          <Globe2 className="w-6 h-6 mr-2 text-purple-500" />
          Soul Feed
        </h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-500">{posts.length} souls speaking</span>
        </div>
      </div>
      
      {posts.map((post) => (
        <Card
          key={post.id}
          className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in bg-gradient-to-br ${getMoodGradient(post.mood)} backdrop-blur-sm`}
        >
          <CardContent className="p-0">
            {/* Post Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-serif text-lg shadow-md">
                    {post.isAnonymous ? '🎭' : (post.author?.[0]?.toUpperCase() || '?')}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {post.isAnonymous ? 'Anonymous Soul' : (post.author || 'Unknown Soul')}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <span>{formatTimeAgo(post.timestamp)}</span>
                      {post.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center">
                            📍 {post.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">{getMoodEmoji(post.mood)}</div>
                  <span className="text-sm font-medium text-slate-700 capitalize bg-white/50 px-3 py-1 rounded-full">
                    {post.mood}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-6 pb-4">
              <p className="text-slate-800 leading-relaxed text-base">
                {post.content}
              </p>
            </div>
            
            {/* Media Content */}
            {post.mediaUrl && (
              <div className="px-6 pb-4">
                {post.mediaType === 'audio' ? (
                  <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <audio controls className="flex-1">
                      <source src={post.mediaUrl} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : post.mediaType === 'video' ? (
                  <div className="rounded-xl overflow-hidden shadow-md">
                    <video controls className="w-full max-h-80 object-cover">
                      <source src={post.mediaUrl} />
                      Your browser does not support the video element.
                    </video>
                  </div>
                ) : null}
              </div>
            )}
            
            {/* Post Actions */}
            <div className="px-6 pb-6">
              <PostActions
                postId={post.id}
                authorId={post.isAnonymous ? undefined : post.author}
                isAnonymous={post.isAnonymous}
                initialLikeCount={post.likeCount || 0}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

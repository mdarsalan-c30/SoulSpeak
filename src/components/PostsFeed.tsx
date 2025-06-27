
import { Card, CardContent } from '@/components/ui/card';
import { Music, Video, Globe2, MoreHorizontal } from 'lucide-react';
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
    <div className="space-y-0 bg-white">
      {posts.map((post) => (
        <Card
          key={post.id}
          className="border-0 shadow-none border-b border-gray-100 rounded-none bg-white"
        >
          <CardContent className="p-0">
            {/* Post Header - Instagram Style */}
            <div className="flex items-center justify-between p-4 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                  {post.isAnonymous ? '🎭' : (post.author?.[0]?.toUpperCase() || '?')}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      {post.isAnonymous ? 'Anonymous Soul' : (post.author || 'Unknown Soul')}
                    </span>
                    {post.location && (
                      <span className="text-xs text-slate-500">• 📍 {post.location}</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{formatTimeAgo(post.timestamp)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-lg">{getMoodEmoji(post.mood)}</div>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Media Content - Full Width */}
            {post.mediaUrl && (
              <div className="w-full">
                {post.mediaType === 'image' ? (
                  <img 
                    src={post.mediaUrl} 
                    alt="Post content"
                    className="w-full max-h-96 object-cover"
                  />
                ) : post.mediaType === 'audio' ? (
                  <div className="px-4 pb-3">
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <audio controls className="w-full">
                          <source src={post.mediaUrl} />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Post Actions */}
            <div className="px-4 pb-2">
              <PostActions
                postId={post.id}
                authorId={post.authorId}
                isAnonymous={post.isAnonymous}
                initialLikeCount={post.likeCount || 0}
                onComment={() => console.log('Comment clicked for post:', post.id)}
              />
            </div>

            {/* Post Content */}
            <div className="px-4 pb-4">
              <p className="text-slate-800 leading-relaxed text-sm">
                <span className="font-semibold text-slate-900">
                  {post.isAnonymous ? 'Anonymous Soul' : (post.author || 'Unknown Soul')}
                </span>{' '}
                {post.content}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

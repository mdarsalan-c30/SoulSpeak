
import { Card, CardContent } from '@/components/ui/card';
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
    heartbreak: '💔',
    wanderlust: '🌍',
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
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🤍</div>
        <h3 className="text-xl font-medium text-slate-600 mb-2">No posts yet</h3>
        <p className="text-slate-500">Be the first to share your feelings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif text-slate-800">Recent Souls</h2>
        <span className="text-sm text-slate-500">{posts.length} posts</span>
      </div>
      
      {posts.map((post) => (
        <Card
          key={post.id}
          className={`${post.color} border-0 shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in`}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getMoodEmoji(post.mood)}</span>
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {post.mood}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {formatTimeAgo(post.timestamp)}
              </span>
            </div>
            
            <p className="text-slate-800 leading-relaxed mb-4 text-base">
              {post.content}
            </p>
            
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-4">
                <span>
                  {post.isAnonymous ? 'Anonymous soul' : `by ${post.author || 'Unknown'}`}
                </span>
                {post.location && (
                  <span className="flex items-center space-x-1">
                    <span>📍</span>
                    <span>{post.location}</span>
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

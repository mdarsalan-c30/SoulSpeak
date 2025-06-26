import { useState, useEffect } from 'react';
import { PostCreator } from '@/components/PostCreator';
import { MoodFilter } from '@/components/MoodFilter';
import { PostsFeed } from '@/components/PostsFeed';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Post {
  id: string;
  content: string;
  mood: string;
  color: string;
  isAnonymous: boolean;
  author?: string;
  timestamp: Date;
  location?: string;
  mediaUrl?: string;
  mediaType?: string;
}

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      console.log('Fetching posts...');
      
      // First, get all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Posts fetch error:', postsError);
        setPosts([]);
        return;
      }

      console.log('Raw posts data:', postsData);

      if (!postsData || postsData.length === 0) {
        console.log('No posts found');
        setPosts([]);
        return;
      }

      // Get unique user IDs from non-anonymous posts
      const userIds = [...new Set(
        postsData
          .filter(post => !post.is_anonymous && post.user_id)
          .map(post => post.user_id)
      )];

      // Fetch usernames for non-anonymous posts
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (profilesError) {
          console.error('Profiles fetch error:', profilesError);
        } else {
          profiles = profilesData || [];
        }
      }

      // Map posts with usernames
      const formattedPosts: Post[] = postsData.map((post: any) => {
        const profile = profiles.find(p => p.id === post.user_id);
        
        return {
          id: post.id,
          content: post.content,
          mood: post.mood,
          color: post.color,
          isAnonymous: post.is_anonymous,
          author: post.is_anonymous ? undefined : (profile?.username || 'Unknown User'),
          timestamp: new Date(post.created_at),
          location: post.location,
          mediaUrl: post.media_url,
          mediaType: post.media_type
        };
      });

      console.log('Formatted posts:', formattedPosts);
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSaved = () => {
    console.log('Post saved, refreshing feed...');
    fetchPosts();
  };

  const addPost = (newPost: Omit<Post, 'id' | 'timestamp'>) => {
    const post: Post = {
      ...newPost,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setPosts([post, ...posts]);
  };

  const filteredPosts = selectedMood === 'all' 
    ? posts 
    : posts.filter(post => post.mood === selectedMood);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-serif text-slate-800 mb-4">SoulSpeak</h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-4">
            A safe space for your unsaid feelings. Share anonymously, connect authentically, express freely.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Post Creator */}
          <div className="lg:col-span-1 space-y-6">
            <PostCreator onSubmit={addPost} onPostSaved={handlePostSaved} />
            <MoodFilter 
              selectedMood={selectedMood} 
              onMoodChange={setSelectedMood}
            />
          </div>

          {/* Right Column - Posts Feed */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">💭</div>
                <p className="text-slate-600">Loading feelings...</p>
              </div>
            ) : (
              <PostsFeed posts={filteredPosts} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;


import { useState, useEffect } from 'react';
import { MoodFilterHorizontal } from '@/components/MoodFilterHorizontal';
import { PostsFeed } from '@/components/PostsFeed';
import { Header } from '@/components/Header';
import { FloatingAddButton } from '@/components/FloatingAddButton';
import { StatusCreator } from '@/components/StatusCreator';
import { StatusFeed } from '@/components/StatusFeed';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Post {
  id: string;
  content: string;
  mood: string;
  color: string;
  isAnonymous: boolean;
  author?: string;
  authorId?: string;
  timestamp: Date;
  location?: string;
  mediaUrl?: string;
  mediaType?: string;
  likeCount?: number;
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

      const userIds = [...new Set(
        postsData
          .filter(post => !post.is_anonymous && post.user_id)
          .map(post => post.user_id)
      )];

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

      const formattedPosts: Post[] = postsData.map((post: any) => {
        const profile = profiles.find(p => p.id === post.user_id);
        
        return {
          id: post.id,
          content: post.content,
          mood: post.mood,
          color: post.color,
          isAnonymous: post.is_anonymous,
          author: post.is_anonymous ? undefined : (profile?.username || 'Unknown User'),
          authorId: post.is_anonymous ? undefined : post.user_id,
          timestamp: new Date(post.created_at),
          location: post.location,
          mediaUrl: post.media_url,
          mediaType: post.media_type,
          likeCount: post.like_count || 0
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

  const handleStatusCreated = () => {
    // Status feed will refresh automatically
    console.log('Status created!');
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Status Section */}
        {user && (
          <div className="p-4 border-b border-gray-100">
            <StatusCreator onStatusCreated={handleStatusCreated} />
            <StatusFeed />
          </div>
        )}

        {/* Mood Filter */}
        <div className="px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
          <MoodFilterHorizontal 
            selectedMood={selectedMood} 
            onMoodChange={setSelectedMood}
          />
        </div>

        {/* Posts Feed */}
        <div className="pb-20">
          {loading ? (
            <div className="flex flex-col space-y-4 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border animate-pulse">
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <PostsFeed posts={filteredPosts} />
          )}
        </div>

        {/* Floating Add Button */}
        {user && (
          <FloatingAddButton 
            onSubmit={addPost} 
            onPostSaved={handlePostSaved}
          />
        )}
      </div>
    </div>
  );
};

export default Index;

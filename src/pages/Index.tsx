
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

const samplePosts: Post[] = [
  {
    id: '1',
    content: "Sometimes I wonder what it would be like to just pack a bag and disappear to a quiet beach town where nobody knows my name...",
    mood: 'wanderlust',
    color: 'bg-blue-100',
    isAnonymous: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    location: "Dreaming of Santorini"
  },
  {
    id: '2',
    content: "The way you looked at me today made me believe in magic again ✨",
    mood: 'love',
    color: 'bg-pink-100',
    isAnonymous: false,
    author: 'Maya',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
  }
];

const Index = () => {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      // Type assertion to bypass TypeScript errors until database is set up
      const { data, error } = await (supabase as any)
        .from('posts')
        .select(`
          id,
          content,
          mood,
          color,
          is_anonymous,
          location,
          media_url,
          media_type,
          created_at,
          profiles:user_id (username)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Posts table not found - using sample posts only');
        return;
      }

      const formattedPosts = data?.map((post: any) => ({
        id: post.id,
        content: post.content,
        mood: post.mood,
        color: post.color,
        isAnonymous: post.is_anonymous,
        author: post.is_anonymous ? undefined : post.profiles?.username,
        timestamp: new Date(post.created_at),
        location: post.location,
        mediaUrl: post.media_url,
        mediaType: post.media_type
      })) || [];

      setPosts([...formattedPosts, ...samplePosts]);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
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
            <PostCreator onSubmit={addPost} />
            <MoodFilter 
              selectedMood={selectedMood} 
              onMoodChange={setSelectedMood}
            />
          </div>

          {/* Right Column - Posts Feed */}
          <div className="lg:col-span-2">
            <PostsFeed posts={filteredPosts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

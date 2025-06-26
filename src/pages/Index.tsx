
import { useState } from 'react';
import { PostCreator } from '@/components/PostCreator';
import { MoodFilter } from '@/components/MoodFilter';
import { PostsFeed } from '@/components/PostsFeed';
import { Header } from '@/components/Header';

export interface Post {
  id: string;
  content: string;
  mood: string;
  color: string;
  isAnonymous: boolean;
  author?: string;
  timestamp: Date;
  location?: string;
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
  },
  {
    id: '3',
    content: "Sitting in my car after work, not ready to go home yet. Just existing in this in-between space.",
    mood: 'lost',
    color: 'bg-gray-100',
    isAnonymous: true,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
  },
  {
    id: '4',
    content: "\"The wound is the place where the Light enters you.\" - Rumi. Today I choose to see my scars as doorways.",
    mood: 'hopeful',
    color: 'bg-yellow-100',
    isAnonymous: false,
    author: 'Alex',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
  },
  {
    id: '5',
    content: "Missing someone who was never really mine to begin with. Why does the heart want what it can't have?",
    mood: 'heartbreak',
    color: 'bg-purple-100',
    isAnonymous: true,
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
  }
];

const Index = () => {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [selectedMood, setSelectedMood] = useState<string>('all');

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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-slate-800 mb-4">SoulSpeak</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A safe space for your unsaid feelings. Share anonymously, connect authentically, express freely.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Post Creator */}
          <div className="lg:col-span-1">
            <PostCreator onSubmit={addPost} />
            <MoodFilter 
              selectedMood={selectedMood} 
              onMoodChange={setSelectedMood}
              className="mt-6"
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

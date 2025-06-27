
-- Create status updates table
CREATE TABLE public.status_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT CHECK (char_length(content) <= 10),
  mood TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-gray-100',
  audio_url TEXT,
  emoji TEXT,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Create status likes table
CREATE TABLE public.status_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status_id UUID REFERENCES public.status_updates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(status_id, user_id)
);

-- Enable RLS
ALTER TABLE public.status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for status_updates
CREATE POLICY "Anyone can view status updates" ON public.status_updates FOR SELECT USING (expires_at > now());
CREATE POLICY "Users can create their own status" ON public.status_updates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own status" ON public.status_updates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own status" ON public.status_updates FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for status_likes
CREATE POLICY "Anyone can view status likes" ON public.status_likes FOR SELECT USING (true);
CREATE POLICY "Users can like status" ON public.status_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike status" ON public.status_likes FOR DELETE USING (auth.uid() = user_id);

-- Add bio column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Function to update status like count
CREATE OR REPLACE FUNCTION update_status_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.status_updates 
    SET like_count = like_count + 1 
    WHERE id = NEW.status_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.status_updates 
    SET like_count = like_count - 1 
    WHERE id = OLD.status_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status like


import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Edit, Save, X, Users, UserCheck, Upload } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    avatar_url: '',
    bio: ''
  });
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchFollowStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          username: data.username || '',
          avatar_url: data.avatar_url || '',
          bio: '' // We'll add bio to the profiles table later
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowStats = async () => {
    if (!user) return;

    try {
      // Get followers count
      const { count: followersCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      // Get following count
      const { count: followingCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id);

      setFollowStats({
        followers: followersCount || 0,
        following: followingCount || 0
      });
    } catch (error) {
      console.error('Error fetching follow stats:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully."
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, we'll just show a message about file upload
    // In a real app, you'd upload to Supabase storage
    toast({
      title: "File upload coming soon!",
      description: "Profile picture upload will be available soon. For now, you can use an image URL.",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-serif text-slate-800 mb-4">Please sign in to view your profile</h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="text-4xl mb-4">👤</div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-serif text-slate-800">My Profile</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editing ? setEditing(false) : setEditing(true)}
                className="flex items-center space-x-2"
              >
                {editing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                <span>{editing ? 'Cancel' : 'Edit'}</span>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xl">
                  {profile.username ? profile.username[0].toUpperCase() : user.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {editing && (
                <div className="w-full max-w-md space-y-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      className="flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Photo</span>
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <Label htmlFor="avatar" className="text-sm font-medium text-slate-700">
                      Or use image URL
                    </Label>
                    <Input
                      id="avatar"
                      type="url"
                      value={profile.avatar_url}
                      onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Follow Stats */}
            <div className="flex justify-center space-x-8 py-4 border-b border-slate-200">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-slate-800">
                  <Users className="w-5 h-5" />
                  <span>{followStats.followers}</span>
                </div>
                <p className="text-sm text-slate-600">Followers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-slate-800">
                  <UserCheck className="w-5 h-5" />
                  <span>{followStats.following}</span>
                </div>
                <p className="text-sm text-slate-600">Following</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="mt-1 bg-slate-50"
                />
              </div>

              <div>
                <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={profile.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter your username"
                  disabled={!editing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-sm font-medium text-slate-700">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  disabled={!editing}
                  className="mt-1 min-h-[100px]"
                />
              </div>
            </div>

            {editing && (
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

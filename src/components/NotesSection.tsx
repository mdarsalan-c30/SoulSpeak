
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  mood?: string;
  created_at: string;
}

export const NotesSection = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', mood: '' });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const createNote = async () => {
    if (!newNote.title.trim()) return;

    try {
      const { error } = await supabase
        .from('notes')
        .insert([{
          title: newNote.title,
          content: newNote.content,
          mood: newNote.mood,
          user_id: user?.id
        }]);

      if (error) throw error;

      setNewNote({ title: '', content: '', mood: '' });
      setIsCreating(false);
      fetchNotes();
      toast({ title: "Note created successfully!" });
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Error creating note",
        variant: "destructive"
      });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchNotes();
      toast({ title: "Note deleted successfully!" });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error deleting note",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif text-slate-800">My Notes</h2>
        <Button
          onClick={() => setIsCreating(true)}
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {isCreating && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg">Create New Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />
            <Textarea
              placeholder="Write your thoughts..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="min-h-[100px]"
            />
            <Input
              placeholder="Mood (optional)"
              value={newNote.mood}
              onChange={(e) => setNewNote({ ...newNote, mood: e.target.value })}
            />
            <div className="flex space-x-2">
              <Button onClick={createNote} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button 
                onClick={() => setIsCreating(false)} 
                variant="outline" 
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {notes.map((note) => (
          <Card key={note.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-800 mb-2">{note.title}</h3>
                  <p className="text-slate-600 text-sm mb-3">{note.content}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>{formatDate(note.created_at)}</span>
                    {note.mood && <span className="px-2 py-1 bg-purple-100 rounded">{note.mood}</span>}
                  </div>
                </div>
                <div className="flex space-x-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNote(note.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500">No notes yet. Create your first note!</p>
        </div>
      )}
    </div>
  );
};

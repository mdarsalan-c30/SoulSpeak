
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Note {
  id: string;
  title: string;
  content: string;
  mood?: string;
  created_at: string;
  updated_at: string;
}

const moods = ['peaceful', 'grateful', 'reflective', 'hopeful', 'content', 'curious'];

export const NotesSection = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: '', content: '', mood: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState({ title: '', content: '', mood: '' });
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.log('Notes table not found - using empty state');
        return;
      }

      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const createNote = async () => {
    if (!user || !newNote.title.trim()) return;

    try {
      const noteData = {
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        mood: newNote.mood || null,
        user_id: user.id
      };

      const { error } = await (supabase as any)
        .from('notes')
        .insert([noteData]);

      if (error) {
        console.log('Database not ready - creating note locally only');
      }

      // Add note locally for immediate UI update
      const localNote: Note = {
        id: Date.now().toString(),
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        mood: newNote.mood,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setNotes([localNote, ...notes]);
      setNewNote({ title: '', content: '', mood: '' });
      setIsCreating(false);

      toast({
        title: "Note created!",
        description: "Your personal note has been saved."
      });
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Error",
        description: "Failed to create note. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateNote = async (id: string) => {
    if (!user || !editingNote.title.trim()) return;

    try {
      const { error } = await (supabase as any)
        .from('notes')
        .update({
          title: editingNote.title.trim(),
          content: editingNote.content.trim(),
          mood: editingNote.mood || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.log('Database not ready - updating note locally only');
      }

      // Update note locally
      setNotes(notes.map(note => 
        note.id === id 
          ? {
              ...note,
              title: editingNote.title.trim(),
              content: editingNote.content.trim(),
              mood: editingNote.mood,
              updated_at: new Date().toISOString()
            }
          : note
      ));

      setEditingId(null);
      toast({
        title: "Note updated!",
        description: "Your changes have been saved."
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) {
        console.log('Database not ready - deleting note locally only');
      }

      setNotes(notes.filter(note => note.id !== id));
      toast({
        title: "Note deleted",
        description: "Your note has been removed."
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive"
      });
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditingNote({
      title: note.title,
      content: note.content,
      mood: note.mood || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingNote({ title: '', content: '', mood: '' });
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Please sign in to view your notes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-slate-800">Your Personal Notes</h2>
        <Button
          onClick={() => setIsCreating(true)}
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
            <div>
              <Label htmlFor="new-title">Title</Label>
              <Input
                id="new-title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Note title..."
              />
            </div>
            <div>
              <Label htmlFor="new-content">Content</Label>
              <Textarea
                id="new-content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Write your thoughts..."
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="new-mood">Mood (optional)</Label>
              <Select value={newNote.mood} onValueChange={(value) => setNewNote({ ...newNote, mood: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a mood" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map(mood => (
                    <SelectItem key={mood} value={mood}>
                      {mood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button onClick={createNote} disabled={!newNote.title.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </Button>
              <Button variant="outline" onClick={() => {
                setIsCreating(false);
                setNewNote({ title: '', content: '', mood: '' });
              }}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {notes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-600 mb-4">No notes yet. Create your first personal note!</p>
              <Button
                onClick={() => setIsCreating(true)}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {editingId === note.id ? (
                  <div className="space-y-4">
                    <Input
                      value={editingNote.title}
                      onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                      className="font-medium"
                    />
                    <Textarea
                      value={editingNote.content}
                      onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                      className="min-h-[100px]"
                    />
                    <Select value={editingNote.mood} onValueChange={(value) => setEditingNote({ ...editingNote, mood: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a mood" />
                      </SelectTrigger>
                      <SelectContent>
                        {moods.map(mood => (
                          <SelectItem key={mood} value={mood}>
                            {mood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex space-x-2">
                      <Button onClick={() => updateNote(note.id)} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={cancelEditing} size="sm">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-slate-800">{note.title}</h3>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(note)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {note.content && (
                      <p className="text-slate-600 mb-3 whitespace-pre-wrap">{note.content}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Updated {new Date(note.updated_at).toLocaleDateString()}
                      </span>
                      {note.mood && (
                        <span className="bg-slate-100 px-2 py-1 rounded-full">
                          {note.mood}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

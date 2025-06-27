
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PostCreator } from '@/components/PostCreator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Post } from '@/pages/Index';

interface FloatingAddButtonProps {
  onPostSaved: () => void;
  onSubmit: (post: Omit<Post, 'id' | 'timestamp'>) => void;
}

export const FloatingAddButton = ({ onPostSaved, onSubmit }: FloatingAddButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePostSaved = () => {
    onPostSaved();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-slate-800 text-center">
            Share Your Soul
          </DialogTitle>
        </DialogHeader>
        <PostCreator onSubmit={onSubmit} onPostSaved={handlePostSaved} />
      </DialogContent>
    </Dialog>
  );
};

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface TagsManagerProps {
  tags: string[] | null;
  onChange: (tags: string[]) => void;
  readOnly?: boolean;
}

export default function TagsManager({ tags, onChange, readOnly = false }: TagsManagerProps) {
  const [newTag, setNewTag] = useState('');
  const currentTags = tags || [];

  const handleAddTag = () => {
    const trimmed = newTag.trim().toLowerCase();
    if (!trimmed) return;
    
    if (currentTags.includes(trimmed)) {
      toast.error('Tag already exists');
      return;
    }

    onChange([...currentTags, trimmed]);
    setNewTag('');
    toast.success('Tag added');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(currentTags.filter(t => t !== tagToRemove));
    toast.success('Tag removed');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {currentTags.length === 0 ? (
          <span className="text-sm text-muted-foreground">No tags</span>
        ) : (
          currentTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              {!readOnly && (
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:bg-destructive/20 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))
        )}
      </div>
      
      {!readOnly && (
        <div className="flex gap-2">
          <Input
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleAddTag} size="sm" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { AlertCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditFeatureModalProps {
  item: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditFeatureModal({ item, open, onOpenChange, onSuccess }: EditFeatureModalProps) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || '');
  const [status, setStatus] = useState(item.status);
  const [priority, setPriority] = useState(item.priority || 'medium');
  const [type, setType] = useState(item.type);
  const [showImpactWarning, setShowImpactWarning] = useState(false);

  const updateMutation = trpc.pmItems.update.useMutation({
    onSuccess: () => {
      toast.success('Feature updated successfully');
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    }
  });

  useEffect(() => {
    // Check if changes will have significant impact
    const hasSignificantChanges = 
      status !== item.status || 
      type !== item.type ||
      priority !== item.priority;
    
    setShowImpactWarning(hasSignificantChanges);
  }, [status, type, priority, item]);

  const handleSave = () => {
    updateMutation.mutate({
      id: item.id,
      title,
      description,
      status: status as any,
      priority: priority as any,
      type: type as any,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Feature</DialogTitle>
          <DialogDescription>
            Make changes to {item.itemId}. Complex changes will be flagged for review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FEAT">Feature</SelectItem>
                  <SelectItem value="IDEA">Idea</SelectItem>
                  <SelectItem value="BUG">Bug</SelectItem>
                  <SelectItem value="IMPROVE">Improvement</SelectItem>
                  <SelectItem value="TECH">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbox">Inbox</SelectItem>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Feature title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description..."
              rows={6}
            />
          </div>

          {/* Impact Warning */}
          {showImpactWarning && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Significant changes detected.</strong> Changing status, type, or priority may affect:
                <ul className="list-disc list-inside mt-2 text-sm">
                  <li>Roadmap timeline</li>
                  <li>Dependent features</li>
                  <li>Feature specifications</li>
                </ul>
                <p className="mt-2 text-sm">
                  Consider using a Manus chat for complex updates that need deeper analysis.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Item ID:</span>
              <Badge variant="outline">{item.itemId}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Created:</span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Updated:</span>
              <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              // TODO: Implement delete with cascade protection
              toast.error('Delete functionality coming soon');
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

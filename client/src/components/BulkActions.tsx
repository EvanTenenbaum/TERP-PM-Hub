import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Trash2, Tag, ArrowRight } from 'lucide-react';

interface BulkActionsProps {
  items: any[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onActionComplete: () => void;
}

export default function BulkActions({ items, selectedIds, onSelectionChange, onActionComplete }: BulkActionsProps) {
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [bulkPriority, setBulkPriority] = useState<string>('');
  
  const updateMutation = trpc.pmItems.update.useMutation();

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  };

  const handleBulkStatusChange = async () => {
    if (!bulkStatus || selectedIds.length === 0) return;

    toast.promise(
      Promise.all(
        selectedIds.map(id =>
          updateMutation.mutateAsync({
            id,
            status: bulkStatus as any
          })
        )
      ),
      {
        loading: `Updating ${selectedIds.length} items...`,
        success: () => {
          onSelectionChange([]);
          onActionComplete();
          setBulkStatus('');
          return `Updated ${selectedIds.length} items`;
        },
        error: 'Failed to update items'
      }
    );
  };

  const handleBulkPriorityChange = async () => {
    if (!bulkPriority || selectedIds.length === 0) return;

    toast.promise(
      Promise.all(
        selectedIds.map(id =>
          updateMutation.mutateAsync({
            id,
            priority: bulkPriority as any
          })
        )
      ),
      {
        loading: `Updating ${selectedIds.length} items...`,
        success: () => {
          onSelectionChange([]);
          onActionComplete();
          setBulkPriority('');
          return `Updated ${selectedIds.length} items`;
        },
        error: 'Failed to update items'
      }
    );
  };

  const handleBulkDelete = () => {
    toast.error('Bulk delete coming soon (with cascade protection)');
  };

  if (items.length === 0) return null;

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedIds.length === items.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">
            {selectedIds.length > 0 ? (
              <Badge variant="secondary">{selectedIds.length} selected</Badge>
            ) : (
              'Select all'
            )}
          </span>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bulk Status Change */}
            <div className="flex items-center gap-2">
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Change status" />
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
              {bulkStatus && (
                <Button size="sm" onClick={handleBulkStatusChange}>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Bulk Priority Change */}
            <div className="flex items-center gap-2">
              <Select value={bulkPriority} onValueChange={setBulkPriority}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Change priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              {bulkPriority && (
                <Button size="sm" onClick={handleBulkPriorityChange}>
                  <Tag className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Bulk Delete */}
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

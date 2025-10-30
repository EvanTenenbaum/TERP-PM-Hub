import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Lightbulb, Bug, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import KanbanItem from './KanbanItem';

type Status = 'inbox' | 'backlog' | 'planned' | 'in-progress' | 'completed';

const columns: { id: Status; title: string }[] = [
  { id: 'inbox', title: 'Inbox' },
  { id: 'backlog', title: 'Backlog' },
  { id: 'planned', title: 'Planned' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
];

export default function KanbanBoard() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data: items, refetch } = trpc.pmItems.list.useQuery();
  const updateMutation = trpc.pmItems.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success('Status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const itemId = parseInt(active.id as string);
    const newStatus = over.id as Status;
    
    const item = items?.find(i => i.id === itemId);
    if (item && item.status !== newStatus) {
      updateMutation.mutate({
        id: itemId,
        status: newStatus
      });
    }

    setActiveId(null);
  };

  const getItemsByStatus = (status: Status) => {
    return items?.filter(item => item.status === status) || [];
  };

  const activeItem = items?.find(item => item.id.toString() === activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map(column => {
          const columnItems = getItemsByStatus(column.id);
          
          return (
            <Card key={column.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {column.title}
                  <Badge variant="secondary" className="ml-2">
                    {columnItems.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-2 min-h-[200px]">
                <SortableContext
                  id={column.id}
                  items={columnItems.map(item => item.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  {columnItems.map(item => (
                    <KanbanItem key={item.id} item={item} />
                  ))}
                </SortableContext>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DragOverlay>
        {activeItem && <KanbanItem item={activeItem} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}

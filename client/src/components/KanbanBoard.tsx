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
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [contextInput, setContextInput] = useState('');
  const [showEnhancement, setShowEnhancement] = useState(false);
  
  const { data: items, refetch } = trpc.pmItems.list.useQuery();
  const { data: selectedItem } = trpc.pmItems.get.useQuery(
    { itemId: items?.find(i => i.id === selectedItemId)?.itemId || '' },
    { enabled: !!selectedItemId && !!items?.find(i => i.id === selectedItemId)?.itemId }
  );
  const updateMutation = trpc.pmItems.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success('Status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });
  
  const enhanceWithContext = trpc.pmItems.enhanceWithContext.useMutation({
    onSuccess: () => {
      setShowEnhancement(true);
      setContextInput('');
      refetch();
      toast.success('Item enhanced with AI!');
      setTimeout(() => {
        setShowEnhancement(false);
        setSelectedItemId(null);
      }, 3000);
    },
    onError: (error) => {
      toast.error(`Failed to enhance: ${error.message}`);
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
                    <KanbanItem 
                      key={item.id} 
                      item={item} 
                      onClick={() => setSelectedItemId(item.id)}
                    />
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
      
      {/* Detail Modal */}
      {selectedItemId && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItemId(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedItem.title}</h2>
              <button onClick={() => setSelectedItemId(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {showEnhancement && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-900">✓ Context Added Successfully!</p>
                  <p className="text-sm text-green-700 mt-1">
                    AI has analyzed the context and updated the description, priority, tags, and related items.
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-600">{selectedItem.description || 'No description'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Type</label>
                    <p className="mt-1 text-sm text-gray-600">{selectedItem.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Status</label>
                    <p className="mt-1 text-sm text-gray-600">{selectedItem.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Priority</label>
                    <p className="mt-1 text-sm text-gray-600">{selectedItem.priority || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Item ID</label>
                    <p className="mt-1 text-sm text-gray-600">{selectedItem.itemId}</p>
                  </div>
                </div>
                
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Tags</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedItem.related && selectedItem.related.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Related Items</label>
                    <p className="mt-1 text-sm text-gray-600">{selectedItem.related.join(', ')}</p>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Add Context</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Provide additional context and AI will enhance the description, adjust priority, and suggest related items/tags.
                </p>
                <textarea
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  placeholder="E.g., 'This needs to integrate with the payment system' or 'Users are requesting this urgently'..."
                  className="w-full h-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                  disabled={enhanceWithContext.isPending}
                />
                <button
                  onClick={() => {
                    if (contextInput.trim()) {
                      enhanceWithContext.mutate({
                        id: selectedItemId,
                        context: contextInput.trim(),
                      });
                    }
                  }}
                  disabled={!contextInput.trim() || enhanceWithContext.isPending}
                  className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {enhanceWithContext.isPending ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Enhance with AI
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}

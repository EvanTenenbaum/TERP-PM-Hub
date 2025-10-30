import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Lightbulb, Bug, Sparkles, GripVertical } from 'lucide-react';

interface KanbanItemProps {
  item: any;
  isDragging?: boolean;
}

export default function KanbanItem({ item, isDragging }: KanbanItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: item.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'FEAT': return <FileText className="w-3 h-3" />;
      case 'IDEA': return <Lightbulb className="w-3 h-3" />;
      case 'BUG': return <Bug className="w-3 h-3" />;
      case 'IMPROVE': return <Sparkles className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-lg' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap mb-1">
              {getIcon(item.type)}
              <Badge variant="outline" className="text-xs">
                {item.itemId}
              </Badge>
              {item.priority && (
                <Badge variant={getPriorityColor(item.priority) as any} className="text-xs">
                  {item.priority}
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium line-clamp-2">{item.title}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                {item.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

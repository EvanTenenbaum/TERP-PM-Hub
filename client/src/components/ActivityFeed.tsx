import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, GitCommit, MessageSquare, FileText, Bug, Lightbulb } from 'lucide-react';

interface Activity {
  id: string;
  type: 'created' | 'updated' | 'commented' | 'status_changed';
  itemId: string;
  itemType: string;
  title: string;
  timestamp: Date;
  details?: string;
}

interface ActivityFeedProps {
  items: any[];
  limit?: number;
}

export default function ActivityFeed({ items, limit = 10 }: ActivityFeedProps) {
  // Generate activity from PM items
  const activities: Activity[] = items
    .flatMap(item => {
      const activities: Activity[] = [];
      
      // Created activity
      activities.push({
        id: `${item.id}-created`,
        type: 'created',
        itemId: item.itemId,
        itemType: item.type,
        title: item.title,
        timestamp: new Date(item.createdAt),
      });

      // Updated activity (if different from created)
      if (new Date(item.updatedAt).getTime() !== new Date(item.createdAt).getTime()) {
        activities.push({
          id: `${item.id}-updated`,
          type: 'updated',
          itemId: item.itemId,
          itemType: item.type,
          title: item.title,
          timestamp: new Date(item.updatedAt),
          details: `Status: ${item.status}`
        });
      }

      return activities;
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);

  const getIcon = (type: string) => {
    switch (type) {
      case 'FEAT': return <FileText className="w-4 h-4" />;
      case 'BUG': return <Bug className="w-4 h-4" />;
      case 'IDEA': return <Lightbulb className="w-4 h-4" />;
      default: return <GitCommit className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'created': return 'text-green-600';
      case 'updated': return 'text-blue-600';
      case 'commented': return 'text-purple-600';
      case 'status_changed': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getActivityLabel = (type: Activity['type']) => {
    switch (type) {
      case 'created': return 'Created';
      case 'updated': return 'Updated';
      case 'commented': return 'Commented';
      case 'status_changed': return 'Status changed';
      default: return 'Activity';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest updates across all items</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No activity yet</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className="mt-1">
                    {getIcon(activity.itemType)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="text-xs">
                          {activity.itemId}
                        </Badge>
                        <p className="text-sm font-medium mt-1">{activity.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${getActivityColor(activity.type)}`}>
                        {getActivityLabel(activity.type)}
                      </span>
                      {activity.details && (
                        <span className="text-xs text-muted-foreground">
                          {activity.details}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

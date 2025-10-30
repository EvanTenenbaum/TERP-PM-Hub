import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Download, Play, Trash2, Clock, Target, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Queue() {
  const { data: queueItems, isLoading, refetch } = trpc.queue.list.useQuery();
  const deleteQueueItem = trpc.queue.delete.useMutation();
  const updateQueueItem = trpc.queue.update.useMutation();
  const { data: exportData } = trpc.queue.exportToWorkItems.useQuery();

  const handleDelete = async (id: number) => {
    try {
      await deleteQueueItem.mutateAsync({ id });
      toast.success('Item removed from implementation queue');
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStatusChange = async (id: number, status: 'queued' | 'in-progress' | 'completed' | 'blocked') => {
    try {
      await updateQueueItem.mutateAsync({ id, status });
      toast.success(`Item marked as ${status}`);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleExport = () => {
    if (!exportData) return;
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'work-items.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('work-items.json downloaded successfully');
  };

  const startImplementation = trpc.queue.startImplementation.useMutation();

  const handleStartImplementation = async (item: any) => {
    try {
      const result = await startImplementation.mutateAsync({ queueItemId: item.id });
      
      // Copy implementation prompt to clipboard
      navigator.clipboard.writeText(result.implementationPrompt);
      
      toast.success(
        'Implementation started! Prompt copied to clipboard. Paste in Manus to begin.',
        { duration: 5000 }
      );
      
      // Show instructions in console for reference
      console.log('=== WATCHDOG SYSTEM INSTRUCTIONS ===');
      console.log(result.instructions);
      console.log('\n=== IMPLEMENTATION PROMPT (copied to clipboard) ===');
      console.log(result.implementationPrompt);
      console.log('\n=== CONTINUATION PROMPT (for reference) ===');
      console.log(result.continuationPrompt);
      
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to start implementation');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalMinutes = queueItems?.reduce((sum, item) => sum + (item.estimatedMinutes || 0), 0) || 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <div className="text-center py-12">Loading queue...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Implementation Queue</h1>
          <p className="text-muted-foreground mt-1">
            Structured work items ready for agent implementation
          </p>
        </div>
        <Button onClick={handleExport} disabled={!queueItems || queueItems.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export Queue
        </Button>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Items in Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueItems?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Estimated Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalHours}h {remainingMinutes}m
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">
              {queueItems && queueItems.length > 0 ? queueItems[0].title : 'Queue empty'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Items */}
      {!queueItems || queueItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No items in queue. Add items from Inbox or Kanban board.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {queueItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <Badge variant={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">{item.pmItemId}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {item.estimatedMinutes} min
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Diagnosis */}
                <div>
                  <h4 className="font-semibold text-sm mb-1">Diagnosis</h4>
                  <p className="text-sm text-muted-foreground">{item.diagnosis}</p>
                </div>

                {/* Implementation Steps */}
                <div>
                  <h4 className="font-semibold text-sm mb-1">Implementation Steps</h4>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    {(typeof item.implementationSteps === 'string' ? 
                      JSON.parse(item.implementationSteps) : 
                      item.implementationSteps || []).map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* QA Requirements */}
                <div>
                  <h4 className="font-semibold text-sm mb-1">QA Requirements</h4>
                  <p className="text-sm text-muted-foreground">{item.qaRequirements}</p>
                </div>

                {/* Dependencies */}
                {item.dependencies && (typeof item.dependencies === 'string' ? 
                  JSON.parse(item.dependencies).length > 0 : 
                  item.dependencies.length > 0) && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Dependencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {(typeof item.dependencies === 'string' ? 
                        JSON.parse(item.dependencies) : 
                        item.dependencies).map((dep: string) => (
                        <Badge key={dep} variant="outline" className="text-xs">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    onClick={() => handleStartImplementation(item)}
                    disabled={item.status === 'completed'}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Implementation
                  </Button>
                  
                  {item.status === 'queued' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(item.id, 'in-progress')}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Mark In Progress
                    </Button>
                  )}
                  
                  {item.status === 'in-progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(item.id, 'completed')}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

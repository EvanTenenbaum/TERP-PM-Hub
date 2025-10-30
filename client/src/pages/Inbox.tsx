import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { Lightbulb, Bug, FileText, Sparkles, MessageSquare, ExternalLink, Edit, Zap, Users } from 'lucide-react';
import { toast } from 'sonner';

type RecommendationType = 'llm-quick-fix' | 'full-agent' | 'manual' | 'convert-to-feature';

interface ItemWithRecommendation {
  id: number;
  itemId: string;
  type: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  recommendation?: RecommendationType;
  complexity?: number;
}

export default function Inbox() {
  const { isAuthenticated } = useAuth();
  const [selectedItem, setSelectedItem] = useState<ItemWithRecommendation | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [additionalContext, setAdditionalContext] = useState('');
  
  const { data: items, isLoading, refetch } = trpc.pmItems.list.useQuery();
  const updateMutation = trpc.pmItems.update.useMutation({
    onSuccess: () => {
      toast.success('Item updated successfully');
      refetch();
      setSelectedItem(null);
    }
  });
  
  const analyzeMutation = trpc.devAgent.analyzeComplexity.useMutation();
  
  const addToQueueMutation = trpc.queue.addToQueue.useMutation({
    onSuccess: (data) => {
      toast.success('Item added to implementation queue with AI analysis');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to add to queue: ${error.message}`);
    }
  });

  const convertToPRDMutation = trpc.pmItems.convertToPRD.useMutation({
    onSuccess: (data) => {
      toast.success(`PRD generated! Estimated cost: $${data.estimatedCost.toFixed(4)}`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to generate PRD: ${error.message}`);
    }
  });

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Please sign in</div>;
  }

  // Filter items (show IDEA, BUG, and IMPROVE types in inbox)
  const inboxItems = items?.filter((item: any) => 
    ['IDEA', 'BUG', 'IMPROVE'].includes(item.type) &&
    (filterType === 'all' || item.type === filterType)
  ) || [];

  // Analyze and add recommendations
  const itemsWithRecommendations: ItemWithRecommendation[] = inboxItems.map((item: any) => {
    const complexity = analyzeComplexity(item.description || item.title);
    const recommendation = getRecommendation(complexity, item.type);
    
    return {
      ...item,
      complexity,
      recommendation
    };
  });

  function analyzeComplexity(text: string): number {
    // Simple heuristic complexity analysis
    const words = text.split(/\s+/).length;
    const hasMultipleSteps = /\d+\.|step|then|after|before/i.test(text);
    const hasMultipleFiles = /file|component|page|module/gi.test(text) && (text.match(/file|component|page|module/gi)?.length || 0) > 2;
    const hasDatabaseChanges = /database|schema|table|migration/i.test(text);
    
    let score = 0;
    if (words > 50) score += 30;
    else if (words > 20) score += 15;
    else score += 5;
    
    if (hasMultipleSteps) score += 25;
    if (hasMultipleFiles) score += 30;
    if (hasDatabaseChanges) score += 20;
    
    return Math.min(score, 100);
  }

  function getRecommendation(complexity: number, type: string): RecommendationType {
    if (type === 'IDEA') return 'convert-to-feature';
    if (complexity < 30) return 'llm-quick-fix';
    if (complexity < 60) return 'full-agent';
    return 'manual';
  }

  function getRecommendationBadge(rec: RecommendationType) {
    const badges = {
      'llm-quick-fix': { label: 'Quick Fix', variant: 'default' as const, icon: Zap },
      'full-agent': { label: 'Manus Agent', variant: 'secondary' as const, icon: Users },
      'manual': { label: 'Manual', variant: 'outline' as const, icon: Edit },
      'convert-to-feature': { label: 'Feature', variant: 'default' as const, icon: Sparkles }
    };
    
    const config = badges[rec];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'IDEA': return <Lightbulb className="w-4 h-4" />;
      case 'BUG': return <Bug className="w-4 h-4" />;
      case 'IMPROVE': return <Sparkles className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  }

  async function handleAddToQueue(item: ItemWithRecommendation) {
    toast.info('Analyzing item with AI...');
    await addToQueueMutation.mutateAsync({
      pmItemId: item.itemId,
      additionalContext: additionalContext || undefined,
    });
  }

  async function handleConvertToFeature(item: ItemWithRecommendation) {
    toast.info('Generating PRD with AI...');
    await convertToPRDMutation.mutateAsync({
      itemId: item.itemId,
      additionalContext: additionalContext || undefined,
    });
  }

  function handleConvertToFeatureOld(item: ItemWithRecommendation) {
    updateMutation.mutate({
      id: item.id,
      type: 'FEAT',
      status: 'planned'
    });
  }

  function handleSaveContext() {
    if (!selectedItem) return;
    
    const updatedDescription = selectedItem.description 
      ? `${selectedItem.description}\n\n---\nAdditional Context:\n${additionalContext}`
      : additionalContext;
    
    updateMutation.mutate({
      id: selectedItem.id,
      description: updatedDescription
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container flex items-center justify-between py-3">
          <h1 className="text-xl font-bold">Inbox</h1>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="IDEA">Ideas</SelectItem>
              <SelectItem value="BUG">Bugs</SelectItem>
              <SelectItem value="IMPROVE">Improvements</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="container py-6 space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : itemsWithRecommendations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No items in inbox</p>
              <p className="text-sm text-muted-foreground mt-2">
                Use Quick Capture on the dashboard to add ideas, bugs, or feedback
              </p>
            </CardContent>
          </Card>
        ) : (
          itemsWithRecommendations.map(item => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getTypeIcon(item.type)}</div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {item.description || 'No description'}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">{item.itemId}</Badge>
                        {item.recommendation && getRecommendationBadge(item.recommendation)}
                        {item.complexity !== undefined && (
                          <Badge variant="secondary">
                            Complexity: {item.complexity}/100
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {/* Add Context Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setAdditionalContext('');
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Add Context
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Context to {item.itemId}</DialogTitle>
                        <DialogDescription>
                          Add additional notes, links, or context to help with implementation
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Current Description</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description || 'No description yet'}
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="context">Additional Context</Label>
                          <Textarea
                            id="context"
                            placeholder="Add notes, links, requirements, edge cases, etc..."
                            value={additionalContext}
                            onChange={(e) => setAdditionalContext(e.target.value)}
                            rows={6}
                            className="mt-2"
                          />
                        </div>
                        <Button onClick={handleSaveContext} disabled={!additionalContext.trim()}>
                          Save Context
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Recommended Action */}
                  {/* Removed old buttons - now using unified Add to Queue */}

                  {item.recommendation === 'convert-to-feature' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleConvertToFeature(item)}
                      className="gap-2"
                      disabled={convertToPRDMutation.isPending}
                    >
                      <Sparkles className="w-4 h-4" />
                      {convertToPRDMutation.isPending ? 'Generating PRD...' : 'Convert to PRD'}
                    </Button>
                  )}

                  {/* Alternative Actions */}
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => handleAddToQueue(item)}
                    className="gap-2"
                    disabled={addToQueueMutation.isPending}
                  >
                    <Zap className="w-4 h-4" />
                    {addToQueueMutation.isPending ? 'Adding...' : 'Add to Queue'}
                  </Button>                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}

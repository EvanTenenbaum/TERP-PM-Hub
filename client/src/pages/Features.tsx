import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, Code, Sparkles, ExternalLink, AlertCircle, Search } from "lucide-react";
import BulkActions from '@/components/BulkActions';
import ExportData from '@/components/ExportData';
import EditFeatureModal from '@/components/EditFeatureModal';
import { Input } from '@/components/ui/input';
import { useState } from "react";
import { toast } from "sonner";

const statusColors = {
  inbox: "bg-gray-500",
  backlog: "bg-blue-500",
  planned: "bg-purple-500",
  "in-progress": "bg-yellow-500",
  completed: "bg-green-500",
  "on-hold": "bg-orange-500",
  archived: "bg-gray-400",
};

const typeColors = {
  IDEA: "bg-blue-600",
  FEAT: "bg-green-600",
  BUG: "bg-red-600",
  IMPROVE: "bg-purple-600",
  TECH: "bg-gray-600",
};

export default function Features() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: pmItems, isLoading: itemsLoading } = trpc.pmItems.list.useQuery();
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [showDevDialog, setShowDevDialog] = useState(false);
  const [complexity, setComplexity] = useState<any>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<any>(null);
  const utils = trpc.useUtils();

  const analyzeComplexity = trpc.devAgent.analyzeComplexity.useMutation();
  const generateCode = trpc.devAgent.generateCode.useMutation();
  const createHandoff = trpc.devAgent.createHandoff.useMutation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <h1 className="text-2xl font-bold text-center">TERP Product Management Hub</h1>
        <p className="text-muted-foreground text-center">Please sign in to continue</p>
        <Button asChild>
          <a href={getLoginUrl()}>Sign In</a>
        </Button>
      </div>
    );
  }

  const handleDevAgent = async (item: any) => {
    setSelectedFeature(item);
    setShowDevDialog(true);
    setComplexity(null);
    setGenerationProgress(0);
    setGenerationStage("Analyzing complexity...");

    try {
      // Analyze complexity
      const complexityResult = await analyzeComplexity.mutateAsync({
        devBrief: `Feature: ${item.title}\n\nDescription: ${item.description || "No description"}`,
      });

      setComplexity(complexityResult);
      setGenerationStage("");
    } catch (error) {
      toast.error("Failed to analyze complexity");
      console.error(error);
    }
  };

  const handleQuickGenerate = async () => {
    if (!selectedFeature) return;

    setGenerationStage("Generating code...");
    setGenerationProgress(40);

    try {
      const result = await generateCode.mutateAsync({
        featureId: selectedFeature.itemId,
        githubPath: "product-management",
      });

      setGenerationProgress(100);
      setGenerationStage("Complete!");

      if (result.success && result.files) {
        toast.success("Code generated successfully!");
        // Show generated code
        console.log("Generated files:", result.files);
      } else {
        toast.error("Code generation had issues");
        // Offer handoff
        if (result.validation?.issues) {
          handleHandoff(result.files, result.validation.issues);
        }
      }
    } catch (error) {
      toast.error("Code generation failed");
      console.error(error);
      setGenerationStage("");
    }
  };

  const handleHandoff = async (generatedCode?: Record<string, string>, issues?: any[]) => {
    if (!selectedFeature) return;

    try {
      const result = await createHandoff.mutateAsync({
        featureId: selectedFeature.itemId,
        generatedCode,
        issues: issues || [],
      });

      // Copy prompt to clipboard
      navigator.clipboard.writeText(result.handoffPrompt);
      toast.success("Handoff prompt copied! Open a new Manus chat and paste it.");
    } catch (error) {
      toast.error("Failed to create handoff");
      console.error(error);
    }
  };

  const handleFullAgent = () => {
    if (!selectedFeature) return;

    const prompt = `Implement ${selectedFeature.itemId}: ${selectedFeature.title}

Context: https://github.com/EvanTenenbaum/TERP/tree/main/${selectedFeature.githubPath}/dev-brief.md

Please implement this feature following the dev-brief requirements.`;

    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied! Open a new Manus chat and paste it.");
    setShowDevDialog(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <h1 className="text-lg sm:text-xl font-bold">All Features & Items</h1>
          </div>
          <span className="text-sm text-muted-foreground">{user?.name}</span>
        </div>
      </header>

      <main className="container py-4 sm:py-8 space-y-4">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search features, ideas, bugs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="inbox">Inbox</option>
              <option value="backlog">Backlog</option>
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="archived">Archived</option>
            </select>
            <ExportData items={pmItems || []} filename="terp-features" />
          </div>
        </div>

        {/* Bulk Actions */}
        {pmItems && pmItems.length > 0 && (
          <BulkActions
            items={pmItems}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onActionComplete={() => {}}
          />
        )}

        {itemsLoading && <p className="text-center">Loading items...</p>}

        {!itemsLoading && pmItems && pmItems.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Items Yet</CardTitle>
              <CardDescription>Sync from GitHub to load your PM items</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3 sm:gap-4">
          {pmItems
            ?.filter((item) => {
              // Filter by status
              if (filterStatus !== 'all' && item.status !== filterStatus) return false;
              // Filter by search query
              if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                  item.title.toLowerCase().includes(query) ||
                  item.itemId.toLowerCase().includes(query) ||
                  (item.description && item.description.toLowerCase().includes(query))
                );
              }
              return true;
            })
            .map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className={typeColors[item.type as keyof typeof typeColors]}>
                        {item.type}
                      </Badge>
                      <Badge className={statusColors[item.status as keyof typeof statusColors]}>
                        {item.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{item.itemId}</span>
                    </div>
                    <CardTitle className="text-base sm:text-lg">{item.title}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingItem(item)}
                    >
                      Edit
                    </Button>
                    {item.type === "FEAT" && item.status === "in-progress" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDevAgent(item)}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Dev Agent</span>
                        <span className="sm:hidden">Generate</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              {item.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                    {item.description}
                  </p>
                  {item.githubPath && (
                    <a
                      href={`https://github.com/EvanTenenbaum/TERP/tree/main/${item.githubPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      View on GitHub
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </main>

      {/* Edit Feature Modal */}
      {editingItem && (
        <EditFeatureModal
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onSuccess={() => {
            utils.pmItems.list.invalidate();
            setEditingItem(null);
          }}
        />
      )}

      {/* Dev Agent Dialog */}
      <Dialog open={showDevDialog} onOpenChange={setShowDevDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Development Agent</DialogTitle>
            <DialogDescription>
              {selectedFeature?.itemId}: {selectedFeature?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {generationStage && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{generationStage}</p>
                <Progress value={generationProgress} />
              </div>
            )}

            {complexity && !generationStage && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Complexity Score</span>
                    <Badge variant={complexity.score < 40 ? "default" : "destructive"}>
                      {complexity.score}/100
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{complexity.reasoning}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                    <div>
                      <span className="text-muted-foreground">Files:</span> {complexity.factors.filesAffected}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lines:</span> ~{complexity.factors.linesEstimate}
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Requires:</span>{" "}
                      {complexity.factors.hasDatabase && "DB, "}
                      {complexity.factors.hasAuth && "Auth, "}
                      {complexity.factors.hasExternalAPI && "API, "}
                      {!complexity.factors.hasDatabase && !complexity.factors.hasAuth && !complexity.factors.hasExternalAPI && "None"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Recommendation: {complexity.recommendation === "quick" ? "Quick Generation" : "Full Agent"}</h4>
                  
                  {complexity.recommendation === "quick" && (
                    <div className="space-y-2">
                      <Button onClick={handleQuickGenerate} className="w-full" disabled={generateCode.isPending}>
                        <Code className="w-4 h-4 mr-2" />
                        Quick Generate Code
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        This feature is simple enough for automated generation. Code will be validated and auto-fixed.
                      </p>
                    </div>
                  )}

                  {complexity.recommendation === "full" && (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          This feature is too complex for quick generation. Use a full Manus development agent for best results.
                        </p>
                      </div>
                      <Button onClick={handleFullAgent} className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Develop with Manus Agent
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Opens a new chat with full context and agent capabilities for iterative development.
                      </p>
                    </div>
                  )}

                  {complexity.recommendation === "uncertain" && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">Try quick generation first, or use full agent:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handleQuickGenerate} variant="outline" size="sm" disabled={generateCode.isPending}>
                          <Code className="w-4 h-4 mr-2" />
                          Try Quick Gen
                        </Button>
                        <Button onClick={handleFullAgent} variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Full Agent
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

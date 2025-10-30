import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useAutoSync } from "@/hooks/useAutoSync";
import { Link } from "wouter";
import { MessageSquare, FileText, Bug, Lightbulb, RefreshCw, TrendingUp } from "lucide-react";
import QuickCapture from "@/components/QuickCapture";
import Timeline from "@/components/Timeline";

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: pmItems, isLoading: itemsLoading } = trpc.pmItems.list.useQuery();
  const { data: latestSync } = trpc.sync.getLatestSync.useQuery();
  const { isSyncing, lastSync, manualSync } = useAutoSync();

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

  const features = pmItems?.filter((item) => item.type === "FEAT") || [];
  const ideas = pmItems?.filter((item) => item.type === "IDEA") || [];
  const bugs = pmItems?.filter((item) => item.type === "BUG") || [];

  const handleSync = () => {
    manualSync();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3">
          <h1 className="text-lg sm:text-xl font-bold">TERP PM Hub</h1>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <span className="text-sm text-muted-foreground truncate">{user?.name}</span>
            <Button onClick={handleSync} disabled={isSyncing} size="sm" className="ml-auto">
              <RefreshCw className={`w-4 h-4 sm:mr-2 ${isSyncing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Sync</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Quick Capture - Prominently at the top */}
        <QuickCapture />

        {latestSync && (
          <div className="p-3 bg-muted rounded-lg text-sm">
            Last synced: {new Date(latestSync.startedAt).toLocaleString()} ({latestSync.itemCount} items)
          </div>
        )}

        {/* Stats Cards - Mobile optimized grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Features</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{features.length}</div>
              <p className="text-xs text-muted-foreground">Tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ideas</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ideas.length}</div>
              <p className="text-xs text-muted-foreground">In inbox</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugs</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bugs.length}</div>
              <p className="text-xs text-muted-foreground">Open</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pmItems?.length || 0}</div>
              <p className="text-xs text-muted-foreground">All items</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-3 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">AI Agents</CardTitle>
                <CardDescription className="text-sm">Chat with specialized agents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/chat/inbox">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    <span className="text-sm">Idea Inbox - Capture ideas</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/chat/planning">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="text-sm">Feature Planning - PRDs & specs</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/chat/qa">
                    <Bug className="w-4 h-4 mr-2" />
                    <span className="text-sm">QA Agent - Testing</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Feature Timeline & Dependencies
                </CardTitle>
                <CardDescription className="text-sm">
                  Visual representation of your features and their relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pmItems && pmItems.length > 0 ? (
                  <Timeline items={pmItems} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No items to display. Sync from GitHub to load your PM data.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-3 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-sm">Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/features">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="text-sm">View All Features</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="https://github.com/EvanTenenbaum/TERP/tree/main/product-management" target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="text-sm">View on GitHub</span>
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

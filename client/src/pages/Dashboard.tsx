import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { MessageSquare, FileText, Bug, Lightbulb, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: pmItems, isLoading: itemsLoading } = trpc.pmItems.list.useQuery();
  const { data: latestSync } = trpc.sync.getLatestSync.useQuery();
  const syncMutation = trpc.sync.triggerSync.useMutation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">TERP Product Management Hub</h1>
        <p className="text-muted-foreground">Please sign in to continue</p>
        <Button asChild>
          <a href={getLoginUrl()}>Sign In</a>
        </Button>
      </div>
    );
  }

  const features = pmItems?.filter((item) => item.type === "FEAT") || [];
  const ideas = pmItems?.filter((item) => item.type === "IDEA") || [];
  const bugs = pmItems?.filter((item) => item.type === "BUG") || [];

  const handleSync = async () => {
    await syncMutation.mutateAsync();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">TERP PM Hub</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">Manage your product development with AI-powered assistance</p>
          </div>
          <Button onClick={handleSync} disabled={syncMutation.isPending}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            Sync from GitHub
          </Button>
        </div>

        {latestSync && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-sm">
              Last synced: {new Date(latestSync.startedAt).toLocaleString()} ({latestSync.itemCount} items)
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Features</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{features.length}</div>
              <p className="text-xs text-muted-foreground">Total features tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ideas</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ideas.length}</div>
              <p className="text-xs text-muted-foreground">Ideas in inbox</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugs</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bugs.length}</div>
              <p className="text-xs text-muted-foreground">Open bugs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pmItems?.length || 0}</div>
              <p className="text-xs text-muted-foreground">All PM items</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>AI Agents</CardTitle>
              <CardDescription>Chat with specialized AI agents for product management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/chat/inbox">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Idea Inbox - Capture ideas effortlessly
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/chat/planning">
                  <FileText className="w-4 h-4 mr-2" />
                  Feature Planning - Generate PRDs & specs
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/chat/qa">
                  <Bug className="w-4 h-4 mr-2" />
                  QA Agent - Comprehensive testing
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/features">
                  <FileText className="w-4 h-4 mr-2" />
                  View All Features
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <a href="https://github.com/EvanTenenbaum/TERP/tree/main/product-management" target="_blank" rel="noopener noreferrer">
                  <FileText className="w-4 h-4 mr-2" />
                  View on GitHub
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

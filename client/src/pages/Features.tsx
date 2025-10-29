import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">All Features & Items</h1>
          </div>
          <span className="text-sm text-muted-foreground">{user?.name}</span>
        </div>
      </header>

      <main className="container py-8">
        {itemsLoading && <p>Loading items...</p>}

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

        <div className="grid gap-4">
          {pmItems?.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={typeColors[item.type as keyof typeof typeColors]}>
                        {item.type}
                      </Badge>
                      <Badge className={statusColors[item.status as keyof typeof statusColors]}>
                        {item.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{item.itemId}</span>
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              {item.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {item.githubPath && (
                    <a
                      href={`https://github.com/EvanTenenbaum/TERP/tree/main/${item.githubPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                    >
                      View on GitHub →
                    </a>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

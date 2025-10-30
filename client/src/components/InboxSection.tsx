import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Lightbulb, Bug, Sparkles, ArrowRight, Inbox } from "lucide-react";
import { Link } from "wouter";

export default function InboxSection() {
  const { data: pmItems, isLoading } = trpc.pmItems.list.useQuery();

  const inboxItems = pmItems?.filter((item) => item.status === "inbox") || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Inbox
          </CardTitle>
          <CardDescription>Recently captured items</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (inboxItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Inbox
          </CardTitle>
          <CardDescription>Recently captured items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Inbox className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground mb-2">No items in inbox</p>
            <p className="text-xs text-muted-foreground">
              Use Quick Capture above to add ideas, bugs, or feedback
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "IDEA":
        return <Lightbulb className="w-4 h-4" />;
      case "BUG":
        return <Bug className="w-4 h-4" />;
      case "IMPROVE":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "IDEA":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "BUG":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "IMPROVE":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "FEAT":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Inbox
          </CardTitle>
          <CardDescription>Recently captured items ({inboxItems.length})</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/inbox">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {inboxItems.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className={`p-2 rounded ${getTypeColor(item.type)}`}>
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{item.itemId}</span>
                </div>
                <h4 className="text-sm font-medium truncate">{item.title}</h4>
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
          {inboxItems.length > 5 && (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/inbox">
                View {inboxItems.length - 5} more items
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

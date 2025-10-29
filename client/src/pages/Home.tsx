import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">{APP_TITLE}</h1>
          <p className="text-xl text-muted-foreground">AI-Powered Product Management for TERP</p>
        </div>
        <div className="max-w-2xl text-center space-y-4">
          <p className="text-muted-foreground">
            Manage your product development with specialized AI agents. Capture ideas, plan features, 
            generate PRDs, and ensure quality - all integrated with your GitHub repository.
          </p>
          <Button asChild size="lg">
            <a href={getLoginUrl()}>Sign In to Get Started</a>
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

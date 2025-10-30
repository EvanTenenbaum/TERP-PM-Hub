import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Eye, EyeOff, Trash2, Save, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: apiKeyStatus, refetch } = trpc.settings.getApiKeyStatus.useQuery();
  
  const setApiKeyMutation = trpc.settings.setApiKey.useMutation({
    onSuccess: () => {
      toast.success("API key saved successfully");
      setApiKey("");
      setIsEditing(false);
      setShowApiKey(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save API key");
    },
  });

  const removeApiKeyMutation = trpc.settings.removeApiKey.useMutation({
    onSuccess: () => {
      toast.success("API key removed successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove API key");
    },
  });

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    setApiKeyMutation.mutate({ apiKey: apiKey.trim() });
  };

  const handleRemove = () => {
    if (confirm("Are you sure you want to remove your API key? You'll need to configure a new one to use AI features.")) {
      removeApiKeyMutation.mutate();
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and API configuration
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Manus API Key
          </CardTitle>
          <CardDescription>
            Configure your personal Manus API key to use AI features with your own credits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Per-User Credit Usage:</strong> When you configure your Manus API key, all AI operations 
              (triage, PRD generation, queue analysis) will charge <strong>your Manus account</strong> instead 
              of the project owner's account. This gives you full control over your AI usage and costs.
            </AlertDescription>
          </Alert>

          {apiKeyStatus?.hasApiKey && !isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    API Key Configured
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Last updated: {apiKeyStatus.updatedAt ? new Date(apiKeyStatus.updatedAt).toLocaleString() : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update API Key
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={removeApiKeyMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Your Manus API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Manus API key..."
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can find your API key in your Manus account settings
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={setApiKeyMutation.isPending || !apiKey.trim()}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {setApiKeyMutation.isPending ? "Saving..." : "Save API Key"}
                </Button>
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setApiKey("");
                      setShowApiKey(false);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Security Note:</strong> Your API key is encrypted before being stored in the database. 
              It is only decrypted when making AI API calls on your behalf.
            </AlertDescription>
          </Alert>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">How to get your Manus API Key:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Log in to your Manus account at <a href="https://manus.im" target="_blank" rel="noopener noreferrer" className="text-primary underline">manus.im</a></li>
              <li>Navigate to Account Settings</li>
              <li>Find the "API Keys" section</li>
              <li>Generate a new API key or copy an existing one</li>
              <li>Paste it here and click "Save API Key"</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Lightbulb, Send } from "lucide-react";
import { toast } from "sonner";

export default function QuickCapture() {
  const [idea, setIdea] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);

  const createConversation = trpc.conversations.create.useMutation();
  const sendMessage = trpc.chat.sendMessage.useMutation();

  const handleCapture = async () => {
    if (!idea.trim()) return;

    try {
      // Create conversation if it doesn't exist
      let convId = conversationId;
      if (!convId) {
        const result = await createConversation.mutateAsync({
          agentType: "inbox",
          title: "Quick Capture",
        });
        convId = result.conversationId;
        setConversationId(convId);
      }

      // Send message
      if (convId) {
        await sendMessage.mutateAsync({
          conversationId: convId,
          message: idea,
        });
      }

      toast.success("Idea captured! The AI is processing it...");
      setIdea("");
    } catch (error) {
      toast.error("Failed to capture idea");
      console.error(error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleCapture();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <CardTitle className="text-lg">Quick Capture</CardTitle>
        </div>
        <CardDescription>
          Jot down ideas, feedback, or notes - AI will organize them for you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type anything... ideas, bugs, improvements, questions..."
            className="min-h-[80px] resize-none"
            disabled={sendMessage.isPending}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Cmd/Ctrl + Enter to send
            </span>
            <Button
              onClick={handleCapture}
              disabled={!idea.trim() || sendMessage.isPending}
              size="sm"
            >
              <Send className="w-4 h-4 mr-2" />
              {sendMessage.isPending ? "Sending..." : "Capture"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

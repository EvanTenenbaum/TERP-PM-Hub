import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Send } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const agentTitles = {
  inbox: "Idea Inbox",
  planning: "Feature Planning",
  qa: "QA Agent",
  expert: "Codebase Expert",
};

const agentDescriptions = {
  inbox: "Capture ideas and feedback naturally - I'll classify and organize them",
  planning: "Turn ideas into detailed PRDs, technical specs, and dev-briefs",
  qa: "Comprehensive testing and quality assurance",
  expert: "Deep knowledge of your codebase and roadmap",
};

export default function Chat() {
  const { agentType = "inbox" } = useParams();
  const { user, loading, isAuthenticated } = useAuth();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversationData, refetch } = trpc.conversations.get.useQuery(
    { id: conversationId! },
    { enabled: !!conversationId }
  );

  const createConversation = trpc.conversations.create.useMutation();
  const sendMessage = trpc.chat.sendMessage.useMutation();

  useEffect(() => {
    // Create a new conversation when component mounts
    if (isAuthenticated && !conversationId) {
      createConversation
        .mutateAsync({
          agentType: agentType as any,
          title: `New ${agentTitles[agentType as keyof typeof agentTitles]} conversation`,
        })
        .then((result) => {
          setConversationId(result.conversationId);
        });
    }
  }, [isAuthenticated, agentType]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationData?.messages]);

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

  const handleSend = async () => {
    if (!message.trim() || !conversationId) return;

    const userMessage = message;
    setMessage("");

    await sendMessage.mutateAsync({
      conversationId,
      message: userMessage,
    });

    refetch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">{agentTitles[agentType as keyof typeof agentTitles]}</h1>
              <p className="text-sm text-muted-foreground">{agentDescriptions[agentType as keyof typeof agentDescriptions]}</p>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">{user?.name}</span>
        </div>
      </header>

      <main className="flex-1 container py-6 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {!conversationData?.messages.length && (
            <Card>
              <CardHeader>
                <CardTitle>Welcome to {agentTitles[agentType as keyof typeof agentTitles]}</CardTitle>
                <CardDescription>{agentDescriptions[agentType as keyof typeof agentDescriptions]}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Start a conversation by typing a message below. I'm here to help with your product management needs!
                </p>
              </CardContent>
            </Card>
          )}

          {conversationData?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {sendMessage.isPending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                <p className="text-muted-foreground">Thinking...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={sendMessage.isPending || !conversationId}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessage.isPending || !conversationId}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}

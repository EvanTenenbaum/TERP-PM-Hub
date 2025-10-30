import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { trpc } from '@/lib/trpc';
import { FileText, Lightbulb, Bug, Sparkles, Home, Inbox, MessageSquare } from 'lucide-react';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { data: items } = trpc.pmItems.list.useQuery();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'FEAT': return <FileText className="w-4 h-4" />;
      case 'IDEA': return <Lightbulb className="w-4 h-4" />;
      case 'BUG': return <Bug className="w-4 h-4" />;
      case 'IMPROVE': return <Sparkles className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleSelect = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => handleSelect(() => setLocation('/dashboard'))}>
            <Home className="w-4 h-4 mr-2" />
            <span>Go to Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => setLocation('/inbox'))}>
            <Inbox className="w-4 h-4 mr-2" />
            <span>Go to Inbox</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => setLocation('/features'))}>
            <FileText className="w-4 h-4 mr-2" />
            <span>View All Features</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => setLocation('/chat/inbox'))}>
            <MessageSquare className="w-4 h-4 mr-2" />
            <span>Chat with AI - Idea Inbox</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => setLocation('/chat/planning'))}>
            <FileText className="w-4 h-4 mr-2" />
            <span>Chat with AI - Feature Planning</span>
          </CommandItem>
        </CommandGroup>

        {items && items.length > 0 && (
          <CommandGroup heading="Features">
            {items.slice(0, 10).map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(() => setLocation(`/features?id=${item.itemId}`))}
              >
                {getIcon(item.type)}
                <span className="ml-2">{item.itemId}: {item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

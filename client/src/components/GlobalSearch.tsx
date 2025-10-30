import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, FileText, Lightbulb, Bug, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

interface GlobalSearchProps {
  onResultClick?: () => void;
}

export default function GlobalSearch({ onResultClick }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [, setLocation] = useLocation();
  
  const { data: items } = trpc.pmItems.list.useQuery();

  const filteredItems = items?.filter(item => {
    const matchesQuery = !query || 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase()) ||
      item.itemId.toLowerCase().includes(query.toLowerCase());
    
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesQuery && matchesType && matchesStatus;
  }) || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'FEAT': return <FileText className="w-4 h-4" />;
      case 'IDEA': return <Lightbulb className="w-4 h-4" />;
      case 'BUG': return <Bug className="w-4 h-4" />;
      case 'IMPROVE': return <Sparkles className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleResultClick = (itemId: string) => {
    setLocation(`/features?id=${itemId}`);
    onResultClick?.();
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search features, ideas, bugs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setQuery('')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="FEAT">Features</SelectItem>
            <SelectItem value="IDEA">Ideas</SelectItem>
            <SelectItem value="BUG">Bugs</SelectItem>
            <SelectItem value="IMPROVE">Improvements</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="inbox">Inbox</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {(typeFilter !== 'all' || statusFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTypeFilter('all');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results */}
      {query && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
          </p>
          
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No results found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredItems.map(item => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleResultClick(item.itemId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getIcon(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {item.itemId}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.status}
                          </Badge>
                        </div>
                        <h4 className="font-medium mt-1">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

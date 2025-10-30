import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react';

type Priority = 'critical' | 'high' | 'medium' | 'low' | null;

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  readOnly?: boolean;
}

const priorityConfig = {
  critical: {
    label: 'Critical',
    icon: AlertCircle,
    className: 'bg-red-500 text-white',
  },
  high: {
    label: 'High',
    icon: ArrowUp,
    className: 'bg-orange-500 text-white',
  },
  medium: {
    label: 'Medium',
    icon: Minus,
    className: 'bg-yellow-500 text-white',
  },
  low: {
    label: 'Low',
    icon: ArrowDown,
    className: 'bg-blue-500 text-white',
  },
};

export default function PrioritySelector({ value, onChange, readOnly = false }: PrioritySelectorProps) {
  if (readOnly && value) {
    const config = priorityConfig[value];
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  }

  if (readOnly) {
    return <span className="text-sm text-muted-foreground">No priority</span>;
  }

  return (
    <Select value={value || 'none'} onValueChange={(v) => onChange(v === 'none' ? null : v as Priority)}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Set priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No priority</SelectItem>
        <SelectItem value="critical">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            Critical
          </div>
        </SelectItem>
        <SelectItem value="high">
          <div className="flex items-center gap-2">
            <ArrowUp className="w-4 h-4 text-orange-500" />
            High
          </div>
        </SelectItem>
        <SelectItem value="medium">
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-yellow-500" />
            Medium
          </div>
        </SelectItem>
        <SelectItem value="low">
          <div className="flex items-center gap-2">
            <ArrowDown className="w-4 h-4 text-blue-500" />
            Low
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

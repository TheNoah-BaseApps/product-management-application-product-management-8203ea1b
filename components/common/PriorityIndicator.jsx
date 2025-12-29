'use client';

import { Badge } from '@/components/ui/badge';
import { getPriorityColor } from '@/lib/utils';
import { AlertCircle, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

export default function PriorityIndicator({ priority }) {
  if (!priority) return null;

  const icons = {
    critical: <AlertCircle className="h-3 w-3" />,
    high: <ArrowUp className="h-3 w-3" />,
    medium: <ArrowRight className="h-3 w-3" />,
    low: <ArrowDown className="h-3 w-3" />
  };

  return (
    <Badge className={getPriorityColor(priority)}>
      <span className="flex items-center gap-1">
        {icons[priority]}
        {priority.toUpperCase()}
      </span>
    </Badge>
  );
}
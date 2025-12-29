'use client';

import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/lib/utils';

export default function StatusBadge({ status }) {
  if (!status) return null;

  return (
    <Badge className={getStatusColor(status)}>
      {status.replace('_', ' ').toUpperCase()}
    </Badge>
  );
}
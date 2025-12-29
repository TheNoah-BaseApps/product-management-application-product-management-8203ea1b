'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import PriorityIndicator from '@/components/common/PriorityIndicator';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import { truncateText } from '@/lib/utils';
import { Eye, FileText } from 'lucide-react';

export default function RequirementList({ requirements, loading, onRefresh }) {
  const router = useRouter();

  if (loading) {
    return <LoadingSkeleton count={5} type="card" />;
  }

  if (!requirements || requirements.length === 0) {
    return (
      <EmptyState
        title="No requirements yet"
        description="Create your first requirement to define product features"
        icon={FileText}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {requirements.map((req) => (
        <Card key={req.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{req.requirement_id}</CardTitle>
                <p className="text-sm text-gray-600">{truncateText(req.user_story, 100)}</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={req.status} />
                <PriorityIndicator priority={req.priority} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-medium capitalize">{req.requirement_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Complexity</p>
                <p className="text-sm font-medium uppercase">{req.complexity}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Roadmap</p>
                <p className="text-sm font-medium">{req.roadmap_name || 'None'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created By</p>
                <p className="text-sm font-medium">{req.created_by_name || 'Unknown'}</p>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/requirements/${req.id}`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import { formatDate } from '@/lib/utils';
import { Eye, Edit, Trash2, Map } from 'lucide-react';

export default function RoadmapList({ roadmaps, loading, onRefresh }) {
  const router = useRouter();

  if (loading) {
    return <LoadingSkeleton count={5} type="card" />;
  }

  if (!roadmaps || roadmaps.length === 0) {
    return (
      <EmptyState
        title="No roadmaps yet"
        description="Create your first product roadmap to start planning"
        icon={Map}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {roadmaps.map((roadmap) => (
        <Card key={roadmap.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{roadmap.roadmap_name}</CardTitle>
                <p className="text-sm text-gray-600">{roadmap.roadmap_id}</p>
              </div>
              <StatusBadge status={roadmap.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Timeframe</p>
                <p className="text-sm font-medium">{roadmap.timeframe}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Theme</p>
                <p className="text-sm font-medium">{roadmap.strategic_theme}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Visibility</p>
                <p className="text-sm font-medium">{roadmap.stakeholder_visibility}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="text-sm font-medium">{formatDate(roadmap.last_updated_date)}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/roadmaps/${roadmap.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
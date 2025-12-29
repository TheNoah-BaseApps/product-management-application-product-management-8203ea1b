'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import { truncateText } from '@/lib/utils';
import { Eye, Lightbulb } from 'lucide-react';

export default function IdeaList({ ideas, loading, onRefresh }) {
  const router = useRouter();

  if (loading) {
    return <LoadingSkeleton count={5} type="card" />;
  }

  if (!ideas || ideas.length === 0) {
    return (
      <EmptyState
        title="No ideas yet"
        description="Submit your first product idea to get started"
        icon={Lightbulb}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {ideas.map((idea) => (
        <Card key={idea.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{idea.idea_name}</CardTitle>
                <p className="text-sm text-gray-600">{idea.idea_id}</p>
              </div>
              <StatusBadge status={idea.triage_status} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">{truncateText(idea.problem_statement, 150)}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Impact</p>
                <Badge variant="outline" className="mt-1">{idea.estimated_impact}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Feasibility</p>
                <Badge variant="outline" className="mt-1">{idea.feasibility}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Target Customer</p>
                <p className="text-sm font-medium">{truncateText(idea.target_customer, 30)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Submitted By</p>
                <p className="text-sm font-medium">{idea.submitted_by_name || 'Unknown'}</p>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/ideas/${idea.id}`)}
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
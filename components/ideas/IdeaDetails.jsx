'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/common/StatusBadge';
import CommentSection from '@/components/shared/CommentSection';
import TriageWorkflow from '@/components/ideas/TriageWorkflow';
import { Edit } from 'lucide-react';

export default function IdeaDetails({ idea, onUpdate }) {
  if (!idea) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{idea.idea_name}</CardTitle>
              <p className="text-sm text-gray-600">{idea.idea_id}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={idea.triage_status} />
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Problem Statement</h3>
            <p className="text-sm text-gray-800">{idea.problem_statement}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Target Customer</h3>
              <p className="text-sm text-gray-800">{idea.target_customer}</p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Estimated Impact</p>
                <Badge className="mt-1">{idea.estimated_impact}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Feasibility</p>
                <Badge className="mt-1">{idea.feasibility}</Badge>
              </div>
            </div>
          </div>

          {idea.alignment_with_strategy && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Strategic Alignment</h3>
              <p className="text-sm text-gray-600">{idea.alignment_with_strategy}</p>
            </div>
          )}

          {idea.competitive_advantage && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Competitive Advantage</h3>
              <p className="text-sm text-gray-600">{idea.competitive_advantage}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-gray-500">Submitted By</p>
              <p className="text-sm font-medium">{idea.submitted_by_name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Triaged By</p>
              <p className="text-sm font-medium">{idea.triaged_by_name || 'Pending'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <TriageWorkflow idea={idea} onUpdate={onUpdate} />

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentSection entityType="idea" entityId={idea.id} />
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import PriorityIndicator from '@/components/common/PriorityIndicator';
import CommentSection from '@/components/shared/CommentSection';
import AttachmentUploader from '@/components/shared/AttachmentUploader';
import ValidationWorkflow from '@/components/requirements/ValidationWorkflow';
import { Edit, User } from 'lucide-react';

export default function RequirementDetails({ requirement, onUpdate }) {
  if (!requirement) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{requirement.requirement_id}</CardTitle>
              <p className="text-sm text-gray-600 capitalize">{requirement.requirement_type}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={requirement.status} />
              <PriorityIndicator priority={requirement.priority} />
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">User Story</h3>
            <p className="text-sm text-gray-800">{requirement.user_story}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Acceptance Criteria</h3>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{requirement.acceptance_criteria}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Complexity</p>
              <p className="text-sm font-medium uppercase">{requirement.complexity}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Roadmap</p>
              <p className="text-sm font-medium">{requirement.roadmap_name || 'None'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Created By</p>
              <p className="text-sm font-medium">{requirement.created_by_name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Validated By</p>
              <p className="text-sm font-medium">{requirement.validated_by_name || 'Pending'}</p>
            </div>
          </div>

          {requirement.technical_constraints && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Technical Constraints</h3>
              <p className="text-sm text-gray-600">{requirement.technical_constraints}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ValidationWorkflow requirement={requirement} onUpdate={onUpdate} />

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentSection entityType="requirement" entityId={requirement.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <AttachmentUploader entityType="requirement" entityId={requirement.id} />
        </CardContent>
      </Card>
    </div>
  );
}
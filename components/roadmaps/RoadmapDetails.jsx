'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/common/StatusBadge';
import CommentSection from '@/components/shared/CommentSection';
import AttachmentUploader from '@/components/shared/AttachmentUploader';
import ApprovalWorkflow from '@/components/roadmaps/ApprovalWorkflow';
import { formatDate } from '@/lib/utils';
import { Edit, Calendar, User, Shield } from 'lucide-react';

export default function RoadmapDetails({ roadmap, onUpdate }) {
  if (!roadmap) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{roadmap.roadmap_name}</CardTitle>
              <p className="text-sm text-gray-600">{roadmap.roadmap_id}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={roadmap.status} />
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Timeframe</p>
                  <p className="text-sm font-medium">{roadmap.timeframe}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Strategic Theme</p>
                  <p className="text-sm font-medium">{roadmap.strategic_theme}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Stakeholder Visibility</p>
                  <Badge variant="outline">{roadmap.stakeholder_visibility}</Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Dates & People</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium">{formatDate(roadmap.last_updated_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Created By</p>
                    <p className="text-sm font-medium">{roadmap.created_by_name || 'Unknown'}</p>
                  </div>
                </div>
                {roadmap.approved_by_name && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Approved By</p>
                      <p className="text-sm font-medium">{roadmap.approved_by_name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {roadmap.risk_assessment && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Risk Assessment</h3>
              <p className="text-sm text-gray-600">{roadmap.risk_assessment}</p>
            </div>
          )}

          {roadmap.dependencies && roadmap.dependencies.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Dependencies</h3>
              <div className="flex flex-wrap gap-2">
                {roadmap.dependencies.map((dep, idx) => (
                  <Badge key={idx} variant="secondary">{dep}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ApprovalWorkflow roadmap={roadmap} onUpdate={onUpdate} />

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentSection entityType="roadmap" entityId={roadmap.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <AttachmentUploader entityType="roadmap" entityId={roadmap.id} />
        </CardContent>
      </Card>
    </div>
  );
}
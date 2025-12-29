'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ApprovalWorkflow({ roadmap, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/roadmaps/${roadmap.id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to approve roadmap');
        setLoading(false);
        return;
      }

      toast.success('Roadmap approved successfully');
      onUpdate?.();
    } catch (err) {
      console.error('Error approving roadmap:', err);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (roadmap.status === 'approved') {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          This roadmap has been approved by {roadmap.approved_by_name} on {new Date(roadmap.approval_date).toLocaleDateString()}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This roadmap is pending approval. Review the details and approve if ready.
          </p>
          <Button onClick={handleApprove} disabled={loading}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {loading ? 'Approving...' : 'Approve Roadmap'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
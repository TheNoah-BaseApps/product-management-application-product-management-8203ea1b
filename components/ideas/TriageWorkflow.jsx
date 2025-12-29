'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function TriageWorkflow({ idea, onUpdate }) {
  const [status, setStatus] = useState(idea.triage_status);
  const [nextSteps, setNextSteps] = useState(idea.next_steps || '');
  const [loading, setLoading] = useState(false);

  const handleTriage = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/ideas/${idea.id}/triage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, next_steps: nextSteps })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to triage idea');
        setLoading(false);
        return;
      }

      toast.success('Idea triaged successfully');
      onUpdate?.();
    } catch (err) {
      console.error('Error triaging idea:', err);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/ideas/${idea.id}/promote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to promote idea');
        setLoading(false);
        return;
      }

      toast.success('Idea promoted to requirement successfully');
      onUpdate?.();
    } catch (err) {
      console.error('Error promoting idea:', err);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Triage Workflow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Triage Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="next_steps">Next Steps</Label>
          <Textarea
            id="next_steps"
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            rows={3}
            placeholder="Describe the next steps for this idea"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleTriage} disabled={loading}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Update Triage'}
          </Button>
          
          {idea.triage_status === 'approved' && !idea.requirement_id && (
            <Button onClick={handlePromote} disabled={loading} variant="secondary">
              <ArrowRight className="h-4 w-4 mr-2" />
              Promote to Requirement
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
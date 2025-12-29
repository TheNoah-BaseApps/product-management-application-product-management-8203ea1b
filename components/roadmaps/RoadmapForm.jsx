'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function RoadmapForm({ onSuccess, initialData = null }) {
  const [formData, setFormData] = useState({
    roadmap_name: initialData?.roadmap_name || '',
    timeframe: initialData?.timeframe || '',
    strategic_theme: initialData?.strategic_theme || '',
    stakeholder_visibility: initialData?.stakeholder_visibility || 'internal',
    status: initialData?.status || 'planning',
    risk_assessment: initialData?.risk_assessment || '',
    presentation_version: initialData?.presentation_version || '1.0'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = initialData ? `/api/roadmaps/${initialData.id}` : '/api/roadmaps';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save roadmap');
        setLoading(false);
        return;
      }

      toast.success(data.message);
      onSuccess?.();
    } catch (err) {
      console.error('Error saving roadmap:', err);
      setError('An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="roadmap_name">Roadmap Name *</Label>
        <Input
          id="roadmap_name"
          value={formData.roadmap_name}
          onChange={(e) => setFormData({ ...formData, roadmap_name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeframe">Timeframe *</Label>
        <Input
          id="timeframe"
          placeholder="e.g., Q1 2024"
          value={formData.timeframe}
          onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="strategic_theme">Strategic Theme *</Label>
        <Input
          id="strategic_theme"
          value={formData.strategic_theme}
          onChange={(e) => setFormData({ ...formData, strategic_theme: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stakeholder_visibility">Visibility</Label>
          <Select
            value={formData.stakeholder_visibility}
            onValueChange={(value) => setFormData({ ...formData, stakeholder_visibility: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="confidential">Confidential</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="risk_assessment">Risk Assessment</Label>
        <Textarea
          id="risk_assessment"
          value={formData.risk_assessment}
          onChange={(e) => setFormData({ ...formData, risk_assessment: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
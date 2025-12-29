'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function RequirementForm({ onSuccess, initialData = null }) {
  const [roadmaps, setRoadmaps] = useState([]);
  const [formData, setFormData] = useState({
    requirement_type: initialData?.requirement_type || 'feature',
    user_story: initialData?.user_story || '',
    acceptance_criteria: initialData?.acceptance_criteria || '',
    priority: initialData?.priority || 'medium',
    complexity: initialData?.complexity || 'm',
    status: initialData?.status || 'draft',
    technical_constraints: initialData?.technical_constraints || '',
    roadmap_id: initialData?.roadmap_id || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/roadmaps', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmaps(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching roadmaps:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = initialData ? `/api/requirements/${initialData.id}` : '/api/requirements';
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
        setError(data.error || 'Failed to save requirement');
        setLoading(false);
        return;
      }

      toast.success(data.message);
      onSuccess?.();
    } catch (err) {
      console.error('Error saving requirement:', err);
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="requirement_type">Type *</Label>
          <Select
            value={formData.requirement_type}
            onValueChange={(value) => setFormData({ ...formData, requirement_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="enhancement">Enhancement</SelectItem>
              <SelectItem value="bugfix">Bug Fix</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="roadmap_id">Roadmap</Label>
          <Select
            value={formData.roadmap_id}
            onValueChange={(value) => setFormData({ ...formData, roadmap_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select roadmap" />
            </SelectTrigger>
            <SelectContent>
              {roadmaps.map((roadmap) => (
                <SelectItem key={roadmap.id} value={roadmap.id}>
                  {roadmap.roadmap_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="user_story">User Story *</Label>
        <Textarea
          id="user_story"
          placeholder="As a [user], I want [feature] so that [benefit]"
          value={formData.user_story}
          onChange={(e) => setFormData({ ...formData, user_story: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="acceptance_criteria">Acceptance Criteria *</Label>
        <Textarea
          id="acceptance_criteria"
          placeholder="Given [context], when [action], then [result]"
          value={formData.acceptance_criteria}
          onChange={(e) => setFormData({ ...formData, acceptance_criteria: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="complexity">Complexity</Label>
          <Select
            value={formData.complexity}
            onValueChange={(value) => setFormData({ ...formData, complexity: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xs">XS</SelectItem>
              <SelectItem value="s">S</SelectItem>
              <SelectItem value="m">M</SelectItem>
              <SelectItem value="l">L</SelectItem>
              <SelectItem value="xl">XL</SelectItem>
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="validated">Validated</SelectItem>
              <SelectItem value="in_development">In Development</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="technical_constraints">Technical Constraints</Label>
        <Textarea
          id="technical_constraints"
          value={formData.technical_constraints}
          onChange={(e) => setFormData({ ...formData, technical_constraints: e.target.value })}
          rows={2}
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
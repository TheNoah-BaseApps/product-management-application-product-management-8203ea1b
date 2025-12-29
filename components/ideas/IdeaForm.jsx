'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function IdeaForm({ onSuccess, initialData = null }) {
  const [formData, setFormData] = useState({
    idea_name: initialData?.idea_name || '',
    problem_statement: initialData?.problem_statement || '',
    target_customer: initialData?.target_customer || '',
    estimated_impact: initialData?.estimated_impact || 'medium',
    feasibility: initialData?.feasibility || 'medium',
    alignment_with_strategy: initialData?.alignment_with_strategy || '',
    competitive_advantage: initialData?.competitive_advantage || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = initialData ? `/api/ideas/${initialData.id}` : '/api/ideas';
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
        setError(data.error || 'Failed to save idea');
        setLoading(false);
        return;
      }

      toast.success(data.message);
      onSuccess?.();
    } catch (err) {
      console.error('Error saving idea:', err);
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
        <Label htmlFor="idea_name">Idea Name *</Label>
        <Input
          id="idea_name"
          value={formData.idea_name}
          onChange={(e) => setFormData({ ...formData, idea_name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="problem_statement">Problem Statement *</Label>
        <Textarea
          id="problem_statement"
          placeholder="Describe the problem this idea solves"
          value={formData.problem_statement}
          onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_customer">Target Customer *</Label>
        <Input
          id="target_customer"
          placeholder="Who will benefit from this?"
          value={formData.target_customer}
          onChange={(e) => setFormData({ ...formData, target_customer: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimated_impact">Estimated Impact</Label>
          <Select
            value={formData.estimated_impact}
            onValueChange={(value) => setFormData({ ...formData, estimated_impact: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="feasibility">Feasibility</Label>
          <Select
            value={formData.feasibility}
            onValueChange={(value) => setFormData({ ...formData, feasibility: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="alignment_with_strategy">Alignment with Strategy</Label>
        <Textarea
          id="alignment_with_strategy"
          placeholder="How does this align with our product strategy?"
          value={formData.alignment_with_strategy}
          onChange={(e) => setFormData({ ...formData, alignment_with_strategy: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="competitive_advantage">Competitive Advantage</Label>
        <Textarea
          id="competitive_advantage"
          placeholder="What competitive advantage does this provide?"
          value={formData.competitive_advantage}
          onChange={(e) => setFormData({ ...formData, competitive_advantage: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update' : 'Submit'}
        </Button>
      </div>
    </form>
  );
}
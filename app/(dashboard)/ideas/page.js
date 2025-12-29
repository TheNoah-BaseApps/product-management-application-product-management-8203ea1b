'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus } from 'lucide-react';
import IdeaList from '@/components/ideas/IdeaList';
import IdeaForm from '@/components/ideas/IdeaForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BreadcrumbNav from '@/components/layout/BreadcrumbNav';
import { toast } from 'sonner';

export default function IdeasPage() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ideas', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch ideas');

      const data = await res.json();
      setIdeas(data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching ideas:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowForm(false);
    fetchIdeas();
    toast.success('Idea submitted successfully');
  };

  return (
    <div className="space-y-6">
      <BreadcrumbNav items={[{ label: 'Ideas' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Ideas</h1>
          <p className="text-gray-600 mt-1">Submit and triage product ideas</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Submit Idea
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <IdeaList
        ideas={ideas}
        loading={loading}
        onRefresh={fetchIdeas}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Submit New Idea</DialogTitle>
          </DialogHeader>
          <IdeaForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
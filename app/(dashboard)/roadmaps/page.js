'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus } from 'lucide-react';
import RoadmapList from '@/components/roadmaps/RoadmapList';
import RoadmapForm from '@/components/roadmaps/RoadmapForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BreadcrumbNav from '@/components/layout/BreadcrumbNav';
import { toast } from 'sonner';

export default function RoadmapsPage() {
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/roadmaps', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch roadmaps');

      const data = await res.json();
      setRoadmaps(data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching roadmaps:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowForm(false);
    fetchRoadmaps();
    toast.success('Roadmap created successfully');
  };

  return (
    <div className="space-y-6">
      <BreadcrumbNav items={[{ label: 'Roadmaps' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Roadmaps</h1>
          <p className="text-gray-600 mt-1">Strategic planning and timeline management</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Roadmap
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <RoadmapList
        roadmaps={roadmaps}
        loading={loading}
        onRefresh={fetchRoadmaps}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Roadmap</DialogTitle>
          </DialogHeader>
          <RoadmapForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
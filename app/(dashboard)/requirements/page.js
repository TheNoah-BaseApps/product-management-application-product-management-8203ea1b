'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus } from 'lucide-react';
import RequirementList from '@/components/requirements/RequirementList';
import RequirementForm from '@/components/requirements/RequirementForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BreadcrumbNav from '@/components/layout/BreadcrumbNav';
import { toast } from 'sonner';

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/requirements', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch requirements');

      const data = await res.json();
      setRequirements(data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching requirements:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowForm(false);
    fetchRequirements();
    toast.success('Requirement created successfully');
  };

  return (
    <div className="space-y-6">
      <BreadcrumbNav items={[{ label: 'Requirements' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Requirements</h1>
          <p className="text-gray-600 mt-1">Define and manage feature specifications</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Requirement
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <RequirementList
        requirements={requirements}
        loading={loading}
        onRefresh={fetchRequirements}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Requirement</DialogTitle>
          </DialogHeader>
          <RequirementForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
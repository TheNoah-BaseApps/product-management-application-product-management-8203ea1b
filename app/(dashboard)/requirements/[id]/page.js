'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import RequirementDetails from '@/components/requirements/RequirementDetails';
import BreadcrumbNav from '@/components/layout/BreadcrumbNav';

export default function RequirementDetailPage() {
  const params = useParams();
  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchRequirement();
    }
  }, [params.id]);

  const fetchRequirement = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/requirements/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch requirement');

      const data = await res.json();
      setRequirement(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching requirement:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <BreadcrumbNav
        items={[
          { label: 'Requirements', href: '/requirements' },
          { label: requirement?.requirement_id || 'Details' }
        ]}
      />

      <RequirementDetails requirement={requirement} onUpdate={fetchRequirement} />
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import IdeaDetails from '@/components/ideas/IdeaDetails';
import BreadcrumbNav from '@/components/layout/BreadcrumbNav';

export default function IdeaDetailPage() {
  const params = useParams();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchIdea();
    }
  }, [params.id]);

  const fetchIdea = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/ideas/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch idea');

      const data = await res.json();
      setIdea(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching idea:', err);
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
          { label: 'Ideas', href: '/ideas' },
          { label: idea?.idea_name || 'Details' }
        ]}
      />

      <IdeaDetails idea={idea} onUpdate={fetchIdea} />
    </div>
  );
}
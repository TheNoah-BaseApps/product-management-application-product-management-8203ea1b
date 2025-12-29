'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import ChartWidget from '@/components/dashboard/ChartWidget';
import BreadcrumbNav from '@/components/layout/BreadcrumbNav';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/analytics/workflow-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch analytics');

      const data = await res.json();
      setStats(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
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
      <BreadcrumbNav items={[{ label: 'Analytics' }]} />

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
        <p className="text-gray-600 mt-1">Workflow statistics and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          title="Requirements by Priority"
          data={stats?.requirementsByPriority?.reduce((acc, item) => {
            acc[item.priority] = parseInt(item.count);
            return acc;
          }, {}) || {}}
          type="bar"
        />
        
        <ChartWidget
          title="Ideas by Impact"
          data={stats?.ideasByImpact?.reduce((acc, item) => {
            acc[item.estimated_impact] = parseInt(item.count);
            return acc;
          }, {}) || {}}
          type="pie"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completion Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Roadmaps</span>
                <span className="text-sm text-gray-600">
                  {stats?.completionRates?.completed_roadmaps || 0} / {stats?.completionRates?.total_roadmaps || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      ((stats?.completionRates?.completed_roadmaps || 0) /
                        (stats?.completionRates?.total_roadmaps || 1)) *
                      100
                    }%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Requirements</span>
                <span className="text-sm text-gray-600">
                  {stats?.completionRates?.completed_requirements || 0} / {stats?.completionRates?.total_requirements || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${
                      ((stats?.completionRates?.completed_requirements || 0) /
                        (stats?.completionRates?.total_requirements || 1)) *
                      100
                    }%`
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
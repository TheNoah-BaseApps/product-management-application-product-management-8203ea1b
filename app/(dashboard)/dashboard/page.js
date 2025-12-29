'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import MetricsCard from '@/components/dashboard/MetricsCard';
import WorkflowKanbanBoard from '@/components/dashboard/WorkflowKanbanBoard';
import ChartWidget from '@/components/dashboard/ChartWidget';
import { BarChart3, Lightbulb, FileText, Map, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/analytics/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch dashboard data');

      const data = await res.json();
      setMetrics(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of product management workflows</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Roadmaps"
          value={metrics?.roadmaps?.total || 0}
          icon={<Map className="h-5 w-5" />}
          trend={`${Object.keys(metrics?.roadmaps?.byStatus || {}).length} statuses`}
          color="blue"
        />
        <MetricsCard
          title="Requirements"
          value={metrics?.requirements?.total || 0}
          icon={<FileText className="h-5 w-5" />}
          trend={`${metrics?.requirements?.byStatus?.validated || 0} validated`}
          color="green"
        />
        <MetricsCard
          title="Product Ideas"
          value={metrics?.ideas?.total || 0}
          icon={<Lightbulb className="h-5 w-5" />}
          trend={`${metrics?.ideas?.byStatus?.submitted || 0} pending triage`}
          color="yellow"
        />
        <MetricsCard
          title="Recent Activity"
          value={metrics?.recentActivity?.length || 0}
          icon={<Activity className="h-5 w-5" />}
          trend="Last 10 actions"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          title="Roadmap Status Distribution"
          data={metrics?.roadmaps?.byStatus || {}}
          type="pie"
        />
        <ChartWidget
          title="Requirement Priority"
          data={metrics?.requirements?.byStatus || {}}
          type="bar"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowKanbanBoard />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics?.recentActivity?.length > 0 ? (
              metrics.recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.entity_type}</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
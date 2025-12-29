'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export default function MetricsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  description,
  loading = false 
}) {
  const getTrendIcon = () => {
    if (!trend || trend === 'neutral') return Minus;
    return trend === 'up' ? ArrowUp : ArrowDown;
  };

  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return 'text-gray-500';
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getTrendBgColor = () => {
    if (!trend || trend === 'neutral') return 'bg-gray-100';
    return trend === 'up' ? 'bg-green-100' : 'bg-red-100';
  };

  const TrendIcon = getTrendIcon();

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold tracking-tight">
            {value !== null && value !== undefined ? value : '—'}
          </div>
          
          {(trendValue || description) && (
            <div className="flex items-center gap-2 text-sm">
              {trendValue && trend && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getTrendBgColor()}`}>
                  <TrendIcon className={`h-3 w-3 ${getTrendColor()}`} />
                  <span className={`font-medium ${getTrendColor()}`}>
                    {trendValue}
                  </span>
                </div>
              )}
              
              {description && (
                <span className="text-muted-foreground">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
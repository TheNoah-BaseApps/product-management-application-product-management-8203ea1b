'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TimelineChart({ roadmaps = [] }) {
  if (!roadmaps || roadmaps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Roadmap Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No roadmap data to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roadmap Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roadmaps.map((roadmap, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-gray-600">
                {roadmap.timeframe}
              </div>
              <div className="flex-1">
                <div className="h-10 bg-blue-100 rounded-lg flex items-center px-4">
                  <p className="text-sm font-medium text-blue-900">{roadmap.roadmap_name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
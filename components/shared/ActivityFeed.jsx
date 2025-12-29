'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, formatRelativeTime } from '@/lib/utils';

export default function ActivityFeed({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => (
        <div key={idx} className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {getInitials(activity.user_name || 'U')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{activity.user_name || 'Unknown User'}</span>
              <span className="text-sm text-gray-600">{activity.action}</span>
              <span className="text-sm text-gray-600 capitalize">{activity.entity_type}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatRelativeTime(activity.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
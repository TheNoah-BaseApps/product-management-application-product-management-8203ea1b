/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Analytics]
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { canViewAnalytics } from '@/lib/permissions';

export async function GET(request) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!canViewAnalytics(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const roadmapsCount = await query(
      'SELECT COUNT(*) as total, status FROM product_roadmaps GROUP BY status'
    );

    const requirementsCount = await query(
      'SELECT COUNT(*) as total, status FROM product_requirements GROUP BY status'
    );

    const ideasCount = await query(
      'SELECT COUNT(*) as total, triage_status FROM product_ideas GROUP BY triage_status'
    );

    const recentActivity = await query(
      `SELECT * FROM activity_logs
       ORDER BY created_at DESC
       LIMIT 10`
    );

    const totalRoadmaps = await query('SELECT COUNT(*) as total FROM product_roadmaps');
    const totalRequirements = await query('SELECT COUNT(*) as total FROM product_requirements');
    const totalIdeas = await query('SELECT COUNT(*) as total FROM product_ideas');

    return NextResponse.json(
      {
        success: true,
        data: {
          roadmaps: {
            total: parseInt(totalRoadmaps.rows[0].total),
            byStatus: roadmapsCount.rows.reduce((acc, row) => {
              acc[row.status] = parseInt(row.total);
              return acc;
            }, {})
          },
          requirements: {
            total: parseInt(totalRequirements.rows[0].total),
            byStatus: requirementsCount.rows.reduce((acc, row) => {
              acc[row.status] = parseInt(row.total);
              return acc;
            }, {})
          },
          ideas: {
            total: parseInt(totalIdeas.rows[0].total),
            byStatus: ideasCount.rows.reduce((acc, row) => {
              acc[row.triage_status] = parseInt(row.total);
              return acc;
            }, {})
          },
          recentActivity: recentActivity.rows
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/analytics/dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}
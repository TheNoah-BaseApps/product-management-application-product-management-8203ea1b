/**
 * @swagger
 * /api/analytics/workflow-stats:
 *   get:
 *     summary: Get workflow statistics
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

    const roadmapsByMonth = await query(
      `SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
       FROM product_roadmaps
       WHERE created_at >= NOW() - INTERVAL '6 months'
       GROUP BY month
       ORDER BY month`
    );

    const requirementsByPriority = await query(
      `SELECT priority, COUNT(*) as count
       FROM product_requirements
       GROUP BY priority`
    );

    const ideasByImpact = await query(
      `SELECT estimated_impact, COUNT(*) as count
       FROM product_ideas
       GROUP BY estimated_impact`
    );

    const completionRates = await query(
      `SELECT
        (SELECT COUNT(*) FROM product_roadmaps WHERE status = 'completed') as completed_roadmaps,
        (SELECT COUNT(*) FROM product_roadmaps) as total_roadmaps,
        (SELECT COUNT(*) FROM product_requirements WHERE status = 'completed') as completed_requirements,
        (SELECT COUNT(*) FROM product_requirements) as total_requirements`
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          roadmapsByMonth: roadmapsByMonth.rows,
          requirementsByPriority: requirementsByPriority.rows,
          ideasByImpact: ideasByImpact.rows,
          completionRates: completionRates.rows[0]
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/analytics/workflow-stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflow stats' },
      { status: 500 }
    );
  }
}
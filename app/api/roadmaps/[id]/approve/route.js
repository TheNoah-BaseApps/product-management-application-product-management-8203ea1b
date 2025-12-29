/**
 * @swagger
 * /api/roadmaps/{id}/approve:
 *   post:
 *     summary: Approve a roadmap
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { canApproveRoadmap } from '@/lib/permissions';
import { logActivity } from '@/lib/db';
import { notifyRoadmapApproved } from '@/lib/notifications';

export async function POST(request, { params }) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!canApproveRoadmap(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;

    const existing = await query(
      'SELECT * FROM product_roadmaps WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Roadmap not found' },
        { status: 404 }
      );
    }

    const roadmap = existing.rows[0];

    if (roadmap.status === 'approved') {
      return NextResponse.json(
        { success: false, error: 'Roadmap already approved' },
        { status: 400 }
      );
    }

    const oldChangeLog = roadmap.change_log || [];
    const newChangeLog = [
      ...oldChangeLog,
      {
        action: 'approved',
        timestamp: new Date(),
        user_id: currentUser.userId
      }
    ];

    const result = await query(
      `UPDATE product_roadmaps SET
        status = 'approved',
        approved_by = $1,
        approval_date = CURRENT_DATE,
        last_updated_date = NOW(),
        change_log = $2
      WHERE id = $3
      RETURNING *`,
      [currentUser.userId, JSON.stringify(newChangeLog), id]
    );

    await logActivity(
      currentUser.userId,
      'approve',
      'roadmap',
      id,
      { approved_by: currentUser.userId }
    );

    await notifyRoadmapApproved(
      id,
      roadmap.roadmap_name,
      roadmap.created_by,
      currentUser.userId
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Roadmap approved successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/roadmaps/[id]/approve:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve roadmap' },
      { status: 500 }
    );
  }
}
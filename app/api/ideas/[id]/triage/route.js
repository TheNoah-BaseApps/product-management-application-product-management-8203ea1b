/**
 * @swagger
 * /api/ideas/{id}/triage:
 *   post:
 *     summary: Triage an idea
 *     tags: [Ideas]
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { canTriageIdea } from '@/lib/permissions';
import { validateStatus, sanitizeInput } from '@/lib/validation';
import { logActivity } from '@/lib/db';
import { notifyIdeaTriaged } from '@/lib/notifications';

export async function POST(request, { params }) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!canTriageIdea(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status, next_steps } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    if (!validateStatus(status, 'idea')) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const existing = await query(
      'SELECT * FROM product_ideas WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      );
    }

    const idea = existing.rows[0];

    const result = await query(
      `UPDATE product_ideas SET
        triage_status = $1,
        triage_date = CURRENT_DATE,
        triaged_by = $2,
        next_steps = $3
      WHERE id = $4
      RETURNING *`,
      [
        status,
        currentUser.userId,
        next_steps ? sanitizeInput(next_steps) : null,
        id
      ]
    );

    await logActivity(
      currentUser.userId,
      'triage',
      'idea',
      id,
      { status, triaged_by: currentUser.userId }
    );

    await notifyIdeaTriaged(
      id,
      idea.idea_name,
      idea.submitted_by,
      status
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Idea triaged successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/ideas/[id]/triage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to triage idea' },
      { status: 500 }
    );
  }
}
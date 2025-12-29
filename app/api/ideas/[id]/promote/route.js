/**
 * @swagger
 * /api/ideas/{id}/promote:
 *   post:
 *     summary: Promote an idea to a requirement
 *     tags: [Ideas]
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { canPromoteIdea } from '@/lib/permissions';
import { generateRequirementId } from '@/lib/idGenerator';
import { logActivity } from '@/lib/db';
import { notifyIdeaPromoted } from '@/lib/notifications';

export async function POST(request, { params }) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!canPromoteIdea(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;

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

    if (idea.requirement_id) {
      return NextResponse.json(
        { success: false, error: 'Idea already promoted' },
        { status: 400 }
      );
    }

    const requirementId = generateRequirementId();

    const requirement = await query(
      `INSERT INTO product_requirements (
        requirement_id, requirement_type, user_story, acceptance_criteria,
        priority, complexity, status, created_by, created_at, last_updated_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [
        requirementId,
        'feature',
        idea.problem_statement,
        `Target customer: ${idea.target_customer}`,
        'medium',
        'm',
        'draft',
        currentUser.userId
      ]
    );

    await query(
      `UPDATE product_ideas SET
        requirement_id = $1,
        triage_status = 'approved'
      WHERE id = $2`,
      [requirement.rows[0].id, id]
    );

    await logActivity(
      currentUser.userId,
      'promote',
      'idea',
      id,
      { promoted_to: requirementId }
    );

    await notifyIdeaPromoted(
      id,
      idea.idea_name,
      idea.submitted_by,
      requirement.rows[0].id
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          idea: { ...idea, requirement_id: requirement.rows[0].id },
          requirement: requirement.rows[0]
        },
        message: 'Idea promoted to requirement successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/ideas/[id]/promote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to promote idea' },
      { status: 500 }
    );
  }
}
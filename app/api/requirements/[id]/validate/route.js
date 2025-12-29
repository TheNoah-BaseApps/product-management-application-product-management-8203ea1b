/**
 * @swagger
 * /api/requirements/{id}/validate:
 *   post:
 *     summary: Validate a requirement
 *     tags: [Requirements]
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { canValidateRequirement } from '@/lib/permissions';
import { logActivity } from '@/lib/db';
import { notifyRequirementValidated } from '@/lib/notifications';

export async function POST(request, { params }) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!canValidateRequirement(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;

    const existing = await query(
      'SELECT * FROM product_requirements WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Requirement not found' },
        { status: 404 }
      );
    }

    const requirement = existing.rows[0];

    if (requirement.status === 'validated') {
      return NextResponse.json(
        { success: false, error: 'Requirement already validated' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE product_requirements SET
        status = 'validated',
        validated_by = $1,
        validation_date = CURRENT_DATE,
        last_updated_date = NOW()
      WHERE id = $2
      RETURNING *`,
      [currentUser.userId, id]
    );

    await logActivity(
      currentUser.userId,
      'validate',
      'requirement',
      id,
      { validated_by: currentUser.userId }
    );

    await notifyRequirementValidated(
      id,
      requirement.user_story.substring(0, 50),
      requirement.created_by,
      currentUser.userId
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Requirement validated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/requirements/[id]/validate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate requirement' },
      { status: 500 }
    );
  }
}
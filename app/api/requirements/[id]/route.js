/**
 * @swagger
 * /api/requirements/{id}:
 *   get:
 *     summary: Get requirement by ID
 *     tags: [Requirements]
 *   put:
 *     summary: Update requirement
 *     tags: [Requirements]
 *   delete:
 *     summary: Delete requirement
 *     tags: [Requirements]
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { canEditRequirement, canDeleteRequirement } from '@/lib/permissions';
import { validateStatus, validatePriority, validateComplexity, sanitizeInput } from '@/lib/validation';
import { logActivity } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const result = await query(
      `SELECT req.*, u.name as created_by_name, v.name as validated_by_name, r.roadmap_name
       FROM product_requirements req
       LEFT JOIN users u ON req.created_by = u.id
       LEFT JOIN users v ON req.validated_by = v.id
       LEFT JOIN product_roadmaps r ON req.roadmap_id = r.id
       WHERE req.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Requirement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/requirements/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requirement' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!canEditRequirement(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

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

    const {
      requirement_type,
      user_story,
      acceptance_criteria,
      priority,
      complexity,
      status,
      related_features,
      technical_constraints,
      security_considerations,
      compliance_needs,
      mockup_references,
      roadmap_id
    } = body;

    if (priority && !validatePriority(priority)) {
      return NextResponse.json(
        { success: false, error: 'Invalid priority' },
        { status: 400 }
      );
    }

    if (complexity && !validateComplexity(complexity)) {
      return NextResponse.json(
        { success: false, error: 'Invalid complexity' },
        { status: 400 }
      );
    }

    if (status && !validateStatus(status, 'requirement')) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE product_requirements SET
        requirement_type = COALESCE($1, requirement_type),
        user_story = COALESCE($2, user_story),
        acceptance_criteria = COALESCE($3, acceptance_criteria),
        priority = COALESCE($4, priority),
        complexity = COALESCE($5, complexity),
        status = COALESCE($6, status),
        related_features = COALESCE($7, related_features),
        technical_constraints = COALESCE($8, technical_constraints),
        security_considerations = COALESCE($9, security_considerations),
        compliance_needs = COALESCE($10, compliance_needs),
        mockup_references = COALESCE($11, mockup_references),
        roadmap_id = COALESCE($12, roadmap_id),
        last_updated_date = NOW()
      WHERE id = $13
      RETURNING *`,
      [
        requirement_type,
        user_story ? sanitizeInput(user_story) : null,
        acceptance_criteria ? sanitizeInput(acceptance_criteria) : null,
        priority,
        complexity,
        status,
        related_features,
        technical_constraints ? sanitizeInput(technical_constraints) : null,
        security_considerations ? sanitizeInput(security_considerations) : null,
        compliance_needs ? sanitizeInput(compliance_needs) : null,
        mockup_references,
        roadmap_id,
        id
      ]
    );

    await logActivity(
      currentUser.userId,
      'update',
      'requirement',
      id,
      body
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Requirement updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/requirements/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update requirement' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!canDeleteRequirement(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;

    const linkedIdeas = await query(
      'SELECT COUNT(*) FROM product_ideas WHERE requirement_id = $1',
      [id]
    );

    if (parseInt(linkedIdeas.rows[0].count) > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete requirement with linked ideas' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM product_requirements WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Requirement not found' },
        { status: 404 }
      );
    }

    await logActivity(
      currentUser.userId,
      'delete',
      'requirement',
      id,
      { requirement_id: result.rows[0].requirement_id }
    );

    return NextResponse.json(
      { success: true, message: 'Requirement deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/requirements/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete requirement' },
      { status: 500 }
    );
  }
}
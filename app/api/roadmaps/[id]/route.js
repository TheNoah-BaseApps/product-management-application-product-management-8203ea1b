/**
 * @swagger
 * /api/roadmaps/{id}:
 *   get:
 *     summary: Get roadmap by ID
 *     tags: [Roadmaps]
 *   put:
 *     summary: Update roadmap
 *     tags: [Roadmaps]
 *   delete:
 *     summary: Delete roadmap
 *     tags: [Roadmaps]
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { canEditRoadmap, canDeleteRoadmap } from '@/lib/permissions';
import { validateStatus, sanitizeInput } from '@/lib/validation';
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
      `SELECT r.*, u.name as created_by_name, a.name as approved_by_name
       FROM product_roadmaps r
       LEFT JOIN users u ON r.created_by = u.id
       LEFT JOIN users a ON r.approved_by = a.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Roadmap not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/roadmaps/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roadmap' },
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

    if (!canEditRoadmap(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

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

    const {
      roadmap_name,
      timeframe,
      strategic_theme,
      next_review_date,
      stakeholder_visibility,
      status,
      dependencies,
      risk_assessment,
      success_metrics,
      presentation_version
    } = body;

    if (status && !validateStatus(status, 'roadmap')) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const oldChangeLog = existing.rows[0].change_log || [];
    const newChangeLog = [
      ...oldChangeLog,
      {
        action: 'updated',
        timestamp: new Date(),
        user_id: currentUser.userId,
        changes: body
      }
    ];

    const result = await query(
      `UPDATE product_roadmaps SET
        roadmap_name = COALESCE($1, roadmap_name),
        timeframe = COALESCE($2, timeframe),
        strategic_theme = COALESCE($3, strategic_theme),
        next_review_date = COALESCE($4, next_review_date),
        stakeholder_visibility = COALESCE($5, stakeholder_visibility),
        status = COALESCE($6, status),
        dependencies = COALESCE($7, dependencies),
        risk_assessment = COALESCE($8, risk_assessment),
        success_metrics = COALESCE($9, success_metrics),
        presentation_version = COALESCE($10, presentation_version),
        last_updated_date = NOW(),
        change_log = $11
      WHERE id = $12
      RETURNING *`,
      [
        roadmap_name ? sanitizeInput(roadmap_name) : null,
        timeframe,
        strategic_theme ? sanitizeInput(strategic_theme) : null,
        next_review_date,
        stakeholder_visibility,
        status,
        dependencies,
        risk_assessment ? sanitizeInput(risk_assessment) : null,
        success_metrics ? JSON.stringify(success_metrics) : null,
        presentation_version,
        JSON.stringify(newChangeLog),
        id
      ]
    );

    await logActivity(
      currentUser.userId,
      'update',
      'roadmap',
      id,
      body
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Roadmap updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/roadmaps/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update roadmap' },
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

    if (!canDeleteRoadmap(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;

    const linkedReqs = await query(
      'SELECT COUNT(*) FROM product_requirements WHERE roadmap_id = $1',
      [id]
    );

    if (parseInt(linkedReqs.rows[0].count) > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete roadmap with linked requirements' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM product_roadmaps WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Roadmap not found' },
        { status: 404 }
      );
    }

    await logActivity(
      currentUser.userId,
      'delete',
      'roadmap',
      id,
      { roadmap_id: result.rows[0].roadmap_id }
    );

    return NextResponse.json(
      { success: true, message: 'Roadmap deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/roadmaps/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete roadmap' },
      { status: 500 }
    );
  }
}
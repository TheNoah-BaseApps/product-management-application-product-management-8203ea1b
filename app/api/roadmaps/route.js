/**
 * @swagger
 * /api/roadmaps:
 *   get:
 *     summary: Get all roadmaps with filters
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a new roadmap
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { canCreateRoadmap } from '@/lib/permissions';
import { generateRoadmapId } from '@/lib/idGenerator';
import { validateStatus, sanitizeInput } from '@/lib/validation';
import { logActivity } from '@/lib/db';

export async function GET(request) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const theme = searchParams.get('theme');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let sql = `
      SELECT r.*, u.name as created_by_name, a.name as approved_by_name
      FROM product_roadmaps r
      LEFT JOIN users u ON r.created_by = u.id
      LEFT JOIN users a ON r.approved_by = a.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      sql += ` AND r.status = $${paramCount}`;
      params.push(status);
    }

    if (theme) {
      paramCount++;
      sql += ` AND r.strategic_theme ILIKE $${paramCount}`;
      params.push(`%${theme}%`);
    }

    sql += ` ORDER BY r.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    const countResult = await query(
      'SELECT COUNT(*) FROM product_roadmaps WHERE 1=1',
      []
    );
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json(
      {
        success: true,
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/roadmaps:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roadmaps' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!canCreateRoadmap(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
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

    if (!roadmap_name || !timeframe || !strategic_theme) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    if (status && !validateStatus(status, 'roadmap')) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const roadmapId = generateRoadmapId();
    const sanitizedName = sanitizeInput(roadmap_name);
    const sanitizedTheme = sanitizeInput(strategic_theme);
    const sanitizedRisk = sanitizeInput(risk_assessment || '');

    const result = await query(
      `INSERT INTO product_roadmaps (
        roadmap_id, roadmap_name, timeframe, strategic_theme,
        last_updated_date, next_review_date, stakeholder_visibility,
        status, dependencies, risk_assessment, success_metrics,
        presentation_version, created_by, created_at, change_log
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13)
      RETURNING *`,
      [
        roadmapId,
        sanitizedName,
        timeframe,
        sanitizedTheme,
        next_review_date || null,
        stakeholder_visibility || 'internal',
        status || 'planning',
        dependencies || [],
        sanitizedRisk,
        JSON.stringify(success_metrics || {}),
        presentation_version || '1.0',
        currentUser.userId,
        JSON.stringify([{ action: 'created', timestamp: new Date(), user_id: currentUser.userId }])
      ]
    );

    await logActivity(
      currentUser.userId,
      'create',
      'roadmap',
      result.rows[0].id,
      { roadmap_id: roadmapId, roadmap_name: sanitizedName }
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Roadmap created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/roadmaps:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create roadmap' },
      { status: 500 }
    );
  }
}
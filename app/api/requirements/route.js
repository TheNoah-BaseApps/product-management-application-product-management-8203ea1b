/**
 * @swagger
 * /api/requirements:
 *   get:
 *     summary: Get all requirements
 *     tags: [Requirements]
 *   post:
 *     summary: Create a new requirement
 *     tags: [Requirements]
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { canCreateRequirement } from '@/lib/permissions';
import { generateRequirementId } from '@/lib/idGenerator';
import { validateStatus, validatePriority, validateComplexity, sanitizeInput } from '@/lib/validation';
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
    const priority = searchParams.get('priority');
    const roadmapId = searchParams.get('roadmap_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let sql = `
      SELECT req.*, u.name as created_by_name, v.name as validated_by_name, r.roadmap_name
      FROM product_requirements req
      LEFT JOIN users u ON req.created_by = u.id
      LEFT JOIN users v ON req.validated_by = v.id
      LEFT JOIN product_roadmaps r ON req.roadmap_id = r.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      sql += ` AND req.status = $${paramCount}`;
      params.push(status);
    }

    if (priority) {
      paramCount++;
      sql += ` AND req.priority = $${paramCount}`;
      params.push(priority);
    }

    if (roadmapId) {
      paramCount++;
      sql += ` AND req.roadmap_id = $${paramCount}`;
      params.push(roadmapId);
    }

    sql += ` ORDER BY req.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    const countResult = await query(
      'SELECT COUNT(*) FROM product_requirements WHERE 1=1',
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
    console.error('Error in GET /api/requirements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requirements' },
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

    if (!canCreateRequirement(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
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

    if (!requirement_type || !user_story || !acceptance_criteria) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

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

    const requirementId = generateRequirementId();

    const result = await query(
      `INSERT INTO product_requirements (
        requirement_id, requirement_type, user_story, acceptance_criteria,
        priority, complexity, status, last_updated_date, related_features,
        technical_constraints, security_considerations, compliance_needs,
        mockup_references, roadmap_id, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, $11, $12, $13, $14, NOW())
      RETURNING *`,
      [
        requirementId,
        requirement_type,
        sanitizeInput(user_story),
        sanitizeInput(acceptance_criteria),
        priority || 'medium',
        complexity || 'm',
        status || 'draft',
        related_features || [],
        sanitizeInput(technical_constraints || ''),
        sanitizeInput(security_considerations || ''),
        sanitizeInput(compliance_needs || ''),
        mockup_references || [],
        roadmap_id || null,
        currentUser.userId
      ]
    );

    await logActivity(
      currentUser.userId,
      'create',
      'requirement',
      result.rows[0].id,
      { requirement_id: requirementId, requirement_type }
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Requirement created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/requirements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create requirement' },
      { status: 500 }
    );
  }
}
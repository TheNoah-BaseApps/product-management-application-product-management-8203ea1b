/**
 * @swagger
 * /api/ideas:
 *   get:
 *     summary: Get all ideas
 *     tags: [Ideas]
 *   post:
 *     summary: Submit a new idea
 *     tags: [Ideas]
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { canSubmitIdea } from '@/lib/permissions';
import { generateIdeaId } from '@/lib/idGenerator';
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
    const impact = searchParams.get('impact');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let sql = `
      SELECT i.*, u.name as submitted_by_name, t.name as triaged_by_name
      FROM product_ideas i
      LEFT JOIN users u ON i.submitted_by = u.id
      LEFT JOIN users t ON i.triaged_by = t.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      sql += ` AND i.triage_status = $${paramCount}`;
      params.push(status);
    }

    if (impact) {
      paramCount++;
      sql += ` AND i.estimated_impact = $${paramCount}`;
      params.push(impact);
    }

    sql += ` ORDER BY i.submission_date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    const countResult = await query(
      'SELECT COUNT(*) FROM product_ideas WHERE 1=1',
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
    console.error('Error in GET /api/ideas:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ideas' },
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

    if (!canSubmitIdea(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      idea_name,
      problem_statement,
      target_customer,
      estimated_impact,
      feasibility,
      alignment_with_strategy,
      competitive_advantage,
      related_products
    } = body;

    if (!idea_name || !problem_statement || !target_customer) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const ideaId = generateIdeaId();

    const result = await query(
      `INSERT INTO product_ideas (
        idea_id, idea_name, submitted_by, submission_date, problem_statement,
        target_customer, estimated_impact, feasibility, alignment_with_strategy,
        competitive_advantage, triage_status, related_products, created_at
      ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *`,
      [
        ideaId,
        sanitizeInput(idea_name),
        currentUser.userId,
        sanitizeInput(problem_statement),
        sanitizeInput(target_customer),
        estimated_impact || 'medium',
        feasibility || 'medium',
        sanitizeInput(alignment_with_strategy || ''),
        sanitizeInput(competitive_advantage || ''),
        'submitted',
        related_products || []
      ]
    );

    await logActivity(
      currentUser.userId,
      'create',
      'idea',
      result.rows[0].id,
      { idea_id: ideaId, idea_name }
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Idea submitted successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/ideas:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit idea' },
      { status: 500 }
    );
  }
}
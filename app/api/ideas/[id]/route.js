/**
 * @swagger
 * /api/ideas/{id}:
 *   get:
 *     summary: Get idea by ID
 *     tags: [Ideas]
 *   put:
 *     summary: Update idea
 *     tags: [Ideas]
 *   delete:
 *     summary: Delete idea
 *     tags: [Ideas]
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { sanitizeInput } from '@/lib/validation';
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
      `SELECT i.*, u.name as submitted_by_name, t.name as triaged_by_name
       FROM product_ideas i
       LEFT JOIN users u ON i.submitted_by = u.id
       LEFT JOIN users t ON i.triaged_by = t.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/ideas/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch idea' },
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

    const { id } = params;
    const body = await request.json();

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

    const {
      idea_name,
      problem_statement,
      target_customer,
      estimated_impact,
      feasibility,
      alignment_with_strategy,
      competitive_advantage,
      next_steps,
      related_products
    } = body;

    const result = await query(
      `UPDATE product_ideas SET
        idea_name = COALESCE($1, idea_name),
        problem_statement = COALESCE($2, problem_statement),
        target_customer = COALESCE($3, target_customer),
        estimated_impact = COALESCE($4, estimated_impact),
        feasibility = COALESCE($5, feasibility),
        alignment_with_strategy = COALESCE($6, alignment_with_strategy),
        competitive_advantage = COALESCE($7, competitive_advantage),
        next_steps = COALESCE($8, next_steps),
        related_products = COALESCE($9, related_products)
      WHERE id = $10
      RETURNING *`,
      [
        idea_name ? sanitizeInput(idea_name) : null,
        problem_statement ? sanitizeInput(problem_statement) : null,
        target_customer ? sanitizeInput(target_customer) : null,
        estimated_impact,
        feasibility,
        alignment_with_strategy ? sanitizeInput(alignment_with_strategy) : null,
        competitive_advantage ? sanitizeInput(competitive_advantage) : null,
        next_steps ? sanitizeInput(next_steps) : null,
        related_products,
        id
      ]
    );

    await logActivity(
      currentUser.userId,
      'update',
      'idea',
      id,
      body
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Idea updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/ideas/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update idea' },
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

    const { id } = params;

    const result = await query(
      'DELETE FROM product_ideas WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      );
    }

    await logActivity(
      currentUser.userId,
      'delete',
      'idea',
      id,
      { idea_id: result.rows[0].idea_id }
    );

    return NextResponse.json(
      { success: true, message: 'Idea deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/ideas/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete idea' },
      { status: 500 }
    );
  }
}
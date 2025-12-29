/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Get comments for an entity
 *     tags: [Comments]
 *   post:
 *     summary: Add a comment
 *     tags: [Comments]
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { canComment } from '@/lib/permissions';
import { sanitizeInput } from '@/lib/validation';
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
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { success: false, error: 'entity_type and entity_id are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT c.*, u.name as user_name
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.entity_type = $1 AND c.entity_id = $2
       ORDER BY c.created_at DESC`,
      [entityType, entityId]
    );

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
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

    if (!canComment(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { entity_type, entity_id, content } = body;

    if (!entity_type || !entity_id || !content) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO comments (entity_type, entity_id, user_id, content, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [entity_type, entity_id, currentUser.userId, sanitizeInput(content)]
    );

    await logActivity(
      currentUser.userId,
      'comment',
      entity_type,
      entity_id,
      { comment_id: result.rows[0].id }
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Comment added successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
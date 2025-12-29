/**
 * @swagger
 * /api/export/requirements:
 *   post:
 *     summary: Export requirements as CSV
 *     tags: [Export]
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { canExport } from '@/lib/permissions';
import { generateCSV } from '@/lib/exportUtils';

export async function POST(request) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!canExport(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { filters = {} } = body;

    let sql = 'SELECT * FROM product_requirements WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      sql += ` AND status = $${paramCount}`;
      params.push(filters.status);
    }

    if (filters.priority) {
      paramCount++;
      sql += ` AND priority = $${paramCount}`;
      params.push(filters.priority);
    }

    const result = await query(sql, params);

    const columns = [
      { key: 'requirement_id', header: 'Requirement ID' },
      { key: 'requirement_type', header: 'Type' },
      { key: 'user_story', header: 'User Story' },
      { key: 'priority', header: 'Priority' },
      { key: 'complexity', header: 'Complexity' },
      { key: 'status', header: 'Status' },
      { key: 'created_at', header: 'Created At' }
    ];

    const csv = generateCSV(result.rows, columns);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=requirements_export_${new Date().toISOString().split('T')[0]}.csv`
      }
    });
  } catch (error) {
    console.error('Error in POST /api/export/requirements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export requirements' },
      { status: 500 }
    );
  }
}
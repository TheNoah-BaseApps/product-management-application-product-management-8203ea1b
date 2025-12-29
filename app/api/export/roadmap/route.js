/**
 * @swagger
 * /api/export/roadmap:
 *   post:
 *     summary: Export roadmap as PDF
 *     tags: [Export]
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { canExport } from '@/lib/permissions';

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
    const { roadmap_id } = body;

    if (!roadmap_id) {
      return NextResponse.json(
        { success: false, error: 'roadmap_id is required' },
        { status: 400 }
      );
    }

    const result = await query(
      'SELECT * FROM product_roadmaps WHERE id = $1',
      [roadmap_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Roadmap not found' },
        { status: 404 }
      );
    }

    const roadmap = result.rows[0];

    return NextResponse.json(
      {
        success: true,
        data: {
          roadmap,
          exportUrl: `/exports/roadmap_${roadmap.roadmap_id}.pdf`
        },
        message: 'Roadmap export prepared'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/export/roadmap:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export roadmap' },
      { status: 500 }
    );
  }
}
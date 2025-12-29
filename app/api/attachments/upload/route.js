/**
 * @swagger
 * /api/attachments/upload:
 *   post:
 *     summary: Upload an attachment
 *     tags: [Attachments]
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { canUploadAttachment } from '@/lib/permissions';
import { logActivity } from '@/lib/db';

export async function POST(request) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!canUploadAttachment(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const entityType = formData.get('entity_type');
    const entityId = formData.get('entity_id');

    if (!file || !entityType || !entityId) {
      return NextResponse.json(
        { success: false, error: 'File, entity_type, and entity_id are required' },
        { status: 400 }
      );
    }

    const fileUrl = `/uploads/${Date.now()}_${file.name}`;

    const result = await query(
      `INSERT INTO attachments (entity_type, entity_id, file_name, file_url, uploaded_by, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [entityType, entityId, file.name, fileUrl, currentUser.userId]
    );

    await logActivity(
      currentUser.userId,
      'upload',
      entityType,
      entityId,
      { attachment_id: result.rows[0].id, file_name: file.name }
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'File uploaded successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/attachments/upload:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
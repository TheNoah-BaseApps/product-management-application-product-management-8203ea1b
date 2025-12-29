/**
 * @swagger
 * /api/attachments/{id}:
 *   delete:
 *     summary: Delete an attachment
 *     tags: [Attachments]
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { query } from '@/lib/db';
import { canDeleteAttachment } from '@/lib/permissions';
import { logActivity } from '@/lib/db';

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

    const existing = await query(
      'SELECT * FROM attachments WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Attachment not found' },
        { status: 404 }
      );
    }

    const attachment = existing.rows[0];

    if (!canDeleteAttachment(currentUser.role, attachment.uploaded_by, currentUser.userId)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await query('DELETE FROM attachments WHERE id = $1', [id]);

    await logActivity(
      currentUser.userId,
      'delete',
      'attachment',
      id,
      { file_name: attachment.file_name }
    );

    return NextResponse.json(
      { success: true, message: 'Attachment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/attachments/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete attachment' },
      { status: 500 }
    );
  }
}
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, File, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AttachmentUploader({ entityType, entityId }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttachments();
  }, [entityType, entityId]);

  const fetchAttachments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/attachments?entity_type=${entityType}&entity_id=${entityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch attachments');

      const data = await res.json();
      setAttachments(data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching attachments:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entity_type', entityType);
      formData.append('entity_id', entityId);

      const res = await fetch('/api/attachments/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to upload file');
        setUploading(false);
        return;
      }

      toast.success('File uploaded successfully');
      fetchAttachments();
    } catch (err) {
      console.error('Error uploading file:', err);
      toast.error('An error occurred');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to delete attachment');
        return;
      }

      toast.success('Attachment deleted');
      fetchAttachments();
    } catch (err) {
      console.error('Error deleting attachment:', err);
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading attachments...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
        <label htmlFor="file-upload">
          <Button asChild disabled={uploading}>
            <span className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </span>
          </Button>
        </label>
      </div>

      <div className="space-y-2">
        {attachments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No attachments</p>
        ) : (
          attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{attachment.file_name}</p>
                  <p className="text-xs text-gray-500">
                    Uploaded by {attachment.uploaded_by_name} on {formatDate(attachment.created_at)}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(attachment.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
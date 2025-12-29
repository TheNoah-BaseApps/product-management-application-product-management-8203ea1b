'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ValidationWorkflow({ requirement, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/requirements/${requirement.id}/validate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to validate requirement');
        setLoading(false);
        return;
      }

      toast.success('Requirement validated successfully');
      onUpdate?.();
    } catch (err) {
      console.error('Error validating requirement:', err);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (requirement.status === 'validated') {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          This requirement has been validated by {requirement.validated_by_name} on {new Date(requirement.validation_date).toLocaleDateString()}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This requirement is pending validation. Review the details and validate if ready.
          </p>
          <Button onClick={handleValidate} disabled={loading}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {loading ? 'Validating...' : 'Validate Requirement'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
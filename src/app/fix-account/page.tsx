'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function FixAccountPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const handleFixAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fix-account', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setTimeout(() => {
          // Redirect based on the user's role
          const redirectPath = data.user?.role === 'STUDENT' 
            ? '/dashboard/student' 
            : '/dashboard/teacher';
          router.push(redirectPath);
        }, 2000);
      }
    } catch (error) {
      console.error('Error fixing account:', error);
      setResult({ success: false, error: 'Failed to fix account' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Fix Your Account</CardTitle>
          <CardDescription>
            Click the button below to fix your account setup. This will create your user profile in the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleFixAccount} 
            disabled={loading} 
            className="w-full"
          >
            {loading ? 'Fixing Account...' : 'Fix My Account'}
          </Button>
          
          {result && (
            <div className="mt-4 p-4 rounded-md bg-gray-100">
              <p className={result.success ? "text-green-600" : "text-red-600"}>
                {result.success ? 'Success!' : 'Error:'}
              </p>
              <pre className="text-xs overflow-auto mt-2">
                {JSON.stringify(result, null, 2)}
              </pre>
              {result.success && (
                <p className="text-sm mt-2 text-gray-600">
                  Redirecting to dashboard...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
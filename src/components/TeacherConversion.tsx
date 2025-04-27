'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from './ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export function TeacherConversion() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const syncUser = async () => {
    try {
      const response = await fetch('/api/sync-user', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync user data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error syncing user:', error);
      throw error;
    }
  };

  const handleConversion = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, ensure user is synced
      await syncUser();

      // Then attempt teacher conversion
      const response = await fetch('/api/convert-to-teacher', {
        method: 'POST',
      });
      
      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Please sign in to continue');
        } else if (response.status === 404) {
          throw new Error('Please complete the onboarding process first');
        } else if (response.status === 400 && data.error === 'User is already a teacher') {
          throw new Error('Your account is already a teacher account');
        }
        throw new Error(data.error || 'Failed to convert account');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to convert account');
      }

      toast({
        title: 'Success!',
        description: 'Your account has been converted to a teacher account. You will be signed out now.',
      });

      // Wait a moment for the user to see the success message
      setTimeout(() => {
        router.push('/sign-out');
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-lg border bg-card text-card-foreground shadow-sm max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Teacher Account Setup</h2>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <p className="text-muted-foreground">
          Your account needs to be converted to a teacher account. This process will:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Sync your account data</li>
          <li>Update your account role to Teacher</li>
          <li>Create your teacher profile</li>
          <li>Sign you out (you'll need to sign in again)</li>
        </ul>
        
        <Button 
          onClick={handleConversion} 
          disabled={isLoading}
          className="w-full mt-6"
        >
          {isLoading ? 'Setting up...' : 'Convert to Teacher Account'}
        </Button>

        {error && (
          <p className="text-sm text-muted-foreground mt-4">
            If the issue persists, try:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Signing out completely</li>
              <li>Clearing your browser cookies</li>
              <li>Signing in again</li>
              <li>Returning to this page</li>
            </ul>
          </p>
        )}
      </div>
    </div>
  );
} 
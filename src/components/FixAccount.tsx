'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ExclamationTriangleIcon, ReloadIcon } from '@radix-ui/react-icons';
import { UserButtonWrapper } from './UserButtonWrapper';

export function FixAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'initial' | 'fixing' | 'success' | 'error'>('initial');
  const { toast } = useToast();

  const handleSignOut = () => {
    window.location.href = '/sign-out';
  };

  const handleFixAccount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStep('fixing');

      // First, try to fix the account
      const response = await fetch('/api/fix-account', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fix account');
      }

      setStep('success');
      toast({
        title: 'Success!',
        description: 'Your account has been reset. Please sign out and sign in again.',
      });

      // Wait a moment before redirecting to sign-out
      setTimeout(handleSignOut, 3000);

    } catch (error) {
      setStep('error');
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
    <div className="container mx-auto py-10 max-w-md">
      <div className="flex justify-end mb-4">
        <UserButtonWrapper />
      </div>

      <div className="space-y-6">
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Account Setup Required</AlertTitle>
          <AlertDescription>
            We need to reset and recreate your account to fix access issues.
          </AlertDescription>
        </Alert>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Fix Account Setup</h2>
          
          <div className="space-y-4">
            {step === 'initial' && (
              <>
                <p className="text-sm text-muted-foreground">
                  To fix your account, we will:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Reset your existing account data</li>
                  <li>Create a fresh account with your current profile</li>
                  <li>Set you up as a new student</li>
                  <li>Sign you out (you'll need to sign in again)</li>
                </ul>
              </>
            )}

            {step === 'fixing' && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <ReloadIcon className="h-4 w-4 animate-spin" />
                <span>Resetting your account...</span>
              </div>
            )}

            {step === 'success' && (
              <div className="space-y-2">
                <p className="text-sm text-green-600">Account successfully reset!</p>
                <p className="text-sm text-muted-foreground">
                  You will be signed out in a moment. Please sign in again to continue.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleFixAccount}
                disabled={isLoading || step === 'success'}
                className="w-full"
              >
                {isLoading ? 'Fixing Account...' : 'Reset & Fix My Account'}
              </Button>

              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full"
              >
                Sign Out Now
              </Button>
            </div>

            {error && (
              <div className="mt-4 space-y-4">
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                
                <p className="text-sm text-muted-foreground">
                  Please try these steps:
                </p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>Sign out using the button above</li>
                  <li>Clear your browser cookies</li>
                  <li>Sign in again through the Student portal</li>
                  <li>Return to this page and try again</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
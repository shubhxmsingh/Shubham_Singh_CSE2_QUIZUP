'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboardError({ error }: { error: Error & { digest?: string } }) {
  const router = useRouter();
  const [errorDetails, setErrorDetails] = useState<any>(null);

  useEffect(() => {
    // Try to fetch debug information to help diagnose the issue
    const fetchDebugInfo = async () => {
      try {
        const res = await fetch('/api/debug/auth');
        if (res.ok) {
          const data = await res.json();
          setErrorDetails(data);
        }
      } catch (e) {
        console.error('Failed to fetch debug info:', e);
      }
    };
    
    fetchDebugInfo();
  }, []);

  const userSignedIn = errorDetails?.isAuthenticated || false;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg px-4">
        <Card className="shadow-lg border-red-100">
          <CardHeader className="space-y-1">
            <div className="flex items-center text-red-500 mb-2">
              <AlertTriangle className="mr-2 h-6 w-6" />
              <CardTitle className="text-2xl">Dashboard Error</CardTitle>
            </div>
            <CardDescription>
              There was a problem loading the teacher dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-100 rounded-md text-red-800">
              <p className="font-medium">{error.message || 'Failed to fetch dashboard data'}</p>
              <p className="text-sm mt-2 text-red-600">{error?.digest ? `Error ID: ${error.digest}` : ''}</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Common solutions:</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <strong>Authentication Issue</strong>: {userSignedIn ? 
                    "You're signed in, but your account may not be properly linked to the database." : 
                    "You need to sign in again."}
                </li>
                <li>
                  <strong>User Mapping</strong>: Your Clerk authentication account may not be properly linked to a teacher account in the database.
                </li>
                <li>
                  <strong>Role Issue</strong>: Your account might be set up as a student account instead of a teacher account.
                </li>
                <li>
                  <strong>Database Connection</strong>: There might be a temporary issue with the database connection.
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button 
              onClick={() => router.refresh()} 
              variant="outline" 
              className="w-full flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              <Link href="/dashboard/debug">
                <Button variant="secondary" className="w-full flex items-center">
                  <ArrowRight className="mr-2 h-4 w-4" /> Debug Tools
                </Button>
              </Link>
              
              <Link href="/sign-in">
                <Button className="w-full flex items-center">
                  <ArrowRight className="mr-2 h-4 w-4" /> Sign In Again
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 
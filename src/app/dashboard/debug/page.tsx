'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';

export default function DebugPage() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('TEACHER');
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    // Try to fetch teacher dashboard data to see if it works
    const checkTeacherDashboard = async () => {
      try {
        const res = await fetch('/api/teacher/dashboard');
        const data = await res.json();
        
        if (!res.ok) {
          setDashboardError(data.error || data.message || 'Unknown dashboard error');
        } else {
          setDashboardError(null);
        }
      } catch (error) {
        setDashboardError('Connection error: Could not connect to the teacher dashboard API');
      }
    };
    
    if (isSignedIn) {
      checkTeacherDashboard();
    }
  }, [isSignedIn, dbUser]);

  const checkDashboardApi = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teacher/dashboard');
      const data = await res.json();
      if (res.ok) {
        setDbUser(data.user);
        toast.success('Successfully fetched dashboard data');
      } else {
        toast.error(`API Error: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const checkActiveStudentsApi = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teacher/active-students');
      const data = await res.json();
      if (res.ok) {
        toast.success(`Found ${data.count} active students`);
      } else {
        toast.error(`API Error: ${data.error}`);
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const checkHealthApi = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/healthcheck');
      const data = await res.json();
      if (res.ok) {
        toast.success(`Health API: ${data.status} at ${data.timestamp}`);
      } else {
        toast.error(`API Error: ${data.error}`);
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const updateUserMapping = async () => {
    if (!email) {
      toast.error('Email is required');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/update-user-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          role
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('User mapping updated successfully');
        setDbUser(data.user);
      } else {
        toast.error(`API Error: ${data.error}`);
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async () => {
    try {
      setLoading(true);
      
      // Get current user email
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      const firstName = user?.firstName || '';
      const lastName = user?.lastName || '';
      
      if (!userEmail) {
        toast.error('Email not found');
        return;
      }
      
      // First try to create the user if they don't exist
      const createRes = await fetch('/api/debug/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userEmail,
          firstName,
          lastName,
          role: 'ADMIN'
        }),
      });
      
      const createResData = await createRes.json();
      
      if (!createRes.ok) {
        console.warn('Note: User creation returned:', createResData);
        // Continue anyway as the user might already exist
      }
      
      // Use a separate fetch call for the update to avoid body being locked
      const res = await fetch('/api/update-user-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userEmail,
          role: 'ADMIN'
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Promoted to Admin successfully!');
        setDbUser(data.user);
        
        // Redirect to admin page
        setTimeout(() => {
          window.location.href = '/dashboard/admin';
        }, 1500);
      } else {
        toast.error(`API Error: ${data.error}`);
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Debug Dashboard</h1>

      {dashboardError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Teacher Dashboard Error Detected</AlertTitle>
          <AlertDescription>
            {dashboardError}. Use the tools below to fix the issue.
          </AlertDescription>
        </Alert>
      )}

      {dbUser && (
        <Alert variant="default" className="mb-6 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle>User Successfully Mapped</AlertTitle>
          <AlertDescription>
            Your account (ID: {userId}) is linked to database user {dbUser.id} with role {dbUser.role}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Clerk Authentication</CardTitle>
            <CardDescription>Current authentication state from Clerk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p><strong>Is Loaded:</strong> {isLoaded ? 'Yes' : 'No'}</p>
              <p><strong>Is Signed In:</strong> {isSignedIn ? 'Yes' : 'No'}</p>
              <p><strong>User ID:</strong> {userId || 'Not signed in'}</p>
              {user && (
                <>
                  <p><strong>Name:</strong> {user.fullName}</p>
                  <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => window.location.href = '/sign-in'}
              variant="outline"
              className="w-full"
            >
              Go to Sign In
            </Button>
          </CardFooter>
        </Card>

        <Card className={dashboardError ? "border-red-300 shadow-md" : ""}>
          <CardHeader>
            <CardTitle>Fix Teacher Dashboard</CardTitle>
            <CardDescription>Link your Clerk account to a teacher in the database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacherEmail">Teacher Email</Label>
              <Input
                id="teacherEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your teacher email address"
              />
              <p className="text-xs text-muted-foreground">
                This should match an existing teacher email in the database
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              onClick={() => {
                setRole('TEACHER');
                updateUserMapping();
              }}
              disabled={loading || !isSignedIn || !email}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Link as Teacher Account
            </Button>
            <Button
              onClick={checkDashboardApi}
              disabled={loading || !isSignedIn}
              variant="outline"
              className="w-full"
            >
              Test Dashboard API
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update User Mapping</CardTitle>
            <CardDescription>Link your Clerk account to a database user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter the email of a seeded user (e.g., teacher@example.com)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="TEACHER">TEACHER</option>
                <option value="STUDENT">STUDENT</option>
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={updateUserMapping}
              disabled={loading || !isSignedIn}
              className="w-full"
            >
              Update User Mapping
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Tests</CardTitle>
            <CardDescription>Test various API endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Use these buttons to test API connectivity and functionality
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              onClick={checkDashboardApi}
              disabled={loading || !isSignedIn}
              className="w-full"
            >
              Test Dashboard API
            </Button>
            <Button
              onClick={checkActiveStudentsApi}
              disabled={loading || !isSignedIn}
              variant="outline"
              className="w-full"
            >
              Test Active Students API
            </Button>
            <Button
              onClick={checkHealthApi}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Test Health API
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-blue-300 bg-blue-50/30">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Promote yourself to admin role</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              This will update your account to have administrator permissions.
              Use this only for testing purposes.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={promoteToAdmin}
              disabled={loading || !isSignedIn}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Make Me Admin
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 
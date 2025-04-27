import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { TeacherConversion } from '@/components/TeacherConversion';
import { FixAccount } from '@/components/FixAccount';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Button } from '@/components/ui/button';
import { UserButtonWrapper } from '@/components/UserButtonWrapper';

// Error component with UserButton
function ErrorDisplay({ title, description, children }: { 
  title: string; 
  description: string | React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-end mb-4">
        <UserButtonWrapper />
      </div>
      <Alert variant="destructive" className="mb-6">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
      {children}
    </div>
  );
}

async function syncUser(userId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sync-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to sync user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error syncing user:', error);
    throw error;
  }
}

export default async function TeacherDashboard() {
  try {
    const { userId } = auth();
    const headersList = headers();
    const shouldSync = headersList.get('x-sync-user') === 'true';

    if (!userId) {
      return (
        <ErrorDisplay
          title="Authentication Required"
          description={
            <>
              Please sign in to access the teacher dashboard.
              <div className="mt-4">
                <Link 
                  href="/sign-in"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Sign In
                </Link>
              </div>
            </>
          }
        />
      );
    }

    // If middleware indicates we should sync, do it before proceeding
    if (shouldSync) {
      await syncUser(userId);
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      include: {
        teacher: true
      }
    });

    if (!user) {
      return <FixAccount />;
    }

    // If user is not a teacher, show conversion component
    if (user.role !== 'TEACHER' || !user.teacher) {
      return (
        <div className="container mx-auto py-10">
          <div className="flex justify-end mb-4">
            <UserButtonWrapper />
          </div>
          <TeacherConversion />
        </div>
      );
    }

    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <UserButtonWrapper />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Role: Teacher</p>
              <p className="text-sm text-muted-foreground">Name: {user.name}</p>
              <p className="text-sm text-muted-foreground">Email: {user.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link 
                href="/create-quiz" 
                className="block p-2 hover:bg-accent rounded-md transition-colors"
              >
                Create New Quiz
              </Link>
              <Link 
                href="/my-quizzes" 
                className="block p-2 hover:bg-accent rounded-md transition-colors"
              >
                View My Quizzes
              </Link>
              <Link 
                href="/analytics" 
                className="block p-2 hover:bg-accent rounded-md transition-colors"
              >
                View Analytics
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Teacher Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your account is fully set up as a teacher account.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                You have access to all teacher features including:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                <li>Creating quizzes</li>
                <li>Viewing student results</li>
                <li>Accessing analytics</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Teacher Dashboard Error:', error);
    return <FixAccount />;
  }
} 
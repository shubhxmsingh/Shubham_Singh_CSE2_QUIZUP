import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { headers } from 'next/headers';
import { UserButton } from "@/components/UserButton";

// Mark as server-side only
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function DashboardPage() {
  // Ensure we're in a server context
  headers();
  
  try {
    const { userId } = auth();
    
    if (!userId) {
      return redirect('/sign-in');
    }

    // Get user from database with error handling
    let user;
    try {
      user = await db.user.findUnique({
        where: { clerkId: userId }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return (
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-red-600">Database Error</h1>
            <UserButton />
          </div>
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">
              There was an error accessing your account information. Please try again later.
            </p>
            <div className="mt-4">
              <a 
                href="/fix-account" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Try fixing your account
              </a>
            </div>
          </div>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Account Setup Required</h1>
            <UserButton />
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-yellow-700">
              Your account is not fully set up. Please try signing out and signing in again.
            </p>
            <div className="mt-4">
              <a 
                href="/fix-account" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Fix your account now
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Handle role-based redirects
    if (user.role === 'STUDENT') {
      return redirect('/dashboard/student');
    }

    if (user.role === 'TEACHER') {
      return redirect('/dashboard/teacher');
    }

    // Show role assignment message
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <UserButton />
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your account needs role configuration. Please contact an administrator.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                Current role: {user.role || 'None'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Sign out completely</li>
            <li>Clear your browser cookies</li>
            <li>Sign in again</li>
            <li>If the issue persists, contact an administrator for role assignment</li>
          </ol>
          <div className="mt-4">
            <a 
              href="/fix-account" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Try fixing your account now
            </a>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <UserButton />
        </div>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">
            There was an error loading your dashboard. Please try again later.
          </p>
          <div className="mt-4">
            <a 
              href="/fix-account" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Try fixing your account
            </a>
          </div>
          {process.env.NODE_ENV === 'development' && error instanceof Error && (
            <div className="mt-2">
              <p className="text-xs text-red-600">{error.message}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
} 
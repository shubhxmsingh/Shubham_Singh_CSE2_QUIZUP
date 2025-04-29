import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    
    // Log the authentication state for debugging
    console.log('Dashboard API - Auth state:', { userId });
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user by Clerk ID
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        quizzes: {
          include: {
            questions: true,
            assignments: {
              include: {
                student: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      console.error('User not found in database for clerkId:', userId);
      return NextResponse.json({ 
        error: 'User not found in the database',
        message: 'Please go to the Debug page to link your account with a database user.'
      }, { status: 404 });
    }

    // Check if user is a teacher
    if (user.role !== 'TEACHER') {
      console.error(`User role mismatch: expected TEACHER, got ${user.role}`);
      return NextResponse.json({ 
        error: 'Access denied',
        message: 'Your account is not set up as a teacher account'
      }, { status: 403 });
    }

    // Format the data to match expected interface
    const formattedUser = {
      ...user,
      // Add the name field for backwards compatibility
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      createdQuizzes: user.quizzes.map(quiz => ({
        ...quiz,
        // Extract student info from assignments
        assignedTo: quiz.assignments.map(assignment => ({
          ...assignment.student,
          // Add name field for backwards compatibility
          name: `${assignment.student.firstName || ''} ${assignment.student.lastName || ''}`.trim()
        })),
        // Since results aren't in the schema yet, provide an empty array
        results: []
      })),
    };

    return NextResponse.json({ user: formattedUser });
  } catch (error) {
    console.error('Dashboard API error:', error);
    
    // Provide a more detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    
    return NextResponse.json({ 
      error: 'Failed to load dashboard data',
      message: 'There was a problem connecting to the database or processing your request',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
} 
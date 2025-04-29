import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  context: any
) {
  try {
    const { params } = context;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user by Clerk ID first
    const teacher = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const quizId = params.id;
    
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    // Get the quiz with related data
    const quiz = await db.quiz.findUnique({
      where: { 
        id: quizId,
        createdById: teacher.id // Only allow the creator to view the quiz
      },
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
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found or access denied' }, { status: 404 });
    }

    // Format the data to match the expected interface
    const formattedQuiz = {
      ...quiz,
      // Extract student info from assignments and add name field
      assignedTo: quiz.assignments.map(assignment => ({
        ...assignment.student,
        name: `${assignment.student.firstName || ''} ${assignment.student.lastName || ''}`.trim()
      })),
      // Since results aren't in the schema yet, provide an empty array
      results: []
    };

    return NextResponse.json({ quiz: formattedQuiz });
  } catch (error) {
    console.error('Quiz fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: any
) {
  try {
    const { params } = context;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user by Clerk ID first
    const teacher = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const quizId = params.id;
    
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    // Verify the quiz exists and belongs to this teacher
    const quiz = await db.quiz.findUnique({
      where: { 
        id: quizId,
        createdById: teacher.id // Only allow the creator to delete the quiz
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found or access denied' }, { status: 404 });
    }

    // Delete related data first (using Prisma transactions)
    await db.$transaction([
      // Delete quiz assignments
      db.quizAssignment.deleteMany({
        where: { quizId }
      }),
      // Delete quiz results
      db.quizResult.deleteMany({
        where: { quizId }
      }),
      // Delete quiz questions
      db.question.deleteMany({
        where: { quizId }
      }),
      // Finally delete the quiz itself
      db.quiz.delete({
        where: { id: quizId }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Quiz deletion error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete quiz',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
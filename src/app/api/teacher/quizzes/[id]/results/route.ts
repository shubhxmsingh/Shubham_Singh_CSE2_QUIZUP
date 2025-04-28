import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
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
        },
        results: {
          include: {
            user: {
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
    const students = quiz.assignments.map(assignment => assignment.student);
    
    const results = quiz.results.map(result => ({
      id: result.id,
      score: result.score,
      totalQuestions: result.totalQuestions,
      createdAt: result.createdAt.toISOString(),
      userId: result.userId,
      improvementGuidance: result.improvementGuidance
    }));

    return NextResponse.json({ 
      results,
      students
    });
  } catch (error) {
    console.error('Quiz results fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz results' }, { status: 500 });
  }
} 
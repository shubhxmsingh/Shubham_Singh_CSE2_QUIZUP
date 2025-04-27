import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from DB based on Clerk ID
    const teacher = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Only teachers can assign quizzes' }, { status: 403 });
    }

    const { quizId, studentIds } = await req.json();

    if (!quizId || !studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Verify the quiz exists and belongs to the teacher
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      select: { createdById: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.createdById !== teacher.id) {
      return NextResponse.json({ error: 'Unauthorized to assign this quiz' }, { status: 403 });
    }

    console.log(`Teacher ${teacher.id} assigning quiz ${quizId} to students: ${studentIds.join(', ')}`);

    // Create QuizAssignment records for each student
    const assignments = await Promise.all(
      studentIds.map(async (studentId) => {
        // Check if assignment already exists
        const existingAssignment = await db.quizAssignment.findFirst({
          where: {
            quizId: quizId,
            studentId: studentId
          }
        });

        if (existingAssignment) {
          console.log(`Assignment already exists for student ${studentId} and quiz ${quizId}`);
          return existingAssignment;
        }

        // Create new assignment
        return db.quizAssignment.create({
          data: {
            quizId: quizId,
            studentId: studentId
          }
        });
      })
    );

    console.log(`Created ${assignments.length} quiz assignments`);

    return NextResponse.json({ 
      message: 'Quiz assigned successfully',
      assignments: assignments
    });
  } catch (error) {
    console.error('Error assigning quiz:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 
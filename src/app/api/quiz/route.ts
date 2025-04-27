import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // First, ensure the user exists
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const quizzes = await prisma.quiz.findMany({
      include: {
        questions: true,
        results: {
          where: {
            userId: user.id
          },
          select: {
            score: true,
            createdAt: true
          }
        }
      },
    });

    // Transform the data to include status and score
    const transformedQuizzes = quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit,
      totalQuestions: quiz.questions.length,
      assignedDate: quiz.createdAt,
      status: quiz.results.length > 0 ? 'Completed' : 'Pending',
      score: quiz.results[0]?.score || null,
    }));

    return NextResponse.json(transformedQuizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
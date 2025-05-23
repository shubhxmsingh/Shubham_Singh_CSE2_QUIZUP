import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const { params } = context;
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const quiz = await db.quiz.findUnique({
      where: {
        id: params.quizId,
      },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return new NextResponse('Quiz not found', { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
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

    // Get all students with their quiz results
    const students = await prisma.user.findMany({
      where: {
        student: {
          isNot: null
        }
      },
      include: {
        student: true,
        quizResults: {
          include: {
            quiz: true
          }
        }
      }
    });

    // Calculate total scores and create leaderboard
    const leaderboard = students
      .filter(student => student.quizResults.length > 0) // Only include students with quiz results
      .map(student => {
        const totalScore = student.quizResults.reduce((acc, result) => acc + result.score, 0);
        const totalQuizzes = student.quizResults.length;
        const averageScore = totalQuizzes > 0 ? totalScore / totalQuizzes : 0;

        return {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          totalScore,
          totalQuizzes,
          averageScore
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
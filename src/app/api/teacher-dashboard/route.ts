import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const authData = await auth();
    const userId = authData.userId;
    console.log('API /api/teacher-dashboard: userId', userId);
    if (!userId) {
      console.log('No userId, returning 401');
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // First check if the user exists with their clerkId
    let user = await db.user.findFirst({
      where: { clerkId: userId },
      include: {
        quizzes: {
          include: { questions: true, assignments: true },
          orderBy: { id: 'desc' },
        },
        teacherOf: true,
      },
    });
    
    console.log('Fetched user:', user);
    
    if (!user) {
      console.log('User not found, returning 404');
      return NextResponse.json({ user: null }, { status: 404 });
    }
    
    // Get count of students linked to this teacher
    const studentsCount = await db.teacherStudent.count({
      where: { teacherId: user.id }
    });
    
    // Get count of quizzes created by this teacher
    const quizzesCount = await db.quiz.count({
      where: { createdById: user.id }
    });
    
    return NextResponse.json({ 
      user,
      stats: {
        studentsCount,
        quizzesCount
      }
    });
  } catch (error) {
    console.log('Server error:', error);
    return NextResponse.json({ user: null, error: 'Server error' }, { status: 500 });
  }
} 
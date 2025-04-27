import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all users with their roles
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Get stats
    const stats = {
      totalUsers: await prisma.user.count(),
      totalStudents: await prisma.user.count({
        where: { role: 'STUDENT' }
      }),
      totalTeachers: await prisma.user.count({
        where: { role: 'TEACHER' }
      })
    };

    return NextResponse.json({ users, stats });
  } catch (error) {
    console.error('Error in admin users endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
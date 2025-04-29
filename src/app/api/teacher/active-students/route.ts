import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
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

    // Count all students linked to this teacher
    const teacherStudentLinks = await db.teacherStudent.findMany({
      where: { teacherId: teacher.id },
      include: {
        student: true
      }
    });

    // Return the count of active students
    return NextResponse.json({ 
      count: teacherStudentLinks.length,
      students: teacherStudentLinks.map(link => link.student)
    });
  } catch (error) {
    console.error('Active students API error:', error);
    return NextResponse.json({ error: 'Failed to fetch active students' }, { status: 500 });
  }
} 
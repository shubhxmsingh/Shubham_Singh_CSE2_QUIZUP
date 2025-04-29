import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId || sessionClaims?.publicMetadata?.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Find all students linked to this teacher
    const teacherLinks = await db.teacherStudent.findMany({
      where: { teacherId: userId },
      select: { student: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    const students = teacherLinks.map((link) => ({
      ...link.student,
      name: `${link.student.firstName || ''} ${link.student.lastName || ''}`.trim()
    }));
    return NextResponse.json({ students });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 
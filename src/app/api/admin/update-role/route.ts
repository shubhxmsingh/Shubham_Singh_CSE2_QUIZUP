import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId: targetUserId, role } = await req.json();

    if (!targetUserId || !role || !['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Start a transaction to update role
    const user = await prisma.$transaction(async (tx) => {
      // Get the user
      const user = await tx.user.findUnique({
        where: { id: targetUserId },
        include: {
          student: true,
          teacher: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Delete existing role records
      if (user.student) {
        await tx.student.delete({ where: { userId: user.id } });
      }
      if (user.teacher) {
        await tx.teacher.delete({ where: { userId: user.id } });
      }

      // Update user with new role
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          role,
          ...(role === 'STUDENT' ? {
            student: { create: {} }
          } : role === 'TEACHER' ? {
            teacher: { create: {} }
          } : {})
        },
      });

      // Update Clerk user metadata
      await clerkClient.users.updateUserMetadata(user.clerkId, {
        publicMetadata: {
          role
        }
      });

      return updatedUser;
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error in update role endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 
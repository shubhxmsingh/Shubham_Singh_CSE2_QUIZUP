import { headers } from 'next/headers';
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs";

// Force dynamic behavior
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json(
        { 
          success: false,
          error: "Unauthorized" 
        },
        { status: 401 }
      );
    }

    // Get role from Clerk's public metadata
    const role = user.publicMetadata.role as string;
    if (!role || (role !== 'STUDENT' && role !== 'TEACHER')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid role. Please contact administrator.' 
      }, { status: 403 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        student: true,
        teacher: true
      }
    });

    if (!existingUser) {
      const primaryEmail = user.emailAddresses.find(
        email => email.id === user.primaryEmailAddressId
      );

      if (!primaryEmail?.emailAddress) {
        throw new Error('No primary email found for user');
      }

      // Create new user with role from Clerk metadata
      const newUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: primaryEmail.emailAddress,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: role,
          emailVerified: primaryEmail.verification !== null,
          lastLoginAt: new Date(),
          ...(role === 'STUDENT' ? {
            student: { create: {} }
          } : {
            teacher: { create: {} }
          })
        },
        include: {
          student: true,
          teacher: true
        }
      });

      return NextResponse.json({
        success: true,
        message: "User created successfully",
        user: newUser
      });
    }

    // Handle role mismatch
    if (existingUser.role !== role) {
      // Delete any existing role records
      if (existingUser.student) {
        await prisma.student.delete({ where: { userId: existingUser.id } });
      }
      if (existingUser.teacher) {
        await prisma.teacher.delete({ where: { userId: existingUser.id } });
      }

      // Update user with new role and create appropriate role record
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: role,
          ...(role === 'STUDENT' ? {
            student: { create: {} }
          } : {
            teacher: { create: {} }
          })
        },
        include: {
          student: true,
          teacher: true
        }
      });

      return NextResponse.json({
        success: true,
        message: "User role updated successfully",
        user: updatedUser
      });
    }

    // Fix incorrect role records if needed
    if (role === 'STUDENT') {
      if (!existingUser.student) {
        await prisma.student.create({ data: { userId: existingUser.id } });
      }
      if (existingUser.teacher) {
        await prisma.teacher.delete({ where: { userId: existingUser.id } });
      }
    } else if (role === 'TEACHER') {
      if (!existingUser.teacher) {
        await prisma.teacher.create({ data: { userId: existingUser.id } });
      }
      if (existingUser.student) {
        await prisma.student.delete({ where: { userId: existingUser.id } });
      }
    }

    // Get final user state
    const finalUser = await prisma.user.findUnique({
      where: { id: existingUser.id },
      include: {
        student: true,
        teacher: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "User synchronized successfully",
      user: finalUser
    });

  } catch (error) {
    console.error('Error in sync-user:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 
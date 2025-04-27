import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  console.log('Fix account started');
  const { userId } = auth();
  console.log('userId:', userId);

  if (!userId) {
    console.log('No user id found');
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // First, check if the user exists
      let existingUser = await tx.user.findFirst({
        where: {
          clerkId: userId,
        }
      });

      // If no user exists, create a new one
      if (!existingUser) {
        console.log('No existing user found, creating one...');
        try {
          existingUser = await tx.user.create({
            data: {
              clerkId: userId,
              email: `temp-${userId}@example.com`,
              firstName: 'Temporary',
              lastName: 'User',
              role: 'STUDENT',
            },
          });
          console.log('Created new user:', existingUser);
        } catch (error) {
          console.error('Error creating user:', error);
          throw new Error('Failed to create user account');
        }
      }

      // Determine the target role (switch between student and teacher)
      const targetRole = existingUser.role === 'TEACHER' ? 'STUDENT' : 'TEACHER';
      
      // Update the user to the new role
      const updatedUser = await tx.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          role: targetRole,
        },
      });

      console.log('Updated user:', updatedUser);
      return updatedUser;
    });

    console.log('Fix account completed successfully');
    return NextResponse.json({
      success: true,
      message: 'Account fixed successfully',
      user: result,
    });
  } catch (error) {
    console.error('Error in fix-account:', error);
    
    // Handle specific error messages for better user feedback
    let errorMessage = 'An unknown error occurred';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (errorMessage.includes('already exists')) {
        errorMessage = 'This account already exists';
        statusCode = 400;
      } else if (errorMessage.includes('not found')) {
        errorMessage = 'User record not found';
        statusCode = 404;
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: String(error)
      },
      { status: statusCode }
    );
  }
} 
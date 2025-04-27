import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const authData = await auth();
    const clerkUser = await currentUser();
    
    if (!authData.userId || !clerkUser) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Get the role from the request body
    let role: UserRole = UserRole.STUDENT; // Default to STUDENT
    
    try {
      const body = await req.json();
      if (body && body.role && Object.values(UserRole).includes(body.role as UserRole)) {
        role = body.role as UserRole;
      }
    } catch (e) {
      // If we can't parse the body, continue with the default role
      console.log('No role provided in request body, using default role: STUDENT');
    }
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { clerkId: authData.userId }
    });
    
    if (existingUser) {
      // Update the existing user
      const updatedUser = await db.user.update({
        where: { clerkId: authData.userId },
        data: {
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          role: role
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'User updated successfully', 
        user: updatedUser 
      });
    }
    
    // Create a new user
    const newUser = await db.user.create({
      data: {
        clerkId: authData.userId,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        role: role
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully', 
      user: newUser 
    });
    
  } catch (error) {
    console.error('Error fixing user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error', 
      details: String(error)
    }, { status: 500 });
  }
} 
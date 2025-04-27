import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// This endpoint creates a user in the database
export async function POST(req: Request) {
  try {
    const authInfo = auth();
    if (!authInfo.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Clone the request before reading the body to avoid the "disturbed" error
    const clonedReq = req.clone();
    const body = await clonedReq.json();
    const { email, firstName, lastName, role } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json({ 
        message: 'User already exists',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          name: `${existingUser.firstName || ''} ${existingUser.lastName || ''}`.trim(),
          role: existingUser.role
        }
      });
    }
    
    // Create new user
    const newUser = await db.user.create({
      data: {
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        role: role || 'STUDENT',
        clerkId: authInfo.userId
      }
    });
    
    return NextResponse.json({ 
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        name: `${newUser.firstName || ''} ${newUser.lastName || ''}`.trim(),
        role: newUser.role,
        clerkId: newUser.clerkId
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ 
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 
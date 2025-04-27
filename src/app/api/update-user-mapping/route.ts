import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs';

// This endpoint links the current authenticated Clerk user to a user in the database
export async function POST(req: Request) {
  try {
    const authInfo = auth();
    if (!authInfo.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Clone the request before reading the body to avoid the "disturbed" error
    const clonedReq = req.clone();
    const body = await clonedReq.json();
    const { email, role } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Find user by email
    const existingUser = await db.user.findUnique({
      where: { email }
    });
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get clerk user data for name
    let firstName = existingUser.firstName;
    let lastName = existingUser.lastName;
    
    try {
      const clerkUser = await clerkClient.users.getUser(authInfo.userId);
      firstName = clerkUser.firstName || firstName;
      lastName = clerkUser.lastName || lastName;
    } catch (clerkError) {
      console.error('Error fetching Clerk user data:', clerkError);
      // Continue even if we can't get Clerk user data
    }
    
    // Update the user with the Clerk ID
    const updatedUser = await db.user.update({
      where: { id: existingUser.id },
      data: { 
        clerkId: authInfo.userId,
        role: role || existingUser.role,
        firstName,
        lastName
      },
    });

    // Update Clerk user metadata to match the role
    if (role) {
      try {
        await clerkClient.users.updateUserMetadata(authInfo.userId, {
          publicMetadata: {
            role: role
          }
        });
        console.log(`Updated Clerk metadata for user ${authInfo.userId} with role ${role}`);
      } catch (clerkError) {
        console.error('Error updating Clerk metadata:', clerkError);
        // Continue execution even if Clerk update fails
      }
    }
    
    return NextResponse.json({ 
      message: 'User mapping updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        name: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim(),
        role: updatedUser.role,
        clerkId: updatedUser.clerkId
      }
    });
  } catch (error) {
    console.error('Error updating user mapping:', error);
    return NextResponse.json({ 
      error: 'Failed to update user mapping',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 
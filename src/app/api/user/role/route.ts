import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId: clerkId } = auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Try to find the user by Clerk ID
    const user = await db.user.findUnique({
      where: { clerkId },
      select: { role: true, id: true }
    });
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        role: null
      }, { status: 404 });
    }
    
    return NextResponse.json({ role: user.role, userId: user.id });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user role',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const authInfo = auth();
    
    return NextResponse.json({
      isAuthenticated: !!authInfo.userId,
      userId: authInfo.userId,
      sessionId: authInfo.sessionId,
      sessionClaims: authInfo.sessionClaims,
    });
  } catch (error) {
    console.error('Auth debug error:', error);
    return NextResponse.json({ 
      error: 'Failed to get auth info',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 
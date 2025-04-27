import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs';

export async function createUserIfNotExists(clerkId: string, email: string, firstName?: string, lastName?: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (existingUser) {
      return existingUser;
    }

    const newUser = await prisma.user.create({
      data: {
        clerkId,
        email,
        firstName,
        lastName,
        role: 'STUDENT', // Default role
      },
    });

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUserRole() {
  const { userId } = auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  return user?.role;
} 
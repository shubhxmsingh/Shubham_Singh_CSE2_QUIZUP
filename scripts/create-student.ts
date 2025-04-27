import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Replace this with your actual Clerk user ID
  const clerkId = 'YOUR_CLERK_USER_ID';
  
  try {
    // First, create the user
    const user = await prisma.user.create({
      data: {
        clerkId: clerkId,
        email: 'student@example.com', // Replace with actual email
        firstName: 'Student',
        lastName: 'User',
        role: 'STUDENT',
        student: {
          create: {}
        }
      },
      include: {
        student: true
      }
    });

    console.log('Created user:', user);
    console.log('Created student record:', user.student);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
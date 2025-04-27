import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get your user from database (using your email)
    const dbUser = await prisma.user.findFirst({
      where: {
        clerkId: process.env.CLERK_USER_ID // Will be provided when running the script
      },
      include: {
        teacher: true,
        student: true
      }
    });

    if (!dbUser) {
      console.error('User not found in database');
      return;
    }

    console.log('Found user:', {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      hasTeacher: !!dbUser.teacher,
      hasStudent: !!dbUser.student
    });

    // Update user role to TEACHER and ensure teacher record exists
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        role: 'TEACHER',
        teacher: {
          upsert: {
            create: {},
            update: {}
          }
        }
      },
      include: {
        teacher: true,
        student: true
      }
    });

    console.log('Updated user:', {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      hasTeacher: !!updatedUser.teacher,
      hasStudent: !!updatedUser.student
    });

    console.log('Account fixed successfully!');
  } catch (error) {
    console.error('Error fixing account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all users with their profiles
    const users = await prisma.user.findMany({
      include: {
        student: true,
        teacher: true
      }
    });

    console.log('All users in database:');
    for (const user of users) {
      console.log({
        id: user.id,
        email: user.email,
        role: user.role,
        hasStudent: !!user.student,
        hasTeacher: !!user.teacher
      });
    }
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
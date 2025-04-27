import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get your user from database (using your email)
    const dbUser = await prisma.user.findUnique({
      where: {
        email: 'shubham.sikarwar2005@gmail.com' // Replace with your email
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

    // Update user role to TEACHER
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { role: 'TEACHER' }
    });

    console.log('Updated user role:', updatedUser.role);

    // Create teacher record if it doesn't exist
    if (!dbUser.teacher) {
      const teacher = await prisma.teacher.create({
        data: {
          userId: dbUser.id
        }
      });
      console.log('Created teacher record:', teacher);
    }

    // Remove student record if it exists
    if (dbUser.student) {
      await prisma.student.delete({
        where: { userId: dbUser.id }
      });
      console.log('Removed student record');
    }

    // Verify the changes
    const finalUser = await prisma.user.findUnique({
      where: { id: dbUser.id },
      include: {
        teacher: true,
        student: true
      }
    });

    console.log('Final user state:', {
      id: finalUser?.id,
      email: finalUser?.email,
      role: finalUser?.role,
      hasTeacher: !!finalUser?.teacher,
      hasStudent: !!finalUser?.student
    });

    console.log('Done fixing user role and records');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
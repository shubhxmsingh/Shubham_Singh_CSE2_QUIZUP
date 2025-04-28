const { PrismaClient } = require('@prisma/client');
const { UserRole } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating test data...');

    // Get clerkId from arguments or use the default test ID
    const teacherClerkId = process.argv[2] || 'user_2wEquI59TZ4z99DFM5TgIRniyhr';
    
    console.log(`Using teacher clerk ID: ${teacherClerkId}`);

    // Create a teacher using upsert to avoid duplicate errors
    const teacher = await prisma.user.upsert({
      where: { clerkId: teacherClerkId },
      update: {
        firstName: 'Test',
        lastName: 'Teacher',
        role: UserRole.TEACHER,
        isActive: true,
        emailVerified: true
      },
      create: {
        email: 'teacher@example.com',
        firstName: 'Test',
        lastName: 'Teacher',
        role: UserRole.TEACHER,
        clerkId: teacherClerkId,
        isActive: true,
        emailVerified: true
      }
    });
    console.log('Created/Updated teacher:', teacher);

    // Create students
    const students = [];
    for (let i = 1; i <= 5; i++) {
      const student = await prisma.user.upsert({
        where: { email: `student${i}@example.com` },
        update: {
          firstName: `Student`,
          lastName: `${i}`,
          role: UserRole.STUDENT,
          isActive: true,
          emailVerified: true
        },
        create: {
          email: `student${i}@example.com`,
          firstName: `Student`,
          lastName: `${i}`,
          role: UserRole.STUDENT,
          clerkId: `student_clerk_id_${i}_${Date.now()}`, // Make it unique
          isActive: true,
          emailVerified: true
        }
      });
      students.push(student);
      console.log(`Created/Updated student ${i}:`, student);
    }

    // Link teacher with students - use upsert to avoid duplicates
    for (const student of students) {
      // Create a unique ID for the teacher-student relationship
      const linkId = `${teacher.id}_${student.id}`;
      
      await prisma.teacherStudent.upsert({
        where: { id: linkId },
        update: {},
        create: {
          id: linkId,
          teacherId: teacher.id,
          studentId: student.id
        }
      });
      console.log(`Linked teacher to student: ${student.firstName} ${student.lastName}`);
    }

    // Assign quiz to students
    for (const student of students) {
      await prisma.quizAssignment.create({
        data: {
          quizId: quiz.id,
          studentId: student.id
        }
      });
      console.log(`Assigned quiz to student: ${student.firstName} ${student.lastName}`);
    }

    console.log('Test data creation completed!');
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
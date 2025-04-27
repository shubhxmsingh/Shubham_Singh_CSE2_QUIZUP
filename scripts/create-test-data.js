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

    // Create a sample quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: 'Sample Math Quiz',
        subject: 'Mathematics',
        level: 'Intermediate',
        duration: 30, // minutes
        numberOfQuestions: 5,
        createdById: teacher.id,
        questions: {
          create: [
            {
              content: 'What is 2 + 2?',
              options: ['3', '4', '5', '6'],
              correctAnswer: '4',
              explanation: 'Basic addition'
            },
            {
              content: 'What is 5 × 5?',
              options: ['20', '25', '30', '35'],
              correctAnswer: '25',
              explanation: 'Multiplication'
            },
            {
              content: 'What is 10 ÷ 2?',
              options: ['3', '4', '5', '6'],
              correctAnswer: '5',
              explanation: 'Division'
            },
            {
              content: 'What is the square root of 16?',
              options: ['2', '3', '4', '5'],
              correctAnswer: '4',
              explanation: 'Square root'
            },
            {
              content: 'What is 3²?',
              options: ['6', '9', '12', '15'],
              correctAnswer: '9',
              explanation: 'Exponent'
            }
          ]
        }
      }
    });
    console.log('Created quiz:', quiz);

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
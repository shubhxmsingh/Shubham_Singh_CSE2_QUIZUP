import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Create a teacher user
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      clerkId: 'teacher_clerk_id', // Replace with actual Clerk ID when integrating
      name: 'John Teacher',
      email: 'teacher@example.com',
      role: 'TEACHER',
    },
  });

  console.log(`Created teacher: ${teacher.name}`);

  // Create a few student users
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const student = await prisma.user.upsert({
      where: { email: `student${i}@example.com` },
      update: {},
      create: {
        clerkId: `student${i}_clerk_id`, // Replace with actual Clerk IDs
        name: `Student ${i}`,
        email: `student${i}@example.com`,
        role: 'STUDENT',
      },
    });
    students.push(student);
    console.log(`Created student: ${student.name}`);
  }

  // Link students to teacher
  for (const student of students) {
    await prisma.teacherStudent.upsert({
      where: { 
        id: `${teacher.id}_${student.id}` 
      },
      update: {},
      create: {
        id: `${teacher.id}_${student.id}`,
        teacherId: teacher.id,
        studentId: student.id,
      },
    });
    console.log(`Linked ${student.name} to ${teacher.name}`);
  }

  // Create some sample quizzes
  const subjects = ['Mathematics', 'Physics', 'Computer Science'];
  const levels = ['Easy', 'Medium', 'Hard'];

  for (let i = 0; i < 3; i++) {
    const quiz = await prisma.quiz.create({
      data: {
        title: `${subjects[i]} Quiz (${levels[i]})`,
        subject: subjects[i],
        level: levels[i],
        duration: 30,
        numberOfQuestions: 10,
        createdById: teacher.id,
        questions: {
          create: Array.from({ length: 5 }, (_, j) => ({
            content: `Sample question ${j+1} for ${subjects[i]}`,
            options: [
              `Option A for question ${j+1}`,
              `Option B for question ${j+1}`,
              `Option C for question ${j+1}`,
              `Option D for question ${j+1}`,
            ],
            correctAnswer: 'Option A for question 1',
            explanation: `Explanation for question ${j+1}`
          }))
        }
      }
    });

    console.log(`Created quiz: ${quiz.title}`);

    // Assign quiz to students
    for (const student of students) {
      await prisma.quizAssignment.create({
        data: {
          quizId: quiz.id,
          studentId: student.id,
        }
      });
      console.log(`Assigned ${quiz.title} to ${student.name}`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find the sample quiz
  const quiz = await prisma.quiz.findFirst({
    where: { title: 'Sample Math Quiz' }
  });
  if (!quiz) {
    console.log('Sample Math Quiz not found.');
    return;
  }

  // Delete related assignments
  await prisma.quizAssignment.deleteMany({ where: { quizId: quiz.id } });
  // Delete related results
  await prisma.quizResult.deleteMany({ where: { quizId: quiz.id } });
  // Delete related questions
  await prisma.question.deleteMany({ where: { quizId: quiz.id } });
  // Delete the quiz
  await prisma.quiz.delete({ where: { id: quiz.id } });
  console.log('Deleted Sample Math Quiz and all related data.');
}

main().finally(() => prisma.$disconnect()); 
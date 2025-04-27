import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adjustDifficulty } from '@/lib/quiz-utils';
import { Difficulty } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { quizId, answers, timeTaken } = await req.json();

    if (!quizId || !answers || !Array.isArray(answers) || typeof timeTaken !== 'number') {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    // Fetch the quiz with questions to verify answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return new NextResponse('Quiz not found', { status: 404 });
    }

    // Verify user is assigned to this quiz
    const isAssigned = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        assignedTo: {
          some: {
            clerkId: userId,
          },
        },
      },
    });

    if (!isAssigned) {
      return new NextResponse('Quiz not assigned to user', { status: 403 });
    }

    // Check if user has already submitted this quiz
    const existingResult = await prisma.result.findUnique({
      where: {
        userId_quizId: {
          userId,
          quizId,
        },
      },
    });

    if (existingResult) {
      return new NextResponse('Quiz already submitted', { status: 400 });
    }

    // Calculate score and track correct/incorrect answers in sequence
    let correctAnswers = 0;
    let correctInRow = 0;
    let incorrectInRow = 0;
    let currentDifficulty = Difficulty.EASY;
    const questionResults = quiz.questions.map((question, index) => {
      const isCorrect = question.correctAnswer === answers[index];
      
      if (isCorrect) {
        correctAnswers++;
        correctInRow++;
        incorrectInRow = 0;
      } else {
        correctInRow = 0;
        incorrectInRow++;
      }

      // Adjust difficulty based on performance
      currentDifficulty = adjustDifficulty(
        currentDifficulty,
        correctInRow,
        incorrectInRow
      );

      return {
        questionId: question.id,
        userAnswer: answers[index],
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: currentDifficulty,
      };
    });

    // Calculate final score
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Create result with question details
    const result = await prisma.result.create({
      data: {
        userId,
        quizId,
        score,
        timeTaken,
        questionResults: {
          create: questionResults.map(qr => ({
            questionId: qr.questionId,
            userAnswer: qr.userAnswer,
            isCorrect: qr.isCorrect,
            difficulty: qr.difficulty,
          })),
        },
      },
    });

    // Update question difficulties based on performance
    for (const qr of questionResults) {
      await prisma.question.update({
        where: { id: qr.questionId },
        data: { difficulty: qr.difficulty },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
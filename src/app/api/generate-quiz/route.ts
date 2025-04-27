import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { subject, title } = await req.json();
    if (!subject || !title) {
      return new NextResponse('Subject and title are required', { status: 400 });
    }

    // Verify user is a teacher
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'TEACHER') {
      return new NextResponse('Only teachers can generate quizzes', { status: 403 });
    }

    // Generate questions using OpenAI
    const prompt = `Generate 10 multiple-choice questions for ${subject}. Each question should have:
1. A clear question
2. 4 options (A, B, C, D)
3. The correct answer
4. A brief explanation

Format the response as a JSON array of objects with the following structure:
{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": "string (one of the options)",
  "explanation": "string"
}

Make the questions challenging but fair, and ensure the explanations are educational.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional educator creating high-quality multiple-choice questions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the response and validate the structure
    const questions: GeneratedQuestion[] = JSON.parse(response);

    // Validate the structure of each question
    for (const question of questions) {
      if (!question.question || !Array.isArray(question.options) || 
          question.options.length !== 4 || !question.correctAnswer || 
          !question.explanation) {
        throw new Error('Invalid question structure');
      }
    }

    // Create the quiz in the database
    const quiz = await prisma.quiz.create({
      data: {
        title,
        subject,
        createdById: userId,
        questions: {
          create: questions.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          }))
        }
      },
      include: {
        questions: true
      }
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment variable
const apiKey = 'AIzaSyBOPiD3l141F9phLC8YFqki3nO7xY-U3y8';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(apiKey || '');
// Use a model that's compatible with v1beta API version
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Generate improvement guidance based on quiz results
async function generateImprovement(quizData: any, score: number, incorrectAnswers: any[]) {
  try {
    if (!apiKey) {
      return "AI guidance not available.";
    }

    let incorrectTopics = "";
    if (incorrectAnswers.length > 0) {
      incorrectTopics = incorrectAnswers.map(q => 
        `Question: ${q.question}\nCorrect Answer: ${q.correctAnswer}\nUser Answer: ${q.userAnswer}\n`
      ).join("\n");
    }

    const prompt = `
    You are an educational AI assistant. A student has just completed a quiz with the following details:
    - Subject: ${quizData.subject}
    - ${quizData.topic ? `Topic: ${quizData.topic}` : ''}
    - Score: ${score}%
    
    Here are the questions they answered incorrectly:
    ${incorrectTopics || "They answered all questions correctly!"}
    
    Based on their performance, provide specific, actionable guidance on how they can improve in these areas.
    Format your response in a encouraging and supportive tone, with bullet points for key recommendations.
    Keep your response concise (maximum 250 words) and focus on 3-4 specific areas for improvement.
    If they scored very well (above 90%), congratulate them and suggest how they might challenge themselves further.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error) {
    console.error('Error generating improvement guidance:', error);
    return "Unable to generate personalized guidance at this time. Review the questions you missed and consider studying those topics more.";
  }
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find user by Clerk ID
    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const body = await request.json();
    const { quizId, score, totalQuestions, incorrectAnswers } = body;

    if (!quizId || score === undefined || !totalQuestions) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    console.log('Saving quiz result:', { 
      userId: user.id, 
      quizId, 
      score, 
      totalQuestions 
    });

    // Get quiz data for guidance generation
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true
      }
    });

    if (!quiz) {
      return new NextResponse('Quiz not found', { status: 404 });
    }

    // Generate improvement guidance
    const improvementGuidance = await generateImprovement(quiz, score, incorrectAnswers || []);

    // Save result with guidance
    const result = await db.quizResult.create({
      data: {
        userId: user.id,
        quizId,
        score,
        totalQuestions,
        improvementGuidance: improvementGuidance || null,
      },
    });

    return NextResponse.json({
      ...result,
      improvementGuidance
    });
  } catch (error) {
    console.error('Error saving quiz results:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Parse URL to get query parameters
    const url = new URL(request.url);
    const quizId = url.searchParams.get('quizId');

    // First, ensure the user exists
    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Then fetch the quiz results
    const query: any = {
      where: {
        userId: user.id,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true,
            topic: true,
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    };

    // If quizId is provided, filter by it
    if (quizId) {
      query.where.quizId = quizId;
    }

    const results = await db.quizResult.findMany(query);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
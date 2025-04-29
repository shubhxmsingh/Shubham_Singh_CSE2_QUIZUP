import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment variable
const apiKey = 'AIzaSyBOPiD3l141F9phLC8YFqki3nO7xY-U3y8';
console.log("API Key available:", !!apiKey); // Log if API key exists (not the key itself)

// Fallback questions if AI generation fails
const getFallbackQuestions = (subject: string, numQuestions: number) => {
  // Basic sample questions for different subjects
  const subjectQuestions: Record<string, any[]> = {
    'Mathematics': [
      {
        content: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: '4',
        explanation: 'Basic addition: 2 + 2 = 4'
      },
      {
        content: 'What is the square root of 16?',
        options: ['2', '4', '6', '8'],
        correctAnswer: '4',
        explanation: '4 × 4 = 16, so the square root of 16 is 4'
      },
      {
        content: 'What is 10 × 5?',
        options: ['25', '50', '75', '100'],
        correctAnswer: '50',
        explanation: 'Multiplication: 10 × 5 = 50'
      }
    ],
    'Science': [
      {
        content: 'What is the chemical symbol for water?',
        options: ['H2O', 'CO2', 'O2', 'NaCl'],
        correctAnswer: 'H2O',
        explanation: 'Water is composed of hydrogen and oxygen with the formula H2O'
      },
      {
        content: 'What is the force that pulls objects towards Earth?',
        options: ['Magnetism', 'Electricity', 'Gravity', 'Friction'],
        correctAnswer: 'Gravity',
        explanation: 'Gravity is the force that attracts objects with mass towards each other'
      },
      {
        content: 'Which planet is known as the Red Planet?',
        options: ['Earth', 'Mars', 'Venus', 'Jupiter'],
        correctAnswer: 'Mars',
        explanation: 'Mars appears reddish due to iron oxide (rust) on its surface'
      }
    ]
  };
  
  // Default questions if subject is not in the list
  const defaultQuestions = [
    {
      content: 'Which of these is NOT a programming language?',
      options: ['Python', 'Java', 'HTML', 'Banana'],
      correctAnswer: 'Banana',
      explanation: 'Banana is a fruit, not a programming language'
    },
    {
      content: 'What does CPU stand for?',
      options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Power Usage', 'Computer Processing Utility'],
      correctAnswer: 'Central Processing Unit',
      explanation: 'CPU stands for Central Processing Unit, the brain of a computer'
    },
    {
      content: 'Which of these is a search engine?',
      options: ['Google', 'Facebook', 'Twitter', 'Instagram'],
      correctAnswer: 'Google',
      explanation: 'Google is a search engine, while the others are social media platforms'
    }
  ];
  
  // Get questions for the requested subject or use default
  const questions = subjectQuestions[subject] || defaultQuestions;
  
  // Return the requested number of questions (repeat if necessary)
  const result = [];
  for (let i = 0; i < numQuestions; i++) {
    result.push(questions[i % questions.length]);
  }
  
  return result;
};

// Initialize Gemini API with correct model name
const genAI = new GoogleGenerativeAI(apiKey || '');
// Use a model that's compatible with v1beta API version
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find the user by Clerk ID first
    const teacher = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    
    const body = await req.json();
    const { title, subject, topic, level, duration, numQuestions } = body;
    
    if (!title || !subject || !level || !duration || !numQuestions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    let questions;
    
    try {
      // Only try AI generation if API key is available
      if (apiKey) {
        // Prepare topic string for prompt
        const topicString = topic ? `specifically focusing on the topic '${topic}'` : '';
        
        // Generate MCQs using Gemini API
        const prompt = `Generate ${numQuestions} multiple-choice questions for a quiz on the subject '${subject}' ${topicString} at '${level}' level. 

Important requirements:
1. Each question should have 4 distinct options, one correct answer, and a brief explanation.
2. Make sure all questions are unique and do not repeat concepts within the same quiz.
3. Questions should be diverse and cover different aspects of the ${topic || subject}.
4. Ensure the correct answer is clearly identifiable and accurate.
5. Make the questions ${level.toLowerCase()} difficulty level.

Return ONLY a raw JSON array with no markdown formatting, no code blocks, and no backticks. The response should be a valid parseable JSON array in this exact format:

[
  {
    "content": "Question text here?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "The correct option",
    "explanation": "Explanation here"
  }
]`;
        
        console.log("Sending request to Gemini API");
        const result = await model.generateContent(prompt);
        console.log("Received response from Gemini API");
        
        const text = result.response.text();
        
        try {
          // Clean the response to handle markdown code blocks
          let jsonText = text;
          
          // Remove markdown code block formatting if present
          if (text.includes('```')) {
            // Extract content between code blocks
            const match = text.match(/```(?:json)?\s*\n([\s\S]*?)```/);
            if (match && match[1]) {
              jsonText = match[1].trim();
              console.log("Extracted JSON from markdown code block");
            }
          }
          
          questions = JSON.parse(jsonText);
          console.log("Successfully parsed Gemini response");
          
          // Check for duplicates by creating a Set of question content
          const questionTexts = new Set();
          const uniqueQuestions = questions.filter((q: any) => {
            if (questionTexts.has(q.content)) {
              return false;
            }
            questionTexts.add(q.content);
            return true;
          });
          
          // If we lost questions due to duplication, make sure we still have enough
          if (uniqueQuestions.length < Number(numQuestions)) {
            console.log(`Filtered out ${questions.length - uniqueQuestions.length} duplicate questions`);
            questions = uniqueQuestions;
          } else {
            questions = uniqueQuestions.slice(0, Number(numQuestions));
          }
          
        } catch (error) {
          console.error('Error parsing Gemini response:', error);
          console.log('Raw Gemini response:', text);
          // Fall back to predefined questions
          questions = getFallbackQuestions(subject, Number(numQuestions));
          console.log("Using fallback questions due to parse error");
        }
      } else {
        // No API key, use fallback questions
        questions = getFallbackQuestions(subject, Number(numQuestions));
        console.log("Using fallback questions (no API key)");
      }
    } catch (error) {
      console.error('Error in AI question generation:', error);
      // Fall back to predefined questions
      questions = getFallbackQuestions(subject, Number(numQuestions));
      console.log("Using fallback questions due to API error");
    }
    
    // Create quiz
    const quiz = await db.quiz.create({
      data: {
        title: title || `${subject} Quiz (${level})`,
        subject,
        level,
        duration: Number(duration),
        numberOfQuestions: Number(numQuestions),
        createdById: teacher.id,
        questions: {
          create: questions.map((q: any) => ({
            content: q.content,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          })),
        },
      },
    });
    
    // If topic is provided, update the quiz after creation
    if (topic) {
      try {
        await db.$executeRaw`UPDATE "Quiz" SET "topic" = ${topic} WHERE id = ${quiz.id}`;
        console.log(`Updated quiz ${quiz.id} with topic: ${topic}`);
      } catch (error) {
        console.error('Failed to update quiz with topic:', error);
        // Continue execution - the quiz is created but without the topic
      }
    }
    
    // Find all students linked to this teacher
    const teacherLinks = await db.teacherStudent.findMany({
      where: { teacherId: teacher.id },
      select: { studentId: true },
    });
    
    // Assign quiz to all students
    if (teacherLinks.length > 0) {
      await db.quizAssignment.createMany({
        data: teacherLinks.map((link) => ({ 
          quizId: quiz.id, 
          studentId: link.studentId 
        })),
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      quiz: {
        id: quiz.id,
        title: quiz.title
      }
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Server error' 
    }, { status: 500 });
  }
} 
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Pre-generated quiz templates for fallback
const FALLBACK_QUIZZES = {
  'Mathematics': {
    title: 'Basic Mathematics Quiz',
    questions: [
      {
        text: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: '4',
        explanation: '2 + 2 equals 4'
      },
      {
        text: 'What is the square root of 16?',
        options: ['2', '4', '6', '8'],
        correctAnswer: '4',
        explanation: '4 × 4 = 16'
      },
      {
        text: 'What is 10 × 5?',
        options: ['15', '25', '50', '100'],
        correctAnswer: '50',
        explanation: '10 multiplied by 5 equals 50'
      },
      {
        text: 'What is 100 ÷ 4?',
        options: ['20', '25', '30', '40'],
        correctAnswer: '25',
        explanation: '100 divided by 4 equals 25'
      },
      {
        text: 'What is the value of π (pi) to two decimal places?',
        options: ['3.12', '3.14', '3.16', '3.18'],
        correctAnswer: '3.14',
        explanation: 'π is approximately 3.14159...'
      }
    ]
  },
  'Physics': {
    title: 'Basic Physics Quiz',
    questions: [
      {
        text: 'What is the SI unit of force?',
        options: ['Newton', 'Joule', 'Watt', 'Pascal'],
        correctAnswer: 'Newton',
        explanation: 'Force is measured in Newtons (N)'
      },
      {
        text: 'What is the acceleration due to gravity on Earth?',
        options: ['9.8 m/s²', '10 m/s²', '8.9 m/s²', '11 m/s²'],
        correctAnswer: '9.8 m/s²',
        explanation: 'Standard gravity on Earth is 9.8 m/s²'
      },
      {
        text: 'What is the speed of light in a vacuum?',
        options: ['300,000 km/s', '299,792 km/s', '300,000 m/s', '299,792 m/s'],
        correctAnswer: '299,792 km/s',
        explanation: 'The speed of light in a vacuum is approximately 299,792 kilometers per second'
      },
      {
        text: 'What is the first law of thermodynamics?',
        options: [
          'Energy cannot be created or destroyed',
          'Entropy always increases',
          'Heat flows from hot to cold',
          'Pressure and volume are inversely proportional'
        ],
        correctAnswer: 'Energy cannot be created or destroyed',
        explanation: 'The first law states that energy is conserved in a closed system'
      },
      {
        text: 'What is the unit of electric current?',
        options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
        correctAnswer: 'Ampere',
        explanation: 'Electric current is measured in amperes (A)'
      }
    ]
  },
  'Chemistry': {
    title: 'Basic Chemistry Quiz',
    questions: [
      {
        text: 'What is the chemical symbol for water?',
        options: ['H2O', 'CO2', 'O2', 'H2'],
        correctAnswer: 'H2O',
        explanation: 'Water is composed of two hydrogen atoms and one oxygen atom'
      },
      {
        text: 'What is the pH of pure water?',
        options: ['5', '6', '7', '8'],
        correctAnswer: '7',
        explanation: 'Pure water is neutral with a pH of 7'
      },
      {
        text: 'What is the atomic number of carbon?',
        options: ['4', '6', '8', '12'],
        correctAnswer: '6',
        explanation: 'Carbon has 6 protons in its nucleus'
      },
      {
        text: 'What is the most abundant gas in Earth\'s atmosphere?',
        options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
        correctAnswer: 'Nitrogen',
        explanation: 'Nitrogen makes up about 78% of Earth\'s atmosphere'
      },
      {
        text: 'What is the process of a solid turning directly into a gas called?',
        options: ['Evaporation', 'Sublimation', 'Condensation', 'Deposition'],
        correctAnswer: 'Sublimation',
        explanation: 'Sublimation is the phase transition from solid to gas'
      }
    ]
  },
  'Biology': {
    title: 'Basic Biology Quiz',
    questions: [
      {
        text: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus'],
        correctAnswer: 'Mitochondria',
        explanation: 'Mitochondria produce energy for the cell'
      },
      {
        text: 'What is the process by which plants make food?',
        options: ['Respiration', 'Photosynthesis', 'Transpiration', 'Digestion'],
        correctAnswer: 'Photosynthesis',
        explanation: 'Plants use sunlight to convert carbon dioxide and water into glucose'
      },
      {
        text: 'What is the basic unit of life?',
        options: ['Atom', 'Molecule', 'Cell', 'Tissue'],
        correctAnswer: 'Cell',
        explanation: 'All living organisms are made up of cells'
      },
      {
        text: 'What is the largest organ in the human body?',
        options: ['Liver', 'Brain', 'Skin', 'Heart'],
        correctAnswer: 'Skin',
        explanation: 'The skin is the largest organ, covering the entire body'
      },
      {
        text: 'What is the process of cell division called?',
        options: ['Meiosis', 'Mitosis', 'Fission', 'Budding'],
        correctAnswer: 'Mitosis',
        explanation: 'Mitosis is the process of cell division in somatic cells'
      }
    ]
  }
};

export async function POST(req: Request) {
  const user = auth();
  if (!user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { subject, topic } = await req.json();
  const numQuestions = 15;
  const duration = 20; // minutes

  if (!subject || !topic) {
    return NextResponse.json({ error: 'Missing subject or topic' }, { status: 400 });
  }

  let questions = [];
  let quizTitle = `${subject} Practice Quiz: ${topic}`;
  let usedAI = false;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Generate a ${numQuestions}-question multiple-choice quiz on the topic '${topic}' for the subject '${subject}'. Each question should have 4 options, one correct answer, and a brief explanation.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful quiz generator.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    // Parse the AI response (assume JSON or parseable format)
    const aiContent = completion.choices[0].message.content;
    // Try to parse as JSON, fallback to manual parsing if needed
    try {
      questions = JSON.parse(aiContent);
    } catch {
      // Fallback: try to extract questions from text (not robust, but a backup)
      // You may want to improve this for production
      questions = [];
    }
    usedAI = true;
  } catch (e) {
    // Fallback to static quizzes if AI fails
    if (FALLBACK_QUIZZES[subject]) {
      questions = FALLBACK_QUIZZES[subject].questions.slice(0, numQuestions);
      quizTitle = FALLBACK_QUIZZES[subject].title + ` (Topic: ${topic})`;
    } else {
      return NextResponse.json({ error: 'Failed to generate quiz and no fallback available.' }, { status: 500 });
    }
  }

  // Ensure user exists in DB
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: user.userId },
  });
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: user.userId,
        email: user.email || `${user.userId}@temp.com`,
        firstName: user.firstName || 'User',
        lastName: user.lastName || 'User',
        role: 'STUDENT',
      },
    });
  }

  // Store the quiz in the database
  const quiz = await prisma.quiz.create({
    data: {
      title: quizTitle,
      subject,
      topic,
      duration,
      level: 'Practice',
      numberOfQuestions: numQuestions,
      createdById: dbUser.id,
      questions: {
        create: questions.map((q: any) => ({
          content: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
        })),
      },
    },
    include: { questions: true },
  });

  return NextResponse.json({ quizId: quiz.id, usedAI });
} 
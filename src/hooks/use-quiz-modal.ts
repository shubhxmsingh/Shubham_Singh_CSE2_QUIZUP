import { create } from 'zustand';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

interface QuestionResult {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

interface QuizResult {
  id: string;
  score: number;
  timeTaken: number;
  createdAt: string;
  answers: QuestionResult[];
}

interface QuizModalStore {
  isOpen: boolean;
  quiz: Quiz | null;
  result: QuizResult | null;
  onOpen: () => void;
  onClose: () => void;
  setQuiz: (quiz: Quiz) => void;
  setResult: (result: QuizResult) => void;
}

export const useQuizModal = create<QuizModalStore>((set) => ({
  isOpen: false,
  quiz: null,
  result: null,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false, quiz: null, result: null }),
  setQuiz: (quiz) => set({ quiz }),
  setResult: (result) => set({ result }),
}));
 
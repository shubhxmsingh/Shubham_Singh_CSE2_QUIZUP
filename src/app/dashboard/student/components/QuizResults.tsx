'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuizModal } from '@/hooks/use-quiz-modal';
import { formatDistanceToNow } from 'date-fns';

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

interface Quiz {
  id: string;
  title: string;
  questions: {
    id: string;
    question: string;
    options: string[];
  }[];
}

export default function QuizResults() {
  const { isOpen, onClose, quiz, result } = useQuizModal();
  const [activeTab, setActiveTab] = useState('summary');

  if (!quiz || !result) return null;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getQuestionById = (id: string) => {
    return quiz.questions.find(q => q.id === id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Quiz Results: {quiz.title}</span>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{result.score}%</div>
                  <Progress value={result.score} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Time Taken</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatTime(result.timeTaken)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Correct Answers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {result.answers.filter(a => a.isCorrect).length} / {result.answers.length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            {result.answers.map((answer, index) => {
              const question = getQuestionById(answer.questionId);
              if (!question) return null;

              return (
                <Card key={answer.questionId} className={`${answer.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Question {index + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="font-medium">{question.question}</p>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Your Answer: </span>
                        <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {answer.userAnswer}
                        </span>
                      </p>
                      {!answer.isCorrect && (
                        <p className="text-sm">
                          <span className="font-medium">Correct Answer: </span>
                          <span className="text-green-600">{answer.correctAnswer}</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-600">{answer.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Question Difficulty</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-100 p-4 rounded-lg">
                        <p className="text-green-800 font-medium">Easy Questions</p>
                        <p className="text-2xl font-bold">
                          {result.answers.filter(a => a.isCorrect).length}
                        </p>
                      </div>
                      <div className="bg-red-100 p-4 rounded-lg">
                        <p className="text-red-800 font-medium">Challenging Questions</p>
                        <p className="text-2xl font-bold">
                          {result.answers.filter(a => !a.isCorrect).length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Time Analysis</h4>
                    <p className="text-sm text-gray-600">
                      Average time per question: {formatTime(result.timeTaken / result.answers.length)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
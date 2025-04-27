'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuizModal } from '@/hooks/use-quiz-modal';

interface Quiz {
  id: string;
  title: string;
  subject: string;
  questions: { id: string }[];
  status: 'Not Started' | 'In Progress' | 'Completed';
  score: number | null;
}

interface Props {
  quizzes: Quiz[];
}

export default function AssignedQuizzes({ quizzes }: Props) {
  const { onOpen } = useQuizModal();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    onOpen();
  };

  const getStatusColor = (status: Quiz['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzes.map((quiz) => (
            <TableRow key={quiz.id}>
              <TableCell className="font-medium">{quiz.title}</TableCell>
              <TableCell>{quiz.subject}</TableCell>
              <TableCell>{quiz.questions.length}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(quiz.status)}>
                  {quiz.status}
                </Badge>
              </TableCell>
              <TableCell>
                {quiz.score !== null ? `${quiz.score}%` : '-'}
              </TableCell>
              <TableCell>
                {quiz.status === 'Not Started' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartQuiz(quiz)}
                  >
                    Start Quiz
                  </Button>
                )}
                {quiz.status === 'Completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartQuiz(quiz)}
                  >
                    View Results
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 
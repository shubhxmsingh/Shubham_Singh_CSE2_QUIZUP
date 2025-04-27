'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface Quiz {
  id: string;
  title: string;
  subject: string;
  createdAt: Date;
  questions: { id: string }[];
  results: {
    id: string;
    score: number;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  }[];
}

interface Props {
  quizzes: Quiz[];
}

export default function QuizTable({ quizzes }: Props) {
  const calculateAverageScore = (results: Quiz['results']) => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, result) => sum + result.score, 0);
    return (total / results.length).toFixed(1);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Average Score</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzes.map((quiz) => (
            <TableRow key={quiz.id}>
              <TableCell className="font-medium">{quiz.title}</TableCell>
              <TableCell>{quiz.subject}</TableCell>
              <TableCell>{quiz.questions.length}</TableCell>
              <TableCell>{quiz.results.length}</TableCell>
              <TableCell>{calculateAverageScore(quiz.results)}%</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(quiz.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    View Results
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 
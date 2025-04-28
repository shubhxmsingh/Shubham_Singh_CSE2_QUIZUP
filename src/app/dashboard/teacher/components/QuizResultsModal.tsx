'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';

interface Student {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface QuizResult {
  id: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
  userId: string;
  improvementGuidance?: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: { id: string }[];
  results: QuizResult[];
  assignedTo: Student[];
}

interface Props {
  quiz: Quiz | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuizResultsModal({ quiz, isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    if (quiz && isOpen) {
      setLoading(true);
      
      // Fetch detailed results for this quiz
      const fetchResults = async () => {
        try {
          const response = await fetch(`/api/teacher/quizzes/${quiz.id}/results`);
          if (!response.ok) {
            throw new Error('Failed to fetch quiz results');
          }
          
          const data = await response.json();
          setResults(data.results);
          setStudents(data.students);
        } catch (error) {
          console.error('Error fetching quiz results:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchResults();
    }
  }, [quiz, isOpen]);

  if (!quiz) return null;

  // Calculate statistics
  const totalAssigned = quiz.assignedTo.length;
  const totalAttempted = results.length;
  const completionRate = totalAssigned > 0 ? (totalAttempted / totalAssigned) * 100 : 0;
  
  const averageScore = results.length > 0
    ? results.reduce((sum, result) => sum + result.score, 0) / results.length
    : 0;

  // Get student details for each result
  const getStudentDetails = (userId: string) => {
    return students.find(student => student.id === userId) || {
      firstName: 'Unknown',
      lastName: 'Student',
      email: 'unknown@example.com'
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold dark:text-white">{quiz.title} - Results</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            View detailed results for this quiz
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400">Assigned Students</h3>
                <p className="text-2xl font-bold dark:text-white">{totalAssigned}</p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400">Attempted</h3>
                <p className="text-2xl font-bold dark:text-white">{totalAttempted}</p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400">Average Score</h3>
                <p className="text-2xl font-bold dark:text-white">{averageScore.toFixed(1)}%</p>
              </div>
            </div>

            {/* Completion Rate */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium dark:text-gray-300">Completion Rate</span>
                <span className="text-sm text-muted-foreground dark:text-gray-400">{completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={completionRate} className="h-2 dark:bg-gray-800" />
            </div>

            {/* Results Table */}
            <div className="rounded-md border dark:border-gray-700 overflow-x-auto w-full">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="dark:bg-gray-800">
                    <TableHead className="dark:text-gray-300">Student</TableHead>
                    <TableHead className="dark:text-gray-300">Email</TableHead>
                    <TableHead className="dark:text-gray-300">Score</TableHead>
                    <TableHead className="dark:text-gray-300">Attempted</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quiz.assignedTo.map((student) => {
                    const result = results.find(r => r.userId === student.id);
                    const score = result ? result.score : null;
                    const attempted = result ? true : false;
                    
                    return (
                      <TableRow key={student.id} className="dark:border-gray-700">
                        <TableCell className="font-medium dark:text-white">
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell className="break-all dark:text-gray-300">{student.email}</TableCell>
                        <TableCell className="dark:text-white">
                          {score !== null ? `${score}%` : 'Not attempted'}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {result ? formatDistanceToNow(new Date(result.createdAt), { addSuffix: true }) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={attempted ? "success" : "secondary"}
                            className={attempted 
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}
                          >
                            {attempted ? 'Completed' : 'Not Started'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Detailed Results */}
            {results.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 dark:text-white">Detailed Results</h3>
                <div className="rounded-md border dark:border-gray-700 overflow-x-auto w-full">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="dark:bg-gray-800">
                        <TableHead className="dark:text-gray-300">Student</TableHead>
                        <TableHead className="dark:text-gray-300">Score</TableHead>
                        <TableHead className="dark:text-gray-300">Questions</TableHead>
                        <TableHead className="dark:text-gray-300">Attempted</TableHead>
                        <TableHead className="dark:text-gray-300">Guidance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => {
                        const student = getStudentDetails(result.userId);
                        return (
                          <TableRow key={result.id} className="dark:border-gray-700">
                            <TableCell className="font-medium dark:text-white">
                              {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell className="dark:text-white">{result.score}%</TableCell>
                            <TableCell className="dark:text-gray-300">{result.totalQuestions}</TableCell>
                            <TableCell className="dark:text-gray-300">
                              {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="max-w-xs truncate dark:text-gray-300">
                              {result.improvementGuidance || 'No guidance provided'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="dark:border-gray-700 dark:text-gray-300">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Student {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface Quiz {
  id: string;
  title: string;
}

interface Props {
  students: Student[];
  quizzes: Quiz[];
}

export default function QuizAssignmentForm({ students, quizzes }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuiz || selectedStudents.length === 0) {
      toast.error('Please select a quiz and at least one student');
      return;
    }

    setIsLoading(true);
    console.log(`Assigning quiz ${selectedQuiz} to students:`, selectedStudents);

    try {
      const response = await fetch('/api/assign-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: selectedQuiz,
          studentIds: selectedStudents,
        }),
      });

      const data = await response.json();
      console.log('Assignment response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign quiz');
      }

      toast.success('Quiz assigned successfully!');
      setSelectedQuiz('');
      setSelectedStudents([]);
      router.refresh();
    } catch (error) {
      toast.error('Failed to assign quiz. Please try again.');
      console.error('Error assigning quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quiz">Select Quiz</Label>
        <Select
          value={selectedQuiz}
          onValueChange={setSelectedQuiz}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a quiz" />
          </SelectTrigger>
          <SelectContent>
            {quizzes.map((quiz) => (
              <SelectItem key={quiz.id} value={quiz.id}>
                {quiz.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Select Students</Label>
        <div className="max-h-48 overflow-y-auto border rounded-md p-2">
          {students.map((student) => (
            <div key={student.id} className="flex items-center space-x-2 py-1">
              <Checkbox
                id={student.id}
                checked={selectedStudents.includes(student.id)}
                onCheckedChange={() => toggleStudent(student.id)}
              />
              <label
                htmlFor={student.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {student.firstName} {student.lastName} ({student.email})
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Assigning Quiz...' : 'Assign Quiz'}
      </Button>
    </form>
  );
} 
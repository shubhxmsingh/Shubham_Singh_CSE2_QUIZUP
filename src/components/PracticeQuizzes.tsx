'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { BookOpen, Brain, Beaker, Atom } from 'lucide-react';
import { toast } from 'sonner';

const subjects = [
  {
    name: 'Mathematics',
    icon: Brain,
    description: 'Practice math problems and improve your skills',
    color: 'text-blue-600'
  },
  {
    name: 'Physics',
    icon: Atom,
    description: 'Test your knowledge of physics concepts',
    color: 'text-purple-600'
  },
  {
    name: 'Chemistry',
    icon: Beaker,
    description: 'Explore chemical reactions and principles',
    color: 'text-green-600'
  },
  {
    name: 'Biology',
    icon: BookOpen,
    description: 'Learn about living organisms and systems',
    color: 'text-red-600'
  }
];

export default function PracticeQuizzes() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startQuiz = async (subject: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-practice-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error?.type === 'insufficient_quota') {
          toast.error('Service temporarily unavailable. Please try again later.');
          return;
        }
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      router.push(`/quiz/${data.quizId}`);
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error('Failed to start quiz. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {subjects.map((subject) => {
        const Icon = subject.icon;
        return (
          <Card key={subject.name} className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon className={`w-6 h-6 ${subject.color}`} />
                <CardTitle className="text-lg">{subject.name}</CardTitle>
              </div>
              <CardDescription>{subject.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => startQuiz(subject.name)}
                disabled={loading}
                className="w-full"
              >
                Start Practice
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Quiz {
  id: string;
  title: string;
  results: {
    score: number;
    timeTaken: number;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  }[];
}

interface Props {
  quizzes: Quiz[];
}

export default function QuizAnalytics({ quizzes }: Props) {
  // Calculate average scores per quiz
  const quizScores = quizzes.map(quiz => ({
    name: quiz.title,
    averageScore: quiz.results.length > 0
      ? quiz.results.reduce((sum, result) => sum + result.score, 0) / quiz.results.length
      : 0,
    submissions: quiz.results.length,
  }));

  // Calculate top performers
  const topPerformers = quizzes
    .flatMap(quiz => quiz.results.map(result => ({
      name: `${result.user.firstName} ${result.user.lastName}`,
      score: result.score,
      quiz: quiz.title,
    })))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Calculate average time taken per quiz
  const timeData = quizzes.map(quiz => ({
    name: quiz.title,
    averageTime: quiz.results.length > 0
      ? quiz.results.reduce((sum, result) => sum + result.timeTaken, 0) / quiz.results.length
      : 0,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Average Scores by Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quizScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="averageScore" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Time Taken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="averageTime" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPerformers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Brain, CheckCircle, Clock, BarChart2 } from 'lucide-react';
import QuizBackgroundAnimation from '@/components/QuizBackgroundAnimation';

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizResult {
  id: string;
  score: number;
  totalQuestions: number;
  improvementGuidance: string | null;
  createdAt: string;
  quizId: string;
  quiz: {
    id: string;
    title: string;
    subject: string;
    topic: string | null;
    questions: Question[];
  };
}

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');

  const quizId = params.quizId as string;

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/quiz/results?quizId=${quizId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch quiz results');
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
          setError('No results found for this quiz');
          setLoading(false);
          return;
        }
        
        // Get the most recent result for this quiz
        setResult(data[0]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz results:', error);
        setError('An error occurred while fetching quiz results');
        setLoading(false);
      }
    };
    
    if (quizId) {
      fetchQuizResults();
    }
  }, [quizId]);

  const handleGoBack = () => {
    router.push('/dashboard/student');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-primary">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || 'Something went wrong'}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleGoBack}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Satisfactory';
    if (score >= 50) return 'Needs Improvement';
    return 'Requires Attention';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <QuizBackgroundAnimation />
      
      <div className="container mx-auto max-w-5xl relative">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Button 
            variant="ghost" 
            onClick={handleGoBack} 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{result.quiz.title}</h1>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">{result.quiz.subject}</Badge>
                {result.quiz.topic && <Badge variant="outline">{result.quiz.topic}</Badge>}
              </div>
              <p className="text-muted-foreground mt-1">Completed on {formatDate(result.createdAt)}</p>
            </div>
            
            <div className="flex items-center">
              <div className="text-5xl font-bold mr-4">{result.score}%</div>
              <Badge className={`${getScoreColor(result.score)} text-lg py-1 px-3`}>
                {getScoreText(result.score)}
              </Badge>
            </div>
          </div>
        </motion.div>
        
        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="improvement" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Guidance
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Details
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Award className="mr-2 h-5 w-5 text-yellow-500" />
                      Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{result.score}%</div>
                    <Progress value={result.score} className="mt-2 h-2" />
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      Correct Answers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {Math.round((result.score / 100) * result.totalQuestions)} / {result.totalQuestions}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-blue-500" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{getScoreText(result.score)}</div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
          
          <TabsContent value="improvement" className="space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="mr-2 h-5 w-5 text-purple-600" />
                    AI-Generated Improvement Guidance
                  </CardTitle>
                  <CardDescription>
                    Personalized recommendations to help you improve
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  {result.improvementGuidance ? (
                    <div dangerouslySetInnerHTML={{ 
                      __html: result.improvementGuidance.replace(/\n/g, '<br />') 
                    }} />
                  ) : (
                    <p>No improvement guidance available for this quiz.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Question Details</CardTitle>
                <CardDescription>Review all questions from this quiz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {result.quiz.questions.map((question, index) => (
                  <Card key={question.id} className="border-l-4 border-primary overflow-hidden">
                    <CardHeader className="bg-muted/50 pb-2">
                      <CardTitle className="text-md">
                        Question {index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="mb-3 font-medium">{question.content}</p>
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, idx) => (
                          <div 
                            key={idx}
                            className={`p-2 rounded flex items-start ${
                              option === question.correctAnswer 
                                ? 'bg-green-100 border border-green-300' 
                                : 'bg-gray-100 border border-gray-200'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                              option === question.correctAnswer 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-300'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <div>
                              {option}
                              {option === question.correctAnswer && (
                                <span className="ml-2 text-green-600 text-sm">(Correct Answer)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <span className="font-semibold">Explanation:</span> {question.explanation}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
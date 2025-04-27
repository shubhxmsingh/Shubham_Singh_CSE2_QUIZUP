'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle, ArrowRight, Home } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  questions: Question[];
  duration?: number; // in minutes
}

export default function QuizPage({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quiz/${params.quizId}`);
        if (!response.ok) throw new Error('Failed to fetch quiz');
        const data = await response.json();
        setQuiz(data);
        
        // Initialize timer if quiz has duration
        if (data.duration) {
          const totalSeconds = data.duration * 60;
          setTimeLeft(totalSeconds);
          startTimeRef.current = Date.now();
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error('Failed to load quiz');
        router.push('/dashboard/student');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [params.quizId, router]);

  // Set up timer after quiz is loaded
  useEffect(() => {
    if (quiz?.duration && timeLeft !== null && timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timerRef.current!);
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quiz, timeLeft, timerRunning]);

  // Handle timer expiration
  useEffect(() => {
    if (timeLeft === 0 && !showResults) {
      toast.error("Time's up! Submitting your quiz.");
      calculateScore();
      setShowResults(true);
    }
  }, [timeLeft, showResults]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateScore();
      setShowResults(true);
      // Stop the timer when showing results
      setTimerRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const calculateScore = () => {
    if (!quiz) return;

    let correct = 0;
    quiz.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / quiz.questions.length) * 100);
    setScore(calculatedScore);

    // Calculate time taken
    const timeTaken = startTimeRef.current 
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : null;

    // Save the result
    saveResult(calculatedScore, timeTaken);
  };

  const saveResult = async (finalScore: number, timeTaken: number | null) => {
    try {
      const response = await fetch('/api/quiz/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: params.quizId,
          score: finalScore,
          totalQuestions: quiz?.questions.length,
          answers: selectedAnswers,
          timeTaken,
        }),
      });

      if (!response.ok) throw new Error('Failed to save result');
      
      toast.success('Quiz result saved successfully!');
    } catch (error) {
      console.error('Error saving result:', error);
      toast.error('Failed to save quiz result');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  // Calculate time percentage for the timer bar
  const calculateTimePercentage = () => {
    if (timeLeft === null || !quiz?.duration) return 100;
    return (timeLeft / (quiz.duration * 60)) * 100;
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl p-4 min-h-screen flex items-center justify-center">
        <Card className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-xl">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <CardTitle className="text-2xl font-bold mb-2">Loading Quiz</CardTitle>
            <CardDescription>Please wait while we prepare your quiz...</CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto max-w-3xl p-4 min-h-screen flex items-center justify-center">
        <Card className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-500">Quiz Not Found</CardTitle>
            <CardDescription>We couldn't find the quiz you're looking for.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-6">
            <Button 
              onClick={() => router.push('/dashboard/student')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
            <div className="h-2 w-full bg-primary"></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                  {quiz.subject}
                </Badge>
                <Badge 
                  className={score >= 70 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                    : score >= 40
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                  }
                >
                  {score >= 70 ? "Excellent" : score >= 40 ? "Good" : "Needs Improvement"}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold">
                Quiz Results: {quiz.title}
              </CardTitle>
              <CardDescription>
                You've completed this quiz. Here's how you did:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <div className="text-center md:text-left mb-4 md:mb-0">
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Your Score</h3>
                    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      {score}%
                    </div>
                  </div>
                  <div className="w-full md:w-3/4">
                    <div className="h-8 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          score >= 70 ? "bg-gradient-to-r from-green-500 to-green-400" : 
                          score >= 40 ? "bg-gradient-to-r from-yellow-500 to-yellow-400" : 
                          "bg-gradient-to-r from-red-500 to-red-400"
                        }`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold border-b pb-2">Question Review</h3>
                  {quiz.questions.map((question, index) => {
                    const isCorrect = selectedAnswers[question.id] === question.correctAnswer;
                    return (
                      <motion.div 
                        key={question.id} 
                        className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                            {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 dark:text-gray-200">Question {index + 1}: {question.content}</div>
                            
                            <div className="mt-3 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                              <div className="text-sm text-gray-600 dark:text-gray-400">Your answer:</div>
                              <div className={`font-medium ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {selectedAnswers[question.id] || 'Not answered'}
                              </div>
                              
                              {!isCorrect && (
                                <>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Correct answer:</div>
                                  <div className="font-medium text-green-600 dark:text-green-400">{question.correctAnswer}</div>
                                </>
                              )}
                              
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-3 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md">
                                <span className="font-medium">Explanation:</span> {question.explanation}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={() => router.push('/dashboard/student')}
                    className="rounded-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity px-6"
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const timePercentage = calculateTimePercentage();

  return (
    <div className="container mx-auto max-w-3xl p-4 py-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
            <div className="h-2 w-full bg-primary"></div>
            
            {/* Timer Bar */}
            {timeLeft !== null && (
              <div className="relative h-1.5 w-full">
                <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-linear ${
                    timePercentage > 50 ? 'bg-green-500' :
                    timePercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${timePercentage}%` }}
                ></div>
              </div>
            )}
            
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                <div>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                    {quiz.subject}
                  </Badge>
                  <CardTitle className="text-2xl font-semibold mt-2">{quiz.title}</CardTitle>
                </div>
                {timeLeft !== null && (
                  <div className={`flex items-center gap-2 font-mono text-lg ${
                    timePercentage > 50 ? 'text-green-600 dark:text-green-400' :
                    timePercentage > 20 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    <Clock className="h-5 w-5" />
                    {formatTime(timeLeft)}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                  </div>
                  <div className="text-sm font-medium">
                    Progress: {Math.round(progress)}%
                  </div>
                </div>
                <Progress value={progress} className="h-2 w-full" />
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-xl font-medium p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  {currentQuestion.content}
                </div>
                
                <RadioGroup
                  value={selectedAnswers[currentQuestion.id]}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, index) => (
                    <motion.div 
                      key={index} 
                      className={`flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                        selectedAnswers[currentQuestion.id] === option 
                          ? 'bg-primary/10 border-primary/50 dark:bg-primary/20 dark:border-primary/30' 
                          : 'bg-white dark:bg-gray-900'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} className="mr-3" />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                    </motion.div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/student')}
                    className="gap-2"
                  >
                    <Home className="h-4 w-4" /> Exit Quiz
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    disabled={!selectedAnswers[currentQuestion.id]}
                    className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
                  >
                    {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    {currentQuestionIndex !== quiz.questions.length - 1 && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 
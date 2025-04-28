'use client';

import { useEffect, useState, Fragment } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, BarChart3, Plus, Lightbulb, Settings, Moon, Sun, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from '@/components/ThemeProvider';
import QuizBackgroundAnimation from '@/components/QuizBackgroundAnimation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import QuizCreationForm from './components/QuizCreationForm';
import { useAuth, UserButton, SignOutButton } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import QuizResultsModal from './components/QuizResultsModal';
import { Logo } from '@/components/Logo';

// Animation variants
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  initial: { y: 40, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

// Dynamically import ThemeToggle to prevent hydration mismatch
const ThemeToggle = dynamic(() => Promise.resolve(({ theme, toggleTheme }: { theme: string | undefined, toggleTheme: () => void }) => (
  <Button variant="ghost" size="icon" onClick={toggleTheme}>
    {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
  </Button>
)), { ssr: false });

interface Student {
  id: string;
  name: string;
  email: string;
}

interface QuizResult {
  id: string;
  score: number;
  userId: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: { id: string }[];
  results: QuizResult[];
  assignedTo: Student[];
}

interface UserData {
  id: string;
  name: string;
  email: string;
  createdQuizzes: Quiz[];
}

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const { theme, toggleTheme } = useTheme();
  const [activeStudents, setActiveStudents] = useState(0);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState(false);
  const { userId } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

  // After component mounts, update state to indicate browser environment
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userId) return;
    
    const fetchData = async () => {
      try {
        const res = await fetch('/api/teacher/dashboard');
        if (!res.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await res.json();
        setUser(data.user);
        setLoading(false);
      } catch (err: unknown) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    
    const fetchActiveStudents = async () => {
      try {
        const res = await fetch('/api/teacher/active-students');
        if (!res.ok) {
          throw new Error('Failed to fetch active students');
        }
        const data = await res.json();
        setActiveStudents(data.count);
      } catch (error) {
        console.error('Error fetching active students:', error);
      }
    };

    fetchActiveStudents();
  }, [userId]);

  const handleDeleteQuiz = async () => {
    if (!deleteQuizId) return;
    
    setDeletingQuiz(true);
    
    try {
      const response = await fetch(`/api/teacher/quizzes/${deleteQuizId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete quiz');
      }
      
      // Update local state to remove the deleted quiz
      if (user) {
        setUser({
          ...user,
          createdQuizzes: user.createdQuizzes.filter(quiz => quiz.id !== deleteQuizId)
        });
      }
      
      toast.success('Quiz deleted successfully');
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete quiz');
    } finally {
      setDeletingQuiz(false);
      setDeleteQuizId(null);
    }
  };

  // Add this function to handle viewing quiz results
  const handleViewResults = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowResultsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-primary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="text-gray-600">{error || 'Failed to load dashboard'}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4 md:p-8 relative">
      <QuizBackgroundAnimation />
      
      {/* Header with glass morphism */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="container mx-auto rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl p-6 mb-8 dark:bg-black/10 dark:border-white/10"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <Logo />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-gray-500 bg-clip-text text-transparent dark:from-primary dark:to-purple-400">
                Welcome, {user.name ? user.name.split(' ')[0] : 'Teacher'}!
              </h1>
              <p className="text-muted-foreground mt-2">Here's an overview of your teaching activities</p>
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center space-x-4 bg-white/50 dark:bg-background/50 rounded-xl px-4 py-2 shadow-md backdrop-blur-sm"
          >
            <Badge
              variant="outline"
              className="text-sm px-3 py-1.5 bg-white/80 backdrop-blur-sm text-primary border border-primary/20 dark:bg-gray-800/50 dark:text-blue-300 dark:border-blue-800/30 transition-all hover:bg-primary/5 dark:hover:bg-blue-900/20"
            >
              <Lightbulb className="w-3.5 h-3.5 mr-1.5 opacity-80" />
              Teacher Dashboard
            </Badge>
            {mounted && <ThemeToggle theme={theme} toggleTheme={toggleTheme} />}
            <UserButton />
            <SignOutButton>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
              >
                Logout
              </Button>
            </SignOutButton>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Stats Cards with enhanced styling */}
      <motion.div 
        className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div 
          variants={fadeInUp} 
          whileHover={{ 
            scale: 1.04,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
          }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 dark:border-gray-800/30 shadow-lg">
            <div className="h-2 w-full bg-blue-500"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-primary">Total Quizzes</CardTitle>
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <BookOpen className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{user.createdQuizzes.length}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div 
          variants={fadeInUp} 
          whileHover={{ 
            scale: 1.04,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
          }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 dark:border-gray-800/30 shadow-lg">
            <div className="h-2 w-full bg-purple-500"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-400">Active Students</CardTitle>
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Users className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">{activeStudents}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div 
          variants={fadeInUp} 
          whileHover={{ 
            scale: 1.04,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
          }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 dark:border-gray-800/30 shadow-lg">
            <div className="h-2 w-full bg-green-500"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-green-700 dark:text-green-400">Average Score</CardTitle>
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <BarChart3 className="h-5 w-5 text-green-500 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                {user.createdQuizzes.length > 0
                  ? Math.round(user.createdQuizzes.reduce((acc: number, q: Quiz) => acc + (q.results.reduce((sum: number, r: QuizResult) => sum + r.score, 0) / (q.results.length || 1)), 0) / user.createdQuizzes.length)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      
      {/* Action Buttons */}
      <motion.div 
        className="container mx-auto mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Button 
          onClick={() => setShowCreateQuizModal(true)}
          className="rounded-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Quiz
        </Button>
      </motion.div>

      {/* Tabs with enhanced styling */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="container mx-auto"
      >
        <Tabs defaultValue="quizzes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 rounded-xl p-1 bg-white/20 backdrop-blur-md dark:bg-black/20 shadow-md">
            <TabsTrigger 
              value="quizzes" 
              className="flex items-center gap-2 data-[state=active]:bg-white/90 data-[state=active]:shadow-md rounded-lg dark:data-[state=active]:bg-gray-800/90"
            >
              <BookOpen className="w-4 h-4" /> My Quizzes
            </TabsTrigger>
            <TabsTrigger 
              value="students" 
              className="flex items-center gap-2 data-[state=active]:bg-white/90 data-[state=active]:shadow-md rounded-lg dark:data-[state=active]:bg-gray-800/90"
            >
              <Users className="w-4 h-4" /> Students
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 data-[state=active]:bg-white/90 data-[state=active]:shadow-md rounded-lg dark:data-[state=active]:bg-gray-800/90"
            >
              <BarChart3 className="w-4 h-4" /> Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes" className="space-y-4">
            <motion.div className="flex justify-between items-center mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-xl font-semibold">Your Quizzes</h2>
            </motion.div>
            <motion.div className="grid gap-4 md:grid-cols-2" variants={staggerContainer} initial="initial" animate="animate">
              {user.createdQuizzes.map((quiz: Quiz) => (
                <motion.div key={quiz.id} variants={fadeInUp} whileHover={{ scale: 1.03 }}>
                  <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 dark:border-gray-800/30 shadow-lg">
                    <div className="h-2 w-full bg-blue-500"></div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-primary dark:text-white">{quiz.title}</CardTitle>
                          <CardDescription className="text-muted-foreground dark:text-gray-400">{quiz.questions.length} questions</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30">
                            {quiz.assignedTo.length} students
                          </Badge>
                          <Button
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => {
                              setDeleteQuizId(quiz.id);
                              setShowDeleteConfirmation(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground dark:text-gray-400">Average Score</span>
                          <span className="font-medium dark:text-white">
                            {quiz.results.length > 0
                              ? Math.round(quiz.results.reduce((acc: number, r: QuizResult) => acc + r.score, 0) / quiz.results.length)
                              : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={quiz.results.length > 0
                            ? Math.round(quiz.results.reduce((acc: number, r: QuizResult) => acc + r.score, 0) / quiz.results.length)
                            : 0} 
                          className="h-2 dark:bg-gray-800" 
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewResults(quiz)}
                        className="flex items-center gap-1"
                      >
                        <BarChart3 className="h-4 w-4" />
                        View Results
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Users className="h-4 w-4" />
                        Assign
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
            {user.createdQuizzes.length === 0 && (
              <Card className="col-span-2 border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 shadow-lg overflow-hidden">
                <div className="h-2 w-full bg-blue-500"></div>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="rounded-full bg-primary/10 w-20 h-20 flex items-center justify-center mx-auto mb-6"
                  >
                    <BookOpen className="h-10 w-10 text-primary" />
                  </motion.div>
                  <p className="text-muted-foreground mb-6 text-center">No quizzes created yet. Start by creating your first quiz.</p>
                  <Button 
                    className="rounded-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
                    onClick={() => setShowCreateQuizModal(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Quiz
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="students">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 dark:border-gray-800/30 shadow-lg">
                <div className="h-2 w-full bg-purple-500"></div>
                <CardHeader>
                  <CardTitle className="dark:text-white">Student Performance</CardTitle>
                  <CardDescription className="dark:text-gray-400">Track student progress and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.createdQuizzes.flatMap((q: Quiz) => q.assignedTo).map((student: Student) => (
                      <motion.div key={student.id} variants={fadeInUp} whileHover={{ scale: 1.01 }}>
                        <Card className="mb-2 overflow-hidden border-0 bg-gradient-to-br from-white/60 to-purple-50/50 dark:from-gray-800/60 dark:to-purple-900/20 backdrop-blur-md">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-purple-700 dark:text-purple-300">{student.name}</p>
                                <p className="text-sm text-muted-foreground dark:text-gray-400">{student.email}</p>
                              </div>
                              <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/30">
                                {user.createdQuizzes.filter((q: Quiz) => q.results.some((r: QuizResult) => r.userId === student.id)).length} quizzes completed
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 dark:border-gray-800/30 shadow-lg">
                <div className="h-2 w-full bg-green-500"></div>
                <CardHeader>
                  <CardTitle className="dark:text-white">Class Analytics</CardTitle>
                  <CardDescription className="dark:text-gray-400">Overall class performance and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium dark:text-gray-300">Class Average</span>
                        <span className="text-sm text-muted-foreground dark:text-gray-400">
                          {user.createdQuizzes.length > 0
                            ? Math.round(user.createdQuizzes.reduce((acc: number, q: Quiz) => acc + (q.results.reduce((sum: number, r: QuizResult) => sum + r.score, 0) / (q.results.length || 1)), 0) / user.createdQuizzes.length)
                            : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={user.createdQuizzes.length > 0
                          ? Math.round(user.createdQuizzes.reduce((acc: number, q: Quiz) => acc + (q.results.reduce((sum: number, r: QuizResult) => sum + r.score, 0) / (q.results.length || 1)), 0) / user.createdQuizzes.length)
                          : 0} 
                        className="h-2 dark:bg-gray-800" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium dark:text-gray-300">Quiz Completion Rate</span>
                        <span className="text-sm text-muted-foreground dark:text-gray-400">
                          {user.createdQuizzes.length > 0
                            ? Math.round((user.createdQuizzes.reduce((acc: number, q: Quiz) => acc + (q.results.length / q.assignedTo.length), 0) / user.createdQuizzes.length) * 100)
                            : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={user.createdQuizzes.length > 0
                          ? Math.round((user.createdQuizzes.reduce((acc: number, q: Quiz) => acc + (q.results.length / q.assignedTo.length), 0) / user.createdQuizzes.length) * 100)
                          : 0} 
                        className="h-2 dark:bg-gray-800" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Floating Create Quiz Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <Button 
          className="rounded-full p-0 w-16 h-16 bg-gradient-to-br from-primary to-secondary shadow-xl hover:scale-110 transition-transform flex items-center justify-center text-white text-3xl"
          onClick={() => setShowCreateQuizModal(true)}
        >
          <Plus className="w-8 h-8" />
        </Button>
      </motion.div>
      
      {/* Create Quiz Dialog with improved styling */}
      <Dialog open={showCreateQuizModal} onOpenChange={setShowCreateQuizModal}>
        <DialogContent className="sm:max-w-[600px] bg-white/90 backdrop-blur-md dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-gray-500 bg-clip-text text-transparent">Create New Quiz</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Fill out the form below to create a new quiz for your students.
            </DialogDescription>
          </DialogHeader>
          <QuizCreationForm onSuccess={() => setShowCreateQuizModal(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog with improved styling */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="sm:max-w-[425px] bg-white/90 backdrop-blur-md dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-500 dark:text-red-400">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this quiz? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirmation(false)}
              className="rounded-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteQuiz}
              disabled={deletingQuiz}
              className="rounded-full bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700"
            >
              {deletingQuiz ? 'Deleting...' : 'Delete Quiz'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add the QuizResultsModal */}
      <QuizResultsModal 
        quiz={selectedQuiz}
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
      />
    </div>
  );
} 
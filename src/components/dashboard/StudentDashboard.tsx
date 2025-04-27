'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  BarChart2, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon,
  Atom, 
  BeakerIcon as Flask, 
  Calculator, 
  Leaf,
  Medal,
  Star,
  Sun,
  Moon,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserButton, useUser, SignOutButton } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/ThemeProvider';
import QuizBackgroundAnimation from '@/components/QuizBackgroundAnimation';

// Dynamically import charts with no SSR to avoid hydration issues
const TopicPerformanceChart = dynamic(() => import('../charts/TopicPerformanceChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
});

const ProgressChart = dynamic(() => import('../charts/ProgressChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
});

const CompletionChart = dynamic(() => import('../charts/CompletionChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
});

// Dynamically import ThemeToggle to prevent hydration mismatch
const ThemeToggle = dynamic(() => Promise.resolve(({ theme, toggleTheme }: { theme: string | undefined, toggleTheme: () => void }) => (
  <button
    onClick={toggleTheme}
    className="ml-2 p-2 rounded-full hover:bg-muted transition-colors"
    aria-label="Toggle dark mode"
  >
    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
  </button>
)), { ssr: false });

const subjects = [
  { name: 'Physics', icon: Atom, color: 'bg-blue-500' },
  { name: 'Chemistry', icon: Flask, color: 'bg-green-500' },
  { name: 'Math', icon: Calculator, color: 'bg-purple-500' },
  { name: 'Biology', icon: Leaf, color: 'bg-amber-500' },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Define interface for quiz data
interface Quiz {
  id: string;
  title: string;
  subject: string;
  status: 'Assigned' | 'In Progress' | 'Completed';
  assignedDate: string;
  timeLimit: number;
  score?: number;
}

// Mock leaderboard data
const mockLeaderboard = [
  { id: '1', rank: 1, name: 'Emma Thompson', score: 98, timeTaken: '8m 45s' },
  { id: '2', rank: 2, name: 'Michael Chen', score: 95, timeTaken: '9m 12s' },
  { id: '3', rank: 3, name: 'Sophia Rodriguez', score: 92, timeTaken: '10m 30s' },
  { id: '4', rank: 4, name: 'David Johnson', score: 88, timeTaken: '12m 15s' },
  { id: '5', rank: 5, name: 'Alex Williams', score: 85, timeTaken: '11m 55s' },
];

export function StudentDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('assigned');
  const [assignedQuizzes, setAssignedQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After component mounts, update state to indicate browser environment
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchAssignedQuizzes = async () => {
      try {
        console.log('Fetching assigned quizzes for student dashboard...');
        const res = await fetch('/api/student/assigned-quizzes');
        const data = await res.json();
        console.log('Response from assigned-quizzes API:', data);
        setAssignedQuizzes(data.quizzes || []);
      } catch (e) {
        console.error('Error fetching assigned quizzes:', e);
        setAssignedQuizzes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedQuizzes();
  }, []);

  const handleStartQuiz = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  const handlePractice = (subject: string) => {
    toast.success(`Starting ${subject} practice quiz...`);
    // Implement practice quiz logic
  };

  const handleViewResults = (quizId: string) => {
    router.push(`/quiz/${quizId}/results`);
  };

  return (
    <div className="container mx-auto p-6 space-y-8 relative min-h-screen">
      <QuizBackgroundAnimation />
      
      {/* Header with glass morphism */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl p-6 dark:bg-black/10 dark:border-white/10"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-gray-500 bg-clip-text text-transparent dark:from-primary dark:to-purple-400">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-muted-foreground mt-2 dark:text-muted-foreground">Track your progress and continue learning</p>
          </motion.div>
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
              <BookOpen className="w-3.5 h-3.5 mr-1.5 opacity-80" />
              Student Dashboard
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

      {/* Dashboard Tabs with enhanced styling */}
      <Tabs defaultValue="assigned" className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <TabsList className="grid w-full grid-cols-4 rounded-xl p-1 bg-white/20 backdrop-blur-md dark:bg-black/20 shadow-md">
            <TabsTrigger value="assigned" className="flex items-center gap-2 data-[state=active]:bg-white/90 data-[state=active]:shadow-md rounded-lg dark:data-[state=active]:bg-gray-800/90">
              <BookOpen className="w-4 h-4" />
              Assigned Quizzes
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2 data-[state=active]:bg-white/90 data-[state=active]:shadow-md rounded-lg dark:data-[state=active]:bg-gray-800/90">
              <Atom className="w-4 h-4" />
              Practice
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2 data-[state=active]:bg-white/90 data-[state=active]:shadow-md rounded-lg dark:data-[state=active]:bg-gray-800/90">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-white/90 data-[state=active]:shadow-md rounded-lg dark:data-[state=active]:bg-gray-800/90">
              <BarChart2 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </motion.div>

        {/* Assigned Quizzes Tab */}
        <TabsContent value="assigned" className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {assignedQuizzes.length > 0 ? (
                assignedQuizzes.map((quiz) => (
                  <motion.div
                    key={quiz.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/80 to-white/50 backdrop-blur-md dark:from-gray-900/80 dark:to-gray-900/50 dark:border-gray-800/30 shadow-lg">
                      <div className={`h-2 w-full ${quiz.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <CardHeader className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2">
                            {quiz.status === 'Completed' && (
                              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                            )}
                            <div>
                              <CardTitle className="dark:text-white">{quiz.title}</CardTitle>
                              <CardDescription className="dark:text-muted-foreground">{quiz.subject}</CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant={
                              quiz.status === 'Completed'
                                ? 'default'
                                : quiz.status === 'In Progress'
                                ? 'secondary'
                                : 'outline'
                            }
                            className={`
                              px-3 py-1 rounded-full font-medium text-xs
                              ${quiz.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-800/30' : ''}
                            `}
                          >
                            {quiz.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 opacity-70" />
                              <span>{quiz.timeLimit} minutes</span>
                            </div>
                            <span>Assigned: {formatDate(quiz.assignedDate)}</span>
                          </div>
                          {quiz.status === 'Completed' && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Score</span>
                                <span className="font-medium">{quiz.score}%</span>
                              </div>
                              <Progress value={quiz.score} className="h-2" />
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            {quiz.status === 'Completed' ? (
                              <div className="flex gap-2 w-full">
                                <Button
                                  variant="outline"
                                  className="flex-1 dark:bg-primary/10 dark:text-white dark:hover:bg-primary/20 rounded-full"
                                  onClick={() => handleStartQuiz(quiz.id)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Review Quiz
                                </Button>
                                <Button
                                  variant="default"
                                  className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 dark:text-white rounded-full"
                                  onClick={() => handleViewResults(quiz.id)}
                                >
                                  See Results
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="default"
                                className="w-full dark:bg-primary/80 dark:text-white dark:hover:bg-primary rounded-full"
                                onClick={() => handleStartQuiz(quiz.id)}
                              >
                                Start Quiz
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="col-span-3 rounded-xl bg-white/50 backdrop-blur-md p-10 text-center dark:bg-black/30 shadow-lg border border-white/20 dark:border-white/5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="rounded-full bg-primary/10 w-20 h-20 flex items-center justify-center mx-auto mb-6"
                  >
                    <BookOpen className="h-10 w-10 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-medium">No assigned quizzes yet</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">Your teacher will assign quizzes to you soon. In the meantime, you can explore practice quizzes.</p>
                  <Button 
                    className="mt-6 rounded-full"
                    variant="outline"
                    onClick={() => {
                      const tabTrigger = document.querySelector('[data-state="inactive"][value="practice"]');
                      if (tabTrigger && 'click' in tabTrigger) {
                        (tabTrigger as HTMLElement).click();
                      }
                    }}
                  >
                    Try Practice Quizzes
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </TabsContent>

        {/* Practice Tab - Enhanced version */}
        <TabsContent value="practice" className="space-y-6">
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {subjects.map((subject, index) => {
              const Icon = subject.icon;
              return (
                <motion.div
                  key={subject.name}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 dark:border-gray-800/30 shadow-lg">
                    <div className={`h-2 w-full ${subject.color}`}></div>
                    <CardContent className="p-6 pt-8">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <motion.div 
                          className={`p-4 rounded-full ${subject.color} bg-opacity-20 dark:bg-opacity-30`}
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Icon className="w-10 h-10 dark:text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-semibold dark:text-white">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground dark:text-muted-foreground">Practice questions to test your skills</p>
                        </div>
                        <Button
                          variant="default"
                          className="w-full rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                          onClick={() => handlePractice(subject.name)}
                        >
                          Practice Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </TabsContent>

        {/* Leaderboard Tab - Enhanced with more visuals */}
        <TabsContent value="leaderboard" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 dark:border-gray-800/30 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top Performers
                </CardTitle>
                <CardDescription>See how you rank among your peers</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                    <TableRow>
                      <TableHead className="text-center w-24">Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead>Time Taken</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockLeaderboard.map((entry, index) => (
                      <TableRow 
                        key={entry.id}
                        className={index === 0 ? "bg-yellow-50/50 dark:bg-yellow-900/10" : ""}
                      >
                        <TableCell className="text-center font-medium">
                          <div className="flex justify-center">
                            {entry.rank <= 3 ? (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                entry.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                entry.rank === 2 ? 'bg-gray-100 dark:bg-gray-800' :
                                'bg-amber-100 dark:bg-amber-900/30'
                              }`}>
                                <Medal className={`w-5 h-5 ${
                                  entry.rank === 1 ? 'text-yellow-500' :
                                  entry.rank === 2 ? 'text-gray-400' :
                                  'text-amber-600'
                                }`} />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <span className="text-muted-foreground text-sm">{entry.rank}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {entry.name.charAt(0)}
                            </div>
                            {entry.name}
                            {entry.rank === 1 && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 ml-2 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50">
                                Top Student
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-12 h-12 relative">
                              <svg viewBox="0 0 36 36" className="w-12 h-12 rotate-[-90deg]">
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="2"></circle>
                                <circle 
                                  cx="18" 
                                  cy="18" 
                                  r="16" 
                                  fill="none" 
                                  stroke={entry.rank === 1 ? "#eab308" : entry.rank === 2 ? "#9ca3af" : entry.rank === 3 ? "#d97706" : "#6366f1"} 
                                  strokeWidth="2"
                                  strokeDasharray={`${entry.score} 100`}
                                  strokeLinecap="round"
                                ></circle>
                              </svg>
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-bold">
                                {entry.score}%
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {entry.timeTaken}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Analytics Tab - Keep the existing content but with better styling */}
        <TabsContent value="analytics" className="space-y-6">
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <Card className="border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 dark:border-gray-800/30 shadow-lg overflow-hidden">
                <div className="h-2 w-full bg-blue-500"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-500" />
                    Topic Performance
                  </CardTitle>
                  <CardDescription>Your performance across different topics</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopicPerformanceChart />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <Card className="border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 dark:border-gray-800/30 shadow-lg overflow-hidden">
                <div className="h-2 w-full bg-green-500"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="w-5 h-5 text-green-500" />
                    Progress Over Time
                  </CardTitle>
                  <CardDescription>Track your improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProgressChart />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <Card className="border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 dark:border-gray-800/30 shadow-lg overflow-hidden">
                <div className="h-2 w-full bg-purple-500"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-purple-500" />
                    Quiz Completion
                  </CardTitle>
                  <CardDescription>Overview of your quiz attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <CompletionChart />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
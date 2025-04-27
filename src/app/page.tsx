'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedIn, UserButton, SignOutButton } from '@clerk/nextjs';
import { useTheme } from '@/components/ThemeProvider';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Trophy, BarChart2, CheckCircle2 } from 'lucide-react';

// Import icons with dynamic imports to prevent hydration errors
const ArrowRight = dynamic(() => import('lucide-react').then(mod => mod.ArrowRight), { ssr: false });
const GraduationCap = dynamic(() => import('lucide-react').then(mod => mod.GraduationCap), { ssr: false });
const Users = dynamic(() => import('lucide-react').then(mod => mod.Users), { ssr: false });
const Sun = dynamic(() => import('lucide-react').then(mod => mod.Sun), { ssr: false });
const Moon = dynamic(() => import('lucide-react').then(mod => mod.Moon), { ssr: false });

const FloatingElements = dynamic(() => import('@/components/home/FloatingElements').then(mod => mod.FloatingElements), { ssr: false });

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface Quiz {
  id: string;
  title: string;
  subject: string;
  status: 'Assigned' | 'In Progress' | 'Completed';
  assignedDate: string;
  timeLimit: number;
  score?: number;
}

export default function Home() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { theme, toggleTheme, mounted } = useTheme();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  
  // Effect to track scroll position
  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      setScrolled(latest > 10);
    });
    return () => unsubscribe();
  }, [scrollY]);
  
  // Avoid hydration issues by only rendering theme-dependent elements after mounting
  const showThemeToggle = mounted && theme !== undefined;
  
  useEffect(() => {
    // Check if user is authenticated
    if (isLoaded) {
      if (userId) {
        // User is logged in, fetch their role
        setIsAuthenticated(true);
        fetchUserRole();
      } else {
        // User is not logged in, but we should still show the landing page
        setIsAuthenticated(false);
        setLoading(false);
      }
    }
  }, [isLoaded, userId, router]);

  const fetchUserRole = async () => {
    try {
      const res = await fetch('/api/user/role');
      const data = await res.json();
      
      if (data.role === 'STUDENT') {
        // Redirect student to dashboard
        router.push('/dashboard/student');
      } else if (data.role === 'TEACHER') {
        // Redirect teacher to their dashboard
        router.push('/dashboard/teacher');
      } else if (data.role === 'ADMIN') {
        // Redirect admin to their dashboard
        router.push('/dashboard/admin');
      } else {
        // Handle other roles or missing role
        router.push('/fix-account');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/assigned-quizzes');
      const data = await res.json();
      setQuizzes(data.quizzes || []);
    } catch (e) {
      console.error('Error fetching quizzes:', e);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  const handleViewResults = (quizId: string) => {
    router.push(`/quiz/${quizId}/results`);
  };

  const handleStudentDashboard = () => {
    router.push('/dashboard/student');
  };

  // Show loading state while checking authentication
  if (!isLoaded || (isAuthenticated && loading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, redirect them to the appropriate dashboard
  // This is a temporary view until the redirection happens
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-center text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    );
  }

  // Only show the landing page for non-authenticated users
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      {mounted && <FloatingElements />}
      
      {/* Fixed Header with scroll-based shadow */}
      <motion.header 
        className={`fixed top-0 left-0 right-0 w-full bg-background/95 backdrop-blur-md border-b border-white/10 dark:border-gray-800/50 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : 'shadow-none'}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link href="/" className="flex items-center">
              <Image
                src="/upscaled_4k.png"
                alt="QuizUp Logo"
                width={50}
                height={50}
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'contain'
                }}
                priority
              />
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
              QUIZUP
            </h1>
          </motion.div>
          <nav className="flex items-center space-x-6">
            {['About', 'Features', 'Contact'].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="relative group"
              >
                <Link 
                  href={`/${item.toLowerCase()}`} 
                  className="text-foreground/80 hover:text-foreground transition-colors duration-200"
                >
                  {item}
                </Link>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/sign-in?redirect_url=/dashboard/admin">
                <Button variant="ghost" size="sm" className="text-xs">
                  Admin
                </Button>
              </Link>
            </motion.div>
            {showThemeToggle && (
              <motion.button
                onClick={toggleTheme}
                className="ml-2 p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Toggle dark mode"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>
            )}
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </motion.header>

      {/* Add padding to push content below fixed header */}
      <div className="pt-16">
        {/* Hero Section */}
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-16">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                Welcome to QUIZUP
              </motion.h1>
              <motion.p 
                className="text-xl text-foreground/80 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                The ultimate platform for interactive learning and assessment. Join us to create, take, and manage quizzes with ease.
              </motion.p>
            </motion.div>

            {/* Features Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {[
                { icon: BookOpen, title: "Interactive Quizzes", color: "text-blue-500" },
                { icon: GraduationCap, title: "Track Progress", color: "text-purple-500" },
                { icon: Users, title: "Collaborative Learning", color: "text-pink-500" },
                { icon: BarChart2, title: "Performance Analytics", color: "text-indigo-500" }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-card/50 backdrop-blur-sm p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  variants={fadeInUp}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                >
                  <feature.icon className={`w-8 h-8 ${feature.color} mb-4`} />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">Engage with dynamic and interactive content</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Login Cards */}
            <motion.div 
              className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {[
                {
                  title: "Student Portal",
                  description: "Access your assigned quizzes and track your progress",
                  gradient: "from-blue-500 to-purple-500",
                  href: "/sign-in?redirect_url=/dashboard/student",
                  buttonText: "Student Login"
                },
                {
                  title: "Teacher Portal",
                  description: "Create and manage quizzes for your students",
                  gradient: "from-purple-500 to-pink-500",
                  href: "/sign-in?redirect_url=/dashboard/teacher",
                  buttonText: "Teacher Login"
                }
              ].map((portal, index) => (
                <motion.div
                  key={portal.title}
                  variants={fadeInUp}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                >
                  <Card className="backdrop-blur-sm bg-card/50 border-muted">
                    <CardHeader>
                      <CardTitle className={`text-2xl bg-gradient-to-r ${portal.gradient} bg-clip-text text-transparent`}>
                        {portal.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {portal.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          {index === 0 
                            ? "Take quizzes, view results, and monitor your learning journey."
                            : "Design quizzes, assign them to students, and track their performance."
                          }
                        </p>
                        <Button 
                          asChild 
                          className={`w-full bg-gradient-to-r ${portal.gradient} hover:opacity-90 transition-opacity`}
                        >
                          <Link href={portal.href}>
                            {portal.buttonText}
                            <motion.div
                              className="ml-2"
                              animate={{ x: [0, 5, 0] }}
                              transition={{ 
                                duration: 1.5, 
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </motion.div>
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <motion.footer 
          className="bg-background/50 backdrop-blur-sm border-t"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  QUIZUP
                </h3>
                <p className="text-muted-foreground">
                  Empowering education through interactive quizzes and assessments.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  {['About Us', 'Features', 'Contact'].map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <Link 
                        href={`/${item.toLowerCase().replace(' ', '-')}`}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {item}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                <ul className="space-y-2">
                  <motion.li 
                    className="text-muted-foreground"
                    whileHover={{ x: 5 }}
                  >
                    Email: shubham.sikarwar2005@gmail.com
                  </motion.li>
                  <motion.li 
                    className="text-muted-foreground"
                    whileHover={{ x: 5 }}
                  >
                    Phone: +91 9350007614
                  </motion.li>
                </ul>
              </motion.div>
            </div>
            <motion.div 
              className="border-t mt-8 pt-8 text-center text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p>&copy; {new Date().getFullYear()} QUIZUP. All rights reserved.</p>
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { FloatingElements } from '@/components/home/FloatingElements';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      <FloatingElements />
      
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 left-4 z-50"
      >
        <Link 
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </motion.div>

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent text-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            About QUIZUP
          </motion.h1>

          <motion.div
            className="space-y-8 text-foreground/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Our Mission</h2>
              <p className="leading-relaxed">
                QUIZUP is dedicated to revolutionizing the way students learn and teachers teach. 
                We believe in making education more interactive, engaging, and effective through 
                our innovative quiz platform.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">What We Offer</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Interactive and engaging quiz experiences for students</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Comprehensive analytics and progress tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Easy-to-use quiz creation tools for teachers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Real-time performance insights and feedback</span>
                </li>
              </ul>
            </div>

            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Our Vision</h2>
              <p className="leading-relaxed">
                We envision a future where learning is personalized, engaging, and accessible to all. 
                Through our platform, we aim to create a community of lifelong learners who are 
                empowered to achieve their educational goals.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 
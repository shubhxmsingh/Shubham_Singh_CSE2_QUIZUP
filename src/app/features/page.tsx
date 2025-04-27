'use client';

import { motion } from 'framer-motion';
import { FloatingElements } from '@/components/home/FloatingElements';
import Link from 'next/link';
import { ArrowLeft, BookOpen, GraduationCap, Users, BarChart3, Clock, Shield, Globe, Zap } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: "Interactive Learning",
    description: "Engage with dynamic quiz content that makes learning fun and effective.",
    color: "text-blue-500"
  },
  {
    icon: GraduationCap,
    title: "Progress Tracking",
    description: "Monitor your learning journey with detailed progress analytics.",
    color: "text-purple-500"
  },
  {
    icon: Users,
    title: "Collaborative Environment",
    description: "Learn together with peers and receive guidance from teachers.",
    color: "text-pink-500"
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Get insights into your strengths and areas for improvement.",
    color: "text-indigo-500"
  },
  {
    icon: Clock,
    title: "Flexible Timing",
    description: "Take quizzes at your own pace with flexible scheduling.",
    color: "text-green-500"
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Your data is protected with enterprise-grade security.",
    color: "text-amber-500"
  },
  {
    icon: Globe,
    title: "Accessible Anywhere",
    description: "Access your quizzes from any device, anywhere.",
    color: "text-cyan-500"
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Receive immediate results and detailed explanations.",
    color: "text-rose-500"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function FeaturesPage() {
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
          className="max-w-6xl mx-auto"
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent text-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Platform Features
          </motion.h1>

          <motion.p
            className="text-xl text-center text-muted-foreground mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Discover all the powerful features that make QUIZUP the perfect platform for interactive learning and assessment.
          </motion.p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border"
                >
                  <Icon className={`w-8 h-8 ${feature.color} mb-4`} />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export function BackToQuizButton() {
  return (
    <motion.div 
      className="absolute top-4 left-4 z-20"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Link 
        href="/dashboard/student"
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-gray-200/20 dark:border-gray-800/30 text-foreground hover:bg-white/20 dark:hover:bg-black/20 transition-colors group"
      >
        <motion.span
          animate={{ x: [0, -4, 0] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.span>
        <span className="text-sm font-medium">Back to Dashboard</span>
      </Link>
    </motion.div>
  );
} 
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AuthBackground } from './AuthBackground';
import { UserEmojisBackground } from './UserEmojisBackground';

interface AuthContainerProps {
  children: ReactNode;
}

export function AuthContainer({ children }: AuthContainerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AuthBackground />
      <UserEmojisBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: "easeOut"
        }}
        className="w-full max-w-md z-10"
      >
        <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-4 shadow-xl ring-1 ring-gray-900/5 dark:ring-white/10">
          {children}
        </div>
      </motion.div>
    </div>
  );
} 
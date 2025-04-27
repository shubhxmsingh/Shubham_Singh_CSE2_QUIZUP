'use client';

import { motion, AnimatePresence } from "framer-motion";

interface AuthWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const floatingEmojis = ["📚", "✨", "🎯", "🎓", "💡", "🚀"];

export function AuthWrapper({ children, title, subtitle }: AuthWrapperProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/30 via-background to-secondary/30">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_800px_at_50%_-100px,#4f46e510,transparent)]" />
      <div className="absolute top-0 left-0 w-full h-full">
        <AnimatePresence>
          {floatingEmojis.map((emoji, index) => (
            <motion.div
              key={index}
              className="absolute text-2xl"
              initial={{ 
                x: `${Math.random() * 100}vw`, 
                y: "100vh",
                opacity: 0.3,
                rotate: 0
              }}
              animate={{
                y: "-100vh",
                opacity: [0.3, 0.8, 0.3],
                rotate: [0, 360]
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear",
                delay: index * 2,
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Content container */}
      <motion.div 
        className="relative w-full max-w-md px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8 relative">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
              {title}
            </h1>
            <div className="mt-2 flex items-center justify-center gap-2">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground"
              >
                {subtitle}
              </motion.span>
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.6, 
                  type: "spring",
                  stiffness: 200,
                  damping: 10
                }}
              >
                ✨
              </motion.span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
} 
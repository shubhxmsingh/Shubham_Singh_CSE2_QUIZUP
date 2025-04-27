'use client';

import { motion } from "framer-motion";

const floatingEmojis = [
  { emoji: "📚", size: "text-3xl", color: "text-blue-500" },
  { emoji: "✨", size: "text-2xl", color: "text-yellow-500" },
  { emoji: "🎯", size: "text-3xl", color: "text-red-500" },
  { emoji: "🎓", size: "text-2xl", color: "text-purple-500" },
  { emoji: "💡", size: "text-3xl", color: "text-amber-500" },
  { emoji: "🚀", size: "text-2xl", color: "text-indigo-500" },
  { emoji: "📝", size: "text-2xl", color: "text-green-500" },
  { emoji: "🏆", size: "text-3xl", color: "text-yellow-600" },
];

// Helper function to get deterministic position
const getInitialPosition = (index: number, total: number) => {
  return (index / total) * 100;
};

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />

      {/* Floating Emojis */}
      {floatingEmojis.map((item, index) => (
        <motion.div
          key={index}
          className={`absolute ${item.size} ${item.color}`}
          initial={{ 
            x: `${getInitialPosition(index, floatingEmojis.length)}vw`,
            y: "100vh",
            scale: 0,
            opacity: 0 
          }}
          animate={{
            y: "-100vh",
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.8, 0.3],
            rotate: [0, 360]
          }}
          transition={{
            duration: 15 + (index * 2),
            repeat: Infinity,
            ease: "linear",
            delay: index * 2,
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Sparkles */}
      {[...Array(20)].map((_, index) => (
        <motion.div
          key={`sparkle-${index}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{
            x: `${getInitialPosition(index, 20)}vw`,
            y: `${getInitialPosition(index, 20)}vh`,
            scale: 0,
            opacity: 0
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
} 
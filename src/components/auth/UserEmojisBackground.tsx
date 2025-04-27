'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// User-related emojis and educational concepts
const emojis = [
  '👤', '👥', '👨‍💻', '👩‍💻', '🧠', '💭', '💡', '🏆', '📝', '📚', 
  '🎓', '🔍', '❓', '✅', '💯', '🎯', '🧩', '📊', '📈', '🔔',
  '🎉', '🎊', '✨', '⭐', '🌟', '📱', '💻', '⌨️', '🖥️', '🎮',
  '🎨', '🎬', '🔬', '🧪', '🧮', '🌐', '📡', '📰', '📗', '📘'
];

interface EmojiProps {
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  rotationDirection: 1 | -1;
}

const EmojiElement = ({ emoji, x, y, size, duration, delay, rotationDirection }: EmojiProps) => {
  return (
    <motion.div
      className="absolute text-foreground dark:text-foreground/90 pointer-events-none"
      initial={{ 
        x: `${x}vw`, 
        y: `${y + 50}vh`, 
        opacity: 0, 
        scale: 0.5,
        rotate: rotationDirection * -10
      }}
      animate={{ 
        x: `calc(${x}vw + ${Math.random() * 100 - 50}px)`, 
        y: `calc(${y - 30}vh - ${Math.random() * 200}px)`, 
        opacity: [0, 1, 0], 
        scale: [0.7, size * 1.7, 0.7],
        rotate: rotationDirection * 20
      }}
      transition={{ 
        duration, 
        delay, 
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: Math.random() * 5 + 8
      }}
      style={{ 
        fontSize: `${size * 3}rem`,
        textShadow: '0 0 15px rgba(100,100,255,0.4), 0 0 5px rgba(255,255,255,0.5)',
        filter: 'drop-shadow(0 0 10px rgba(100,100,255,0.3))'
      }}
    >
      {emoji}
    </motion.div>
  );
};

export function UserEmojisBackground() {
  const [elements, setElements] = useState<React.ReactNode[]>([]);
  
  useEffect(() => {
    const generateElements = () => {
      const numElements = 24; // More emojis for better coverage
      const newElements = [];
      
      // Create a grid to ensure better distribution
      const gridSize = 6; // 6x4 grid
      const cellWidth = 100 / gridSize;
      const cellHeight = 100 / 4;
      
      // Create a map to track which emojis have been used
      const usedEmojis = new Set();
      
      for (let i = 0; i < numElements; i++) {
        // Calculate grid position (more horizontal than vertical)
        const gridX = i % gridSize;
        const gridY = Math.floor(i / gridSize) % 4;
        
        // Add some randomness within each grid cell
        const x = gridX * cellWidth + Math.random() * (cellWidth * 0.7);
        const y = gridY * cellHeight + Math.random() * (cellHeight * 0.7);
        
        // Find an emoji that hasn't been used yet if possible
        let randomEmoji;
        do {
          randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        } while (usedEmojis.size < emojis.length * 0.7 && usedEmojis.has(randomEmoji));
        
        usedEmojis.add(randomEmoji);
        
        const size = Math.random() * 0.5 + 0.9; // Larger size between 0.9 and 1.4
        const duration = Math.random() * 15 + 25; // Duration between 25-40s
        const delay = Math.random() * 20; // More varied delays
        const rotationDirection = Math.random() > 0.5 ? 1 : -1;
        
        newElements.push(
          <EmojiElement 
            key={i}
            emoji={randomEmoji}
            x={x}
            y={y}
            size={size}
            duration={duration}
            delay={delay}
            rotationDirection={rotationDirection}
          />
        );
      }
      
      setElements(newElements);
    };
    
    generateElements();
    
    // Regenerate elements on window resize
    const handleResize = () => {
      generateElements();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      {elements}
    </div>
  );
} 
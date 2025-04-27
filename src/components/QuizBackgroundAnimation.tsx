import { motion } from 'framer-motion';
import { BookOpen, Trophy, HelpCircle } from 'lucide-react';

const icons = [
  { icon: BookOpen, color: 'text-blue-400 dark:text-blue-600', size: 48, x: '10%', y: '20%', delay: 0 },
  { icon: Trophy, color: 'text-yellow-400 dark:text-yellow-500', size: 56, x: '80%', y: '30%', delay: 0.2 },
  { icon: HelpCircle, color: 'text-purple-400 dark:text-purple-500', size: 40, x: '20%', y: '70%', delay: 0.4 },
  { icon: BookOpen, color: 'text-green-400 dark:text-green-500', size: 36, x: '60%', y: '80%', delay: 0.6 },
  { icon: Trophy, color: 'text-pink-400 dark:text-pink-500', size: 44, x: '40%', y: '10%', delay: 0.8 },
  { icon: HelpCircle, color: 'text-indigo-400 dark:text-indigo-500', size: 32, x: '75%', y: '60%', delay: 1.0 },
];

export default function QuizBackgroundAnimation() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {icons.map(({ icon: Icon, color, size, x, y, delay }, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, opacity: 0.3 }}
          animate={{ y: [0, -20, 0], opacity: 0.5 }}
          transition={{ duration: 8, repeat: Infinity, delay, ease: 'easeInOut' }}
          className="absolute"
          style={{ left: x, top: y }}
        >
          <Icon className={color} style={{ width: size, height: size, opacity: 0.7 }} />
        </motion.div>
      ))}
    </div>
  );
} 
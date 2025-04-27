'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { BookOpen, ClockIcon, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

const subjects = [
  'Physics',
  'Chemistry',
  'Biology',
  'Mathematics',
  'Computer Science',
  'History',
  'Geography',
  'Literature',
];

const levels = ['Easy', 'Medium', 'Hard'];
const durations = [10, 20, 30, 45, 60];

interface QuizCreationFormProps {
  onSuccess?: () => void;
}

const QuizCreationForm = ({ onSuccess }: QuizCreationFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    topic: '',
    numQuestions: '10',
    level: '',
    duration: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subject || !formData.level || !formData.duration || !formData.numQuestions) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Submitting quiz creation form with data:", formData);
      
      const response = await fetch("/api/teacher/create-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          subject: formData.subject,
          topic: formData.topic,
          level: formData.level,
          duration: Number(formData.duration),
          numQuestions: Number(formData.numQuestions),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create quiz");
      }
      
      const data = await response.json();
      console.log("Quiz created successfully:", data);
      
      toast.success("Quiz created successfully!");
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Force page refresh to show the new quiz
      router.refresh();
      
      // Wait a moment before redirecting to ensure the refresh has time to work
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg">
      {/* Quiz Title Field */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Label htmlFor="title" className="text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-primary dark:text-primary" />
          Quiz Title
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter quiz title"
          required
          className="bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/40 border-gray-300 dark:border-gray-700"
        />
      </motion.div>

      {/* Subject Field */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Label htmlFor="subject" className="text-gray-800 dark:text-gray-200">Subject</Label>
        <Select
          value={formData.subject}
          onValueChange={(value) => setFormData({ ...formData, subject: value })}
          required
        >
          <SelectTrigger 
            id="subject"
            className="bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/40"
          >
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject} className="focus:bg-primary/10 dark:focus:bg-primary/20">
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Topic Field */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Label htmlFor="topic" className="text-gray-800 dark:text-gray-200">Topic (Optional)</Label>
        <Input
          id="topic"
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          placeholder="Enter specific topic (e.g., Quantum Mechanics, World War II)"
          className="bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/40 border-gray-300 dark:border-gray-700"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-1">
          Providing a specific topic helps Gemini AI generate more focused and relevant questions.
        </p>
      </motion.div>

      {/* Level Field */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Label htmlFor="level" className="text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
          <BrainCircuit className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          Difficulty Level
        </Label>
        <Select
          value={formData.level}
          onValueChange={(value) => setFormData({ ...formData, level: value })}
          required
        >
          <SelectTrigger 
            id="level"
            className="bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/40"
          >
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            {levels.map((level) => (
              <SelectItem key={level} value={level} className="focus:bg-primary/10 dark:focus:bg-primary/20">
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Number of Questions Field */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Label htmlFor="numQuestions" className="text-gray-800 dark:text-gray-200">Number of Questions</Label>
        <Select
          value={formData.numQuestions}
          onValueChange={(value) => setFormData({ ...formData, numQuestions: value })}
          required
        >
          <SelectTrigger 
            id="numQuestions"
            className="bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/40"
          >
            <SelectValue placeholder="Select number of questions" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            {[5, 10, 15, 20].map((num) => (
              <SelectItem key={num} value={num.toString()} className="focus:bg-primary/10 dark:focus:bg-primary/20">
                {num} Questions
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Duration Field */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Label htmlFor="duration" className="text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
          <ClockIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
          Duration (minutes)
        </Label>
        <Select
          value={formData.duration}
          onValueChange={(value) => setFormData({ ...formData, duration: value })}
          required
        >
          <SelectTrigger 
            id="duration"
            className="bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/40"
          >
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            {durations.map((d) => (
              <SelectItem key={d} value={d.toString()} className="focus:bg-primary/10 dark:focus:bg-primary/20">
                {d} minutes
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Submit Button */}
      <motion.div 
        className="pt-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Button 
          type="submit"
          disabled={isLoading}
          className="w-full font-medium rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity shadow-md"
        >
          {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? 'Creating Quiz...' : 'Create Quiz'}
        </Button>
      </motion.div>
    </form>
  );
};

export default QuizCreationForm; 
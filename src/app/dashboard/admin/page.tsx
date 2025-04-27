'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { UserButton, SignOutButton } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/ThemeProvider';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import QuizBackgroundAnimation from '@/components/QuizBackgroundAnimation';
import { Moon, Sun, Search } from 'lucide-react';

// Animation variants
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  initial: { y: 40, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

// Import icons with dynamic imports to prevent hydration errors
const Users = dynamic(() => import('lucide-react').then(mod => mod.Users), { ssr: false });
const GraduationCap = dynamic(() => import('lucide-react').then(mod => mod.GraduationCap), { ssr: false });
const School = dynamic(() => import('lucide-react').then(mod => mod.School), { ssr: false });
const Shield = dynamic(() => import('lucide-react').then(mod => mod.Shield), { ssr: false });

// Dynamically import ThemeToggle to prevent hydration mismatch
const ThemeToggle = dynamic(() => Promise.resolve(({ theme, toggleTheme }: { theme: string | undefined, toggleTheme: () => void }) => (
  <Button variant="ghost" size="icon" onClick={toggleTheme} className="ml-2">
    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
  </Button>
)), { ssr: false });

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch users when component mounts
  useEffect(() => {
    if (mounted) {
      fetchUsers();
    }
  }, [mounted]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch('/api/admin/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user: any) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
      (user.firstName + ' ' + user.lastName)?.toLowerCase().includes(lowerCaseSearchTerm) ||
      user.role?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4 md:p-8 relative">
      <QuizBackgroundAnimation />
      
      {/* Header with glass morphism */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="container mx-auto rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl p-6 mb-8 dark:bg-black/10 dark:border-white/10"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Manage users and system configurations</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center space-x-4 bg-white/50 dark:bg-background/50 rounded-xl px-4 py-2 shadow-md backdrop-blur-sm"
          >
            <Badge
              variant="outline"
              className="text-sm px-3 py-1.5 bg-white/80 backdrop-blur-sm text-blue-700 border border-blue-200/20 dark:bg-gray-800/50 dark:text-blue-300 dark:border-blue-800/30 transition-all hover:bg-blue-50/5 dark:hover:bg-blue-900/20"
            >
              <Shield className="w-3.5 h-3.5 mr-1.5 opacity-80" />
              Admin Panel
            </Badge>
            {mounted && <ThemeToggle theme={theme} toggleTheme={toggleTheme} />}
            <UserButton />
            <SignOutButton>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
              >
                Logout
              </Button>
            </SignOutButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Cards with enhanced styling */}
      <motion.div 
        className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div 
          variants={fadeInUp} 
          whileHover={{ 
            scale: 1.04,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
          }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 dark:border-gray-800/30 shadow-lg">
            <div className="h-2 w-full bg-blue-500"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-blue-700 dark:text-blue-400">Total Users</CardTitle>
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div 
          variants={fadeInUp} 
          whileHover={{ 
            scale: 1.04,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
          }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 dark:border-gray-800/30 shadow-lg">
            <div className="h-2 w-full bg-green-500"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-green-700 dark:text-green-400">Students</CardTitle>
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <GraduationCap className="h-5 w-5 text-green-500 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.totalStudents}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div 
          variants={fadeInUp} 
          whileHover={{ 
            scale: 1.04,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
          }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 dark:border-gray-800/30 shadow-lg">
            <div className="h-2 w-full bg-purple-500"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-400">Teachers</CardTitle>
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <School className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">{stats.totalTeachers}</div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* User Management with improved UI */}
      <motion.div 
        className="container mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md dark:from-gray-900/70 dark:to-gray-900/40 dark:border-gray-800/30 shadow-lg">
          <div className="h-2 w-full bg-indigo-500"></div>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">User Management</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Manage user roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500/40 border-gray-300 dark:border-gray-700 rounded-lg"
                />
              </div>
              
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead>
                      <tr className="bg-gray-50/90 dark:bg-gray-800/70">
                        <th className="py-3.5 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">User</th>
                        <th className="py-3.5 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                        <th className="py-3.5 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Current Role</th>
                        <th className="py-3.5 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {isLoading ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            </div>
                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading users...</p>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                            {searchTerm ? 'No users match your search' : 'No users found'}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user: any) => (
                          <motion.tr 
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="py-4 px-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                            <td className="py-4 px-4 text-sm">
                              <Badge className={
                                user.role === 'ADMIN' 
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                                  : user.role === 'TEACHER' 
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                              }>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-sm">
                              <Select
                                value={user.role}
                                onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}
                              >
                                <SelectTrigger className="w-[180px] bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500/40 rounded-lg">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                  <SelectItem value="STUDENT" className="focus:bg-green-50 dark:focus:bg-green-900/20">Student</SelectItem>
                                  <SelectItem value="TEACHER" className="focus:bg-purple-50 dark:focus:bg-purple-900/20">Teacher</SelectItem>
                                  <SelectItem value="ADMIN" className="focus:bg-blue-50 dark:focus:bg-blue-900/20">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 
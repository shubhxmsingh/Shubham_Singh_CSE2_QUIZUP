import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function StudentDashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return <StudentDashboard />;
} 
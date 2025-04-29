import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function StudentDashboardPage() {
  try {
    const authData = await auth();
    const userId = authData.userId;
    
    if (!userId) {
      redirect('/sign-in');
    }

    return <StudentDashboard />;
  } catch (error) {
    console.error("Authentication error:", error);
    redirect('/sign-in');
  }
} 
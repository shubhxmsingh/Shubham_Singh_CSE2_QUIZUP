import { SidebarNav } from '@/components/SidebarNav';
import { UserButton } from '@clerk/nextjs';

const sidebarNavItems = [
  {
    title: 'Dashboard',
    href: '/teacher',
  },
  {
    title: 'Create Quiz',
    href: '/create-quiz',
  },
  {
    title: 'My Quizzes',
    href: '/my-quizzes',
  },
  {
    title: 'Analytics',
    href: '/analytics',
  },
  {
    title: 'Settings',
    href: '/settings',
  },
];

interface TeacherLayoutProps {
  children: React.ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <span className="font-bold md:hidden">Teacher Portal</span>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40 w-64">
          <div className="flex h-full flex-col">
            <div className="flex h-[60px] items-center border-b px-6">
              <span className="font-bold">Teacher Portal</span>
            </div>
            <div className="flex-1 px-4 py-2">
              <SidebarNav items={sidebarNavItems} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 
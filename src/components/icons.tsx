"use client";

import * as React from "react";
import { 
  Loader2,
  LucideProps,
  User,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Trophy,
  HelpCircle,
  Home,
  Check,
  Calendar,
  Edit,
  Users,
  Trash,
  Plus,
  ExternalLink,
  Download,
  Clock,
  BarChart2,
  CheckCircle
} from "lucide-react";

export type IconProps = LucideProps;

export const Icons = {
  spinner: Loader2,
  user: User,
  logOut: LogOut,
  settings: Settings,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  bookOpen: BookOpen,
  trophy: Trophy,
  helpCircle: HelpCircle,
  home: Home,
  check: Check,
  calendar: Calendar,
  edit: Edit,
  users: Users,
  trash: Trash,
  plus: Plus,
  externalLink: ExternalLink,
  download: Download,
  clock: Clock,
  chart: BarChart2,
  checkCircle: CheckCircle,
  logo: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 L12 2 Z" />
      <path d="M12 7 L12 17" />
      <path d="M8 9.5 L16 9.5" />
      <path d="M8 14.5 L16 14.5" />
    </svg>
  ),
}; 
'use client';

import { UserButton as ClerkUserButton } from "@clerk/nextjs";

export function UserButton() {
  return (
    <div className="flex items-center gap-4">
      <ClerkUserButton 
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "w-10 h-10",
            userButtonPopoverCard: "bg-white shadow-lg rounded-lg",
            userButtonPopoverActionButton: "hover:bg-gray-100",
            userButtonPopoverFooter: "border-t border-gray-200"
          }
        }}
      />
    </div>
  );
} 
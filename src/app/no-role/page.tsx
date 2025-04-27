'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClerk } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NoRolePage() {
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
      <Card className="max-w-2xl p-8 space-y-6">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
            Role Not Assigned
          </h1>
          <p className="text-muted-foreground">
            Your account does not have a role assigned. Please contact the administrator to get your role (Student/Teacher) assigned.
          </p>
          <div className="p-4 bg-muted/30 rounded-lg">
            <h2 className="font-semibold mb-2">Contact Administrator</h2>
            <p className="text-sm text-muted-foreground">
              Email: shubham.sikarwar2005@gmail.com<br />
              Phone: +91 9350007614
            </p>
          </div>
        </div>
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => signOut()}
            className="w-[150px]"
          >
            Sign Out
          </Button>
          <Link href="/">
            <Button variant="default" className="w-[150px]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
} 
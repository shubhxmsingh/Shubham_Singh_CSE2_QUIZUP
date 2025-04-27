'use client';

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "@/components/ThemeProvider";
import { Logo } from "@/components/Logo";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { BackToHomeButton } from "@/components/auth/BackToHomeButton";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { theme, mounted } = useTheme();
  const router = useRouter();

  // Prevent hydration errors by rendering nothing until mounted
  if (!mounted) {
    return null;
  }

  const handleRedirectToHome = () => {
    router.push('/');
  };

  return (
    <>
      <BackToHomeButton />
      <AuthContainer>
        <SignIn 
          appearance={{
            baseTheme: theme === 'dark' ? dark : undefined,
            layout: {
              logoPlacement: "inside",
              socialButtonsPlacement: "bottom",
            },
            elements: {
              formButtonPrimary: "bg-gradient-to-r from-primary via-purple-500 to-secondary hover:opacity-90",
              card: "bg-transparent shadow-none",
              rootBox: "shadow-none",
              headerTitle: "text-foreground text-xl",
              headerSubtitle: "text-foreground/80",
              formFieldLabel: "text-foreground/80",
              formFieldInput: "bg-background/50 border-gray-300 dark:border-gray-700 focus:border-primary",
              footer: "text-foreground/70",
              footerActionLink: "text-primary hover:text-primary/80",
              dividerLine: "bg-foreground/20",
              dividerText: "text-foreground/50",
              socialButtonsBlockButton: "border-gray-300 dark:border-gray-700 hover:bg-background/60",
              socialButtonsBlockButtonText: "text-foreground",
            },
            variables: {
              colorPrimary: "#4f46e5",
              colorTextOnPrimaryBackground: "white"
            },
            logo: <Logo />
          }}
          redirectUrl="/dashboard"
        />
      </AuthContainer>
    </>
  );
} 
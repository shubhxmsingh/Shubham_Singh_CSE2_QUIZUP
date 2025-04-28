import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { dark } from '@clerk/themes';
import { Logo } from '@/components/Logo';
import { NavigationDebug } from '@/components/NavigationDebug';

// Optimize font loading
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Use 'swap' for better performance
  preload: true,
  fallback: ['system-ui', 'sans-serif']
});

export const metadata: Metadata = {
  title: 'QUIZUP',
  description: 'AI-Powered Quiz Platform',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any'
      },
      {
        url: '/upscaled_4k.png',
        sizes: '32x32 192x192 512x512',
        type: 'image/png'
      }
    ],
    apple: {
      url: '/upscaled_4k.png',
      sizes: '180x180',
      type: 'image/png'
    },
    shortcut: '/upscaled_4k.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'QuizAI',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport = {
  themeColor: '#4f46e5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          logoPlacement: "inside",
          socialButtonsPlacement: "bottom",
        },
        elements: {
          formButtonPrimary: "bg-gradient-to-r from-primary via-purple-500 to-secondary hover:opacity-90",
          card: "shadow-xl",
          logoImage: "w-16 h-16"
        },
        variables: {
          colorPrimary: "#4f46e5"
        }
      }}
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      homeUrl="/"
    >
      <ThemeProvider>
        <html lang="en" className="h-full">
          <head>
            {/* Preconnect to domains for faster loading */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            
            {/* Favicon */}
            <link rel="icon" href="/favicon.ico" sizes="any" />
            <link rel="icon" href="/upscaled_4k.png" type="image/png" />
            <link rel="apple-touch-icon" href="/upscaled_4k.png" />
            
            {/* Mobile settings */}
            <meta name="mobile-web-app-capable" content="yes" />
            
            {/* Preload critical assets */}
            <link rel="preload" href="/upscaled_4k.png" as="image" type="image/png" />
          </head>
          <body className={`${inter.className} min-h-screen flex flex-col`}>
            <NavigationDebug />
            <main className="flex-grow">
              {children}
            </main>
            <Toaster position="top-right" />
          </body>
        </html>
      </ThemeProvider>
    </ClerkProvider>
  );
}

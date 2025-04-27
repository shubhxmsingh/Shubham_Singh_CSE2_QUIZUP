declare module '@clerk/nextjs/server' {
  export function auth(): Promise<{
    userId: string | null;
    sessionId: string | null;
    getToken: () => Promise<string | null>;
  }>;
} 
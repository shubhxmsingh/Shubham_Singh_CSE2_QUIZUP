'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function NavigationDebug() {
  const router = useRouter();
  const pathname = usePathname();

  // Log navigation events
  useEffect(() => {
    console.log('Current path:', pathname);
    
    // Add listener for navigation events
    const handleRouteChange = (url: string) => {
      console.log('App is navigating to:', url);
    };

    // Replace push method with a wrapped version
    const originalPush = router.push;
    (router as any).push = function(url: string) {
      console.log('Router.push called with:', url);
      return originalPush.apply(router, [url]);
    };

    return () => {
      // Restore original push
      (router as any).push = originalPush;
    };
  }, [router, pathname]);

  return null; // This component doesn't render anything
} 
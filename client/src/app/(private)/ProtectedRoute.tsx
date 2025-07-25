'use client';

import { useAuth, useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, isLoaded, sessionId, getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuthState = async () => {
      if (!isLoaded) return;

      try {
        // Get the token to verify the session is actually valid
        const token = await getToken();

        if (token) {
          // If we have a valid token but are on the login page, redirect to home
          if (window.location.pathname === '/login') {
            router.replace('/');
          }
          return; // Valid session, no need to redirect
        }

        // Only redirect to login if we're sure there's no session
        if (!sessionId && !token) {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth state check failed:', error);
      }
    };

    checkAuthState();
  }, [isLoaded, sessionId, router, getToken]);

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="grid place-items-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  const { user } = useUser();
  const isSusbcribed = user?.publicMetadata?.isSubscribed === true;
  // Return children if we have a sessionId, otherwise show loading
  return sessionId && isSusbcribed? (
    <>{children}</>
  ) : (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#040924]"></div>
        <div className="text-[#040924] text-lg font-medium">Loading...</div>
      </div>
    </div>
  );
}

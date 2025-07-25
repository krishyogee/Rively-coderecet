'use client';
import { useAuth, useUser } from '@clerk/nextjs';
import { redirect, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { useUsers } from '@/store/userStore';

export default function Home() {
  const { userId, isLoaded } = useAuth();
  const { users, getAllAccountUsers } = useUsers();
  const { user } = useUser();
  const client = useApolloClient();
  const pathname = usePathname();
  const isSubscribed = user?.publicMetadata?.isSubscribed === true;

  useEffect(() => {
    // Only run redirect logic for the root route
    if (pathname === '/') {
      getAllAccountUsers(client);
      console.log('users', users);
    }
  }, [users, client, pathname]);

  if (pathname === '/' && isLoaded) {
    if (userId && isSubscribed) {
      redirect('/dashboard/home');
    } else if (!userId) {
      redirect('/login');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#040924]"></div>
        <div className="text-[#040924] text-lg font-medium">Loading</div>
      </div>
    </div>
  );
}
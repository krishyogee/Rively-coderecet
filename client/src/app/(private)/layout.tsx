'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { AppTopbar } from '@/components/app-topbar';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = true;
  if (!isLoggedIn) {
    return <div>Please log in to access this page.</div>;
  }

  return <>{children}</>;
}

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('💡 Private layout loaded');

  const pathname = usePathname();
  const isOnboarding = pathname?.includes('/onboarding');

  if (isOnboarding) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <AppTopbar />
      <main style={{ padding: '1rem' }}>
        {children}
        <Toaster />
      </main>
    </ProtectedRoute>
  );
}

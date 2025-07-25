'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useParams } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { VERIFY_CUSTOMER } from '@/graphql/auth/mutations';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

type VerificationStatus = 'initial' | 'verifying' | 'success' | 'error';

export default function EmailVerification() {
  const { userId, sessionId } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>('initial');
  const [message, setMessage] = useState<string>('');
  const [verifyCustomer, { data, loading, error }] = useMutation(
    VERIFY_CUSTOMER,
    {
      onCompleted: async (data) => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        if (userId && sessionId) {
          router.push('/onboarding/getting-started');
        } else {
          router.push('/login');
        }
      },
      onError: (error) => {
        console.log('Error', error);
      },
    }
  );
  const { token } = useParams();

  useEffect(() => {
    if (token) {
      verifyEmail(token as string);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setStatus('verifying');
    setMessage('Verifying your account...');

    try {
      await verifyCustomer({
        variables: {
          input: {
            token: verificationToken,
          },
        },
      });

      const data = { success: true, message: 'Email verified successfully!' };

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'initial':
        return (
          <CardContent>
            <p className="text-center">
              Click the button below to verify your email address.
            </p>
            <Button
              className="w-full mt-4"
              onClick={() => verifyEmail(token as string)}
            >
              Verify Email
            </Button>
          </CardContent>
        );
      case 'verifying':
        return (
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-center">{message}</p>
          </CardContent>
        );
      case 'success':
        return (
          <CardContent>
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
              <AlertDescription className="text-gray-700">
                {message}
              </AlertDescription>
            </Alert>
          </CardContent>
        );
      case 'error':
        return (
          <CardContent>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
            <Button
              className="w-full mt-4"
              onClick={() => verifyEmail(token as string)}
            >
              Try Again
            </Button>
          </CardContent>
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative z-20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Email Verification
          </CardTitle>
          <CardDescription className="text-center">
            Verify your email address to complete your registration
          </CardDescription>
        </CardHeader>
        {renderContent()}
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Need help?{' '}
            <a href="/contact" className="text-primary hover:underline">
              Contact support
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
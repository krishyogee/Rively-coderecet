'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@clerk/clerk-react';

export default function VerificationSent() {
  const { userId, isLoaded, getToken } = useAuth();
  const [isResending, setIsResending] = useState(false);

  const token = async () => {
    let t = await getToken();
    console.log(t);
  };

  useEffect(() => {
    console.log(getToken(), userId);
    token();
  }, []);

  const handleResendEmail = async () => {
    setIsResending(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsResending(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative z-20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Check Your Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <Mail className="w-24 h-24 text-primary" />
          </motion.div>
          <p className="text-center text-muted-foreground">
            We've sent a verification email to your inbox. Please check your
            email and click on the verification link to continue.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Verification email sent</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full"
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : (
              'Resend Verification Email'
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
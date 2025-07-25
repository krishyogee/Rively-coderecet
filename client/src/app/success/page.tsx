'use client'

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Mail, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#040924]">
            Welcome Aboard!
          </CardTitle>
          <CardDescription className="text-[#040924]/80">
            You've successfully joined the newsletter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Check your email
                </p>
                <p className="text-xs text-green-600">
                  You'll receive your first newsletter soon
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#040924]">What's next?</h3>
            <ul className="text-sm text-[#040924]/80 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-green-600 font-bold">•</span>
                <span>You'll receive weekly insights and updates</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Get industry-specific content for your department</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

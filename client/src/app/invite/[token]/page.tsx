'use client'

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Mail, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useEmailRecipients } from '@/store/emailRecipientStore';
import { useDepartments } from '@/store/departmentStore';

interface InviteData {
  departmentUID: string;
  isValid: boolean;
  customerUID: string;
  expiresAt: string;
  createdAt: string;
}

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  // Get hooks for API calls
  const { validateInvite, createEmailRecipient, isLoading: emailLoading, error: emailError } = useEmailRecipients();
  const { departments } = useDepartments();

  // Helper function to get department name from UID
  const getDepartmentName = (departmentUID: string) => {
    return departments.find(dept => dept.departmentUID === departmentUID)?.name || 'Newsletter';
  };

  // Validate invite token using GraphQL API
  useEffect(() => {
    const validateToken = async () => {
      try {
        const data = await validateInvite({ token: params.token });
        
        if (data) {
          setInviteData(data);
          
          if (!data.isValid) {
            const now = new Date();
            const expiresAt = new Date(data.expiresAt);
            const isExpired = now > expiresAt;
            
            toast({
              title: isExpired ? 'Invite link expired' : 'Invalid invite link',
              description: isExpired 
                ? 'This invite link has expired. Please request a new one.' 
                : 'This invite link is invalid or has been revoked.',
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Invalid invite link',
            description: 'This invite link is invalid or has been revoked.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Token validation error:', error);
        toast({
          title: 'Error validating invite',
          description: 'Unable to validate the invite link. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [params.token]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: 'Missing information',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Get department name for display
    const departmentName = departments.find(dept => dept.departmentUID === inviteData?.departmentUID)?.name;

    setSubmitting(true);

    try {
      // Create email recipient using GraphQL API
      const result = await createEmailRecipient({
        name: formData.name,
        email: formData.email,
        departmentUID: inviteData?.departmentUID || '',
      });

      if (result) {
        toast({
          title: 'Welcome aboard!',
          description: `You've successfully joined the ${departmentName || 'newsletter'} department newsletter.`,
          variant: 'default',
        });

        // Redirect to a success page or dashboard
        router.push('/success');
      } else {
        throw new Error('Failed to create email recipient');
      }
    } catch (error) {
      console.error('Error creating email recipient:', error);
      
      toast({
        title: 'Error joining newsletter',
        description: emailError || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#040924] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invite...</p>
        </div>
      </div>
    );
  }

  if (!inviteData?.isValid) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-red-600">
              Invalid Invite
            </CardTitle>
            <CardDescription className="text-center">
              This invite link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#040924]">
            Join {getDepartmentName(inviteData.departmentUID)} Newsletter
          </CardTitle>
          <CardDescription className="text-center text-[#040924]/80">
            You've been invited to receive the {getDepartmentName(inviteData.departmentUID)} weekly newsletter from Rively Pro
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Name Field */}
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none text-[#040924]" htmlFor="name">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                id="name" 
                placeholder="John Doe" 
                className="pl-10 text-[#040924] border-[#040924]/20 focus:border-[#040924]/50"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none text-[#040924]" htmlFor="email">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                id="email" 
                type="email"
                placeholder="john@example.com" 
                className="pl-10 text-[#040924] border-[#040924]/20 focus:border-[#040924]/50"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          {/* Department Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
            <p className="text-sm text-blue-700">
              <strong>Department:</strong> {getDepartmentName(inviteData.departmentUID)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              You'll receive weekly insights and updates relevant to the {getDepartmentName(inviteData.departmentUID)} department.
            </p>
          </div>
        </CardContent>
        
        <CardContent>
          <Button 
            className="w-full bg-[#040924] hover:bg-[#040924]/90 text-white"
            onClick={handleSubmit}
            disabled={submitting || emailLoading}
          >
            {submitting || emailLoading ? 'Joining...' : 'Join Newsletter'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

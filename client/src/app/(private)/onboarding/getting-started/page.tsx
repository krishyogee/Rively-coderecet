'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FreeTrialPage() {
  const router = useRouter()

  const handleStartTrial = () => {
    router.push('/onboarding/account-setup');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#040924]">
            Welcome to Rively
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <CardDescription className="text-left text-[#040924]/80">
            You’ve unlocked a free trial newsletter—no strings attached. Here’s what to expect:
          </CardDescription>
          <ul className="list-disc pl-5 space-y-2 text-[#040924]/80">
            <li>
              <span className="font-medium text-[#040924]">Tomorrow’s Edition:</span> A one-time newsletter with actionable insights, curated for you.
            </li>
            <li>
              <span className="font-medium text-[#040924]">Zero Commitment:</span> This is a trial, not a subscription. No auto-charges, no hidden steps.
            </li>
          </ul>
          <CardDescription className="text-left text-[#040924]/80">
            That’s it. If you love it, continue through a subscripition. If you find it valuable, we’d love to hear from you. 
            If not? No follow-ups.
          </CardDescription>
          <CardDescription className="text-left text-[#040924]/80">
            Enjoy,<br />
            The Rively Team
          </CardDescription>
        </CardContent>
        <CardContent>
          <Button 
            className="w-full bg-[#040924] hover:bg-[#040924]/90 text-white"
            onClick={handleStartTrial}
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
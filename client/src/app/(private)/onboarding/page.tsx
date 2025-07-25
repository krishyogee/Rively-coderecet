import { Metadata } from 'next';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export const metadata: Metadata = {
  title: 'Onboarding | Set up your workspace',
  description: 'Complete your account setup',
};

export default function OnboardingPage() {
  return (
    <main className="container max-w-lg mx-auto py-10">
      <OnboardingFlow />
    </main>
  );
}

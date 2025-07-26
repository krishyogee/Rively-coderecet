'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import WorkspaceStep from './WorkspaceStep';
import TeamsStep from './TeamsStep';
import type { Workspace, Team } from './types';

enum Step {
  Workspace = 1,
  Teams,
}

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(Step.Workspace);
  const [workspace, setWorkspace] = useState<Workspace>({ name: '', type: 'create' });
  const [teams, setTeams] = useState<Team[]>([]);

  const handleWorkspaceComplete = async (data: Workspace) => {
    try {
      // await createWorkspace(data);
      setWorkspace(data);
      setStep(Step.Teams);
    } catch (err) {
      console.error('Workspace creation failed:', err);
    }
  };

  const handleTeamsComplete = async (data: Team[]) => {
    try {
      // await createTeams(data);
      setTeams(data);
      router.push('/dashboard');
    } catch (err) {
      console.error('Team creation failed:', err);
    }
  };

  const renderStep = () => {
    switch (step) {
      case Step.Workspace:
        return <WorkspaceStep onComplete={handleWorkspaceComplete} />;
      case Step.Teams:
        return <TeamsStep onComplete={handleTeamsComplete} />;
      default:
        return null;
    }
  };

  return <Card className="p-6">{renderStep()}</Card>;
}

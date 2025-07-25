'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import WorkspaceStep from './WorkspaceStep';
import TeamsStep from './TeamsStep';
import type { Workspace, Team } from './types';

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [workspace, setWorkspace] = useState<Workspace>({
    name: '',
    type: 'create',
  });
  const [teams, setTeams] = useState<Team[]>([]);

  const handleWorkspaceComplete = async (workspaceData: Workspace) => {
    try {
      // You would implement your API call here
      // await createWorkspace(workspaceData);
      setWorkspace(workspaceData);
      setStep(2);
    } catch (error) {
      console.error('Failed to create workspace:', error);
      // Handle error appropriately
    }
  };

  const handleTeamsComplete = async (teamsData: Team[]) => {
    try {
      // You would implement your API call here
      // await createTeams(teamsData);
      setTeams(teamsData);
      router.push('/dashboard'); // Redirect to dashboard after completion
    } catch (error) {
      console.error('Failed to create teams:', error);
      // Handle error appropriately
    }
  };

  return (
    <Card className="p-6">
      {step === 1 && <WorkspaceStep onComplete={handleWorkspaceComplete} />}
      {step === 2 && <TeamsStep onComplete={handleTeamsComplete} />}
    </Card>
  );
}

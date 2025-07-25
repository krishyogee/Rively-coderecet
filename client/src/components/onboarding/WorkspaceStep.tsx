'use client';

import React, { useState } from 'react';
import {
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, ArrowRight } from 'lucide-react';
import type { Workspace } from './types';

interface WorkspaceStepProps {
  onComplete: (workspace: Workspace) => void;
}

export default function WorkspaceStep({ onComplete }: WorkspaceStepProps) {
  const [workspaceData, setWorkspaceData] = useState<Workspace>({
    name: '',
    type: 'create',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(workspaceData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Set Up Your Workspace
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={workspaceData.type}
          onValueChange={(value: 'create' | 'join') =>
            setWorkspaceData({ ...workspaceData, type: value })
          }
          className="space-y-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="create" id="create" />
            <Label htmlFor="create">Create a new workspace</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="join" id="join" />
            <Label htmlFor="join">Join an existing workspace</Label>
          </div>
        </RadioGroup>

        {workspaceData.type === 'create' ? (
          <div className="mt-4">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input
              id="workspace-name"
              value={workspaceData.name}
              onChange={(e) =>
                setWorkspaceData({ ...workspaceData, name: e.target.value })
              }
              placeholder="Enter workspace name"
              className="mt-1"
            />
          </div>
        ) : (
          <div className="mt-4">
            <Label htmlFor="workspace-code">Workspace Invitation Code</Label>
            <Input
              id="workspace-code"
              placeholder="Enter invitation code"
              className="mt-1"
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          disabled={workspaceData.type === 'create' && !workspaceData.name}
          className="ml-auto"
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </form>
  );
}

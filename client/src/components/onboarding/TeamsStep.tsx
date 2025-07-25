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
import { Users, ArrowRight, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Team } from './types';

interface TeamsStepProps {
  onComplete: (teams: Team[]) => void;
}

export default function TeamsStep({ onComplete }: TeamsStepProps) {
  const [teamName, setTeamName] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);

  const handleAddTeam = () => {
    if (teamName.trim()) {
      const newTeam: Team = {
        id: uuidv4(),
        name: teamName.trim(),
      };
      setTeams([...teams, newTeam]);
      setTeamName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(teams);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Create Teams
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="team-name">Team Name</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
              />
              <Button
                type="button"
                onClick={handleAddTeam}
                disabled={!teamName.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {teams.length > 0 && (
            <div className="border rounded-md p-4">
              <Label>Created Teams:</Label>
              <ul className="mt-2 space-y-2">
                {teams.map((team) => (
                  <li key={team.id} className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {team.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" disabled={teams.length === 0} className="ml-auto">
          Finish <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </form>
  );
}

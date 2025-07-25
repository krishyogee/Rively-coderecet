export interface Workspace {
  name: string;
  type: 'create' | 'join';
}

export interface Team {
  id: string;
  name: string;
}

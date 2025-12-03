export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface LinkResource {
  id: string;
  title: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO String
  priority: Priority;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  resources: LinkResource[];
  tags: string[];
}

export interface AIAssistResponse {
  improvedDescription: string;
  suggestedPriority: Priority;
  suggestedTags: string[];
}

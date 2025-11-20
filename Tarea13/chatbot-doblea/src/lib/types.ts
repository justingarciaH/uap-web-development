// src/lib/types.ts
export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  toolInvocations?: any[];
}

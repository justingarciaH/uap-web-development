import { UIMessage } from '@ai-sdk/react';


export interface ChatMessage extends UIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolInvocations?: ToolInvocation[];
}

export interface ToolInvocation {
  toolName: string;
  toolCallId: string;
  state: 'call' | 'result';
  args?: any;
  result?: any;
}
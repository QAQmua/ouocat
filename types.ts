
import React from 'react';

export interface AppInfo {
  name: string;
  icon: React.FC<any>;
  color: string;
}

export interface FolderData {
  id: string;
  name: string;
  apps: AppInfo[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string; // ISO string for persistence
}

export interface Contact {
  id: string;
  name: string;
  avatar: string; // URL string
  initial: string;
  note?: string;
  systemInstruction?: string;
  history: ChatMessage[];
}

export interface AiConfig {
  baseUrl: string;
  apiKey: string;
  modelName: string;
  temperature: number;
  systemInstruction: string;
  availableModels: string[];
}

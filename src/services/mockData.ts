import { Project, Chat, FileItem, Message, Settings } from '../types';

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Operation Nightfall',
    createdAt: new Date('2025-10-10T10:00:00'),
    updatedAt: new Date('2025-10-14T08:30:00'),
  },
  {
    id: 'proj-2',
    name: 'Intelligence Brief Q4',
    createdAt: new Date('2025-10-12T14:00:00'),
    updatedAt: new Date('2025-10-13T16:20:00'),
  },
];

export const mockChats: Chat[] = [
  {
    id: 'chat-1',
    projectId: 'proj-1',
    title: 'Threat assessment analysis',
    pinned: true,
    createdAt: new Date('2025-10-14T08:00:00'),
    updatedAt: new Date('2025-10-14T08:30:00'),
  },
  {
    id: 'chat-2',
    projectId: 'proj-1',
    title: 'Document extraction review',
    createdAt: new Date('2025-10-13T15:00:00'),
    updatedAt: new Date('2025-10-13T16:00:00'),
  },
  {
    id: 'chat-3',
    title: 'Quick security query',
    createdAt: new Date('2025-10-12T10:00:00'),
    updatedAt: new Date('2025-10-12T10:15:00'),
  },
];

export const mockFiles: FileItem[] = [
  {
    id: 'file-1',
    projectId: 'proj-1',
    name: 'threat-report-2025.pdf',
    type: 'pdf',
    size: 2458000,
    status: 'indexed',
    meta: { pages: 47 },
    createdAt: new Date('2025-10-10T10:30:00'),
  },
  {
    id: 'file-2',
    projectId: 'proj-1',
    name: 'surveillance-footage.mp4',
    type: 'video',
    size: 45678000,
    status: 'indexed',
    meta: { duration: 340, frames: 8160 },
    createdAt: new Date('2025-10-11T09:00:00'),
  },
];

export const mockMessages: Message[] = [];

export const defaultSettings: Settings = {
  model: 'local-llama-3-70b',
  agenticMode: true,
  enablePlanner: true,
  enableVerifier: true,
  theme: 'light',
  fontSize: 'medium',
  compactMode: false,
};

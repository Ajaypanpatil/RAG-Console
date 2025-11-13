import {
  Project,
  Chat,
  FileItem,
  Message,
  Settings,
  UploadProgress,
  Citation,
  RetrievalItem,
  ContextChunk,
  CacheStatus,
  AgentStep,
} from '../types';
import { mockProjects, mockChats, mockFiles, mockMessages, defaultSettings } from './mockData';

let projects = [...mockProjects];
let chats = [...mockChats];
let files = [...mockFiles];
let messages = [...mockMessages];
let settings = { ...defaultSettings };

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  getProjects: async (): Promise<Project[]> => {
    await delay(300);
    return [...projects];
  },

  createProject: async (name: string): Promise<Project> => {
    await delay(500);
    const project: Project = {
      id: `proj-${Date.now()}`,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    projects.push(project);
    return project;
  },

  deleteProject: async (id: string): Promise<void> => {
    await delay(300);
    projects = projects.filter((p) => p.id !== id);
    files = files.filter((f) => f.projectId !== id);
    chats = chats.filter((c) => c.projectId !== id);
  },

  renameProject: async (id: string, name: string): Promise<void> => {
    await delay(300);
    const project = projects.find((p) => p.id === id);
    if (project) {
      project.name = name;
      project.updatedAt = new Date();
    }
  },

  getChats: async (): Promise<Chat[]> => {
    await delay(300);
    return [...chats].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  },

  createChat: async (projectId?: string): Promise<Chat> => {
    await delay(400);
    const chat: Chat = {
      id: `chat-${Date.now()}`,
      projectId,
      title: 'New Intelligence Query',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    chats.push(chat);
    return chat;
  },

  deleteChat: async (id: string): Promise<void> => {
    await delay(300);
    chats = chats.filter((c) => c.id !== id);
    messages = messages.filter((m) => m.chatId !== id);
  },

  renameChat: async (id: string, title: string): Promise<void> => {
    await delay(300);
    const chat = chats.find((c) => c.id === id);
    if (chat) {
      chat.title = title;
      chat.updatedAt = new Date();
    }
  },

  togglePinChat: async (id: string): Promise<void> => {
    await delay(200);
    const chat = chats.find((c) => c.id === id);
    if (chat) {
      chat.pinned = !chat.pinned;
      chat.updatedAt = new Date();
    }
  },

  listFiles: async (projectId: string): Promise<FileItem[]> => {
    await delay(300);
    return files.filter((f) => f.projectId === projectId);
  },

  uploadFile: async (
    projectId: string,
    file: File,
    onProgress: (progress: UploadProgress) => void
  ): Promise<FileItem> => {
    const fileId = `file-${Date.now()}`;
    const fileType = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('audio/')
        ? 'audio'
        : file.type.startsWith('video/')
          ? 'video'
          : 'pdf';

    const steps: UploadProgress['step'][] = [
      'uploading',
      'extracting',
      'chunking',
      'embedding',
      'indexing',
    ];

    for (let i = 0; i < steps.length; i++) {
      await delay(800 + Math.random() * 400);
      onProgress({
        fileId,
        fileName: file.name,
        step: steps[i],
        progress: ((i + 1) / steps.length) * 100,
      });
    }

    await delay(500);
    onProgress({
      fileId,
      fileName: file.name,
      step: 'complete',
      progress: 100,
    });

    const newFile: FileItem = {
      id: fileId,
      projectId,
      name: file.name,
      type: fileType,
      size: file.size,
      status: 'indexed',
      meta:
        fileType === 'pdf'
          ? { pages: Math.floor(Math.random() * 50) + 10 }
          : fileType === 'video'
            ? { duration: Math.floor(Math.random() * 600) + 60, frames: 24 * 60 }
            : fileType === 'audio'
              ? { duration: Math.floor(Math.random() * 300) + 30 }
              : undefined,
      createdAt: new Date(),
    };

    files.push(newFile);
    return newFile;
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await delay(300);
    files = files.filter((f) => f.id !== fileId);
  },

  getChatMessages: async (chatId: string): Promise<Message[]> => {
    await delay(300);
    return messages.filter((m) => m.chatId === chatId);
  },

  sendMessage: async (
    chatId: string,
    content: string,
    attachments: File[],
    agenticMode: boolean
  ): Promise<Message> => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId,
      role: 'user',
      content,
      attachments: attachments.map((f, i) => ({
        id: `attach-${Date.now()}-${i}`,
        name: f.name,
        type: f.type.startsWith('image/')
          ? 'image'
          : f.type.startsWith('audio/')
            ? 'audio'
            : f.type.startsWith('video/')
              ? 'video'
              : 'pdf',
      })),
      createdAt: new Date(),
    };
    messages.push(userMessage);

    await delay(1500);

    const citations: Citation[] = [
      {
        id: 'cite-1',
        label: '1',
        sourceType: 'pdf',
        pointer: { page: 23 },
        previewUrl: 'https://via.placeholder.com/800x1000/1a1a1a/3b82f6?text=Page+23',
      },
      {
        id: 'cite-2',
        label: '2',
        sourceType: 'pdf',
        pointer: { page: 24 },
        previewUrl: 'https://via.placeholder.com/800x1000/1a1a1a/3b82f6?text=Page+24',
      },
      {
        id: 'cite-3',
        label: '3',
        sourceType: 'image',
        pointer: { bbox: { x: 120, y: 80, width: 200, height: 150 } },
        previewUrl: 'https://via.placeholder.com/800x600/1a1a1a/3b82f6?text=Surveillance+Image',
      },
    ];

    const retrievalItems: RetrievalItem[] = [
      {
        id: 'ret-1',
        scoreSemantic: 0.92,
        scoreKeyword: 0.78,
        title: 'threat-report-2025.pdf',
        snippet: 'Analysis indicates elevated threat level in sector 7...',
        pointer: { page: 23 },
      },
      {
        id: 'ret-2',
        scoreSemantic: 0.88,
        scoreKeyword: 0.71,
        title: 'threat-report-2025.pdf',
        snippet: 'Cross-reference with previous incidents suggests pattern...',
        pointer: { page: 24 },
      },
      {
        id: 'ret-3',
        scoreSemantic: 0.85,
        scoreKeyword: 0.82,
        title: 'surveillance-footage.mp4',
        snippet: 'Visual confirmation at timestamp 04:23 shows...',
        pointer: { timestamp: 263 },
      },
      {
        id: 'ret-4',
        scoreSemantic: 0.81,
        scoreKeyword: 0.69,
        title: 'threat-report-2025.pdf',
        snippet: 'Historical data from Q3 corroborates this assessment...',
        pointer: { page: 18 },
      },
    ];

    const contextChunks: ContextChunk[] = [
      {
        id: 'chunk-1',
        tokens: 342,
        preview: 'threat-report-2025.pdf [Page 23]: Analysis indicates elevated threat level...',
      },
      {
        id: 'chunk-2',
        tokens: 298,
        preview: 'threat-report-2025.pdf [Page 24]: Cross-reference with previous incidents...',
      },
      {
        id: 'chunk-3',
        tokens: 156,
        preview: 'surveillance-footage.mp4 [04:23]: Visual confirmation shows...',
      },
    ];

    const cacheStatus: CacheStatus = {
      hit: Math.random() > 0.5,
      key: `cache-${chatId}-${Date.now()}`,
    };

    const agentSteps: AgentStep[] | undefined = agenticMode
      ? [
          { type: 'plan', status: 'complete', timestamp: new Date() },
          { type: 'retrieve', status: 'complete', timestamp: new Date() },
          { type: 'generate', status: 'complete', timestamp: new Date() },
          { type: 'verify', status: 'complete', timestamp: new Date() },
        ]
      : undefined;

    const assistantMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      chatId,
      role: 'assistant',
      content: `Based on the retrieved intelligence from threat-report-2025.pdf and surveillance footage, the analysis indicates an elevated threat level in sector 7 [1]. Cross-referencing with previous incidents suggests a coordinated pattern [2], which is visually confirmed in the surveillance data at timestamp 04:23 [3]. The assessment is corroborated by historical Q3 data showing similar indicators.

Key findings:
• Threat level: High (confidence: 87%)
• Pattern recognition: Confirmed across multiple sources
• Recommended action: Enhanced monitoring and immediate escalation

All conclusions are grounded in the retrieved context with no speculative generation.`,
      citations,
      retrievalItems,
      contextChunks,
      cacheStatus,
      confidence: 0.87,
      agentSteps,
      createdAt: new Date(),
    };
    messages.push(assistantMessage);

    const chat = chats.find((c) => c.id === chatId);
    if (chat && chat.title === 'New Intelligence Query') {
      chat.title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
    }

    return assistantMessage;
  },

  getSettings: async (): Promise<Settings> => {
    await delay(200);
    return { ...settings };
  },

  updateSettings: async (newSettings: Partial<Settings>): Promise<Settings> => {
    await delay(300);
    settings = { ...settings, ...newSettings };
    return { ...settings };
  },

  exportChat: async (chatId: string): Promise<Blob> => {
    await delay(500);
    const chat = chats.find((c) => c.id === chatId);
    const chatMessages = messages.filter((m) => m.chatId === chatId);
    const data = {
      chat,
      messages: chatMessages,
      exportedAt: new Date(),
    };
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  },
};

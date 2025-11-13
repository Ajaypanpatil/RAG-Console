export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FileType = 'pdf' | 'image' | 'audio' | 'video';
export type FileStatus = 'uploaded' | 'processing' | 'indexed';

export interface FileMetadata {
  pages?: number;
  duration?: number;
  frames?: number;
}

export interface FileItem {
  id: string;
  projectId: string;
  name: string;
  type: FileType;
  size: number;
  status: FileStatus;
  meta?: FileMetadata;
  createdAt: Date;
}

export interface Chat {
  id: string;
  projectId?: string;
  title: string;
  pinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface FileRef {
  id: string;
  name: string;
  type: FileType;
}

export interface Citation {
  id: string;
  label: string;
  sourceType: FileType;
  pointer: {
    page?: number;
    bbox?: { x: number; y: number; width: number; height: number };
    timestamp?: number;
  };
  previewUrl?: string;
}

export interface ContextChunk {
  id: string;
  tokens: number;
  preview: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  attachments?: FileRef[];
  citations?: Citation[];
  contextChunks?: ContextChunk[];
  retrievalItems?: RetrievalItem[];
  cacheStatus?: CacheStatus;
  confidence?: number;
  agentSteps?: AgentStep[];
  createdAt: Date;
}

export interface RetrievalItem {
  id: string;
  scoreSemantic: number;
  scoreKeyword: number;
  title: string;
  snippet: string;
  pointer: {
    page?: number;
    bbox?: { x: number; y: number; width: number; height: number };
    timestamp?: number;
  };
}

export interface CacheStatus {
  hit: boolean;
  key: string;
}

export type AgentStepType = 'plan' | 'retrieve' | 're-plan' | 'generate' | 'verify';

export interface AgentStep {
  type: AgentStepType;
  status: 'pending' | 'running' | 'complete';
  timestamp: Date;
}

export interface Settings {
  model: string;
  agenticMode: boolean;
  enablePlanner: boolean;
  enableVerifier: boolean;
  theme: 'dark' | 'light';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  step: 'uploading' | 'extracting' | 'chunking' | 'embedding' | 'indexing' | 'complete';
  progress: number;
}

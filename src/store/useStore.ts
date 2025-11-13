import { create } from 'zustand';
import { UploadProgress } from '../types';

interface UIState {
  sidebarOpen: boolean;
  rightDockOpen: boolean;
  activeRightTab: 'citations' | 'retrieval' | 'context' | 'cache';
  commandPaletteOpen: boolean;
  currentChatId: string | null;
  currentProjectId: string | null;
  uploadProgresses: UploadProgress[];
  searchQuery: string;

  setSidebarOpen: (open: boolean) => void;
  setRightDockOpen: (open: boolean) => void;
  setActiveRightTab: (tab: 'citations' | 'retrieval' | 'context' | 'cache') => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setCurrentChatId: (id: string | null) => void;
  setCurrentProjectId: (id: string | null) => void;
  addUploadProgress: (progress: UploadProgress) => void;
  updateUploadProgress: (fileId: string, progress: Partial<UploadProgress>) => void;
  removeUploadProgress: (fileId: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useStore = create<UIState>((set) => ({
  sidebarOpen: true,
  rightDockOpen: true,
  activeRightTab: 'citations',
  commandPaletteOpen: false,
  currentChatId: null,
  currentProjectId: null,
  uploadProgresses: [],
  searchQuery: '',

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setRightDockOpen: (open) => set({ rightDockOpen: open }),
  setActiveRightTab: (tab) => set({ activeRightTab: tab }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setCurrentChatId: (id) => set({ currentChatId: id }),
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
  addUploadProgress: (progress) =>
    set((state) => ({ uploadProgresses: [...state.uploadProgresses, progress] })),
  updateUploadProgress: (fileId, progress) =>
    set((state) => ({
      uploadProgresses: state.uploadProgresses.map((p) =>
        p.fileId === fileId ? { ...p, ...progress } : p
      ),
    })),
  removeUploadProgress: (fileId) =>
    set((state) => ({
      uploadProgresses: state.uploadProgresses.filter((p) => p.fileId !== fileId),
    })),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

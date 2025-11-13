import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderPlus,
  Plus,
  Search,
  Settings,
  ChevronRight,
  ChevronDown,
  Upload,
  MoreVertical,
  Pin,
  Edit2,
  Trash2,
  Shield,
} from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { useStore } from '../store/useStore';
import { formatDate } from '../lib/utils';
import { Project, Chat } from '../types';

export function Sidebar() {
  const queryClient = useQueryClient();
  const {
    sidebarOpen,
    setSidebarOpen,
    searchQuery,
    setSearchQuery,
    currentChatId,
    setCurrentChatId,
    setCurrentProjectId,
  } = useStore();

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: mockApi.getProjects,
  });

  const { data: chats = [] } = useQuery({
    queryKey: ['chats'],
    queryFn: mockApi.getChats,
  });

  const createProjectMutation = useMutation({
    mutationFn: (name: string) => mockApi.createProject(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const createChatMutation = useMutation({
    mutationFn: (projectId?: string) => mockApi.createChat(projectId),
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setCurrentChatId(chat.id);
      if (chat.projectId) setCurrentProjectId(chat.projectId);
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name, type }: { id: string; name: string; type: 'project' | 'chat' }) =>
      type === 'project' ? mockApi.renameProject(id, name) : mockApi.renameChat(id, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [variables.type === 'project' ? 'projects' : 'chats'],
      });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'project' | 'chat' }) =>
      type === 'project' ? mockApi.deleteProject(id) : mockApi.deleteChat(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [variables.type === 'project' ? 'projects' : 'chats'],
      });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: (chatId: string) => mockApi.togglePinChat(chatId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }),
  });

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const handleNewProject = () => {
    const name = prompt('Project name:');
    if (name) createProjectMutation.mutate(name);
  };

  const handleNewChat = (projectId?: string) => {
    createChatMutation.mutate(projectId);
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const handleRename = (id: string, type: 'project' | 'chat') => {
    if (editValue.trim()) {
      renameMutation.mutate({ id, name: editValue.trim(), type });
    }
    setEditingId(null);
  };

  const filteredChats = chats.filter(
    (chat) =>
      !searchQuery ||
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(
    (project) =>
      !searchQuery ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!sidebarOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      />
      <aside className="fixed lg:static w-64 border-r border-border bg-card flex flex-col h-screen z-50">
      <div className="p-4 border-b border-border">
        <h1 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          NTRO Intelligence Console
        </h1>
        <button
          onClick={() => handleNewChat()}
          className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Intelligence Query
        </button>
      </div>

      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Projects
            </h2>
            <button
              onClick={handleNewProject}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Create project"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {filteredProjects.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                isExpanded={expandedProjects.has(project.id)}
                onToggle={() => toggleProject(project.id)}
                isEditing={editingId === project.id}
                editValue={editValue}
                onEditChange={setEditValue}
                onRename={() => handleRename(project.id, 'project')}
                onStartEditing={() => startEditing(project.id, project.name)}
                onDelete={() => deleteMutation.mutate({ id: project.id, type: 'project' })}
                onNewChat={() => handleNewChat(project.id)}
              />
            ))}
          </div>
        </div>

        <div className="p-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Recent Chats
          </h2>
          <div className="space-y-1">
            {filteredChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={currentChatId === chat.id}
                onClick={() => setCurrentChatId(chat.id)}
                isEditing={editingId === chat.id}
                editValue={editValue}
                onEditChange={setEditValue}
                onRename={() => handleRename(chat.id, 'chat')}
                onStartEditing={() => startEditing(chat.id, chat.title)}
                onDelete={() => deleteMutation.mutate({ id: chat.id, type: 'chat' })}
                onTogglePin={() => togglePinMutation.mutate(chat.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2">
          Storage: 2.4 GB / 100 GB
        </div>
        <div className="flex items-center gap-2 text-xs text-green-500 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          AIR-GAPPED MODE • Offline
        </div>
        <button
          onClick={() => (window.location.href = '/settings')}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </aside>
    </>
  );
}

interface ProjectItemProps {
  project: Project;
  isExpanded: boolean;
  onToggle: () => void;
  isEditing: boolean;
  editValue: string;
  onEditChange: (value: string) => void;
  onRename: () => void;
  onStartEditing: () => void;
  onDelete: () => void;
  onNewChat: () => void;
}

function ProjectItem({
  project,
  isExpanded,
  onToggle,
  isEditing,
  editValue,
  onEditChange,
  onRename,
  onStartEditing,
  onDelete,
  onNewChat,
}: ProjectItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group">
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors">
        <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={onRename}
            onKeyDown={(e) => e.key === 'Enter' && onRename()}
            className="flex-1 bg-background border border-border rounded px-2 py-0.5 text-sm"
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm text-foreground truncate">{project.name}</span>
        )}

        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
              <button
                onClick={() => {
                  onNewChat();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                New Chat
              </button>
              <button
                onClick={() => {
                  onStartEditing();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent flex items-center gap-2"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Rename
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent text-destructive flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          <button
            onClick={onNewChat}
            className="w-full px-2 py-1.5 text-left text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Files
          </button>
        </div>
      )}
    </div>
  );
}

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
  isEditing: boolean;
  editValue: string;
  onEditChange: (value: string) => void;
  onRename: () => void;
  onStartEditing: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

function ChatItem({
  chat,
  isActive,
  onClick,
  isEditing,
  editValue,
  onEditChange,
  onRename,
  onStartEditing,
  onDelete,
  onTogglePin,
}: ChatItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className={`w-full flex items-start gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
          isActive ? 'bg-accent' : 'hover:bg-accent'
        }`}
      >
        {chat.pinned && <Pin className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              onBlur={onRename}
              onKeyDown={(e) => e.key === 'Enter' && onRename()}
              className="w-full bg-background border border-border rounded px-2 py-0.5 text-sm"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <div className="text-sm text-foreground truncate">{chat.title}</div>
              <div className="text-xs text-muted-foreground">{formatDate(chat.updatedAt)}</div>
            </>
          )}
        </div>
      </button>

      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="text-muted-foreground hover:text-foreground p-1"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
            <button
              onClick={() => {
                onTogglePin();
                setShowMenu(false);
              }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent flex items-center gap-2"
            >
              <Pin className="w-3.5 h-3.5" />
              {chat.pinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              onClick={() => {
                onStartEditing();
                setShowMenu(false);
              }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent flex items-center gap-2"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Rename
            </button>
            <button
              onClick={() => {
                onDelete();
                setShowMenu(false);
              }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent text-destructive flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

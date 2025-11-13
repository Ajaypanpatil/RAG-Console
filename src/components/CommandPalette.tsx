import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, FolderPlus, Upload, Settings, HelpCircle, X } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { useStore } from '../store/useStore';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const queryClient = useQueryClient();
  const { commandPaletteOpen, setCommandPaletteOpen, setCurrentChatId } = useStore();
  const [search, setSearch] = useState('');

  const createChatMutation = useMutation({
    mutationFn: () => mockApi.createChat(),
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setCurrentChatId(chat.id);
      setCommandPaletteOpen(false);
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (name: string) => mockApi.createProject(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setCommandPaletteOpen(false);
    },
  });

  const commands: Command[] = [
    {
      id: 'new-chat',
      label: 'New Intelligence Query',
      icon: <Plus className="w-4 h-4" />,
      action: () => createChatMutation.mutate(),
      keywords: ['new', 'chat', 'query', 'conversation'],
    },
    {
      id: 'new-project',
      label: 'New Project',
      icon: <FolderPlus className="w-4 h-4" />,
      action: () => {
        const name = prompt('Project name:');
        if (name) createProjectMutation.mutate(name);
        setCommandPaletteOpen(false);
      },
      keywords: ['new', 'project', 'folder'],
    },
    {
      id: 'upload',
      label: 'Upload Files',
      icon: <Upload className="w-4 h-4" />,
      action: () => {
        setCommandPaletteOpen(false);
        document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
      },
      keywords: ['upload', 'file', 'document', 'pdf', 'image'],
    },
    {
      id: 'settings',
      label: 'Open Settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => {
        window.location.href = '/settings';
      },
      keywords: ['settings', 'preferences', 'config'],
    },
    {
      id: 'help',
      label: 'Open Help',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => {
        window.location.href = '/help';
      },
      keywords: ['help', 'docs', 'documentation', 'guide'],
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const searchLower = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some((kw) => kw.includes(searchLower))
    );
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[20vh] z-50">
      <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              No commands found
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center text-primary">
                    {cmd.icon}
                  </div>
                  <span className="text-sm text-foreground">{cmd.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-border bg-secondary/50">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              <kbd className="px-2 py-0.5 bg-background border border-border rounded font-mono">
                Cmd/Ctrl+K
              </kbd>{' '}
              to open
            </span>
            <span>
              <kbd className="px-2 py-0.5 bg-background border border-border rounded font-mono">
                Esc
              </kbd>{' '}
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

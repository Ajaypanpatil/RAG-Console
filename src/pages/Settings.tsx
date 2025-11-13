import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { useStore } from '../store/useStore';
import { Settings as SettingsType } from '../types';

export function Settings() {
  const queryClient = useQueryClient();
  const { currentChatId } = useStore();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: mockApi.getSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Partial<SettingsType>) => mockApi.updateSettings(updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const exportChatMutation = useMutation({
    mutationFn: (chatId: string) => mockApi.exportChat(chatId),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <button
            onClick={() => (window.location.href = '/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Console
          </button>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your NTRO Intelligence Console preferences
          </p>
        </div>

        <div className="space-y-6">
          <Section title="Model Configuration">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Language Model
                </label>
                <select
                  value={settings.model}
                  onChange={(e) => updateSettingsMutation.mutate({ model: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="local-llama-3-70b">Local LLaMA 3 70B</option>
                  <option value="local-mistral-7b">Local Mistral 7B</option>
                  <option value="local-llama-2-13b">Local LLaMA 2 13B</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  All models run locally in air-gapped mode
                </p>
              </div>
            </div>
          </Section>

          <Section title="Agentic RAG Controls">
            <div className="space-y-4">
              <ToggleSetting
                label="Enable Agent Orchestrator"
                description="Use planner and verifier agents for multi-step reasoning"
                checked={settings.agenticMode}
                onChange={(checked) => updateSettingsMutation.mutate({ agenticMode: checked })}
              />

              {settings.agenticMode && (
                <>
                  <ToggleSetting
                    label="Enable Planner Agent"
                    description="Break down complex queries into retrieval steps"
                    checked={settings.enablePlanner}
                    onChange={(checked) =>
                      updateSettingsMutation.mutate({ enablePlanner: checked })
                    }
                  />

                  <ToggleSetting
                    label="Enable Verifier Agent"
                    description="Verify answer quality and re-retrieve if confidence is low"
                    checked={settings.enableVerifier}
                    onChange={(checked) =>
                      updateSettingsMutation.mutate({ enableVerifier: checked })
                    }
                  />
                </>
              )}
            </div>
          </Section>

          <Section title="User Interface">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) =>
                    updateSettingsMutation.mutate({ theme: e.target.value as 'dark' | 'light' })
                  }
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Font Size
                </label>
                <select
                  value={settings.fontSize}
                  onChange={(e) =>
                    updateSettingsMutation.mutate({
                      fontSize: e.target.value as 'small' | 'medium' | 'large',
                    })
                  }
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <ToggleSetting
                label="Compact Mode"
                description="Reduce spacing and padding for a denser layout"
                checked={settings.compactMode}
                onChange={(checked) => updateSettingsMutation.mutate({ compactMode: checked })}
              />
            </div>
          </Section>

          <Section title="Data Export">
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => currentChatId && exportChatMutation.mutate(currentChatId)}
                  disabled={!currentChatId || exportChatMutation.isPending}
                  className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  {exportChatMutation.isPending ? 'Exporting...' : 'Export Current Chat'}
                </button>
                <p className="text-xs text-muted-foreground mt-2">
                  Export chat history and metadata as JSON
                </p>
              </div>
            </div>
          </Section>

          <Section title="Keyboard Shortcuts">
            <div className="space-y-3">
              <ShortcutItem shortcut="Cmd/Ctrl + K" description="Open command palette" />
              <ShortcutItem shortcut="Cmd/Ctrl + Enter" description="Send message" />
              <ShortcutItem shortcut="Cmd/Ctrl + /" description="Show keyboard shortcuts" />
              <ShortcutItem shortcut="Esc" description="Close modals and dialogs" />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      </div>
      <label className="flex items-center cursor-pointer ml-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-secondary rounded-full peer-checked:bg-primary transition-colors relative">
          <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 peer-checked:left-[22px] transition-all" />
        </div>
      </label>
    </div>
  );
}

function ShortcutItem({ shortcut, description }: { shortcut: string; description: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-foreground">{description}</span>
      <kbd className="px-3 py-1 bg-secondary border border-border rounded text-xs font-mono">
        {shortcut}
      </kbd>
    </div>
  );
}

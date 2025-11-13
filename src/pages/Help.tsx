import { ArrowLeft, Keyboard, Upload, Search, MessageSquare, Settings as SettingsIcon } from 'lucide-react';

export function Help() {
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
          <h1 className="text-3xl font-bold text-foreground">Help & Quick Tour</h1>
          <p className="text-muted-foreground mt-2">
            Learn how to use the NTRO Intelligence Console
          </p>
        </div>

        <div className="space-y-6">
          <Section
            icon={<MessageSquare className="w-5 h-5" />}
            title="Getting Started"
            description="Start a new intelligence query by clicking the 'New Intelligence Query' button in the sidebar. You can organize queries into projects for better management."
          />

          <Section
            icon={<Upload className="w-5 h-5" />}
            title="Uploading Files"
            description="Upload PDFs, images, audio, or video files by clicking the upload button in the composer or dragging files directly. Files will be processed through extraction, chunking, embedding, and indexing stages before they're ready for querying."
          />

          <Section
            icon={<Search className="w-5 h-5" />}
            title="Querying Intelligence"
            description="Type your question in the composer and press Send or Cmd/Ctrl+Enter. The system will retrieve relevant context from your uploaded files and generate a grounded answer with citations. All responses are based on retrieved context with no LLM hallucination."
          />

          <Section
            icon={<SettingsIcon className="w-5 h-5" />}
            title="Agent Mode"
            description="Enable Agent Orchestrator mode to use multi-step reasoning. The system will plan the query, retrieve relevant information, verify the answer quality, and re-retrieve if confidence is low. View the agent timeline above assistant responses."
          />

          <Section
            icon={<Keyboard className="w-5 h-5" />}
            title="Keyboard Shortcuts"
            description="Use keyboard shortcuts to navigate efficiently:"
          >
            <div className="mt-4 space-y-2">
              <ShortcutRow shortcut="Cmd/Ctrl + K" description="Open command palette" />
              <ShortcutRow shortcut="Cmd/Ctrl + Enter" description="Send message" />
              <ShortcutRow shortcut="Cmd/Ctrl + /" description="Show keyboard shortcuts" />
              <ShortcutRow shortcut="Esc" description="Close modals and dialogs" />
            </div>
          </Section>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Key Features</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Offline & Air-Gapped:</strong> All processing
                  happens locally with no internet connection required
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Multimodal RAG:</strong> Process PDFs, images,
                  audio, and video with unified semantic search
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Grounded Answers:</strong> Every response is
                  based on retrieved context with citations
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Agentic Reasoning:</strong> Multi-step planning
                  and verification for complex queries
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Semantic Caching:</strong> Faster retrieval for
                  similar queries with automatic cache management
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Right Panel Tabs</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-foreground mb-1">Citations</div>
                <p className="text-sm text-muted-foreground">
                  View source references with page numbers, timestamps, or image regions. Click to
                  preview the exact location.
                </p>
              </div>
              <div>
                <div className="text-sm font-medium text-foreground mb-1">Retrieval</div>
                <p className="text-sm text-muted-foreground">
                  See top-k retrieved items with semantic and keyword match scores.
                </p>
              </div>
              <div>
                <div className="text-sm font-medium text-foreground mb-1">Context</div>
                <p className="text-sm text-muted-foreground">
                  Review the exact context chunks sent to the LLM with token counts.
                </p>
              </div>
              <div>
                <div className="text-sm font-medium text-foreground mb-1">Cache</div>
                <p className="text-sm text-muted-foreground">
                  Check semantic cache hit/miss status for query optimization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({ shortcut, description }: { shortcut: string; description: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-secondary rounded-lg">
      <span className="text-sm text-foreground">{description}</span>
      <kbd className="px-3 py-1 bg-background border border-border rounded text-xs font-mono">
        {shortcut}
      </kbd>
    </div>
  );
}

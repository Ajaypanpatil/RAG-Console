import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Image as ImageIcon, AudioWaveform, Video, ExternalLink } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { useStore } from '../store/useStore';
import { formatTimestamp } from '../lib/utils';

export function RightDock() {
  const { currentChatId, rightDockOpen, activeRightTab, setActiveRightTab } = useStore();
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', currentChatId],
    queryFn: () => (currentChatId ? mockApi.getChatMessages(currentChatId) : []),
    enabled: !!currentChatId,
  });

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant');

  if (!rightDockOpen || !lastAssistantMessage) return null;

  const tabs = [
    { id: 'citations' as const, label: 'Citations' },
    { id: 'retrieval' as const, label: 'Retrieval' },
    { id: 'context' as const, label: 'Context' },
    { id: 'cache' as const, label: 'Cache' },
  ];

  return (
    <aside className="hidden lg:flex w-80 border-l border-border bg-card flex-col h-screen">
      <div className="border-b border-border">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveRightTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeRightTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {activeRightTab === 'citations' && (
          <CitationsTab
            citations={lastAssistantMessage.citations || []}
            selectedCitation={selectedCitation}
            onSelectCitation={setSelectedCitation}
          />
        )}
        {activeRightTab === 'retrieval' && (
          <RetrievalTab items={lastAssistantMessage.retrievalItems || []} />
        )}
        {activeRightTab === 'context' && (
          <ContextTab chunks={lastAssistantMessage.contextChunks || []} />
        )}
        {activeRightTab === 'cache' && (
          <CacheTab status={lastAssistantMessage.cacheStatus} />
        )}
      </div>
    </aside>
  );
}

function CitationsTab({
  citations,
  selectedCitation,
  onSelectCitation,
}: {
  citations: any[];
  selectedCitation: string | null;
  onSelectCitation: (id: string) => void;
}) {
  if (citations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No citations in this response
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Sources Referenced
      </div>
      {citations.map((citation) => (
        <button
          key={citation.id}
          onClick={() => onSelectCitation(citation.id)}
          className="w-full bg-secondary hover:bg-accent border border-border rounded-lg p-3 text-left transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-primary">[{citation.label}]</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getSourceIcon(citation.sourceType)}
                <span className="text-sm font-medium text-foreground capitalize">
                  {citation.sourceType}
                </span>
              </div>
              {citation.pointer.page && (
                <div className="text-xs text-muted-foreground">Page {citation.pointer.page}</div>
              )}
              {citation.pointer.timestamp !== undefined && (
                <div className="text-xs text-muted-foreground">
                  {formatTimestamp(citation.pointer.timestamp)}
                </div>
              )}
              {citation.pointer.bbox && (
                <div className="text-xs text-muted-foreground">
                  Region: {citation.pointer.bbox.x},{citation.pointer.bbox.y}
                </div>
              )}
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </div>

          {citation.previewUrl && selectedCitation === citation.id && (
            <div className="mt-3 rounded overflow-hidden border border-border">
              <img
                src={citation.previewUrl}
                alt="Citation preview"
                className="w-full"
              />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function RetrievalTab({ items }: { items: any[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No retrieval data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Top-K Retrieved Items
      </div>
      {items.map((item, index) => (
        <div key={item.id} className="bg-secondary border border-border rounded-lg p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">#{index + 1}</span>
              <span className="text-sm font-medium text-foreground">{item.title}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.snippet}</p>

          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">Semantic</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${item.scoreSemantic * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium">
                  {(item.scoreSemantic * 100).toFixed(0)}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">Keyword</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${item.scoreKeyword * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium">
                  {(item.scoreKeyword * 100).toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContextTab({ chunks }: { chunks: any[] }) {
  if (chunks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No context data available
      </div>
    );
  }

  const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokens, 0);

  return (
    <div className="space-y-3">
      <div className="bg-secondary border border-border rounded-lg p-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Context Summary
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Total Chunks:</span>
          <span className="text-sm font-semibold">{chunks.length}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-foreground">Total Tokens:</span>
          <span className="text-sm font-semibold">{totalTokens}</span>
        </div>
      </div>

      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Context Chunks
      </div>

      {chunks.map((chunk, index) => (
        <div key={chunk.id} className="bg-secondary border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Chunk #{index + 1}
            </span>
            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
              {chunk.tokens} tokens
            </span>
          </div>
          <p className="text-xs text-foreground leading-relaxed">{chunk.preview}</p>
        </div>
      ))}
    </div>
  );
}

function CacheTab({ status }: { status?: { hit: boolean; key: string } }) {
  if (!status) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No cache data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Semantic Cache Status
      </div>

      <div className="bg-secondary border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-foreground">Cache Status:</span>
          <span
            className={`text-sm font-semibold px-3 py-1 rounded ${
              status.hit
                ? 'bg-green-500/20 text-green-500'
                : 'bg-yellow-500/20 text-yellow-500'
            }`}
          >
            {status.hit ? 'HIT' : 'MISS'}
          </span>
        </div>

        {status.hit ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              This query matched a previous semantic search, reducing embedding computation time.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-full" />
              </div>
              <span className="text-xs font-medium">100% match</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No semantic match found. New embeddings computed and cached for future queries.
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-1">Cache Key:</div>
          <code className="text-xs bg-background px-2 py-1 rounded font-mono break-all">
            {status.key}
          </code>
        </div>
      </div>

      <div className="bg-secondary border border-border rounded-lg p-4">
        <div className="text-xs font-semibold text-foreground mb-2">Cache Benefits</div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Reduced embedding computation</li>
          <li>• Faster query response time</li>
          <li>• Lower energy consumption</li>
          <li>• Consistent results for similar queries</li>
        </ul>
      </div>
    </div>
  );
}

function getSourceIcon(type: string) {
  switch (type) {
    case 'pdf':
      return <FileText className="w-4 h-4 text-red-500" />;
    case 'image':
      return <ImageIcon className="w-4 h-4 text-green-500" />;
    case 'audio':
      return <AudioWaveform className="w-4 h-4 text-purple-500" />;
    case 'video':
      return <Video className="w-4 h-4 text-blue-500" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
}

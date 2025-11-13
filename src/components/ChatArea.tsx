import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Send,
  Upload,
  Mic,
  ChevronDown,
  Copy,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Image,
  AudioWaveform,
  Video,
  X,
  Menu,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { useStore } from '../store/useStore';
import { Message as MessageType, AgentStep } from '../types';
import { formatDate, formatFileSize } from '../lib/utils';

export function ChatArea() {
  const queryClient = useQueryClient();
  const {
    currentChatId,
    rightDockOpen,
    setRightDockOpen,
    setSidebarOpen,
  } = useStore();

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: mockApi.getSettings,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', currentChatId],
    queryFn: () => (currentChatId ? mockApi.getChatMessages(currentChatId) : []),
    enabled: !!currentChatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: { chatId: string; content: string; attachments: File[]; agenticMode: boolean }) =>
      mockApi.sendMessage(data.chatId, data.content, data.attachments, data.agenticMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', currentChatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!currentChatId || (!input.trim() && attachments.length === 0)) return;

    sendMessageMutation.mutate({
      chatId: currentChatId,
      content: input,
      attachments,
      agenticMode: settings?.agenticMode || false,
    });

    setInput('');
    setAttachments([]);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  if (!currentChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            NTRO Intelligence Console
          </h2>
          <p className="text-muted-foreground">
            Start a new intelligence query to begin analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm text-muted-foreground">
            Intelligence Query / Current Analysis
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option>Local LLaMA 3 70B</option>
            <option>Local Mistral 7B</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings?.agenticMode}
              onChange={(e) =>
                mockApi.updateSettings({ agenticMode: e.target.checked }).then(() =>
                  queryClient.invalidateQueries({ queryKey: ['settings'] })
                )
              }
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-secondary rounded-full peer-checked:bg-primary transition-colors relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 peer-checked:left-[18px] transition-all" />
            </div>
            <span className="text-xs text-muted-foreground">Agent Mode</span>
          </label>

          <div className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            AIR-GAPPED MODE • Offline
          </div>

          <button
            onClick={() => setRightDockOpen(!rightDockOpen)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Toggle right panel"
          >
            {rightDockOpen ? (
              <PanelRightClose className="w-5 h-5" />
            ) : (
              <PanelRightOpen className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="fixed inset-0 bg-primary/10 border-4 border-dashed border-primary flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-lg font-medium">Drop files to upload</p>
              <p className="text-sm text-muted-foreground">PDF, Images, Audio, or Video</p>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {sendMessageMutation.isPending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">Processing query...</div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <AttachmentChip key={index} file={file} onRemove={() => removeAttachment(index)} />
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1 bg-secondary border border-border rounded-lg flex items-center gap-2 px-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask a question or upload files…"
                className="flex-1 bg-transparent resize-none py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[44px] max-h-[200px]"
                rows={1}
              />

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,image/*,audio/*,video/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Upload files"
              >
                <Upload className="w-5 h-5" />
              </button>

              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() && attachments.length === 0}
              className="bg-primary text-primary-foreground rounded-lg px-4 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2 text-xs text-muted-foreground text-center">
            Cmd/Ctrl+Enter to send
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: MessageType }) {
  const [showContext, setShowContext] = useState(false);

  if (message.role === 'user') {
    return (
      <div className="flex gap-3 justify-end">
        <div className="flex-1 max-w-[80%]">
          <div className="bg-primary text-primary-foreground rounded-lg px-4 py-3">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 text-xs bg-primary-foreground/10 rounded px-2 py-1"
                  >
                    {getFileIconComponent(file.type)}
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1 text-right">
            {formatDate(message.createdAt)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-semibold text-primary-foreground">AI</span>
      </div>

      <div className="flex-1">
        {message.agentSteps && <AgentTimeline steps={message.agentSteps} />}

        <div className="bg-secondary rounded-lg px-4 py-3">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>

          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {message.citations.map((citation) => (
                <button
                  key={citation.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded hover:bg-primary/30 transition-colors"
                >
                  [{citation.label}]
                </button>
              ))}
            </div>
          )}

          {message.confidence !== undefined && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Confidence:</span>
              <div className="flex-1 max-w-[200px] h-1.5 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${message.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium">{Math.round(message.confidence * 100)}%</span>
            </div>
          )}
        </div>

        {message.contextChunks && message.contextChunks.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowContext(!showContext)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showContext ? 'rotate-180' : ''}`}
              />
              Context Used ({message.contextChunks.length} chunks, {message.contextChunks.reduce((sum, c) => sum + c.tokens, 0)} tokens)
            </button>
            {showContext && (
              <div className="mt-2 space-y-1">
                {message.contextChunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="bg-background border border-border rounded px-3 py-2 text-xs"
                  >
                    <div className="text-muted-foreground mb-1">{chunk.tokens} tokens</div>
                    <div className="text-foreground">{chunk.preview}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(message.createdAt)}</span>
          <span>•</span>
          <span>No direct LLM hallucination — grounded on retrieved context.</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <Copy className="w-4 h-4" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentTimeline({ steps }: { steps: AgentStep[] }) {
  return (
    <div className="mb-3 flex items-center gap-2 flex-wrap">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              step.status === 'complete'
                ? 'bg-green-500/20 text-green-500'
                : step.status === 'running'
                  ? 'bg-primary/20 text-primary animate-pulse'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
          </div>
          {index < steps.length - 1 && (
            <div className="w-3 h-px bg-border" />
          )}
        </div>
      ))}
    </div>
  );
}

function AttachmentChip({ file, onRemove }: { file: File; onRemove: () => void }) {
  const type = file.type.startsWith('image/')
    ? 'image'
    : file.type.startsWith('audio/')
      ? 'audio'
      : file.type.startsWith('video/')
        ? 'video'
        : 'pdf';

  return (
    <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-2">
      {getFileIconComponent(type)}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground truncate">{file.name}</div>
        <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
      </div>
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function getFileIconComponent(type: string) {
  switch (type) {
    case 'pdf':
      return <FileText className="w-4 h-4 text-red-500" />;
    case 'image':
      return <Image className="w-4 h-4 text-green-500" />;
    case 'audio':
      return <AudioWaveform className="w-4 h-4 text-purple-500" />;
    case 'video':
      return <Video className="w-4 h-4 text-blue-500" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
}

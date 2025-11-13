# NTRO Intelligence Console - Offline Multimodal RAG

A production-quality, ChatGPT-style interface for an offline, agentic, multimodal RAG (Retrieval-Augmented Generation) intelligence system. This is a frontend-only demo with realistic mock services.

## Features

### Core Capabilities
- **Offline & Air-Gapped**: All processing simulated locally, no internet required
- **Multimodal RAG**: Support for PDFs, images, audio, and video files
- **Agentic Reasoning**: Multi-step planning and verification for complex queries
- **Grounded Answers**: Every response based on retrieved context with citations
- **Semantic Caching**: Optimized retrieval with cache hit/miss tracking

### User Interface
- **ChatGPT-Style Layout**: Left sidebar, main chat area, right information dock
- **Dark Cyber-Intel Theme**: Professional dark mode with blue accents
- **Project Management**: Organize queries into folders/projects
- **Real-time Processing**: Visual feedback for file upload and processing stages
- **Citation Preview**: Click citations to view PDF pages, image regions, or audio timestamps
- **Responsive Design**: Mobile-friendly with collapsible sidebar

### Technical Features
- **React 18** + **TypeScript** + **Vite**
- **React Router** for navigation
- **React Query** for data fetching
- **Zustand** for UI state management
- **Tailwind CSS** for styling
- **Mock Services** for realistic demo flows

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage Guide

### Creating a New Query

1. Click **"New Intelligence Query"** in the sidebar
2. Type your question in the composer
3. Optionally upload files (PDF, images, audio, video)
4. Press **Send** or **Cmd/Ctrl+Enter**

### Uploading Files

Files can be uploaded in three ways:
- Click the upload button in the composer
- Drag and drop files into the chat area
- Click "Upload Files" in a project folder

Files go through these processing stages:
1. Uploading
2. Extracting (OCR, STT, frame extraction)
3. Chunking
4. Embedding
5. Indexing

### Understanding Responses

Each assistant response includes:
- **Message content**: Grounded answer based on retrieved context
- **Citations**: Numbered references [1][2][3] to source material
- **Confidence score**: Verification confidence percentage
- **Context accordion**: View exact chunks sent to LLM with token counts

### Agent Mode

Toggle **"Agent Mode"** in the header to enable multi-step reasoning:
- **Plan**: Break down the query into retrieval steps
- **Retrieve**: Fetch relevant context from indexed files
- **Generate**: Create grounded response
- **Verify**: Check confidence and re-retrieve if needed

View the agent timeline above assistant responses to see each step.

### Right Panel Tabs

- **Citations**: Source references with preview capability
- **Retrieval**: Top-k retrieved items with semantic and keyword scores
- **Context**: Exact context chunks with token counts
- **Cache**: Semantic cache hit/miss status

### Keyboard Shortcuts

- **Cmd/Ctrl+K**: Open command palette
- **Cmd/Ctrl+Enter**: Send message
- **Cmd/Ctrl+/**: Show keyboard shortcuts
- **Esc**: Close modals and dialogs

## Project Structure

```
src/
├── components/        # React components
│   ├── ChatArea.tsx   # Main chat interface
│   ├── Sidebar.tsx    # Left navigation panel
│   ├── RightDock.tsx  # Citations/Retrieval panel
│   └── CommandPalette.tsx
├── pages/            # Route pages
│   ├── Home.tsx      # Main chat page
│   ├── Settings.tsx  # Configuration page
│   └── Help.tsx      # Help documentation
├── services/         # Mock API layer
│   ├── mockApi.ts    # API functions
│   └── mockData.ts   # Sample data
├── store/            # Zustand state
│   └── useStore.ts   # UI state management
├── types/            # TypeScript types
│   └── index.ts
└── lib/              # Utilities
    └── utils.ts
```

## Mock Services

All backend operations are simulated with realistic delays:

- **Projects**: Create, rename, delete folders
- **Chats**: Manage conversation history
- **Files**: Upload with multi-stage processing
- **Messages**: Send queries with simulated retrieval
- **Settings**: Persist user preferences

To customize mock data, edit `src/services/mockData.ts`.

## Customization

### Color Theme

Edit `tailwind.config.js` to change the color scheme. Current theme uses:
- Background: Deep navy blue
- Primary: Bright blue accents
- Text: Light gray/white

### Mock Response Data

Edit `src/services/mockApi.ts` to customize:
- Citation data
- Retrieval items
- Context chunks
- Agent steps
- Cache behavior

### Processing Stages

Modify upload stages in `mockApi.uploadFile()`:
```typescript
const steps = ['uploading', 'extracting', 'chunking', 'embedding', 'indexing'];
```

## Accessibility

- All interactive elements have ARIA labels
- Keyboard navigation supported throughout
- Focus management for modals and dialogs
- Screen reader announcements for uploads

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Production Notes

This is a **frontend-only demo** with mock services. For production:

1. Replace mock API calls with real backend endpoints
2. Implement actual file processing pipelines
3. Add authentication and authorization
4. Set up proper error handling and logging
5. Implement real-time streaming for LLM responses
6. Add data persistence (currently in-memory only)

## License

MIT

## Credits

Built with React, TypeScript, Vite, Tailwind CSS, and modern web technologies.

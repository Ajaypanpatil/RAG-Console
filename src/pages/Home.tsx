import { Sidebar } from '../components/Sidebar';
import { ChatArea } from '../components/ChatArea';
import { RightDock } from '../components/RightDock';
import { CommandPalette } from '../components/CommandPalette';

export function Home() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <ChatArea />
      <RightDock />
      <CommandPalette />
    </div>
  );
}

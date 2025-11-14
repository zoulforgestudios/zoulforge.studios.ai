import { Home, MessageSquare, Zap, CheckSquare, Grid3x3, Newspaper, User, Shield } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'ai-modes', label: 'AI Modes', icon: Zap },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'apps', label: 'Apps', icon: Grid3x3 },
    { id: 'updates', label: 'Updates', icon: Newspaper },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'safety', label: 'Safety', icon: Shield },
  ];

  return (
    <aside className="w-64 h-screen bg-[var(--panel)] border-r border-[var(--stroke)] flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-[var(--stroke)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--glow)] flex items-center justify-center">
            <span className="text-sm">Z</span>
          </div>
          <span className="text-[var(--text)]">ZoulForge</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-[var(--elevated)] text-[var(--accent)] shadow-[0_0_20px_rgba(138,92,255,0.15)]'
                  : 'text-[var(--muted)] hover:bg-[var(--elevated)] hover:text-[var(--text)]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

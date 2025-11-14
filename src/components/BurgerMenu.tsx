import { Home, MessageSquare, Zap, CheckSquare, Grid3x3, Newspaper, User, Shield, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface BurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function BurgerMenu({ isOpen, onClose, currentPage, onNavigate }: BurgerMenuProps) {
  const { profileStats } = useApp();

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

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed inset-y-0 left-0 w-80 bg-[var(--panel)] border-r border-[var(--accent)] shadow-[0_0_40px_rgba(138,92,255,0.3)] z-50 lg:hidden transform transition-transform duration-300">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--stroke)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--glow)] flex items-center justify-center">
                <span className="text-sm">Z</span>
              </div>
              <span className="text-[var(--text)]">ZoulForge</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--elevated)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text)]" />
            </button>
          </div>

          {/* Profile Preview */}
          <div className="p-6 border-b border-[var(--stroke)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--glow)]" />
              <div>
                <div className="text-[var(--text)]">User</div>
                <div className="text-sm text-[var(--muted)]">{profileStats.daysActive} days active</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[var(--elevated)] text-[var(--accent)] shadow-[0_0_20px_rgba(138,92,255,0.2)]'
                      : 'text-[var(--muted)] hover:bg-[var(--elevated)] hover:text-[var(--text)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}

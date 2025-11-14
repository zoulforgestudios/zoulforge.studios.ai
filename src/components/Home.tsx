import { MessageSquare, Zap, Grid3x3, Mic, Shield, Sparkles, CheckSquare, Newspaper } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { profileStats } = useApp();

  const quickActions = [
    { id: 'chat', label: 'Open Chat', icon: MessageSquare, color: '#8a5cff' },
    { id: 'ai-modes', label: 'AI Modes', icon: Zap, color: '#ff6b9d' },
    { id: 'apps', label: 'Holographic Apps', icon: Grid3x3, color: '#2ed573' },
  ];

  const features = [
    { title: 'Voice Recognition', description: 'Wake with "Zoul"', icon: Mic },
    { title: 'AI Chat', description: 'Intelligent conversations', icon: MessageSquare },
    { title: '12 AI Modes', description: 'Specialized assistants', icon: Zap },
    { title: 'Task Planner', description: 'Organize your day', icon: CheckSquare },
    { title: 'Zoulverse Updates', description: 'Latest news & stories', icon: Newspaper },
    { title: 'Safety Shield', description: 'Protection mode', icon: Shield },
  ];

  return (
    <div className="min-h-full overflow-auto">
      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 overflow-hidden">
        {/* Glowing Orb Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--glow)] opacity-20 blur-3xl animate-pulse" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--glow)] shadow-[0_0_60px_rgba(138,92,255,0.5)] flex items-center justify-center animate-pulse">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-[var(--text)] mb-4">ZoulForge</h1>
          <p className="text-xl text-[var(--muted)] mb-12">
            Your AI Core. Your Modes. Your Universe.
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => onNavigate(action.id)}
                  className="group p-6 bg-[var(--panel)] hover:bg-[var(--elevated)] border border-[var(--stroke)] rounded-2xl transition-all hover:shadow-[0_0_30px_rgba(138,92,255,0.2)] hover:border-[var(--accent)]"
                  style={{ ['--hover-color' as string]: action.color }}
                >
                  <Icon className="w-8 h-8 mx-auto mb-3 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
                  <div className="text-[var(--text)]">{action.label}</div>
                </button>
              );
            })}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 text-sm text-[var(--muted)]">
            <div>
              <div className="text-2xl text-[var(--accent)] mb-1">{profileStats.tasksCompleted}</div>
              <div>Tasks Completed</div>
            </div>
            <div className="w-px h-12 bg-[var(--stroke)]" />
            <div>
              <div className="text-2xl text-[var(--accent)] mb-1">{profileStats.aiModesUsed}</div>
              <div>AI Modes Used</div>
            </div>
            <div className="w-px h-12 bg-[var(--stroke)]" />
            <div>
              <div className="text-2xl text-[var(--accent)] mb-1">{profileStats.daysActive}</div>
              <div>Days Active</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl hover:border-[var(--accent)] transition-all"
              >
                <Icon className="w-10 h-10 text-[var(--accent)] mb-4" />
                <h3 className="text-[var(--text)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--muted)]">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <div className="p-8 bg-gradient-to-br from-[var(--panel)] to-[var(--elevated)] border border-[var(--accent)] rounded-3xl shadow-[0_0_40px_rgba(138,92,255,0.15)]">
          <h2 className="text-[var(--text)] mb-4">Ready to Begin?</h2>
          <p className="text-[var(--muted)] mb-6">
            Explore the full power of ZoulForge AI with multi-mode activation, voice control, and holographic experiences.
          </p>
          <button
            onClick={() => onNavigate('chat')}
            className="px-8 py-3 bg-[var(--accent)] hover:bg-[var(--glow)] text-white rounded-xl transition-all shadow-[0_0_20px_rgba(138,92,255,0.3)]"
          >
            Start Chat
          </button>
        </div>
      </section>
    </div>
  );
}

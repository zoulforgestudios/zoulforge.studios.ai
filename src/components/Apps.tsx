import { MessageSquare, Image, Map, CheckSquare, Newspaper, Users, BookOpen, Sparkles } from 'lucide-react';

interface AppsProps {
  onNavigate: (page: string) => void;
}

export function Apps({ onNavigate }: AppsProps) {
  const apps = [
    { id: 'chat', name: 'Zoul Chat', icon: MessageSquare, color: '#8a5cff', description: 'AI conversation hub' },
    { id: 'ai-modes', name: 'AI Modes', icon: Sparkles, color: '#ff6b9d', description: '12 specialized AIs' },
    { id: 'tasks', name: 'Task Planner', icon: CheckSquare, color: '#2ed573', description: 'Organize your day' },
    { id: 'map', name: 'Holographic Map', icon: Map, color: '#1e90ff', description: 'Location visualization' },
    { id: 'updates', name: 'Zoulverse Stories', icon: Newspaper, color: '#ffa502', description: 'News & updates' },
    { id: 'story', name: 'Story Archive', icon: BookOpen, color: '#9b59b6', description: 'Lore & chapters' },
    { id: 'safety', name: 'Safety Center', icon: Users, color: '#e74c3c', description: 'Emergency contacts' },
    { id: 'profile', name: 'Media Vault', icon: Image, color: '#3498db', description: 'Your content' },
  ];

  return (
    <div className="min-h-full overflow-auto p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-[var(--text)] mb-2">Holographic Apps</h2>
          <p className="text-[var(--muted)]">
            Access all ZoulForge applications
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => onNavigate(app.id)}
                className="group relative p-6 bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl hover:border-[var(--accent)] transition-all overflow-hidden"
              >
                {/* Hover glow effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity blur-2xl"
                  style={{ backgroundColor: app.color }}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(138,92,255,0.3)]"
                    style={{ backgroundColor: `${app.color}20`, border: `2px solid ${app.color}` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: app.color }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-[var(--text)] mb-2">{app.name}</h3>
                  <p className="text-sm text-[var(--muted)]">{app.description}</p>

                  {/* Launch indicator */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-xs text-[var(--accent)]">Launch →</div>
                  </div>
                </div>

                {/* Border glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    boxShadow: `0 0 20px ${app.color}40`,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

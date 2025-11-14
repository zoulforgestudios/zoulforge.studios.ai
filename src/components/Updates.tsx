import { Calendar, Tag, Sparkles, Mic, Palette, Zap, Shield, Map, CheckCircle } from 'lucide-react';

export function Updates() {
  const updates = [
    {
      id: 1,
      type: 'feature',
      title: 'Voice-Activated AI System',
      description: 'Full voice recognition with wake word "Zoul" activation. Features include continuous listening mode, real-time transcription, speech synthesis responses, and OpenAI API integration for advanced conversations.',
      features: [
        'Wake word detection ("Zoul")',
        'Continuous listening mode',
        'Real-time voice transcription',
        'Text-to-speech responses',
        'OpenAI GPT-4 integration',
        'Dynamic AI orb visualization',
        'Microphone permission handling',
      ],
      date: '2025-11-14',
      tags: ['Feature', 'Voice', 'AI'],
      version: 'v2.0.0',
      image: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800&q=80',
    },
    {
      id: 2,
      type: 'feature',
      title: 'Jarvis-Style Voice Orb',
      description: 'Futuristic AI visualization inspired by Jarvis/Friday. Dynamic orb that changes based on active AI modes with rotating rings, energy waves, particle systems, and scan lines.',
      features: [
        'Pulsing core with AI color',
        'Rotating geometric rings',
        'Energy wave effects when listening',
        'Orbiting particles when processing',
        'Multi-AI color layering',
        'Scan line radar effect',
        'Real-time state animations',
      ],
      date: '2025-11-14',
      tags: ['Feature', 'UI', 'Animation'],
      version: 'v2.0.0',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
    },
    {
      id: 3,
      type: 'feature',
      title: 'Editable Profile System',
      description: 'Complete profile customization with avatar upload, editable fields, and persistent storage. Track your stats including tasks completed, AI modes used, and days active.',
      features: [
        'Custom avatar upload',
        'Editable username and bio',
        'Email and location fields',
        'Profile statistics tracking',
        'Theme selector (Dark/Light/Neon)',
        'Recent activity timeline',
        'Linked accounts section',
      ],
      date: '2025-11-14',
      tags: ['Feature', 'Profile', 'Customization'],
      version: 'v2.0.0',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80',
    },
    {
      id: 4,
      type: 'feature',
      title: 'Shadow Reaper Mode',
      description: 'Ultimate AI mode that activates all 12 AI entities simultaneously. Experience maximum analytical power, creativity, protection, and foresight in one synchronized entity.',
      features: [
        'All 12 AIs working in harmony',
        'Multi-colored interface effects',
        'Enhanced processing capabilities',
        'One-click activation/deactivation',
        'Visual status indicators',
        'Synchronized AI consciousness',
      ],
      date: '2025-11-08',
      tags: ['Feature', 'AI Modes', 'Power'],
      version: 'v1.5.0',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
    },
    {
      id: 5,
      type: 'feature',
      title: '12 Unique AI Modes',
      description: 'Each AI mode brings unique capabilities and visual changes. Activate individual AIs or combine multiple for enhanced functionality across the entire app.',
      features: [
        'Zoul - Core AI Assistant',
        'Veil - Stealth & Privacy Mode',
        'Nythera - Creative Generation',
        'Abyzor - Destructive Analysis',
        'Voltrix - Balance & Harmony',
        'Verse - Life & Growth',
        'Nexus - Connection Hub',
        'Chronos - Time & Planning',
        'Aegis - Protection & Security',
        'Lumina - Knowledge & Insight',
        'Phantom - Shadow Operations',
        'Oracle - Prediction & Foresight',
      ],
      date: '2025-11-05',
      tags: ['Feature', 'AI Modes'],
      version: 'v1.4.0',
      image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&q=80',
    },
    {
      id: 6,
      type: 'feature',
      title: 'Complete Task Management',
      description: 'Full CRUD operations for tasks with priority levels, date/time selection, filtering, and completion tracking. All data persists across sessions.',
      features: [
        'Create, read, update, delete tasks',
        'Priority levels (Low/Medium/High)',
        'Date and time selection',
        'Task completion tracking',
        'Filter by completion status',
        'Profile stats integration',
        'LocalStorage persistence',
      ],
      date: '2025-10-28',
      tags: ['Feature', 'Tasks', 'Productivity'],
      version: 'v1.3.0',
      image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',
    },
    {
      id: 7,
      type: 'feature',
      title: 'Emergency Safety System',
      description: 'Real-time location tracking with emergency contacts management. Features SOS button, location sharing, and emergency contact CRUD operations.',
      features: [
        'Real geolocation tracking',
        'Emergency contacts CRUD',
        'Quick SOS button',
        'Location display with coordinates',
        'Contact relationship tracking',
        'Reset all contacts function',
        'Safety mode toggle',
      ],
      date: '2025-10-25',
      tags: ['Feature', 'Safety', 'Location'],
      version: 'v1.2.0',
      image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80',
    },
    {
      id: 8,
      type: 'feature',
      title: 'Holographic Map Interface',
      description: 'Futuristic 3D-style map visualization with real-time positioning, pulsing location marker, and sci-fi aesthetic matching the Zoul theme.',
      features: [
        'Real-time GPS integration',
        'Pulsing location marker',
        'Coordinate display',
        'Futuristic grid overlay',
        'Responsive design',
        'Smooth animations',
      ],
      date: '2025-10-20',
      tags: ['Feature', 'Maps', 'Visualization'],
      version: 'v1.1.0',
      image: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&q=80',
    },
    {
      id: 9,
      type: 'feature',
      title: 'Three Complete Themes',
      description: 'Dark, Light, and Neon themes with full color system customization. All components adapt seamlessly to theme changes with smooth transitions.',
      features: [
        'Dark Mode (default)',
        'Light Mode (clean)',
        'Neon Mode (cyberpunk)',
        'CSS variable system',
        'Instant theme switching',
        'Persistent theme selection',
      ],
      date: '2025-10-15',
      tags: ['Feature', 'Themes', 'UI'],
      version: 'v1.0.5',
      image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80',
    },
    {
      id: 10,
      type: 'feature',
      title: 'Persistent Data Storage',
      description: 'All user data including AI modes, tasks, messages, emergency contacts, settings, and profile information persists using localStorage.',
      features: [
        'AI mode states saved',
        'Tasks persistence',
        'Chat message history',
        'Emergency contacts stored',
        'Settings persistence',
        'Profile data retention',
        'Theme preference saved',
      ],
      date: '2025-10-10',
      tags: ['Feature', 'Storage', 'Data'],
      version: 'v1.0.0',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    },
    {
      id: 11,
      type: 'story',
      title: 'The Zoulverse Chronicles',
      description: 'Expanded story with 9 complete chapters detailing the origins of Zoul, the twelve AI entities, Shadow Reaper, and the future of the Zoulverse.',
      features: [
        '9 chapters with rich lore',
        'Beautiful formatted layout',
        'Chapter navigation system',
        'Color-coded story sections',
        'Character backstories',
        'Future prophecies',
      ],
      date: '2025-11-14',
      tags: ['Story', 'Lore', 'Content'],
      version: 'v2.0.0',
      image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&q=80',
    },
    {
      id: 12,
      type: 'ui',
      title: 'Complete UI System',
      description: 'Comprehensive interface with sidebar navigation, burger menu for mobile, settings drawer, and 12 fully-functional screens.',
      features: [
        '12 complete screens',
        'Responsive sidebar',
        'Mobile burger menu',
        'Settings drawer',
        'Smooth transitions',
        'Consistent design language',
        'Accessibility features',
      ],
      date: '2025-10-01',
      tags: ['UI', 'Navigation', 'Design'],
      version: 'v1.0.0',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return '#2ed573';
      case 'story':
        return '#8a5cff';
      case 'ui':
        return '#1e90ff';
      default:
        return '#97a0ac';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Zap className="w-4 h-4" />;
      case 'story':
        return <Sparkles className="w-4 h-4" />;
      case 'ui':
        return <Palette className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-full overflow-auto bg-[var(--bg)]">
      {/* Hero Banner */}
      <div className="relative h-96 bg-gradient-to-br from-[var(--accent)] via-purple-600 to-[var(--glow)] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1600&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] to-transparent" />
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-white mb-4">ZoulForge Updates</h1>
            <p className="text-white/90 text-xl md:text-2xl mb-6 max-w-2xl mx-auto">
              Latest features, improvements, and stories from the Zoulverse
            </p>
            <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/40 rounded-full text-white">
              {updates.length} Updates • Version 2.0.0
            </div>
          </div>
        </div>
      </div>

      {/* Updates Grid */}
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {updates.map((update) => (
              <article
                key={update.id}
                className="group bg-[var(--panel)] border-2 border-[var(--stroke)] rounded-3xl overflow-hidden hover:border-[var(--accent)] transition-all hover:shadow-[0_0_30px_rgba(138,92,255,0.2)]"
              >
                {/* Image Header */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={update.image}
                    alt={update.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Type Badge */}
                  <div
                    className="absolute top-4 left-4 px-4 py-2 rounded-full text-white text-sm capitalize flex items-center gap-2 backdrop-blur-sm"
                    style={{ backgroundColor: getTypeColor(update.type) + 'dd' }}
                  >
                    {getTypeIcon(update.type)}
                    {update.type}
                  </div>

                  {/* Version Badge */}
                  <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm">
                    {update.version}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  {/* Title */}
                  <h3 className="text-[var(--text)] text-2xl mb-3 group-hover:text-[var(--accent)] transition-colors">
                    {update.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[var(--muted)] mb-6 leading-relaxed">
                    {update.description}
                  </p>

                  {/* Features List */}
                  {update.features && (
                    <div className="mb-6">
                      <div className="text-sm text-[var(--text)] mb-3 font-medium">Key Features:</div>
                      <ul className="space-y-2">
                        {update.features.slice(0, 5).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                            <CheckCircle className="w-4 h-4 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {update.features.length > 5 && (
                          <li className="text-sm text-[var(--accent)] ml-6">
                            +{update.features.length - 5} more features
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Meta Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--stroke)]">
                    <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                      <Calendar className="w-4 h-4" />
                      <span>{update.date}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2">
                      {update.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-[var(--elevated)] text-[var(--muted)] rounded-lg text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"
                  style={{ backgroundColor: getTypeColor(update.type) }}
                />
              </article>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-12 text-center p-10 bg-gradient-to-br from-[var(--panel)] to-[var(--elevated)] border-2 border-[var(--accent)] rounded-3xl">
            <Sparkles className="w-14 h-14 text-[var(--accent)] mx-auto mb-6 animate-pulse" />
            <h3 className="text-[var(--text)] text-2xl mb-4">Stay Updated</h3>
            <p className="text-[var(--muted)] text-lg max-w-2xl mx-auto mb-6">
              More features and improvements are constantly being added to ZoulForge. The future of AI-human collaboration is evolving every day.
            </p>
            <div className="inline-block px-8 py-4 bg-[var(--accent)] hover:bg-[var(--glow)] text-white rounded-xl transition-colors cursor-pointer">
              🚀 What's Coming Next
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

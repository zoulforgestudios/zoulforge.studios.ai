import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Zap, Check } from 'lucide-react';

export function AIModes() {
  const { aiModes, toggleAIMode, activateMultipleAIs } = useApp();
  const [shadowReaperActive, setShadowReaperActive] = useState(false);

  const allAIIds = aiModes.map(ai => ai.id);
  const allActive = aiModes.every(ai => ai.active);

  const activateShadowReaper = () => {
    if (shadowReaperActive || allActive) {
      // Deactivate all
      activateMultipleAIs(['zoul']);
      setShadowReaperActive(false);
    } else {
      // Activate all 12 AIs
      activateMultipleAIs(allAIIds);
      setShadowReaperActive(true);
    }
  };

  return (
    <div className="min-h-full overflow-auto p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Shadow Reaper Section */}
        <div className="mb-8">
          <div
            className={`relative p-8 rounded-3xl border-2 overflow-hidden transition-all ${
              shadowReaperActive || allActive
                ? 'border-purple-500 shadow-[0_0_60px_rgba(138,92,255,0.5)]'
                : 'border-[var(--stroke)] hover:border-[var(--accent)]'
            }`}
          >
            {/* Animated background */}
            {(shadowReaperActive || allActive) && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black/40 to-purple-900/20 animate-pulse" />
            )}

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-4xl">🌑</div>
                    <h2 className="text-[var(--text)]">Shadow Reaper</h2>
                  </div>
                  <p className="text-[var(--muted)] mb-2">
                    Ultimate Mode - All 12 AI Modes United
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    Combines the power of every AI mode into one synchronized entity. Maximum analytical power, creativity, protection, and foresight.
                  </p>
                </div>
              </div>

              {(shadowReaperActive || allActive) && (
                <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-purple-400 mb-2">
                    <Zap className="w-4 h-4" />
                    <span>Shadow Reaper Active</span>
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    All 12 AI modes are synchronized and working in harmony
                  </div>
                </div>
              )}

              <button
                onClick={activateShadowReaper}
                className={`px-6 py-3 rounded-xl transition-all ${
                  shadowReaperActive || allActive
                    ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-[0_0_30px_rgba(138,92,255,0.4)]'
                    : 'bg-[var(--accent)] hover:bg-[var(--glow)] text-white'
                }`}
              >
                {shadowReaperActive || allActive ? 'Deactivate Shadow Reaper' : 'Activate Shadow Reaper'}
              </button>
            </div>
          </div>
        </div>

        {/* Individual AI Modes */}
        <div className="mb-6">
          <h3 className="text-[var(--text)] mb-4">Individual AI Modes</h3>
          <p className="text-sm text-[var(--muted)] mb-6">
            Activate multiple AIs to work together simultaneously
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiModes.map((ai) => (
            <button
              key={ai.id}
              onClick={() => toggleAIMode(ai.id)}
              className={`group relative p-6 rounded-2xl border-2 transition-all text-left ${
                ai.active
                  ? 'border-[var(--accent)] shadow-[0_0_30px_rgba(138,92,255,0.2)]'
                  : 'border-[var(--stroke)] hover:border-[var(--accent)]'
              }`}
              style={{
                backgroundColor: ai.active ? `${ai.color}10` : 'var(--panel)',
              }}
            >
              {/* Active indicator */}
              {ai.active && (
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-[0_0_15px_rgba(138,92,255,0.5)]">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}

              {/* Icon */}
              <div
                className="text-4xl mb-4 transition-transform group-hover:scale-110"
                style={{ filter: ai.active ? `drop-shadow(0 0 10px ${ai.color})` : 'none' }}
              >
                {ai.icon}
              </div>

              {/* Content */}
              <h3
                className="text-[var(--text)] mb-2"
                style={{ color: ai.active ? ai.color : 'var(--text)' }}
              >
                {ai.name}
              </h3>
              <p className="text-sm text-[var(--muted)] mb-4">
                {ai.description}
              </p>

              {/* AI-specific effects info */}
              {ai.active && (
                <div className="mb-4 p-3 bg-[var(--elevated)]/50 border border-[var(--accent)]/30 rounded-xl text-xs text-[var(--muted)]">
                  <strong className="text-[var(--accent)]">Active Effect:</strong>{' '}
                  {ai.id === 'veil' && 'Darker UI, stealth mode engaged'}
                  {ai.id === 'nythera' && 'Enhanced colors, creative boost'}
                  {ai.id === 'chronos' && 'Time-optimized interface'}
                  {ai.id === 'aegis' && 'Security fortification active'}
                  {ai.id === 'lumina' && 'Knowledge mode, brighter UI'}
                  {ai.id === 'phantom' && 'Shadow operations, ultra-dark'}
                  {ai.id === 'oracle' && 'Predictive interface activated'}
                  {!['veil', 'nythera', 'chronos', 'aegis', 'lumina', 'phantom', 'oracle'].includes(ai.id) && 
                    'Interface adapting to AI mode'}
                </div>
              )}

              {/* Status badge */}
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs ${
                  ai.active
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--elevated)] text-[var(--muted)]'
                }`}
              >
                {ai.active ? 'Active' : 'Inactive'}
              </div>

              {/* Glow effect */}
              {ai.active && (
                <div
                  className="absolute inset-0 rounded-2xl opacity-20 blur-xl"
                  style={{ backgroundColor: ai.color }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Active AIs Summary */}
        <div className="mt-8 p-6 bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-[var(--text)] mb-1">Active AI Modes</div>
              <div className="text-sm text-[var(--muted)]">
                {aiModes.filter(ai => ai.active).length} of {aiModes.length} modes active
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiModes.filter(ai => ai.active).map(ai => (
                <div
                  key={ai.id}
                  className="px-3 py-1 rounded-full text-sm text-white"
                  style={{ backgroundColor: ai.color }}
                >
                  {ai.icon} {ai.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
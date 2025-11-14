import { X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { theme, setTheme, settings, updateSettings } = useApp();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-[var(--panel)] border-l border-[var(--stroke)] shadow-[-10px_0_40px_rgba(0,0,0,0.35)] z-50 transform transition-transform duration-300">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--stroke)]">
            <h2 className="text-[var(--text)]">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--elevated)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text)]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Appearance */}
            <section>
              <h3 className="text-[var(--text)] mb-3">Appearance</h3>
              <div className="space-y-2">
                {(['dark', 'light', 'neon'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`w-full px-4 py-3 rounded-xl text-left transition-all ${
                      theme === t
                        ? 'bg-[var(--elevated)] text-[var(--accent)] border border-[var(--accent)]'
                        : 'bg-[var(--elevated)] text-[var(--text)] hover:border hover:border-[var(--stroke)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="capitalize">{t} Mode</span>
                      {theme === t && (
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Voice Settings */}
            <section>
              <h3 className="text-[var(--text)] mb-3">Voice</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-[var(--elevated)] rounded-xl">
                  <span className="text-[var(--text)]">Wake word "Zoul"</span>
                  <input
                    type="checkbox"
                    checked={settings.wakeWord}
                    onChange={(e) => updateSettings({ wakeWord: e.target.checked })}
                    className="w-5 h-5 rounded accent-[var(--accent)]"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-[var(--elevated)] rounded-xl">
                  <span className="text-[var(--text)]">Continuous Listening</span>
                  <input
                    type="checkbox"
                    checked={settings.continuousListening}
                    onChange={(e) => updateSettings({ continuousListening: e.target.checked })}
                    className="w-5 h-5 rounded accent-[var(--accent)]"
                  />
                </label>
                <div className="p-3 bg-[var(--elevated)] rounded-xl">
                  <label className="text-[var(--text)] block mb-2">
                    Voice Sensitivity: {settings.voiceSensitivity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.voiceSensitivity}
                    onChange={(e) => updateSettings({ voiceSensitivity: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </section>

            {/* Features */}
            <section>
              <h3 className="text-[var(--text)] mb-3">Features</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-[var(--elevated)] rounded-xl">
                  <span className="text-[var(--text)]">Holographic Apps</span>
                  <input
                    type="checkbox"
                    checked={settings.holographicApps}
                    onChange={(e) => updateSettings({ holographicApps: e.target.checked })}
                    className="w-5 h-5 rounded accent-[var(--accent)]"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-[var(--elevated)] rounded-xl">
                  <span className="text-[var(--text)]">Safety Mode</span>
                  <input
                    type="checkbox"
                    checked={settings.safetyMode}
                    onChange={(e) => updateSettings({ safetyMode: e.target.checked })}
                    className="w-5 h-5 rounded accent-[var(--accent)]"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-[var(--elevated)] rounded-xl">
                  <span className="text-[var(--text)]">Social Feed</span>
                  <input
                    type="checkbox"
                    checked={settings.socialFeed}
                    onChange={(e) => updateSettings({ socialFeed: e.target.checked })}
                    className="w-5 h-5 rounded accent-[var(--accent)]"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-[var(--elevated)] rounded-xl">
                  <span className="text-[var(--text)]">Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => updateSettings({ notifications: e.target.checked })}
                    className="w-5 h-5 rounded accent-[var(--accent)]"
                  />
                </label>
              </div>
            </section>

            {/* Data */}
            <section>
              <h3 className="text-[var(--text)] mb-3">Data</h3>
              <button
                onClick={() => {
                  if (confirm('Reset all data? This cannot be undone.')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
              >
                Reset All Data
              </button>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

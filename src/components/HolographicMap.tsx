import { useState, useEffect } from 'react';
import { MapPin, ZoomIn, ZoomOut, Locate, Eye, EyeOff } from 'lucide-react';

export function HolographicMap() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [zoom, setZoom] = useState(15);
  const [maskMode, setMaskMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const refreshLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoading(false);
      }
    );
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      {/* Map Area */}
      <div className="flex-1 relative bg-[var(--elevated)]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[var(--muted)]">Loading location...</div>
          </div>
        ) : location ? (
          <>
            {/* Holographic Grid Effect */}
            <div className="absolute inset-0">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    linear-gradient(var(--accent)22 1px, transparent 1px),
                    linear-gradient(90deg, var(--accent)22 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px',
                }}
              />
            </div>

            {/* Map Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              {maskMode ? (
                <div className="text-center">
                  <EyeOff className="w-16 h-16 text-[var(--accent)] mx-auto mb-4" />
                  <div className="text-[var(--text)] mb-2">Location Masked</div>
                  <div className="text-sm text-[var(--muted)]">Your location is hidden</div>
                </div>
              ) : (
                <div className="relative">
                  {/* Pulsing Location Dot */}
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full bg-[var(--accent)] shadow-[0_0_30px_var(--accent)] animate-pulse" />
                    <div className="absolute inset-0 w-4 h-4 rounded-full bg-[var(--accent)] animate-ping" />
                  </div>

                  {/* Concentric Circles */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-32 h-32 rounded-full border-2 border-[var(--accent)] opacity-30 animate-pulse" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-64 h-64 rounded-full border border-[var(--accent)] opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>

                  {/* Holographic Text */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-8 text-center">
                    <div className="text-[var(--accent)] mb-1 animate-pulse">Current Location</div>
                    <div className="text-sm text-[var(--muted)]">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => setZoom(Math.min(zoom + 1, 20))}
                className="p-3 bg-[var(--panel)] border border-[var(--stroke)] rounded-xl hover:border-[var(--accent)] transition-all"
              >
                <ZoomIn className="w-5 h-5 text-[var(--text)]" />
              </button>
              <button
                onClick={() => setZoom(Math.max(zoom - 1, 1))}
                className="p-3 bg-[var(--panel)] border border-[var(--stroke)] rounded-xl hover:border-[var(--accent)] transition-all"
              >
                <ZoomOut className="w-5 h-5 text-[var(--text)]" />
              </button>
              <button
                onClick={refreshLocation}
                className="p-3 bg-[var(--panel)] border border-[var(--stroke)] rounded-xl hover:border-[var(--accent)] transition-all"
              >
                <Locate className="w-5 h-5 text-[var(--text)]" />
              </button>
            </div>

            {/* Map Link */}
            {!maskMode && (
              <div className="absolute bottom-4 left-4">
                <a
                  href={`https://maps.google.com/?q=${location.lat},${location.lng}&z=${zoom}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--glow)] text-white rounded-xl transition-all text-sm flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Open in Google Maps
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
              <div className="text-[var(--text)] mb-2">Location Unavailable</div>
              <div className="text-sm text-[var(--muted)] mb-4">
                Enable location services to use this feature
              </div>
              <button
                onClick={refreshLocation}
                className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--glow)] text-white rounded-xl transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="w-full md:w-96 p-6 bg-[var(--panel)] border-l border-[var(--stroke)] overflow-auto">
        <h3 className="text-[var(--text)] mb-4">Map Controls</h3>

        {/* Mask Mode Toggle */}
        <div className="mb-6 p-4 bg-[var(--elevated)] rounded-xl">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              {maskMode ? <EyeOff className="w-5 h-5 text-[var(--accent)]" /> : <Eye className="w-5 h-5 text-[var(--muted)]" />}
              <div>
                <div className="text-[var(--text)]">Mask Mode</div>
                <div className="text-sm text-[var(--muted)]">Hide your location</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={maskMode}
              onChange={(e) => setMaskMode(e.target.checked)}
              className="w-5 h-5 rounded accent-[var(--accent)]"
            />
          </label>
        </div>

        {/* Location Info */}
        {location && !maskMode && (
          <div className="mb-6">
            <div className="text-sm text-[var(--muted)] mb-2">Coordinates</div>
            <div className="p-3 bg-[var(--elevated)] rounded-xl">
              <div className="text-[var(--text)] mb-1">
                Latitude: {location.lat.toFixed(6)}
              </div>
              <div className="text-[var(--text)]">
                Longitude: {location.lng.toFixed(6)}
              </div>
            </div>
          </div>
        )}

        {/* Zoom Level */}
        <div className="mb-6">
          <div className="text-sm text-[var(--muted)] mb-2">Zoom Level</div>
          <div className="p-3 bg-[var(--elevated)] rounded-xl">
            <input
              type="range"
              min="1"
              max="20"
              value={zoom}
              onChange={(e) => setZoom(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-[var(--text)] mt-2">{zoom}x</div>
          </div>
        </div>

        {/* Features */}
        <div>
          <div className="text-sm text-[var(--muted)] mb-2">Features</div>
          <div className="space-y-2 text-sm text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span>Real-time positioning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span>Holographic visualization</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span>Privacy mask mode</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span>Google Maps integration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

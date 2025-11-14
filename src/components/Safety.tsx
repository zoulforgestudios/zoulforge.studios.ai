import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { AlertCircle, Phone, MapPin, Plus, Trash2, Shield } from 'lucide-react';

export function Safety() {
  const { emergencyContacts, addEmergencyContact, deleteEmergencyContact, resetEmergencyContacts } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  // Get user's location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    addEmergencyContact(formData);
    setFormData({ name: '', phone: '', relationship: '' });
    setShowForm(false);
  };

  const handleSOS = () => {
    if (emergencyContacts.length === 0) {
      alert('Please add emergency contacts first');
      return;
    }

    const message = location
      ? `SOS Alert! Location: https://maps.google.com/?q=${location.lat},${location.lng}`
      : 'SOS Alert! Unable to get location.';

    alert(`Emergency alert would be sent to ${emergencyContacts.length} contact(s):\n\n${message}`);
  };

  return (
    <div className="min-h-full overflow-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-red-500/30 rounded-3xl">
          <div className="flex items-start gap-4">
            <Shield className="w-12 h-12 text-red-400 flex-shrink-0" />
            <div>
              <h2 className="text-[var(--text)] mb-2">Safety Center</h2>
              <p className="text-[var(--muted)] text-sm">
                Emergency contacts and quick SOS features. Your safety is our priority.
              </p>
            </div>
          </div>
        </div>

        {/* Quick SOS Button */}
        <div className="mb-8">
          <button
            onClick={handleSOS}
            className="w-full p-8 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-3xl transition-all shadow-[0_0_40px_rgba(239,68,68,0.3)] active:scale-95"
          >
            <AlertCircle className="w-16 h-16 mx-auto mb-3" />
            <div className="text-xl mb-2">Send SOS Alert</div>
            <div className="text-sm opacity-80">
              Press to alert all emergency contacts
            </div>
          </button>
        </div>

        {/* Current Location */}
        {location && (
          <div className="mb-8 p-6 bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl">
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-6 h-6 text-[var(--accent)] flex-shrink-0" />
              <div>
                <h3 className="text-[var(--text)] mb-1">Current Location</h3>
                <p className="text-sm text-[var(--muted)]">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
            <a
              href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-[var(--accent)] hover:bg-[var(--glow)] text-white rounded-xl transition-all text-sm"
            >
              View on Map
            </a>
          </div>
        )}

        {/* Emergency Contacts */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--text)]">Emergency Contacts</h3>
            <div className="flex gap-2">
              {emergencyContacts.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Reset all emergency contacts? This cannot be undone.')) {
                      resetEmergencyContacts();
                    }
                  }}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all text-sm"
                >
                  Reset All
                </button>
              )}
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--glow)] text-white rounded-xl transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Contact</span>
              </button>
            </div>
          </div>

          {/* Add Contact Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-6 bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contact name"
                    className="w-full px-4 py-2 bg-[var(--elevated)] text-[var(--text)] border border-[var(--stroke)] rounded-xl focus:outline-none focus:border-[var(--accent)] placeholder-[var(--muted)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2 bg-[var(--elevated)] text-[var(--text)] border border-[var(--stroke)] rounded-xl focus:outline-none focus:border-[var(--accent)] placeholder-[var(--muted)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-2">Relationship</label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="Family, Friend, etc."
                    className="w-full px-4 py-2 bg-[var(--elevated)] text-[var(--text)] border border-[var(--stroke)] rounded-xl focus:outline-none focus:border-[var(--accent)] placeholder-[var(--muted)]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--glow)] text-white rounded-xl transition-all"
                  >
                    Add Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-[var(--elevated)] hover:bg-[var(--stroke)] text-[var(--text)] rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Contacts List */}
          {emergencyContacts.length === 0 ? (
            <div className="text-center py-12 text-[var(--muted)] bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl">
              No emergency contacts added yet
            </div>
          ) : (
            <div className="space-y-3">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="group flex items-center justify-between p-4 bg-[var(--panel)] border border-[var(--stroke)] rounded-xl hover:border-[var(--accent)] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--glow)] flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-[var(--text)]">{contact.name}</div>
                      <div className="text-sm text-[var(--muted)]">{contact.phone}</div>
                      {contact.relationship && (
                        <div className="text-xs text-[var(--muted)]">{contact.relationship}</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEmergencyContact(contact.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Safety Guide */}
        <section className="p-6 bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl">
          <h3 className="text-[var(--text)] mb-4">Safety Guide</h3>
          <ul className="space-y-3 text-sm text-[var(--muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent)]">•</span>
              <span>Add trusted contacts who can respond quickly in emergencies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent)]">•</span>
              <span>Keep your location services enabled for accurate positioning</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent)]">•</span>
              <span>The SOS button sends your location to all emergency contacts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent)]">•</span>
              <span>Use Safety Mode in Settings for additional protection features</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

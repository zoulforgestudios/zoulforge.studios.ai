import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'dark' | 'light' | 'neon';

export interface AIMode {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  active: boolean;
}

export interface Task {
  id: string;
  title: string;
  date: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  aiMode?: string;
  timestamp: Date;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface Settings {
  wakeWord: boolean;
  continuousListening: boolean;
  voiceSensitivity: number;
  holographicApps: boolean;
  safetyMode: boolean;
  socialFeed: boolean;
  notifications: boolean;
}

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  aiModes: AIMode[];
  toggleAIMode: (id: string) => void;
  activateMultipleAIs: (ids: string[]) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  emergencyContacts: EmergencyContact[];
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  deleteEmergencyContact: (id: string) => void;
  resetEmergencyContacts: () => void;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  profileStats: {
    tasksCompleted: number;
    aiModesUsed: number;
    daysActive: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultAIModes: AIMode[] = [
  { id: 'zoul', name: 'Zoul', description: 'Core AI Assistant', color: '#8a5cff', icon: '🌟', active: true },
  { id: 'veil', name: 'Veil', description: 'Stealth & Privacy Mode', color: '#1a1f28', icon: '🌑', active: false },
  { id: 'nythera', name: 'Nythera', description: 'Creative Generation', color: '#ff6b9d', icon: '✨', active: false },
  { id: 'abyzor', name: 'Abyzor', description: 'Destructive Analysis', color: '#ff4757', icon: '💥', active: false },
  { id: 'voltrix', name: 'Voltrix', description: 'Balance & Harmony', color: '#ffa502', icon: '⚡', active: false },
  { id: 'verse', name: 'Verse', description: 'Life & Growth', color: '#2ed573', icon: '🌱', active: false },
  { id: 'nexus', name: 'Nexus', description: 'Connection Hub', color: '#1e90ff', icon: '🔗', active: false },
  { id: 'chronos', name: 'Chronos', description: 'Time & Planning', color: '#9b59b6', icon: '⏱️', active: false },
  { id: 'aegis', name: 'Aegis', description: 'Protection & Security', color: '#3498db', icon: '🛡️', active: false },
  { id: 'lumina', name: 'Lumina', description: 'Knowledge & Insight', color: '#f1c40f', icon: '💡', active: false },
  { id: 'phantom', name: 'Phantom', description: 'Shadow Operations', color: '#2c3e50', icon: '👁️', active: false },
  { id: 'oracle', name: 'Oracle', description: 'Prediction & Foresight', color: '#e67e22', icon: '🔮', active: false },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [aiModes, setAIModes] = useState<AIMode[]>(() => {
    const saved = localStorage.getItem('aiModes');
    return saved ? JSON.parse(saved) : defaultAIModes;
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('emergencyContacts');
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : {
      wakeWord: true,
      continuousListening: false,
      voiceSensitivity: 50,
      holographicApps: true,
      safetyMode: true,
      socialFeed: true,
      notifications: true,
    };
  });
  const [isListening, setIsListening] = useState(false);
  const [profileStats, setProfileStats] = useState(() => {
    const saved = localStorage.getItem('profileStats');
    return saved ? JSON.parse(saved) : {
      tasksCompleted: 0,
      aiModesUsed: 0,
      daysActive: 0,
    };
  });

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.style.setProperty('--bg', '#f5f7fa');
      root.style.setProperty('--panel', '#ffffff');
      root.style.setProperty('--elevated', '#f0f2f5');
      root.style.setProperty('--stroke', '#e1e4e8');
      root.style.setProperty('--text', '#1a1f28');
      root.style.setProperty('--muted', '#5f6775');
      root.style.setProperty('--accent', '#8a5cff');
      root.style.setProperty('--glow', '#5e39ff');
    } else if (theme === 'neon') {
      root.style.setProperty('--bg', '#000000');
      root.style.setProperty('--panel', '#0a0a0f');
      root.style.setProperty('--elevated', '#12121a');
      root.style.setProperty('--stroke', '#8a5cff');
      root.style.setProperty('--text', '#ffffff');
      root.style.setProperty('--muted', '#a8b0bf');
      root.style.setProperty('--accent', '#ff00ff');
      root.style.setProperty('--glow', '#00ffff');
    } else {
      root.style.setProperty('--bg', '#0e1015');
      root.style.setProperty('--panel', '#11141b');
      root.style.setProperty('--elevated', '#161b23');
      root.style.setProperty('--stroke', '#1a1f28');
      root.style.setProperty('--text', '#ebeff6');
      root.style.setProperty('--muted', '#97a0ac');
      root.style.setProperty('--accent', '#8a5cff');
      root.style.setProperty('--glow', '#5e39ff');
    }
  }, [theme]);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('aiModes', JSON.stringify(aiModes));
  }, [aiModes]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('emergencyContacts', JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('profileStats', JSON.stringify(profileStats));
  }, [profileStats]);

  // Track days active
  useEffect(() => {
    const today = new Date().toDateString();
    const lastActive = localStorage.getItem('lastActive');
    if (lastActive !== today) {
      localStorage.setItem('lastActive', today);
      setProfileStats(prev => ({ ...prev, daysActive: prev.daysActive + 1 }));
    }
  }, []);

  const toggleAIMode = (id: string) => {
    setAIModes(prev => {
      const updated = prev.map(mode =>
        mode.id === id ? { ...mode, active: !mode.active } : mode
      );
      
      // Track AI modes used
      const activeCount = updated.filter(m => m.active).length;
      setProfileStats(prev => ({ 
        ...prev, 
        aiModesUsed: Math.max(prev.aiModesUsed, activeCount) 
      }));
      
      return updated;
    });
  };

  const activateMultipleAIs = (ids: string[]) => {
    setAIModes(prev => {
      const updated = prev.map(mode => ({
        ...mode,
        active: ids.includes(mode.id)
      }));
      
      const activeCount = updated.filter(m => m.active).length;
      setProfileStats(prev => ({ 
        ...prev, 
        aiModesUsed: Math.max(prev.aiModesUsed, activeCount) 
      }));
      
      return updated;
    });
  };

  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    setTasks(prev => [...prev, { ...task, id: Date.now().toString(), completed: false }]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => {
      const updated = prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      
      // Track completed tasks
      const completedCount = updated.filter(t => t.completed).length;
      setProfileStats(prev => ({ 
        ...prev, 
        tasksCompleted: completedCount 
      }));
      
      return updated;
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, { ...message, id: Date.now().toString(), timestamp: new Date() }]);
  };

  const addEmergencyContact = (contact: Omit<EmergencyContact, 'id'>) => {
    setEmergencyContacts(prev => [...prev, { ...contact, id: Date.now().toString() }]);
  };

  const deleteEmergencyContact = (id: string) => {
    setEmergencyContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const resetEmergencyContacts = () => {
    setEmergencyContacts([]);
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        aiModes,
        toggleAIMode,
        activateMultipleAIs,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        messages,
        addMessage,
        emergencyContacts,
        addEmergencyContact,
        deleteEmergencyContact,
        resetEmergencyContacts,
        settings,
        updateSettings,
        isListening,
        setIsListening,
        profileStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

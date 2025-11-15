import { useState } from 'react';
import { useEffect } from "react";
import { AppProvider, useApp } from './contexts/AppContext';
import { useAIModeEffects } from './hooks/useAIModeEffects';
import { Home } from './components/Home';
import Chat from './components/Chat';
import { AIModes } from './components/AIModes';
import { Tasks } from './components/Tasks';
import { Apps } from './components/Apps';
import { Updates } from './components/Updates';
import { Profile } from './components/Profile';
import { Safety } from './components/Safety';
import { HolographicMap } from './components/HolographicMap';
import { ZoulverseStory } from './components/ZoulverseStory';
import { Sidebar } from './components/Sidebar';
import { BurgerMenu } from './components/BurgerMenu';
import { SettingsDrawer } from './components/SettingsDrawer';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { aiModes } = useApp();

  // Apply AI mode effects
  const activeAIs = aiModes.filter(ai => ai.active);
  useAIModeEffects(activeAIs);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={setCurrentPage} />;
      case 'chat': return <Chat />;
      case 'ai-modes': return <AIModes />;
      case 'tasks': return <Tasks />;
      case 'apps': return <Apps onNavigate={setCurrentPage} />;
      case 'updates': return <Updates />;
      case 'profile': return <Profile />;
      case 'safety': return <Safety />;
      case 'map': return <HolographicMap />;
      case 'story': return <ZoulverseStory />;
      default: return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">

      {/* 🔥 ConvAI Widget (React-Safe Placement) */}
      <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999 }}>
        <elevenlabs-convai agent-id="agent_9401ka3qb3xvf26tkbkajgd9c117"></elevenlabs-convai>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>

      {/* Mobile Burger Menu */}
      <BurgerMenu
        isOpen={isBurgerOpen}
        onClose={() => setIsBurgerOpen(false)}
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          setIsBurgerOpen(false);
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-[var(--stroke)] bg-[var(--panel)] flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBurgerOpen(true)}
              className="lg:hidden p-2 hover:bg-[var(--elevated)] rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-[var(--text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-[var(--text)]">
              {currentPage === 'home' && 'ZoulForge'}
              {currentPage === 'chat' && 'AI Chat'}
              {currentPage === 'ai-modes' && 'AI Modes'}
              {currentPage === 'tasks' && 'Task Planner'}
              {currentPage === 'apps' && 'Holographic Apps'}
              {currentPage === 'updates' && 'Zoulverse Updates'}
              {currentPage === 'profile' && 'Profile'}
              {currentPage === 'safety' && 'Safety Center'}
              {currentPage === 'map' && 'Holographic Map'}
              {currentPage === 'story' && 'Zoulverse Story'}
            </h1>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-[var(--elevated)] rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-[var(--text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0..." />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
export default function App() { return ( <AppProvider> <AppContent /> </AppProvider> ); }
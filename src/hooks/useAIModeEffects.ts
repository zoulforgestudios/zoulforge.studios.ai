import { useEffect } from 'react';
import { AIMode } from '../contexts/AppContext';

export function useAIModeEffects(activeAIs: AIMode[]) {
  useEffect(() => {
    const root = document.documentElement;

    if (activeAIs.length === 0) return;

    // Get primary active AI (first one)
    const primaryAI = activeAIs[0];

    // Apply AI-specific effects
    switch (primaryAI.id) {
      case 'veil':
        // Stealth mode - darker UI
        root.style.setProperty('--panel-opacity', '0.85');
        root.style.setProperty('--blur-amount', '10px');
        document.body.style.filter = 'contrast(0.95) brightness(0.9)';
        break;

      case 'nythera':
        // Creative mode - vibrant colors
        root.style.setProperty('--panel-opacity', '1');
        root.style.setProperty('--accent', primaryAI.color);
        document.body.style.filter = 'saturate(1.2) brightness(1.05)';
        break;

      case 'chronos':
        // Time mode - enhanced time displays
        root.style.setProperty('--accent', primaryAI.color);
        break;

      case 'aegis':
        // Security mode - fortified appearance
        root.style.setProperty('--accent', primaryAI.color);
        root.style.setProperty('--glow', primaryAI.color);
        break;

      case 'lumina':
        // Knowledge mode - brighter UI
        document.body.style.filter = 'brightness(1.1)';
        root.style.setProperty('--accent', primaryAI.color);
        break;

      case 'phantom':
        // Shadow mode - very dark
        document.body.style.filter = 'contrast(1.1) brightness(0.85)';
        break;

      case 'oracle':
        // Prediction mode - mystical feel
        root.style.setProperty('--accent', primaryAI.color);
        root.style.setProperty('--glow', primaryAI.color);
        break;

      default:
        // Default - apply primary AI color
        root.style.setProperty('--accent', primaryAI.color);
        document.body.style.filter = 'none';
    }

    // Shadow Reaper mode - all AIs active
    if (activeAIs.length >= 12) {
      document.body.style.filter = 'saturate(1.3) contrast(1.1) brightness(1.05)';
      root.style.setProperty('--accent', '#8a5cff');
      root.style.setProperty('--glow', '#ff00ff');
      
      // Add pulsing animation
      document.body.style.animation = 'shadowReaperPulse 3s ease-in-out infinite';
    }

    // Cleanup function
    return () => {
      root.style.setProperty('--panel-opacity', '1');
      root.style.setProperty('--blur-amount', '0px');
      document.body.style.filter = 'none';
      document.body.style.animation = 'none';
      
      // Reset accent color to default
      const savedTheme = localStorage.getItem('theme') || 'dark';
      if (savedTheme === 'dark') {
        root.style.setProperty('--accent', '#8a5cff');
        root.style.setProperty('--glow', '#5e39ff');
      }
    };
  }, [activeAIs]);
}

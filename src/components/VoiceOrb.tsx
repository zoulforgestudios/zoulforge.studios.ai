import { useEffect, useRef } from 'react';
import { AIMode } from '../contexts/AppContext';

interface VoiceOrbProps {
  isListening: boolean;
  isProcessing: boolean;
  activeAIs: AIMode[];
  primaryAI: AIMode;
}

export function VoiceOrb({ isListening, isProcessing, activeAIs, primaryAI }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      // Animation speed
      const speed = isListening ? 0.08 : 0.04;
      time += speed;

      const primaryColor = primaryAI.color;

      // CORE - Pulsing center
      const coreRadius = 15 + Math.sin(time * 2) * 3;
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
      coreGradient.addColorStop(0, '#ffffff');
      coreGradient.addColorStop(0.5, primaryColor);
      coreGradient.addColorStop(1, primaryColor + '80');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // INNER RING - Rotating segments
      const innerRingRadius = 50;
      const segments = activeAIs.length > 1 ? activeAIs.length : 6;
      
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2 + time;
        const segmentLength = Math.PI / (segments * 1.5);
        const currentAI = activeAIs[i % activeAIs.length] || primaryAI;
        const opacity = isListening ? 0.8 : 0.5;

        ctx.strokeStyle = currentAI.color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRingRadius, angle, angle + segmentLength);
        ctx.stroke();
      }

      // MIDDLE RING - Solid with gaps
      const middleRingRadius = 80;
      const gapCount = 8;
      
      for (let i = 0; i < gapCount; i++) {
        const angle = (i / gapCount) * Math.PI * 2 - time * 0.5;
        const segmentLength = (Math.PI * 2 / gapCount) * 0.7; // 70% arc, 30% gap
        const opacity = isListening ? 0.6 : 0.4;

        ctx.strokeStyle = primaryColor + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, middleRingRadius, angle, angle + segmentLength);
        ctx.stroke();
      }

      // OUTER RING - Thin rotating line
      const outerRingRadius = 110;
      const outerSegments = 12;
      
      for (let i = 0; i < outerSegments; i++) {
        const angle = (i / outerSegments) * Math.PI * 2 + time * 1.5;
        const segmentLength = Math.PI / (outerSegments * 2);
        const opacity = 0.3 + Math.sin(time * 2 + i) * 0.2;

        ctx.strokeStyle = primaryColor + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRingRadius, angle, angle + segmentLength);
        ctx.stroke();
      }

      // RADIAL LINES - Extending from center
      if (isListening) {
        const lineCount = 12;
        for (let i = 0; i < lineCount; i++) {
          const angle = (i / lineCount) * Math.PI * 2 + time * 0.5;
          const pulse = Math.sin(time * 3 + i) * 0.5 + 0.5;
          const startRadius = 20;
          const endRadius = 60 + pulse * 20;
          
          const startX = centerX + Math.cos(angle) * startRadius;
          const startY = centerY + Math.sin(angle) * startRadius;
          const endX = centerX + Math.cos(angle) * endRadius;
          const endY = centerY + Math.sin(angle) * endRadius;

          const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
          gradient.addColorStop(0, primaryColor + '80');
          gradient.addColorStop(1, primaryColor + '00');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }

      // ENERGY WAVES - When listening
      if (isListening) {
        for (let i = 0; i < 3; i++) {
          const waveRadius = 70 + i * 25 + (Math.sin(time * 2 + i * 2) * 8);
          const waveOpacity = (1 - i / 3) * 0.3;

          ctx.strokeStyle = primaryColor + Math.floor(waveOpacity * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 10]);
          ctx.lineDashOffset = -time * 20;
          ctx.beginPath();
          ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // PROCESSING INDICATORS - Orbiting particles
      if (isProcessing) {
        const particleCount = activeAIs.length > 1 ? activeAIs.length * 2 : 8;
        const orbitRadius = 130;

        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + time * 2;
          const x = centerX + Math.cos(angle) * orbitRadius;
          const y = centerY + Math.sin(angle) * orbitRadius;
          const particleAI = activeAIs[i % activeAIs.length] || primaryAI;

          // Particle glow
          const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 6);
          particleGradient.addColorStop(0, particleAI.color + 'ff');
          particleGradient.addColorStop(0.5, particleAI.color + 'cc');
          particleGradient.addColorStop(1, particleAI.color + '00');

          ctx.fillStyle = particleGradient;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();

          // Particle core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();

          // Connection line to center
          const gradient = ctx.createLinearGradient(x, y, centerX, centerY);
          gradient.addColorStop(0, particleAI.color + '40');
          gradient.addColorStop(1, particleAI.color + '00');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(centerX, centerY);
          ctx.stroke();
        }
      }

      // OUTER GLOW EFFECT
      const glowRadius = isListening ? 150 : 120;
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
      glowGradient.addColorStop(0, primaryColor + '00');
      glowGradient.addColorStop(0.7, primaryColor + '20');
      glowGradient.addColorStop(1, primaryColor + '00');

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // MULTI-AI MODE - Additional colored rings
      if (activeAIs.length > 1) {
        activeAIs.forEach((ai, index) => {
          if (index === 0) return; // Skip primary
          
          const aiRingRadius = 95 + (index * 5);
          const aiSegments = 6;
          
          for (let i = 0; i < aiSegments; i++) {
            const angle = (i / aiSegments) * Math.PI * 2 - time * (1 + index * 0.3);
            const segmentLength = Math.PI / (aiSegments * 2);
            const opacity = 0.3;

            ctx.strokeStyle = ai.color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(centerX, centerY, aiRingRadius, angle, angle + segmentLength);
            ctx.stroke();
          }
        });
      }

      // SCAN LINE EFFECT
      const scanAngle = time * 1.5;
      const scanGradient = ctx.createLinearGradient(
        centerX,
        centerY,
        centerX + Math.cos(scanAngle) * 120,
        centerY + Math.sin(scanAngle) * 120
      );
      scanGradient.addColorStop(0, primaryColor + '00');
      scanGradient.addColorStop(0.5, primaryColor + '30');
      scanGradient.addColorStop(1, primaryColor + '00');

      ctx.strokeStyle = scanGradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(scanAngle) * 120,
        centerY + Math.sin(scanAngle) * 120
      );
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, isProcessing, activeAIs, primaryAI]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="max-w-full"
        style={{ 
          filter: `drop-shadow(0 0 60px ${primaryAI.color}66)`,
        }}
      />

      {/* Additional glow container */}
      {isListening && (
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: `radial-gradient(circle, ${primaryAI.color}10, transparent 70%)`,
            transform: 'scale(1.5)',
          }}
        />
      )}
    </div>
  );
}

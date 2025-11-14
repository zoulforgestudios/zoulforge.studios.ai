import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Settings } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { VoiceOrb } from './VoiceOrb';

export function Chat() {
  const { messages, addMessage, aiModes, settings, isListening, setIsListening } = useApp();

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const continuousModeRef = useRef<boolean>(false);

  const activeAIs = aiModes.filter(ai => ai.active);
  const primaryAI = activeAIs[0] || aiModes[0];

  // Scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load saved API key
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  // Initialize speech recognition once
  useEffect(() => {
    if (isInitializedRef.current) return;
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.continuous = false; // will be toggled when starting
    recognitionRef.current.interimResults = true;
    recognitionRef.current.maxAlternatives = 1;

    isInitializedRef.current = true;
  }, []);

  // Permission check
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // navigator.permissions may not support 'microphone' in all browsers
        if (navigator.permissions && (navigator.permissions as any).query) {
          const result = await (navigator.permissions as any).query({ name: 'microphone' });
          setMicPermission(result.state as any);
          result.onchange = () => setMicPermission(result.state as any);
        } else {
          setMicPermission('prompt');
        }
      } catch (err) {
        setMicPermission('prompt');
      }
    };
    checkPermission();
  }, []);

  // Core recognition handlers (kept outside to avoid re-registering accidentally)
  const handleRecognitionStart = useCallback(() => {
    setIsListening(true);
    setInterimTranscript('');
    console.log('Speech recognition started');
  }, [setIsListening]);

  const handleRecognitionResult = useCallback((event: any) => {
    let interim = '';
    let final = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const r = event.results[i];
      const t = r[0].transcript;
      if (r.isFinal) final += t;
      else interim += t;
    }

    setInterimTranscript(interim);

    if (final) {
      const fullTranscript = final.toLowerCase().trim();
      setTranscript(fullTranscript);
      setInterimTranscript('');

      // If wake-word mode enabled, expect "zoul" in transcript.
      if (settings.wakeWord) {
        if (fullTranscript.includes('zoul')) {
          const after = fullTranscript.split('zoul')[1]?.trim() || '';
          if (after.length > 0) {
            processVoiceCommand(after);
          } else {
            // Acknowledge wake word
            const ackMsg = "Yes, I'm listening. How can I help you?";
            addMessage({ type: 'ai', content: ackMsg, aiMode: primaryAI.name });
            speakResponse(ackMsg);
          }
        } else {
          // If wakeWord enabled and phrase doesn't contain 'zoul', ignore final result
          console.log('Wake word not detected - ignoring final transcript:', fullTranscript);
        }
      } else {
        // Manual mode or continuous mode: treat final transcript as command
        processVoiceCommand(fullTranscript);
      }
    }
  }, [settings.wakeWord, primaryAI.name, addMessage]);

  const handleRecognitionError = useCallback((event: any) => {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      setMicPermission('denied');
      setIsListening(false);
    }
    // For no-speech / aborted etc, we let onend or logic handle restart if needed
  }, [setIsListening]);

  const handleRecognitionEnd = useCallback(() => {
    console.log('Speech recognition ended');
    // If continuous mode or settings specify continuous listening, restart automatically when isListening is true
    const continuous = continuousModeRef.current;
    if (continuous && isListening) {
      // small backoff to avoid rapid restart loop
      setTimeout(() => {
        try {
          recognitionRef.current?.start();
          console.log('Recognition restarted (continuous mode)');
        } catch (e: any) {
          console.warn('Recognition restart failed:', e);
          setIsListening(false);
        }
      }, 150);
    } else {
      setIsListening(false);
    }
  }, [isListening, setIsListening]);

  // Register handlers when recognitionRef exists and keep them stable
  useEffect(() => {
    if (!recognitionRef.current) return;
    const rec = recognitionRef.current;

    rec.onstart = handleRecognitionStart;
    rec.onresult = handleRecognitionResult;
    rec.onerror = handleRecognitionError;
    rec.onend = handleRecognitionEnd;

    return () => {
      // Remove handlers to avoid duplicate firing if any
      try {
        rec.onstart = null;
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
      } catch (_) {}
    };
  }, [handleRecognitionStart, handleRecognitionResult, handleRecognitionError, handleRecognitionEnd]);

  // Request microphone access helper
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicPermission('granted');
      // Start after granting
      startListening();
    } catch (err) {
      console.error('Microphone permission denied', err);
      setMicPermission('denied');
      alert('Microphone access is required. Please allow it in your browser.');
    }
  };

  // Start listening
  const startListening = () => {
    if (!recognitionRef.current) {
      console.error('Speech recognition not initialized');
      return;
    }
    if (micPermission === 'denied') {
      alert('Microphone access denied. Please enable it in browser settings.');
      return;
    }
    if (micPermission === 'prompt') {
      // Ask for permission first
      requestMicrophonePermission();
      return;
    }

    const rec = recognitionRef.current;
    // Determine continuous behavior from settings
    const continuous = !!settings.continuousListening;
    continuousModeRef.current = continuous;
    rec.continuous = continuous;
    rec.interimResults = true;
    rec.lang = 'en-US';
    try {
      rec.start();
      setIsListening(true);
      console.log('Starting speech recognition...');
    } catch (e: any) {
      if (e.message?.includes('already started')) {
        console.log('Recognition already running');
        setIsListening(true);
      } else {
        console.error('Error starting recognition:', e);
      }
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Stopping speech recognition...');
      } catch (err) {
        console.warn('Error stopping recognition', err);
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  // Toggle button
  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  // Speak response with SpeechSynthesis
  const speakResponse = (text: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      const ut = new SpeechSynthesisUtterance(text);
      ut.rate = 1.0;
      ut.pitch = 1.0;
      ut.volume = 1.0;
      window.speechSynthesis.cancel(); // cancel any ongoing TTS to avoid overlaps
      window.speechSynthesis.speak(ut);
    }
  };

  // Process voice command: send to OpenAI or local fallback
  const processVoiceCommand = async (command: string) => {
    if (!command || command.trim().length === 0) return;
    setIsProcessing(true);

    addMessage({ type: 'user', content: command });

    try {
      let response = '';
      if (apiKey && apiKey.startsWith('sk-')) {
        response = await callOpenAI(command);
      } else {
        response = getLocalResponse(command);
      }

      addMessage({ type: 'ai', content: response, aiMode: primaryAI.name });
      speakResponse(response);
    } catch (err) {
      console.error('Error processing command:', err);
      const errMsg = 'I encountered an error processing your request. Please check your API key or try again.';
      addMessage({ type: 'ai', content: errMsg, aiMode: primaryAI.name });
      speakResponse(errMsg);
    } finally {
      setIsProcessing(false);
      // In non-continuous (manual) mode we should stop listening after a response
      if (!settings.continuousListening) {
        stopListening();
      }
    }
  };

  // Call OpenAI
  const callOpenAI = async (prompt: string): Promise<string> => {
    const activeAIContext = activeAIs.map(ai => `${ai.name}: ${ai.description}`).join(', ');
    const systemMessage = `You are Zoul, an advanced AI assistant. Currently active modes: ${activeAIContext}. Respond in a helpful, concise manner.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || 'I could not generate a response.';
  };

  const getLocalResponse = (command: string): string => {
    const cmd = command.toLowerCase();
    const activeAINames = activeAIs.map(ai => ai.name).join(', ') || 'Zoul';

    if (cmd.includes('hello') || cmd.includes('hi')) {
      return `Hello! I'm ${activeAINames}. How can I assist you today?`;
    } else if (cmd.includes('how are you')) {
      return `I'm functioning perfectly with ${activeAIs.length} AI mode${activeAIs.length !== 1 ? 's' : ''} active. How can I help you?`;
    } else if (cmd.includes('what can you do')) {
      return `I have ${activeAIs.length} AI modes active: ${activeAINames}. I can help with conversations, tasks, and various operations. Try adding an OpenAI API key for advanced capabilities.`;
    } else if (cmd.includes('thank')) {
      return "You're welcome! I'm here whenever you need assistance.";
    }
    return `I'm processing your request with ${activeAINames}. For advanced responses, add your OpenAI API key in settings.`;
  };

  const saveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey);
    setShowApiKeyModal(false);
    addMessage({ type: 'system', content: 'OpenAI API key configured successfully!' });
  };

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.onstart = null;
        recognitionRef.current?.onresult = null;
        recognitionRef.current?.onend = null;
        recognitionRef.current?.onerror = null;
        recognitionRef.current?.stop?.();
      } catch (_) {}
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-[var(--bg)]">
      {/* Voice Orb Display */}
      <div className="relative flex-1 flex items-center justify-center bg-gradient-to-b from-[var(--panel)] to-[var(--bg)]">
        <VoiceOrb
          isListening={isListening}
          isProcessing={isProcessing}
          activeAIs={activeAIs}
          primaryAI={primaryAI}
        />

        {/* Status Text */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          {isProcessing ? (
            <div className="text-[var(--accent)] animate-pulse">Processing...</div>
          ) : isListening ? (
            <div className="text-[var(--accent)]">
              {interimTranscript || transcript || 'Listening...'}
            </div>
          ) : (
            <div className="text-[var(--muted)]">
              {settings.wakeWord ? 'Say "Zoul" to activate' : 'Click microphone to start'}
            </div>
          )}
        </div>

        {/* Active AI Badges */}
        {activeAIs.length > 0 && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {activeAIs.map(ai => (
                <div
                  key={ai.id}
                  className="px-3 py-1 rounded-full text-sm text-white backdrop-blur-sm"
                  style={{ backgroundColor: ai.color + 'dd' }}
                >
                  {ai.icon} {ai.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Key Button */}
        <button
          onClick={() => setShowApiKeyModal(true)}
          className="absolute top-6 right-6 p-2 bg-[var(--panel)] border border-[var(--stroke)] rounded-xl hover:border-[var(--accent)] transition-all"
          title="Configure OpenAI API Key"
        >
          <Settings className="w-5 h-5 text-[var(--text)]" />
        </button>
      </div>

      {/* Control Panel */}
      <div className="p-6 border-t border-[var(--stroke)] bg-[var(--panel)]">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            {/* Microphone Toggle */}
            <button
              onClick={toggleListening}
              className={`p-6 rounded-full transition-all ${
                isListening
                  ? 'bg-[var(--accent)] text-white shadow-[0_0_40px_rgba(138,92,255,0.6)] scale-110'
                  : 'bg-[var(--elevated)] text-[var(--muted)] hover:bg-[var(--accent)] hover:text-white'
              }`}
            >
              {isListening ? (
                <Mic className="w-8 h-8 animate-pulse" />
              ) : (
                <MicOff className="w-8 h-8" />
              )}
            </button>

            {/* Permission status & prompts */}
            {micPermission === 'denied' && (
              <div className="text-sm text-red-400">
                Microphone access denied. Please enable in browser settings.
              </div>
            )}
            {micPermission === 'prompt' && !isListening && (
              <div className="text-sm text-[var(--muted)]">
                Click to enable microphone
              </div>
            )}
          </div>

          {/* Settings Info */}
          <div className="mt-4 text-center text-sm text-[var(--muted)]">
            {settings.wakeWord && 'Wake word: "Zoul" • '}
            {settings.continuousListening ? 'Continuous listening enabled' : 'Manual mode'}
            {!apiKey && ' • Add API key for OpenAI'}
          </div>
        </div>
      </div>

      {/* Messages History (Collapsed at bottom) */}
      {messages.length > 0 && (
        <div className="max-h-48 overflow-auto p-4 border-t border-[var(--stroke)] bg-[var(--elevated)]">
          <div className="max-w-2xl mx-auto space-y-2">
            {messages.slice(-5).map((message: any) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                    message.type === 'user'
                      ? 'bg-[var(--accent)] text-white'
                      : message.type === 'system'
                      ? 'bg-[var(--elevated)] text-[var(--text)] border border-[var(--accent)]'
                      : 'bg-[var(--panel)] text-[var(--text)] border border-[var(--stroke)]'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowApiKeyModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-[var(--text)] mb-4">OpenAI API Key</h3>
              <p className="text-sm text-[var(--muted)] mb-4">
                Enter your OpenAI API key to enable advanced AI responses. Get your key from{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline"
                >
                  platform.openai.com
                </a>
              </p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2 bg-[var(--elevated)] text-[var(--text)] border border-[var(--stroke)] rounded-xl focus:outline-none focus:border-[var(--accent)] mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveApiKey}
                  className="flex-1 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--glow)] text-white rounded-xl transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 bg-[var(--elevated)] hover:bg-[var(--stroke)] text-[var(--text)] rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

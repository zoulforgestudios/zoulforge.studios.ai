import { useState, useEffect, useRef } from 'react';
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

  const activeAIs = aiModes.filter(ai => ai.active);
  const primaryAI = activeAIs[0] || aiModes[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Initialize speech recognition once
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    isInitializedRef.current = true;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 1;

    console.log('Speech recognition initialized');
  }, []);

  // Check microphone permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions?.query({ name: 'microphone' as PermissionName });
        if (result) {
          setMicPermission(result.state as any);
          result.onchange = () => {
            setMicPermission(result.state as any);
          };
        }
      } catch (error) {
        console.log('Permission check not supported:', error);
        setMicPermission('prompt');
      }
    };
    
    checkPermission();
  }, []);

  // Setup speech recognition
  useEffect(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);

      if (final) {
        const fullTranscript = final.toLowerCase().trim();
        console.log('Final transcript:', fullTranscript);
        
        // Check for wake word
        if (fullTranscript.includes('zoul')) {
          setTranscript(fullTranscript);
          
          // Process the command after wake word
          const commandAfterWakeWord = fullTranscript.split('zoul')[1]?.trim();
          if (commandAfterWakeWord && commandAfterWakeWord.length > 0) {
            processVoiceCommand(commandAfterWakeWord);
          } else {
            // Just acknowledged wake word
            const ackMsg = "Yes, I'm listening. How can I help you?";
            addMessage({
              type: 'ai',
              content: ackMsg,
              aiMode: primaryAI.name,
            });
            speakResponse(ackMsg);
          }
        }
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setMicPermission('denied');
        setIsListening(false);
      } else if (event.error === 'no-speech') {
        console.log('No speech detected, continuing...');
      } else if (event.error === 'aborted') {
        console.log('Recognition aborted, restarting...');
      }
    };

    recognitionRef.current.onend = () => {
      console.log('Speech recognition ended');
      // Auto-restart if we're supposed to be listening
      if (isListening && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
            console.log('Restarting recognition...');
          } catch (e: any) {
            if (e.message?.includes('already started')) {
              console.log('Recognition already active');
            } else {
              console.error('Recognition restart error:', e);
              setIsListening(false);
            }
          }
        }, 100);
      }
    };

    return () => {
      // Cleanup
    };
  }, [isListening, settings, primaryAI]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
      // Now start listening
      setTimeout(() => startListening(), 100);
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicPermission('denied');
      alert('Microphone access is required for voice commands. Please allow microphone access in your browser settings.');
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      console.error('Speech recognition not initialized');
      return;
    }

    if (micPermission === 'denied') {
      alert('Microphone access is denied. Please enable it in your browser settings.');
      return;
    }

    if (micPermission === 'prompt') {
      requestMicrophonePermission();
      return;
    }

    try {
      recognitionRef.current.start();
      console.log('Starting speech recognition...');
    } catch (error: any) {
      if (error.message?.includes('already started')) {
        console.log('Recognition already running');
        setIsListening(true);
      } else {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Stopping speech recognition...');
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);

    // Add user message
    addMessage({
      type: 'user',
      content: command,
    });

    try {
      let response = '';

      // Check if API key is available for OpenAI
      if (apiKey && apiKey.startsWith('sk-')) {
        // Call OpenAI API
        response = await callOpenAI(command);
      } else {
        // Fallback to local responses
        response = getLocalResponse(command);
      }

      // Add AI response
      addMessage({
        type: 'ai',
        content: response,
        aiMode: primaryAI.name,
      });

      // Speak the response
      speakResponse(response);
    } catch (error) {
      console.error('Error processing command:', error);
      const errorMsg = 'I encountered an error processing your request. Please check your API key or try again.';
      addMessage({
        type: 'ai',
        content: errorMsg,
        aiMode: primaryAI.name,
      });
      speakResponse(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

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
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
  };

  const getLocalResponse = (command: string): string => {
    const cmd = command.toLowerCase();
    const activeAINames = activeAIs.map(ai => ai.name).join(', ');

    if (cmd.includes('hello') || cmd.includes('hi')) {
      return `Hello! I'm ${activeAINames || 'Zoul'}. How can I assist you today?`;
    } else if (cmd.includes('how are you')) {
      return `I'm functioning perfectly with ${activeAIs.length} AI mode${activeAIs.length !== 1 ? 's' : ''} active. How can I help you?`;
    } else if (cmd.includes('what can you do')) {
      return `I have ${activeAIs.length} AI modes active: ${activeAINames}. I can help with conversations, tasks, and various operations. Try connecting an OpenAI API key for enhanced capabilities.`;
    } else if (cmd.includes('thank')) {
      return "You're welcome! I'm here whenever you need assistance.";
    } else {
      return `I'm processing your request with ${activeAINames}. For more advanced responses, please add your OpenAI API key in the settings.`;
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey);
    setShowApiKeyModal(false);
    addMessage({
      type: 'system',
      content: 'OpenAI API key configured successfully!',
    });
  };

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

            {/* Permission Status */}
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
            {messages.slice(-5).map((message) => (
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
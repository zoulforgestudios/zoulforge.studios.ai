// src/components/Chat.tsx
import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Settings } from "lucide-react";
import { VoiceOrb } from "./VoiceOrb";

/**
 * Merged Chat.tsx
 * - Keeps your original UI intact
 * - Adds:
 *   - Manual Wake Mode toggle (listen for "zoul")
 *   - Full listening flow (speech-to-text -> Responses API)
 *   - High-quality TTS via OpenAI Audio API (/v1/audio/speech)
 *   - Smooth audio playback using WebAudio gain envelope
 */

// ---- Config: change if you want ----
const RESPONSES_MODEL = "gpt-4o-mini"; // model for text responses
const TTS_MODEL = "gpt-4o-mini-tts"; // or "tts-1" / "tts-1-hd" if available
const TTS_VOICE = "alloy"; // example voice name; change if needed

// Web Speech API constructors (may be undefined in some browsers)
const SpeechRecognitionCtor: any =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;

type Message = { id: string; type: "user" | "assistant" | "system"; content: string };

export default function Chat(): JSX.Element {
  // --- UI states (unchanged) ---
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  const [apiKey, setApiKey] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const [micPermission, setMicPermission] =
    useState<"granted" | "denied" | "prompt">("prompt");

  // --- New voice features ---
  // Wake Mode toggle (manual): when enabled, a light wake-word listener runs,
  // detects "zoul" and automatically triggers the main listening flow.
  const [wakeModeEnabled, setWakeModeEnabled] = useState(false);
  const wakeRecognitionRef = useRef<any>(null); // for wake-word listener
  const recognitionRef = useRef<any>(null); // for full speech recognition

  // audio context for smooth TTS playback
  const audioCtxRef = useRef<AudioContext | null>(null);

  // scroll ref
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // load API key
  useEffect(() => {
    const saved = localStorage.getItem("openai_apikey");
    if (saved) setApiKey(saved);
  }, []);

  const saveApiKey = () => {
    localStorage.setItem("openai_apikey", apiKey);
    setShowApiKeyModal(false);
  };

  // check mic permission once
  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then(() => setMicPermission("granted"))
      .catch(() => setMicPermission("denied"));
  }, []);

  // ---------------------------
  // small helpers
  // ---------------------------
  const pushMessage = (msg: Message) => {
    setMessages((s) => [...s, msg]);
  };

  const cryptoId = () => {
    try {
      return (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
    } catch {
      return Math.random().toString(36).slice(2, 9);
    }
  };

  // ---------------------------
  // Wake-word listener (light)
  // - Only runs when wakeModeEnabled === true
  // - Listens for phrase "zoul" (case-insensitive)
  // - If detected, triggers startListening()
  // - Implemented to be conservative and restart lightly on end
  // ---------------------------
  const startWakeListener = () => {
    if (!wakeModeEnabled) return;
    if (!SpeechRecognitionCtor) return; // not supported

    // cleanup any existing
    stopWakeListener();

    const rec = new SpeechRecognitionCtor();
    rec.continuous = true; // keep listening in short bursts
    rec.interimResults = true;
    rec.lang = "en-US";

    let interimBuffer = "";

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const t = r[0].transcript;
        if (r.isFinal) finalText += t;
        else interimText += t;
      }
      interimBuffer = (finalText + " " + interimText).trim();
      // simple wake-word detection
      if (interimBuffer.toLowerCase().includes("zoul")) {
        // detected
        stopWakeListener();
        // short visual acknowledgement
        const ack = "Yes?"; // you can change ack messaging
        pushMessage({ id: cryptoId(), type: "assistant", content: ack });
        // speak ack briefly using TTS (or local TTS fallback)
        playTTS(ack).catch(() => {});
        // then start full listening for the user's command
        setTimeout(() => startListening(), 250);
      }
    };

    rec.onend = () => {
      // If still enabled, restart with a small delay to avoid busy loops
      if (wakeModeEnabled) {
        setTimeout(() => {
          if (wakeModeEnabled) startWakeListener();
        }, 250);
      }
    };

    rec.onerror = (e: any) => {
      console.warn("Wake listener error:", e);
      // try restarting after small delay if still enabled
      if (wakeModeEnabled) {
        setTimeout(() => startWakeListener(), 800);
      }
    };

    wakeRecognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      console.warn("Wake listener start failed:", e);
    }
  };

  const stopWakeListener = () => {
    const rec = wakeRecognitionRef.current;
    try {
      rec?.stop();
    } catch (_) {}
    try {
      (rec as any).onresult = null;
      (rec as any).onend = null;
      (rec as any).onerror = null;
    } catch (_) {}
    wakeRecognitionRef.current = null;
  };

  // toggle wake mode button handler
  useEffect(() => {
    if (wakeModeEnabled) startWakeListener();
    else stopWakeListener();
    // cleanup on unmount
    return () => {
      stopWakeListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wakeModeEnabled]);

  // ---------------------------
  // full speech recognition (capture user command)
  // ---------------------------
  const startListening = () => {
    if (!SpeechRecognitionCtor) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    // ensure previous instance cleared
    stopListening();

    const rec = new SpeechRecognitionCtor();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
      setTranscript("");
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const t = r[0].transcript;
        if (r.isFinal) final += t;
        else interim += t;
      }
      setInterimTranscript(interim);
      if (final) {
        setTranscript((prev) => (prev ? prev + " " + final : final));
      }
    };

    rec.onend = () => {
      setIsListening(false);
      const text = (transcript && transcript.trim()) ? transcript.trim() : interimTranscript.trim();
      if (text) {
        // send to AI
        processCommand(text);
      }
    };

    rec.onerror = (e: any) => {
      console.warn("Recognition error:", e);
      setIsListening(false);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      console.warn("Recognition start error:", e);
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch (_) {}
    try {
      recognitionRef.current = null;
    } catch (_) {}
    setIsListening(false);
  };

  // toggle listening from UI
  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  // ---------------------------
  // process user command → Responses API → TTS
  // ---------------------------
  const processCommand = async (text: string) => {
    // push user message
    pushMessage({ id: cryptoId(), type: "user", content: text });
    setIsProcessing(true);

    try {
      const systemPrompt =
        "You are Zoul, a friendly futuristic AI assistant (like Friday). Be concise, helpful, and kind.";

      // 1) Get text reply from Responses API
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: RESPONSES_MODEL,
          input: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          // optional: limit tokens, temperature etc.
          temperature: 0.7,
          max_output_tokens: 500,
        }),
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error("Responses API error: " + response.status + " " + txt);
      }

      const data = await response.json();
      // extract textual reply (safe extraction)
      let aiText: string | null = null;
      if (typeof data.output_text === "string") aiText = data.output_text;
      if (!aiText && Array.isArray(data.output) && data.output.length > 0) {
        // accumulate text parts
        const parts: string[] = [];
        for (const out of data.output) {
          if (Array.isArray(out.content)) {
            for (const chunk of out.content) {
              if (typeof chunk === "string") parts.push(chunk);
              else if (chunk?.text) parts.push(chunk.text);
            }
          } else if (typeof out.content === "string") {
            parts.push(out.content);
          }
        }
        aiText = parts.join(" ").trim();
      }
      if (!aiText && data?.text) aiText = String(data.text);

      if (!aiText) aiText = "I'm sorry — I couldn't generate a reply.";

      // push assistant message
      pushMessage({ id: cryptoId(), type: "assistant", content: aiText });

      // 2) TTS: get audio from OpenAI Audio API and play smoothly with WebAudio
      await playTTS(aiText);
    } catch (err: any) {
      console.error("processCommand error:", err);
      const errMsg = "I encountered an error processing your request.";
      pushMessage({ id: cryptoId(), type: "assistant", content: errMsg });
      // fallback to browser TTS if OpenAI audio fails:
      try {
        speakFallback(errMsg);
      } catch (_) {}
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------------------
  // TTS: call OpenAI Audio API (/v1/audio/speech) and play via WebAudio
  // ---------------------------
  async function playTTS(text: string): Promise<void> {
    // prefer OpenAI Audio API (high-quality) if apiKey present
    if (!apiKey) {
      // fallback to browser TTS
      speakFallback(text);
      return;
    }

    try {
      // fetch audio (response audio/mpeg or audio/wav)
      const resp = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "audio/mpeg", // request mp3 if available
        },
        body: JSON.stringify({
          model: TTS_MODEL,
          voice: TTS_VOICE,
          input: text,
        }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error("Audio API error: " + resp.status + " " + txt);
      }

      const arrayBuffer = await resp.arrayBuffer();
      // create or reuse audio context
      let ctx = audioCtxRef.current;
      if (!ctx) {
        ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
      }

      const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      const gain = ctx.createGain();
      gain.gain.value = 0.0001; // start almost silent for fade-in
      source.connect(gain).connect(ctx.destination);

      // start
      source.start(0);
      setIsProcessing(false);
      setIsListening(false);
      // fade-in
      gain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.18);
      // when ends, fade out a touch and stop
      source.onended = () => {
        try {
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        } catch (_) {}
      };

      // update speaking state for UI orb
      setTimeout(() => {
        // approximate speaking duration from buffer length
        const durationMs = (audioBuffer.duration || 0) * 1000;
        setTimeout(() => {
          setIsProcessing(false);
        }, Math.max(300, durationMs));
      }, 0);

    } catch (err) {
      console.warn("playTTS OpenAI audio failed, falling back to browser TTS:", err);
      // fallback
      speakFallback(text);
    }
  }

  // fallback using browser SpeechSynthesis (tuned)
  function speakFallback(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.98;
    utt.pitch = 0.9;
    // try to pick a friendly voice
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length) {
      const preferred = voices.find((v) => /female|Samantha|Google US|Microsoft/i.test(v.name));
      if (preferred) utt.voice = preferred;
    }
    utt.onstart = () => setIsProcessing(false);
    utt.onend = () => setIsProcessing(false);
    window.speechSynthesis.speak(utt);
  }

  // ---------------------------
  // UI render (keeps your UI intact)
  // Added one small control: Wake Mode toggle button next to mic controls
  // ---------------------------
  return (
    <div className="h-full flex flex-col bg-[var(--bg)]">
      {/* CENTER AREA */}
      <div className="relative flex-1 flex items-center justify-center bg-gradient-to-b from-[var(--panel)] to-[var(--bg)]">
        <VoiceOrb
          isListening={isListening || wakeModeEnabled}
          isProcessing={isProcessing}
          activeAIs={[]}
          primaryAI={null}
        />

        {/* STATUS TEXT */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          {isProcessing ? (
            <div className="text-[var(--accent)] animate-pulse">Processing...</div>
          ) : isListening ? (
            <div className="text-[var(--accent)]">{interimTranscript || transcript || "Listening..."}</div>
          ) : wakeModeEnabled ? (
            <div className="text-[var(--accent)]">Wake mode: listening for "Zoul"</div>
          ) : (
            <div className="text-[var(--muted)]">Click microphone to start</div>
          )}
        </div>

        {/* API KEY BUTTON */}
        <button
          onClick={() => setShowApiKeyModal(true)}
          className="absolute top-6 right-6 p-2 bg-[var(--panel)] border border-[var(--stroke)] rounded-xl hover:border-[var(--accent)] transition-all"
          title="Configure OpenAI API Key"
        >
          <Settings className="w-5 h-5 text-[var(--text)]" />
        </button>
      </div>

      {/* MIC CONTROL PANEL */}
      <div className="p-6 border-t border-[var(--stroke)] bg-[var(--panel)]">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-4">
          {/* Microphone Toggle */}
          <button
            onClick={toggleListening}
            className={`p-6 rounded-full transition-all ${
              isListening
                ? "bg-[var(--accent)] text-white shadow-[0_0_40px_rgba(138,92,255,0.6)] scale-110"
                : "bg-[var(--elevated)] text-[var(--muted)] hover:bg-[var(--accent)] hover:text-white"
            }`}
          >
            {isListening ? <Mic className="w-8 h-8 animate-pulse" /> : <MicOff className="w-8 h-8" />}
          </button>

          {/* Wake Mode Toggle (manual) */}
          <button
            onClick={() => setWakeModeEnabled((s) => !s)}
            className={`px-4 py-2 rounded-xl border ${
              wakeModeEnabled ? "bg-[var(--accent)] text-white" : "bg-[var(--elevated)] text-[var(--muted)]"
            }`}
            title="Toggle Wake Mode (listens for 'Zoul')"
          >
            {wakeModeEnabled ? "Wake Mode: ON" : "Wake Mode: OFF"}
          </button>

          {/* Permission Status */}
          {micPermission === "denied" && (
            <div className="text-sm text-red-400">Microphone access denied. Please enable in browser settings.</div>
          )}
          {micPermission === "prompt" && !isListening && (
            <div className="text-sm text-[var(--muted)]">Click to enable microphone</div>
          )}
        </div>

        {/* Settings Info */}
        <div className="mt-4 text-center text-sm text-[var(--muted)]">
          Wake-word detection is gated behind Wake Mode. When Wake Mode is ON say "Zoul" to trigger the assistant.
          {!apiKey && " • Add API key for OpenAI"}
        </div>
      </div>

      {/* MESSAGE HISTORY */}
      {messages.length > 0 && (
        <div className="max-h-48 overflow-auto p-4 border-t border-[var(--stroke)] bg-[var(--elevated)]">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-3 py-2 rounded-xl text-sm ${
                  m.type === "user"
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--panel)] text-[var(--text)] border border-[var(--stroke)]"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* API KEY MODAL */}
      {showApiKeyModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowApiKeyModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-[var(--text)] mb-4">OpenAI API Key</h3>
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--elevated)] border border-[var(--stroke)] rounded-xl mb-4"
              />
              <div className="flex gap-2">
                <button onClick={saveApiKey} className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-xl">
                  Save
                </button>
                <button onClick={() => setShowApiKeyModal(false)} className="px-4 py-2 bg-[var(--elevated)] text-[var(--text)] rounded-xl">
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


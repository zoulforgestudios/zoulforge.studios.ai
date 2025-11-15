// src/components/ZoulVoicePage.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * ZoulVoicePage.tsx
 * - Single-file voice-assistant page (TypeScript + React)
 * - Web Speech API (speech-to-text)
 * - OpenAI Responses API (v1/responses)
 * - SpeechSynthesis (text-to-speech)
 *
 * How to use:
 * 1. Drop into src/components/ZoulVoicePage.tsx
 * 2. Open page in your app and add your OpenAI API key via the "API Key" button
 * 3. Click "Start Listening" and speak. The assistant will process and reply.
 */

/* ---------- Configuration ---------- */
// Which model to call with Responses API
const OPENAI_RESPONSES_MODEL = "gpt-4o-mini"; // change if needed

// Optional: Replace with a default key for dev only (NOT recommended)
const DEFAULT_API_KEY_PLACEHOLDER = "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";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
};

const SpeechRecognitionCtor: any =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;

export default function ZoulVoicePage(): JSX.Element {
  // UI / state
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const [interim, setInterim] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [apiKey, setApiKey] = useState<string>(DEFAULT_API_KEY_PLACEHOLDER);
  const [showKeyInput, setShowKeyInput] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // load saved key on mount
  useEffect(() => {
    const saved = localStorage.getItem("zoul_openai_key");
    if (saved) setApiKey(saved);
  }, []);

  // autoscroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------------------
  // Speech recognition helpers
  // ---------------------------
  function createRecognition() {
    if (!SpeechRecognitionCtor) return null;
    try {
      const rec = new SpeechRecognitionCtor();
      rec.lang = "en-US";
      rec.interimResults = true;
      rec.continuous = false; // single utterance
      rec.maxAlternatives = 1;
      return rec;
    } catch (e) {
      console.warn("Could not create SpeechRecognition:", e);
      return null;
    }
  }

  function cleanupRecognition(rec: any | null) {
    if (!rec) return;
    try {
      rec.onstart = null;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
    } catch (e) {
      // ignore
    }
  }

  // start listening
  const startListening = () => {
    if (!SpeechRecognitionCtor) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    // create a fresh instance each time to avoid weird browser states
    const rec = createRecognition();
    if (!rec) return;

    // reset interim/final
    setInterim("");
    setFinalTranscript("");

    rec.onstart = () => {
      setListening(true);
      setInterim("");
      setFinalTranscript("");
    };

    rec.onresult = (event: any) => {
      let interimText = "";
      let finalTextAccum = "";
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        const text = r[0].transcript;
        if (r.isFinal) finalTextAccum += text;
        else interimText += text;
      }
      setInterim(interimText);
      if (finalTextAccum) {
        setFinalTranscript((prev) => (prev ? prev + " " + finalTextAccum : finalTextAccum));
      }
    };

    rec.onerror = (ev: any) => {
      console.error("Speech recognition error", ev);
      setListening(false);
      cleanupRecognition(rec);
    };

    rec.onend = () => {
      setListening(false);
      cleanupRecognition(rec);
      // prefer finalTranscript if present, otherwise interim
      const finalText = (finalTranscript && finalTranscript.trim()) ? finalTranscript.trim() : (interim || "").trim();
      if (finalText) {
        processUserSpeech(finalText);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      console.warn("Recognition start error:", e);
    }
  };

  // stop listening
  const stopListening = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      setListening(false);
      return;
    }
    try {
      rec.stop();
    } catch (e) {
      console.warn("Error stopping recognition:", e);
    }
    cleanupRecognition(rec);
    recognitionRef.current = null;
    setListening(false);
  };

  // toggle
  const toggleListening = () => {
    if (listening) stopListening();
    else startListening();
  };

  // ---------------------------
  // AI processing + TTS
  // ---------------------------
  async function processUserSpeech(text: string) {
    // Add user message
    const userMsg: ChatMessage = { id: cryptoRandom(), role: "user", text };
    pushMessage(userMsg);

    // call OpenAI Responses API
    setProcessing(true);
    try {
      const replyText = await callOpenAIResponses(text);
      const aiMsg: ChatMessage = { id: cryptoRandom(), role: "assistant", text: replyText };
      pushMessage(aiMsg);

      // speak
      await speakText(replyText);
    } catch (err) {
      console.error("Error processing speech:", err);
      const errMsg: ChatMessage = {
        id: cryptoRandom(),
        role: "assistant",
        text: "I couldn't reach the AI service. Please check your API key and network.",
      };
      pushMessage(errMsg);
      speakText(errMsg.text);
    } finally {
      setProcessing(false);
    }
  }

  function pushMessage(msg: ChatMessage) {
    setMessages((m) => [...m, msg]);
  }

  async function callOpenAIResponses(prompt: string): Promise<string> {
    if (!apiKey || apiKey.trim() === "") {
      throw new Error("OpenAI API key not set");
    }

    const body = {
      model: OPENAI_RESPONSES_MODEL,
      input: prompt,
    };

    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error("OpenAI error: " + resp.status + " " + txt);
    }

    const data = await resp.json();

    // Responses API shapes vary — try a few safe extraction approaches
    // 1) data.output_text (some SDKs provide)
    if (typeof data.output_text === "string" && data.output_text.trim().length > 0) {
      return data.output_text.trim();
    }

    // 2) data.output[0].content[] elements
    try {
      if (Array.isArray(data.output) && data.output.length > 0) {
        const parts: string[] = [];
        for (const item of data.output) {
          if (!item || !item.content) continue;
          for (const chunk of item.content) {
            if (typeof chunk === "string") parts.push(chunk);
            else if (typeof chunk?.text === "string") parts.push(chunk.text);
            else if (typeof chunk?.content === "string") parts.push(chunk.content);
            else if (chunk?.type === "output_text" && chunk?.text) parts.push(chunk.text);
          }
        }
        const joined = parts.join("\n").trim();
        if (joined) return joined;
      }
    } catch (e) {
      // fallthrough
      console.warn("Could not parse Responses output array", e);
    }

    // 3) fallback to text property (if present)
    if (data?.text) return String(data.text).trim();

    return "I couldn't generate a reply.";
  }

  // Text-to-speech with simple voice tuning
  function speakText(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }
      // cancel previous
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      // voice tuning for a "Zoul" feel
      u.rate = 0.95;
      u.pitch = 0.8;
      u.volume = 1.0;

      u.onstart = () => setSpeaking(true);
      u.onend = () => {
        setSpeaking(false);
        resolve();
      };
      u.onerror = () => {
        setSpeaking(false);
        resolve();
      };

      // pick a deeper voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length) {
        // pick a voice that looks like "en-US" or "Google US English" etc.
        const preferred = voices.find((v) =>
          /en-US|Google US|Microsoft|Alex|Samantha/i.test(v.name)
        );
        if (preferred) u.voice = preferred;
      }

      window.speechSynthesis.speak(u);
    });
  }

  // ---------------------------
  // small helpers
  // ---------------------------
  function cryptoRandom() {
    try {
      return (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
    } catch {
      return Math.random().toString(36).slice(2, 9);
    }
  }

  function handleSaveKey() {
    localStorage.setItem("zoul_openai_key", apiKey);
    setShowKeyInput(false);
    alert("API key saved locally (localStorage).");
  }

  // ---------------------------
  // Render
  // ---------------------------
  const orbState = listening ? "listening" : processing ? "processing" : speaking ? "speaking" : "idle";

  const orbVariants = {
    idle: { scale: 1, boxShadow: "0 0 30px rgba(160,115,255,0.12)" },
    listening: {
      scale: [1, 1.16, 1],
      boxShadow: [
        "0 0 30px rgba(160,115,255,0.2)",
        "0 0 70px rgba(77,243,255,0.18)",
        "0 0 30px rgba(160,115,255,0.2)",
      ],
      transition: { duration: 1.2, repeat: Infinity },
    },
    processing: {
      scale: [1, 1.08, 1],
      boxShadow: ["0 0 20px rgba(160,115,255,0.18)", "0 0 60px rgba(140,90,255,0.18)"],
      transition: { duration: 1.1, repeat: Infinity },
    },
    speaking: {
      scale: [1, 1.14, 1],
      boxShadow: ["0 0 40px rgba(77,243,255,0.2)", "0 0 110px rgba(77,243,255,0.08)"],
      transition: { duration: 0.9, repeat: Infinity },
    },
  };

  const containerStyle: React.CSSProperties = {
    height: "100vh",
    width: "100%",
    display: "flex",
    background: "linear-gradient(180deg,#07070b 0%, #0b0b14 100%)",
    color: "#e6e6f0",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto",
  };

  const leftStyle: React.CSSProperties = {
    width: 420,
    padding: 20,
    borderRight: "1px solid rgba(255,255,255,0.03)",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  };

  const rightStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  };

  const micButtonStyle: React.CSSProperties = {
    marginTop: 26,
    padding: "14px 22px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    background: listening ? "linear-gradient(90deg,#7a3cff,#4df3ff)" : "#1f1b2b",
    color: listening ? "#0b0b10" : "#cbd5e1",
    boxShadow: listening ? "0 8px 30px rgba(122,60,255,0.28)" : "none",
    fontWeight: 600,
  };

  return (
    <div style={containerStyle}>
      {/* LEFT: chat */}
      <div style={leftStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20 }}>Zoul Voice Assistant</h3>
            <div style={{ fontSize: 12, color: "rgba(230,230,240,0.6)" }}>Say something. Zoul will listen.</div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => {
                setShowKeyInput((s) => !s);
              }}
              style={{
                background: "#121018",
                color: "#cbd5e1",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.04)",
                padding: "8px 10px",
                cursor: "pointer",
              }}
            >
              API Key
            </button>
            <div style={{ fontSize: 12, color: "rgba(230,230,240,0.5)" }}>Model: {OPENAI_RESPONSES_MODEL}</div>
          </div>
        </div>

        {showKeyInput && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                background: "#0e0e13",
                border: "1px solid rgba(255,255,255,0.04)",
                color: "#fff",
              }}
            />
            <button onClick={handleSaveKey} style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", background: "#4df3ff", border: "none" }}>
              Save
            </button>
          </div>
        )}

        {/* Messages */}
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {messages.length === 0 && (
            <div style={{ color: "rgba(230,230,240,0.45)", padding: 12, borderRadius: 8, background: "#071026" }}>
              Try pressing the mic and say something like "Hello Zoul" or "What's the weather".
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? "linear-gradient(90deg,#5a2aff,#9b4dff)" : "rgba(255,255,255,0.03)",
                color: m.role === "user" ? "#fff" : "#dbeafe",
                padding: "10px 12px",
                borderRadius: 10,
                maxWidth: "85%",
                fontSize: 14,
                boxShadow: m.role === "user" ? "0 6px 20px rgba(122,60,255,0.12)" : undefined,
              }}
            >
              <div style={{ opacity: 0.9, marginBottom: 4, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                {m.role === "user" ? "You" : "Zoul"}
              </div>
              <div>{m.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* RIGHT: Orb + controls */}
      <div style={rightStyle}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <motion.div
            animate={orbState}
            variants={orbVariants}
            style={{
              width: 260,
              height: 260,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 25% 25%, rgba(171,101,255,0.95), rgba(108,0,255,0.95) 35%, rgba(32,6,56,1) 70%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Inner shimmer / eye */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "radial-gradient(circle at 30% 30%, #fff, rgba(255,255,255,0.1))",
                boxShadow: "0 0 30px rgba(77,243,255,0.08), inset 0 6px 18px rgba(0,0,0,0.35)",
              }}
            />
          </motion.div>

          {/* Status */}
          <div style={{ marginTop: 18, fontSize: 18, color: "rgba(230,230,240,0.92)" }}>
            {listening ? "Listening..." : processing ? "Processing..." : speaking ? "Speaking..." : "Idle"}
          </div>

          {/* Interim / Transcript */}
          <div style={{ marginTop: 8, minHeight: 20, maxWidth: 720, textAlign: "center", color: "rgba(230,230,240,0.65)" }}>
            {listening && (interim || "…")}
            {!listening && !processing && interim === "" && <span style={{ opacity: 0.5 }}>Say "Zoul" or tap mic</span>}
          </div>

          {/* Controls */}
          <div style={{ marginTop: 22, display: "flex", gap: 14 }}>
            <button onClick={toggleListening} style={micButtonStyle}>
              {listening ? "Stop" : "Start Listening"}
            </button>

            <button
              onClick={() => {
                // quick demo: send the last message to AI again
                const lastUser = [...messages].reverse().find((m) => m.role === "user");
                if (lastUser) {
                  processUserSpeech(lastUser.text);
                } else {
                  alert("No user message to re-process.");
                }
              }}
              style={{
                padding: "12px 18px",
                borderRadius: 10,
                background: "#121018",
                color: "#dfe7ff",
                border: "1px solid rgba(255,255,255,0.03)",
                cursor: "pointer",
              }}
            >
              Re-run Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

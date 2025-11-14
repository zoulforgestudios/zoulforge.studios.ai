// ---------------------- IMPORTS ----------------------
import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Settings } from "lucide-react";
import { VoiceOrb } from "./VoiceOrb";

// Speech Recognition
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

// ---------------------- TYPES ------------------------
interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
}

// ---------------------- COMPONENT --------------------
export default function Chat() {
  // Audio + AI states
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Transcripts
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  // API Key modal
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Mic permission
  const [micPermission, setMicPermission] =
    useState<"granted" | "denied" | "prompt">("prompt");

  // Refs
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ---------------------- SCROLL -----------------------
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [messages]);

  // ---------------------- LOAD API KEY -----------------
  useEffect(() => {
    const saved = localStorage.getItem("openai_apikey");
    if (saved) setApiKey(saved);
  }, []);

  const saveApiKey = () => {
    localStorage.setItem("openai_apikey", apiKey);
    setShowApiKeyModal(false);
  };

  // ---------------------- MIC PERMISSION ----------------
  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then(() => setMicPermission("granted"))
      .catch(() => setMicPermission("denied"));
  }, []);

  // ---------------------- SPEAK TEXT --------------------
  const speak = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.pitch = 1;
    utter.rate = 1;
    utter.volume = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // ---------------------- SEND TO OPENAI ----------------
  const sendToAI = async (text: string) => {
    if (!apiKey) {
      alert("Enter your OpenAI API Key.");
      return;
    }

    setIsProcessing(true);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: text,
        }),
      });

      const data = await res.json();
      const aiText = data.output_text || "I couldn't understand that.";

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        type: "assistant",
        content: aiText,
      };

      setMessages((prev) => [...prev, aiMessage]);
      speak(aiText);
    } catch (err) {
      console.error("OpenAI Error:", err);
      speak("There was an error connecting to OpenAI.");
    }

    setIsProcessing(false);
  };

  // ---------------------- VOICE SETUP -------------------
  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => {
      setIsListening(true);
      setTranscript("");
      setInterimTranscript("");
    };

    rec.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }

      setInterimTranscript(interim);
      if (final) setTranscript(final);
    };

    rec.onend = () => {
      setIsListening(false);
      if (transcript.trim()) {
        sendToAI(transcript.trim());
      }
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch (_) {}
    setIsListening(false);
  };

  const toggleListening = () => {
    isListening ? stopListening() : startListening();
  };

  // ---------------------- UI ----------------------------
  return (
    <div className="h-full flex flex-col bg-[var(--bg)]">
      {/* CENTER AREA */}
      <div className="relative flex-1 flex items-center justify-center bg-gradient-to-b from-[var(--panel)] to-[var(--bg)]">
        <VoiceOrb
          isListening={isListening}
          isProcessing={isProcessing}
          activeAIs={[]}
          primaryAI={null}
        />

        {/* STATUS TEXT */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          {isProcessing ? (
            <div className="text-[var(--accent)] animate-pulse">
              Processing...
            </div>
          ) : isListening ? (
            <div className="text-[var(--accent)]">
              {interimTranscript || transcript || "Listening..."}
            </div>
          ) : (
            <div className="text-[var(--muted)]">
              Click microphone to start
            </div>
          )}
        </div>

        {/* API KEY BUTTON */}
        <button
          onClick={() => setShowApiKeyModal(true)}
          className="absolute top-6 right-6 p-2 bg-[var(--panel)] border border-[var(--stroke)] rounded-xl hover:border-[var(--accent)]"
        >
          <Settings className="w-5 h-5 text-[var(--text)]" />
        </button>
      </div>

      {/* MIC CONTROL PANEL */}
      <div className="p-6 border-t border-[var(--stroke)] bg-[var(--panel)]">
        <div className="max-w-2xl mx-auto flex justify-center">
          <button
            onClick={toggleListening}
            className={`p-6 rounded-full ${
              isListening
                ? "bg-[var(--accent)] text-white shadow-[0_0_40px_rgba(138,92,255,0.6)] scale-110"
                : "bg-[var(--elevated)] text-[var(--muted)] hover:bg-[var(--accent)] hover:text-white"
            }`}
          >
            {isListening ? (
              <Mic className="w-8 h-8 animate-pulse" />
            ) : (
              <MicOff className="w-8 h-8" />
            )}
          </button>
        </div>

        {micPermission === "denied" && (
          <div className="text-center text-red-400 mt-2">
            Microphone access denied.
          </div>
        )}
      </div>

      {/* MESSAGE HISTORY */}
      {messages.length > 0 && (
        <div className="max-h-48 overflow-auto p-4 border-t border-[var(--stroke)] bg-[var(--elevated)]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
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
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowApiKeyModal(false)}
          />
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
                <button
                  onClick={saveApiKey}
                  className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-xl"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 bg-[var(--elevated)] text-[var(--text)] rounded-xl"
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


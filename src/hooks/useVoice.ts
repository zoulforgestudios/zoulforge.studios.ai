import { useState, useRef } from "react";

export function useVoice() {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // START LISTENING
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);

    recognition.onerror = () => {
      console.log("Recognition error");
      setListening(false);
    };

    recognition.onend = () => {
      console.log("Recognition ended");
      setListening(false);
    };

    recognition.start();
  };

  // STOP LISTENING
  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // TEXT → SPEAK
  const speak = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;
    utter.lang = "en-US";
    speechSynthesis.speak(utter);
  };

  return {
    listening,
    startListening,
    stopListening,
    speak,
  };
}

import { useEffect } from "react";

export default function ElevenLabsAgent() {
  useEffect(() => {
    // Avoid loading script multiple times
    if (!document.getElementById("elevenlabs-script")) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      script.id = "elevenlabs-script";
      script.async = true;
      document.body.appendChild(script);
    }

    // Create element only if not created
    if (!document.getElementById("elevenlabs-agent-widget")) {
      const widget = document.createElement("elevenlabs-convai");
      widget.id = "elevenlabs-agent-widget";
      widget.setAttribute("agent-id", "agent_9401ka3qb3xvf26tkbkajgd9c117");
      document.body.appendChild(widget);
    }
  }, []);

  return null; // It appears automatically like Chatbase
}

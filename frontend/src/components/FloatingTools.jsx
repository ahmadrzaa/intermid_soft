// src/components/FloatingTools.jsx
import { useEffect, useState, useRef } from "react";
import { FiX, FiSend } from "react-icons/fi";
import { useAuth } from "../AuthContext";
import api from "../services/api";
import "./floating-tools.css";

export default function FloatingTools() {
  const { user } = useAuth();

  // Only show inside app when logged in
  if (!user) return null;

  const [agentOpen, setAgentOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  // When agent panel opens first time -> greeting
  useEffect(() => {
    if (agentOpen && messages.length === 0) {
      setMessages([
        {
          from: "bot",
          text: `Hi ${user?.name || ""}, I’m your Cheque AI Agent. Ask me about today’s cheques, pending approvals, or overall summary.`,
        },
      ]);
    }
  }, [agentOpen]); // eslint-disable-line

  // Auto-focus input & scroll to last message when opening / updating
  useEffect(() => {
    if (agentOpen) {
      inputRef.current?.focus();
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [agentOpen, messages.length]);

  async function sendMessage(text) {
    const trimmed = (text || "").trim();
    if (!trimmed || loading) return;

    // Add user message
    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api
        .post("/api/agent/chat", { message: trimmed })
        .then((r) => r.data);

      const reply =
        res?.reply || "Sorry, I could not generate a reply. Please try again.";

      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text:
            "There was an error talking to the AI agent. Please check the backend /api/agent/chat route.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  // Quick buttons that just send pre-defined questions
  function handleQuick(q) {
    sendMessage(q);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="floating-tools-root">
      <div className="floating-tools-stack">
        {/* REAL WHATSAPP ICON */}
        <a
          title="Whatsapp"
          className="floating-btn floating-btn--whatsapp whatsap_btn"
          target="_blank"
          rel="noreferrer"
          href="https://wa.me/97317101120"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 105.7 103.5"
            className="floating-whatsapp-svg"
          >
            <path d="M73.8,63L73.8,63c0-0.8,0-0.9-0.2-0.9c-3.3-1.6-6.2-3-9-4.3c-0.6-0.3-0.6-0.3-1.2,0.6 c-0.7,0.9-1.4,1.7-2.1,2.5c-0.4,0.5-0.8,0.9-1.1,1.4c-0.9,1-2,1.3-3.2,0.8c-6.5-2.6-11.5-6.8-15.2-13c-0.8-1.3-0.7-2.4,0.3-3.6 c0.8-0.9,1.5-1.8,2.1-2.7l0.5-0.7c0.1-0.1,0.3-0.4-0.1-1.2c-0.9-2.1-1.7-4.2-2.6-6.2l-0.4-1.1c-1-2.4-1-2.4-3.5-2.3 c-1.1,0-1.9,0.3-2.5,0.9c-2.5,2.4-3.7,5.1-3.8,8.3c0.1,0.4,0.1,0.8,0.2,1.2c0.1,0.7,0.2,1.4,0.3,2c0.7,3.1,2.5,5.7,4.5,8.6 c6,8.8,13.4,14.3,22.5,16.9l0.3,0.1c2.5,0.7,4.8,1.4,7.1,0.6C71.7,69.3,73.6,67.2,73.8,63z" />
            <path d="M10.9,95.5c1.4-0.4,2.7-0.8,3.9-1.3l3.7-1.1c3.4-1.1,7-2.2,10.4-3.4c1.5-0.5,2.8-0.4,3.9,0.4 c6.9,3.6,14.5,5.2,22.5,4.8c6.3-0.3,12.6-2.1,18.5-5.2c7.3-3.9,13.2-9.7,17.1-16.8l0.1-0.1c4.5-7.9,6.4-16.9,5.4-26.1 c-1.1-10.2-5.2-18.9-12.2-25.9c-8.7-8.8-19-13.3-30.6-13.3c-2.9,0-5.7,0.2-8.4,0.7C25,11.8,10.2,28.7,9.3,49.4 C9,57.8,11,65.7,15.1,72.9c0.7,1.2,0.9,2.6,0.4,3.8l-1,2.8c-2,6-3.8,11.4-5.5,16.5c0.5-0.2,1-0.3,1.6-0.5L10.9,95.5z M14.6,87.3c0.5-1.5,0.9-2.8,1.5-4.2c0.4-1,0.7-2.1,1-3c0.6-1.7,1.2-3.4,1.8-5.2l0.1-0.4c0,0,0-0.1,0-0.1 c-4.8-7.2-7.2-15.1-7.1-23.3c0.3-14.7,6.6-26.2,18.8-34.3C38,12,46.2,9.7,55.1,10.2c7.3,0.4,14.3,2.7,20.1,6.5 c9.7,6.1,16.4,16.1,18.3,27.4c2.5,14.6-1.8,27.2-12.7,37.4c-6.3,6-14,9.5-22.8,10.5c-1.7,0.2-3.4,0.3-5.2,0.3 c-7.6,0-14.8-2.1-21.4-6.1c-1.9,0.6-3.8,1.2-5.6,1.8L25.6,88c-1.9,0.6-3.7,1.2-5.5,1.8l-1,0.3c-0.4,0.1-0.8,0.2-1.4,0.4l-4.6,1.3 L14.6,87.3z" />
          </svg>
        </a>

        {/* AI AGENT ICON */}
        <button
          type="button"
          className="floating-btn floating-btn--agent"
          onClick={() => setAgentOpen((v) => !v)}
          aria-label="Open Cheque AI Agent"
        >
          <img
            src="/intermid agent.webp"
            alt="INTERMID Agent"
            className="floating-agent-img"
          />
        </button>
      </div>

      {/* AI AGENT PANEL */}
      {agentOpen && (
        <div className="agent-panel agent-panel--elevated">
          <div className="agent-panel-header">
            <div className="agent-title-wrap">
              <span className="agent-title">Cheque AI Agent</span>
              <span className="agent-status">
                <span className="agent-status-dot" /> Online
              </span>
            </div>
            <button
              type="button"
              className="agent-close"
              onClick={() => setAgentOpen(false)}
            >
              <FiX />
            </button>
          </div>

          <div className="agent-panel-body">
            <div
              className="agent-messages"
              aria-live="polite"
              aria-label="Agent messages"
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={
                    m.from === "user"
                      ? "agent-msg agent-msg-user"
                      : "agent-msg agent-msg-bot"
                  }
                >
                  {m.text}
                </div>
              ))}
              {loading && <div className="agent-msg agent-msg-bot">Typing…</div>}
              <div ref={endRef} />
            </div>

            {/* Quick questions */}
            <div className="agent-quick">
              <button
                type="button"
                onClick={() => handleQuick("How many cheques today?")}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuick("How many cheques are pending approval?")
                }
              >
                Pending approvals
              </button>
              <button
                type="button"
                onClick={() => handleQuick("Give me overall cheque summary")}
              >
                Overall
              </button>
            </div>

            {/* Input */}
            <form className="agent-input-row" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                className="agent-input"
                placeholder="Ask about cheques, approvals..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="submit"
                className="agent-send"
                disabled={loading || !input.trim()}
                aria-label="Send"
                title="Send"
              >
                <FiSend />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}





 



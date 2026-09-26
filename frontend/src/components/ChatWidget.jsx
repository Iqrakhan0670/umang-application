import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const DEFAULT_ERROR_REPLY =
  "Sorry, I couldn't process that right now. Please try again, or request a call from the Results page.";

// Change this to your deployed backend URL when you go live
const BACKEND_URL = "http://localhost:5000/api/chat";

async function askBot(message) {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    return data.reply || DEFAULT_ERROR_REPLY;
  } catch (err) {
    console.error("Chat error:", err);
    return DEFAULT_ERROR_REPLY;
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me about fees, documents, or your claim status." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setLoading(true);

    const reply = await askBot(text);

    setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
      {open && (
        <div
          style={{
            width: "320px",
            maxHeight: "420px",
            background: "#faf7f0",
            border: "1px solid rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            marginBottom: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          <div
            style={{
              background: "#1b4332",
              color: "#faf7f0",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "serif",
            }}
          >
            <span>UMANG Help</span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "#faf7f0", cursor: "pointer" }}
            >
              <X size={18} />
            </button>
          </div>

          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: "auto", padding: "12px 16px", fontSize: "13px" }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "10px",
                  textAlign: m.from === "user" ? "right" : "left",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    background: m.from === "user" ? "#1b4332" : "#fff",
                    color: m.from === "user" ? "#faf7f0" : "#333",
                    border: m.from === "bot" ? "1px solid rgba(0,0,0,0.1)" : "none",
                    maxWidth: "85%",
                  }}
                >
                  {m.text}
                </span>
              </div>
            ))}
            {loading && (
              <div style={{ textAlign: "left", marginBottom: "10px" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.1)",
                    color: "#888",
                  }}
                >
                  Typing…
                </span>
              </div>
            )}
          </div>

          <form
            onSubmit={send}
            style={{ display: "flex", borderTop: "1px solid rgba(0,0,0,0.1)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              disabled={loading}
              style={{
                flex: 1,
                border: "none",
                padding: "10px 12px",
                fontSize: "13px",
                outline: "none",
                background: "transparent",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                border: "none",
                background: "none",
                padding: "0 14px",
                color: "#1b4332",
                cursor: "pointer",
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#1b4332",
          color: "#faf7f0",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
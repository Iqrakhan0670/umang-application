import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const FAQS = [
  {
    keywords: ["fee", "charge", "cost", "price", "299"],
    answer:
      "UMANG charges a one-time ₹299 Claim Assistance Fee when you start a claim, plus a 10% success fee — only if your money is actually recovered. Searching is always free.",
  },
  {
    keywords: ["success fee", "10%", "10 percent"],
    answer:
      "The 10% success fee applies only after your money is successfully recovered. If it's not recovered, you don't pay it.",
  },
  {
    keywords: ["document", "documents", "upload", "pan", "aadhaar"],
    answer:
      "Once your claim is submitted, go to Home → Your claims → View details to upload documents like PAN, Aadhaar, or bank proof.",
  },
  {
    keywords: ["status", "track", "claim update"],
    answer:
      "You can check your claim's status anytime from Home → Your claims → View details. It shows a full timeline.",
  },
  {
    keywords: ["call", "phone", "contact"],
    answer:
      "After you request a call from the Results page, our team will call you to explain the process — no payment is taken at that stage.",
  },
  {
    keywords: ["refund", "cancel"],
    answer:
      "You can withdraw your claim anytime before recovery — no success fee applies. The ₹299 assistance fee is non-refundable as it covers guidance already given.",
  },
  {
    keywords: ["what is umang", "about", "who are you"],
    answer:
      "UMANG helps you find unclaimed money in banks, mutual funds, and insurance policies, and assists you in claiming it back. We're an independent service, not affiliated with any government body.",
  },
  {
    keywords: ["search", "find money", "how it works"],
    answer:
      "Just search by name on the Search page — it's free, no account needed. If you find a match, you can start Claim Assistance.",
  },
];

const DEFAULT_REPLY =
  "I'm not sure about that yet — try asking about fees, documents, claim status, or how UMANG works. For anything else, please request a call from the Results page.";

function findAnswer(question) {
  const q = question.toLowerCase();
  for (const faq of FAQS) {
    if (faq.keywords.some((k) => q.includes(k))) {
      return faq.answer;
    }
  }
  return DEFAULT_REPLY;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me about fees, documents, or your claim status." },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const reply = findAnswer(text);
    setMessages((prev) => [
      ...prev,
      { from: "user", text },
      { from: "bot", text: reply },
    ]);
    setInput("");
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
          </div>

          <form
            onSubmit={send}
            style={{ display: "flex", borderTop: "1px solid rgba(0,0,0,0.1)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
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
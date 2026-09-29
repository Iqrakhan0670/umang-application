// api/chat.js
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ reply: "Please type a question." });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are UMANG Help Assistant. UMANG helps users find and claim unclaimed money from banks, mutual funds, and insurance policies. There is a one-time ₹299 Claim Assistance Fee charged when a claim is started, and a 10% success fee that applies only if the money is actually recovered. Searching is always free. Claim status can be checked from Home → Your claims → View details. If unsure, tell the user to request a call from the Results page. Keep answers short and friendly.",
        },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I don't have an answer for that.";
    res.status(200).json({ reply });
  } catch (err) {
    console.error("Groq API error:", err);
    res.status(500).json({ reply: "Sorry, something went wrong." });
  }
}
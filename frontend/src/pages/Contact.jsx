import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(""); // "", "sending", "sent", "error"

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      if (error) throw error;
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Contact form submit failed:", err);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-serif font-bold text-emerald-950 mb-2">Get in Touch</h1>
      <p className="text-gray-600 mb-10">
        Have a question about your unclaimed money or an ongoing claim? Reach out to us.
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Contact info */}
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Mail className="text-emerald-700 mt-1" size={20} />
            <div>
              <p className="font-medium text-gray-900">Email</p>
              <p className="text-gray-600 text-sm">support@yourdomain.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="text-emerald-700 mt-1" size={20} />
            <div>
              <p className="font-medium text-gray-900">Phone</p>
              <p className="text-gray-600 text-sm">+91 XXXXX XXXXX</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="text-emerald-700 mt-1" size={20} />
            <div>
              <p className="font-medium text-gray-900">Office</p>
              <p className="text-gray-600 text-sm">[Your registered address]</p>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1.5">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1.5">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:border-emerald-600"
            />
          </div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex items-center gap-2 bg-emerald-950 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-emerald-900 transition disabled:opacity-50"
          >
            <Send size={15} />
            {status === "sending" ? "Sending…" : "Send Message"}
          </button>
          {status === "sent" && (
            <p className="text-sm text-emerald-700">Thanks! We'll get back to you soon.</p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
          )}
        </form>
      </div>
    </div>
  );
}
import React from "react";
import { Linkedin, Twitter, Facebook, Instagram, Youtube } from "lucide-react";

export default function Footer({ setView }) {
  return (
    <footer className="bg-umang-dark text-white mt-10">
      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black">₹</span>
          </div>
          <div>
            <p className="font-extrabold text-sm">UMANG</p>
            <p className="text-xs text-white/50 max-w-xs">
              Independent unclaimed asset search &amp; claim assistance. Not
              affiliated with any government body or regulator.
            </p>
          </div>
        </div>

        <div className="flex gap-8 text-sm">
          <button onClick={() => setView("privacy")} className="text-white/70 hover:text-white transition">
            Privacy Policy
          </button>
          <button onClick={() => setView("terms")} className="text-white/70 hover:text-white transition">
            Terms
          </button>
          <span className="text-white/70">Contact</span>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" aria-label="LinkedIn" className="text-white/70 hover:text-white transition"><Linkedin size={16} /></a>
          <a href="#" aria-label="Twitter" className="text-white/70 hover:text-white transition"><Twitter size={16} /></a>
          <a href="#" aria-label="Facebook" className="text-white/70 hover:text-white transition"><Facebook size={16} /></a>
          <a href="#" aria-label="Instagram" className="text-white/70 hover:text-white transition"><Instagram size={16} /></a>
          <a href="#" aria-label="YouTube" className="text-white/70 hover:text-white transition"><Youtube size={16} /></a>
        </div>
      </div>
    </footer>
  );
}
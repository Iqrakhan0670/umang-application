import React from "react";

const SocialIcon = ({ path, label, viewBox = "0 0 24 24" }) => (
  <a
    href="#"
    aria-label={label}
    className="text-white/70 hover:text-white transition"
  >
    <svg
      width="16"
      height="16"
      viewBox={viewBox}
      fill="currentColor"
    >
      <path d={path} />
    </svg>
  </a>
);

const icons = {
  linkedin:
    "M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.11 20.45H3.56V9h3.55v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0z",

  twitter:
    "M23.95 4.57a9.83 9.83 0 0 1-2.83.78 4.93 4.93 0 0 0 2.17-2.73 9.87 9.87 0 0 1-3.13 1.2 4.92 4.92 0 0 0-8.38 4.49A13.96 13.96 0 0 1 1.64 3.16a4.92 4.92 0 0 0 1.52 6.57 4.9 4.9 0 0 1-2.23-.62v.06a4.92 4.92 0 0 0 3.95 4.83 4.93 4.93 0 0 1-2.22.08 4.93 4.93 0 0 0 4.6 3.42A9.87 9.87 0 0 1 0 19.54a13.93 13.93 0 0 0 7.55 2.21c9.06 0 14.02-7.5 14.02-14.02 0-.21 0-.43-.02-.64a10 10 0 0 0 2.45-2.55l-.05-.02z",

  facebook:
    "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z",

  instagram:
    "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.89 5.89 0 0 0-2.13 1.38A5.89 5.89 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.8.72 1.47 1.38 2.13.66.66 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.89 5.89 0 0 0 2.13-1.38 5.89 5.89 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.89 5.89 0 0 0-1.38-2.13A5.89 5.89 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z",

  youtube:
    "M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.6 15.6V8.4l6.4 3.6-6.4 3.6z",
};

export default function Footer({ setView }) {
  return (
    <footer className="bg-umang-dark text-white mt-10">

      <div
        className="
          w-full
          max-w-[1500px]
          mx-auto
          px-6 sm:px-8 lg:px-12 xl:px-16
          py-8
          flex flex-col
          lg:flex-row
          items-center
          justify-between
          gap-8
        "
      >

        {/* Brand */}
        <div className="flex items-center gap-3 max-w-[360px]">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black">
              ₹
            </span>
          </div>

          <div>
            <p className="font-extrabold text-sm">
              UMANG
            </p>

            <p className="text-xs text-white/50 leading-relaxed">
              Independent unclaimed asset search &amp; claim assistance.
              Not affiliated with any government body or regulator.
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-7 text-sm">
          <button
            onClick={() => setView("privacy")}
            className="text-white/70 hover:text-white transition"
          >
            Privacy Policy
          </button>

          <button
            onClick={() => setView("terms")}
            className="text-white/70 hover:text-white transition"
          >
            Terms
          </button>

          <span className="text-white/70">
            Contact
          </span>
        </div>

        {/* Social */}
        <div className="flex items-center gap-4">
          <SocialIcon
            path={icons.linkedin}
            label="LinkedIn"
          />

          <SocialIcon
            path={icons.twitter}
            label="Twitter"
          />

          <SocialIcon
            path={icons.facebook}
            label="Facebook"
          />

          <SocialIcon
            path={icons.instagram}
            label="Instagram"
          />

          <SocialIcon
            path={icons.youtube}
            label="YouTube"
          />
        </div>

      </div>
    </footer>
  );
}
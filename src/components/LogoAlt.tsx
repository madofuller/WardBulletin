import React from 'react';

// Alternative logo: abstract church window with a bulletin/paper inside
export default function LogoAlt({ size = 48 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="WardBulletin alternative logo"
    >
      {/* Church window shape */}
      <path d="M24 4C14 4 8 12 8 22v14a8 8 0 0 0 8 8h16a8 8 0 0 0 8-8V22C40 12 34 4 24 4z" fill="#F7C948" stroke="#1E3A8A" strokeWidth="2" />
      {/* Bulletin/paper inside */}
      <rect x="16" y="20" width="16" height="16" rx="2" fill="#fff" stroke="#1E3A8A" strokeWidth="1.5" />
      {/* Lines for text */}
      <rect x="19" y="25" width="10" height="2" rx="1" fill="#1E3A8A" />
      <rect x="19" y="29" width="10" height="2" rx="1" fill="#D1A545" />
      {/* Rays/community arcs */}
      <path d="M24 10v6" stroke="#1E3A8A" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 14c2-2 10-2 12 0" stroke="#1E3A8A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
} 
import React from 'react';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
}

export function UkraineCanadaRouteMark({ className }: Props) {
  return (
    <svg 
      className={cn("inline-block", className)} 
      viewBox="0 0 100 40" 
      xmlns="http://www.w3.org/2000/svg"
      style={{
        height: '0.95em',
        width: 'auto',
        verticalAlign: '-0.08em',
        marginLeft: '0.28em',
        filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.65))'
      }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="ua-clip">
          <rect x="5" y="10" width="30" height="20" rx="2" />
        </clipPath>
        <clipPath id="ca-clip">
          <rect x="65" y="10" width="30" height="20" rx="2" />
        </clipPath>
      </defs>

      {/* Ukraine Flag */}
      <g>
        <g clipPath="url(#ua-clip)">
          <rect x="5" y="10" width="30" height="10" fill="#0057B7" />
          <rect x="5" y="20" width="30" height="10" fill="#FFD700" />
        </g>
        <rect x="5" y="10" width="30" height="20" rx="2" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
      </g>

      {/* Dotted Arrow */}
      <path d="M 39 20 Q 50 11 60 20" fill="none" stroke="#FFD700" strokeWidth="2" strokeDasharray="2 2" />
      <polyline points="56,16 61,20 56,24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Canada Flag */}
      <g>
        <g clipPath="url(#ca-clip)">
          <rect x="65" y="10" width="7.5" height="20" fill="#D80621" />
          <rect x="72.5" y="10" width="15" height="20" fill="#FFFFFF" />
          <rect x="87.5" y="10" width="7.5" height="20" fill="#D80621" />
          {/* Maple Leaf */}
          <path d="M 80 12 L 81.5 15.5 L 84 14.5 L 82.5 17.5 L 85 18.5 L 82 20.5 L 81 26 L 79 26 L 78 20.5 L 75 18.5 L 77.5 17.5 L 76 14.5 L 78.5 15.5 Z" fill="#D80621" />
        </g>
        <rect x="65" y="10" width="30" height="20" rx="2" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

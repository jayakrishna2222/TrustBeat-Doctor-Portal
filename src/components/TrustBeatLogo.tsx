import React from 'react'
import logoAsset from '../assets/trustbeat_logo.png'

interface TrustBeatLogoProps {
  className?: string
  showTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const TrustBeatLogo: React.FC<TrustBeatLogoProps> = ({
  className = '',
  showTagline = true,
  size = 'md',
}) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <img
        src={logoAsset}
        alt="TrustBeat Doctor Portal"
        className={`object-contain ${
          size === 'sm' ? 'h-8' : size === 'lg' ? 'h-12' : 'h-10'
        }`}
        onError={(e) => {
          // If asset fails to load, fallback to SVG
          e.currentTarget.style.display = 'none'
        }}
      />
      {/* Visual SVG backup in case image is missing */}
      <div className="hidden" aria-hidden="true">
        <svg viewBox="0 0 180 44" className="h-10">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="none"
            stroke="#f97316"
            strokeWidth="2.5"
          />
          <text x="32" y="24" fill="#0f294a" fontSize="18" fontWeight="bold">Trust</text>
          <text x="76" y="24" fill="#0d9488" fontSize="18" fontWeight="bold">Beat</text>
          {showTagline && (
            <text x="32" y="36" fill="#64748b" fontSize="7" letterSpacing="0.5">
              YOUR HEART HEALTH, OUR INTELLIGENT CARE
            </text>
          )}
        </svg>
      </div>
    </div>
  )
}

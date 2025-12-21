"use client"

import { useState } from "react"
import Image from "next/image"

export function ClubLogo({ className = "w-16 h-16" }: { className?: string }) {
  const [imgError, setImgError] = useState(false)

  // Use image file with transparent background
  if (!imgError) {
    return (
      <div className={className} style={{ position: 'relative', display: 'inline-block' }}>
        <img
          src="/logo.png.png"
          alt="D.I.F. Club Logo"
          className="w-full h-full object-contain"
          onError={() => {
            setImgError(true)
          }}
          style={{ 
            backgroundColor: "transparent",
            display: 'block'
          }}
        />
      </div>
    )
  }

  // Fallback to SVG if image doesn't exist
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ backgroundColor: "transparent" }}
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#D4AF37", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#B8860B", stopOpacity: 1 }} />
        </linearGradient>
        <clipPath id="shieldClip">
          <path d="M 25 25 L 100 15 L 175 25 L 195 60 L 195 195 L 175 225 L 100 235 L 25 225 L 5 195 L 5 60 Z" />
        </clipPath>
      </defs>
      
      {/* Shield border (thick gold/bronze) */}
      <path
        d="M 20 20 L 100 10 L 180 20 L 200 60 L 200 200 L 180 230 L 100 240 L 20 230 L 0 200 L 0 60 Z"
        fill="url(#goldGradient)"
        stroke="#B8860B"
        strokeWidth="5"
      />
      
      {/* Inner shield area with diagonal sections */}
      <g clipPath="url(#shieldClip)">
        {/* Top-left yellow section */}
        <path
          d="M 5 60 L 5 195 L 100 235 L 100 60 Z"
          fill="#FFD700"
        />
        
        {/* Middle red section (widest) - diagonal band */}
        <path
          d="M 5 60 L 100 60 L 195 195 L 100 235 L 5 195 Z"
          fill="#DC143C"
        />
        
        {/* Bottom-right blue section */}
        <path
          d="M 100 60 L 195 60 L 195 195 L 100 235 Z"
          fill="#00008B"
        />
        
        {/* Diagonal dividing lines */}
        <line
          x1="5"
          y1="60"
          x2="195"
          y2="195"
          stroke="#000000"
          strokeWidth="2"
        />
        <line
          x1="100"
          y1="60"
          x2="100"
          y2="235"
          stroke="#000000"
          strokeWidth="2"
        />
      </g>
      
      {/* D.I.F. text in center red band - horizontal orientation */}
      <text
        x="100"
        y="145"
        fontSize="36"
        fontWeight="bold"
        fill="url(#goldGradient)"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        letterSpacing="6"
      >
        D<tspan fontSize="24" dx="2">.</tspan>I<tspan fontSize="24" dx="2">.</tspan>F<tspan fontSize="24" dx="2">.</tspan>
      </text>
    </svg>
  )
}


"use client";

import React from "react";
import Link from "next/link";

interface KtcLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  href?: string;
  variant?: "dark" | "light";
}

export default function KtcLogo({
  className = "",
  size = "md",
  showText = true,
  href = "/",
  variant = "light",
}: KtcLogoProps) {
  const sizeMap = {
    sm: { icon: "h-6 w-6", text: "text-base" },
    md: { icon: "h-8 w-8", text: "text-lg" },
    lg: { icon: "h-10 w-10", text: "text-xl" },
    xl: { icon: "h-12 w-12", text: "text-2xl" },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official KodeToCareer Stylized 'K' Icon */}
      <svg
        className={`${currentSize.icon} shrink-0`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ktcLogoGradPrimaryLight" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00C6FF" />
            <stop offset="50%" stopColor="#0072FF" />
            <stop offset="100%" stopColor="#0052D4" />
          </linearGradient>
        </defs>
        {/* Left vertical pillar */}
        <rect x="15" y="15" width="18" height="70" rx="9" fill="url(#ktcLogoGradPrimaryLight)" />
        {/* Upper diagonal arm */}
        <path
          d="M38 52 L68 18 C71 14 77 14 80 18 L82 20 C85 24 85 30 81 34 L54 62 Z"
          fill="url(#ktcLogoGradPrimaryLight)"
        />
        {/* Lower diagonal arm */}
        <path
          d="M52 50 L78 78 C82 82 82 87 78 90 L75 92 C71 95 65 94 61 90 L38 64 Z"
          fill="url(#ktcLogoGradPrimaryLight)"
        />
      </svg>

      {showText && (
        <span className={`font-extrabold tracking-tight font-sans ${currentSize.text}`}>
          <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
            KodeToCareer
          </span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

import { Snowflake } from "lucide-react";
import React, { useState, useEffect } from "react";

const TechQuizHeader = () => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [scanlinePosition, setScanlinePosition] = useState(0);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 4000);

    const scanlineInterval = setInterval(() => {
      setScanlinePosition((prev) => (prev + 1) % 100);
    }, 50);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(scanlineInterval);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Circuit board background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 400 200">
          <defs>
            <pattern
              id="circuit"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 20h40M20 0v40M10 10h20M30 30h10M10 30h10"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <circle cx="20" cy="20" r="2" fill="currentColor" />
              <circle cx="10" cy="10" r="1" fill="currentColor" />
              <circle cx="30" cy="30" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#circuit)"
            className="text-cyan-400"
          />
        </svg>
      </div>

      {/* Scanning line effect */}
      <div
        className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 transition-all duration-100"
        style={{ top: `${scanlinePosition}%` }}
      />

      {/* Main content container */}
      <div className="relative px-8 py-12 text-center">
        {/* Terminal-style header */}
        <div className="mb-6 font-mono text-green-400 text-sm opacity-80">
          <span className="animate-pulse">$</span> initializing quiz_system...
        </div>

        {/* Main TEE-QUIZ text */}
        <div className="relative">
          {/* Glitch effect overlay */}
          {glitchActive && (
            <div className="absolute inset-0 pointer-events-none">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-wider text-red-500 opacity-70 transform translate-x-1 -translate-y-0.5">
                TEE-QUIZ
              </h1>
              <h1 className="absolute top-0 text-4xl md:text-6xl lg:text-7xl font-black tracking-wider text-blue-500 opacity-70 transform -translate-x-1 translate-y-0.5">
                TEE-QUIZ
              </h1>
            </div>
          )}

          {/* Main text with tech styling */}
          <h1 className="relative text-4xl md:text-6xl lg:text-7xl font-black tracking-wider">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              TEE
            </span>
            <span className="text-slate-300 mx-2">-</span>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              QUIZ
            </span>
          </h1>

          {/* Underlining tech elements */}
          <div className="flex justify-center mt-4 space-x-4">
            <div className="h-0.5 w-16 bg-gradient-to-r from-cyan-400 to-transparent"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="h-0.5 w-16 bg-gradient-to-l from-purple-400 to-transparent"></div>
          </div>
        </div>

        {/* Hexagonal decorative elements */}
        <div className="absolute top-4 left-4 w-8 h-8 opacity-30">
          <Snowflake className="text-cyan-400" />
        </div>
        <div className="absolute top-8 right-8 w-6 h-6 opacity-20">
          <Snowflake className="text-cyan-400" />
        </div>
        <div className="absolute bottom-4 left-8 w-4 h-4 opacity-25">
          <Snowflake className="text-cyan-400" />
        </div>

        {/* Data stream effect */}
        <div className="absolute right-0 top-0 h-full w-px opacity-30">
          <div className="h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Bottom border with tech styling */}
      <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
    </div>
  );
};

export default TechQuizHeader;

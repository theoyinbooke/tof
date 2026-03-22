import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="flex h-dvh w-full items-center justify-center overflow-hidden bg-[#0A0A0A] px-5 sm:px-8">
      <div className="flex w-full max-w-6xl flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        {/* Left — Copy & CTAs */}
        <div className="flex max-w-md flex-col items-center text-center lg:max-w-lg lg:items-start lg:text-left">
          {/* Logo mark */}
          <div className="mb-4 flex items-center gap-2.5 lg:mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00D632]">
              <span className="text-sm font-bold text-black">T</span>
            </div>
            <span className="text-sm font-semibold tracking-wide text-white/70">
              TheOyinbooke Foundation
            </span>
          </div>

          <h1 className="text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
            Empowering futures
            <br />
            <span className="text-[#00D632]">through education.</span>
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-white/50 sm:mt-4 sm:text-base lg:max-w-sm">
            A holistic platform connecting beneficiaries, mentors, and
            facilitators to build lasting educational impact.
          </p>

          <div className="mt-6 flex gap-3 sm:mt-8">
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="h-11 rounded-full bg-[#00D632] px-6 text-sm font-semibold text-black transition-all hover:brightness-110 active:scale-[0.97]">
                Get Started
              </button>
            </SignUpButton>

            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="h-11 rounded-full border border-white/15 px-6 text-sm font-semibold text-white transition-all hover:border-white/30 hover:bg-white/5 active:scale-[0.97]">
                Sign In
              </button>
            </SignInButton>
          </div>

          {/* Trust bar */}
          <div className="mt-6 flex items-center gap-4 text-[11px] font-medium tracking-wide text-white/30 uppercase sm:mt-8">
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#00D632" strokeWidth="1.5" />
                <path d="M4 6l1.5 1.5L8 5" stroke="#00D632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Mentorship
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#00D632" strokeWidth="1.5" />
                <path d="M4 6l1.5 1.5L8 5" stroke="#00D632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Assessments
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#00D632" strokeWidth="1.5" />
                <path d="M4 6l1.5 1.5L8 5" stroke="#00D632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Support
            </span>
          </div>
        </div>

        {/* Right — Animated SVG */}
        <div className="relative flex w-full max-w-[280px] items-center justify-center sm:max-w-xs lg:max-w-sm">
          <NetworkSVG />
        </div>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated SVG — growth network representing connected education     */
/* ------------------------------------------------------------------ */
function NetworkSVG() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full"
      aria-hidden="true"
    >
      <defs>
        {/* Glow filter for the green accent */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="glow-lg" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradient for the central orb */}
        <radialGradient id="orbGrad" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#00D632" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00D632" stopOpacity="0" />
        </radialGradient>

        {/* Subtle grid pattern */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeOpacity="0.03" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Background grid */}
      <rect width="400" height="400" fill="url(#grid)" />

      {/* Outer ring — slow rotation */}
      <g style={{ transformOrigin: "200px 200px" }}>
        <circle cx="200" cy="200" r="160" stroke="white" strokeOpacity="0.04" strokeWidth="0.5" fill="none">
          <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="120s" repeatCount="indefinite" />
        </circle>
        {/* Orbiting dots on the ring */}
        <circle r="3" fill="#00D632" fillOpacity="0.3">
          <animateMotion dur="120s" repeatCount="indefinite" path="M200,40 A160,160 0 1,1 199.9,40" />
        </circle>
        <circle r="2" fill="white" fillOpacity="0.15">
          <animateMotion dur="120s" repeatCount="indefinite" path="M200,40 A160,160 0 1,1 199.9,40" begin="40s" />
        </circle>
        <circle r="2.5" fill="#00D632" fillOpacity="0.2">
          <animateMotion dur="120s" repeatCount="indefinite" path="M200,40 A160,160 0 1,1 199.9,40" begin="80s" />
        </circle>
      </g>

      {/* Middle ring */}
      <circle cx="200" cy="200" r="110" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" fill="none" strokeDasharray="4 8">
        <animateTransform attributeName="transform" type="rotate" from="360 200 200" to="0 200 200" dur="90s" repeatCount="indefinite" />
      </circle>

      {/* Inner ring */}
      <circle cx="200" cy="200" r="60" stroke="#00D632" strokeOpacity="0.08" strokeWidth="0.5" fill="none">
        <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="60s" repeatCount="indefinite" />
      </circle>

      {/* Connection lines — from center to nodes */}
      <g stroke="#00D632" strokeOpacity="0.12" strokeWidth="0.7">
        {/* Top */}
        <line x1="200" y1="200" x2="200" y2="80">
          <animate attributeName="strokeOpacity" values="0.06;0.18;0.06" dur="4s" repeatCount="indefinite" />
        </line>
        {/* Top-right */}
        <line x1="200" y1="200" x2="300" y2="110">
          <animate attributeName="strokeOpacity" values="0.06;0.18;0.06" dur="4s" begin="0.7s" repeatCount="indefinite" />
        </line>
        {/* Right */}
        <line x1="200" y1="200" x2="320" y2="220">
          <animate attributeName="strokeOpacity" values="0.06;0.18;0.06" dur="4s" begin="1.4s" repeatCount="indefinite" />
        </line>
        {/* Bottom-right */}
        <line x1="200" y1="200" x2="280" y2="310">
          <animate attributeName="strokeOpacity" values="0.06;0.18;0.06" dur="4s" begin="2.1s" repeatCount="indefinite" />
        </line>
        {/* Bottom-left */}
        <line x1="200" y1="200" x2="110" y2="300">
          <animate attributeName="strokeOpacity" values="0.06;0.18;0.06" dur="4s" begin="2.8s" repeatCount="indefinite" />
        </line>
        {/* Left */}
        <line x1="200" y1="200" x2="80" y2="180">
          <animate attributeName="strokeOpacity" values="0.06;0.18;0.06" dur="4s" begin="3.5s" repeatCount="indefinite" />
        </line>
      </g>

      {/* Cross-connections between outer nodes */}
      <g stroke="white" strokeOpacity="0.04" strokeWidth="0.5">
        <line x1="200" y1="80" x2="300" y2="110" />
        <line x1="300" y1="110" x2="320" y2="220" />
        <line x1="320" y1="220" x2="280" y2="310" />
        <line x1="280" y1="310" x2="110" y2="300" />
        <line x1="110" y1="300" x2="80" y2="180" />
        <line x1="80" y1="180" x2="200" y2="80" />
      </g>

      {/* Central glow orb */}
      <circle cx="200" cy="200" r="80" fill="url(#orbGrad)">
        <animate attributeName="r" values="75;85;75" dur="6s" repeatCount="indefinite" />
      </circle>

      {/* Central node — the foundation */}
      <circle cx="200" cy="200" r="18" fill="#0A0A0A" stroke="#00D632" strokeWidth="1.5" filter="url(#glow)">
        <animate attributeName="strokeOpacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Inner green dot */}
      <circle cx="200" cy="200" r="5" fill="#00D632" fillOpacity="0.8">
        <animate attributeName="r" values="4;6;4" dur="3s" repeatCount="indefinite" />
        <animate attributeName="fillOpacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* Outer nodes — representing beneficiaries, mentors, facilitators */}
      {/* Node: Top (Mentors) */}
      <g>
        <circle cx="200" cy="80" r="10" fill="#0A0A0A" stroke="#00D632" strokeWidth="1" strokeOpacity="0.5">
          <animate attributeName="strokeOpacity" values="0.3;0.7;0.3" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="80" r="3" fill="#00D632" fillOpacity="0.6">
          <animate attributeName="fillOpacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Node: Top-right (Sessions) */}
      <g>
        <circle cx="300" cy="110" r="8" fill="#0A0A0A" stroke="white" strokeWidth="0.8" strokeOpacity="0.2">
          <animate attributeName="strokeOpacity" values="0.1;0.35;0.1" dur="5s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="300" cy="110" r="2.5" fill="white" fillOpacity="0.3">
          <animate attributeName="fillOpacity" values="0.2;0.5;0.2" dur="5s" begin="0.5s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Node: Right (Assessments) */}
      <g>
        <circle cx="320" cy="220" r="11" fill="#0A0A0A" stroke="#00D632" strokeWidth="1" strokeOpacity="0.4">
          <animate attributeName="strokeOpacity" values="0.2;0.6;0.2" dur="4.5s" begin="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="320" cy="220" r="3.5" fill="#00D632" fillOpacity="0.5">
          <animate attributeName="fillOpacity" values="0.3;0.7;0.3" dur="4.5s" begin="1s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Node: Bottom-right (Support) */}
      <g>
        <circle cx="280" cy="310" r="7" fill="#0A0A0A" stroke="white" strokeWidth="0.8" strokeOpacity="0.15">
          <animate attributeName="strokeOpacity" values="0.08;0.25;0.08" dur="5.5s" begin="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="280" cy="310" r="2" fill="white" fillOpacity="0.25">
          <animate attributeName="fillOpacity" values="0.15;0.4;0.15" dur="5.5s" begin="1.5s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Node: Bottom-left (Beneficiaries) */}
      <g>
        <circle cx="110" cy="300" r="12" fill="#0A0A0A" stroke="#00D632" strokeWidth="1" strokeOpacity="0.4">
          <animate attributeName="strokeOpacity" values="0.2;0.6;0.2" dur="4s" begin="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="110" cy="300" r="4" fill="#00D632" fillOpacity="0.5">
          <animate attributeName="fillOpacity" values="0.3;0.7;0.3" dur="4s" begin="2s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Node: Left (Resources) */}
      <g>
        <circle cx="80" cy="180" r="9" fill="#0A0A0A" stroke="white" strokeWidth="0.8" strokeOpacity="0.2">
          <animate attributeName="strokeOpacity" values="0.1;0.35;0.1" dur="5s" begin="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="80" cy="180" r="2.5" fill="white" fillOpacity="0.3">
          <animate attributeName="fillOpacity" values="0.2;0.5;0.2" dur="5s" begin="2.5s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Tiny floating particles */}
      <circle r="1.5" fill="#00D632" fillOpacity="0.2">
        <animateMotion dur="18s" repeatCount="indefinite" path="M150,150 Q200,100 250,150 Q300,200 250,250 Q200,300 150,250 Q100,200 150,150" />
        <animate attributeName="fillOpacity" values="0.1;0.35;0.1" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle r="1" fill="white" fillOpacity="0.15">
        <animateMotion dur="22s" repeatCount="indefinite" path="M250,120 Q300,170 280,230 Q250,290 200,280 Q140,270 130,210 Q120,150 170,120 Q220,90 250,120" />
        <animate attributeName="fillOpacity" values="0.08;0.25;0.08" dur="5s" repeatCount="indefinite" />
      </circle>
      <circle r="1.2" fill="#00D632" fillOpacity="0.15">
        <animateMotion dur="25s" repeatCount="indefinite" path="M180,250 Q130,200 160,140 Q190,80 240,110 Q290,140 280,200 Q270,260 230,280 Q190,300 180,250" begin="3s" />
        <animate attributeName="fillOpacity" values="0.05;0.2;0.05" dur="6s" repeatCount="indefinite" />
      </circle>

      {/* Pulse ring from center */}
      <circle cx="200" cy="200" r="20" fill="none" stroke="#00D632" strokeWidth="0.8">
        <animate attributeName="r" values="20;120" dur="5s" repeatCount="indefinite" />
        <animate attributeName="strokeOpacity" values="0.3;0" dur="5s" repeatCount="indefinite" />
      </circle>
      <circle cx="200" cy="200" r="20" fill="none" stroke="#00D632" strokeWidth="0.5">
        <animate attributeName="r" values="20;120" dur="5s" begin="2.5s" repeatCount="indefinite" />
        <animate attributeName="strokeOpacity" values="0.2;0" dur="5s" begin="2.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

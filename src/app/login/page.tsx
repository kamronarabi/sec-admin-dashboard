"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import NeuralBackground from "@/components/ui/flow-field-background";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Flow field background */}
      <div className="absolute inset-0">
        <NeuralBackground
          color="#2196F3"
          trailOpacity={0.08}
          particleCount={700}
          speed={0.7}
        />
      </div>

      {/* Radial glow behind the card */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 600px 400px at 50% 50%, rgba(33,150,243,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Login card */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Glass card */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "0 0 40px rgba(33,150,243,0.08), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Top azure accent line */}
            <div
              className="h-[2px] w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, #2196F3 30%, #42A5F5 50%, #2196F3 70%, transparent 100%)",
              }}
            />

            <div className="px-8 pt-10 pb-10">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <div
                  className="relative"
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(33,150,243,0.3))",
                  }}
                >
                  <Image
                    src="/SECLOGO.png"
                    alt="SEC @ UF"
                    width={72}
                    height={72}
                    priority
                  />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-8">
                <h1
                  className="text-xl font-semibold tracking-wide mb-1"
                  style={{ color: "rgba(255,255,255,0.95)" }}
                >
                  Software Engineering Club
                </h1>
                <p
                  className="text-xs tracking-[0.25em] uppercase"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Presidential portal
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-8">
                <div
                  className="flex-1 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                  }}
                />
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ background: "#2196F3", boxShadow: "0 0 6px #2196F3" }}
                />
                <div
                  className="flex-1 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                  }}
                />
              </div>

              {/* Sign in button */}
              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="group relative w-full flex items-center justify-center gap-3 rounded-lg px-5 py-3 text-sm font-medium transition-all duration-300 cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(33,150,243,0.15) 0%, rgba(33,150,243,0.08) 100%)",
                  border: "1px solid rgba(33,150,243,0.25)",
                  color: "rgba(255,255,255,0.9)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(33,150,243,0.25) 0%, rgba(33,150,243,0.15) 100%)";
                  e.currentTarget.style.borderColor = "rgba(33,150,243,0.5)";
                  e.currentTarget.style.boxShadow =
                    "0 0 20px rgba(33,150,243,0.15), inset 0 1px 0 rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(33,150,243,0.15) 0%, rgba(33,150,243,0.08) 100%)";
                  e.currentTarget.style.borderColor = "rgba(33,150,243,0.25)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Google icon */}
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>

              {/* Footer text */}
              <p
                className="text-center mt-6 text-[11px] tracking-wide"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                Authorized personnel only
              </p>
            </div>

            {/* Bottom azure accent line */}
            <div
              className="h-[1px] w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 10%, rgba(33,150,243,0.3) 50%, transparent 90%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

interface KabutenLogoProps {
  variant?: "hero" | "navbar";
}

export default function KabutenLogo({ variant = "hero" }: KabutenLogoProps) {
  const sizeClass = variant === "hero" ? "text-[90px]" : "text-[56px]";

  return (
    <h1
      className={`kabuten-logo font-[var(--font-orbitron)] font-bold tracking-[0.15em] leading-none select-none ${sizeClass}`}
      style={{ fontFamily: "var(--font-orbitron)" }}
    >
      KABUTEN
    </h1>
  );
}

"use client";

import Link from "next/link";

export function Logo({
  variant = "full", // "full" | "icon"
  theme = "dark", // "dark" (for white/light bg) | "light" (for dark bg)
  size = "md", // "sm" | "md" | "lg"
  href = "/",
  className = "",
}) {
  const sizes = {
    sm: { icon: 30, title: "1.15rem", subtitle: "0.65rem" },
    md: { icon: 40, title: "1.4rem", subtitle: "0.72rem" },
    lg: { icon: 50, title: "1.75rem", subtitle: "0.82rem" },
  };

  const currentSize = sizes[size] || sizes.md;
  const isDark = theme === "dark";

  const logoContent = (
    <div className={`d-inline-flex align-items-center gap-2.5 text-decoration-none ${className}`}>
      {/* Scalable SVG Icon Mark */}
      <div className="position-relative flex-shrink-0" style={{ width: currentSize.icon, height: currentSize.icon }}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-100 h-100"
          style={{ filter: "drop-shadow(0 3px 6px rgba(37, 99, 235, 0.25))" }}
        >
          <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="boltGradient" x1="16" y1="8" x2="32" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Background Rounded Frame */}
          <rect width="48" height="48" rx="14" fill="url(#logoGradient)" />

          {/* Smartphone Casing Inner Stroke */}
          <rect x="8" y="6" width="32" height="36" rx="7" stroke="#ffffff" strokeWidth="2.2" strokeOpacity="0.45" fill="none" />

          {/* Lightning Bolt Core Icon */}
          <path
            d="M27 8L15 25H24L21 40L33 23H24L27 8Z"
            fill="url(#boltGradient)"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Circuit Tech Accent Nodes */}
          <circle cx="12" cy="12" r="2" fill="#93c5fd" />
          <circle cx="36" cy="36" r="2" fill="#93c5fd" />
        </svg>
      </div>

      {/* Typography Brand Mark */}
      {variant === "full" && (
        <div className="d-flex flex-column justify-content-center" style={{ lineHeight: "1.15" }}>
          <div
            className="fw-extrabold text-start d-flex align-items-center"
            style={{
              fontSize: currentSize.title,
              letterSpacing: "-0.03em",
              color: isDark ? "#0f172a" : "#ffffff",
            }}
          >
            <span>Electro</span>
            <span style={{ color: "#2563eb" }}>Vault</span>
          </div>
          <div
            className="fw-bold text-uppercase text-start"
            style={{
              fontSize: currentSize.subtitle,
              letterSpacing: "0.08em",
              color: isDark ? "#64748b" : "rgba(255, 255, 255, 0.75)",
            }}
          >
            Certified Refurbished
          </div>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="text-decoration-none">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

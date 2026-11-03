"use client"

export function VoiceOrb({
  seed,
  size,
  className,
}: {
  seed: string
  size: number
  className?: string
}) {
  const hue = hueFromSeed(seed)
  const accentHue = (hue + 145) % 360
  const warmHue = (hue + 275) % 360

  return (
    <span
      aria-hidden="true"
      className={`voice-orb ${className ?? ""}`}
      style={{
        position: "relative",
        display: "inline-block",
        overflow: "hidden",
        isolation: "isolate",
        flexShrink: 0,
        width: size,
        height: size,
        border: "1px solid rgb(255 255 255 / 28%)",
        borderRadius: "50%",
        background: `radial-gradient(ellipse at 32% 28%, #fff 0%, transparent 18%), radial-gradient(ellipse at 36% 34%, hsl(${warmHue} 90% 78%) 0%, transparent 42%), radial-gradient(ellipse at 70% 66%, hsl(${accentHue} 88% 62%) 0%, transparent 44%), radial-gradient(ellipse at 65% 28%, hsl(${(hue + 45) % 360} 95% 66%) 0%, transparent 43%), linear-gradient(135deg, hsl(${hue} 72% 54%), hsl(${(hue + 55) % 360} 65% 30%) 58%, hsl(${accentHue} 75% 38%))`,
        boxShadow: `inset 0 1px 5px rgb(255 255 255 / 35%), 0 2px 12px hsl(${hue} 75% 55% / 35%)`,
      }}
    >
      <span
        className="voice-orb__sheen"
        style={{
          position: "absolute",
          inset: "-35%",
          borderRadius: "50%",
          background: `conic-gradient(from 0deg, transparent 0deg, hsl(${hue} 100% 95% / 70%) 55deg, transparent 105deg, hsl(${accentHue} 95% 65% / 85%) 175deg, transparent 230deg, hsl(${warmHue} 95% 65% / 75%) 300deg, transparent 360deg)`,
          filter: "blur(5px)",
          animation: "voice-orb-drift 7s linear infinite",
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: "18%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 35% 30%, rgb(255 255 255 / 35%), transparent 58%)",
          filter: "blur(3px)",
        }}
      />
    </span>
  )
}

function hueFromSeed(seed: string) {
  let hash = 0

  for (const character of seed) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }

  return hash % 360
}

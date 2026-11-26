"use client";

export function AmbientBackground() {
  const glows = [
    {
      gradient: "radial-gradient(circle at 50% 50%, #FF968C 0%, #E8799A 35%, transparent 72%)",
      size: "70vw",
      top: "-10%",
      left: "-5%",
      opacity: 0.45,
      duration: "22s",
      dir: "normal",
      delay: "0s",
      orbit: 1,
    },
    {
      gradient: "radial-gradient(circle at 50% 50%, #A52C78 0%, #773A91 40%, transparent 75%)",
      size: "65vw",
      top: "0%",
      left: "45%",
      opacity: 0.4,
      duration: "30s",
      dir: "reverse",
      delay: "4s",
      orbit: 2,
    },
    {
      gradient: "radial-gradient(circle at 50% 50%, #087F9F 0%, #00A6A1 40%, transparent 75%)",
      size: "60vw",
      top: "5%",
      left: "75%",
      opacity: 0.35,
      duration: "38s",
      dir: "normal",
      delay: "8s",
      orbit: 3,
    },
    {
      gradient: "radial-gradient(circle at 50% 50%, #503D9B 0%, #153D83 45%, transparent 78%)",
      size: "75vw",
      top: "40%",
      left: "-15%",
      opacity: 0.3,
      duration: "45s",
      dir: "reverse",
      delay: "12s",
      orbit: 4,
    },
    {
      gradient: "radial-gradient(circle at 50% 50%, #A52C78 0%, #FF968C 35%, transparent 70%)",
      size: "55vw",
      top: "55%",
      left: "70%",
      opacity: 0.35,
      duration: "28s",
      dir: "normal",
      delay: "16s",
      orbit: 5,
    },
    {
      gradient: "radial-gradient(circle at 50% 50%, #153D83 0%, #503D9B 40%, transparent 75%)",
      size: "65vw",
      top: "75%",
      left: "20%",
      opacity: 0.3,
      duration: "34s",
      dir: "reverse",
      delay: "20s",
      orbit: 1,
    },
    {
      gradient: "radial-gradient(circle at 50% 50%, #00A6A1 0%, #087F9F 40%, transparent 75%)",
      size: "50vw",
      top: "85%",
      left: "60%",
      opacity: 0.25,
      duration: "42s",
      dir: "normal",
      delay: "24s",
      orbit: 2,
    },
  ];

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{ isolation: "isolate" }}
    >
      {glows.map((glow, i) => (
        <div
          key={i}
          className="ambient-glow absolute rounded-full"
          style={{
            left: glow.left,
            top: glow.top,
            width: glow.size,
            height: glow.size,
            background: glow.gradient,
            opacity: glow.opacity,
            filter: "blur(90px)",
            animation: `ambient-orbit-${glow.orbit} ${glow.duration} ${glow.dir} infinite`,
            animationDelay: glow.delay,
            mixBlendMode: "screen",
            willChange: "transform, opacity",
          }}
        />
      ))}
      {/* subtle vignette to keep edges dark */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, #080810 95%)",
          opacity: 0.6,
        }}
      />
    </div>
  );
}

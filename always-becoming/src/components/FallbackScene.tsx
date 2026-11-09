export default function FallbackScene({ progress }: { progress: number }) {
  const state = Math.round(progress),
    warm = state === 0 || state === 1 || state === 8 || state === 9;
  return (
    <div
      className={`fallback-scene ${warm ? "warm" : "cool"}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="halo">
            <stop stopColor={warm ? "#ab7d4b" : "#39738d"} stopOpacity=".24" />
            <stop offset="1" stopColor="#090b0e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="metal">
            <stop stopColor="#69513b" />
            <stop offset=".4" stopColor={warm ? "#e9c99f" : "#a5c4cc"} />
            <stop offset=".6" stopColor={warm ? "#9e7549" : "#386072"} />
            <stop offset="1" stopColor="#303130" />
          </linearGradient>
        </defs>
        <ellipse cx="805" cy="440" rx="500" ry="470" fill="url(#halo)" />
        <g
          transform={`translate(805 435) rotate(${-32 + state * 12})`}
          fill="none"
          stroke="url(#metal)"
        >
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse
              key={i}
              rx={200 + i * 10}
              ry={85 + i * 9}
              transform={`rotate(${i * 24})`}
              strokeWidth={i === 3 ? 8 : 2}
              opacity={0.25 + i * 0.1}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

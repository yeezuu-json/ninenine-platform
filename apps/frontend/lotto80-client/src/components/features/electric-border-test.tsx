/**
 * Electric Border Test Component
 *
 * Smoother, cleaner animated electric/lightning border effect
 * Based on the layered approach with SVG turbulence filter
 */
export default function ElectricBorderTest() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "oklch(0.145 0 0)",
        color: "oklch(0.985 0 0)",
        overflow: "hidden",
      }}
    >
      {/* SVG Filter Definition */}
      <svg style={{ position: "absolute" }}>
        <defs>
          <filter
            id="turbulent-displace"
            colorInterpolationFilters="sRGB"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type="turbulence"
              baseFrequency="0.02"
              numOctaves="10"
              result="noise1"
              seed="1"
            />
            <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
              <animate
                attributeName="dy"
                values="700; 0"
                dur="6s"
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feTurbulence
              type="turbulence"
              baseFrequency="0.02"
              numOctaves="10"
              result="noise2"
              seed="1"
            />
            <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
              <animate
                attributeName="dy"
                values="0; -700"
                dur="6s"
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feTurbulence
              type="turbulence"
              baseFrequency="0.02"
              numOctaves="10"
              result="noise3"
              seed="2"
            />
            <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
              <animate
                attributeName="dx"
                values="490; 0"
                dur="6s"
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feTurbulence
              type="turbulence"
              baseFrequency="0.02"
              numOctaves="10"
              result="noise4"
              seed="2"
            />
            <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
              <animate
                attributeName="dx"
                values="0; -490"
                dur="6s"
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
            <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
            <feBlend
              in="part1"
              in2="part2"
              mode="color-dodge"
              result="combinedNoise"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="combinedNoise"
              scale="30"
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>

      {/* Card Container */}
      <div
        style={{
          padding: "2px",
          borderRadius: "24px",
          position: "relative",
          background: `linear-gradient(-30deg, oklch(from #dd8448 0.3 calc(c / 2) h / 0.4), transparent, oklch(from #dd8448 0.3 calc(c / 2) h / 0.4)), linear-gradient(to bottom, oklch(0.185 0 0), oklch(0.185 0 0))`,
        }}
      >
        {/* Inner Container */}
        <div style={{ position: "relative" }}>
          {/* Border Outer */}
          <div
            style={{
              border: "2px solid rgba(221, 132, 72, 0.5)",
              borderRadius: "24px",
              paddingRight: "4px",
              paddingBottom: "4px",
            }}
          >
            {/* Main Card with SVG Filter */}
            <div
              style={{
                width: "350px",
                height: "500px",
                borderRadius: "24px",
                border: "2px solid #dd8448",
                marginTop: "-4px",
                marginLeft: "-4px",
                filter: "url(#turbulent-displace)",
                backgroundColor: "oklch(0.185 0 0)",
              }}
            />
          </div>

          {/* Glow Layer 1 */}
          <div
            style={{
              border: "2px solid rgba(221, 132, 72, 0.6)",
              borderRadius: "24px",
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              filter: "blur(1px)",
              pointerEvents: "none",
            }}
          />

          {/* Glow Layer 2 */}
          <div
            style={{
              border: "2px solid #dd8448",
              borderRadius: "24px",
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              filter: "blur(4px)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Overlay 1 */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "24px",
            opacity: 1,
            mixBlendMode: "overlay",
            transform: "scale(1.1)",
            filter: "blur(16px)",
            background:
              "linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)",
            pointerEvents: "none",
          }}
        />

        {/* Overlay 2 */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "24px",
            opacity: 0.5,
            mixBlendMode: "overlay",
            transform: "scale(1.1)",
            filter: "blur(16px)",
            background:
              "linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)",
            pointerEvents: "none",
          }}
        />

        {/* Background Glow */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "24px",
            filter: "blur(32px)",
            transform: "scale(1.1)",
            opacity: 0.3,
            zIndex: -1,
            background:
              "linear-gradient(-30deg, #dd8448, transparent, #dd8448)",
            pointerEvents: "none",
          }}
        />

        {/* Content Container */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Content Top */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "48px",
              paddingBottom: "16px",
              height: "100%",
            }}
          >
            <div
              style={{
                background:
                  "radial-gradient(47.2% 50% at 50.39% 88.37%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%), rgba(255, 255, 255, 0.04)",
                position: "relative",
                borderRadius: "14px",
                width: "fit-content",
                padding: "8px 16px",
                textTransform: "uppercase",
                fontWeight: "bold",
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              JACKPOT ⚡
            </div>
            <p
              style={{
                fontSize: "36px",
                fontWeight: 500,
                marginTop: "auto",
              }}
            >
              Electric Border
            </p>
          </div>

          {/* Divider */}
          <hr
            style={{
              marginTop: "auto",
              border: "none",
              height: "1px",
              backgroundColor: "currentColor",
              opacity: 0.1,
              maskImage:
                "linear-gradient(to right, transparent, black, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black, transparent)",
            }}
          />

          {/* Content Bottom */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "48px",
              paddingTop: "16px",
            }}
          >
            <p style={{ opacity: 0.5 }}>
              Smooth, clean animated lightning border effect for jackpot ranges
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

import { useLayoutEffect, useRef } from "react";
import type { PlantMotif, ResolvedTagVisual } from "./series-motifs";
import { wrapName } from "./tag-config";

const r2 = (value: number) => Math.round(value * 100) / 100;

function BotanicalChalkArt({
  motif,
  color,
}: {
  motif: PlantMotif;
  color: string;
}) {
  const strokeProps = {
    fill: "none",
    stroke: color,
    strokeWidth: 2.1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (motif) {
    case "tomato":
      return (
        <g {...strokeProps} transform="translate(110 56)">
          <ellipse cx="0" cy="6" rx="22" ry="17" />
          <path d="M-12 0C-15 8-12 16-5 20" strokeWidth="1.4" opacity="0.75" />
          <path d="M0-11L-5-20L0-14L5-21L2-11L13-16L4-8L15-6L3-5L-13-6L-4-8L-13-16Z" />
        </g>
      );
    case "cucumber":
      return (
        <g {...strokeProps} transform="translate(108 58)">
          <path d="M-28 8C-24-4 8-13 24-10C30-9 31-1 24 5C10 15-18 19-26 14C-29 12-29 10-28 8Z" />
          <path
            d="M-18 9C-4 5 12 0 21-5"
            strokeWidth="1.3"
            strokeDasharray="3 4"
          />
          <g transform="translate(28 8) scale(0.75)">
            <circle cx="0" cy="0" r="3" />
            <circle cx="0" cy="-7" r="3.5" />
            <circle cx="7" cy="-2" r="3.5" />
            <circle cx="4" cy="6" r="3.5" />
            <circle cx="-4" cy="6" r="3.5" />
            <circle cx="-7" cy="-2" r="3.5" />
          </g>
        </g>
      );
    case "pepper":
      return (
        <g {...strokeProps} transform="translate(110 56)">
          <path d="M-16-6C-22-6-23 12-14 20C-9 24-4 22 0 23C4 22 9 24 14 20C23 12 22-6 16-6C11-8 6-6 0-5C-6-6-11-8-16-6Z" />
          <path d="M-6-5C-8 4-7 15-3 21M6-5C8 4 7 15 3 21" strokeWidth="1.5" />
          <path d="M0-5C0-13 5-18 10-16" strokeWidth="2.6" />
        </g>
      );
    case "eggplant":
      return (
        <g {...strokeProps} transform="translate(110 58)">
          <path d="M16-14C6-14-18-2-23 10C-26 18-17 24-8 21C5 17 21 1 20-10C20-13 18-14 16-14Z" />
          <path d="M12-13L18-20M16-14L24-15M18-9L24-8" />
        </g>
      );
    case "zucchini":
      return (
        <g {...strokeProps} transform="translate(110 58)">
          <path d="M-28 7C-26-2 10-11 24-9C29-8 30 0 24 4C11 12-19 17-26 13C-29 11-29 9-28 7Z" />
          <path d="M-19 6L18-4M-15 11L19 1" strokeWidth="1.3" opacity="0.8" />
          <path d="M25-7L32-11M26-4L33-4" />
        </g>
      );
    case "dill":
      return (
        <g {...strokeProps} transform="translate(110 58)">
          <path d="M0 22V-2M0 2L-18-10M0 2L-9-14M0 2L0-16M0 2L9-14M0 2L18-10" />
          {[-20, -14, -9, -4, 0, 4, 9, 14, 20].map((x) => (
            <circle
              key={x}
              cx={x}
              cy={r2(-13 - (1 - Math.abs(x) / 22) * 5)}
              r="1.6"
              fill={color}
            />
          ))}
        </g>
      );
    case "parsley":
      return (
        <g {...strokeProps} transform="translate(110 58)">
          <path d="M0 22V0M0 6L-14-4M0 6L14-4" />
          <path d="M0-18L-7-10L-3-9L-8-2L0 0L8-2L3-9L7-10Z" />
          <path d="M-20-10L-22-2L-14 0L-11-7L-16-11Z" />
          <path d="M20-10L22-2L14 0L11-7L16-11Z" />
        </g>
      );
    case "strawberry":
      return (
        <g {...strokeProps} transform="translate(110 56)">
          <path d="M0 23C-14 15-20 3-17-6C-15-12-7-13 0-9C7-13 15-12 17-6C20 3 14 15 0 23Z" />
          <path d="M0-9L-9-18L-2-12L0-20L2-12L9-18Z" />
          {[-7, 0, 7, -4, 4, 0].map((x, idx) => (
            <circle
              key={`${x}-${idx < 3 ? "top" : "bot"}`}
              cx={x}
              cy={idx < 3 ? 1 : idx < 5 ? 9 : 15}
              r="1.1"
              fill={color}
            />
          ))}
        </g>
      );
    case "carrot":
      return (
        <g {...strokeProps} transform="translate(110 58)">
          <path d="M-9-4C-4-7 4-7 9-4L2 24C1 26-1 26-2 24Z" />
          <path d="M-4 3H3M-2 10H4M-3 16H1" strokeWidth="1.4" />
          <path d="M0-6C-4-15-12-19-16-15M0-6C-1-17-3-22 0-23M0-6C4-15 12-19 16-15" />
        </g>
      );
    case "lettuce":
      return (
        <g {...strokeProps} transform="translate(110 58)">
          <path d="M-18 16C-25 8-24-4-15-8C-16-16-6-20 0-14C6-20 16-16 15-8C24-4 25 8 18 16Z" />
          <path d="M0 17V-6M0 8L-9 0M0 6L9-1" strokeWidth="1.5" />
        </g>
      );
    case "lavender":
      return (
        <g {...strokeProps} transform="translate(110 58)">
          <path d="M0 22V-16M-10 20L-18-8M10 20L18-8" strokeWidth="1.8" />
          {[-14, -8, -2].map((y) => (
            <g key={y}>
              <ellipse
                cx="-3"
                cy={y}
                rx="2.5"
                ry="4"
                transform="rotate(-25 -3 0)"
              />
              <ellipse
                cx="3"
                cy={y}
                rx="2.5"
                ry="4"
                transform="rotate(25 3 0)"
              />
            </g>
          ))}
        </g>
      );
    default:
      return (
        <g {...strokeProps} transform="translate(110 58)">
          <path d="M0 20V-14" />
          <path d="M0-16C-9-10-10 2 0 6C10 2 9-10 0-16Z" />
          <path d="M0 10C-14 10-22 1-20-6C-11-7-3 0 0 10Z" />
          <path d="M0 10C14 10 22 1 20-6C11-7 3 0 0 10Z" />
        </g>
      );
  }
}

function SlateSvg({
  visual,
  lines,
}: {
  visual: ResolvedTagVisual;
  lines: string[];
}) {
  const contours: Record<ResolvedTagVisual["slateSilhouette"], string> = {
    "crown-oval":
      "M110 14 C126 14 134 22 146 25 C174 31 192 56 190 88 C188 122 164 146 122 150 L117 242 L110 254 L103 242 L98 150 C56 146 32 122 30 88 C28 56 46 31 74 25 C86 22 94 14 110 14 Z",
    "tilted-oval":
      "M124 18 C164 16 194 42 192 80 C190 118 160 145 122 150 L117 242 L110 254 L103 242 L98 150 C54 147 26 124 28 88 C30 52 68 20 124 18 Z",
    "scallop-bell":
      "M110 14 C128 14 140 24 156 28 C178 34 192 54 188 78 C194 98 184 124 164 138 C150 147 136 149 122 150 L117 242 L110 254 L103 242 L98 150 C84 149 70 147 56 138 C36 124 26 98 32 78 C28 54 42 34 64 28 C80 24 92 14 110 14 Z",
    "leaf-point":
      "M76 16 C106 16 134 24 156 38 C184 56 194 86 184 114 C174 138 148 148 122 150 L117 242 L110 254 L103 242 L98 150 C64 148 34 126 26 92 C20 66 42 34 76 16 Z",
    "carrot-heart":
      "M110 16 C132 16 154 24 170 42 C186 60 186 88 172 114 C158 138 138 152 122 162 L116 242 L110 254 L104 242 L98 162 C82 152 62 138 48 114 C34 88 34 60 50 42 C66 24 88 16 110 16 Z",
    cloud:
      "M110 14 C127 14 140 22 152 30 C174 32 190 50 188 72 C196 90 190 114 174 128 C162 142 142 149 122 150 L117 242 L110 254 L103 242 L98 150 C78 149 58 142 46 128 C30 114 24 90 32 72 C30 50 46 32 68 30 C80 22 93 14 110 14 Z",
  };
  const bodyPath = contours[visual.slateSilhouette];
  const longest = Math.max(...lines.map((l) => Array.from(l).length), 1);
  const fontSize = Math.min(23, Math.max(12, Math.round(230 / longest)));
  return (
    <>
      <path
        d={bodyPath}
        fill={visual.base}
        stroke={visual.accent}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d={bodyPath}
        fill="none"
        stroke={visual.ink}
        strokeOpacity="0.4"
        strokeWidth="1.4"
        transform="translate(110 105) scale(0.92) translate(-110 -105)"
      />
      <BotanicalChalkArt motif={visual.motif} color={visual.ink} />
      <text
        x="110"
        y={lines.length === 1 ? 113 : 103}
        textAnchor="middle"
        fill={visual.ink}
        fontFamily="var(--font-craft-serif), Georgia, serif"
        fontStyle="italic"
        fontWeight="600"
        fontSize={fontSize}
      >
        {lines.map((line, index) => (
          <tspan
            key={index === 0 ? "first" : "second"}
            x="110"
            dy={index === 0 ? 0 : fontSize * 1.08}
          >
            {line}
          </tspan>
        ))}
      </text>
      <g
        stroke={visual.ink}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.78"
      >
        <path d="M78 136Q94 139 104 136M116 136Q126 139 142 136" fill="none" />
        <circle cx="110" cy="136" r="2.2" fill={visual.ink} />
      </g>
    </>
  );
}

function KidsSvg({
  visual,
  lines,
}: {
  visual: ResolvedTagVisual;
  lines: string[];
}) {
  const upperLines = lines.map((line) => line.toUpperCase());
  const longest = Math.max(...upperLines.map((l) => Array.from(l).length), 1);
  const char = visual.kidsCharacter;
  // The carrot narrows under the inscription. Budget for wide glyphs and spacing.
  const fontSize =
    char === "carrot"
      ? Math.min(18, 84 / (longest * 1.4))
      : Math.min(20, Math.max(10, Math.round(195 / longest)));

  return (
    <>
      {/* Stake */}
      <path
        d="M97 148L123 148L117 242L110 254L103 242Z"
        fill={
          char === "sunflower"
            ? visual.accent
            : char === "hedgehog"
              ? visual.base
              : visual.base
        }
      />

      {char === "carrot" && (
        <g>
          <g fill={visual.accent}>
            <ellipse
              cx="86"
              cy="28"
              rx="11"
              ry="22"
              transform="rotate(-28 86 28)"
            />
            <ellipse
              cx="103"
              cy="22"
              rx="10"
              ry="23"
              transform="rotate(-8 103 22)"
            />
            <ellipse
              cx="120"
              cy="23"
              rx="10"
              ry="22"
              transform="rotate(12 120 23)"
            />
            <ellipse
              cx="135"
              cy="30"
              rx="10"
              ry="20"
              transform="rotate(30 135 30)"
            />
          </g>
          <path
            d="M52 66C52 44 78 38 110 38C142 38 168 44 168 66C168 102 142 152 118 176C113 181 107 181 102 176C78 152 52 102 52 66Z"
            fill={visual.base}
          />
          <path
            d="M64 62H82M140 72H156M68 124H86M134 128H150"
            stroke={visual.detail}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M110 148C104 143 99 138 102 133C104 130 108 131 110 135C112 131 116 130 118 133C121 138 116 143 110 148Z"
            fill={visual.secondary}
          />
        </g>
      )}

      {char === "strawberry" && (
        <g>
          <path
            d="M110 166C66 142 42 104 46 68C49 44 74 36 110 48C146 36 171 44 174 68C178 104 154 142 110 166Z"
            fill={visual.base}
          />
          <path
            d="M110 48L80 22L96 42L110 18L124 42L140 22Z"
            fill={visual.accent}
            stroke={visual.accent}
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <g transform="translate(134 46)">
            {[0, 72, 144, 216, 288].map((deg) => (
              <circle
                key={deg}
                cx={r2(Math.cos((deg * Math.PI) / 180) * 8)}
                cy={r2(Math.sin((deg * Math.PI) / 180) * 8)}
                r="5.5"
                fill={visual.secondary}
              />
            ))}
            <circle cx="0" cy="0" r="4.5" fill={visual.detail} />
          </g>
          {[-34, -16, 0, 18, 34, -22, 0, 22].map((x, idx) => (
            <ellipse
              key={`${x}-${idx < 5 ? "r1" : "r2"}`}
              cx={110 + x}
              cy={idx < 5 ? 128 : 144}
              rx="2.3"
              ry="3.6"
              fill={visual.detail}
            />
          ))}
        </g>
      )}

      {char === "sunflower" && (
        <g>
          <ellipse
            cx="78"
            cy="182"
            rx="22"
            ry="11"
            transform="rotate(24 78 182)"
            fill={visual.accent}
          />
          <ellipse
            cx="142"
            cy="182"
            rx="22"
            ry="11"
            transform="rotate(-24 142 182)"
            fill={visual.accent}
          />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
            (deg) => {
              const px = r2(110 + Math.cos((deg * Math.PI) / 180) * 56);
              const py = r2(90 + Math.sin((deg * Math.PI) / 180) * 56);
              return (
                <ellipse
                  key={deg}
                  cx={px}
                  cy={py}
                  rx="17"
                  ry="26"
                  transform={`rotate(${deg + 90} ${px} ${py})`}
                  fill={visual.base}
                />
              );
            },
          )}
          <circle cx="110" cy="90" r="42" fill={visual.detail} />
          <rect
            x="38"
            y="68"
            width="144"
            height="46"
            rx="20"
            fill={visual.secondary}
          />
        </g>
      )}

      {char === "tomato" && (
        <g>
          <ellipse cx="110" cy="96" rx="68" ry="56" fill={visual.base} />
          <path
            d="M110 44L84 22L99 40L110 18L121 40L136 22L124 44L146 48L118 52L110 62L102 52L74 48Z"
            fill={visual.accent}
            stroke={visual.accent}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M110 138C104 133 99 128 102 123C104 120 108 121 110 125C112 121 116 120 118 123C121 128 116 133 110 138Z"
            fill={visual.secondary}
          />
        </g>
      )}

      {char === "cucumber" && (
        <g>
          <path
            d="M36 96C34 66 64 52 108 58C148 52 184 64 186 96C188 128 154 148 110 148C66 148 38 128 36 96Z"
            fill={visual.base}
          />
          <path
            d="M48 96C48 74 74 66 110 68C146 66 172 74 172 96C172 118 146 134 110 134C74 134 48 118 48 96Z"
            fill="none"
            stroke={visual.secondary}
            strokeWidth="2.5"
            opacity="0.65"
          />
          <ellipse
            cx="120"
            cy="46"
            rx="16"
            ry="9"
            transform="rotate(-25 120 46)"
            fill={visual.secondary}
          />
          <g transform="translate(146 52)">
            {[0, 72, 144, 216, 288].map((deg) => {
              const px = r2(Math.cos((deg * Math.PI) / 180) * 10);
              const py = r2(Math.sin((deg * Math.PI) / 180) * 10);
              return (
                <ellipse
                  key={deg}
                  cx={px}
                  cy={py}
                  rx="6"
                  ry="8"
                  transform={`rotate(${deg + 90} ${px} ${py})`}
                  fill={visual.accent}
                />
              );
            })}
            <circle cx="0" cy="0" r="4.5" fill="#d4891c" />
          </g>
        </g>
      )}

      {char === "pea" && (
        <g>
          <path
            d="M34 112C38 72 86 44 148 44C174 44 188 64 180 94C172 126 140 150 98 150C58 150 32 134 34 112Z"
            fill={visual.base}
          />
          <circle cx="72" cy="108" r="18" fill={visual.accent} />
          <circle cx="110" cy="96" r="21" fill={visual.accent} />
          <circle cx="148" cy="84" r="19" fill={visual.accent} />
          <path
            d="M132 44C132 26 148 22 148 32C148 38 140 38 140 32M154 44C158 26 174 26 170 36"
            fill="none"
            stroke={visual.base}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>
      )}

      {char === "pumpkin" && (
        <g>
          <path
            d="M104 48C102 30 112 22 122 26"
            fill="none"
            stroke={visual.accent}
            strokeWidth="9"
            strokeLinecap="round"
          />
          <ellipse cx="68" cy="100" rx="34" ry="48" fill={visual.base} />
          <ellipse cx="152" cy="100" rx="34" ry="48" fill={visual.base} />
          <ellipse
            cx="88"
            cy="100"
            rx="34"
            ry="52"
            fill={visual.base}
            stroke={visual.detail}
            strokeWidth="2"
          />
          <ellipse
            cx="132"
            cy="100"
            rx="34"
            ry="52"
            fill={visual.base}
            stroke={visual.detail}
            strokeWidth="2"
          />
          <ellipse cx="110" cy="100" rx="32" ry="54" fill={visual.base} />
          <ellipse
            cx="138"
            cy="48"
            rx="22"
            ry="12"
            transform="rotate(22 138 48)"
            fill={visual.accent}
          />
          <path
            d="M110 142C104 137 99 132 102 127C104 124 108 125 110 129C112 125 116 124 118 127C121 132 116 137 110 142Z"
            fill={visual.secondary}
          />
        </g>
      )}

      {char === "hedgehog" && (
        <g>
          {/* Spiky cocoa coat */}
          <path
            d="M56 76L68 42L84 54L98 30L114 48L132 28L142 48L164 36L166 58L188 54L180 76L196 82L182 100L194 114L174 126L182 142L156 146L66 146L50 126Z"
            fill={visual.accent}
            stroke={visual.accent}
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Cute snout + belly plaque */}
          <path
            d="M32 82C46 72 66 64 84 62C84 52 94 48 100 56C104 62 102 72 96 78C118 76 154 80 168 96C178 108 174 136 154 144C132 150 84 150 62 140C46 132 42 112 46 98C36 96 28 88 32 82Z"
            fill={visual.base}
          />
          <circle cx="32" cy="82" r="5.5" fill={visual.detail} />
          <circle cx="62" cy="78" r="4.2" fill={visual.detail} />
          <path
            d="M46 92Q53 98 60 92"
            fill="none"
            stroke={visual.detail}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>
      )}

      <text
        x={char === "hedgehog" ? 114 : 110}
        y={
          char === "hedgehog"
            ? upperLines.length === 1
              ? 121
              : 112
            : char === "sunflower"
              ? upperLines.length === 1
                ? 97
                : 88
              : upperLines.length === 1
                ? 103
                : 94
        }
        textAnchor="middle"
        fill={visual.ink}
        fontFamily="var(--font-craft-sans), Arial, sans-serif"
        fontWeight="800"
        fontSize={fontSize}
        letterSpacing="0.03em"
      >
        {upperLines.map((line, index) => (
          <tspan
            key={index === 0 ? "first" : "second"}
            x={char === "hedgehog" ? 114 : 110}
            dy={index === 0 ? 0 : fontSize * 1.08}
          >
            {line}
          </tspan>
        ))}
      </text>
    </>
  );
}

function ProvenceReliefArt({
  motif,
  plaque,
  color,
}: {
  motif: PlantMotif;
  plaque: ResolvedTagVisual["provencePlaque"];
  color: string;
}) {
  if (plaque === "watering-can") {
    return (
      <g fill={color} transform="translate(110 82)">
        <path d="M0 12C-8 6-13 0-9-6C-6-10-2-8 0-4C2-8 6-10 9-6C13 0 8 6 0 12Z" />
      </g>
    );
  }
  if (motif === "oregano") {
    return (
      <g fill={color} transform="translate(110 60)">
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const px = r2(Math.cos((deg * Math.PI) / 180) * 11);
          const py = r2(Math.sin((deg * Math.PI) / 180) * 11);
          return (
            <ellipse
              key={deg}
              cx={px}
              cy={py}
              rx="5.5"
              ry="9"
              transform={`rotate(${deg + 90} ${px} ${py})`}
            />
          );
        })}
        <circle cx="0" cy="0" r="4" opacity="0.85" />
      </g>
    );
  }
  if (motif === "lavender") {
    return (
      <g
        fill={color}
        stroke={color}
        strokeLinecap="round"
        transform="translate(110 62)"
      >
        <path
          d="M0 16V-16M-8 14L-18-8M8 14L18-8"
          strokeWidth="2.2"
          fill="none"
        />
        {[-12, -5, 2].map((y) => (
          <g key={y}>
            <ellipse
              cx="-3.5"
              cy={y}
              rx="2.6"
              ry="4.2"
              transform={`rotate(-25 -3.5 ${y})`}
            />
            <ellipse
              cx="3.5"
              cy={y}
              rx="2.6"
              ry="4.2"
              transform={`rotate(25 3.5 ${y})`}
            />
          </g>
        ))}
      </g>
    );
  }
  return (
    <g fill={color} transform="translate(110 62)">
      <ellipse cx="0" cy="-9" rx="5.5" ry="11" />
      <ellipse cx="-13" cy="-2" rx="5" ry="11" transform="rotate(-48 -13 -2)" />
      <ellipse cx="13" cy="-2" rx="5" ry="11" transform="rotate(48 13 -2)" />
      <ellipse
        cx="-18"
        cy="8"
        rx="4.2"
        ry="9.5"
        transform="rotate(-72 -18 8)"
      />
      <ellipse cx="18" cy="8" rx="4.2" ry="9.5" transform="rotate(72 18 8)" />
    </g>
  );
}

function ProvenceSvg({
  visual,
  lines,
}: {
  visual: ResolvedTagVisual;
  lines: string[];
}) {
  const upperLines = lines.map((line) => line.toUpperCase());
  const longest = Math.max(...upperLines.map((l) => Array.from(l).length), 1);
  const fontSize = Math.min(20, Math.max(10, Math.round(190 / longest)));
  const plaque = visual.provencePlaque;

  const plaquePaths: Record<ResolvedTagVisual["provencePlaque"], string> = {
    "arch-crest":
      "M62 46 C68 26 88 18 110 18 C132 18 152 26 158 46 L176 46 L176 62 L188 62 L188 134 L122 138 L117 242 L110 254 L103 242 L98 138 L32 134 L32 62 L44 62 L44 46 Z",
    oval: "M110 30 C160 30 192 54 192 88 C192 120 162 142 122 145 L117 242 L110 254 L103 242 L98 145 C58 142 28 120 28 88 C28 54 60 30 110 30 Z",
    baroque:
      "M110 18 C126 18 138 28 146 38 L168 38 C174 50 182 58 192 64 C196 80 192 102 182 114 L182 132 L124 138 L117 242 L110 254 L103 242 L96 138 L38 132 L38 114 C28 102 24 80 28 64 C38 58 46 50 52 38 L74 38 C82 28 94 18 110 18 Z",
    dome: "M56 64 C56 32 80 16 110 16 C140 16 164 32 164 64 L182 64 L182 82 L190 82 L190 136 L122 138 L117 242 L110 254 L103 242 L98 138 L30 136 L30 82 L38 82 L38 64 Z",
    heart:
      "M110 46 C96 24 62 22 46 44 C30 66 40 102 96 146 L98 152 L103 242 L110 254 L117 242 L122 152 L124 146 C180 102 190 66 174 44 C158 22 124 24 110 46 Z",
    "watering-can":
      "M74 56 L146 56 L154 66 C174 62 190 74 188 96 C186 116 170 126 154 122 L156 142 L122 146 L117 242 L110 254 L103 242 L98 146 L64 142 L68 118 L30 84 L40 72 L70 94 Z",
  };

  return (
    <>
      {plaque === "watering-can" && (
        <g fill={visual.secondary} stroke={visual.ink} strokeOpacity="0.22">
          <circle cx="88" cy="48" r="10" />
          <circle cx="104" cy="42" r="12" />
          <circle cx="120" cy="44" r="11" />
          <circle cx="132" cy="50" r="9" />
          <circle cx="96" cy="52" r="9" />
          <circle cx="114" cy="52" r="10" />
        </g>
      )}
      <path d={plaquePaths[plaque]} fill={visual.base} />
      {plaque === "watering-can" && (
        <ellipse
          cx="168"
          cy="94"
          rx="13"
          ry="18"
          fill="#1b2721"
          opacity="0.28"
        />
      )}
      <path
        d={plaquePaths[plaque]}
        fill="none"
        stroke={visual.ink}
        strokeOpacity="0.28"
        strokeWidth="2.4"
        transform="translate(110 92) scale(0.91) translate(-110 -92)"
      />
      <ProvenceReliefArt
        motif={visual.motif}
        plaque={plaque}
        color={visual.accent}
      />
      <text
        x="110"
        y={
          plaque === "watering-can"
            ? upperLines.length === 1
              ? 124
              : 115
            : upperLines.length === 1
              ? 110
              : 100
        }
        textAnchor="middle"
        fill={visual.ink}
        fontFamily="var(--font-craft-serif), Georgia, serif"
        fontWeight="600"
        fontSize={fontSize}
        letterSpacing="0.06em"
      >
        {upperLines.map((line, index) => (
          <tspan
            key={index === 0 ? "first" : "second"}
            x="110"
            dy={index === 0 ? 0 : fontSize * 1.08}
          >
            {line}
          </tspan>
        ))}
      </text>
    </>
  );
}

export function ThemedTagSvg({
  visual,
  name,
  scaleViewport,
}: {
  visual: ResolvedTagVisual;
  name: string;
  scaleViewport?: { x: number; y: number; width: number; height: number };
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const artRef = useRef<SVGGElement>(null);
  const lines = wrapName(name || "Ваш сорт");

  useLayoutEffect(() => {
    if (!scaleViewport || !artRef.current || !svgRef.current) return;
    const { y, height } = artRef.current.getBBox();
    if (height <= 0) return;

    // getBBox excludes strokes. Only these outlines extend above the artwork.
    const topStroke =
      visual.series === "slate"
        ? 2.5
        : visual.series === "kids"
          ? ((
              {
                strawberry: 3,
                tomato: 2,
                pea: 2.25,
                pumpkin: 4.5,
                hedgehog: 2.5,
              } as Partial<Record<ResolvedTagVisual["kidsCharacter"], number>>
            )[visual.kidsCharacter] ?? 0)
          : visual.provencePlaque === "watering-can"
            ? 0.5
            : 0;
    const bottomStroke = visual.series === "slate" ? 2.5 : 0;
    svgRef.current.setAttribute(
      "viewBox",
      `14 ${y - topStroke} 192 ${height + topStroke + bottomStroke}`,
    );
  });

  return (
    <svg
      {...scaleViewport}
      ref={svgRef}
      viewBox={scaleViewport ? "14 12 192 244" : "0 0 220 260"}
      className={scaleViewport ? undefined : "birka-themed-svg"}
      preserveAspectRatio={scaleViewport ? "none" : undefined}
      aria-hidden="true"
    >
      <g ref={artRef}>
        {visual.series === "slate" ? (
          <SlateSvg visual={visual} lines={lines} />
        ) : visual.series === "kids" ? (
          <KidsSvg visual={visual} lines={lines} />
        ) : (
          <ProvenceSvg visual={visual} lines={lines} />
        )}
      </g>
    </svg>
  );
}

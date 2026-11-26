import {
  colorPairs,
  getShapeEntry,
  getTagVisual,
  type ShapeId,
  shapeToSeries,
} from "./data";
import { wrapName } from "./tag-config";
import { ThemedTagSvg } from "./themed-tag-svg";

export function ScalePreview({
  shape,
  color,
  name,
  itemIndex = 0,
}: {
  shape: ShapeId;
  color: number;
  name: string;
  itemIndex?: number;
}) {
  const entry = getShapeEntry(shape);
  const series = shapeToSeries(shape);
  const pair = colorPairs[color] ?? colorPairs[0];
  // One centimetre = 12 SVG units for all objects. Cup dimensions are illustrative.
  const height = entry.heightCm * 12;
  const width = entry.widthCm * 12;
  const top = 258 - height;
  const sizeLabel = String(entry.heightCm).replace(".", ",");

  return (
    <div className="birka-scale">
      <svg
        viewBox="0 0 440 320"
        role="img"
        aria-label={`${entry.title}, ${sizeLabel} см рядом со стаканчиком 0,5 л высотой около 10 см и спичечным коробком 5 см`}
      >
        <title>Сравнение размеров в едином масштабе</title>
        <path d="M20 258H420" stroke="#a9b497" />
        <path d="M25 138H133L121 258H37Z" fill="#6c8160" stroke="#bfccb7" />
        <ellipse
          cx="79"
          cy="138"
          rx="54"
          ry="7"
          fill="#423c2e"
          stroke="#bfccb7"
        />
        <text x="79" y="211" textAnchor="middle" fill="#fff">
          0,5 л
        </text>
        <rect x="166" y="198" width="42" height="60" rx="3" fill="#d9bc88" />
        <rect x="171" y="203" width="32" height="50" fill="#a56749" />
        <text x="187" y="233" textAnchor="middle" fill="#fff" fontSize="10">
          спички
        </text>
        {series === "classic" ? (
          <>
            {shape !== "hanging" && (
              <path
                d={`M${shape === "flag" ? 276 : 310} ${top + 28}v${height - 38}l6 10 6-10V${top + 28}`}
                fill={pair.base}
              />
            )}
            <rect
              x="270"
              y={top}
              width={width}
              height={shape === "hanging" ? height : 38}
              rx="6"
              fill={pair.base}
            />
            {shape === "hanging" && (
              <circle cx="318" cy={top + 8} r="2.4" fill="#1b2721" />
            )}
            <text
              x={270 + width / 2}
              y={top + (shape === "hanging" ? 43 : 16)}
              textAnchor="middle"
              fill={pair.ink}
              fontSize="6"
            >
              {wrapName(name).map((line, index) => (
                <tspan
                  key={index === 0 ? "first" : "second"}
                  x={270 + width / 2}
                  dy={index ? 9 : 0}
                >
                  {line}
                </tspan>
              ))}
            </text>
          </>
        ) : (
          <svg
            x={318 - width / 2}
            y={top}
            width={width}
            height={height}
            viewBox="14 12 192 244"
            preserveAspectRatio="xMidYMax meet"
            aria-hidden="true"
          >
            <ThemedTagSvg
              visual={getTagVisual(shape, color, name, itemIndex)}
              name={name}
            />
          </svg>
        )}
        <path d={`M390 ${top}h8m-4 0V258m-4 0h8`} stroke="#bfccb7" />
        <text x="402" y={top + height / 2} fill="#e4e9d8" fontSize="12">
          {sizeLabel} см
        </text>
        <g fill="#bfccb7" fontSize="11" textAnchor="middle">
          <text x="79" y="282">
            Стаканчик ≈ 10 см
          </text>
          <text x="187" y="299">
            Коробок 5 см
          </text>
          <text x="318" y="282">
            Ваша бирка
          </text>
        </g>
      </svg>
      <p>Схема в едином масштабе. Размеры стаканчиков могут отличаться.</p>
    </div>
  );
}

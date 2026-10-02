import type { FC } from 'react';
import { fmt } from '../engine/validation';

interface DiagramChartProps {
  x: number[];
  y: number[];
  label: string;
  unit: string;
  color: string;
  fillColor?: string;
  /** If true, y-axis is inverted (for deflection — downward = positive in data = shown going down) */
  invertY?: boolean;
  /** Highlight the peak value */
  showPeak?: boolean;
  /** Y = 0 line label */
  zeroLabel?: string;
}

const SVG_W = 560;
const SVG_H = 180;
const PAD_L = 60, PAD_R = 20, PAD_T = 24, PAD_B = 36;
const PLOT_W = SVG_W - PAD_L - PAD_R;
const PLOT_H = SVG_H - PAD_T - PAD_B;

function scale(
  xArr: number[],
  yArr: number[],
  invertY: boolean,
): {
  toSvgX: (x: number) => number;
  toSvgY: (y: number) => number;
  zeroSvgY: number;
  yMin: number;
  yMax: number;
  xMax: number;
} {
  const xMax = xArr[xArr.length - 1] ?? 1;
  let yMin = Math.min(...yArr, 0);
  let yMax = Math.max(...yArr, 0);

  // Give a little margin
  const range = yMax - yMin || 1;
  yMin -= range * 0.08;
  yMax += range * 0.08;

  const toSvgX = (x: number) => PAD_L + (x / xMax) * PLOT_W;
  const toSvgY = invertY
    ? (y: number) => PAD_T + (y - yMin) / (yMax - yMin) * PLOT_H   // downward positive → y increases down
    : (y: number) => PAD_T + PLOT_H - (y - yMin) / (yMax - yMin) * PLOT_H;

  const zeroSvgY = invertY
    ? PAD_T + (0 - yMin) / (yMax - yMin) * PLOT_H
    : PAD_T + PLOT_H - (0 - yMin) / (yMax - yMin) * PLOT_H;

  return { toSvgX, toSvgY, zeroSvgY, yMin, yMax, xMax };
}

const DiagramChart: FC<DiagramChartProps> = ({
  x, y, label, unit, color, fillColor, invertY = false, showPeak = true,
}) => {
  if (!x.length || !y.length) return null;

  const { toSvgX, toSvgY, zeroSvgY, yMax, yMin, xMax } = scale(x, y, invertY);

  // Build polyline points
  const points = x.map((xi, i) => `${toSvgX(xi)},${toSvgY(y[i])}`).join(' ');

  // Build fill polygon: close below zero line
  const fillPts = [
    `${toSvgX(x[0])},${zeroSvgY}`,
    ...x.map((xi, i) => `${toSvgX(xi)},${toSvgY(y[i])}`),
    `${toSvgX(x[x.length - 1])},${zeroSvgY}`,
  ].join(' ');

  // Find peak index
  let peakIdx = 0;
  for (let i = 1; i < y.length; i++) {
    if (Math.abs(y[i]) > Math.abs(y[peakIdx])) peakIdx = i;
  }
  const peakX = x[peakIdx];
  const peakY = y[peakIdx];
  const peakSvgX = toSvgX(peakX);
  const peakSvgY = toSvgY(peakY);

  // Y-axis tick labels (3-5 ticks)
  const nTicks = 5;
  const ticks: number[] = [];
  for (let i = 0; i <= nTicks; i++) {
    ticks.push(yMin + (i / nTicks) * (yMax - yMin));
  }

  // X-axis ticks (4 ticks)
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map(t => t * xMax);

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="chart-svg"
      role="img"
      aria-label={`${label} diagram`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id={`clip-${label}`}>
          <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} />
        </clipPath>
      </defs>

      {/* Plot background */}
      <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} fill="var(--surface-2)" rx="4" />

      {/* Horizontal grid lines */}
      {ticks.map((tv, i) => {
        const sy = toSvgY(tv);
        if (sy < PAD_T || sy > PAD_T + PLOT_H) return null;
        return (
          <line
            key={i}
            x1={PAD_L} y1={sy} x2={PAD_L + PLOT_W} y2={sy}
            stroke="var(--border)" strokeWidth="0.75" strokeDasharray={Math.abs(tv) < 1e-9 ? '' : '3,3'}
          />
        );
      })}

      {/* Zero line */}
      <line
        x1={PAD_L} y1={zeroSvgY}
        x2={PAD_L + PLOT_W} y2={zeroSvgY}
        stroke="var(--chart-zero)" strokeWidth="1.5"
      />

      {/* Fill area */}
      <polygon
        points={fillPts}
        fill={fillColor ?? color}
        fillOpacity="0.12"
        clipPath={`url(#clip-${label})`}
      />

      {/* Diagram line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        clipPath={`url(#clip-${label})`}
      />

      {/* Peak marker */}
      {showPeak && Math.abs(peakY) > 1e-9 && (
        <g>
          <circle cx={peakSvgX} cy={peakSvgY} r="4" fill={color} stroke="var(--surface)" strokeWidth="2" />
          {/* Peak label */}
          <rect
            x={peakSvgX + (peakSvgX > PAD_L + PLOT_W / 2 ? -88 : 6)}
            y={peakSvgY - 11}
            width="82" height="18"
            rx="3" fill="var(--surface)" stroke={color} strokeWidth="1"
            filter="drop-shadow(0 1px 2px rgba(0,0,0,.12))"
          />
          <text
            x={peakSvgX + (peakSvgX > PAD_L + PLOT_W / 2 ? -47 : 47)}
            y={peakSvgY + 3.5}
            textAnchor="middle"
            fontSize="9.5"
            fill={color}
            fontFamily="var(--font-mono)"
            fontWeight="500"
          >
            {fmt(peakY)} {unit}
          </text>
        </g>
      )}

      {/* Y-axis */}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="var(--border-2)" strokeWidth="1" />

      {/* Y-axis tick labels */}
      {ticks.filter((_, i) => i % 2 === 0).map((tv, i) => {
        const sy = toSvgY(tv);
        if (sy < PAD_T - 2 || sy > PAD_T + PLOT_H + 2) return null;
        return (
          <text key={i} x={PAD_L - 4} y={sy + 3.5} textAnchor="end" fontSize="9" fill="var(--text-3)" fontFamily="var(--font-mono)">
            {fmt(tv, 2)}
          </text>
        );
      })}

      {/* Y-axis unit label */}
      <text
        x={10} y={PAD_T + PLOT_H / 2}
        textAnchor="middle"
        fontSize="9"
        fill="var(--text-3)"
        fontFamily="var(--font-mono)"
        transform={`rotate(-90, 10, ${PAD_T + PLOT_H / 2})`}
      >
        {unit}
      </text>

      {/* X-axis */}
      <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H} stroke="var(--border-2)" strokeWidth="1" />

      {/* X-axis ticks and labels */}
      {xTicks.map((xv, i) => {
        const sx = toSvgX(xv);
        return (
          <g key={i}>
            <line x1={sx} y1={PAD_T + PLOT_H} x2={sx} y2={PAD_T + PLOT_H + 4} stroke="var(--border-2)" strokeWidth="1" />
            <text x={sx} y={PAD_T + PLOT_H + 14} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="var(--font-mono)">
              {xv.toFixed(xv === Math.round(xv) ? 0 : 2)}
            </text>
          </g>
        );
      })}

      {/* X-axis label */}
      <text x={PAD_L + PLOT_W / 2} y={SVG_H - 2} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="var(--font-mono)">
        Position (m)
      </text>
    </svg>
  );
};

export default DiagramChart;

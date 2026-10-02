import type { FC } from 'react';
import type { BeamInput } from '../types/beam';

interface BeamDiagramProps {
  input: BeamInput | null;
  /** Live input fields for live preview even before Calculate is pressed */
  liveInput?: Partial<BeamInput>;
}

// SVG layout constants
const W = 600, H = 220;
const BEAM_Y = 108;
const BEAM_H = 18;
const BEAM_X0 = 80;
const BEAM_X1 = 520;
const BEAM_W = BEAM_X1 - BEAM_X0;

function bx(pos: number, L: number): number {
  return BEAM_X0 + (pos / L) * BEAM_W;
}

// Support symbols (SVG groups)
const PinSymbol: FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <polygon points={`${x},${y} ${x-10},${y+16} ${x+10},${y+16}`} fill="var(--accent-2)" stroke="none" />
    <line x1={x - 14} y1={y + 18} x2={x + 14} y2={y + 18} stroke="var(--accent-2)" strokeWidth="2" strokeLinecap="round" />
    {/* hatch marks below */}
    {[-10,-5,0,5,10].map(dx => (
      <line key={dx} x1={x + dx} y1={y + 18} x2={x + dx - 5} y2={y + 24} stroke="var(--border-2)" strokeWidth="1" />
    ))}
  </g>
);

const RollerSymbol: FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <polygon points={`${x},${y} ${x-10},${y+14} ${x+10},${y+14}`} fill="var(--accent-2)" stroke="none" />
    <circle cx={x - 6} cy={y + 18} r={3} fill="var(--accent-2)" />
    <circle cx={x + 6} cy={y + 18} r={3} fill="var(--accent-2)" />
    <line x1={x - 14} y1={y + 22} x2={x + 14} y2={y + 22} stroke="var(--accent-2)" strokeWidth="2" strokeLinecap="round" />
  </g>
);

const FixedLeftSymbol: FC<{ y: number }> = ({ y }) => (
  <g>
    <rect x={BEAM_X0 - 20} y={y - BEAM_H / 2 - 20} width={18} height={BEAM_H + 40} fill="var(--border)" stroke="var(--border-2)" strokeWidth="1" />
    {[-16, -8, 0, 8, 16].map((dy, i) => (
      <line key={i}
        x1={BEAM_X0 - 20} y1={y + dy}
        x2={BEAM_X0 - 28} y2={y + dy + 6}
        stroke="var(--border-2)" strokeWidth="1"
      />
    ))}
  </g>
);

const FixedRightSymbol: FC<{ y: number }> = ({ y }) => (
  <g>
    <rect x={BEAM_X1 + 2} y={y - BEAM_H / 2 - 20} width={18} height={BEAM_H + 40} fill="var(--border)" stroke="var(--border-2)" strokeWidth="1" />
    {[-16, -8, 0, 8, 16].map((dy, i) => (
      <line key={i}
        x1={BEAM_X1 + 20} y1={y + dy}
        x2={BEAM_X1 + 28} y2={y + dy + 6}
        stroke="var(--border-2)" strokeWidth="1"
      />
    ))}
  </g>
);

const FreeEndLeft: FC<{ y: number }> = ({ y }) => (
  <line x1={BEAM_X0} y1={y - BEAM_H / 2 - 10} x2={BEAM_X0} y2={y + BEAM_H / 2 + 10} stroke="var(--text-3)" strokeWidth="1.5" strokeDasharray="3,3" />
);

const FreeEndRight: FC<{ y: number }> = ({ y }) => (
  <line x1={BEAM_X1} y1={y - BEAM_H / 2 - 10} x2={BEAM_X1} y2={y + BEAM_H / 2 + 10} stroke="var(--text-3)" strokeWidth="1.5" strokeDasharray="3,3" />
);

// Downward arrow (point load)
const PointLoadArrow: FC<{ x: number; magnitude: number }> = ({ x, magnitude }) => {
  const arrowTop = BEAM_Y - BEAM_H / 2 - 36;
  const arrowBot = BEAM_Y - BEAM_H / 2 - 2;
  return (
    <g>
      <line x1={x} y1={arrowTop} x2={x} y2={arrowBot} stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points={`${x},${arrowBot} ${x - 5},${arrowBot - 10} ${x + 5},${arrowBot - 10}`} fill="var(--danger)" />
      <text x={x} y={arrowTop - 5} textAnchor="middle" fontSize="10" fill="var(--danger)" fontFamily="var(--font-mono)" fontWeight="500">
        {magnitude >= 1000 ? `${(magnitude / 1000).toFixed(1)}kN` : `${magnitude}N`}
      </text>
    </g>
  );
};

// UDL arrows
const UDLArrows: FC<{ x1: number; x2: number; intensity: number }> = ({ x1, x2, intensity }) => {
  const topY = BEAM_Y - BEAM_H / 2 - 28;
  const botY = BEAM_Y - BEAM_H / 2 - 2;
  const nArrows = Math.max(2, Math.round((x2 - x1) / 30));
  const arrows: number[] = [];
  for (let i = 0; i <= nArrows; i++) arrows.push(x1 + (i / nArrows) * (x2 - x1));

  return (
    <g>
      {/* Top horizontal line */}
      <line x1={x1} y1={topY} x2={x2} y2={topY} stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
      {/* Shaded fill */}
      <rect x={x1} y={topY} width={x2 - x1} height={botY - topY} fill="#7C3AED" fillOpacity="0.07" />
      {/* Arrows */}
      {arrows.map((ax, i) => (
        <g key={i}>
          <line x1={ax} y1={topY} x2={ax} y2={botY} stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
          <polygon points={`${ax},${botY} ${ax - 3.5},${botY - 7} ${ax + 3.5},${botY - 7}`} fill="#7C3AED" />
        </g>
      ))}
      {/* Label */}
      <text
        x={(x1 + x2) / 2} y={topY - 5}
        textAnchor="middle" fontSize="10"
        fill="#7C3AED" fontFamily="var(--font-mono)" fontWeight="500"
      >
        {intensity >= 1000 ? `${(intensity / 1000).toFixed(1)}kN/m` : `${intensity}N/m`}
      </text>
    </g>
  );
};

// Reaction arrow (upward)
const ReactionArrow: FC<{ x: number; label: string }> = ({ x, label }) => {
  const arrowTop = BEAM_Y + BEAM_H / 2 + 2;
  const arrowBot = BEAM_Y + BEAM_H / 2 + 32;
  return (
    <g>
      <line x1={x} y1={arrowBot} x2={x} y2={arrowTop} stroke="var(--success)" strokeWidth="2" strokeLinecap="round" />
      <polygon points={`${x},${arrowTop} ${x - 4.5},${arrowTop + 9} ${x + 4.5},${arrowTop + 9}`} fill="var(--success)" />
      <text x={x} y={arrowBot + 12} textAnchor="middle" fontSize="9" fill="var(--success)" fontFamily="var(--font-mono)">
        {label}
      </text>
    </g>
  );
};

const BeamDiagram: FC<BeamDiagramProps> = ({ input }) => {
  const empty = !input || input.length <= 0;

  if (empty) {
    return (
      <div className="panel">
        <div className="panel__head">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="panel__icon" aria-hidden="true">
            <rect x="3" y="8" width="18" height="8" rx="2"/>
            <path d="M7 8V6M17 8V6"/>
          </svg>
          <span className="panel__title">Beam Diagram</span>
        </div>
        <div style={{ padding: '24px' }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="beam-diagram-svg" role="img" aria-label="Beam diagram — fill in parameters to preview">
            {/* Placeholder beam */}
            <rect x={BEAM_X0} y={BEAM_Y - BEAM_H / 2} width={BEAM_W} height={BEAM_H} rx="3" fill="var(--border)" />
            <PinSymbol x={BEAM_X0} y={BEAM_Y + BEAM_H / 2} />
            <RollerSymbol x={BEAM_X1} y={BEAM_Y + BEAM_H / 2} />
            <text x={W / 2} y={40} textAnchor="middle" fontSize="12" fill="var(--text-3)" fontFamily="var(--font-body)">
              Enter parameters to preview
            </text>
          </svg>
        </div>
      </div>
    );
  }

  const { length: L, pointLoad, udl, leftBC, rightBC } = input;

  // Left support
  const renderLeftSupport = () => {
    switch (leftBC) {
      case 'fixed':  return <FixedLeftSymbol y={BEAM_Y} />;
      case 'pin':    return <PinSymbol x={BEAM_X0} y={BEAM_Y + BEAM_H / 2} />;
      case 'roller': return <RollerSymbol x={BEAM_X0} y={BEAM_Y + BEAM_H / 2} />;
      case 'free':   return <FreeEndLeft y={BEAM_Y} />;
    }
  };

  const renderRightSupport = () => {
    switch (rightBC) {
      case 'fixed':  return <FixedRightSymbol y={BEAM_Y} />;
      case 'pin':    return <PinSymbol x={BEAM_X1} y={BEAM_Y + BEAM_H / 2} />;
      case 'roller': return <RollerSymbol x={BEAM_X1} y={BEAM_Y + BEAM_H / 2} />;
      case 'free':   return <FreeEndRight y={BEAM_Y} />;
    }
  };

  // Dimension lines
  const dimY = BEAM_Y + BEAM_H / 2 + 50;

  return (
    <div className="panel">
      <div className="panel__head">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="panel__icon" aria-hidden="true">
          <rect x="3" y="8" width="18" height="8" rx="2"/>
        </svg>
        <span className="panel__title">Beam Diagram</span>
      </div>
      <div style={{ padding: '16px 20px 20px' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="beam-diagram-svg"
          role="img"
          aria-label={`Beam diagram: ${L}m beam, ${leftBC} left support, ${rightBC} right support`}
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="0.3" opacity="0.5"/>
            </pattern>
          </defs>
          <rect x={BEAM_X0 - 60} y={20} width={BEAM_W + 120} height={H - 30} fill="url(#grid)" opacity="0.4" rx="4" />

          {/* UDL */}
          {udl.intensity !== 0 && udl.end > udl.start && (
            <UDLArrows
              x1={bx(udl.start, L)}
              x2={bx(udl.end, L)}
              intensity={udl.intensity}
            />
          )}

          {/* Point load */}
          {pointLoad.magnitude !== 0 && (
            <PointLoadArrow x={bx(pointLoad.position, L)} magnitude={pointLoad.magnitude} />
          )}

          {/* Beam body */}
          <rect
            x={BEAM_X0}
            y={BEAM_Y - BEAM_H / 2}
            width={BEAM_W}
            height={BEAM_H}
            rx="3"
            fill="var(--accent)"
            stroke="none"
          />
          {/* Beam highlight */}
          <rect x={BEAM_X0 + 2} y={BEAM_Y - BEAM_H / 2 + 2} width={BEAM_W - 4} height={4} rx="1" fill="white" fillOpacity="0.15" />

          {/* Supports */}
          {renderLeftSupport()}
          {renderRightSupport()}

          {/* Reaction arrow labels (minimal, no value — value shown in results) */}
          {(leftBC === 'pin' || leftBC === 'roller' || leftBC === 'fixed') && (
            <ReactionArrow x={BEAM_X0} label="RA" />
          )}
          {(rightBC === 'pin' || rightBC === 'roller' || rightBC === 'fixed') && (
            <ReactionArrow x={BEAM_X1} label="RB" />
          )}

          {/* Dimension line */}
          <g>
            <line x1={BEAM_X0} y1={dimY} x2={BEAM_X1} y2={dimY} stroke="var(--text-3)" strokeWidth="1" />
            <line x1={BEAM_X0} y1={dimY - 5} x2={BEAM_X0} y2={dimY + 5} stroke="var(--text-3)" strokeWidth="1" />
            <line x1={BEAM_X1} y1={dimY - 5} x2={BEAM_X1} y2={dimY + 5} stroke="var(--text-3)" strokeWidth="1" />
            <text x={(BEAM_X0 + BEAM_X1) / 2} y={dimY - 4} textAnchor="middle" fontSize="10" fill="var(--text-3)" fontFamily="var(--font-mono)">
              L = {L} m
            </text>
          </g>

          {/* Point load position marker */}
          {pointLoad.magnitude !== 0 && (
            <text
              x={bx(pointLoad.position, L)}
              y={dimY + 14}
              textAnchor="middle"
              fontSize="9"
              fill="var(--danger)"
              fontFamily="var(--font-mono)"
            >
              {pointLoad.position}m
            </text>
          )}
        </svg>
      </div>
    </div>
  );
};

export default BeamDiagram;

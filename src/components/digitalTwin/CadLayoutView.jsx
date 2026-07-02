import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Box, Info, Navigation, ArrowRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// CadLayoutView — Digital Blueprint of 8,000 SQ FT Warehouse
// Faithful SVG recreation of the physical warehouse blueprint.
// No mock data. Real bin occupancy overlaid from cadLayout prop.
// No L1/L2/L3 level selectors. Fast-loading hardcoded structure.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Blueprint constants (all in FEET, matching the physical blueprint) ────────
const WH_W = 100; // warehouse width
const WH_H = 80;  // warehouse depth
const SVG_PAD = 2; // padding around warehouse in SVG units

// ── Zone Group definitions from the blueprint ────────────────────────────────
const ZONE_GROUPS = [
  {
    id: 'A', label: 'ZONE GROUP A', subtitle: 'FAST MOVING INVENTORY',
    dims: "50' × 28' = 1,400 SQ FT",
    x: 18, y: 4, w: 50, h: 28,
    color: '#22c55e', fill: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.5)',
    zones: [
      { id: 'A1', x: 18, y: 4, w: 12.5, h: 28, label: 'ZONE A1', sub: "12.5' × 28'\n350 SQ FT" },
      { id: 'A2', x: 30.5, y: 4, w: 12.5, h: 28, label: 'ZONE A2', sub: "12.5' × 28'\n350 SQ FT" },
      { id: 'A3', x: 43, y: 4, w: 12.5, h: 28, label: 'ZONE A3', sub: "12.5' × 28'\n350 SQ FT" },
      { id: 'A4', x: 55.5, y: 4, w: 12.5, h: 28, label: 'ZONE A4', sub: "12.5' × 28'\n350 SQ FT" },
    ]
  },
  {
    id: 'B', label: 'ZONE GROUP B', subtitle: 'MEDIUM MOVING INVENTORY',
    dims: "50' × 20' = 1,400 SQ FT",
    x: 18, y: 4, w: 50, h: 28,
    color: '#3b82f6', fill: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.5)',
    // B zones are to the right of Cross Aisle A, upper section
    zones: [
      { id: 'B1', x: 50, y: 4, w: 16.7, h: 28, label: 'ZONE B1', sub: "16.7' × 28'\n467 SQ FT" },
      { id: 'B2', x: 50, y: 4, w: 16.7, h: 28, label: 'ZONE B2', sub: "16.7' × 28'\n467 SQ FT" },
      { id: 'B3', x: 50, y: 4, w: 16.6, h: 28, label: 'ZONE B3', sub: "16.6' × 28'\n466 SQ FT" },
    ]
  },
  {
    id: 'C', label: 'ZONE GROUP C', subtitle: 'HEAVY & PALLET STORAGE',
    dims: "50' × 32' = 1,600 SQ FT",
    x: 18, y: 48, w: 50, h: 32,
    color: '#f97316', fill: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.5)',
    zones: [
      { id: 'C1', x: 18, y: 48, w: 12.5, h: 32, label: 'ZONE C1', sub: "12.5' × 32'\n400 SQ FT" },
      { id: 'C2', x: 30.5, y: 48, w: 12.5, h: 32, label: 'ZONE C2', sub: "12.5' × 32'\n400 SQ FT" },
      { id: 'C3', x: 43, y: 48, w: 12.5, h: 32, label: 'ZONE C3', sub: "12.5' × 32'\n400 SQ FT" },
      { id: 'C4', x: 55.5, y: 48, w: 12.5, h: 32, label: 'ZONE C4', sub: "12.5' × 32'\n400 SQ FT" },
    ]
  },
  {
    id: 'D', label: 'ZONE GROUP D', subtitle: 'SMALL PARTS & BIN STORAGE',
    dims: "43' × 28' = 1,204 SQ FT",
    x: 50, y: 48, w: 43, h: 28,
    color: '#a855f7', fill: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.5)',
    zones: [
      { id: 'D1', x: 50, y: 48, w: 10.75, h: 28, label: 'ZONE D1', sub: "10.75' × 28'\n301 SQ FT" },
      { id: 'D2', x: 60.75, y: 48, w: 10.75, h: 28, label: 'ZONE D2', sub: "10.75' × 28'\n301 SQ FT" },
      { id: 'D3', x: 71.5, y: 48, w: 10.75, h: 28, label: 'ZONE D3', sub: "10.75' × 28'\n301 SQ FT" },
      { id: 'D4', x: 82.25, y: 48, w: 10.75, h: 28, label: 'ZONE D4', sub: "10.75' × 28'\n301 SQ FT" },
    ]
  }
];

// ── Functional Areas ─────────────────────────────────────────────────────────
const FUNCTIONAL_AREAS = [
  { id: 'receiving', label: 'RECEIVING\nAREA', sub: "40' × 18'\n720 SQ FT", x: 0, y: 8, w: 18, h: 24, color: '#64748b', fill: 'rgba(100,116,139,0.12)' },
  { id: 'truck-entry', label: 'TRUCK\nENTRY', sub: "12' × 14'", x: 0, y: 4, w: 12, h: 4, color: '#94a3b8', fill: 'rgba(148,163,184,0.10)' },
  { id: 'scanning', label: 'SCANNING &\nVERIFICATION', sub: '', x: 0, y: 44, w: 18, h: 8, color: '#64748b', fill: 'rgba(100,116,139,0.10)' },
  { id: 'temp-racks', label: 'TEMPORARY\nRECEIVING RACKS', sub: "12' × 12'\n144 SQ FT", x: 0, y: 52, w: 12, h: 12, color: '#94a3b8', fill: 'rgba(148,163,184,0.08)' },
  { id: 'recv-exit', label: 'RECEIVING EXIT\n(TO STORAGE)', sub: "12' × 14'", x: 0, y: 64, w: 12, h: 14, color: '#475569', fill: 'rgba(71,85,105,0.10)' },
  { id: 'packing', label: 'PACKING &\nDISPATCH', sub: "35' × 20'\n700 SQ FT", x: 68, y: 4, w: 32, h: 20, color: '#0ea5e9', fill: 'rgba(14,165,233,0.08)' },
  { id: 'admin', label: 'ADMIN &\nOPERATIONS', sub: "20' × 20'\n400 SQ FT", x: 80, y: 32, w: 20, h: 16, color: '#6366f1', fill: 'rgba(99,102,241,0.08)' },
  { id: 'utility', label: 'UTILITY &\nSUPPORT', sub: "20' × 20'\n400 SQ FT", x: 80, y: 60, w: 20, h: 20, color: '#8b5cf6', fill: 'rgba(139,92,246,0.08)' },
];

// ── Sub-areas inside functional areas ────────────────────────────────────────
const SUB_AREAS = [
  // Inside Packing & Dispatch
  { label: 'PACKING\nSTATIONS (3)', x: 68, y: 6, w: 10, h: 8, color: '#0ea5e9' },
  { label: 'LABEL\nPRINTING', x: 78.5, y: 6, w: 8, h: 5, color: '#0ea5e9' },
  { label: 'SORTATION\nCONVEYOR', x: 87, y: 6, w: 12, h: 5, color: '#0ea5e9' },
  { label: 'DISPATCH\nSTAGING', x: 87, y: 14, w: 12, h: 8, color: '#0ea5e9' },
  // Inside Admin
  { label: 'MANAGER\nCABIN', x: 80, y: 33, w: 6, h: 7, color: '#6366f1' },
  { label: 'ADMIN\nOFFICE', x: 86.5, y: 33, w: 6.5, h: 7, color: '#6366f1' },
  { label: 'MEETING\nROOM', x: 93.5, y: 33, w: 6.5, h: 7, color: '#6366f1' },
  // Inside Utility
  { label: 'WASHROOM', x: 80, y: 61, w: 10, h: 4.5, color: '#8b5cf6' },
  { label: 'PANTRY', x: 90, y: 61, w: 10, h: 4.5, color: '#8b5cf6' },
  { label: 'ELECTRICAL\nROOM', x: 80, y: 66, w: 10, h: 6, color: '#8b5cf6' },
  { label: 'SERVER\nROOM', x: 90, y: 66, w: 10, h: 6, color: '#8b5cf6' },
  // Receiving sub-items
  { label: '• Unloading\n• Inspection\n• Counting\n• Quality Check', x: 1, y: 18, w: 15, h: 12, color: '#64748b', fontSize: 0.8 },
];

// ── Aisles ───────────────────────────────────────────────────────────────────
const AISLES = [
  { id: 'main-agv', label: 'MAIN FORKLIFT / AGV LANE – 12 FT WIDE', x: 0, y: 34, w: 100, h: 12, color: '#facc15', fill: 'rgba(250,204,21,0.06)', isMain: true },
  // Cross aisles between A zones
  { id: 'aisle-a12', label: '10 FT AISLE', x: 28, y: 26, w: 4, h: 6, color: '#475569', fill: 'rgba(71,85,105,0.06)' },
  { id: 'aisle-a23', label: '10 FT AISLE', x: 40.5, y: 26, w: 4, h: 6, color: '#475569', fill: 'rgba(71,85,105,0.06)' },
  { id: 'aisle-a34', label: '10 FT AISLE', x: 53, y: 26, w: 4, h: 6, color: '#475569', fill: 'rgba(71,85,105,0.06)' },
  // Cross Aisle A
  { id: 'cross-aisle-a', label: 'CROSS\nAISLE A\n12 FT WIDE', x: 66, y: 4, w: 2, h: 28, color: '#f59e0b', fill: 'rgba(245,158,11,0.08)' },
  // Aisle C between D zones
  { id: 'aisle-c', label: 'AISLE C\n12 FT WIDE', x: 47, y: 48, w: 3, h: 28, color: '#f59e0b', fill: 'rgba(245,158,11,0.08)' },
  // Aisles between C zones
  { id: 'aisle-c12', label: '12 FT AISLE', x: 28, y: 74, w: 4, h: 6, color: '#475569', fill: 'rgba(71,85,105,0.06)' },
  { id: 'aisle-c23', label: '12 FT AISLE', x: 40.5, y: 74, w: 4, h: 6, color: '#475569', fill: 'rgba(71,85,105,0.06)' },
  { id: 'aisle-c34', label: '12 FT AISLE', x: 53, y: 74, w: 4, h: 6, color: '#475569', fill: 'rgba(71,85,105,0.06)' },
  // Aisles between D zones
  { id: 'aisle-d12', label: '10 FT', x: 59, y: 70, w: 3, h: 6, color: '#475569', fill: 'rgba(71,85,105,0.06)' },
  { id: 'aisle-d23', label: '10 FT', x: 69.75, y: 70, w: 3, h: 6, color: '#475569', fill: 'rgba(71,85,105,0.06)' },
  { id: 'aisle-d34', label: '10 FT', x: 80.5, y: 70, w: 3, h: 6, color: '#475569', fill: 'rgba(71,85,105,0.06)' },
];

// ── Emergency Exits ──────────────────────────────────────────────────────────
const EMERGENCY_EXITS = [
  { x: 15, y: 0, label: 'EMERGENCY EXIT' },
  { x: 68, y: 0, label: 'EMERGENCY EXIT' },
  { x: 95, y: 78, label: 'EMERGENCY\nEXIT' },
];

// ── Flow arrows (material flow indicators between zones) ─────────────────────
const FLOW_ARROWS = [
  // Zone A flow: A1->A2->A3->A4
  { x1: 24, y1: 30, x2: 36, y2: 30, label: 'MOVE TO' },
  { x1: 36.5, y1: 30, x2: 49, y2: 30, label: 'MOVE TO' },
  { x1: 49.5, y1: 30, x2: 61, y2: 30, label: 'MOVE TO' },
  // Zone C flow: C1->C2->C3->C4
  { x1: 24, y1: 78, x2: 36, y2: 78, label: 'MOVE TO' },
  { x1: 36.5, y1: 78, x2: 49, y2: 78, label: 'MOVE TO' },
  { x1: 49.5, y1: 78, x2: 61, y2: 78, label: 'MOVE TO' },
  // Zone D flow: D1->D2->D3->D4
  { x1: 56, y1: 74, x2: 65, y2: 74, label: 'MOVE TO' },
  { x1: 66, y1: 74, x2: 75, y2: 74, label: 'MOVE TO' },
  { x1: 76, y1: 74, x2: 85, y2: 74, label: 'MOVE TO' },
  // Zone B flow: B1->B2->B3
  { x1: 74, y1: 30, x2: 82, y2: 30, label: 'MOVE TO' },
  { x1: 83, y1: 30, x2: 91, y2: 30, label: 'MOVE TO' },
];

// ── Rack representations (simplified rack rows inside zones) ─────────────────
function generateRacksForZone(zoneX, zoneY, zoneW, zoneH, rackRows, rackType) {
  const racks = [];
  const usableW = zoneW - 2;
  const startX = zoneX + 1;
  const spacing = (zoneH - 4) / Math.max(rackRows, 1);

  for (let i = 0; i < rackRows; i++) {
    racks.push({
      x: startX,
      y: zoneY + 2 + i * spacing,
      w: usableW,
      h: Math.min(spacing * 0.5, 2),
      type: rackType,
    });
  }
  return racks;
}

// ─── Dimension line helper ────────────────────────────────────────────────────
function DimensionLine({ x1, y1, x2, y2, label, offset = 0, side = 'top' }) {
  const isHorizontal = Math.abs(y1 - y2) < 0.1;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  if (isHorizontal) {
    const ty = side === 'top' ? y1 - offset - 1 : y1 + offset + 1;
    return (
      <g>
        <line x1={x1} y1={ty} x2={x2} y2={ty} stroke="#64748b" strokeWidth={0.15} markerStart="url(#dim-arrow-left)" markerEnd="url(#dim-arrow-right)" />
        <line x1={x1} y1={y1 - (side === 'top' ? offset + 1.5 : -offset)} x2={x1} y2={ty} stroke="#64748b" strokeWidth={0.08} strokeDasharray="0.5,0.5" />
        <line x1={x2} y1={y1 - (side === 'top' ? offset + 1.5 : -offset)} x2={x2} y2={ty} stroke="#64748b" strokeWidth={0.08} strokeDasharray="0.5,0.5" />
        <text x={mx} y={ty - 0.4} fill="#94a3b8" fontSize={1.1} fontWeight="700" fontFamily="Inter,sans-serif" textAnchor="middle">{label}</text>
      </g>
    );
  } else {
    const tx = side === 'left' ? x1 - offset - 1 : x1 + offset + 1;
    return (
      <g>
        <line x1={tx} y1={y1} x2={tx} y2={y2} stroke="#64748b" strokeWidth={0.15} markerStart="url(#dim-arrow-up)" markerEnd="url(#dim-arrow-down)" />
        <text x={tx - 0.5} y={(y1 + y2) / 2} fill="#94a3b8" fontSize={1.1} fontWeight="700" fontFamily="Inter,sans-serif" textAnchor="middle" transform={`rotate(-90, ${tx - 0.5}, ${(y1 + y2) / 2})`}>{label}</text>
      </g>
    );
  }
}

// ─── Multi-line text helper ───────────────────────────────────────────────────
function MultiLineText({ x, y, text, fontSize = 1.2, fill = '#e2e8f0', fontWeight = '700', textAnchor = 'middle', lineHeight = 1.4, opacity = 1 }) {
  const lines = text.split('\n');
  const startY = y - ((lines.length - 1) * fontSize * lineHeight) / 2;
  return (
    <>
      {lines.map((line, i) => (
        <text
          key={i}
          x={x}
          y={startY + i * fontSize * lineHeight}
          fill={fill}
          fontSize={fontSize}
          fontWeight={fontWeight}
          fontFamily="Inter, system-ui, sans-serif"
          textAnchor={textAnchor}
          dominantBaseline="middle"
          opacity={opacity}
          style={{ userSelect: 'none' }}
          pointerEvents="none"
        >
          {line}
        </text>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function CadLayoutView({
  cadLayout,
  loading,
  error,
  selectedBinCode,
  onBinClick,
  inventory = []
}) {
  const containerRef = useRef(null);

  // Zoom and pan states
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Hover tooltip
  const [hoveredElement, setHoveredElement] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Routing guidance panel toggle
  const [showRoutingGuide, setShowRoutingGuide] = useState(true);

  // Build bin occupancy map from real cadLayout data
  const binOccupancyMap = useMemo(() => {
    const map = {};
    if (cadLayout?.bins && Array.isArray(cadLayout.bins)) {
      cadLayout.bins.forEach(b => {
        const code = b.code || b.bin_code;
        if (code) {
          map[code] = {
            status: b.status || 'available',
            current_capacity: b.current_capacity ?? 0,
            max_capacity: b.max_capacity ?? 100,
          };
        }
      });
    }
    return map;
  }, [cadLayout]);

  // Build zone occupancy summary from real data
  const zoneOccupancy = useMemo(() => {
    const summary = {};
    if (cadLayout?.bins && Array.isArray(cadLayout.bins)) {
      cadLayout.bins.forEach(b => {
        const zoneName = b.zone_name || '';
        if (!summary[zoneName]) {
          summary[zoneName] = { total: 0, occupied: 0, available: 0 };
        }
        summary[zoneName].total++;
        if (b.status === 'occupied') summary[zoneName].occupied++;
        else summary[zoneName].available++;
      });
    }
    return summary;
  }, [cadLayout]);

  // ── Fit to view ────────────────────────────────────────────────────────────
  const fitToView = useCallback(() => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth || 900;
    const ch = containerRef.current.clientHeight || 520;

    const totalW = WH_W + SVG_PAD * 2;
    const totalH = WH_H + SVG_PAD * 2;

    const padding = 20;
    const usableW = cw - padding * 2;
    const usableH = ch - padding * 2;

    const scaleX = usableW / totalW;
    const scaleY = usableH / totalH;
    const newZoom = Math.min(scaleX, scaleY, 12);

    const px = cw / 2 - (totalW / 2) * newZoom;
    const py = ch / 2 - (totalH / 2) * newZoom;

    setZoom(newZoom);
    setPan({ x: px, y: py });
  }, []);

  useEffect(() => {
    const timer = setTimeout(fitToView, 80);
    return () => clearTimeout(timer);
  }, [fitToView]);

  useEffect(() => {
    const obs = new ResizeObserver(() => fitToView());
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [fitToView]);

  // ── Mouse wheel zoom ──────────────────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    const nextZoom = Math.min(Math.max(zoom * factor, 0.3), 20.0);
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dx = mx - pan.x;
    const dy = my - pan.y;
    setPan({ x: mx - dx * (nextZoom / zoom), y: my - dy * (nextZoom / zoom) });
    setZoom(nextZoom);
  }, [zoom, pan]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
    if (hoveredElement && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({ x: e.clientX - rect.left + 16, y: e.clientY - rect.top + 16 });
    }
  };
  const handleMouseUp = () => setIsDragging(false);

  const zoomInFn = () => setZoom(z => Math.min(z * 1.3, 20));
  const zoomOutFn = () => setZoom(z => Math.max(z / 1.3, 0.3));

  // ── Get zone status color based on real occupancy data ─────────────────────
  const getZoneStatusIndicator = (zoneId) => {
    // Try to find matching zone data from real occupancy
    const keys = Object.keys(zoneOccupancy);
    const match = keys.find(k => k.toLowerCase().includes(zoneId.toLowerCase()));
    if (match) {
      const data = zoneOccupancy[match];
      const pct = data.total > 0 ? (data.occupied / data.total) * 100 : 0;
      if (pct >= 80) return { status: 'FULL', color: '#ef4444' };
      if (pct >= 50) return { status: `${Math.round(pct)}%`, color: '#f59e0b' };
      return { status: `${Math.round(pct)}%`, color: '#22c55e' };
    }
    return null;
  };

  // ── Tooltip ────────────────────────────────────────────────────────────────
  const renderTooltip = () => {
    if (!hoveredElement) return null;
    const { type, data } = hoveredElement;

    return (
      <div
        className="absolute z-50 bg-slate-950/95 border border-slate-700/70 text-white rounded-xl p-3 text-xs shadow-2xl backdrop-blur-md pointer-events-none animate-in fade-in duration-100 min-w-[180px] max-w-[240px]"
        style={{ left: tooltipPos.x, top: tooltipPos.y }}
      >
        {type === 'zone' && (
          <>
            <div className="font-bold text-[12px] border-b border-slate-800 pb-1 mb-1.5" style={{ color: data.color }}>{data.label}</div>
            <div className="text-slate-400 text-[10px] space-y-0.5">
              <div>{data.sub}</div>
              {data.occupancy && (
                <div className="mt-1 pt-1 border-t border-slate-800">
                  <span className="text-slate-300">Bins: </span>
                  <span className="text-emerald-400">{data.occupancy.available} available</span>
                  <span className="text-slate-600"> / </span>
                  <span className="text-blue-400">{data.occupancy.occupied} occupied</span>
                </div>
              )}
            </div>
          </>
        )}
        {type === 'area' && (
          <>
            <div className="font-bold text-slate-200 text-[12px] border-b border-slate-800 pb-1 mb-1">{data.label?.replace('\n', ' ')}</div>
            {data.sub && <div className="text-slate-400 text-[10px]">{data.sub.replace('\n', ' · ')}</div>}
          </>
        )}
        {type === 'aisle' && (
          <>
            <div className="font-bold text-yellow-300 text-[12px]">{data.label?.replace('\n', ' ')}</div>
            <div className="text-slate-400 text-[10px] mt-0.5">Operator transit lane</div>
          </>
        )}
      </div>
    );
  };

  // ═══ LOADING / ERROR STATES ════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="w-full h-[560px] bg-slate-950 flex flex-col items-center justify-center border border-slate-800 rounded-2xl select-none">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071C1]"></div>
          <Box className="w-5 h-5 text-blue-500 absolute animate-pulse" />
        </div>
        <p className="text-slate-400 font-bold text-sm mt-4 tracking-wide">Loading Blueprint…</p>
        <p className="text-slate-600 text-xs mt-1">Syncing warehouse structure data</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[560px] bg-slate-950 flex flex-col items-center justify-center border border-red-950/40 rounded-2xl p-6 select-none">
        <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-full text-red-500 mb-4">
          <Info className="w-8 h-8" />
        </div>
        <h3 className="text-slate-200 font-bold text-base">Layout Data Unavailable</h3>
        <p className="text-red-400 text-xs font-mono max-w-md text-center mt-2 p-2 bg-red-950/10 border border-red-950/30 rounded-lg">{error}</p>
        <p className="text-slate-500 text-xs mt-3">The blueprint will render with the standard warehouse structure. Bin occupancy data requires a backend connection.</p>
        <button onClick={fitToView} className="mt-4 px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5" /> Continue with Blueprint
        </button>
      </div>
    );
  }

  // ═══ MAIN SVG RENDER ═══════════════════════════════════════════════════════
  return (
    <div className="relative w-full flex select-none" style={{ height: '600px' }}>

      {/* ── SVG Blueprint Area ── */}
      <div className="flex-1 relative overflow-hidden bg-[#020617] rounded-bl-2xl">

        {/* Top HUD Controls */}
        <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-start pointer-events-none gap-2">
          {/* Title badge */}
          <div className="bg-slate-900/90 border border-slate-700/60 backdrop-blur-md px-3 py-2 rounded-xl pointer-events-auto shadow-lg">
            <div className="text-[11px] font-bold text-white tracking-wide">8,000 SQ FT WAREHOUSE</div>
            <div className="text-[9px] text-slate-400 font-semibold mt-0.5">4 Zone Group Comprehensive Storage Blueprint</div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-slate-900/90 border border-slate-700/60 backdrop-blur-md p-1 rounded-xl pointer-events-auto shadow-lg">
            <button onClick={zoomInFn} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all" title="Zoom In"><ZoomIn className="w-3.5 h-3.5" /></button>
            <button onClick={zoomOutFn} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all" title="Zoom Out"><ZoomOut className="w-3.5 h-3.5" /></button>
            <button onClick={fitToView} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all" title="Fit to View"><RotateCcw className="w-3.5 h-3.5" /></button>
            <span className="text-[10px] font-mono font-bold text-slate-500 border-l border-slate-700 pl-2 ml-1 pr-1">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* SVG Viewport */}
        <div
          ref={containerRef}
          className={`w-full h-full overflow-hidden relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg className="w-full h-full">
            <defs>
              {/* Grid patterns */}
              <pattern id="bp-grid-sm" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M5 0 L0 0 0 5" fill="none" stroke="rgba(71,85,105,0.07)" strokeWidth="0.06" />
              </pattern>
              <pattern id="bp-grid-lg" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0 L0 0 0 20" fill="none" stroke="rgba(71,85,105,0.14)" strokeWidth="0.1" />
              </pattern>
              {/* Dimension arrow markers */}
              <marker id="dim-arrow-right" markerWidth="3" markerHeight="3" refX="2.5" refY="1.5" orient="auto"><path d="M0,0 L3,1.5 L0,3" fill="#64748b" /></marker>
              <marker id="dim-arrow-left" markerWidth="3" markerHeight="3" refX="0.5" refY="1.5" orient="auto"><path d="M3,0 L0,1.5 L3,3" fill="#64748b" /></marker>
              <marker id="dim-arrow-down" markerWidth="3" markerHeight="3" refX="1.5" refY="2.5" orient="auto"><path d="M0,0 L1.5,3 L3,0" fill="#64748b" /></marker>
              <marker id="dim-arrow-up" markerWidth="3" markerHeight="3" refX="1.5" refY="0.5" orient="auto"><path d="M0,3 L1.5,0 L3,3" fill="#64748b" /></marker>
              {/* Flow arrow marker */}
              <marker id="flow-arrow" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto">
                <path d="M0,0 L4,2 L0,4" fill="#facc15" />
              </marker>
              {/* Rack hatch pattern */}
              <pattern id="rack-hatch" width="1.5" height="1.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="1.5" stroke="rgba(71,85,105,0.25)" strokeWidth="0.15" />
              </pattern>
            </defs>

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Background grids */}
              <rect x={-SVG_PAD} y={-SVG_PAD} width={WH_W + SVG_PAD * 2} height={WH_H + SVG_PAD * 2} fill="url(#bp-grid-sm)" />
              <rect x={-SVG_PAD} y={-SVG_PAD} width={WH_W + SVG_PAD * 2} height={WH_H + SVG_PAD * 2} fill="url(#bp-grid-lg)" />

              {/* ── Warehouse boundary ── */}
              <rect
                x={0} y={0} width={WH_W} height={WH_H}
                fill="none"
                stroke="#475569"
                strokeWidth={0.4}
              />

              {/* Column markers along edges */}
              {[0, 18, 30, 42, 50, 62, 68, 80, 100].map(cx => (
                <g key={`col-${cx}`}>
                  <line x1={cx} y1={-0.5} x2={cx} y2={0.5} stroke="#64748b" strokeWidth={0.2} />
                  <circle cx={cx} cy={0} r={0.5} fill="none" stroke="#475569" strokeWidth={0.1} />
                  <text x={cx} y={-1.2} fill="#64748b" fontSize={0.8} fontWeight="700" fontFamily="Inter,sans-serif" textAnchor="middle">{String.fromCharCode(65 + [0,18,30,42,50,62,68,80,100].indexOf(cx))}</text>
                </g>
              ))}

              {/* ── Dimension lines ── */}
              <DimensionLine x1={0} y1={0} x2={100} y2={0} label="100 FT" offset={2} side="top" />
              <DimensionLine x1={0} y1={0} x2={18} y2={0} label="18 FT" offset={0.5} side="top" />
              <DimensionLine x1={18} y1={0} x2={68} y2={0} label="50 FT" offset={0.5} side="top" />
              <DimensionLine x1={80} y1={0} x2={100} y2={0} label="20 FT" offset={0.5} side="top" />

              {/* Left side vertical dim */}
              <g>
                <text x={-1.8} y={18} fill="#94a3b8" fontSize={1} fontWeight="700" fontFamily="Inter,sans-serif" textAnchor="middle" transform="rotate(-90, -1.8, 18)">13' 0"</text>
                <text x={-1.8} y={40} fill="#94a3b8" fontSize={1} fontWeight="700" fontFamily="Inter,sans-serif" textAnchor="middle" transform="rotate(-90, -1.8, 40)">80 FT</text>
              </g>

              {/* ══════════════ FUNCTIONAL AREAS ══════════════ */}
              {FUNCTIONAL_AREAS.map(area => (
                <g
                  key={area.id}
                  onMouseEnter={(e) => {
                    if (containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      setTooltipPos({ x: e.clientX - rect.left + 16, y: e.clientY - rect.top + 16 });
                    }
                    setHoveredElement({ type: 'area', data: area });
                  }}
                  onMouseLeave={() => setHoveredElement(null)}
                  className="cursor-default"
                >
                  <rect
                    x={area.x} y={area.y} width={area.w} height={area.h}
                    fill={area.fill}
                    stroke={area.color}
                    strokeWidth={0.2}
                    strokeDasharray="1,0.5"
                    rx={0.3}
                  />
                  <MultiLineText
                    x={area.x + area.w / 2}
                    y={area.y + area.h / 2 - (area.sub ? 1 : 0)}
                    text={area.label}
                    fontSize={1.1}
                    fill={area.color}
                    fontWeight="800"
                    opacity={0.85}
                  />
                  {area.sub && (
                    <MultiLineText
                      x={area.x + area.w / 2}
                      y={area.y + area.h / 2 + 2.5}
                      text={area.sub}
                      fontSize={0.75}
                      fill="#94a3b8"
                      fontWeight="600"
                      opacity={0.6}
                    />
                  )}
                </g>
              ))}

              {/* ══════════════ SUB-AREAS ══════════════ */}
              {SUB_AREAS.map((sa, idx) => (
                <g key={`sub-${idx}`}>
                  <rect
                    x={sa.x} y={sa.y} width={sa.w} height={sa.h}
                    fill="none"
                    stroke={sa.color}
                    strokeWidth={0.1}
                    strokeDasharray="0.8,0.4"
                    rx={0.2}
                    opacity={0.4}
                  />
                  <MultiLineText
                    x={sa.x + sa.w / 2}
                    y={sa.y + sa.h / 2}
                    text={sa.label}
                    fontSize={sa.fontSize || 0.7}
                    fill={sa.color}
                    fontWeight="600"
                    opacity={0.55}
                  />
                </g>
              ))}

              {/* ══════════════ AISLES ══════════════ */}
              {AISLES.map(aisle => (
                <g
                  key={aisle.id}
                  onMouseEnter={(e) => {
                    if (containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      setTooltipPos({ x: e.clientX - rect.left + 16, y: e.clientY - rect.top + 16 });
                    }
                    setHoveredElement({ type: 'aisle', data: aisle });
                  }}
                  onMouseLeave={() => setHoveredElement(null)}
                  className="cursor-default"
                >
                  <rect
                    x={aisle.x} y={aisle.y} width={aisle.w} height={aisle.h}
                    fill={aisle.fill}
                    stroke={aisle.color}
                    strokeWidth={aisle.isMain ? 0.25 : 0.12}
                    strokeDasharray={aisle.isMain ? 'none' : '1.5,0.5'}
                    rx={0.15}
                    opacity={0.8}
                  />
                  {aisle.isMain && (
                    <MultiLineText
                      x={aisle.x + aisle.w / 2}
                      y={aisle.y + aisle.h / 2}
                      text={aisle.label}
                      fontSize={1.3}
                      fill="#facc15"
                      fontWeight="900"
                      opacity={0.7}
                    />
                  )}
                  {!aisle.isMain && aisle.label.includes('CROSS') && (
                    <MultiLineText
                      x={aisle.x + aisle.w / 2}
                      y={aisle.y + aisle.h / 2}
                      text={aisle.label}
                      fontSize={0.7}
                      fill="#f59e0b"
                      fontWeight="700"
                      opacity={0.6}
                    />
                  )}
                  {!aisle.isMain && aisle.label.includes('AISLE C\n') && (
                    <MultiLineText
                      x={aisle.x + aisle.w / 2}
                      y={aisle.y + aisle.h / 2}
                      text={aisle.label}
                      fontSize={0.7}
                      fill="#f59e0b"
                      fontWeight="700"
                      opacity={0.6}
                    />
                  )}
                </g>
              ))}

              {/* ══════════════ ZONE GROUPS ══════════════ */}
              {ZONE_GROUPS.map(group => (
                <g key={`group-${group.id}`}>
                  {/* Individual zones within each group */}
                  {group.zones.map(zone => {
                    const statusInfo = getZoneStatusIndicator(zone.id);
                    const matchKey = Object.keys(zoneOccupancy).find(k => k.toLowerCase().includes(zone.id.toLowerCase()));
                    const occupancy = matchKey ? zoneOccupancy[matchKey] : null;

                    return (
                      <g
                        key={`zone-${zone.id}`}
                        onMouseEnter={(e) => {
                          if (containerRef.current) {
                            const rect = containerRef.current.getBoundingClientRect();
                            setTooltipPos({ x: e.clientX - rect.left + 16, y: e.clientY - rect.top + 16 });
                          }
                          setHoveredElement({
                            type: 'zone',
                            data: { ...zone, color: group.color, occupancy }
                          });
                        }}
                        onMouseLeave={() => setHoveredElement(null)}
                        className="cursor-pointer"
                      >
                        {/* Zone fill */}
                        <rect
                          x={zone.x} y={zone.y} width={zone.w} height={zone.h}
                          fill={group.fill}
                          stroke={group.border}
                          strokeWidth={0.2}
                          rx={0.3}
                        />

                        {/* Rack rows inside zone */}
                        {generateRacksForZone(
                          zone.x, zone.y, zone.w, zone.h,
                          group.id === 'D' ? 6 : 4,
                          group.id
                        ).map((rack, ri) => (
                          <rect
                            key={`rack-${zone.id}-${ri}`}
                            x={rack.x} y={rack.y} width={rack.w} height={rack.h}
                            fill="url(#rack-hatch)"
                            stroke={group.color}
                            strokeWidth={0.08}
                            rx={0.1}
                            opacity={0.5}
                          />
                        ))}

                        {/* Zone label */}
                        <text
                          x={zone.x + zone.w / 2}
                          y={zone.y + zone.h / 2 - 1}
                          fill={group.color}
                          fontSize={1.5}
                          fontWeight="900"
                          fontFamily="Inter, system-ui, sans-serif"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          opacity={0.9}
                          style={{ userSelect: 'none' }}
                          pointerEvents="none"
                        >
                          {zone.label}
                        </text>

                        {/* Zone dimensions */}
                        <MultiLineText
                          x={zone.x + zone.w / 2}
                          y={zone.y + zone.h / 2 + 2}
                          text={zone.sub}
                          fontSize={0.7}
                          fill="#94a3b8"
                          fontWeight="600"
                          opacity={0.5}
                        />

                        {/* Status indicator from real data */}
                        {statusInfo && (
                          <g>
                            <rect
                              x={zone.x + zone.w - 5}
                              y={zone.y + 0.8}
                              width={4.5}
                              height={1.8}
                              fill={statusInfo.color}
                              rx={0.4}
                              opacity={0.85}
                            />
                            <text
                              x={zone.x + zone.w - 2.75}
                              y={zone.y + 1.75}
                              fill="#fff"
                              fontSize={0.7}
                              fontWeight="800"
                              fontFamily="Inter, sans-serif"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              style={{ userSelect: 'none' }}
                              pointerEvents="none"
                            >
                              {statusInfo.status}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Zone Group header label */}
                  <text
                    x={group.zones[0].x + (group.zones[group.zones.length - 1].x + group.zones[group.zones.length - 1].w - group.zones[0].x) / 2}
                    y={group.zones[0].y - 1}
                    fill={group.color}
                    fontSize={1.2}
                    fontWeight="900"
                    fontFamily="Inter, system-ui, sans-serif"
                    textAnchor="middle"
                    opacity={0.7}
                    style={{ userSelect: 'none' }}
                    pointerEvents="none"
                  >
                    {group.label} – {group.subtitle}
                  </text>
                </g>
              ))}

              {/* ══════════════ FLOW ARROWS ══════════════ */}
              {FLOW_ARROWS.map((arrow, idx) => (
                <g key={`flow-${idx}`}>
                  <line
                    x1={arrow.x1} y1={arrow.y1}
                    x2={arrow.x2} y2={arrow.y2}
                    stroke="#facc15"
                    strokeWidth={0.2}
                    markerEnd="url(#flow-arrow)"
                    opacity={0.5}
                  />
                  <rect
                    x={(arrow.x1 + arrow.x2) / 2 - 2.5}
                    y={arrow.y1 - 1}
                    width={5}
                    height={1.6}
                    fill="#1e293b"
                    stroke="#facc15"
                    strokeWidth={0.08}
                    rx={0.3}
                    opacity={0.7}
                  />
                  <text
                    x={(arrow.x1 + arrow.x2) / 2}
                    y={arrow.y1 - 0.1}
                    fill="#facc15"
                    fontSize={0.6}
                    fontWeight="800"
                    fontFamily="Inter, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    opacity={0.8}
                    style={{ userSelect: 'none' }}
                    pointerEvents="none"
                  >
                    {arrow.label}
                  </text>
                </g>
              ))}

              {/* ══════════════ EMERGENCY EXITS ══════════════ */}
              {EMERGENCY_EXITS.map((ex, idx) => (
                <g key={`exit-${idx}`}>
                  <rect
                    x={ex.x - 2.5} y={ex.y - 0.5}
                    width={5} height={1.5}
                    fill="rgba(239,68,68,0.2)"
                    stroke="#ef4444"
                    strokeWidth={0.15}
                    rx={0.3}
                  />
                  <MultiLineText
                    x={ex.x}
                    y={ex.y + 0.3}
                    text={ex.label}
                    fontSize={0.55}
                    fill="#ef4444"
                    fontWeight="800"
                    opacity={0.9}
                  />
                </g>
              ))}

              {/* ══════════════ TITLE BLOCK ══════════════ */}
              <text
                x={50} y={-3.5}
                fill="#e2e8f0"
                fontSize={2}
                fontWeight="900"
                fontFamily="Inter, system-ui, sans-serif"
                textAnchor="middle"
                style={{ userSelect: 'none' }}
                pointerEvents="none"
              >
                8,000 SQ FT WAREHOUSE – 4 ZONE GROUP COMPREHENSIVE STORAGE BLUEPRINT
              </text>

              {/* Info boxes at top */}
              {[
                { label: 'TOTAL AREA', value: '8,000 SQ FT', x: 3 },
                { label: 'ZONE GROUPS', value: '4', x: 16 },
                { label: 'INTERNAL ZONES', value: '15', x: 28 },
                { label: 'TOTAL RACKS', value: '71', x: 40 },
                { label: 'TOTAL SHELVES', value: '244', x: 52 },
                { label: 'TOTAL BINS', value: '1,216', x: 64 },
                { label: 'PALLET POSITIONS', value: '96', x: 76 },
              ].map((info, i) => (
                <g key={`info-${i}`}>
                  <rect
                    x={info.x - 4} y={-6.5}
                    width={10} height={2.2}
                    fill="rgba(30,41,59,0.8)"
                    stroke="#334155"
                    strokeWidth={0.08}
                    rx={0.3}
                  />
                  <text x={info.x + 1} y={-5.8} fill="#64748b" fontSize={0.5} fontWeight="700" fontFamily="Inter,sans-serif" textAnchor="middle" style={{ userSelect: 'none' }}>{info.label}</text>
                  <text x={info.x + 1} y={-4.8} fill="#e2e8f0" fontSize={0.8} fontWeight="900" fontFamily="Inter,sans-serif" textAnchor="middle" style={{ userSelect: 'none' }}>{info.value}</text>
                </g>
              ))}

            </g>
          </svg>
        </div>

        {/* ── Bottom Legend HUD ── */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between pointer-events-none gap-2">
          <div className="bg-slate-900/90 border border-slate-700/60 backdrop-blur-md px-3 py-2 rounded-xl flex items-center gap-4 text-[10px] font-semibold text-slate-400 flex-wrap">
            {/* Zone Group colors */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-green-500 bg-green-500/15 inline-block shrink-0"></span>
              <span className="text-green-400">Zone A (Fast)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-blue-500 bg-blue-500/15 inline-block shrink-0"></span>
              <span className="text-blue-400">Zone B (Medium)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-orange-500 bg-orange-500/15 inline-block shrink-0"></span>
              <span className="text-orange-400">Zone C (Heavy)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-purple-500 bg-purple-500/15 inline-block shrink-0"></span>
              <span className="text-purple-400">Zone D (Bins)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-yellow-500 bg-yellow-500/15 inline-block shrink-0"></span>
              <span className="text-yellow-400">AGV Lane</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-red-500 bg-red-500/15 inline-block shrink-0"></span>
              <span className="text-red-400">Emergency</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] text-slate-500 font-medium shrink-0">
            🖱 Drag to Pan · Scroll to Zoom
          </div>
        </div>

        {/* ── Tooltip ── */}
        {renderTooltip()}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── OPERATOR ROUTING GUIDANCE PANEL (right side) ── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <div className={`transition-all duration-300 ${showRoutingGuide ? 'w-[280px]' : 'w-0'} bg-slate-950 border-l border-slate-800 overflow-y-auto overflow-x-hidden flex-shrink-0`}>
        {showRoutingGuide && (
          <div className="p-3 space-y-4">

            {/* Panel Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Routing Guide</span>
              </div>
              <button
                onClick={() => setShowRoutingGuide(false)}
                className="text-slate-500 hover:text-slate-300 text-[10px] font-bold p-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Location Code Example */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-2.5">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Location Code Format</div>
              <div className="bg-slate-800 rounded-md p-2 text-center mb-2">
                <span className="text-[13px] font-mono font-black text-white tracking-wider">
                  <span className="text-green-400">ZG-A</span>
                  <span className="text-slate-600"> / </span>
                  <span className="text-blue-400">A1</span>
                  <span className="text-slate-600"> / </span>
                  <span className="text-orange-400">R02</span>
                  <span className="text-slate-600"> / </span>
                  <span className="text-purple-400">L03</span>
                  <span className="text-slate-600"> / </span>
                  <span className="text-cyan-400">B04</span>
                </span>
              </div>
              <div className="space-y-1 text-[9px]">
                <div className="flex gap-2"><span className="text-green-400 font-bold w-8">ZG-A</span><span className="text-slate-400">= Zone Group A</span></div>
                <div className="flex gap-2"><span className="text-blue-400 font-bold w-8">A1</span><span className="text-slate-400">= Internal Zone A1</span></div>
                <div className="flex gap-2"><span className="text-orange-400 font-bold w-8">R02</span><span className="text-slate-400">= Rack Row 2</span></div>
                <div className="flex gap-2"><span className="text-purple-400 font-bold w-8">L03</span><span className="text-slate-400">= Shelf Level 3</span></div>
                <div className="flex gap-2"><span className="text-cyan-400 font-bold w-8">B04</span><span className="text-slate-400">= Bin 4</span></div>
              </div>
            </div>

            {/* Flow & Overflow Logic */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-2.5">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Flow & Overflow Logic</div>
              <div className="space-y-2">
                {[
                  { group: 'A', zones: ['A1', 'A2', 'A3', 'A4'], color: '#22c55e' },
                  { group: 'B', zones: ['B1', 'B2', 'B3'], color: '#3b82f6' },
                  { group: 'C', zones: ['C1', 'C2', 'C3', 'C4'], color: '#f97316' },
                  { group: 'D', zones: ['D1', 'D2', 'D3', 'D4'], color: '#a855f7' },
                ].map(flow => (
                  <div key={flow.group} className="flex items-center gap-1 text-[10px] font-bold flex-wrap">
                    {flow.zones.map((z, i) => (
                      <React.Fragment key={z}>
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px]"
                          style={{ backgroundColor: `${flow.color}20`, color: flow.color, border: `1px solid ${flow.color}40` }}
                        >
                          {z}
                        </span>
                        {i < flow.zones.length - 1 && (
                          <ArrowRight className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ))}
              </div>
              <div className="text-[8px] text-slate-600 mt-2 italic leading-relaxed">
                When current zone is full, inventory moves to the next available zone in the same group.
              </div>
            </div>

            {/* Aisle Widths */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-2.5">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Aisle Widths</div>
              <div className="space-y-1.5">
                {[
                  { label: 'Main Forklift / AGV Lane', width: '12 ft' },
                  { label: 'Zone A Internal Aisle', width: '10 ft' },
                  { label: 'Zone B Internal Aisle', width: '10 ft' },
                  { label: 'Zone C (Heavy) Aisle', width: '12 ft' },
                  { label: 'Zone D (Small Parts) Aisle', width: '8–10 ft' },
                  { label: 'Worker Safety Walkway', width: '4 ft' },
                  { label: 'Emergency Walkway', width: '4 ft' },
                ].map((a, i) => (
                  <div key={i} className="flex justify-between text-[9px]">
                    <span className="text-slate-400 font-semibold">{a.label}</span>
                    <span className="text-slate-200 font-bold font-mono">{a.width}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Area Dimensions Summary */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-2.5">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Area Dimensions</div>
              <div className="space-y-1">
                {[
                  { area: 'Receiving Area', dim: '40 × 18', sqft: '720' },
                  { area: 'Scanning & Verification', dim: '16 × 12', sqft: '192' },
                  { area: 'Temporary Receiving Racks', dim: '12 × 12', sqft: '144' },
                  { area: 'Zone Group A', dim: '50 × 28', sqft: '1,400' },
                  { area: 'Zone Group B', dim: '50 × 28', sqft: '1,400' },
                  { area: 'Zone Group C', dim: '50 × 32', sqft: '1,600' },
                  { area: 'Zone Group D', dim: '43 × 28', sqft: '1,204' },
                  { area: 'Packing & Dispatch', dim: '35 × 20', sqft: '700' },
                  { area: 'Admin & Operations', dim: '20 × 20', sqft: '400' },
                  { area: 'Utility & Support', dim: '20 × 20', sqft: '400' },
                  { area: 'Main Forklift/AGV Lane', dim: '100 × 12', sqft: '1,200' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between text-[9px] gap-1">
                    <span className="text-slate-400 truncate">{row.area}</span>
                    <span className="text-slate-500 font-mono shrink-0">{row.sqft}</span>
                  </div>
                ))}
                <div className="flex justify-between text-[9px] border-t border-slate-800 pt-1 mt-1">
                  <span className="text-white font-bold">TOTAL</span>
                  <span className="text-white font-bold font-mono">8,000</span>
                </div>
              </div>
            </div>

            {/* Operator Walk-through Instructions */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-2.5">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Operator Walk-Through</div>
              <div className="space-y-2">
                {[
                  { step: 1, text: 'Enter from Truck Entry → proceed to Receiving Area for unloading, inspection & counting.' },
                  { step: 2, text: 'After QC, items go to Scanning & Verification for barcode/RFID scan.' },
                  { step: 3, text: 'Fast-moving items → Zone Group A. Medium → Zone Group B. Heavy/Pallet → Zone Group C. Small parts → Zone Group D.' },
                  { step: 4, text: 'Use Main Forklift/AGV Lane (12 FT) for cross-warehouse transit.' },
                  { step: 5, text: 'Pick orders routed to Packing & Dispatch via packing stations, label printing, and sortation conveyor.' },
                  { step: 6, text: 'Dispatch staging area for outbound shipping.' },
                ].map(s => (
                  <div key={s.step} className="flex gap-2 items-start">
                    <span className="w-4 h-4 rounded-full bg-blue-900/60 text-blue-300 flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">{s.step}</span>
                    <span className="text-[9px] text-slate-400 leading-relaxed">{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toggle routing guide button when collapsed */}
      {!showRoutingGuide && (
        <button
          onClick={() => setShowRoutingGuide(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white p-2 rounded-lg shadow-lg transition-all"
          title="Show Routing Guide"
        >
          <Navigation className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

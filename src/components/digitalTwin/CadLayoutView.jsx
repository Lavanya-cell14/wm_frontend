import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Box, Info } from 'lucide-react';

// ─── Visual Scale Multiplier ──────────────────────────────────────────────────
// Real backend coordinates are in meters (often compressed 0–90m range).
// We render at 1:1 in SVG user-units, then rely on zoom/pan to scale.
// Bin rectangles use a minimum visual size so they're never tiny at default zoom.
const MIN_BIN_PX   = 1.8;   // minimum rendered width/height of bin in SVG units
const MIN_RACK_PX  = 6;     // minimum rendered rack width in SVG units
const RACK_MIN_D   = 3;     // minimum rendered rack depth in SVG units

// Zone label: only draw if zone is wide enough for it not to clip
const ZONE_LABEL_MIN_W = 8; // minimum zone width in SVG units to show label

export default function CadLayoutView({
  cadLayout,
  loading,
  error,
  selectedBinCode,
  onBinClick,
  inventory = []
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // Zoom and pan states
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Shelf level selection state
  const [selectedLevel, setSelectedLevel] = useState(1);

  // Hover states for tooltips
  const [hoveredElement, setHoveredElement] = useState(null); // { type, data, pos }
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Get unique shelf levels from layout data
  const uniqueLevels = useMemo(() => {
    if (!cadLayout?.shelves) return [];
    const levels = cadLayout.shelves.map(s => s.level).filter(l => l != null);
    return [...new Set(levels)].sort((a, b) => Number(a) - Number(b));
  }, [cadLayout]);

  // Set default level once uniqueLevels load
  useEffect(() => {
    if (uniqueLevels.length > 0 && !uniqueLevels.includes(selectedLevel)) {
      setSelectedLevel(uniqueLevels[0]);
    }
  }, [uniqueLevels, selectedLevel]);

  // Layout coordinate calculations
  const coords = useMemo(() => {
    if (!cadLayout?.warehouse) return null;
    const { warehouse } = cadLayout;
    const bb = warehouse.calculated_bounding_box;

    const minX = bb?.min_x ?? 0;
    const minY = bb?.min_y ?? 0;
    const maxX = bb?.max_x ?? (minX + (warehouse.width || 80));
    const maxY = bb?.max_y ?? (minY + (warehouse.depth || 60));

    const rangeX = Math.max(maxX - minX, 1);
    const rangeY = Math.max(maxY - minY, 1);

    return { minX, minY, maxX, maxY, rangeX, rangeY };
  }, [cadLayout]);

  // World Y → SVG Y (flip vertical axis)
  const worldToSvgY = useCallback((yWorld) => {
    if (!coords) return yWorld;
    return coords.maxY + coords.minY - yWorld;
  }, [coords]);

  // Fit-to-view: compute a zoom and pan so the whole warehouse fits with padding
  const fitToView = useCallback(() => {
    if (!coords || !containerRef.current) return;
    const containerWidth  = containerRef.current.clientWidth  || 800;
    const containerHeight = containerRef.current.clientHeight || 480;

    const padding = 40; // pixels of breathing room
    const usableW = containerWidth  - padding * 2;
    const usableH = containerHeight - padding * 2;

    const scaleX = usableW / coords.rangeX;
    const scaleY = usableH / coords.rangeY;
    const newZoom = Math.min(scaleX, scaleY, 10.0);

    // Center the warehouse in the container
    const warehouseCenterX = (coords.minX + coords.maxX) / 2;
    const warehouseCenterY = (coords.minY + coords.maxY) / 2;

    // SVG center of the warehouse after flip
    const svgCenterX = warehouseCenterX;
    const svgCenterY = worldToSvgY(warehouseCenterY);

    const px = containerWidth  / 2 - svgCenterX * newZoom;
    const py = containerHeight / 2 - svgCenterY * newZoom;

    setZoom(newZoom);
    setPan({ x: px, y: py });
  }, [coords, worldToSvgY]);

  // Run fitToView when layout data loads or viewport resized
  useEffect(() => {
    if (cadLayout && coords) {
      const timer = setTimeout(fitToView, 120);
      return () => clearTimeout(timer);
    }
  }, [cadLayout, coords, fitToView]);

  // ResizeObserver
  useEffect(() => {
    const observer = new ResizeObserver(() => fitToView());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [fitToView]);

  // Mouse wheel zoom relative to cursor position
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
    const nextZoom = Math.min(Math.max(zoom * factor, 0.05), 20.0);
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const dx = mouseX - pan.x;
    const dy = mouseY - pan.y;
    setPan({ x: mouseX - dx * (nextZoom / zoom), y: mouseY - dy * (nextZoom / zoom) });
    setZoom(nextZoom);
  }, [zoom, pan]);

  // Attach wheel listener as non-passive
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Drag handlers
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

  const zoomIn  = () => setZoom(z => Math.min(z * 1.3, 20.0));
  const zoomOut = () => setZoom(z => Math.max(z / 1.3, 0.05));

  // ─── Memoised SVG Layout ──────────────────────────────────────────────────
  const renderLayoutContent = useMemo(() => {
    if (!cadLayout || !coords) return null;
    const { zones = [], racks = [], shelves = [], bins = [] } = cadLayout;

    // Filter bins for selected shelf level
    const levelShelves = shelves.filter(s => s.level === selectedLevel);
    const shelfIdSet   = new Set(levelShelves.map(s => s.id));
    const levelBins    = bins.filter(b => b.shelf_id && shelfIdSet.has(b.shelf_id));

    // Build inventory map for quick lookup
    const inventoryMap = {};
    inventory.forEach(item => { inventoryMap[item.bin] = item; });

    // ── 1. Warehouse boundary (faint grid fill) ──────────────────────────
    const svgBoundaryY = worldToSvgY(coords.maxY);
    const boundaryRect = (
      <rect
        x={coords.minX}
        y={svgBoundaryY}
        width={coords.rangeX}
        height={coords.rangeY}
        fill="url(#cad-grid)"
        stroke="#334155"
        strokeWidth={0.5}
      />
    );

    // ── 2. Zones ────────────────────────────────────────────────────────
    const zoneColorPalette = [
      '#0ea5e9', // sky-500
      '#a78bfa', // violet-400
      '#fb923c', // orange-400
      '#34d399', // emerald-400
      '#f472b6', // pink-400
      '#facc15', // yellow-400
      '#60a5fa', // blue-400
      '#4ade80', // green-400
    ];

    const renderZones = zones.map((z, idx) => {
      const x = z.x_coordinate ?? 0;
      const yWorld = z.y_coordinate ?? 0;
      const w = Math.max(z.width ?? 10, 4);
      const d = Math.max(z.depth ?? 10, 4);
      const color = zoneColorPalette[idx % zoneColorPalette.length];

      // Zone rect: origin is bottom-left in world → flip to SVG top-left
      const svgY = worldToSvgY(yWorld + d);
      const cx = x + w / 2;
      const cy = svgY + d / 2;

      return (
        <g key={`zone-${z.id}`}>
          {/* Zone fill with subtle tint */}
          <rect
            x={x}
            y={svgY}
            width={w}
            height={d}
            fill={`${color}12`}
            stroke={color}
            strokeWidth={0.4}
            strokeDasharray="3,3"
          />
          {/* Zone label — only when wide enough */}
          {w >= ZONE_LABEL_MIN_W && (
            <text
              x={cx}
              y={cy}
              fill={color}
              fontSize={Math.min(w * 0.12, 2.5)}
              fontWeight="700"
              fontFamily="Inter, sans-serif"
              textAnchor="middle"
              dominantBaseline="middle"
              opacity={0.65}
              pointerEvents="none"
              style={{ userSelect: 'none' }}
            >
              {z.name}
            </text>
          )}
        </g>
      );
    });

    // ── 3. Racks ─────────────────────────────────────────────────────────
    const renderRacks = racks.map((r) => {
      const cx = r.x_coordinate ?? 0;
      const cyWorld = r.y_coordinate ?? 0;
      const w = Math.max(r.width ?? 4, MIN_RACK_PX);
      const d = Math.max(r.depth ?? 1.5, RACK_MIN_D);

      const x    = cx - w / 2;
      const svgY = worldToSvgY(cyWorld + d / 2);

      return (
        <g
          key={`rack-${r.id}`}
          onMouseEnter={() => setHoveredElement({ type: 'rack', data: r })}
          onMouseLeave={() => setHoveredElement(null)}
          className="cursor-default"
        >
          {/* Rack body */}
          <rect
            x={x}
            y={svgY}
            width={w}
            height={d}
            fill="#1e293b"
            stroke="#475569"
            strokeWidth={0.22}
            rx={0.15}
          />
          {/* Cross-hatch lines to suggest shelves */}
          <line x1={x} y1={svgY + d * 0.33} x2={x + w} y2={svgY + d * 0.33}
            stroke="#334155" strokeWidth={0.1} />
          <line x1={x} y1={svgY + d * 0.66} x2={x + w} y2={svgY + d * 0.66}
            stroke="#334155" strokeWidth={0.1} />
        </g>
      );
    });

    // ── 4. Bins ───────────────────────────────────────────────────────────
    const renderBins = levelBins.map((b) => {
      const cx = b.x_coordinate ?? 0;
      const cyWorld = b.y_coordinate ?? 0;
      const w = Math.max(b.width ?? 1.2, MIN_BIN_PX);
      const d = Math.max(b.depth ?? 1.2, MIN_BIN_PX);

      const x    = cx - w / 2;
      const svgY = worldToSvgY(cyWorld + d / 2);

      const isSelected = selectedBinCode === b.code;
      const isOccupied = b.status === 'occupied';

      let fillColor   = 'rgba(16, 185, 129, 0.14)';  // available — green tint
      let strokeColor = '#10b981';
      let sw          = 0.18;

      if (isOccupied) {
        fillColor   = 'rgba(59, 130, 246, 0.18)';
        strokeColor = '#3b82f6';
      }
      if (isSelected) {
        fillColor   = 'rgba(234, 179, 8, 0.35)';
        strokeColor = '#eab308';
        sw          = 0.38;
      }

      const inventoryItem = inventoryMap[b.code];

      return (
        <g
          key={`bin-${b.id}`}
          onClick={(e) => { e.stopPropagation(); onBinClick(b); }}
          onMouseEnter={(e) => {
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              setTooltipPos({ x: e.clientX - rect.left + 16, y: e.clientY - rect.top + 16 });
            }
            setHoveredElement({ type: 'bin', data: { ...b, inventoryItem } });
          }}
          onMouseLeave={() => setHoveredElement(null)}
          className="cursor-pointer"
        >
          <rect
            x={x}
            y={svgY}
            width={w}
            height={d}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={sw}
            rx={0.1}
            className={isSelected ? 'animate-pulse' : ''}
          />
          {/* Selected bin gets a dot-center indicator */}
          {isSelected && (
            <circle
              cx={cx}
              cy={svgY + d / 2}
              r={Math.min(w, d) * 0.15}
              fill={strokeColor}
              opacity={0.7}
              pointerEvents="none"
            />
          )}
        </g>
      );
    });

    return (
      <>
        {boundaryRect}
        {renderZones}
        {renderRacks}
        {renderBins}
      </>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cadLayout, coords, selectedLevel, selectedBinCode, inventory, worldToSvgY]);

  // ─── Tooltip helper ────────────────────────────────────────────────────────
  const renderTooltip = () => {
    if (!hoveredElement) return null;
    const { type, data } = hoveredElement;

    if (type === 'rack') {
      return (
        <div
          className="absolute z-50 bg-slate-950/95 border border-slate-700/70 text-white rounded-xl p-3 text-xs shadow-2xl backdrop-blur-md pointer-events-none animate-in fade-in duration-100 min-w-[160px]"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="font-bold text-slate-300 font-mono text-[12px] border-b border-slate-800 pb-1 mb-1">{data.name}</div>
          <div className="text-slate-400 text-[10px] space-y-0.5">
            <div>Size: {data.width}m × {data.depth}m</div>
            <div>Center: X={data.x_coordinate}m, Y={data.y_coordinate}m</div>
          </div>
        </div>
      );
    }

    if (type === 'bin') {
      const b = data;
      const item = b.inventoryItem;
      const isOccupied = b.status === 'occupied';
      return (
        <div
          className="absolute z-50 bg-slate-950/96 border border-slate-700/70 text-white rounded-xl p-3 text-xs shadow-2xl backdrop-blur-md pointer-events-none animate-in fade-in duration-100 min-w-[195px] max-w-[230px]"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5 gap-3">
            <span className="font-bold text-blue-300 font-mono text-[12px] truncate">{b.code}</span>
            <span className={`shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${isOccupied ? 'bg-blue-900/60 text-blue-300' : 'bg-emerald-900/60 text-emerald-300'}`}>
              {b.status}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 space-y-0.5 mb-1.5">
            <div>Dims: {b.width}m × {b.depth}m × {b.height}m</div>
            <div>Pos: X={b.x_coordinate}m, Y={b.y_coordinate}m</div>
          </div>
          {item ? (
            <div className="border-t border-slate-800 pt-1.5">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Stored Product</div>
              <div className="font-semibold text-slate-200 truncate">{item.name}</div>
              <div className="text-[9px] font-mono text-slate-500 mt-0.5">SKU: {item.sku}</div>
              <div className="text-blue-400 font-bold mt-0.5">{item.quantity} units</div>
            </div>
          ) : (
            <div className="border-t border-slate-800 pt-1.5 text-[10px] text-slate-500 italic">
              Empty slot
            </div>
          )}
          <div className="text-[9px] text-slate-600 mt-1.5 pt-1 border-t border-slate-900">Click to open details →</div>
        </div>
      );
    }
    return null;
  };

  // ─── Loading / Error / Empty states ───────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full h-[520px] bg-slate-950 flex flex-col items-center justify-center border border-slate-800 rounded-2xl select-none">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071C1]"></div>
          <Box className="w-5 h-5 text-blue-500 absolute animate-pulse" />
        </div>
        <p className="text-slate-400 font-bold text-sm mt-4 tracking-wide">Retrieving CAD Layout…</p>
        <p className="text-slate-600 text-xs mt-1 text-center max-w-xs">Fetching warehouse boundaries, zone configurations, and bin coordinate meshes.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[520px] bg-slate-950 flex flex-col items-center justify-center border border-red-950/40 rounded-2xl p-6 select-none">
        <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-full text-red-500 mb-4">
          <Info className="w-8 h-8" />
        </div>
        <h3 className="text-slate-200 font-bold text-base">CAD Integration Offline</h3>
        <p className="text-red-400 text-xs font-mono max-w-md text-center mt-2 p-2 bg-red-950/10 border border-red-950/30 rounded-lg">{error}</p>
        <button onClick={fitToView} className="mt-6 px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  if (!cadLayout?.warehouse) {
    return (
      <div className="w-full h-[520px] bg-slate-950 flex flex-col items-center justify-center border border-slate-800 rounded-2xl p-6 select-none">
        <div className="text-5xl mb-4 opacity-40">📐</div>
        <h3 className="text-slate-300 font-bold text-sm">No CAD layout available</h3>
        <p className="text-slate-500 text-xs text-center mt-1.5 max-w-sm leading-relaxed">
          The selected warehouse does not have stored CAD coordinates. Ensure spatial boundaries and bin coordinate meshes are configured.
        </p>
      </div>
    );
  }

  // ─── Bin counts for legend ────────────────────────────────────────────────
  const { shelves = [], bins = [] } = cadLayout;
  const levelShelveIds = new Set(shelves.filter(s => s.level === selectedLevel).map(s => s.id));
  const levelBinsCount = bins.filter(b => b.shelf_id && levelShelveIds.has(b.shelf_id));
  const availableCount = levelBinsCount.filter(b => b.status === 'available').length;
  const occupiedCount  = levelBinsCount.filter(b => b.status === 'occupied').length;

  return (
    <div className="relative w-full h-[520px] rounded-b-2xl overflow-hidden bg-[#020617] flex flex-col select-none">

      {/* ── Top HUD ── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-start pointer-events-none gap-2">

        {/* Level selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 backdrop-blur-md px-2 py-1.5 rounded-xl pointer-events-auto shadow-lg">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pr-1">Level</span>
          {uniqueLevels.map(lvl => (
            <button
              key={`lvl-${lvl}`}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-2.5 py-0.5 text-[11px] font-bold font-mono rounded-lg transition-all duration-150 ${
                selectedLevel === lvl
                  ? 'bg-[#0071C1] text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              L{lvl}
            </button>
          ))}
          {uniqueLevels.length === 0 && (
            <span className="text-[10px] text-slate-600 px-1">No levels</span>
          )}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-0.5 bg-slate-900/90 border border-slate-700/60 backdrop-blur-md p-1 rounded-xl pointer-events-auto shadow-lg">
          <button onClick={zoomIn}  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all" title="Zoom In" ><ZoomIn  className="w-3.5 h-3.5" /></button>
          <button onClick={zoomOut} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all" title="Zoom Out"><ZoomOut className="w-3.5 h-3.5" /></button>
          <button onClick={fitToView} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all" title="Fit to View"><RotateCcw className="w-3.5 h-3.5" /></button>
          <span className="text-[10px] font-mono font-bold text-slate-500 border-l border-slate-700 pl-2 ml-1 pr-1">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* ── SVG Viewport ── */}
      <div
        ref={containerRef}
        className={`w-full flex-1 overflow-hidden relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} bg-slate-950`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg ref={svgRef} className="w-full h-full" style={{ transform: 'none' }}>
          <defs>
            {/* Engineering grid */}
            <pattern id="cad-grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M5 0 L0 0 0 5" fill="none" stroke="rgba(71,85,105,0.08)" strokeWidth="0.08" />
            </pattern>
            <pattern id="cad-grid-major" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M25 0 L0 0 0 25" fill="none" stroke="rgba(71,85,105,0.18)" strokeWidth="0.12" />
            </pattern>
          </defs>

          {coords && (
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Major grid overlay */}
              <rect
                x={coords.minX}
                y={worldToSvgY(coords.maxY)}
                width={coords.rangeX}
                height={coords.rangeY}
                fill="url(#cad-grid-major)"
                pointerEvents="none"
              />
              {renderLayoutContent}
            </g>
          )}
        </svg>
      </div>

      {/* ── Bottom Legend & HUD ── */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between pointer-events-none gap-2">

        {/* Legend */}
        <div className="bg-slate-900/90 border border-slate-700/60 backdrop-blur-md px-3 py-2 rounded-xl flex items-center gap-4 text-[10px] font-semibold text-slate-400">
          {/* Zone */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded border border-dashed border-sky-400 bg-sky-400/10 inline-block shrink-0"></span>
            <span>Zone</span>
          </div>
          {/* Rack */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded border border-slate-500 bg-slate-800 inline-block shrink-0"></span>
            <span>Rack</span>
          </div>
          {/* Available */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded border border-emerald-500 bg-emerald-500/15 inline-block shrink-0"></span>
            <span className="text-emerald-400">Available <span className="text-slate-500">({availableCount})</span></span>
          </div>
          {/* Occupied */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded border border-blue-500 bg-blue-500/15 inline-block shrink-0"></span>
            <span className="text-blue-400">Occupied <span className="text-slate-500">({occupiedCount})</span></span>
          </div>
          {/* Selected */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded border-2 border-yellow-400 bg-yellow-400/20 inline-block shrink-0"></span>
            <span className="text-yellow-400">Selected</span>
          </div>
        </div>

        {/* Interaction hints */}
        <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] text-slate-500 font-medium">
          🖱 Drag to Pan · Scroll to Zoom · Click bin for details
        </div>
      </div>

      {/* ── Tooltip Overlay ── */}
      {renderTooltip()}
    </div>
  );
}

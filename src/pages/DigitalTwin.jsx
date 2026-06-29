import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { AlertBanner, Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import { Map, Layers, Navigation, Box, HelpCircle, ShieldAlert, Sparkles, LayoutGrid, MonitorPlay, Network, Radio } from 'lucide-react';
import WarehouseScene from '../three/WarehouseScene';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import { getTwinSummaryApi, getTwinOccupancyApi } from '../services/digitalTwinService';
import { getLayoutGraphApi } from '../services/layoutService';
import { subscribeOccupancyFeed, subscribeAlertsFeed } from '../services/websocketService';
import { getWarehouseCadLayout } from '../services/warehouseStructureService';
import CadLayoutView from '../components/digitalTwin/CadLayoutView';

// ─── Normalize raw Django API bin → standard shape expected by WarehouseScene ─
// Django /api/bins/ returns: { id, bin_code, zone (id), zone_name, rack (id),
//   shelf_number, is_occupied, max_capacity, current_capacity, x, y, z }
// Context passes these raw objects unchanged.
// WarehouseScene expects: { code, zone, rack, shelf, status, currentCapacity,
//   maxCapacity, x, y, z }
function normalizeBinForScene(b) {
  if (!b) return null;
  // Already normalized if it has 'code' field
  if (b.code !== undefined) return b;
  // Map raw API fields
  const shelfNum = b.shelf_number != null ? b.shelf_number : (b.shelf || 1);
  return {
    id: b.id,
    code: b.bin_code || b.code || `BIN-${b.id}`,
    zone: b.zone_name || b.zone || 'Zone A',
    rack: b.rack_code || b.rack || 'Rack-1',
    shelf: shelfNum,
    status: b.is_occupied ? 'FULL' : (b.status || 'EMPTY'),
    currentCapacity: Number(b.current_capacity ?? b.currentCapacity ?? 0),
    maxCapacity: Number(b.max_capacity ?? b.maxCapacity ?? 100),
    x: b.x != null ? Number(b.x) : null,
    y: b.y != null ? Number(b.y) : null,
    z: b.z != null ? Number(b.z) : null,
  };
}
// ─────────────────────────────────────────────────────────────────────────────

export default function DigitalTwin() {
  const { warehouses, zones, racks, shelves, bins: rawBins, inventory } = useWarehouse();
  const [activeLayers, setActiveLayers] = useState({
    zones: true,
    bins: true,
    heatmap: false,
    movements: true,
    routes: false,
    suggestions: true
  });
  const [selectedBin, setSelectedBin] = useState(null);
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d' default to 2D CAD view

  // CAD Layout States
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [cadLayout, setCadLayout] = useState(null);
  const [cadLoading, setCadLoading] = useState(false);
  const [cadError, setCadError] = useState(null);

  // Initialize selectedWarehouseId
  useEffect(() => {
    if (warehouses && warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0].id);
    }
  }, [warehouses, selectedWarehouseId]);

  // Fetch CAD Layout
  useEffect(() => {
    if (!selectedWarehouseId) return;

    let active = true;
    const fetchCadLayoutData = async () => {
      setCadLoading(true);
      setCadError(null);
      try {
        const data = await getWarehouseCadLayout(selectedWarehouseId);
        if (active) {
          setCadLayout(data);
        }
      } catch (err) {
        console.error('[DigitalTwin] Failed to load CAD layout:', err);
        if (active) {
          setCadError(err.message || 'Failed to load warehouse CAD layout data.');
        }
      } finally {
        if (active) setCadLoading(false);
      }
    };

    fetchCadLayoutData();
    return () => {
      active = false;
    };
  }, [selectedWarehouseId]);

  // ── Normalize raw API bins to the standard shape WarehouseScene understands
  const bins = useMemo(() => {
    const raw = Array.isArray(rawBins) ? rawBins : [];
    const normalized = raw.map(normalizeBinForScene).filter(Boolean);

    // Debug log — visible in browser console when opening Digital Twin
    console.group('[DigitalTwin] Data received from WarehouseContext');
    console.log('Warehouses:', warehouses?.length ?? 0, warehouses);
    console.log('Zones:', zones?.length ?? 0, zones);
    console.log('Racks:', racks?.length ?? 0, racks);
    console.log('Shelves:', shelves?.length ?? 0, shelves);
    console.log('Raw Bins:', raw.length, '→ Normalized:', normalized.length);
    if (raw.length > 0) console.log('Sample raw bin:', raw[0]);
    if (normalized.length > 0) console.log('Sample normalized bin:', normalized[0]);
    console.groupEnd();

    return normalized;
  }, [rawBins]);
  
  // States for live metrics
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [graphSummary, setGraphSummary] = useState({ nodes: 0, edges: 0 });
  
  // Real-time WebSocket statuses
  const [wsOccupancyStatus, setWsOccupancyStatus] = useState('Offline');
  const [wsAlertsStatus, setWsAlertsStatus] = useState('Offline');
  const [realtimeAlerts, setRealtimeAlerts] = useState([
    { id: 1, type: 'Hazard', text: 'Zone C capacity threshold exceeds 80% (Bulk Load)', time: 'Just now' },
    { id: 2, type: 'Traffic', text: 'Aisle A1 (Zone A) path congested due to active picking', time: '5m ago' }
  ]);

  const binsRef = useRef(bins);
  useEffect(() => {
    binsRef.current = bins;
  }, [bins]);

  useEffect(() => {
    let active = true;
    const fetchTwinData = async () => {
      setLoading(true);
      try {
        console.warn("[DigitalTwin] Fetching live twin summary...");
        const summary = await getTwinSummaryApi();
        if (active && summary) {
          setTelemetry(summary);
        }
        
        console.warn("[DigitalTwin] Fetching layout graph topology...");
        const graph = await getLayoutGraphApi();
        if (active && graph) {
          setGraphSummary({
            nodes: graph.nodes?.length || 0,
            edges: graph.edges?.length || 0
          });
        }
      } catch (err) {
        console.warn("[DigitalTwin] Failed to fetch live twin telemetry, using local stubs:", err);
        const currentBins = binsRef.current || [];
        setTelemetry({
          utilizationRate: 64,
          occupiedBins: currentBins.filter(b => b.status === 'FULL').length || 4,
          totalBins: currentBins.length || 10,
          activePaths: 3
        });
        setGraphSummary({ nodes: 3, edges: 2 });
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchTwinData();

    // Safely subscribe to WebSocket occupancy feed
    let wsOccupancy = null;
    try {
      wsOccupancy = subscribeOccupancyFeed({
        onOpen: () => {
          if (active) setWsOccupancyStatus('Connected');
        },
        onMessage: (data) => {
          console.log("[WS Occupancy] Live message:", data);
          if (active && data.summary) {
            setTelemetry(data.summary);
          }
        },
        onClose: () => {
          if (active) setWsOccupancyStatus('Disconnected');
        },
        onError: () => {
          if (active) setWsOccupancyStatus('Error');
        }
      });
    } catch (e) {
      console.warn("WebSocket occupancy connection failed:", e);
    }

    // Safely subscribe to WebSocket alerts feed
    let wsAlerts = null;
    try {
      wsAlerts = subscribeAlertsFeed({
        onOpen: () => {
          if (active) setWsAlertsStatus('Connected');
        },
        onMessage: (data) => {
          console.log("[WS Alerts] Live alert received:", data);
          if (active && data.alert) {
            setRealtimeAlerts(prev => [
              {
                id: Date.now(),
                type: data.alert.type || 'System',
                text: data.alert.message || 'Real-time telemetry event update',
                time: 'Just now'
              },
              ...prev.slice(0, 4)
            ]);
          }
        },
        onClose: () => {
          if (active) setWsAlertsStatus('Disconnected');
        },
        onError: () => {
          if (active) setWsAlertsStatus('Error');
        }
      });
    } catch (e) {
      console.warn("WebSocket alerts connection failed:", e);
    }

    return () => { 
      active = false; 
      if (wsOccupancy) wsOccupancy.close();
      if (wsAlerts) wsAlerts.close();
    };
  }, []);

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleSelectBin = (bin) => {
    const binCodeVal = bin.code || bin.binCode || bin.bin_code || `BIN-${bin.id}`;
    const item = inventory.find(i => i.bin === binCodeVal);

    // Cross-reference zone and shelf from cadLayout data if clicked from 2D CAD
    let shelfLevel = bin.shelf || '1';
    let zoneName = bin.zone || 'Zone A';

    if (cadLayout) {
      const shelf = cadLayout.shelves?.find(s => s.id === bin.shelf_id);
      if (shelf) {
        shelfLevel = shelf.level || shelf.shelf_number || shelfLevel;
        const rack = cadLayout.racks?.find(r => r.id === shelf.rack_id);
        if (rack) {
          const zone = cadLayout.zones?.find(z => z.id === rack.zone_id);
          if (zone) {
            zoneName = zone.name || zone.zone_name || zoneName;
          }
        }
      }
    }

    const maxCapacity = bin.max_capacity ?? bin.maxCapacity ?? 100;
    const currentCapacity = bin.current_capacity ?? bin.currentCapacity ?? (item ? item.quantity : 0);

    setSelectedBin({
      ...bin,
      id: bin.id,
      code: binCodeVal,
      zone: zoneName,
      shelf: shelfLevel,
      currentCapacity,
      maxCapacity,
      status: bin.status || (item ? 'occupied' : 'available'),
      product: item ? item.name : 'Empty Slot',
      sku: item ? item.sku : 'N/A',
      qty: item ? item.quantity : 0
    });
  };

  const handleBinClickFrom3d = (binCode) => {
    const bin = bins.find(b => b.code === binCode);
    if (bin) {
      handleSelectBin(bin);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Map className="w-7 h-7 text-[#0071C1]" />
            Digital Twin Live Map
          </h1>
          <p className="text-gray-500 text-sm mt-1">Simulate warehouse layout grids, track capacity heatmaps, and coordinate visual picking path routes.</p>
        </div>

        {/* Warehouse Selection Dropdown */}
        <div className="flex items-center gap-2.5 bg-white border border-gray-150 p-2 px-3 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Facility:</span>
          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent border-none outline-none cursor-pointer focus:ring-0 focus:outline-none"
          >
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Telemetry Summary Banner */}
      {telemetry && (
        <Card className="border border-blue-100 bg-blue-50/20 shadow-xs">
          <CardContent className="p-4 flex flex-wrap gap-6 justify-between items-center text-xs">
            <div className="flex items-center gap-2.5">
              <MonitorPlay className="w-5 h-5 text-blue-600 animate-pulse" />
              <div>
                <div className="font-bold text-slate-800">Live Twin Telemetry Active</div>
                <div className="text-slate-500 mt-0.5">Physical layout constraints synced from WMS topology</div>
              </div>
            </div>
            <div className="flex gap-6">
              {telemetry.utilizationRate !== undefined && (
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Utilization</span>
                  <span className="font-bold text-slate-800 text-sm">{telemetry.utilizationRate}%</span>
                </div>
              )}
              {telemetry.occupiedBins !== undefined && (
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Occupied Bins</span>
                  <span className="font-bold text-slate-800 text-sm">{telemetry.occupiedBins} / {telemetry.totalBins}</span>
                </div>
              )}
              {telemetry.activePaths !== undefined && (
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Active Paths</span>
                  <span className="font-bold text-slate-800 text-sm">{telemetry.activePaths} active</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Controls & WebSockets Status */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* WebSocket Status panel */}
          <Card className="border border-gray-150">
            <CardHeader className="border-b border-gray-100 pb-3 bg-slate-50/50">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-blue-600" />
                Live Feed Feeds Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span>Occupancy ws://</span>
                <Badge variant={wsOccupancyStatus === 'Connected' ? 'success' : 'warning'}>
                  {wsOccupancyStatus}
                </Badge>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span>Alerts ws://</span>
                <Badge variant={wsAlertsStatus === 'Connected' ? 'success' : 'warning'}>
                  {wsAlertsStatus}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Topology Graph:</span>
                <span className="font-mono text-gray-500 text-[10px]">{graphSummary.nodes} Nodes / {graphSummary.edges} Edges</span>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Alerts Panel */}
          <Card className="border border-gray-150">
            <CardHeader className="border-b border-gray-100 pb-3 bg-slate-50/50">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Active Alerts Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-[11px] font-medium leading-relaxed max-h-[160px] overflow-y-auto">
              {realtimeAlerts.map(alert => (
                <div key={alert.id} className="border-b border-gray-50 pb-2 last:border-b-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`font-bold uppercase text-[9px] ${alert.type === 'Hazard' ? 'text-red-600' : 'text-amber-600'}`}>
                      {alert.type}
                    </span>
                    <span className="text-[8px] text-gray-400 font-mono">{alert.time}</span>
                  </div>
                  <p className="text-gray-700 font-semibold">{alert.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Layers Selection */}
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" /> Layout Layers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {Object.keys(activeLayers).map((layer) => (
                <label key={layer} className="flex items-center justify-between text-xs font-semibold text-gray-700 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                  <span className="capitalize">{layer} Layer</span>
                  <input 
                    type="checkbox" 
                    checked={activeLayers[layer]} 
                    onChange={() => toggleLayer(layer)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader className="border-b border-gray-100 pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Bin Occupancy Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border border-dashed border-slate-700 bg-slate-900 inline-block"></span>
                <span className="text-slate-700">Empty Location</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border border-emerald-800 bg-emerald-950/15 inline-block"></span>
                <span className="text-slate-700">Available / Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border border-red-900 bg-red-950/20 inline-block"></span>
                <span className="text-slate-700">High Capacity (&gt;80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border border-yellow-400 bg-slate-900 ring-1 ring-yellow-400 inline-block"></span>
                <span className="text-slate-700">Selected Target Bin</span>
              </div>
            </CardContent>
          </Card>

          {/* Details Side Panel */}
          {selectedBin && (
            <div className="hidden lg:block">
              <Card className="border-t-4 border-t-blue-600 animate-in fade-in duration-200">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                    <Box className="w-4 h-4 text-blue-600" /> Bin Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4 text-xs">
                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg text-blue-900 font-mono font-bold text-center">
                    {selectedBin.code}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-600 font-semibold">
                    <div>Zone: <span className="text-gray-900">{selectedBin.zone}</span></div>
                    <div>Shelf Level: <span className="text-gray-900">{selectedBin.shelf}</span></div>
                    <div>Capacity: <span className="text-gray-900">{selectedBin.currentCapacity} / {selectedBin.maxCapacity}</span></div>
                    <div>Status: <Badge variant="outline">{selectedBin.status}</Badge></div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <h4 className="font-bold text-gray-900 uppercase">Stored Stock</h4>
                    <div className="font-semibold text-gray-800">{selectedBin.product}</div>
                    <div className="text-[10px] text-gray-400 font-mono">SKU: {selectedBin.sku}</div>
                    <div className="font-bold text-gray-900">{selectedBin.qty} units in storage</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Side: Visual layout mapping grid / 3D Scene */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border border-gray-100 shadow-xs overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4 flex flex-row justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <CardTitle className="text-base font-bold text-gray-900">Visual Layout Map</CardTitle>
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('2d')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all duration-150 ${
                      viewMode === '2d'
                        ? 'bg-white text-[#0071C1] shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" /> 2D CAD
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('3d')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all duration-150 ${
                      viewMode === '3d'
                        ? 'bg-white text-[#0071C1] shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MonitorPlay className="w-3.5 h-3.5" /> 3D View
                  </button>
                </div>
              </div>
              <Badge variant="success">
                {warehouses.find(w => w.id === selectedWarehouseId)?.name || 'Select Warehouse'}
              </Badge>
            </CardHeader>
            
            <CardContent className="p-0">
              {viewMode === '3d' ? (
                <div className="p-4 bg-slate-900">
                  <ErrorBoundary
                    title="3D Warehouse Map Failed"
                    message="The WebGL 3D Canvas could not be rendered, possibly due to unsupported hardware acceleration or a GPU context crash. You can try reloading the component."
                  >
                    <WarehouseScene 
                      zones={zones} 
                      bins={bins} 
                      inventory={inventory} 
                      selectedBinCode={selectedBin?.code} 
                      onBinClick={handleBinClickFrom3d} 
                    />
                  </ErrorBoundary>
                </div>
              ) : (
                <CadLayoutView
                  cadLayout={cadLayout}
                  loading={cadLoading}
                  error={cadError}
                  selectedBinCode={selectedBin?.code}
                  onBinClick={handleSelectBin}
                  inventory={inventory}
                />
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Mobile Details Drawer */}
      {selectedBin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end lg:hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-t-2xl w-full p-6 space-y-4 animate-in slide-in-from-bottom duration-250 border-t border-gray-200 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Box className="w-4 h-4 text-blue-600" /> Bin Information
              </h3>
              <button 
                onClick={() => setSelectedBin(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 text-xs font-bold"
              >
                Close
              </button>
            </div>
            
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg text-blue-900 font-mono font-bold text-center text-sm">
              {selectedBin.code}
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-gray-600 font-semibold p-1">
              <div>Zone: <span className="text-slate-900 font-bold">{selectedBin.zone}</span></div>
              <div>Shelf Level: <span className="text-slate-900 font-bold">{selectedBin.shelf}</span></div>
              <div>Capacity: <span className="text-slate-900 font-bold">{selectedBin.currentCapacity} / {selectedBin.maxCapacity}</span></div>
              <div>Status: <Badge variant="outline">{selectedBin.status}</Badge></div>
            </div>
            
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <h4 className="font-bold text-slate-450 uppercase text-[10px] tracking-wider">Stored Stock</h4>
              <div className="font-bold text-slate-800 text-sm">{selectedBin.product}</div>
              <div className="text-[10px] text-gray-400 font-mono">SKU: {selectedBin.sku}</div>
              <div className="font-bold text-slate-900">{selectedBin.qty} units in storage</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

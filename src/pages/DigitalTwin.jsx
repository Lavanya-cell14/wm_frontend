import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { AlertBanner, Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import { Map, Layers, Navigation, Box, HelpCircle, ShieldAlert, Sparkles, LayoutGrid, MonitorPlay } from 'lucide-react';
import WarehouseScene from '../three/WarehouseScene';
import { getTwinSummaryApi, getTwinOccupancyApi } from '../services/digitalTwinService';

export default function DigitalTwin() {
  const { zones, bins, inventory } = useWarehouse();
  const [activeLayers, setActiveLayers] = useState({
    zones: true,
    bins: true,
    heatmap: false,
    movements: true,
    routes: false,
    suggestions: true
  });
  const [selectedBin, setSelectedBin] = useState(null);
  const [viewMode, setViewMode] = useState('3d'); // '3d' or '2d'
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchTwinData = async () => {
      setLoading(true);
      try {
        console.warn("[DigitalTwin] Fetching live twin summary from GET /api/twin/summary");
        const summary = await getTwinSummaryApi();
        if (active && summary) {
          setTelemetry(summary);
        }
        
        console.warn("[DigitalTwin] Fetching live twin occupancy from GET /api/twin/occupancy");
        const occupancy = await getTwinOccupancyApi();
        if (active && occupancy) {
          console.log("[DigitalTwin] Twin occupancy loaded:", occupancy);
        }
      } catch (err) {
        console.warn("[DigitalTwin] Failed to fetch digital twin telemetry, using fallbacks:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchTwinData();
    return () => { active = false; };
  }, []);

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleSelectBin = (bin) => {
    const item = inventory.find(i => i.bin === bin.code);
    setSelectedBin({
      ...bin,
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Map className="w-7 h-7 text-[#0071C1]" />
          Digital Twin Live Map
        </h1>
        <p className="text-gray-500 text-sm mt-1">Simulate warehouse layout grids, track capacity heatmaps, and coordinate visual picking path routes.</p>
      </div>

      {/* Telemetry Summary Banner if live */}
      {telemetry && (
        <Card className="border border-blue-100 bg-blue-50/20 shadow-xs">
          <CardContent className="p-4 flex flex-wrap gap-6 justify-between items-center text-xs">
            <div className="flex items-center gap-2.5">
              <MonitorPlay className="w-5 h-5 text-blue-600 animate-pulse" />
              <div>
                <div className="font-bold text-slate-800">Live Twin Telemetry Active</div>
                <div className="text-slate-500 mt-0.5">Physical layout constraints synced from Django layout manager</div>
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
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">AGV Paths</span>
                  <span className="font-bold text-slate-800 text-sm">{telemetry.activePaths} active</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Controls & Layer Toggles */}
        <div className="lg:col-span-1 space-y-6">
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
                  <Input 
                    type="checkbox" 
                    checked={activeLayers[layer]} 
                    onChange={() => toggleLayer(layer)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Bin Legend */}
          <Card>
            <CardHeader className="border-b border-gray-100 pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Bin Occupancy Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border border-dashed border-slate-700 bg-slate-900 inline-block"></span>
                <span className="font-semibold text-slate-700">Empty Location</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border border-emerald-800 bg-emerald-950/15 inline-block"></span>
                <span className="font-semibold text-slate-700">Available / Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border border-red-900 bg-red-950/20 inline-block"></span>
                <span className="font-semibold text-slate-700">High Capacity (&gt;80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border border-yellow-400 bg-slate-900 ring-1 ring-yellow-400 inline-block"></span>
                <span className="font-semibold text-slate-700">Selected Target Bin</span>
              </div>
            </CardContent>
          </Card>

          {/* Details Side Panel (visible only on desktop) */}
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

        {/* Right Side: Virtual layout mapping grid / 3D Scene */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border border-gray-100 shadow-xs overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4 flex flex-row justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <CardTitle className="text-base font-bold text-gray-900">Visual Layout Map</CardTitle>
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                  <Button 
                    onClick={() => setViewMode('3d')}
                    className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all ${viewMode === '3d' ? 'bg-white text-[#0071C1] shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <MonitorPlay className="w-3.5 h-3.5" /> 3D View
                  </Button>
                  <Button 
                    onClick={() => setViewMode('2d')}
                    className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all ${viewMode === '2d' ? 'bg-white text-[#0071C1] shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" /> 2D Grid
                  </Button>
                </div>
              </div>
              <Badge variant="success">Central Fulfillment A</Badge>
            </CardHeader>
            
            <CardContent className="p-0">
              {viewMode === '3d' ? (
                <div className="p-4 bg-slate-900">
                  <WarehouseScene 
                    zones={zones} 
                    bins={bins} 
                    inventory={inventory} 
                    selectedBinCode={selectedBin?.code} 
                    onBinClick={handleBinClickFrom3d} 
                  />
                </div>
              ) : (
                <div className="p-6 bg-slate-950 min-h-[450px] flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                  
                  <div className="grid grid-cols-3 gap-6 w-full max-w-2xl relative z-10">
                    {zones.map((zone) => {
                      const zoneBins = bins.filter(b => b.zone === zone.name);
                      return (
                        <div 
                          key={zone.id} 
                          className={`border p-4 rounded-xl space-y-3 transition-all ${
                            activeLayers.zones 
                              ? 'bg-slate-900/80 border-slate-700' 
                              : 'bg-transparent border-transparent'
                          }`}
                        >
                          {activeLayers.zones && (
                            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                              <span>{zone.name}</span>
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{zone.type}</span>
                            </div>
                          )}
                          
                          {activeLayers.bins && (
                            <div className="grid grid-cols-2 gap-2 text-center text-xs">
                              {zoneBins.map(b => {
                                const isSelected = selectedBin?.code === b.code;
                                const capRatio = b.maxCapacity > 0 ? (b.currentCapacity / b.maxCapacity) : 0;
                                const isEmpty = b.currentCapacity === 0;
                                const isHigh = capRatio > 0.8;
                                
                                let borderClass = 'border-slate-700 text-blue-400 hover:bg-blue-900/30';
                                if (isEmpty) {
                                  borderClass = 'border-slate-800 text-slate-500 hover:border-slate-600 border-dashed';
                                } else if (isHigh) {
                                  borderClass = 'border-red-900 bg-red-950/20 text-red-400 hover:bg-red-905/30';
                                } else {
                                  borderClass = 'border-emerald-800 bg-emerald-950/15 text-emerald-400 hover:bg-emerald-900/30';
                                }
                                
                                if (isSelected) {
                                  borderClass += ' ring-2 ring-yellow-400 border-yellow-400 text-yellow-300';
                                }

                                return (
                                  <Button
                                    key={b.code}
                                    onClick={() => handleSelectBin(b)}
                                    className={`bg-slate-900 border rounded py-3.5 px-3 min-h-[44px] flex items-center justify-center font-mono font-bold text-xs transition-all ${borderClass}`}
                                  >
                                    {b.code.replace('BIN-', '')}
                                  </Button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Details Drawer (visible on < lg viewports) */}
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


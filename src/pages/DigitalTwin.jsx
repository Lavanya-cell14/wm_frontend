import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AlertBanner from '../components/ui/AlertBanner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Map, Layers, Navigation, Box, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';

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

          {/* Details Side Panel */}
          {selectedBin && (
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
          )}
        </div>

        {/* Right Side: Virtual layout mapping grid */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border border-gray-100 shadow-xs overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4 flex flex-row justify-between items-center bg-gray-50/50">
              <CardTitle className="text-base font-bold text-gray-900">Virtual 2D Floor Plan Grid</CardTitle>
              <Badge variant="success">Central Fulfillment A</Badge>
            </CardHeader>
            <CardContent className="p-6 bg-slate-950 min-h-[400px] flex items-center justify-center relative">
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
                        <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                          {zoneBins.map(b => (
                            <button
                              key={b.code}
                              onClick={() => handleSelectBin(b)}
                              className="bg-slate-850 hover:bg-blue-900/50 border border-slate-700 hover:border-blue-500 rounded p-2 text-blue-400 font-mono font-bold transition-all"
                            >
                              {b.code.replace('BIN-', '')}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

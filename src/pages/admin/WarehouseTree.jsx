import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Button, 
  Badge 
} from 'shared-ui';
import { 
  Building2, 
  FolderTree, 
  Layers, 
  Box, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Info, 
  MapPin, 
  Weight, 
  Activity, 
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export default function WarehouseTree() {
  const { warehouses, zones, racks, shelves, bins, inventory } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Track open/collapsed state of nodes
  const [expandedNodes, setExpandedNodes] = useState({
    'root': true,
    'WH-001': true,
    'ZG-001': true,
    'ZG-002': true,
    'ZONE-Z1': true,
    'ZONE-Z2': true,
    'ZONE-Z3': false,
    'ZONE-Z4': false
  });

  const toggleNode = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Mock Zone Groups
  const zoneGroups = [
    { id: 'ZG-001', name: 'Zone Group Alpha', warehouseId: 'WH-001', type: 'Ambient Storage', zoneIds: ['ZONE-Z1', 'ZONE-Z2'] },
    { id: 'ZG-002', name: 'Zone Group Beta', warehouseId: 'WH-001', type: 'Specialty Storage', zoneIds: ['ZONE-Z3', 'ZONE-Z4'] }
  ];

  // Mock Aisles
  const aisles = [
    { id: 'AIS-001', name: 'Aisle 1', zoneName: 'Zone A', status: 'Operational', rackIds: [] },
    { id: 'AIS-002', name: 'Aisle 2', zoneName: 'Zone B', status: 'Operational', rackIds: [] },
    { id: 'AIS-003', name: 'Aisle 3', zoneName: 'Zone C', status: 'Blocked', rackIds: [] },
    { id: 'AIS-004', name: 'Aisle 4', zoneName: 'Zone D', status: 'Operational', rackIds: [] }
  ];

  // Search filter
  const matchesSearch = (text) => {
    if (!searchQuery) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const selectNodeDetails = (type, name, data) => {
    setSelectedNode({ type, name, ...data });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <FolderTree className="w-7 h-7 text-[#0071C1]" />
          Warehouse Hierarchy Structure Tree
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Explore nested physical assets visually from global Warehouses down to specific Shelf Storage Bins.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Hand: Tree Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-slate-50/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">Structure Explorer</CardTitle>
                  <CardDescription>Collapse and expand nodes to inspect allocations.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tree nodes..."
                    className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-xl text-xs outline-none bg-white focus:border-blue-500"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 max-h-[60vh] overflow-y-auto font-sans text-xs">
              
              {/* Root Warehouse Node */}
              {warehouses.map(wh => {
                const whExpanded = expandedNodes[wh.id];
                const whZoneGroups = zoneGroups.filter(zg => zg.warehouseId === 'WH-001');

                if (!matchesSearch(wh.name) && searchQuery) {
                  // If searching, let's keep visible if children match
                }

                return (
                  <div key={wh.id} className="space-y-1">
                    <div className="flex items-center gap-1.5 py-1.5 px-2 hover:bg-slate-50 rounded-lg cursor-pointer" onClick={() => selectNodeDetails('Warehouse', wh.name, { location: wh.location, area: wh.area, status: 'Active' })}>
                      <button onClick={(e) => { e.stopPropagation(); toggleNode(wh.id); }} className="p-0.5 hover:bg-gray-200 rounded">
                        {whExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                      <Building2 className="w-4 h-4 text-[#0071C1]" />
                      <span className="font-bold text-gray-900">{wh.name}</span>
                      <Badge variant="primary" className="text-[9px] scale-90">Root</Badge>
                    </div>

                    {/* Zone Groups level */}
                    {whExpanded && (
                      <div className="pl-6 border-l border-slate-200 ml-4 space-y-1">
                        {whZoneGroups.map(zg => {
                          const zgExpanded = expandedNodes[zg.id];
                          const zgZones = zones.filter(z => zg.zoneIds.includes(z.id));

                          return (
                            <div key={zg.id} className="space-y-1">
                              <div className="flex items-center gap-1.5 py-1.5 px-2 hover:bg-slate-50 rounded-lg cursor-pointer" onClick={() => selectNodeDetails('Zone Group', zg.name, { type: zg.type, zonesCount: zgZones.length })}>
                                <button onClick={(e) => { e.stopPropagation(); toggleNode(zg.id); }} className="p-0.5 hover:bg-gray-200 rounded">
                                  {zgExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </button>
                                <Layers className="w-4 h-4 text-purple-600" />
                                <span className="font-bold text-slate-800">{zg.name}</span>
                                <Badge variant="outline" className="text-[9px] scale-90">{zg.type}</Badge>
                              </div>

                              {/* Zones level */}
                              {zgExpanded && (
                                <div className="pl-6 border-l border-slate-200 ml-4 space-y-1">
                                  {zgZones.map(zone => {
                                    const zoneExpanded = expandedNodes[zone.id];
                                    const zoneAisles = aisles.filter(a => a.zoneName === zone.name);
                                    
                                    return (
                                      <div key={zone.id} className="space-y-1">
                                        <div className="flex items-center gap-1.5 py-1.5 px-2 hover:bg-slate-50 rounded-lg cursor-pointer" onClick={() => selectNodeDetails('Zone', zone.name, { type: zone.type, utilization: `${zone.capacityPercent}%`, status: zone.status })}>
                                          <button onClick={(e) => { e.stopPropagation(); toggleNode(zone.id); }} className="p-0.5 hover:bg-gray-200 rounded">
                                            {zoneExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                          </button>
                                          <Layers className="w-4 h-4 text-emerald-600" />
                                          <span className="font-semibold text-slate-700">{zone.name}</span>
                                          <span className="text-[10px] text-gray-400">({zone.type})</span>
                                        </div>

                                        {/* Aisles level */}
                                        {zoneExpanded && (
                                          <div className="pl-6 border-l border-slate-200 ml-4 space-y-1">
                                            {zoneAisles.map(aisle => {
                                              const aisleExpanded = expandedNodes[aisle.id];
                                              
                                              // Filter racks in this zone
                                              const zoneRacks = racks.filter(r => r.zoneId === zone.id);

                                              return (
                                                <div key={aisle.id} className="space-y-1">
                                                  <div className="flex items-center gap-1.5 py-1 px-2 hover:bg-slate-50 rounded-lg cursor-pointer" onClick={() => selectNodeDetails('Aisle', aisle.name, { status: aisle.status, racksCount: zoneRacks.length })}>
                                                    <button onClick={(e) => { e.stopPropagation(); toggleNode(aisle.id); }} className="p-0.5 hover:bg-gray-200 rounded">
                                                      {aisleExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                    </button>
                                                    <Activity className={`w-3.5 h-3.5 ${aisle.status === 'Blocked' ? 'text-red-500' : 'text-blue-500'}`} />
                                                    <span className="font-semibold text-slate-700">{aisle.name}</span>
                                                    {aisle.status === 'Blocked' && <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider ml-1">Blocked</span>}
                                                  </div>

                                                  {/* Racks level */}
                                                  {aisleExpanded && (
                                                    <div className="pl-6 border-l border-slate-200 ml-4 space-y-1">
                                                      {zoneRacks.map(rack => {
                                                        const rackExpanded = expandedNodes[rack.id];
                                                        const rackShelves = shelves.filter(s => s.rackId === rack.id);

                                                        return (
                                                          <div key={rack.id} className="space-y-1">
                                                            <div className="flex items-center gap-1.5 py-1 px-2 hover:bg-slate-50 rounded-lg cursor-pointer" onClick={() => selectNodeDetails('Rack', rack.name, { weight: `${rack.currentWeight}/${rack.maxWeight} kg`, status: rack.status })}>
                                                              <button onClick={(e) => { e.stopPropagation(); toggleNode(rack.id); }} className="p-0.5 hover:bg-gray-200 rounded">
                                                                {rackExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                              </button>
                                                              <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                                              <span className="text-gray-700">{rack.name}</span>
                                                              <span className="text-[9px] text-gray-400 font-mono">({rack.id})</span>
                                                            </div>

                                                            {/* Shelves level */}
                                                            {rackExpanded && (
                                                              <div className="pl-6 border-l border-slate-200 ml-4 space-y-1">
                                                                {rackShelves.map(shelf => {
                                                                  const shelfExpanded = expandedNodes[shelf.id];
                                                                  
                                                                  // Filter bins on this shelf
                                                                  const shelfBins = bins.filter(b => b.shelf === shelf.shelfLevel && b.zone === zone.name);

                                                                  return (
                                                                    <div key={shelf.id} className="space-y-1">
                                                                      <div className="flex items-center gap-1.5 py-1 px-2 hover:bg-slate-50 rounded-lg cursor-pointer" onClick={() => selectNodeDetails('Shelf', shelf.shelfLevel, { maxWeight: `${shelf.maxWeight} kg`, status: shelf.status })}>
                                                                        <button onClick={(e) => { e.stopPropagation(); toggleNode(shelf.id); }} className="p-0.5 hover:bg-gray-200 rounded">
                                                                          {shelfExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                                        </button>
                                                                        <Layers className="w-3.5 h-3.5 text-amber-500" />
                                                                        <span className="text-gray-600 font-medium">{shelf.shelfLevel}</span>
                                                                      </div>

                                                                      {/* Bins level */}
                                                                      {shelfExpanded && (
                                                                        <div className="pl-6 border-l border-slate-200 ml-4 space-y-0.5">
                                                                          {shelfBins.map(bin => {
                                                                            const product = inventory.find(i => i.bin === bin.code);
                                                                            let statusColor = 'bg-slate-200 text-slate-700';
                                                                            if (bin.status === 'FULL') statusColor = 'bg-red-100 text-red-700 border-red-200';
                                                                            else if (bin.status === 'EMPTY') statusColor = 'bg-slate-50 text-slate-400 border-slate-200';
                                                                            else statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

                                                                            return (
                                                                              <div 
                                                                                key={bin.code} 
                                                                                className="flex items-center justify-between py-1 px-2 hover:bg-slate-100 rounded-md cursor-pointer border border-transparent hover:border-slate-200"
                                                                                onClick={() => selectNodeDetails('Bin', bin.code, { 
                                                                                  maxCapacity: `${bin.maxCapacity} units`, 
                                                                                  weightLimit: `${bin.maxWeight || 150} kg`,
                                                                                  status: bin.status || 'Active',
                                                                                  product: product ? `${product.name} (${product.sku})` : 'Empty'
                                                                                })}
                                                                              >
                                                                                <div className="flex items-center gap-1.5">
                                                                                  <Box className="w-3.5 h-3.5 text-blue-400" />
                                                                                  <span className="font-mono font-bold text-blue-700">{bin.code}</span>
                                                                                  {product && <span className="text-[10px] text-gray-500 truncate max-w-[120px] font-sans">({product.name})</span>}
                                                                                </div>
                                                                                <Badge className={`text-[8px] px-1.5 py-0 font-bold border ${statusColor}`}>
                                                                                  {bin.status || 'Active'}
                                                                                </Badge>
                                                                              </div>
                                                                            );
                                                                          })}
                                                                        </div>
                                                                      )}
                                                                    </div>
                                                                  );
                                                                })}
                                                              </div>
                                                            )}
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Hand: Detail Panel */}
        <div className="space-y-4">
          <Card className="border border-gray-100 shadow-sm bg-gradient-to-b from-white to-slate-50 h-full">
            <CardHeader className="border-b border-gray-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#0071C1]" />
                Node Inspector
              </CardTitle>
              <CardDescription>Click a structure node on the left to verify active properties.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {selectedNode ? (
                <div className="space-y-6 text-xs animate-in fade-in duration-200">
                  {/* Node Title */}
                  <div className="space-y-1.5 pb-4 border-b border-gray-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#0071C1] bg-blue-50 px-2.5 py-1 rounded-full">
                      {selectedNode.type}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-800 mt-2">{selectedNode.name}</h3>
                  </div>

                  {/* Properties list */}
                  <div className="space-y-4">
                    {Object.keys(selectedNode)
                      .filter(key => key !== 'type' && key !== 'name')
                      .map((key) => {
                        let icon = <MapPin className="w-4 h-4 text-slate-400" />;
                        if (key.toLowerCase().includes('weight') || key.toLowerCase().includes('capacity')) {
                          icon = <Weight className="w-4 h-4 text-slate-400" />;
                        } else if (key.toLowerCase().includes('status')) {
                          icon = <Activity className="w-4 h-4 text-slate-400" />;
                        } else if (key.toLowerCase().includes('product')) {
                          icon = <Box className="w-4 h-4 text-slate-400" />;
                        }

                        return (
                          <div key={key} className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-2xs">
                            <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                              {icon}
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1')}</div>
                              <div className="font-bold text-slate-800 mt-1 capitalize text-sm">{selectedNode[key]}</div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Operational details status indicator */}
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-slate-600 flex gap-2">
                    <UserCheck className="w-5 h-5 text-[#0071C1] shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      All physical resources mapping inside this {selectedNode.type.toLowerCase()} are synced in real-time. Settings modifications override active spatial constraints.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
                  <FolderTree className="w-12 h-12 mb-3 text-slate-300" />
                  <p className="font-medium">No node selected</p>
                  <p className="text-[11px] text-gray-400 mt-1">Select a folder or bin node in the hierarchy layout to inspect properties details.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

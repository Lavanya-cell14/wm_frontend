import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import StatCard from '../components/dashboard/StatCard';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import StatusBadge from '../components/ui/StatusBadge';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Building2, Plus, MapPin, ChevronRight, Activity, Package, Users, Layers, X, ShieldAlert } from 'lucide-react';

export default function Warehouse() {
  const { warehouses, addWarehouse, zones, bins, inventory, movements } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWh, setSelectedWh] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add modal inputs
  const [newWhName, setNewWhName] = useState('');
  const [newWhLoc, setNewWhLoc] = useState('');
  const [newWhArea, setNewWhArea] = useState('');

  // Filter warehouses
  const filteredWarehouses = warehouses.filter(wh => 
    wh.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    wh.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddWarehouse = (e) => {
    e.preventDefault();
    if (!newWhName || !newWhLoc) return;
    addWarehouse({
      name: newWhName,
      location: newWhLoc,
      area: newWhArea || '15,000 sq ft',
      totalZones: 0,
      capacity: 0,
      activeStaff: 0
    });
    setNewWhName('');
    setNewWhLoc('');
    setNewWhArea('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#0071C1]" />
            Warehouse Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage and monitor all warehouse facilities layout configurations.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          Add Warehouse
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Warehouses" value={warehouses.length} icon={Building2} />
        <StatCard title="Operational Facilities" value={warehouses.filter(w => w.status === 'operational').length} icon={Activity} />
        <StatCard title="Total Staff" value={warehouses.reduce((sum, w) => sum + w.activeStaff, 0)} icon={Users} />
        <StatCard title="Total Bins" value={bins.length} icon={Layers} />
      </div>

      {/* Warehouses Table */}
      <Card className="border border-gray-100 shadow-xs">
        <div className="p-4 border-b border-gray-100">
          <SearchFilterBar 
            placeholder="Search warehouses by name or location..." 
            onSearch={(val) => setSearchQuery(val)} 
          />
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warehouse Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Area Size</TableHead>
                <TableHead>Zones</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Active Staff</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWarehouses.map((wh) => (
                <TableRow key={wh.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div className="font-semibold text-gray-900 text-sm">{wh.name}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{wh.id}</div>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm font-semibold">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {wh.location}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs font-semibold">{wh.area}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{zones.filter(z => z.warehouse === wh.name).length || wh.totalZones} Zones</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${wh.capacity > 85 ? 'bg-red-500' : wh.capacity > 65 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${wh.capacity || 40}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{wh.capacity || 40}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm font-semibold">{wh.activeStaff}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="gap-1 text-gray-600" onClick={() => setSelectedWh(wh)}>
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Warehouse Detail Drawer/Overlay */}
      {selectedWh && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full overflow-y-auto animate-in slide-in-from-right duration-200 p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-[#0071C1]">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{selectedWh.name}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedWh.id}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 font-semibold text-lg" onClick={() => setSelectedWh(null)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-gray-400 font-semibold mb-1">LOCATION</div>
                  <div className="font-bold text-gray-900">{selectedWh.location}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-gray-400 font-semibold mb-1">TOTAL AREA SIZE</div>
                  <div className="font-bold text-gray-900">{selectedWh.area}</div>
                </div>
              </div>

              {/* Statistics */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide">Assigned Resources</h4>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="border border-gray-100 p-2.5 rounded-lg bg-gray-50/50">
                    <div className="text-lg font-bold text-blue-700">{zones.filter(z => z.warehouse === selectedWh.name).length}</div>
                    <div className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Zones</div>
                  </div>
                  <div className="border border-gray-100 p-2.5 rounded-lg bg-gray-50/50">
                    <div className="text-lg font-bold text-blue-700">{bins.length}</div>
                    <div className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Bins</div>
                  </div>
                  <div className="border border-gray-100 p-2.5 rounded-lg bg-gray-50/50">
                    <div className="text-lg font-bold text-blue-700">{inventory.length}</div>
                    <div className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Stock Items</div>
                  </div>
                </div>
              </div>

              {/* Assigned Zones list */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide">Zone Layout Mappings</h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {zones.filter(z => z.warehouse === selectedWh.name).map((zone) => (
                    <div key={zone.id} className="p-3 flex justify-between items-center text-xs hover:bg-gray-50/50">
                      <div>
                        <span className="font-semibold text-gray-900">{zone.name}</span>
                        <span className="text-gray-400 ml-1.5">({zone.type})</span>
                      </div>
                      <Badge variant={zone.status === 'Active' ? 'success' : 'warning'}>{zone.capacityPercent}% Space</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent movement activities */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide">Recent Facility Movements</h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {movements.slice(0, 3).map((mov, i) => (
                    <div key={i} className="p-3 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-gray-900">{mov.item}</span>
                        <span className="text-gray-400 ml-1.5">({mov.sku})</span>
                      </div>
                      <span className="font-mono text-[10px] text-blue-700 font-bold bg-blue-50 px-1 rounded">{mov.to}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full justify-center mt-6 text-sm" onClick={() => setSelectedWh(null)}>
              Close Facility Overview
            </Button>
          </div>
        </div>
      )}

      {/* Add Warehouse Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddWarehouse} className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Add Warehouse Facility</h3>
              </div>
              <button type="button" className="text-slate-400 hover:text-white font-semibold text-lg" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Facility Name</label>
                <input 
                  type="text" 
                  value={newWhName}
                  onChange={(e) => setNewWhName(e.target.value)}
                  placeholder="e.g. West Coast Distribution B" 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Geographic Location</label>
                <input 
                  type="text" 
                  value={newWhLoc}
                  onChange={(e) => setNewWhLoc(e.target.value)}
                  placeholder="e.g. Phoenix, AZ" 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Total Area Size (sq ft)</label>
                <input 
                  type="text" 
                  value={newWhArea}
                  onChange={(e) => setNewWhArea(e.target.value)}
                  placeholder="e.g. 45,000 sq ft" 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit">Add Facility</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

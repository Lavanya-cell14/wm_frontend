import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AlertBanner from '../components/ui/AlertBanner';
import StatusBadge from '../components/ui/StatusBadge';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { LayoutGrid, Layers, Plus, Map, Trash2, Edit2, ShieldAlert, BarChart3, AlertTriangle, Lightbulb } from 'lucide-react';

export default function ZonesBins() {
  const { 
    zones, addZone, editZone, deleteZone, 
    bins, addBin, editBin, deleteBin,
    warehouses
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState('Zones');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showBinModal, setShowBinModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [editingBin, setEditingBin] = useState(null);

  // Form states - Zone
  const [zoneName, setZoneName] = useState('');
  const [zoneType, setZoneType] = useState('General');
  const [zoneWh, setZoneWh] = useState('Central Fulfillment A');
  const [zoneX, setZoneX] = useState('');
  const [zoneY, setZoneY] = useState('');
  const [zoneZ, setZoneZ] = useState('');
  const [zoneW, setZoneW] = useState('');
  const [zoneH, setZoneH] = useState('');
  const [zoneD, setZoneD] = useState('');
  const [zoneStatus, setZoneStatus] = useState('Active');

  // Form states - Bin
  const [binCode, setBinCode] = useState('');
  const [binZone, setBinZone] = useState('Zone A');
  const [binShelf, setBinShelf] = useState('S-01');
  const [binCap, setBinCap] = useState('');
  const [binX, setBinX] = useState('');
  const [binY, setBinY] = useState('');
  const [binZ, setBinZ] = useState('');
  const [binStatus, setBinStatus] = useState('Active');

  const handleOpenAddZone = () => {
    setEditingZone(null);
    setZoneName('');
    setZoneType('General');
    setZoneStatus('Active');
    setZoneX(''); setZoneY(''); setZoneZ('');
    setZoneW(''); setZoneH(''); setZoneD('');
    setShowZoneModal(true);
  };

  const handleOpenEditZone = (z) => {
    setEditingZone(z);
    setZoneName(z.name);
    setZoneType(z.type);
    setZoneWh(z.warehouse);
    setZoneStatus(z.status);
    setZoneX(z.x); setZoneY(z.y); setZoneZ(z.z);
    setZoneW(z.width); setZoneH(z.height); setZoneD(z.depth);
    setShowZoneModal(true);
  };

  const handleSaveZone = (e) => {
    e.preventDefault();
    if (!zoneName) return;
    const data = {
      name: zoneName,
      type: zoneType,
      warehouse: zoneWh,
      x: zoneX, y: zoneY, z: zoneZ,
      width: zoneW, height: zoneH, depth: zoneD,
      status: zoneStatus
    };

    if (editingZone) {
      editZone({ id: editingZone.id, ...data });
    } else {
      addZone(data);
    }
    setShowZoneModal(false);
  };

  const handleOpenAddBin = () => {
    setEditingBin(null);
    setBinCode('');
    setBinShelf('S-01');
    setBinStatus('Active');
    setBinCap('');
    setBinX(''); setBinY(''); setBinZ('');
    setShowBinModal(true);
  };

  const handleOpenEditBin = (b) => {
    setEditingBin(b);
    setBinCode(b.code);
    setBinZone(b.zone);
    setBinShelf(b.shelf);
    setBinCap(b.maxCapacity);
    setBinStatus(b.status);
    setBinX(b.x); setBinY(b.y); setBinZ(b.z);
    setShowBinModal(true);
  };

  const handleSaveBin = (e) => {
    e.preventDefault();
    if (!binCode) return;
    const data = {
      code: binCode,
      zone: binZone,
      shelf: binShelf,
      maxCapacity: binCap,
      x: binX, y: binY, z: binZ,
      status: binStatus
    };

    if (editingBin) {
      editBin(data);
    } else {
      addBin(data);
    }
    setShowBinModal(false);
  };

  // Filter lists
  const filteredZones = zones.filter(z => 
    z.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    z.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBins = bins.filter(b => 
    b.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.zone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-7 h-7 text-[#0071C1]" />
            Zones & Bins Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure layout zones, aisle coordinate boundaries, and shelf bin placements.</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'Zones' ? (
            <Button className="gap-1.5" onClick={handleOpenAddZone}><Plus className="w-4 h-4" /> Add Zone</Button>
          ) : activeTab === 'Bins' ? (
            <Button className="gap-1.5" onClick={handleOpenAddBin}><Plus className="w-4 h-4" /> Add Bin</Button>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['Zones', 'Bins', 'Capacity View'].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
            className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === tab 
                ? 'border-[#0071C1] text-[#0071C1]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SEARCH / FILTERS */}
      {activeTab !== 'Capacity View' && (
        <Card className="border border-gray-100 shadow-xs">
          <CardContent className="p-4">
            <SearchFilterBar 
              placeholder={`Search ${activeTab.toLowerCase()} by code, name, zone...`} 
              onSearch={(val) => setSearchQuery(val)} 
            />
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: ZONES */}
      {activeTab === 'Zones' && (
        <Card className="border border-gray-100 shadow-xs">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Coordinates (X,Y,Z)</TableHead>
                  <TableHead>Dimensions (W,H,D)</TableHead>
                  <TableHead>Capacity %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredZones.map((z) => (
                  <TableRow key={z.id}>
                    <TableCell className="font-bold text-gray-900 text-sm">{z.name}</TableCell>
                    <TableCell className="text-gray-600 text-xs font-semibold">{z.type}</TableCell>
                    <TableCell className="text-gray-600 text-xs font-semibold">{z.warehouse}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">
                      X: {z.x}, Y: {z.y}, Z: {z.z}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">
                      {z.width} x {z.height} x {z.depth}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${z.capacityPercent > 80 ? 'bg-red-500' : 'bg-blue-600'}`} 
                            style={{ width: `${z.capacityPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{z.capacityPercent}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={z.status === 'Active' ? 'success' : 'warning'} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="p-1 px-2 text-gray-600" onClick={() => handleOpenEditZone(z)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="outline" size="sm" className="p-1 px-2 text-red-600 border-red-100 hover:bg-red-50" onClick={() => deleteZone(z.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: BINS */}
      {activeTab === 'Bins' && (
        <Card className="border border-gray-100 shadow-xs">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bin Code</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Shelf</TableHead>
                  <TableHead>Max Capacity</TableHead>
                  <TableHead>Current Cap</TableHead>
                  <TableHead>Coordinates (X,Y,Z)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBins.map((b) => (
                  <TableRow key={b.code}>
                    <TableCell className="font-bold text-blue-700 font-mono text-sm">{b.code}</TableCell>
                    <TableCell className="text-gray-600 text-xs font-semibold">{b.zone}</TableCell>
                    <TableCell className="text-gray-600 text-xs font-semibold">{b.shelf}</TableCell>
                    <TableCell className="font-semibold text-gray-900 text-xs">{b.maxCapacity} units</TableCell>
                    <TableCell className="font-semibold text-gray-900 text-xs">{b.currentCapacity} units</TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">
                      X: {b.x}, Y: {b.y}, Z: {b.z}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status === 'Active' ? 'success' : 'warning'} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="p-1 px-2 text-gray-600" onClick={() => handleOpenEditBin(b)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="outline" size="sm" className="p-1 px-2 text-red-600 border-red-100 hover:bg-red-50" onClick={() => deleteBin(b.code)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: CAPACITY VIEW */}
      {activeTab === 'Capacity View' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Zone Capacity Bars */}
            <Card>
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase">
                  <BarChart3 className="w-4 h-4 text-blue-600" /> Zone Utilization List
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {zones.map((z) => (
                  <div key={z.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-900">{z.name} ({z.type})</span>
                      <span className="text-gray-600">{z.capacityPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full ${z.capacityPercent > 80 ? 'bg-red-500' : 'bg-blue-600'}`}
                        style={{ width: `${z.capacityPercent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Overloaded Bins warning */}
            <Card className="border border-red-100 bg-red-50/10">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-red-950">Overloaded Locations Flagged</h4>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">
                    Bin C-04-12 in Zone C is currently at 88% capacity. Reallocate safety gear inventory to empty bins in Zone A.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            
            {/* Empty Bins List */}
            <Card>
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-sm font-bold uppercase">Empty Shelves (Available)</CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-60 overflow-y-auto">
                <div className="divide-y divide-gray-100 text-xs">
                  {bins.filter(b => b.currentCapacity === 0).map((b) => (
                    <div key={b.code} className="p-3 flex justify-between items-center hover:bg-gray-50/50">
                      <span className="font-mono font-bold text-blue-700">{b.code}</span>
                      <Badge variant="outline">{b.shelf}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Capacity suggestions */}
            <Card className="border-t-4 border-t-[#0071C1]">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> AI Capacity Balancer
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="p-3 bg-blue-50/20 border border-blue-100 rounded-xl text-xs space-y-1.5">
                  <div className="font-bold text-gray-900">Shift Electronics Overflow</div>
                  <p className="text-[11px] text-gray-600 leading-normal">
                    Zone B is nearing 72%. Shift upcoming accessories to Zone A empty slots to balance travel pathing.
                  </p>
                  <Button variant="ghost" className="text-blue-600 text-[10px] font-bold p-0 hover:bg-transparent">
                    Auto-Balance Zones →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ZONE MODAL */}
      {showZoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSaveZone} className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">{editingZone ? 'Edit Zone Properties' : 'Add Storage Zone'}</h3>
              </div>
              <button type="button" className="text-slate-400 hover:text-white font-semibold text-lg" onClick={() => setShowZoneModal(false)}>×</button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider">Zone Name</label>
                  <input 
                    type="text" value={zoneName} onChange={(e) => setZoneName(e.target.value)} 
                    placeholder="e.g. Zone E" className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500" required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider">Zone Type</label>
                  <select value={zoneType} onChange={(e) => setZoneType(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500">
                    <option>General</option>
                    <option>Electronics</option>
                    <option>Fast Moving</option>
                    <option>Bulk Storage</option>
                    <option>Cold Storage</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider">Status</label>
                  <select value={zoneStatus} onChange={(e) => setZoneStatus(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500">
                    <option>Active</option>
                    <option>Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="font-bold text-gray-900 uppercase">3D Path Coordinates</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase">X Axis</label>
                    <input type="number" value={zoneX} onChange={(e) => setZoneX(e.target.value)} className="w-full border border-gray-300 p-1.5 rounded text-sm outline-none" placeholder="10" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Y Axis</label>
                    <input type="number" value={zoneY} onChange={(e) => setZoneY(e.target.value)} className="w-full border border-gray-300 p-1.5 rounded text-sm outline-none" placeholder="5" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Z Axis</label>
                    <input type="number" value={zoneZ} onChange={(e) => setZoneZ(e.target.value)} className="w-full border border-gray-300 p-1.5 rounded text-sm outline-none" placeholder="0" />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="font-bold text-gray-900 uppercase">Grid Dimensions (meters)</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Width</label>
                    <input type="number" value={zoneW} onChange={(e) => setZoneW(e.target.value)} className="w-full border border-gray-300 p-1.5 rounded text-sm outline-none" placeholder="20" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Height</label>
                    <input type="number" value={zoneH} onChange={(e) => setZoneH(e.target.value)} className="w-full border border-gray-300 p-1.5 rounded text-sm outline-none" placeholder="10" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Depth</label>
                    <input type="number" value={zoneD} onChange={(e) => setZoneD(e.target.value)} className="w-full border border-gray-300 p-1.5 rounded text-sm outline-none" placeholder="15" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowZoneModal(false)}>Cancel</Button>
              <Button type="submit">Save Zone</Button>
            </div>
          </form>
        </div>
      )}

      {/* BIN MODAL */}
      {showBinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSaveBin} className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">{editingBin ? 'Edit Shelf Bin' : 'Add Location Bin'}</h3>
              </div>
              <button type="button" className="text-slate-400 hover:text-white font-semibold text-lg" onClick={() => setShowBinModal(false)}>×</button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider">Bin Code</label>
                  <input 
                    type="text" value={binCode} onChange={(e) => setBinCode(e.target.value)} 
                    placeholder="e.g. BIN-E-01-01" className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500" required disabled={!!editingBin}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider">Zone Location</label>
                  <select value={binZone} onChange={(e) => setBinZone(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500">
                    {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider">Shelf Level</label>
                  <input type="text" value={binShelf} onChange={(e) => setBinShelf(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500" required />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider">Max Capacity Limit</label>
                  <input type="number" value={binCap} onChange={(e) => setBinCap(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500" placeholder="150" required />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider">Status</label>
                  <select value={binStatus} onChange={(e) => setBinStatus(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500">
                    <option>Active</option>
                    <option>Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="font-bold text-gray-900 uppercase">Bin coordinates</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase">X Axis</label>
                    <input type="number" value={binX} onChange={(e) => setBinX(e.target.value)} className="w-full border border-gray-300 p-1.5 rounded text-sm outline-none" placeholder="12" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Y Axis</label>
                    <input type="number" value={binY} onChange={(e) => setBinY(e.target.value)} className="w-full border border-gray-300 p-1.5 rounded text-sm outline-none" placeholder="5" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Z Axis</label>
                    <input type="number" value={binZ} onChange={(e) => setBinZ(e.target.value)} className="w-full border border-gray-300 p-1.5 rounded text-sm outline-none" placeholder="1" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowBinModal(false)}>Cancel</Button>
              <Button type="submit">Save Bin Location</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

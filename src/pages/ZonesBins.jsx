import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { AlertBanner, Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Modal, Pagination, SearchFilterBar, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import { LayoutGrid, Layers, Plus, Map, Trash2, Edit2, ShieldAlert, BarChart3, AlertTriangle, Lightbulb, Box } from 'lucide-react';
import { getZoneLabel } from '../utils/zoneMapping';

export default function ZonesBins() {
  const { 
    zones, addZone, editZone, deleteZone, 
    bins, addBin, editBin, deleteBin,
    racks, addRack, editRack, deleteRack,
    shelves, addShelf, editShelf, deleteShelf,
    warehouses, generateNextId, inventory
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState('Zones');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination States
  const [zonesPage, setZonesPage] = useState(1);
  const [racksPage, setRacksPage] = useState(1);
  const [shelvesPage, setShelvesPage] = useState(1);
  const [binsPage, setBinsPage] = useState(1);
  const pageSize = 8;

  // Reset pagination on search query or tab change
  React.useEffect(() => {
    setZonesPage(1);
    setRacksPage(1);
    setShelvesPage(1);
    setBinsPage(1);
  }, [searchQuery, activeTab]);
  
  // Modals state
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showRackModal, setShowRackModal] = useState(false);
  const [showShelfModal, setShowShelfModal] = useState(false);
  const [showBinModal, setShowBinModal] = useState(false);

  const [editingZone, setEditingZone] = useState(null);
  const [editingRack, setEditingRack] = useState(null);
  const [editingShelf, setEditingShelf] = useState(null);
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
  const [zoneCapacityPercent, setZoneCapacityPercent] = useState('0');

  // Form states - Rack
  const [rackName, setRackName] = useState('');
  const [rackZoneId, setRackZoneId] = useState('');
  const [rackMaxWeight, setRackMaxWeight] = useState('');
  const [rackStatus, setRackStatus] = useState('Active');

  // Form states - Shelf
  const [shelfLevel, setShelfLevel] = useState('');
  const [shelfRackId, setShelfRackId] = useState('');
  const [shelfMaxWeight, setShelfMaxWeight] = useState('');
  const [shelfStatus, setShelfStatus] = useState('Active');

  // Form states - Bin
  const [binCode, setBinCode] = useState('');
  const [binZone, setBinZone] = useState('Zone A');
  const [binShelfId, setBinShelfId] = useState('');
  const [binMaxWeight, setBinMaxWeight] = useState('');
  const [binMaxCap, setBinMaxCap] = useState('');
  const [binStatus, setBinStatus] = useState('Active');

  // ZONE CRUD HANDLERS
  const handleOpenAddZone = () => {
    setEditingZone(null);
    const nextName = generateNextId('Zone ', zones.map(z => z.name));
    setZoneName(nextName);
    setZoneType('General');
    setZoneStatus('Active');
    setZoneX(''); setZoneY(''); setZoneZ('');
    setZoneW(''); setZoneH(''); setZoneD('');
    setZoneCapacityPercent('0');
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
    setZoneCapacityPercent(z.capacityPercent !== undefined ? String(z.capacityPercent) : '0');
    setShowZoneModal(true);
  };

  const handleSaveZone = (e) => {
    e.preventDefault();
    if (!zoneName) return;
    const data = {
      name: zoneName,
      type: zoneType,
      warehouse: zoneWh,
      x: Number(zoneX) || 0, y: Number(zoneY) || 0, z: Number(zoneZ) || 0,
      width: Number(zoneW) || 10, height: Number(zoneH) || 8, depth: Number(zoneD) || 10,
      status: zoneStatus,
      capacityPercent: Number(zoneCapacityPercent) || 0
    };
    if (editingZone) {
      editZone({ id: editingZone.id, ...data });
    } else {
      addZone(data);
    }
    setShowZoneModal(false);
  };

  // RACK CRUD HANDLERS
  const handleOpenAddRack = () => {
    setEditingRack(null);
    const nextName = generateNextId('Rack ', racks.map(r => r.name));
    setRackName(nextName);
    setRackZoneId(zones[0] ? zones[0].id : '');
    setRackMaxWeight('1500');
    setRackStatus('Active');
    setShowRackModal(true);
  };

  const handleOpenEditRack = (r) => {
    setEditingRack(r);
    setRackName(r.name);
    setRackZoneId(r.zoneId);
    setRackMaxWeight(r.maxWeight);
    setRackStatus(r.status);
    setShowRackModal(true);
  };

  const handleSaveRack = (e) => {
    e.preventDefault();
    if (!rackName) return;
    const data = {
      name: rackName,
      zoneId: rackZoneId,
      maxWeight: Number(rackMaxWeight),
      status: rackStatus
    };
    if (editingRack) {
      editRack({ id: editingRack.id, ...data });
    } else {
      addRack(data);
    }
    setShowRackModal(false);
  };

  // SHELF CRUD HANDLERS
  const handleOpenAddShelf = () => {
    setEditingShelf(null);
    setShelfLevel(`Level ${shelves.length + 1}`);
    setShelfRackId(racks[0] ? racks[0].id : '');
    setShelfMaxWeight('400');
    setShelfStatus('Active');
    setShowShelfModal(true);
  };

  const handleOpenEditShelf = (s) => {
    setEditingShelf(s);
    setShelfLevel(s.shelfLevel);
    setShelfRackId(s.rackId);
    setShelfMaxWeight(s.maxWeight);
    setShelfStatus(s.status);
    setShowShelfModal(true);
  };

  const handleSaveShelf = (e) => {
    e.preventDefault();
    if (!shelfLevel) return;
    const data = {
      shelfLevel,
      rackId: shelfRackId,
      maxWeight: Number(shelfMaxWeight),
      status: shelfStatus
    };
    if (editingShelf) {
      editShelf({ id: editingShelf.id, ...data });
    } else {
      addShelf(data);
    }
    setShowShelfModal(false);
  };

  // BIN CRUD HANDLERS
  const handleOpenAddBin = () => {
    setEditingBin(null);
    const nextCode = generateNextId('BIN-', bins.map(b => b.code));
    setBinCode(nextCode);
    setBinZone('Zone A');
    setBinShelfId(shelves[0] ? shelves[0].id : '');
    setBinMaxWeight('150');
    setBinMaxCap('150');
    setBinStatus('Active');
    setShowBinModal(true);
  };

  const handleOpenEditBin = (b) => {
    setEditingBin(b);
    setBinCode(b.code);
    setBinZone(b.zone);
    setBinShelfId(b.shelfId || '');
    setBinMaxWeight(b.maxWeight || '150');
    setBinMaxCap(b.maxCapacity || '150');
    setBinStatus(b.status);
    setShowBinModal(true);
  };

  const handleSaveBin = (e) => {
    e.preventDefault();
    if (!binCode) return;
    const shelfItem = shelves.find(s => s.id === binShelfId) || { shelfLevel: 'S-01' };
    const data = {
      code: binCode,
      zone: binZone,
      shelfId: binShelfId,
      shelf: shelfItem.shelfLevel,
      maxCapacity: Number(binMaxCap),
      maxWeight: Number(binMaxWeight),
      status: binStatus
    };
    if (editingBin) {
      editBin(data);
    } else {
      addBin(data);
    }
    setShowBinModal(false);
  };

  // Filters
  // Filters
  const filteredZones = zones.filter(z => 
    z.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    z.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedZones = filteredZones.slice((zonesPage - 1) * pageSize, zonesPage * pageSize);
  const zonesTotalPages = Math.max(1, Math.ceil(filteredZones.length / pageSize));

  const filteredRacks = racks.filter(r => {
    const zoneName = (zones.find(z => z.id === r.zoneId) || { name: '' }).name;
    return r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           zoneName.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const paginatedRacks = filteredRacks.slice((racksPage - 1) * pageSize, racksPage * pageSize);
  const racksTotalPages = Math.max(1, Math.ceil(filteredRacks.length / pageSize));

  const filteredShelves = shelves.filter(s => {
    const rackName = (racks.find(r => r.id === s.rackId) || { name: '' }).name;
    return s.shelfLevel.toLowerCase().includes(searchQuery.toLowerCase()) || 
           rackName.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const paginatedShelves = filteredShelves.slice((shelvesPage - 1) * pageSize, shelvesPage * pageSize);
  const shelvesTotalPages = Math.max(1, Math.ceil(filteredShelves.length / pageSize));

  const filteredBins = bins.filter(b => 
    b.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.zone.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedBins = filteredBins.slice((binsPage - 1) * pageSize, binsPage * pageSize);
  const binsTotalPages = Math.max(1, Math.ceil(filteredBins.length / pageSize));

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-7 h-7 text-[#0071C1]" />
            Layout Hierarchies Governance
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure layout zones, racks, shelves, and storage bin coordinates dynamically.</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'Zones' ? (
            <Button className="gap-1.5" onClick={handleOpenAddZone}><Plus className="w-4 h-4" /> Add Zone</Button>
          ) : activeTab === 'Racks' ? (
            <Button className="gap-1.5" onClick={handleOpenAddRack}><Plus className="w-4 h-4" /> Add Rack</Button>
          ) : activeTab === 'Shelves' ? (
            <Button className="gap-1.5" onClick={handleOpenAddShelf}><Plus className="w-4 h-4" /> Add Shelf</Button>
          ) : activeTab === 'Bins' ? (
            <Button className="gap-1.5" onClick={handleOpenAddBin}><Plus className="w-4 h-4" /> Add Bin</Button>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-150 pb-4">
        <div className="flex bg-slate-100/80 p-1 rounded-xl gap-1 w-full sm:w-auto border border-slate-200/50 overflow-x-auto hide-scrollbar">
          {['Zones', 'Racks', 'Shelves', 'Bins', 'Capacity View'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
                className={`flex-1 sm:flex-initial py-2 px-5 font-bold text-xs rounded-lg transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#0071C1] shadow-xs border border-slate-200/20'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-slate-200/40'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH / FILTERS */}
      {activeTab !== 'Capacity View' && (
        <Card className="border border-gray-100 shadow-xs">
          <CardContent className="p-4">
            <SearchFilterBar 
              searchPlaceholder={`Search ${activeTab.toLowerCase()} by code, name, zone...`} 
              searchValue={searchQuery}
              onSearchChange={setSearchQuery} 
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
                  <TableHead>Utilization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedZones.map((z) => (
                  <TableRow key={z.id}>
                    <TableCell className="font-bold text-gray-900 text-sm">{z.name}</TableCell>
                    <TableCell className="text-gray-600 text-xs font-semibold">{z.type}</TableCell>
                    <TableCell className="text-gray-600 text-xs font-semibold">{z.warehouse}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${z.capacityPercent > 80 ? 'bg-red-500' : 'bg-blue-600'}`} 
                            style={{ width: `${z.capacityPercent || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{z.capacityPercent || 0}%</span>
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
                        <Button variant="outline" size="sm" className="p-1 px-2 text-red-600 border-red-105 hover:bg-red-50" onClick={() => deleteZone(z.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4">
              <Pagination
                currentPage={zonesPage}
                totalPages={zonesTotalPages}
                totalItems={filteredZones.length}
                pageSize={pageSize}
                onPageChange={setZonesPage}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: RACKS */}
      {activeTab === 'Racks' && (
        <Card className="border border-gray-100 shadow-xs">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rack ID</TableHead>
                  <TableHead>Rack Name</TableHead>
                  <TableHead>Assigned Zone</TableHead>
                  <TableHead>Max Weight Capacity</TableHead>
                  <TableHead>Current Weight</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRacks.map((r) => {
                  const zone = zones.find(z => z.id === r.zoneId) || { name: 'Unknown Zone' };
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-bold font-mono text-xs text-gray-900">{r.id}</TableCell>
                      <TableCell className="font-bold text-gray-900 text-sm">{r.name}</TableCell>
                      <TableCell className="text-gray-600 text-xs font-semibold">{zone.name}</TableCell>
                      <TableCell className="font-semibold text-gray-800 text-xs">{r.maxWeight} kg</TableCell>
                      <TableCell className="font-semibold text-gray-800 text-xs">{r.currentWeight} kg</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status === 'Active' ? 'success' : 'warning'} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" className="p-1 px-2 text-gray-600" onClick={() => handleOpenEditRack(r)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" className="p-1 px-2 text-red-600 border-red-105 hover:bg-red-50" onClick={() => deleteRack(r.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="p-4">
              <Pagination
                currentPage={racksPage}
                totalPages={racksTotalPages}
                totalItems={filteredRacks.length}
                pageSize={pageSize}
                onPageChange={setRacksPage}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: SHELVES */}
      {activeTab === 'Shelves' && (
        <Card className="border border-gray-100 shadow-xs">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shelf ID</TableHead>
                  <TableHead>Shelf Level</TableHead>
                  <TableHead>Assigned Rack</TableHead>
                  <TableHead>Max Weight Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedShelves.map((s) => {
                  const rack = racks.find(r => r.id === s.rackId) || { name: 'Unknown Rack' };
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-bold font-mono text-xs text-gray-900">{s.id}</TableCell>
                      <TableCell className="font-bold text-gray-900 text-sm">{s.shelfLevel}</TableCell>
                      <TableCell className="text-gray-600 text-xs font-semibold">{rack.name}</TableCell>
                      <TableCell className="font-semibold text-gray-800 text-xs">{s.maxWeight} kg</TableCell>
                      <TableCell>
                        <StatusBadge status={s.status === 'Active' ? 'success' : 'warning'} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" className="p-1 px-2 text-gray-600" onClick={() => handleOpenEditShelf(s)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" className="p-1 px-2 text-red-600 border-red-105 hover:bg-red-50" onClick={() => deleteShelf(s.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="p-4">
              <Pagination
                currentPage={shelvesPage}
                totalPages={shelvesTotalPages}
                totalItems={filteredShelves.length}
                pageSize={pageSize}
                onPageChange={setShelvesPage}
              />
            </div>
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
                  <TableHead>Zone Name</TableHead>
                  <TableHead>Shelf Level</TableHead>
                  <TableHead>Max Capacity</TableHead>
                  <TableHead>Weight limit</TableHead>
                  <TableHead>Assigned Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBins.map((b) => {
                  const product = inventory.find(i => i.bin === b.code);
                  return (
                    <TableRow key={b.code}>
                      <TableCell className="font-bold text-blue-700 font-mono text-sm">{b.code}</TableCell>
                      <TableCell className="text-gray-600 text-xs font-semibold">{b.zone}</TableCell>
                      <TableCell className="text-gray-600 text-xs font-semibold">{b.shelf}</TableCell>
                      <TableCell className="font-semibold text-gray-900 text-xs">{b.maxCapacity} units</TableCell>
                      <TableCell className="font-semibold text-gray-900 text-xs">{b.maxWeight || '150'} kg</TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">
                        {product ? `${product.name} (${product.sku})` : 'Empty Slot'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={b.status === 'FULL' ? 'error' : b.status === 'EMPTY' ? 'outline' : 'success'}
                          className="text-[10px] uppercase font-bold"
                        >
                          {b.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" className="p-1 px-2 text-gray-600" onClick={() => handleOpenEditBin(b)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" className="p-1 px-2 text-red-600 border-red-105 hover:bg-red-50" onClick={() => deleteBin(b.code)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="p-4">
              <Pagination
                currentPage={binsPage}
                totalPages={binsTotalPages}
                totalItems={filteredBins.length}
                pageSize={pageSize}
                onPageChange={setBinsPage}
              />
            </div>
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
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase">
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
                <CardTitle className="text-xs font-bold uppercase">Empty Shelves (Available)</CardTitle>
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
          </div>
        </div>
      )}

      {/* ZONE MODAL */}
      {showZoneModal && (
        <Modal
          isOpen={showZoneModal}
          onClose={() => setShowZoneModal(false)}
          title={editingZone ? 'Edit Storage Zone' : 'Add Storage Zone'}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setShowZoneModal(false)}>Cancel</Button>
              <Button type="button" onClick={handleSaveZone}>Save Zone</Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase">Zone Name</label>
                <Input 
                  type="text" value={zoneName} onChange={(e) => setZoneName(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white" required
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase">Capacity (%)</label>
                <Input 
                  type="number" min="0" max="100" value={zoneCapacityPercent} onChange={(e) => setZoneCapacityPercent(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white" required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase">Zone Type</label>
                <select value={zoneType} onChange={(e) => setZoneType(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white">
                  <option>General</option>
                  <option>Electronics</option>
                  <option>Fast Moving</option>
                  <option>Bulk Storage</option>
                  <option>Cold Storage</option>
                  <option>RECEIVING</option>
                  <option>STORAGE</option>
                  <option>DAMAGED</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase">Status</label>
                <select value={zoneStatus} onChange={(e) => setZoneStatus(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white">
                  <option>Active</option>
                  <option>Maintenance</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* RACK MODAL */}
      {showRackModal && (
        <Modal
          isOpen={showRackModal}
          onClose={() => setShowRackModal(false)}
          title={editingRack ? 'Edit Rack Properties' : 'Add Storage Rack'}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setShowRackModal(false)}>Cancel</Button>
              <Button type="button" onClick={handleSaveRack}>Save Rack</Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-gray-700 uppercase">Rack Name</label>
              <Input 
                type="text" value={rackName} onChange={(e) => setRackName(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500" required
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-gray-700 uppercase">Assign Zone</label>
              <select value={rackZoneId} onChange={(e) => setRackZoneId(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white">
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase">Max Weight (kg)</label>
                <Input 
                  type="number" value={rackMaxWeight} onChange={(e) => setRackMaxWeight(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500" required
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase">Status</label>
                <select value={rackStatus} onChange={(e) => setRackStatus(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white">
                  <option>Active</option>
                  <option>Maintenance</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* SHELF MODAL */}
      {showShelfModal && (
        <Modal
          isOpen={showShelfModal}
          onClose={() => setShowShelfModal(false)}
          title={editingShelf ? 'Edit Shelf Properties' : 'Add Storage Shelf'}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setShowShelfModal(false)}>Cancel</Button>
              <Button type="button" onClick={handleSaveShelf}>Save Shelf</Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-gray-700 uppercase">Shelf Level</label>
              <Input 
                type="text" value={shelfLevel} onChange={(e) => setShelfLevel(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500" required
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-gray-700 uppercase">Assign Rack</label>
              <select value={shelfRackId} onChange={(e) => setShelfRackId(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white">
                {racks.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase">Max Weight (kg)</label>
                <Input 
                  type="number" value={shelfMaxWeight} onChange={(e) => setShelfMaxWeight(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500" required
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase">Status</label>
                <select value={shelfStatus} onChange={(e) => setShelfStatus(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white">
                  <option>Active</option>
                  <option>Maintenance</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* BIN MODAL */}
      {showBinModal && (
        <Modal
          isOpen={showBinModal}
          onClose={() => setShowBinModal(false)}
          title={editingBin ? 'Edit Shelf Bin' : 'Add Location Bin'}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setShowBinModal(false)}>Cancel</Button>
              <Button type="button" onClick={handleSaveBin}>Save Bin</Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-gray-700 uppercase">Bin Code</label>
              <Input 
                type="text" value={binCode} readOnly 
                className="w-full bg-slate-50 border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none text-slate-500 cursor-not-allowed" required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase">Zone Location</label>
                <select value={binZone} onChange={(e) => setBinZone(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white">
                  {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase">Shelf Level</label>
                <select value={binShelfId} onChange={(e) => setBinShelfId(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white">
                  {shelves.map(s => {
                    const rack = racks.find(r => r.id === s.rackId) || { name: 'Unknown' };
                    return <option key={s.id} value={s.id}>{rack.name} - {s.shelfLevel}</option>;
                  })}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase">Max Volume Capacity</label>
                <Input type="number" value={binMaxCap} onChange={(e) => setBinMaxCap(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500" required />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase">Max Weight Capacity (kg)</label>
                <Input type="number" value={binMaxWeight} onChange={(e) => setBinMaxWeight(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500" required />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="block font-bold text-gray-700 uppercase">Status</label>
                <select value={binStatus} onChange={(e) => setBinStatus(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white">
                  <option>EMPTY</option>
                  <option>PARTIAL</option>
                  <option>FULL</option>
                  <option>RESERVED</option>
                  <option>INACTIVE</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Badge, Button, Card, CardContent, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Modal, Input } from 'shared-ui';
import { Box, Plus, X, AlertTriangle, Loader2, Edit, Trash2 } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import { 
  getBins, 
  getBinById, 
  getRacks, 
  getZones, 
  createBinApi, 
  updateBinApi, 
  deleteBinApi 
} from '../../services/warehouseStructureService';

export default function BinList() {
  const { bins: contextBins, inventory } = useWarehouse();

  const [bins, setBins] = useState([]);
  const [racks, setRacks] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBin, setSelectedBin] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form Fields
  const [binCode, setBinCode] = useState('');
  const [binZone, setBinZone] = useState('');
  const [binRack, setBinRack] = useState('');
  const [binShelfNum, setBinShelfNum] = useState('1');
  const [binMaxCap, setBinMaxCap] = useState('100');
  const [binCurrCap, setBinCurrCap] = useState('0');
  const [binOccupied, setBinOccupied] = useState(false);
  const [binX, setBinX] = useState('');
  const [binY, setBinY] = useState('');
  const [binZ, setBinZ] = useState('');

  const normalizeApiBin = (b) => {
    const parts = (b.bin_code || '').split('-');
    let parsedRackCode = '—';
    let parsedShelf = b.shelf_number ? `S-${String(b.shelf_number).padStart(2, '0')}` : (b.shelf || 'S-01');
    if (parts.length >= 5) {
      parsedRackCode = `${parts[0]}-${parts[1]}-${parts[2]}`;
      const levelCode = parts[3];
      const levelNum = levelCode.replace('L', '');
      parsedShelf = `Level ${levelNum}`;
    }
    return {
      code: b.bin_code,
      zone: b.zone_name || 'Zone A',
      shelf: parsedShelf,
      maxCapacity: Number(b.max_capacity || 100),
      currentCapacity: Number(b.current_capacity || 0),
      status: b.is_occupied ? 'FULL' : 'EMPTY',
      x: Number(b.x || 0),
      y: Number(b.y || 0),
      z: Number(b.z || 0),
      id: b.id,
      _rackCode: parsedRackCode,
      _rackId: b.rack,
      _zoneId: b.zone,
      _shelfNumber: b.shelf_number || 1,
      _isOccupied: !!b.is_occupied
    };
  };

  const normalizeContextBin = (b) => ({
    code: b.code,
    zone: b.zone,
    shelf: b.shelf,
    maxCapacity: b.maxCapacity,
    currentCapacity: b.currentCapacity,
    status: b.status,
    x: b.x,
    y: b.y,
    z: b.z,
    id: b.code,
    _rackCode: 'RACK-001',
    _rackId: '',
    _zoneId: '',
    _shelfNumber: 1,
    _isOccupied: b.status === 'FULL'
  });

  const load = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const [binsRes, racksRes, zonesRes] = await Promise.all([
        getBins(),
        getRacks(),
        getZones()
      ]);
      setRacks(racksRes.results || []);
      setZones(zonesRes.results || []);
      
      const apiBins = binsRes.results.map(b => {
        const normalized = normalizeApiBin(b);
        let resolvedRack = normalized._rackCode || '—';
        let resolvedZone = 'Zone A';
        if (normalized._rackId) {
          const rackObj = racksRes.results.find(r => r.id === normalized._rackId);
          if (rackObj) {
            resolvedRack = rackObj.rack_code;
            const zoneObj = zonesRes.results.find(z => z.id === rackObj.zone);
            if (zoneObj) {
              resolvedZone = zoneObj.zone_name;
            }
          }
        }
        normalized.zone = resolvedZone;
        normalized._resolvedRack = resolvedRack;
        return normalized;
      });
      setBins(apiBins.length > 0 ? apiBins : contextBins.map(normalizeContextBin));
      setFallbackUsed(apiBins.length === 0);
    } catch (err) {
      console.error(err);
      setApiError('Bins API unreachable — showing cached data.');
      setBins(contextBins.map(normalizeContextBin));
      setRacks([]);
      setZones([]);
      setFallbackUsed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleViewBin = async (bin) => {
    setSelectedBin(bin);
    try {
      const detail = await getBinById(bin.id || bin.code);
      setSelectedBin(normalizeApiBin(detail));
    } catch (err) {
      console.warn("Could not fetch bin detail, using list view state:", err);
    }
  };

  const openAdd = () => {
    setBinCode('');
    setBinZone(zones[0]?.id || '');
    setBinRack(racks[0]?.id || '');
    setBinShelfNum('1');
    setBinMaxCap('100');
    setBinCurrCap('0');
    setBinOccupied(false);
    setBinX('0');
    setBinY('0');
    setBinZ('1');
    setShowAddModal(true);
  };

  const openEdit = (bin) => {
    setSelectedItem(bin);
    setBinCode(bin.code || '');
    setBinZone(bin._zoneId || '');
    setBinRack(bin._rackId || '');
    setBinShelfNum(String(bin._shelfNumber || '1'));
    setBinMaxCap(String(bin.maxCapacity || '100'));
    setBinCurrCap(String(bin.currentCapacity || '0'));
    setBinOccupied(bin._isOccupied);
    setBinX(String(bin.x || '0'));
    setBinY(String(bin.y || '0'));
    setBinZ(String(bin.z || '0'));
    setShowEditModal(true);
  };

  const openDelete = (bin) => {
    setSelectedItem(bin);
    setShowDeleteModal(true);
  };

  const handleCreate = async () => {
    try {
      const payload = {
        bin_code: binCode,
        zone: binZone || null,
        rack: binRack || null,
        shelf_number: binShelfNum ? Number(binShelfNum) : 1,
        max_capacity: binMaxCap ? Number(binMaxCap) : 100,
        current_capacity: binCurrCap ? Number(binCurrCap) : 0,
        is_occupied: binOccupied,
        x: binX ? Number(binX) : 0,
        y: binY ? Number(binY) : 0,
        z: binZ ? Number(binZ) : 0
      };
      await createBinApi(payload);
    } catch (err) {
      console.warn("Create Bin API failed, falling back locally:", err);
      const mockNew = {
        id: `bin-${Date.now()}`,
        code: binCode,
        zone: zones.find(z => z.id === binZone)?.zone_name || 'Zone A',
        shelf: `Level ${binShelfNum}`,
        maxCapacity: Number(binMaxCap) || 100,
        currentCapacity: Number(binCurrCap) || 0,
        status: binOccupied ? 'FULL' : 'EMPTY',
        x: Number(binX) || 0,
        y: Number(binY) || 0,
        z: Number(binZ) || 0,
        _rackCode: racks.find(r => r.id === binRack)?.rack_code || 'RACK-001',
        _rackId: binRack,
        _zoneId: binZone,
        _shelfNumber: Number(binShelfNum) || 1,
        _isOccupied: binOccupied
      };
      setBins([...bins, mockNew]);
    } finally {
      setShowAddModal(false);
      if (!fallbackUsed) load();
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      const payload = {
        bin_code: binCode,
        zone: binZone || null,
        rack: binRack || null,
        shelf_number: binShelfNum ? Number(binShelfNum) : 1,
        max_capacity: binMaxCap ? Number(binMaxCap) : 100,
        current_capacity: binCurrCap ? Number(binCurrCap) : 0,
        is_occupied: binOccupied,
        x: binX ? Number(binX) : 0,
        y: binY ? Number(binY) : 0,
        z: binZ ? Number(binZ) : 0
      };
      await updateBinApi(selectedItem.id, payload);
    } catch (err) {
      console.warn("Update Bin API failed, falling back locally:", err);
      setBins(bins.map(b => b.id === selectedItem.id ? {
        ...b,
        code: binCode,
        zone: zones.find(z => z.id === binZone)?.zone_name || 'Zone A',
        shelf: `Level ${binShelfNum}`,
        maxCapacity: Number(binMaxCap) || 100,
        currentCapacity: Number(binCurrCap) || 0,
        status: binOccupied ? 'FULL' : 'EMPTY',
        x: Number(binX) || 0,
        y: Number(binY) || 0,
        z: Number(binZ) || 0,
        _rackCode: racks.find(r => r.id === binRack)?.rack_code || 'RACK-001',
        _rackId: binRack,
        _zoneId: binZone,
        _shelfNumber: Number(binShelfNum) || 1,
        _isOccupied: binOccupied
      } : b));
    } finally {
      setShowEditModal(false);
      setSelectedItem(null);
      if (!fallbackUsed) load();
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteBinApi(selectedItem.id);
    } catch (err) {
      console.warn("Delete Bin API failed, falling back locally:", err);
      setBins(bins.filter(b => b.id !== selectedItem.id));
    } finally {
      setShowDeleteModal(false);
      setSelectedItem(null);
      if (!fallbackUsed) load();
    }
  };

  const filtered = bins.filter(b => 
    (b.code || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (b.zone || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Box className="w-7 h-7 text-[#0071C1]" />
            Bins Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure physical storage bin coordinates, load capacities, and active product assignments.</p>
        </div>
        <Button 
          className="bg-[#0071C1] hover:bg-[#005c9e] text-white gap-2 font-bold px-4 py-2"
          onClick={openAdd}
        >
          <Plus className="w-4 h-4" />
          Add Bin
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border border-gray-100 shadow-xs">
        <div className="p-4 border-b border-gray-100 bg-slate-50/50">
          <SearchFilterBar 
            searchPlaceholder="Search bins by code..." 
            searchValue={searchQuery}
            onSearchChange={setSearchQuery} 
          />
        </div>

        {loading && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            Loading bins from API...
          </div>
        )}

        {!loading && apiError && (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border-b border-amber-100 text-xs text-amber-800 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {apiError}
          </div>
        )}

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bin Code</TableHead>
                <TableHead>Shelf Level</TableHead>
                <TableHead>Rack Row</TableHead>
                <TableHead>Zone Name</TableHead>
                <TableHead>Occupancy Status</TableHead>
                <TableHead>Current Product</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">No bins matching criteria.</TableCell>
                </TableRow>
              ) : (
                pagedList.map((b) => {
                  const product = inventory.find(i => i.bin === b.code);
                  
                  let badgeVariant = 'default';
                  if (b.status === 'FULL') badgeVariant = 'error';
                  else if (b.status === 'EMPTY') badgeVariant = 'outline';
                  else badgeVariant = 'success';

                  return (
                    <TableRow key={b.code} className="hover:bg-slate-50/10">
                      <TableCell className="font-bold text-blue-700 font-mono text-sm">{b.code}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600 font-mono">{b.shelf}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600 font-mono">
                        {b._resolvedRack || '—'}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600">{b.zone}</TableCell>
                      <TableCell>
                        <Badge variant={badgeVariant} className="text-[10px] font-bold uppercase tracking-wider">
                          {b.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-medium">
                        {product ? `${product.name} (${product.sku})` : <span className="text-gray-400 font-normal">Empty Slot</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-gray-600" onClick={() => handleViewBin(b)}>
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-blue-600" onClick={() => openEdit(b)}>
                            <Edit className="w-3 h-3 mr-1" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-red-600" onClick={() => openDelete(b)}>
                            <Trash2 className="w-3 h-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Details Drawer */}
      {selectedBin && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6 text-xs font-semibold font-sans">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-[#0071C1]">
                    <Box className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-blue-700 font-mono text-base">{selectedBin.code}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{selectedBin.zone}</p>
                  </div>
                </div>
                <Button className="text-gray-400 hover:text-gray-600 font-bold" onClick={() => setSelectedBin(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Max Volume Limit</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedBin.maxCapacity} units</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Current occupancy</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedBin.currentCapacity} units</div>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-2">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">3D Spatial Position Offset</div>
                <div className="grid grid-cols-3 gap-2 font-mono text-center text-[10px]">
                  <div className="bg-slate-50 p-1.5 rounded">X: {selectedBin.x}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Y: {selectedBin.y}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Z: {selectedBin.z}</div>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-center mt-6 text-sm" onClick={() => setSelectedBin(null)}>
              Close Details View
            </Button>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Create New Storage Bin"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Create</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="block text-gray-700 mb-1">Bin Code *</label>
              <Input value={binCode} onChange={(e) => setBinCode(e.target.value)} placeholder="e.g. BIN-A2-02-L1-01" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">Zone *</label>
                <select 
                  value={binZone} 
                  onChange={(e) => setBinZone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.zone_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Rack *</label>
                <select 
                  value={binRack} 
                  onChange={(e) => setBinRack(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                >
                  {racks.map(r => (
                    <option key={r.id} value={r.id}>{r.rack_code}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">Shelf Number</label>
                <Input type="number" value={binShelfNum} onChange={(e) => setBinShelfNum(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Max Capacity</label>
                <Input type="number" value={binMaxCap} onChange={(e) => setBinMaxCap(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Current Capacity</label>
                <Input type="number" value={binCurrCap} onChange={(e) => setBinCurrCap(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">X Offset</label>
                <Input type="number" value={binX} onChange={(e) => setBinX(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Y Offset</label>
                <Input type="number" value={binY} onChange={(e) => setBinY(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Z Offset</label>
                <Input type="number" value={binZ} onChange={(e) => setBinZ(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2 py-1">
              <input 
                type="checkbox" 
                id="isOccupiedAdd" 
                checked={binOccupied}
                onChange={(e) => setBinOccupied(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
              />
              <label htmlFor="isOccupiedAdd" className="text-gray-700">Is Full/Occupied</label>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Bin Details"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleUpdate} className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Save Changes</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="block text-gray-700 mb-1">Bin Code *</label>
              <Input value={binCode} onChange={(e) => setBinCode(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">Zone *</label>
                <select 
                  value={binZone} 
                  onChange={(e) => setBinZone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.zone_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Rack *</label>
                <select 
                  value={binRack} 
                  onChange={(e) => setBinRack(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                >
                  {racks.map(r => (
                    <option key={r.id} value={r.id}>{r.rack_code}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">Shelf Number</label>
                <Input type="number" value={binShelfNum} onChange={(e) => setBinShelfNum(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Max Capacity</label>
                <Input type="number" value={binMaxCap} onChange={(e) => setBinMaxCap(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Current Capacity</label>
                <Input type="number" value={binCurrCap} onChange={(e) => setBinCurrCap(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">X Offset</label>
                <Input type="number" value={binX} onChange={(e) => setBinX(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Y Offset</label>
                <Input type="number" value={binY} onChange={(e) => setBinY(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Z Offset</label>
                <Input type="number" value={binZ} onChange={(e) => setBinZ(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2 py-1">
              <input 
                type="checkbox" 
                id="isOccupiedEdit" 
                checked={binOccupied}
                onChange={(e) => setBinOccupied(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
              />
              <label htmlFor="isOccupiedEdit" className="text-gray-700">Is Full/Occupied</label>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Bin"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700 font-bold">Delete</Button>
            </>
          }
        >
          <div className="text-xs font-semibold py-4 text-slate-700 flex items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-red-500 shrink-0" />
            <p>
              Are you sure you want to delete storage bin slot <strong>{selectedItem?.code}</strong>?
            </p>
          </div>
        </Modal>
      )}

    </div>
  );
}

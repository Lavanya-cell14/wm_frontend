import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Badge, Button, Card, CardContent, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Modal, Input } from 'shared-ui';
import { Layers, Plus, X, AlertTriangle, Loader2, Edit, Trash2 } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import { 
  getRacks, 
  getRackById, 
  getRackCoordinates, 
  getZones, 
  createRackApi, 
  updateRackApi, 
  deleteRackApi 
} from '../../services/warehouseStructureService';

export default function RackList() {
  const { racks: contextRacks, zones: contextZones } = useWarehouse();
  
  const [racks, setRacks] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRack, setSelectedRack] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form Fields
  const [rackCode, setRackCode] = useState('');
  const [rackZone, setRackZone] = useState('');
  const [rackMaxWeight, setRackMaxWeight] = useState('');
  const [rackX, setRackX] = useState('');
  const [rackY, setRackY] = useState('');
  const [rackZ, setRackZ] = useState('');
  const [rackWidth, setRackWidth] = useState('');
  const [rackHeight, setRackHeight] = useState('');
  const [rackDepth, setRackDepth] = useState('');
  const [rackRotation, setRackRotation] = useState('0');

  const normalizeApiRack = (r) => ({
    id: r.id,
    zoneId: r.zone,
    name: r.rack_code,
    rackCode: r.rack_code,
    maxWeight: Number(r.max_weight || 500),
    currentWeight: Number(r.current_weight || 0),
    status: r.status || 'Active',
    x: Number(r.x || 0),
    y: Number(r.y || 0),
    z: Number(r.z || 0),
    width: Number(r.width || 2),
    height: Number(r.height || 4),
    depth: Number(r.depth || 1),
    rotationAngle: Number(r.rotation_angle || 0),
  });

  const normalizeContextRack = (r) => ({
    id: r.id,
    zoneId: r.zoneId,
    name: r.name,
    rackCode: r.id,
    maxWeight: Number(r.maxWeight || 500),
    currentWeight: Number(r.currentWeight || 0),
    status: r.status || 'Active',
    x: Number(r.x || 0),
    y: Number(r.y || 0),
    z: Number(r.z || 0),
    width: 2,
    height: 4,
    depth: 1,
    rotationAngle: 0
  });

  const load = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const [racksRes, coordsRes, zonesRes] = await Promise.all([
        getRacks(),
        getRackCoordinates(),
        getZones()
      ]);
      const apiRacks = racksRes.results.map(normalizeApiRack);
      setRacks(apiRacks.length > 0 ? apiRacks : contextRacks.map(normalizeContextRack));
      setCoordinates(coordsRes.results || []);
      setZones(zonesRes.results || []);
      setFallbackUsed(apiRacks.length === 0);
    } catch (err) {
      console.error(err);
      setApiError('Racks API unreachable — showing cached data.');
      setRacks(contextRacks.map(normalizeContextRack));
      setZones(contextZones.map(z => ({ id: z.id, zone_name: z.name })));
      setCoordinates([]);
      setFallbackUsed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleViewRack = async (rack) => {
    setSelectedRack(rack);
    try {
      const detail = await getRackById(rack.id);
      setSelectedRack(normalizeApiRack(detail));
    } catch (err) {
      console.warn("Could not fetch rack detail, using list view state:", err);
    }
  };

  const openAdd = () => {
    setRackCode('');
    setRackZone(zones[0]?.id || '');
    setRackMaxWeight('1000');
    setRackX('5');
    setRackY('5');
    setRackZ('0');
    setRackWidth('2.5');
    setRackHeight('4.0');
    setRackDepth('1.2');
    setRackRotation('0');
    setShowAddModal(true);
  };

  const openEdit = (rack) => {
    setSelectedItem(rack);
    setRackCode(rack.rackCode || '');
    setRackZone(rack.zoneId || '');
    setRackMaxWeight(String(rack.maxWeight || ''));
    setRackX(String(rack.x || ''));
    setRackY(String(rack.y || ''));
    setRackZ(String(rack.z || ''));
    setRackWidth(String(rack.width || ''));
    setRackHeight(String(rack.height || ''));
    setRackDepth(String(rack.depth || ''));
    setRackRotation(String(rack.rotationAngle || '0'));
    setShowEditModal(true);
  };

  const openDelete = (rack) => {
    setSelectedItem(rack);
    setShowDeleteModal(true);
  };

  const handleCreate = async () => {
    try {
      const payload = {
        rack_code: rackCode,
        zone: rackZone || null,
        max_weight: rackMaxWeight ? Number(rackMaxWeight) : 1000,
        x: rackX ? Number(rackX) : 0,
        y: rackY ? Number(rackY) : 0,
        z: rackZ ? Number(rackZ) : 0,
        width: rackWidth ? Number(rackWidth) : 2.5,
        height: rackHeight ? Number(rackHeight) : 4.0,
        depth: rackDepth ? Number(rackDepth) : 1.2,
        rotation_angle: rackRotation ? Number(rackRotation) : 0
      };
      await createRackApi(payload);
    } catch (err) {
      console.warn("Create Rack API failed, falling back locally:", err);
      const mockNew = {
        id: `rack-${Date.now()}`,
        zoneId: rackZone,
        name: rackCode,
        rackCode: rackCode,
        maxWeight: Number(rackMaxWeight) || 1000,
        currentWeight: 0,
        status: 'Active',
        x: Number(rackX) || 0,
        y: Number(rackY) || 0,
        z: Number(rackZ) || 0,
        width: Number(rackWidth) || 2.5,
        height: Number(rackHeight) || 4.0,
        depth: Number(rackDepth) || 1.2,
        rotationAngle: Number(rackRotation) || 0
      };
      setRacks([...racks, mockNew]);
    } finally {
      setShowAddModal(false);
      if (!fallbackUsed) load();
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      const payload = {
        rack_code: rackCode,
        zone: rackZone || null,
        max_weight: rackMaxWeight ? Number(rackMaxWeight) : 1000,
        x: rackX ? Number(rackX) : 0,
        y: rackY ? Number(rackY) : 0,
        z: rackZ ? Number(rackZ) : 0,
        width: rackWidth ? Number(rackWidth) : 2.5,
        height: rackHeight ? Number(rackHeight) : 4.0,
        depth: rackDepth ? Number(rackDepth) : 1.2,
        rotation_angle: rackRotation ? Number(rackRotation) : 0
      };
      await updateRackApi(selectedItem.id, payload);
    } catch (err) {
      console.warn("Update Rack API failed, falling back locally:", err);
      setRacks(racks.map(r => r.id === selectedItem.id ? {
        ...r,
        rackCode: rackCode,
        name: rackCode,
        zoneId: rackZone,
        maxWeight: Number(rackMaxWeight) || 1000,
        x: Number(rackX) || 0,
        y: Number(rackY) || 0,
        z: Number(rackZ) || 0,
        width: Number(rackWidth) || 2.5,
        height: Number(rackHeight) || 4.0,
        depth: Number(rackDepth) || 1.2,
        rotationAngle: Number(rackRotation) || 0
      } : r));
    } finally {
      setShowEditModal(false);
      setSelectedItem(null);
      if (!fallbackUsed) load();
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteRackApi(selectedItem.id);
    } catch (err) {
      console.warn("Delete Rack API failed, falling back locally:", err);
      setRacks(racks.filter(r => r.id !== selectedItem.id));
    } finally {
      setShowDeleteModal(false);
      setSelectedItem(null);
      if (!fallbackUsed) load();
    }
  };

  const filtered = racks.filter(r => 
    (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.rackCode || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Filter coordinates for details view
  const rackCoords = selectedRack
    ? coordinates.filter((c) => c.rack === selectedRack.id)
    : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-[#0071C1]" />
            Racks Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure layout rack rows, loading weights capacity limits, and slots counts.</p>
        </div>
        <Button 
          className="bg-[#0071C1] hover:bg-[#005c9e] text-white gap-2 font-bold px-4 py-2"
          onClick={openAdd}
        >
          <Plus className="w-4 h-4" />
          Add Rack
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border border-gray-100 shadow-xs">
        <div className="p-4 border-b border-gray-100 bg-slate-50/50">
          <SearchFilterBar 
            searchPlaceholder="Search racks by code..." 
            searchValue={searchQuery}
            onSearchChange={setSearchQuery} 
          />
        </div>

        {loading && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            Loading racks from API...
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
                <TableHead>Rack Code</TableHead>
                <TableHead>Parent Zone</TableHead>
                <TableHead>Load Weight (Current / Max)</TableHead>
                <TableHead>3D Coordinates (X, Y, Z)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">No racks found.</TableCell>
                </TableRow>
              ) : (
                pagedList.map((r) => (
                  <TableRow key={r.id} className="hover:bg-slate-50/10">
                    <TableCell className="font-bold text-gray-900 text-sm font-mono">{r.rackCode}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600">
                      {zones.find(z => z.id === r.zoneId)?.zone_name || r.zoneId || '—'}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700 font-mono">
                      {`${r.currentWeight}kg / ${r.maxWeight}kg`}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {`(${r.x}, ${r.y}, ${r.z})`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'Active' ? 'success' : 'outline'} className="text-[10px] uppercase font-bold">
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-gray-600" onClick={() => handleViewRack(r)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-blue-600" onClick={() => openEdit(r)}>
                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-red-600" onClick={() => openDelete(r)}>
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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
      {selectedRack && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6 text-xs font-semibold">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-[#0071C1]">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base font-mono">{selectedRack.rackCode}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{selectedRack.id}</p>
                  </div>
                </div>
                <Button className="text-gray-400 hover:text-gray-600 font-bold" onClick={() => setSelectedRack(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Max Weight capacity</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedRack.maxWeight} kg</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Current weight</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedRack.currentWeight} kg</div>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-2">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Grid Coordinates Offset</div>
                <div className="grid grid-cols-3 gap-2 font-mono text-center text-[10px]">
                  <div className="bg-slate-50 p-1.5 rounded">X: {selectedRack.x}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Y: {selectedRack.y}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Z: {selectedRack.z}</div>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-2">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Physical dimensions</div>
                <div className="grid grid-cols-4 gap-1.5 font-mono text-center text-[9px]">
                  <div className="bg-slate-50 p-1.5 rounded">W: {selectedRack.width}m</div>
                  <div className="bg-slate-50 p-1.5 rounded">H: {selectedRack.height}m</div>
                  <div className="bg-slate-50 p-1.5 rounded">D: {selectedRack.depth}m</div>
                  <div className="bg-slate-50 p-1.5 rounded">Rot: {selectedRack.rotationAngle}°</div>
                </div>
              </div>

              {/* Coordinates mappings */}
              {rackCoords.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-gray-900 uppercase tracking-widest text-[10px]">Rack Coordinates Allocation</h4>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white max-h-[160px] overflow-y-auto">
                    {rackCoords.map((coord) => (
                      <div key={coord.id} className="p-3 flex justify-between items-center hover:bg-slate-50/50">
                        <div>
                          <span className="font-bold text-slate-700">Level {coord.level} • Position {coord.position}</span>
                        </div>
                        <Badge variant="outline" className="font-mono text-[9px]">{`(${coord.x}, ${coord.y}, ${coord.z})`}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Parent Zone</div>
                <div className="font-bold text-slate-800 text-sm truncate">
                  {zones.find(z => z.id === selectedRack.zoneId)?.zone_name || selectedRack.zoneId || '—'}
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full justify-center mt-6 text-xs" onClick={() => setSelectedRack(null)}>
              Close Facility Overview
            </Button>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Create Storage Rack"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Create</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="block text-gray-700 mb-1">Rack Code *</label>
              <Input value={rackCode} onChange={(e) => setRackCode(e.target.value)} placeholder="e.g. RACK-A2-02" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">Parent Zone *</label>
                <select 
                  value={rackZone} 
                  onChange={(e) => setRackZone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.zone_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Max Weight (kg)</label>
                <Input type="number" value={rackMaxWeight} onChange={(e) => setRackMaxWeight(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">X Coord</label>
                <Input type="number" value={rackX} onChange={(e) => setRackX(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Y Coord</label>
                <Input type="number" value={rackY} onChange={(e) => setRackY(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Z Coord</label>
                <Input type="number" value={rackZ} onChange={(e) => setRackZ(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <div>
                <label className="block text-gray-700 mb-1">Width</label>
                <Input type="number" value={rackWidth} onChange={(e) => setRackWidth(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Height</label>
                <Input type="number" value={rackHeight} onChange={(e) => setRackHeight(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Depth</label>
                <Input type="number" value={rackDepth} onChange={(e) => setRackDepth(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Rotation (°)</label>
                <Input type="number" value={rackRotation} onChange={(e) => setRackRotation(e.target.value)} />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Rack Details"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleUpdate} className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Save Changes</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="block text-gray-700 mb-1">Rack Code *</label>
              <Input value={rackCode} onChange={(e) => setRackCode(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">Parent Zone *</label>
                <select 
                  value={rackZone} 
                  onChange={(e) => setRackZone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.zone_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Max Weight (kg)</label>
                <Input type="number" value={rackMaxWeight} onChange={(e) => setRackMaxWeight(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">X Coord</label>
                <Input type="number" value={rackX} onChange={(e) => setRackX(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Y Coord</label>
                <Input type="number" value={rackY} onChange={(e) => setRackY(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Z Coord</label>
                <Input type="number" value={rackZ} onChange={(e) => setRackZ(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <div>
                <label className="block text-gray-700 mb-1">Width</label>
                <Input type="number" value={rackWidth} onChange={(e) => setRackWidth(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Height</label>
                <Input type="number" value={rackHeight} onChange={(e) => setRackHeight(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Depth</label>
                <Input type="number" value={rackDepth} onChange={(e) => setRackDepth(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Rotation (°)</label>
                <Input type="number" value={rackRotation} onChange={(e) => setRackRotation(e.target.value)} />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Rack"
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
              Are you sure you want to delete storage rack <strong>{selectedItem?.rackCode}</strong>? This will release all localized shelf mapping slot coordinates.
            </p>
          </div>
        </Modal>
      )}

    </div>
  );
}

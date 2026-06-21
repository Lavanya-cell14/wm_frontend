import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Badge, Button, Card, CardContent, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Modal, Input } from 'shared-ui';
import { Layers, Plus, X, AlertTriangle, Loader2, Edit, Trash2 } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import { 
  getZones, 
  getZoneBoundaries, 
  getWarehouses, 
  getZoneGroups, 
  createZoneApi, 
  updateZoneApi, 
  deleteZoneApi 
} from '../../services/warehouseStructureService';

const normalizeContextZone = (z) => ({
  id: z.id,
  zone_name: z.name,
  zone_type: z.type,
  warehouse: z.warehouse,
  zone_group: null,
  x: z.x,
  y: z.y,
  z: z.z,
  width: z.width,
  height: z.height,
  depth: z.depth,
  _capacityPercent: z.capacityPercent,
  _status: z.status,
});

const normalizeApiZone = (z) => ({
  id: z.id,
  zone_name: z.zone_name,
  zone_type: z.zone_type,
  warehouse: z.warehouse,
  zone_group: z.zone_group || null,
  x: z.x != null ? Number(z.x) : null,
  y: z.y != null ? Number(z.y) : null,
  z: z.z != null ? Number(z.z) : null,
  width: z.width != null ? Number(z.width) : null,
  height: z.height != null ? Number(z.height) : null,
  depth: z.depth != null ? Number(z.depth) : null,
  _capacityPercent: z.predictive_occupancy != null ? Math.round(Number(z.predictive_occupancy) * 100) : 0,
  _status: 'N/A',
});

const shortId = (id) => {
  if (!id || id.length < 8) return id || '—';
  return `${id.slice(0, 8)}…`;
};

export default function ZoneList() {
  const { zones: contextZones } = useWarehouse();

  const [zones, setZones] = useState([]);
  const [boundaries, setBoundaries] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);
  const [zoneGroupsList, setZoneGroupsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals & form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form Fields
  const [zName, setZName] = useState('');
  const [zType, setZType] = useState('Ambient');
  const [zWarehouse, setZWarehouse] = useState('');
  const [zGroup, setZGroup] = useState('');
  const [zX, setZX] = useState('');
  const [zY, setZY] = useState('');
  const [zZ, setZZ] = useState('');
  const [zWidth, setZWidth] = useState('');
  const [zHeight, setZHeight] = useState('');
  const [zDepth, setZDepth] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const [zonesRes, boundariesRes, warehousesRes, zoneGroupsRes] = await Promise.all([
        getZones(),
        getZoneBoundaries(),
        getWarehouses(),
        getZoneGroups()
      ]);
      const apiZonesList = zonesRes.results.map(normalizeApiZone);
      setZones(apiZonesList.length > 0 ? apiZonesList : contextZones.map(normalizeContextZone));
      setBoundaries(boundariesRes.results || []);
      setWarehousesList(warehousesRes.results || []);
      setZoneGroupsList(zoneGroupsRes.results || []);
      setFallbackUsed(apiZonesList.length === 0);
    } catch (err) {
      console.error(err);
      setApiError('Zones API unreachable — showing cached data.');
      setZones(contextZones.map(normalizeContextZone));
      setBoundaries([]);
      setWarehousesList([]);
      setZoneGroupsList([]);
      setFallbackUsed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setZName('');
    setZType('Ambient');
    setZWarehouse(warehousesList[0]?.id || '');
    setZGroup(zoneGroupsList[0]?.id || '');
    setZX('0');
    setZY('0');
    setZZ('0');
    setZWidth('10');
    setZHeight('5');
    setZDepth('10');
    setShowAddModal(true);
  };

  const openEdit = (zone) => {
    setSelectedItem(zone);
    setZName(zone.zone_name || '');
    setZType(zone.zone_type || 'Ambient');
    setZWarehouse(zone.warehouse || '');
    setZGroup(zone.zone_group || '');
    setZX(zone.x != null ? String(zone.x) : '');
    setZY(zone.y != null ? String(zone.y) : '');
    setZZ(zone.z != null ? String(zone.z) : '');
    setZWidth(zone.width != null ? String(zone.width) : '');
    setZHeight(zone.height != null ? String(zone.height) : '');
    setZDepth(zone.depth != null ? String(zone.depth) : '');
    setShowEditModal(true);
  };

  const openDelete = (zone) => {
    setSelectedItem(zone);
    setShowDeleteModal(true);
  };

  const handleCreate = async () => {
    try {
      const payload = {
        zone_name: zName,
        zone_type: zType,
        warehouse: zWarehouse || null,
        zone_group: zGroup || null,
        x: zX ? Number(zX) : 0,
        y: zY ? Number(zY) : 0,
        z: zZ ? Number(zZ) : 0,
        width: zWidth ? Number(zWidth) : 0,
        height: zHeight ? Number(zHeight) : 0,
        depth: zDepth ? Number(zDepth) : 0,
      };
      await createZoneApi(payload);
    } catch (err) {
      console.warn("API Create Zone failed, falling back locally:", err);
      const mockNew = {
        id: `zone-${Date.now()}`,
        zone_name: zName,
        zone_type: zType,
        warehouse: zWarehouse,
        zone_group: zGroup || null,
        x: Number(zX) || 0,
        y: Number(zY) || 0,
        z: Number(zZ) || 0,
        width: Number(zWidth) || 0,
        height: Number(zHeight) || 0,
        depth: Number(zDepth) || 0,
        _capacityPercent: 0,
        _status: 'Active'
      };
      setZones([...zones, mockNew]);
    } finally {
      setShowAddModal(false);
      if (!fallbackUsed) load();
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      const payload = {
        zone_name: zName,
        zone_type: zType,
        warehouse: zWarehouse || null,
        zone_group: zGroup || null,
        x: zX ? Number(zX) : 0,
        y: zY ? Number(zY) : 0,
        z: zZ ? Number(zZ) : 0,
        width: zWidth ? Number(zWidth) : 0,
        height: zHeight ? Number(zHeight) : 0,
        depth: zDepth ? Number(zDepth) : 0,
      };
      await updateZoneApi(selectedItem.id, payload);
    } catch (err) {
      console.warn("API Update Zone failed, falling back locally:", err);
      setZones(zones.map(z => z.id === selectedItem.id ? {
        ...z,
        zone_name: zName,
        zone_type: zType,
        warehouse: zWarehouse,
        zone_group: zGroup || null,
        x: Number(zX) || 0,
        y: Number(zY) || 0,
        z: Number(zZ) || 0,
        width: Number(zWidth) || 0,
        height: Number(zHeight) || 0,
        depth: Number(zDepth) || 0
      } : z));
    } finally {
      setShowEditModal(false);
      setSelectedItem(null);
      if (!fallbackUsed) load();
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteZoneApi(selectedItem.id);
    } catch (err) {
      console.warn("API Delete Zone failed, falling back locally:", err);
      setZones(zones.filter(z => z.id !== selectedItem.id));
    } finally {
      setShowDeleteModal(false);
      setSelectedItem(null);
      if (!fallbackUsed) load();
    }
  };

  const filtered = zones.filter((z) =>
    (z.zone_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (z.zone_type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-[#0071C1]" />
            Zones Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure layout storage zones, visual boundaries and temperature constraints.
          </p>
        </div>
        <Button 
          className="bg-[#0071C1] hover:bg-[#005c9e] text-white gap-2 font-bold px-4 py-2"
          onClick={openAdd}
        >
          <Plus className="w-4 h-4" />
          Add Zone
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border border-gray-100 shadow-xs">
        <div className="p-4 border-b border-gray-100 bg-slate-50/50">
          <SearchFilterBar
            searchPlaceholder="Search zones by name or type..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {loading && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            Loading zones from API...
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
                <TableHead>Zone Name</TableHead>
                <TableHead>Zone Type</TableHead>
                <TableHead>Zone Group</TableHead>
                <TableHead>Spatial Dimensions</TableHead>
                <TableHead>Coordinates (X, Y, Z)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500 text-sm">
                    No zones found.
                  </TableCell>
                </TableRow>
              ) : (
                pagedList.map((z) => (
                  <TableRow key={z.id} className="hover:bg-slate-50/10">
                    <TableCell>
                      <div className="font-bold text-gray-900 text-sm">{z.zone_name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{z.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500">
                        {z.zone_type || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600 font-mono">
                      {z.zone_group ? shortId(z.zone_group) : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {z.width != null && z.height != null && z.depth != null
                        ? `${z.width}m × ${z.height}m × ${z.depth}m`
                        : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {z.x != null ? `(${z.x}, ${z.y}, ${z.z})` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-gray-600"
                          onClick={() => setSelectedZone(z)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-blue-600"
                          onClick={() => openEdit(z)}
                        >
                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-red-600"
                          onClick={() => openDelete(z)}
                        >
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

      {/* Detail Drawer */}
      {selectedZone && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6 text-xs font-semibold">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-[#0071C1]">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">{selectedZone.zone_name}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedZone.id}</p>
                  </div>
                </div>
                <Button className="text-gray-400 hover:text-gray-600 font-bold" onClick={() => setSelectedZone(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Zone Type</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedZone.zone_type || '—'}</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Zone Group ID</div>
                  <div className="font-bold text-slate-800 text-sm font-mono truncate" title={selectedZone.zone_group}>
                    {selectedZone.zone_group ? shortId(selectedZone.zone_group) : '—'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-2">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">3D Position Offsets</div>
                <div className="grid grid-cols-3 gap-2 font-mono text-center text-[10px]">
                  <div className="bg-slate-50 p-1.5 rounded">X: {selectedZone.x ?? '—'}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Y: {selectedZone.y ?? '—'}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Z: {selectedZone.z ?? '—'}</div>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-2">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Physical Dimensions</div>
                <div className="grid grid-cols-3 gap-2 font-mono text-center text-[10px]">
                  <div className="bg-slate-50 p-1.5 rounded">W: {selectedZone.width != null ? `${selectedZone.width}m` : '—'}</div>
                  <div className="bg-slate-50 p-1.5 rounded">H: {selectedZone.height != null ? `${selectedZone.height}m` : '—'}</div>
                  <div className="bg-slate-50 p-1.5 rounded">D: {selectedZone.depth != null ? `${selectedZone.depth}m` : '—'}</div>
                </div>
              </div>

              {selectedZone._capacityPercent != null && (
                <div className="p-3 bg-white border border-gray-100 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-2">Space Utilisation</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${selectedZone._capacityPercent > 80 ? 'bg-red-500' : 'bg-blue-600'}`}
                        style={{ width: `${selectedZone._capacityPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 shrink-0">
                      {selectedZone._capacityPercent}%
                    </span>
                  </div>
                </div>
              )}

              {/* Zone Boundary polygon points from API */}
              {(() => {
                const matchedBoundary = selectedZone
                  ? boundaries.find((b) => b.zone === selectedZone.id)
                  : null;
                if (!matchedBoundary) return null;
                return (
                  <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-2">
                    <div className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">
                      Visual Boundary Coordinates
                    </div>
                    {Array.isArray(matchedBoundary.polygon_points) && matchedBoundary.polygon_points.length > 0 ? (
                      <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                        {matchedBoundary.polygon_points.map((pt, idx) => (
                          <div key={idx} className="bg-slate-50 p-1.5 rounded text-center border border-gray-100">
                            Pt {idx + 1}: ({Number(pt.x).toFixed(1)}, {Number(pt.y).toFixed(1)})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-[11px]">No polygon points defined.</p>
                    )}
                  </div>
                );
              })()}

              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Parent Warehouse</div>
                <div className="font-bold text-slate-800 text-sm font-mono truncate" title={selectedZone.warehouse}>
                  {warehousesList.find(w => w.id === selectedZone.warehouse)?.warehouse_name || selectedZone.warehouse || '—'}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full justify-center mt-6 text-sm"
              onClick={() => setSelectedZone(null)}
            >
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
          title="Create New Storage Zone"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Create</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="block text-gray-700 mb-1">Zone Name *</label>
              <Input value={zName} onChange={(e) => setZName(e.target.value)} placeholder="e.g. Zone F Chilled" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">Zone Type</label>
                <select 
                  value={zType} 
                  onChange={(e) => setZType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                >
                  <option value="Ambient">Ambient</option>
                  <option value="Chilled">Chilled</option>
                  <option value="Frozen">Frozen</option>
                  <option value="Hazmat">Hazmat</option>
                  <option value="High-Value">High-Value</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Parent Warehouse *</label>
                <select 
                  value={zWarehouse} 
                  onChange={(e) => setZWarehouse(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                >
                  {warehousesList.map(w => (
                    <option key={w.id} value={w.id}>{w.warehouse_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Zone Group</label>
              <select 
                value={zGroup} 
                onChange={(e) => setZGroup(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
              >
                <option value="">No Group</option>
                {zoneGroupsList.map(zg => (
                  <option key={zg.id} value={zg.id}>{zg.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">X Offset</label>
                <Input type="number" value={zX} onChange={(e) => setZX(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Y Offset</label>
                <Input type="number" value={zY} onChange={(e) => setZY(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Z Offset</label>
                <Input type="number" value={zZ} onChange={(e) => setZZ(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">Width (m)</label>
                <Input type="number" value={zWidth} onChange={(e) => setZWidth(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Height (m)</label>
                <Input type="number" value={zHeight} onChange={(e) => setZHeight(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Depth (m)</label>
                <Input type="number" value={zDepth} onChange={(e) => setZDepth(e.target.value)} />
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
          title="Edit Zone Details"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleUpdate} className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Save Changes</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="block text-gray-700 mb-1">Zone Name *</label>
              <Input value={zName} onChange={(e) => setZName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">Zone Type</label>
                <select 
                  value={zType} 
                  onChange={(e) => setZType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                >
                  <option value="Ambient">Ambient</option>
                  <option value="Chilled">Chilled</option>
                  <option value="Frozen">Frozen</option>
                  <option value="Hazmat">Hazmat</option>
                  <option value="High-Value">High-Value</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Parent Warehouse *</label>
                <select 
                  value={zWarehouse} 
                  onChange={(e) => setZWarehouse(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                >
                  {warehousesList.map(w => (
                    <option key={w.id} value={w.id}>{w.name || w.warehouse_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Zone Group</label>
              <select 
                value={zGroup} 
                onChange={(e) => setZGroup(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
              >
                <option value="">No Group</option>
                {zoneGroupsList.map(zg => (
                  <option key={zg.id} value={zg.id}>{zg.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">X Offset</label>
                <Input type="number" value={zX} onChange={(e) => setZX(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Y Offset</label>
                <Input type="number" value={zY} onChange={(e) => setZY(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Z Offset</label>
                <Input type="number" value={zZ} onChange={(e) => setZZ(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">Width (m)</label>
                <Input type="number" value={zWidth} onChange={(e) => setZWidth(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Height (m)</label>
                <Input type="number" value={zHeight} onChange={(e) => setZHeight(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Depth (m)</label>
                <Input type="number" value={zDepth} onChange={(e) => setZDepth(e.target.value)} />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRM MODAL */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Zone"
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
              Are you sure you want to delete storage zone <strong>{selectedItem?.zone_name}</strong>? This will clear all structural references cascading to slots.
            </p>
          </div>
        </Modal>
      )}

    </div>
  );
}

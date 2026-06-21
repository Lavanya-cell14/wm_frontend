import React, { useState, useEffect } from 'react';
import { Badge, Button, Card, CardContent, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Modal, Input } from 'shared-ui';
import { Layers, Plus, X, AlertTriangle, Loader2, Edit, Trash2 } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import { 
  getZoneGroups, 
  getWarehouses,
  createZoneGroupApi, 
  updateZoneGroupApi, 
  deleteZoneGroupApi 
} from '../../services/warehouseStructureService';

const FALLBACK_ZONE_GROUPS = [
  {
    id: 'ZG-001',
    name: 'Zone Group Alpha',
    code: 'ZG-A',
    warehouse: 'Central Fulfillment A',
    description: 'Standard ambient inventory operations',
    zone_group_type: 'GENERAL_STORAGE',
  },
  {
    id: 'ZG-002',
    name: 'Zone Group Beta',
    code: 'ZG-B',
    warehouse: 'Central Fulfillment A',
    description: 'Temperature controlled storage for perishables and electronics',
    zone_group_type: 'COLD_STORAGE',
  },
];

export default function ZoneGroupList() {
  const [zoneGroups, setZoneGroups] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZg, setSelectedZg] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form Fields
  const [zgName, setZgName] = useState('');
  const [zgCode, setZgCode] = useState('');
  const [zgWarehouse, setZgWarehouse] = useState('');
  const [zgDescription, setZgDescription] = useState('');
  const [zgType, setZgType] = useState('GENERAL_STORAGE');

  const load = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const [zgRes, whRes] = await Promise.all([
        getZoneGroups(),
        getWarehouses()
      ]);
      setZoneGroups(zgRes.results.length > 0 ? zgRes.results : FALLBACK_ZONE_GROUPS);
      setWarehousesList(whRes.results || []);
      setFallbackUsed(zgRes.results.length === 0);
    } catch (err) {
      console.error(err);
      setApiError('Zone Groups API unreachable — showing cached data.');
      setZoneGroups(FALLBACK_ZONE_GROUPS);
      setWarehousesList([]);
      setFallbackUsed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setZgName('');
    setZgCode('');
    setZgWarehouse(warehousesList[0]?.id || '');
    setZgDescription('');
    setZgType('GENERAL_STORAGE');
    setShowAddModal(true);
  };

  const openEdit = (zg) => {
    setSelectedItem(zg);
    setZgName(zg.name || '');
    setZgCode(zg.code || '');
    setZgWarehouse(zg.warehouse || '');
    setZgDescription(zg.description || '');
    setZgType(zg.zone_group_type || 'GENERAL_STORAGE');
    setShowEditModal(true);
  };

  const openDelete = (zg) => {
    setSelectedItem(zg);
    setShowDeleteModal(true);
  };

  const handleCreate = async () => {
    try {
      const payload = {
        name: zgName,
        code: zgCode,
        warehouse: zgWarehouse || null,
        description: zgDescription,
        zone_group_type: zgType
      };
      await createZoneGroupApi(payload);
    } catch (err) {
      console.warn("Create Zone Group API failed, falling back locally:", err);
      const mockNew = {
        id: `zg-${Date.now()}`,
        name: zgName,
        code: zgCode,
        warehouse: warehousesList.find(w => w.id === zgWarehouse)?.warehouse_name || zgWarehouse,
        description: zgDescription,
        zone_group_type: zgType
      };
      setZoneGroups([...zoneGroups, mockNew]);
    } finally {
      setShowAddModal(false);
      if (!fallbackUsed) load();
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      const payload = {
        name: zgName,
        code: zgCode,
        warehouse: zgWarehouse || null,
        description: zgDescription,
        zone_group_type: zgType
      };
      await updateZoneGroupApi(selectedItem.id, payload);
    } catch (err) {
      console.warn("Update Zone Group API failed, falling back locally:", err);
      setZoneGroups(zoneGroups.map(z => z.id === selectedItem.id ? {
        ...z,
        name: zgName,
        code: zgCode,
        warehouse: warehousesList.find(w => w.id === zgWarehouse)?.warehouse_name || zgWarehouse,
        description: zgDescription,
        zone_group_type: zgType
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
      await deleteZoneGroupApi(selectedItem.id);
    } catch (err) {
      console.warn("Delete Zone Group API failed, falling back locally:", err);
      setZoneGroups(zoneGroups.filter(z => z.id !== selectedItem.id));
    } finally {
      setShowDeleteModal(false);
      setSelectedItem(null);
      if (!fallbackUsed) load();
    }
  };

  const filtered = zoneGroups.filter((zg) =>
    (zg.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (zg.zone_group_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (zg.code || '').toLowerCase().includes(searchQuery.toLowerCase())
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
            Zone Groups Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure high-level partitions and ambient controls grouping active zones.
          </p>
        </div>
        <Button 
          className="bg-[#0071C1] hover:bg-[#005c9e] text-white gap-2 font-bold px-4 py-2"
          onClick={openAdd}
        >
          <Plus className="w-4 h-4" />
          Add Zone Group
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border border-gray-100 shadow-xs">
        <div className="p-4 border-b border-gray-100 bg-slate-50/50">
          <SearchFilterBar
            searchPlaceholder="Search zone groups by name, code, or type..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {loading && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            Loading zone groups from API...
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
                <TableHead>Zone Group Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500 text-sm">
                    No zone groups found.
                  </TableCell>
                </TableRow>
              ) : (
                pagedList.map((zg) => (
                  <TableRow key={zg.id} className="hover:bg-slate-50/10">
                    <TableCell>
                      <div className="font-bold text-gray-900 text-sm">{zg.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{zg.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {zg.code || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="primary" className="text-[10px] uppercase font-bold">
                        {zg.zone_group_type || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs max-w-xs truncate" title={zg.description}>
                      {zg.description || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-gray-600"
                          onClick={() => setSelectedZg(zg)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-blue-600"
                          onClick={() => openEdit(zg)}
                        >
                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-red-600"
                          onClick={() => openDelete(zg)}
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
      {selectedZg && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6 text-xs font-semibold">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-[#0071C1]">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">{selectedZg.name}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedZg.id}</p>
                  </div>
                </div>
                <Button className="text-gray-400 hover:text-gray-600 font-bold" onClick={() => setSelectedZg(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Group Code</div>
                  <div className="font-bold text-slate-800 text-xs font-mono">{selectedZg.code || '—'}</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Group Type</div>
                  <div className="font-bold text-slate-800 text-xs">{selectedZg.zone_group_type || '—'}</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Parent Warehouse</div>
                <div className="font-bold text-slate-800 text-xs font-mono truncate" title={selectedZg.warehouse}>
                  {selectedZg.warehouse || '—'}
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-100 rounded-xl">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">
                  Operational Purpose Description
                </div>
                <p className="font-medium text-slate-700 leading-relaxed mt-1">
                  {selectedZg.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <Button variant="outline" className="w-full justify-center mt-6 text-sm" onClick={() => setSelectedZg(null)}>
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
          title="Create Zone Group"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Create</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="block text-gray-700 mb-1">Group Name *</label>
              <Input value={zgName} onChange={(e) => setZgName(e.target.value)} placeholder="e.g. Ambient Storage Area" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">Group Code *</label>
                <Input value={zgCode} onChange={(e) => setZgCode(e.target.value)} placeholder="e.g. AMB-01" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Group Type</label>
                <select 
                  value={zgType} 
                  onChange={(e) => setZgType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                >
                  <option value="GENERAL_STORAGE">GENERAL STORAGE</option>
                  <option value="COLD_STORAGE">COLD STORAGE</option>
                  <option value="HAZMAT">HAZMAT</option>
                  <option value="HIGH_VALUE">HIGH VALUE</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Parent Warehouse *</label>
              <select 
                value={zgWarehouse} 
                onChange={(e) => setZgWarehouse(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
              >
                {warehousesList.map(w => (
                  <option key={w.id} value={w.id}>{w.warehouse_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Description</label>
              <Input value={zgDescription} onChange={(e) => setZgDescription(e.target.value)} placeholder="e.g. Temp range 15 to 25 deg C" />
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Zone Group"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleUpdate} className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Save Changes</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="block text-gray-700 mb-1">Group Name *</label>
              <Input value={zgName} onChange={(e) => setZgName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">Group Code *</label>
                <Input value={zgCode} onChange={(e) => setZgCode(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Group Type</label>
                <select 
                  value={zgType} 
                  onChange={(e) => setZgType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                >
                  <option value="GENERAL_STORAGE">GENERAL STORAGE</option>
                  <option value="COLD_STORAGE">COLD STORAGE</option>
                  <option value="HAZMAT">HAZMAT</option>
                  <option value="HIGH_VALUE">HIGH VALUE</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Parent Warehouse *</label>
              <select 
                value={zgWarehouse} 
                onChange={(e) => setZgWarehouse(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
              >
                {warehousesList.map(w => (
                  <option key={w.id} value={w.id}>{w.warehouse_name || w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Description</label>
              <Input value={zgDescription} onChange={(e) => setZgDescription(e.target.value)} />
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Zone Group"
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
              Are you sure you want to delete zone group <strong>{selectedItem?.name}</strong>?
            </p>
          </div>
        </Modal>
      )}

    </div>
  );
}

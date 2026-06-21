import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Badge, Button, Card, CardContent, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Modal, Input } from 'shared-ui';
import { Activity, Plus, AlertTriangle, X, Loader2, Edit, Trash2 } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import { 
  getAisles, 
  getAisleById, 
  getZones,
  createAisleApi, 
  updateAisleApi, 
  patchAisleApi,
  deleteAisleApi 
} from '../../services/warehouseStructureService';

export default function AisleList() {
  const { zones: contextZones } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAisle, setSelectedAisle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [aisles, setAisles] = useState([]);
  const [zonesList, setZonesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form Fields
  const [aisleCode, setAisleCode] = useState('');
  const [aisleZone, setAisleZone] = useState('');
  const [aisleRacksCount, setAisleRacksCount] = useState('0');
  const [aisleIsBlocked, setAisleIsBlocked] = useState(false);
  const [aisleDetails, setAisleDetails] = useState('');

  // Mock backup data for fallback
  const localMockAisles = [
    { id: 'AIS-001', code: 'Aisle 1', zone: 'Zone A', racksCount: 3, status: 'Operational', details: 'Ambient corridor near dispatcher dock', _zoneId: '', _isBlocked: false },
    { id: 'AIS-002', code: 'Aisle 2', zone: 'Zone B', racksCount: 4, status: 'Operational', details: 'Electronics corridor near security center', _zoneId: '', _isBlocked: false },
    { id: 'AIS-003', code: 'Aisle 3', zone: 'Zone C', racksCount: 3, status: 'Blocked', details: 'Blocked due to AGV maintenance lane closing', _zoneId: '', _isBlocked: true },
    { id: 'AIS-004', code: 'Aisle 4', zone: 'Zone D', racksCount: 2, status: 'Operational', details: 'Cold storage loading corridor', _zoneId: '', _isBlocked: false }
  ];

  const normalizeApiAisle = (a) => ({
    id: a.id || a.aisle_id,
    code: a.aisle_code || a.code || `Aisle ${a.id?.slice(0, 4)}`,
    zone: a.zone_name || a.zone || 'Zone A',
    racksCount: Number(a.racks_count || a.racksCount || 0),
    status: a.is_blocked ? 'Blocked' : 'Operational',
    details: a.description || a.details || 'No additional notes',
    _zoneId: a.zone,
    _isBlocked: !!a.is_blocked
  });

  const load = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const [aisleRes, zonesRes] = await Promise.all([
        getAisles(),
        getZones()
      ]);
      setZonesList(zonesRes.results || []);
      
      const apiAisles = (aisleRes.results || []).map(a => {
        const normalized = normalizeApiAisle(a);
        if (normalized._zoneId) {
          const zoneObj = zonesRes.results.find(z => z.id === normalized._zoneId);
          if (zoneObj) {
            normalized.zone = zoneObj.zone_name;
          }
        }
        return normalized;
      });
      setAisles(apiAisles.length > 0 ? apiAisles : localMockAisles);
      setFallbackUsed(apiAisles.length === 0);
    } catch (err) {
      console.error(err);
      setApiError('Aisles API unreachable or optional route not implemented — showing cached data.');
      setAisles(localMockAisles);
      setZonesList(contextZones.map(z => ({ id: z.id, zone_name: z.name })));
      setFallbackUsed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleViewAisle = async (aisle) => {
    setSelectedAisle(aisle);
    try {
      const detail = await getAisleById(aisle.id);
      setSelectedAisle(normalizeApiAisle(detail));
    } catch (err) {
      console.warn("Could not fetch aisle detail, using list view state:", err);
    }
  };

  const openAdd = () => {
    setAisleCode('');
    setAisleZone(zonesList[0]?.id || '');
    setAisleRacksCount('0');
    setAisleIsBlocked(false);
    setAisleDetails('');
    setShowAddModal(true);
  };

  const openEdit = (aisle) => {
    setSelectedItem(aisle);
    setAisleCode(aisle.code || '');
    setAisleZone(aisle._zoneId || '');
    setAisleRacksCount(String(aisle.racksCount || '0'));
    setAisleIsBlocked(aisle._isBlocked);
    setAisleDetails(aisle.details || '');
    setShowEditModal(true);
  };

  const openDelete = (aisle) => {
    setSelectedItem(aisle);
    setShowDeleteModal(true);
  };

  const handleCreate = async () => {
    try {
      const payload = {
        aisle_code: aisleCode,
        zone: aisleZone || null,
        racks_count: aisleRacksCount ? Number(aisleRacksCount) : 0,
        is_blocked: aisleIsBlocked,
        description: aisleDetails
      };
      await createAisleApi(payload);
    } catch (err) {
      console.warn("Create Aisle API failed, falling back locally:", err);
      const mockNew = {
        id: `ais-${Date.now()}`,
        code: aisleCode,
        zone: zonesList.find(z => z.id === aisleZone)?.zone_name || 'Zone A',
        racksCount: Number(aisleRacksCount) || 0,
        status: aisleIsBlocked ? 'Blocked' : 'Operational',
        details: aisleDetails,
        _zoneId: aisleZone,
        _isBlocked: aisleIsBlocked
      };
      setAisles([...aisles, mockNew]);
    } finally {
      setShowAddModal(false);
      if (!fallbackUsed) load();
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      const payload = {
        aisle_code: aisleCode,
        zone: aisleZone || null,
        racks_count: aisleRacksCount ? Number(aisleRacksCount) : 0,
        is_blocked: aisleIsBlocked,
        description: aisleDetails
      };
      await updateAisleApi(selectedItem.id, payload);
    } catch (err) {
      console.warn("Update Aisle API failed, falling back locally:", err);
      setAisles(aisles.map(a => a.id === selectedItem.id ? {
        ...a,
        code: aisleCode,
        zone: zonesList.find(z => z.id === aisleZone)?.zone_name || 'Zone A',
        racksCount: Number(aisleRacksCount) || 0,
        status: aisleIsBlocked ? 'Blocked' : 'Operational',
        details: aisleDetails,
        _zoneId: aisleZone,
        _isBlocked: aisleIsBlocked
      } : a));
    } finally {
      setShowEditModal(false);
      setSelectedItem(null);
      if (!fallbackUsed) load();
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteAisleApi(selectedItem.id);
    } catch (err) {
      console.warn("Delete Aisle API failed, falling back locally:", err);
      setAisles(aisles.filter(a => a.id !== selectedItem.id));
    } finally {
      setShowDeleteModal(false);
      setSelectedItem(null);
      if (!fallbackUsed) load();
    }
  };

  const handleToggleBlock = async (aisle) => {
    try {
      const payload = { is_blocked: !aisle._isBlocked };
      await patchAisleApi(aisle.id, payload);
      if (!fallbackUsed) load();
    } catch (err) {
      console.warn("Toggle block state failed, updating locally:", err);
      setAisles(aisles.map(a => a.id === aisle.id ? {
        ...a,
        status: !aisle._isBlocked ? 'Blocked' : 'Operational',
        _isBlocked: !aisle._isBlocked
      } : a));
    }
  };

  const filtered = aisles.filter(a => 
    (a.code || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (a.zone || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#0071C1]" />
            Aisles Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure physical navigation corridors and path blocking flags.</p>
        </div>
        <Button 
          className="bg-[#0071C1] hover:bg-[#005c9e] text-white gap-2 font-bold px-4 py-2"
          onClick={openAdd}
        >
          <Plus className="w-4 h-4" />
          Add Aisle
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border border-gray-100 shadow-xs">
        <div className="p-4 border-b border-gray-100 bg-slate-50/50">
          <SearchFilterBar 
            searchPlaceholder="Search aisles by code or zone..." 
            searchValue={searchQuery}
            onSearchChange={setSearchQuery} 
          />
        </div>

        {loading && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            Loading aisles from API...
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
                <TableHead>Aisle Code</TableHead>
                <TableHead>Zone Location</TableHead>
                <TableHead>Connected Racks</TableHead>
                <TableHead>Path Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">No aisles matching criteria.</TableCell>
                </TableRow>
              ) : (
                pagedList.map((a) => (
                  <TableRow key={a.id} className="hover:bg-slate-50/10">
                    <TableCell>
                      <div className="font-bold text-gray-900 text-sm">{a.code}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{a.id}</div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600">{a.zone}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">{a.racksCount} Racks</TableCell>
                    <TableCell>
                      {a.status === 'Blocked' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Operational
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-gray-600" onClick={() => handleViewAisle(a)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-[#0071C1]" onClick={() => openEdit(a)}>
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`h-7 px-2.5 text-xs ${a.status === 'Blocked' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'}`}
                          onClick={() => handleToggleBlock(a)}
                        >
                          {a.status === 'Blocked' ? 'Unblock' : 'Block'}
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-red-600" onClick={() => openDelete(a)}>
                          <Trash2 className="w-3 h-3" />
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
      {selectedAisle && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6 text-xs font-semibold">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-[#0071C1]">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">{selectedAisle.code}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedAisle.id}</p>
                  </div>
                </div>
                <Button className="text-gray-400 hover:text-gray-600 font-bold" onClick={() => setSelectedAisle(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Associated Zone</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedAisle.zone}</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Pathing Status</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedAisle.status}</div>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-100 rounded-xl">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Transit Details & Congestion notes</div>
                <p className="font-medium text-slate-700 leading-relaxed mt-1">{selectedAisle.details}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-center mt-6 text-sm" onClick={() => setSelectedAisle(null)}>
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
          title="Create New Aisle Row"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Create</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="block text-gray-700 mb-1">Aisle Code *</label>
              <Input value={aisleCode} onChange={(e) => setAisleCode(e.target.value)} placeholder="e.g. Aisle A5" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">Zone Location *</label>
                <select 
                  value={aisleZone} 
                  onChange={(e) => setAisleZone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                >
                  {zonesList.map(z => (
                    <option key={z.id} value={z.id}>{z.zone_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Racks Count</label>
                <Input type="number" value={aisleRacksCount} onChange={(e) => setAisleRacksCount(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2 py-1">
              <input 
                type="checkbox" 
                id="isBlockedAdd" 
                checked={aisleIsBlocked}
                onChange={(e) => setAisleIsBlocked(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
              />
              <label htmlFor="isBlockedAdd" className="text-gray-700">Is Transit Blocked</label>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Aisle Details / Notes</label>
              <Input value={aisleDetails} onChange={(e) => setAisleDetails(e.target.value)} placeholder="Notes about physical access" />
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Aisle Details"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleUpdate} className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Save Changes</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="block text-gray-700 mb-1">Aisle Code *</label>
              <Input value={aisleCode} onChange={(e) => setAisleCode(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">Zone Location *</label>
                <select 
                  value={aisleZone} 
                  onChange={(e) => setAisleZone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                >
                  {zonesList.map(z => (
                    <option key={z.id} value={z.id}>{z.zone_name || z.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Racks Count</label>
                <Input type="number" value={aisleRacksCount} onChange={(e) => setAisleRacksCount(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2 py-1">
              <input 
                type="checkbox" 
                id="isBlockedEdit" 
                checked={aisleIsBlocked}
                onChange={(e) => setAisleIsBlocked(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
              />
              <label htmlFor="isBlockedEdit" className="text-gray-700">Is Transit Blocked</label>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Aisle Details / Notes</label>
              <Input value={aisleDetails} onChange={(e) => setAisleDetails(e.target.value)} />
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Aisle"
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
              Are you sure you want to delete aisle corridor <strong>{selectedItem?.code}</strong>?
            </p>
          </div>
        </Modal>
      )}

    </div>
  );
}

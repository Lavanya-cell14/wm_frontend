import React, { useState, useEffect } from 'react';
import { AlertBanner, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Modal, Pagination } from 'shared-ui';
import { Map, Plus, Edit2, Trash2 } from 'lucide-react';
import { getWarehousePaths, createWarehousePath, updateWarehousePath, deleteWarehousePath, getNavigationNodes, getWarehouses } from '../../services/warehouseStructureService';

const fallbackPaths = [
  { id: 'PATH-001', name: 'Receiving to Zone A Corridor', sequence: 'NODE-001 → NODE-002 → NODE-003', distance: 15.3, restrictions: 'All Personnel', status: 'Operational' },
  { id: 'PATH-002', name: 'AGV Expressway Line 1', sequence: 'NODE-001 → NODE-002 → NODE-004 → NODE-005', distance: 34.5, restrictions: 'AGV Only', status: 'Closed' },
  { id: 'PATH-003', name: 'Aisle 1 Core Transit Path', sequence: 'NODE-002 → NODE-003 → NODE-005', distance: 33.2, restrictions: 'Operator Only', status: 'Operational' }
];

export default function WalkingPaths() {
  const [paths, setPaths] = useState([]);
  const [nodesList, setNodesList] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);
  const [isFallbackActive, setIsFallbackActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPath, setEditingPath] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [sequence, setSequence] = useState('');
  const [distance, setDistance] = useState('');
  const [restrictions, setRestrictions] = useState('All Personnel');
  const [status, setStatus] = useState('Operational');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const normalizeApiPath = (p) => {
    const startX = Number(p.start_x) || 0;
    const startY = Number(p.start_y) || 0;
    const startZ = Number(p.start_z) || 0;
    const endX = Number(p.end_x) || 0;
    const endY = Number(p.end_y) || 0;
    const endZ = Number(p.end_z) || 0;
    const computedDistance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2 + (endZ - startZ) ** 2);
    
    return {
      id: p.id,
      name: p.path_name,
      sequence: `(${startX.toFixed(1)}, ${startY.toFixed(1)}, ${startZ.toFixed(1)}) → (${endX.toFixed(1)}, ${endY.toFixed(1)}, ${endZ.toFixed(1)})`,
      distance: Number(computedDistance.toFixed(1)),
      restrictions: 'N/A',
      status: 'N/A',
      raw: p
    };
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        console.warn("[WalkingPaths] Calling API: GET /api/warehouses/paths/");
        const [pathsRes, nodesRes, warehousesRes] = await Promise.all([
          getWarehousePaths(),
          getNavigationNodes(),
          getWarehouses()
        ]);
        if (active) {
          const apiPaths = pathsRes.results.map(normalizeApiPath);
          setPaths(apiPaths);
          setNodesList(nodesRes.results);
          setWarehousesList(warehousesRes.results);
          setIsFallbackActive(false);
          console.warn(`[WalkingPaths] API Success. URL: /api/warehouses/paths/, Status: 200, Count: ${apiPaths.length}, Fallback Used: false`);
        }
      } catch (err) {
        if (active) {
          const status = err.status || (err.code === 'NETWORK_ERROR' ? 0 : 'unknown');
          console.warn(`[WalkingPaths] API Failure. URL: /api/warehouses/paths/, Status: ${status}, Count: 0, Fallback Used: true`);
          setIsFallbackActive(true);
          setPaths(fallbackPaths);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const handleOpenAdd = () => {
    if (isFallbackActive) return;
    setEditingPath(null);
    setName('');
    setSequence('NODE-001 → NODE-002');
    setDistance('15.0');
    setRestrictions('All Personnel');
    setStatus('Operational');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (path) => {
    if (isFallbackActive) return;
    setEditingPath(path);
    setName(path.name);
    setSequence(path.sequence);
    setDistance(String(path.distance));
    setRestrictions(path.restrictions);
    setStatus(path.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (isFallbackActive) return;
    if (window.confirm(`Are you sure you want to delete path ${id}?`)) {
      try {
        await deleteWarehousePath(id);
        setPaths(paths.filter(p => p.id !== id));
        showToast(`Path deleted successfully.`);
      } catch (err) {
        showToast(`Failed to delete path: ${err.message || 'unknown error'}`);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isFallbackActive) return;
    if (!name || !sequence) return;

    const warehouseId = warehousesList[0]?.id;
    if (!warehouseId) {
      showToast("Cannot save: No warehouse configuration found.");
      return;
    }

    let start_x = 0, start_y = 0, start_z = 0;
    let end_x = 0, end_y = 0, end_z = 0;

    const tokens = sequence.split(/→|->/);
    const startToken = tokens[0]?.trim();
    const endToken = tokens[tokens.length - 1]?.trim();

    const startNode = nodesList.find(n => n.node_name === startToken || n.id === startToken);
    const endNode = nodesList.find(n => n.node_name === endToken || n.id === endToken);

    if (startNode) {
      start_x = Number(startNode.x) || 0;
      start_y = Number(startNode.y) || 0;
      start_z = Number(startNode.z) || 0;
    }
    if (endNode) {
      end_x = Number(endNode.x) || 0;
      end_y = Number(endNode.y) || 0;
      end_z = Number(endNode.z) || 0;
    }

    if (!startNode || !endNode) {
      const coordinates = sequence.match(/-?\d+(\.\d+)?/g);
      if (coordinates && coordinates.length >= 6) {
        if (!startNode) {
          start_x = Number(coordinates[0]) || 0;
          start_y = Number(coordinates[1]) || 0;
          start_z = Number(coordinates[2]) || 0;
        }
        if (!endNode) {
          end_x = Number(coordinates[3]) || 0;
          end_y = Number(coordinates[4]) || 0;
          end_z = Number(coordinates[5]) || 0;
        }
      }
    }

    const payload = {
      warehouse: warehouseId,
      path_name: name,
      start_x,
      start_y,
      start_z,
      end_x,
      end_y,
      end_z,
      width: 2.0,
      is_two_way: true
    };

    try {
      if (editingPath) {
        const updated = await updateWarehousePath(editingPath.id, payload);
        setPaths(paths.map(p => p.id === editingPath.id ? normalizeApiPath(updated) : p));
        showToast(`Path ${name} updated successfully.`);
      } else {
        const created = await createWarehousePath(payload);
        setPaths([...paths, normalizeApiPath(created)]);
        showToast(`Path ${name} created successfully.`);
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast(`Failed to save path: ${err.message || 'unknown error'}`);
    }
  };

  const filteredPaths = paths.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sequence.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPaths.length / pageSize);
  const paginatedPaths = filteredPaths.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0071C1]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {isFallbackActive && (
        <AlertBanner 
          type="critical" 
          message="Backend unavailable — editing disabled in fallback mode." 
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Map className="w-7 h-7 text-[#0071C1]" />
            Walking Paths Setup
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Design full path layouts, assign node routing networks, and apply access restriction filters.
          </p>
        </div>
        <Button 
          className="gap-2 font-semibold" 
          onClick={handleOpenAdd}
          disabled={isFallbackActive}
        >
          <Plus className="w-4 h-4" />
          Map Walking Path
        </Button>
      </div>

      {/* Search */}
      <div className="space-y-3">
        <SearchFilterBar 
          searchPlaceholder="Search paths by name, node IDs sequence, or restriction type..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Table */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-slate-50/50 flex flex-row justify-between items-center pb-4">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Paths Configuration Ledger</CardTitle>
            <CardDescription>Logical paths sequence chains utilized to calculate turn-by-turn navigation.</CardDescription>
          </div>
          <Badge variant="primary">{filteredPaths.length} Paths Configured</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Path ID</TableHead>
                <TableHead>Path Name</TableHead>
                <TableHead>Segment Nodes Sequence</TableHead>
                <TableHead>Distance (m)</TableHead>
                <TableHead>Access Restriction</TableHead>
                <TableHead>Path Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPaths.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500 text-sm font-medium">
                    No mapped walking paths recorded.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPaths.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/20 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-gray-900">{p.id}</TableCell>
                    <TableCell className="font-semibold text-gray-800 text-xs">{p.name}</TableCell>
                    <TableCell className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100 w-fit">{p.sequence}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600 font-bold">{p.distance} m</TableCell>
                    <TableCell className="text-xs text-slate-500 font-semibold">{p.restrictions}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'Operational' ? 'success' : p.status === 'Closed' ? 'error' : 'secondary'}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1.5 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] h-7 px-2 font-medium"
                          onClick={() => handleOpenEdit(p)}
                          disabled={isFallbackActive}
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] h-7 px-2 font-medium text-red-600 border-red-100 hover:bg-red-50"
                          onClick={() => handleDelete(p.id)}
                          disabled={isFallbackActive}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredPaths.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Creation/Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPath ? `Edit Walking Path: ${editingPath.id}` : 'Create Walking Path'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-gray-700">
            <div className="space-y-1">
              <label className="text-gray-500 uppercase block text-[10px]">Path Name</label>
              <Input 
                type="text"
                placeholder="e.g. Dock A to Zone B Expressway"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 uppercase block text-[10px]">Segment Nodes Sequence Sequence (→ separator)</label>
              <Input 
                type="text"
                placeholder="e.g. NODE-001 → NODE-002 → NODE-005"
                value={sequence}
                onChange={(e) => setSequence(e.target.value)}
                className="w-full border border-gray-200 p-2.5 rounded-xl font-mono outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 uppercase block text-[10px]">Total Distance (m)</label>
              <Input 
                type="number"
                step="0.1"
                placeholder="e.g. 45.8"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-gray-500 uppercase block text-[10px]">Access Restrictions</label>
                <select 
                  value={restrictions} 
                  onChange={(e) => setRestrictions(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl bg-white"
                >
                  <option value="All Personnel">No Restrictions (All)</option>
                  <option value="Operator Only">Fulfillment Operators Only</option>
                  <option value="AGV Only">AGV Automation Fleet Only</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-gray-500 uppercase block text-[10px]">Path Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl bg-white"
                >
                  <option value="Operational">Operational / Active</option>
                  <option value="Closed">Closed / Under Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPath ? 'Save Path' : 'Create Path'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

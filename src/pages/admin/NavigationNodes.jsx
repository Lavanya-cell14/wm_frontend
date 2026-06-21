import React, { useState, useEffect } from 'react';
import { AlertBanner, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Modal, Pagination } from 'shared-ui';
import { Navigation, Plus, Edit2, Trash2 } from 'lucide-react';
import { getNavigationNodes, createNavigationNode, updateNavigationNode, deleteNavigationNode, getWarehouses } from '../../services/warehouseStructureService';

const fallbackNodes = [
  { id: 'NODE-001', label: 'Receiving Dock A', x: 2.5, y: 0.0, z: 0.0, type: 'Dock', status: 'Active' },
  { id: 'NODE-002', label: 'Aisle 1 Entry corridor', x: 12.0, y: 0.0, z: 1.5, type: 'Intersection', status: 'Active' },
  { id: 'NODE-003', label: 'Aisle 1 Bin Row A1-4', x: 12.0, y: 2.4, z: 1.5, type: 'Storage Point', status: 'Active' },
  { id: 'NODE-004', label: 'Aisle 2 Entry corridor', x: 24.0, y: 0.0, z: 1.5, type: 'Intersection', status: 'Blocked' },
  { id: 'NODE-005', label: 'Shipping Dock B', x: 38.0, y: 0.0, z: 0.0, type: 'Dock', status: 'Active' }
];

const normalizeApiNode = (node) => ({
  id: node.id,
  label: node.node_name,
  x: Number(node.x) || 0,
  y: Number(node.y) || 0,
  z: Number(node.z) || 0,
  type: node.node_type === 'DOCK' ? 'Dock' : node.node_type === 'INTERSECTION' ? 'Intersection' : 'Storage Point',
  status: 'N/A',
  connections: node.connections || []
});

export default function NavigationNodes() {
  const [nodes, setNodes] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);
  const [isFallbackActive, setIsFallbackActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState(null);

  // Form states
  const [label, setLabel] = useState('');
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [z, setZ] = useState('');
  const [type, setType] = useState('Dock');
  const [status, setStatus] = useState('Active');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        console.warn("[NavigationNodes] Calling API: GET /api/warehouses/navigation-nodes/");
        const [nodesRes, warehousesRes] = await Promise.all([
          getNavigationNodes(),
          getWarehouses()
        ]);
        if (active) {
          const apiNodes = nodesRes.results.map(normalizeApiNode);
          setNodes(apiNodes);
          setWarehousesList(warehousesRes.results);
          setIsFallbackActive(false);
          console.warn(`[NavigationNodes] API Success. URL: /api/warehouses/navigation-nodes/, Status: 200, Count: ${apiNodes.length}, Fallback Used: false`);
        }
      } catch (err) {
        if (active) {
          const status = err.status || (err.code === 'NETWORK_ERROR' ? 0 : 'unknown');
          console.warn(`[NavigationNodes] API Failure. URL: /api/warehouses/navigation-nodes/, Status: ${status}, Count: 0, Fallback Used: true`);
          setIsFallbackActive(true);
          setNodes(fallbackNodes);
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
    setEditingNode(null);
    setLabel('');
    setX('0.0');
    setY('0.0');
    setZ('0.0');
    setType('Dock');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (node) => {
    if (isFallbackActive) return;
    setEditingNode(node);
    setLabel(node.label);
    setX(String(node.x));
    setY(String(node.y));
    setZ(String(node.z));
    setType(node.type);
    setStatus(node.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (isFallbackActive) return;
    if (window.confirm(`Are you sure you want to delete node ${id}?`)) {
      try {
        await deleteNavigationNode(id);
        setNodes(nodes.filter(n => n.id !== id));
        showToast(`Node deleted successfully.`);
      } catch (err) {
        showToast(`Failed to delete node: ${err.message || 'unknown error'}`);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isFallbackActive) return;
    if (!label) return;

    const nodeTypeMap = {
      'Dock': 'DOCK',
      'Intersection': 'INTERSECTION',
      'Storage Point': 'PICK_POINT'
    };
    const mappedType = nodeTypeMap[type] || 'PICK_POINT';
    const warehouseId = warehousesList[0]?.id;

    if (!warehouseId) {
      showToast("Cannot save: No warehouse configuration found.");
      return;
    }

    const payload = {
      warehouse: warehouseId,
      node_name: label,
      node_type: mappedType,
      x: Number(x) || 0,
      y: Number(y) || 0,
      z: Number(z) || 0,
      connections: editingNode ? editingNode.connections : []
    };

    try {
      if (editingNode) {
        const updated = await updateNavigationNode(editingNode.id, payload);
        setNodes(nodes.map(n => n.id === editingNode.id ? normalizeApiNode(updated) : n));
        showToast(`Node ${label} updated successfully.`);
      } else {
        const created = await createNavigationNode(payload);
        setNodes([...nodes, normalizeApiNode(created)]);
        showToast(`Node ${label} created successfully.`);
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast(`Failed to save node: ${err.message || 'unknown error'}`);
    }
  };

  const filteredNodes = nodes.filter(n => 
    n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNodes.length / pageSize);
  const paginatedNodes = filteredNodes.slice((currentPage - 1) * pageSize, currentPage * pageSize);


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
            <Navigation className="w-7 h-7 text-[#0071C1]" />
            Navigation Nodes Setup
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure discrete floor intersection waypoints, storage lanes, and coordinate reference tags.
          </p>
        </div>
        <Button 
          className="gap-2 font-semibold" 
          onClick={handleOpenAdd}
          disabled={isFallbackActive}
        >
          <Plus className="w-4 h-4" />
          Create Node
        </Button>
      </div>

      {/* Search */}
      <div className="space-y-3">
        <SearchFilterBar 
          searchPlaceholder="Search waypoints by name, ID, or category type..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* List Table */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-slate-50/50 flex flex-row justify-between items-center pb-4">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Physical Waypoints ledger</CardTitle>
            <CardDescription>Grid coordinate positions map points used by automated vehicle pathfinding models.</CardDescription>
          </div>
          <Badge variant="primary">{filteredNodes.length} Nodes Registered</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Node ID</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Coordinates (X, Y, Z)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedNodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500 text-sm font-medium">
                    No waypoints registered.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedNodes.map((n) => (
                  <TableRow key={n.id} className="hover:bg-slate-50/20 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-gray-900">{n.id}</TableCell>
                    <TableCell className="font-semibold text-gray-800 text-xs">{n.label}</TableCell>
                    <TableCell className="text-xs text-gray-500 font-semibold">{n.type}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-600 font-semibold">
                      ({n.x.toFixed(1)}, {n.y.toFixed(1)}, {n.z.toFixed(1)})
                    </TableCell>
                    <TableCell>
                      <Badge variant={n.status === 'Active' ? 'success' : n.status === 'Blocked' ? 'error' : 'secondary'}>
                        {n.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1.5 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] h-7 px-2 font-medium"
                          onClick={() => handleOpenEdit(n)}
                          disabled={isFallbackActive}
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] h-7 px-2 font-medium text-red-600 border-red-100 hover:bg-red-50"
                          onClick={() => handleDelete(n.id)}
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
              totalItems={filteredNodes.length}
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
          title={editingNode ? `Edit Waypoint Node: ${editingNode.id}` : 'Create Waypoint Node'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-gray-700">
            <div className="space-y-1">
              <label className="text-gray-500 uppercase block text-[10px]">Node Designation Label</label>
              <Input 
                type="text"
                placeholder="e.g. Aisle 4 Intersection"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-gray-500 uppercase block text-[10px]">X Coordinate (m)</label>
                <Input 
                  type="number"
                  step="0.1"
                  value={x}
                  onChange={(e) => setX(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-500 uppercase block text-[10px]">Y Coordinate (m)</label>
                <Input 
                  type="number"
                  step="0.1"
                  value={y}
                  onChange={(e) => setY(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-500 uppercase block text-[10px]">Z Coordinate (m)</label>
                <Input 
                  type="number"
                  step="0.1"
                  value={z}
                  onChange={(e) => setZ(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-gray-500 uppercase block text-[10px]">Waypoint Type</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl bg-white"
                >
                  <option value="Dock">Receiving/Shipping Dock</option>
                  <option value="Intersection">Lane Intersection</option>
                  <option value="Storage Point">Storage Row Lane</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-gray-500 uppercase block text-[10px]">Waypoint Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl bg-white"
                >
                  <option value="Active">Active / Open</option>
                  <option value="Blocked">Blocked / Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingNode ? 'Save Waypoint' : 'Create Node'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}


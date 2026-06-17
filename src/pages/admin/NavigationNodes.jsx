import React, { useState } from 'react';
import { AlertBanner, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { Navigation, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';

export default function NavigationNodes() {
  const [nodes, setNodes] = useState([
    { id: 'NODE-001', label: 'Receiving Dock A', x: 2.5, y: 0.0, z: 0.0, type: 'Dock', status: 'Active' },
    { id: 'NODE-002', label: 'Aisle 1 Entry corridor', x: 12.0, y: 0.0, z: 1.5, type: 'Intersection', status: 'Active' },
    { id: 'NODE-003', label: 'Aisle 1 Bin Row A1-4', x: 12.0, y: 2.4, z: 1.5, type: 'Storage Point', status: 'Active' },
    { id: 'NODE-004', label: 'Aisle 2 Entry corridor', x: 24.0, y: 0.0, z: 1.5, type: 'Intersection', status: 'Blocked' },
    { id: 'NODE-005', label: 'Shipping Dock B', x: 38.0, y: 0.0, z: 0.0, type: 'Dock', status: 'Active' }
  ]);

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

  const handleOpenAdd = () => {
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
    setEditingNode(node);
    setLabel(node.label);
    setX(String(node.x));
    setY(String(node.y));
    setZ(String(node.z));
    setType(node.type);
    setStatus(node.status);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete node ${id}?`)) {
      setNodes(nodes.filter(n => n.id !== id));
      showToast(`Node ${id} deleted successfully.`);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!label) return;

    if (editingNode) {
      // Edit mode
      setNodes(nodes.map(n => n.id === editingNode.id ? {
        ...n,
        label,
        x: Number(x) || 0,
        y: Number(y) || 0,
        z: Number(z) || 0,
        type,
        status
      } : n));
      showToast(`Node ${editingNode.id} updated successfully.`);
    } else {
      // Add mode
      const newId = `NODE-${String(nodes.length + 1).padStart(3, '0')}`;
      setNodes([...nodes, {
        id: newId,
        label,
        x: Number(x) || 0,
        y: Number(y) || 0,
        z: Number(z) || 0,
        type,
        status
      }]);
      showToast(`Node ${newId} created successfully.`);
    }
    setIsModalOpen(false);
  };

  const filteredNodes = nodes.filter(n => 
    n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNodes.length / pageSize);
  const paginatedNodes = filteredNodes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
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
        <Button className="gap-2 font-semibold" onClick={handleOpenAdd}>
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
                      <Badge variant={n.status === 'Active' ? 'success' : 'error'}>
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
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] h-7 px-2 font-medium text-red-600 border-red-100 hover:bg-red-50"
                          onClick={() => handleDelete(n.id)}
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

import React, { useState } from 'react';
import { AlertBanner, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { Map, Plus, Edit2, Trash2 } from 'lucide-react';

export default function WalkingPaths() {
  const [paths, setPaths] = useState([
    { id: 'PATH-001', name: 'Receiving to Zone A Corridor', sequence: 'NODE-001 → NODE-002 → NODE-003', distance: 15.3, restrictions: 'All Personnel', status: 'Operational' },
    { id: 'PATH-002', name: 'AGV Expressway Line 1', sequence: 'NODE-001 → NODE-002 → NODE-004 → NODE-005', distance: 34.5, restrictions: 'AGV Only', status: 'Closed' },
    { id: 'PATH-003', name: 'Aisle 1 Core Transit Path', sequence: 'NODE-002 → NODE-003 → NODE-005', distance: 33.2, restrictions: 'Operator Only', status: 'Operational' }
  ]);

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

  const handleOpenAdd = () => {
    setEditingPath(null);
    setName('');
    setSequence('NODE-001 → NODE-002');
    setDistance('15.0');
    setRestrictions('All Personnel');
    setStatus('Operational');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (path) => {
    setEditingPath(path);
    setName(path.name);
    setSequence(path.sequence);
    setDistance(String(path.distance));
    setRestrictions(path.restrictions);
    setStatus(path.status);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete path ${id}?`)) {
      setPaths(paths.filter(p => p.id !== id));
      showToast(`Path ${id} deleted successfully.`);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name || !sequence || !distance) return;

    if (editingPath) {
      setPaths(paths.map(p => p.id === editingPath.id ? {
        ...p,
        name,
        sequence,
        distance: Number(distance) || 0,
        restrictions,
        status
      } : p));
      showToast(`Path ${editingPath.id} updated successfully.`);
    } else {
      const newId = `PATH-${String(paths.length + 1).padStart(3, '0')}`;
      setPaths([...paths, {
        id: newId,
        name,
        sequence,
        distance: Number(distance) || 0,
        restrictions,
        status
      }]);
      showToast(`Path ${newId} created successfully.`);
    }
    setIsModalOpen(false);
  };

  const filteredPaths = paths.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sequence.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPaths.length / pageSize);
  const paginatedPaths = filteredPaths.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
            <Map className="w-7 h-7 text-[#0071C1]" />
            Walking Paths Setup
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Design full path layouts, assign node routing networks, and apply access restriction filters.
          </p>
        </div>
        <Button className="gap-2 font-semibold" onClick={handleOpenAdd}>
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
                      <Badge variant={p.status === 'Operational' ? 'success' : 'error'}>
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
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] h-7 px-2 font-medium text-red-600 border-red-100 hover:bg-red-50"
                          onClick={() => handleDelete(p.id)}
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

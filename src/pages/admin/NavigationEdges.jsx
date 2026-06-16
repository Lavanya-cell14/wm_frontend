import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Badge, 
  Button, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  SearchFilterBar,
  AlertBanner
} from 'shared-ui';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { Activity, Plus, Edit2, Trash2 } from 'lucide-react';

export default function NavigationEdges() {
  const [edges, setEdges] = useState([
    { id: 'EDGE-001', source: 'NODE-001', target: 'NODE-002', distance: 10.5, direction: 'Bidirectional', status: 'Clear' },
    { id: 'EDGE-002', source: 'NODE-002', target: 'NODE-003', distance: 4.8, direction: 'Bidirectional', status: 'Clear' },
    { id: 'EDGE-003', source: 'NODE-002', target: 'NODE-004', distance: 12.0, direction: 'One-way', status: 'Under Maintenance' },
    { id: 'EDGE-004', source: 'NODE-003', target: 'NODE-005', distance: 28.4, direction: 'Bidirectional', status: 'Congested' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEdge, setEditingEdge] = useState(null);

  // Form states
  const [source, setSource] = useState('NODE-001');
  const [target, setTarget] = useState('NODE-002');
  const [distance, setDistance] = useState('');
  const [direction, setDirection] = useState('Bidirectional');
  const [status, setStatus] = useState('Clear');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenAdd = () => {
    setEditingEdge(null);
    setSource('NODE-001');
    setTarget('NODE-002');
    setDistance('10.0');
    setDirection('Bidirectional');
    setStatus('Clear');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (edge) => {
    setEditingEdge(edge);
    setSource(edge.source);
    setTarget(edge.target);
    setDistance(String(edge.distance));
    setDirection(edge.direction);
    setStatus(edge.status);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete edge ${id}?`)) {
      setEdges(edges.filter(e => e.id !== id));
      showToast(`Edge ${id} deleted successfully.`);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!source || !target || !distance) return;

    if (editingEdge) {
      setEdges(edges.map(e => e.id === editingEdge.id ? {
        ...e,
        source,
        target,
        distance: Number(distance) || 0,
        direction,
        status
      } : e));
      showToast(`Edge ${editingEdge.id} updated successfully.`);
    } else {
      const newId = `EDGE-${String(edges.length + 1).padStart(3, '0')}`;
      setEdges([...edges, {
        id: newId,
        source,
        target,
        distance: Number(distance) || 0,
        direction,
        status
      }]);
      showToast(`Edge ${newId} created successfully.`);
    }
    setIsModalOpen(false);
  };

  const filteredEdges = edges.filter(e => 
    e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.target.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEdges.length / pageSize);
  const paginatedEdges = filteredEdges.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
            <Activity className="w-7 h-7 text-[#0071C1]" />
            Navigation Edges Setup
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Build point-to-point connections, configure segment path limits, and specify traffic capacities.
          </p>
        </div>
        <Button className="gap-2 font-semibold" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" />
          Link Edges
        </Button>
      </div>

      {/* Search */}
      <div className="space-y-3">
        <SearchFilterBar 
          searchPlaceholder="Search linked corridors by ID, source, or destination..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Table */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-slate-50/50 flex flex-row justify-between items-center pb-4">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Segments Linking Ledger</CardTitle>
            <CardDescription>Corridor distances and directional flow controls utilized by mapping solvers.</CardDescription>
          </div>
          <Badge variant="primary">{filteredEdges.length} Edges Active</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Edge ID</TableHead>
                <TableHead>Source Node</TableHead>
                <TableHead>Target Node</TableHead>
                <TableHead>Distance (m)</TableHead>
                <TableHead>Direction Type</TableHead>
                <TableHead>Transit Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEdges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500 text-sm font-medium">
                    No linked pathing edges recorded.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEdges.map((e) => (
                  <TableRow key={e.id} className="hover:bg-slate-50/20 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-gray-900">{e.id}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-700 font-semibold">{e.source}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-700 font-semibold">{e.target}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600 font-bold">{e.distance} m</TableCell>
                    <TableCell className="text-xs font-medium text-slate-500">{e.direction}</TableCell>
                    <TableCell>
                      <Badge variant={e.status === 'Clear' ? 'success' : e.status === 'Congested' ? 'warning' : 'error'}>
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1.5 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] h-7 px-2 font-medium"
                          onClick={() => handleOpenEdit(e)}
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] h-7 px-2 font-medium text-red-600 border-red-100 hover:bg-red-50"
                          onClick={() => handleDelete(e.id)}
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
              totalItems={filteredEdges.length}
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
          title={editingEdge ? `Edit Path Link: ${editingEdge.id}` : 'Create Path Link'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-gray-700">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-gray-500 uppercase block text-[10px]">Source Waypoint ID</label>
                <input 
                  type="text"
                  placeholder="e.g. NODE-001"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-500 uppercase block text-[10px]">Target Waypoint ID</label>
                <input 
                  type="text"
                  placeholder="e.g. NODE-002"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 uppercase block text-[10px]">Edge Weight Distance (m)</label>
              <input 
                type="number"
                step="0.1"
                placeholder="e.g. 15.6"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-gray-500 uppercase block text-[10px]">Direction Mode</label>
                <select 
                  value={direction} 
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl bg-white"
                >
                  <option value="Bidirectional">Two-Way Traffic</option>
                  <option value="One-way">One-Way Restriction</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-gray-500 uppercase block text-[10px]">Transit Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl bg-white"
                >
                  <option value="Clear">Clear / Open</option>
                  <option value="Congested">Congested Lane</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingEdge ? 'Save Link' : 'Link Nodes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

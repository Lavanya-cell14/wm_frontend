import React, { useState, useEffect } from 'react';
import { AlertBanner, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Modal, Pagination } from 'shared-ui';
import { Activity, Plus, Edit2, Trash2 } from 'lucide-react';
import { getNavigationNodes, updateNavigationNode } from '../../services/warehouseStructureService';

const fallbackEdges = [
  { id: 'edge-NODE-001-NODE-002', source: 'Receiving Dock A', sourceId: 'NODE-001', target: 'Aisle 1 Entry corridor', targetId: 'NODE-002', distance: 10.5, direction: 'Bidirectional', status: 'Clear' },
  { id: 'edge-NODE-002-NODE-003', source: 'Aisle 1 Entry corridor', sourceId: 'NODE-002', target: 'Aisle 1 Bin Row A1-4', targetId: 'NODE-003', distance: 4.8, direction: 'Bidirectional', status: 'Clear' },
  { id: 'edge-NODE-002-NODE-004', source: 'Aisle 1 Entry corridor', sourceId: 'NODE-002', target: 'Aisle 2 Entry corridor', targetId: 'NODE-004', distance: 12.0, direction: 'One-way', status: 'Under Maintenance' },
  { id: 'edge-NODE-003-NODE-005', source: 'Aisle 1 Bin Row A1-4', sourceId: 'NODE-003', target: 'Shipping Dock B', targetId: 'NODE-005', distance: 28.4, direction: 'Bidirectional', status: 'Congested' }
];

export default function NavigationEdges() {
  const [edges, setEdges] = useState([]);
  const [rawNodes, setRawNodes] = useState([]);
  const [isFallbackActive, setIsFallbackActive] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const parseEdges = (nodes) => {
    const nodesMap = {};
    nodes.forEach(node => {
      nodesMap[node.id] = node;
    });

    const parsedEdges = [];
    const seenEdgeKeys = new Set();

    nodes.forEach(node => {
      const fromId = node.id;
      const fromName = node.node_name;
      (node.connections || []).forEach(conn => {
        let toId, weight;
        if (typeof conn === 'object' && conn !== null) {
          toId = conn.node_id;
          weight = conn.weight;
        } else {
          toId = String(conn);
          weight = null;
        }

        const targetNode = nodesMap[toId];
        const toName = targetNode ? targetNode.node_name : toId;

        // Determine if target also links back to source
        const targetNodeConns = targetNode?.connections || [];
        const linksBack = targetNodeConns.some(tc => {
          const tcId = (typeof tc === 'object' && tc !== null) ? tc.node_id : String(tc);
          return tcId === fromId;
        });

        const isBidirectional = linksBack;
        const edgeKey = isBidirectional 
          ? [fromId, toId].sort().join('-') 
          : `${fromId}-${toId}`;

        if (!seenEdgeKeys.has(edgeKey)) {
          seenEdgeKeys.add(edgeKey);
          
          let distanceVal = weight;
          if (distanceVal == null) {
            if (targetNode) {
              distanceVal = Math.sqrt(
                (Number(node.x) - Number(targetNode.x))**2 +
                (Number(node.y) - Number(targetNode.y))**2 +
                (Number(node.z) - Number(targetNode.z))**2
              );
            } else {
              distanceVal = 0.0;
            }
          }

          parsedEdges.push({
            id: `edge-${fromId}-${toId}`,
            source: fromName,
            sourceId: fromId,
            target: toName,
            targetId: toId,
            distance: Number(Number(distanceVal).toFixed(1)),
            direction: isBidirectional ? 'Bidirectional' : 'One-way',
            status: 'N/A'
          });
        }
      });
    });

    return parsedEdges;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.warn("[NavigationEdges] Calling API: GET /api/warehouses/navigation-nodes/");
      const nodesRes = await getNavigationNodes();
      const nodes = nodesRes.results;
      setRawNodes(nodes);
      const parsed = parseEdges(nodes);
      setEdges(parsed);
      setIsFallbackActive(false);
      console.warn(`[NavigationEdges] API Success. URL: /api/warehouses/navigation-nodes/, Status: 200, Count: ${parsed.length}, Fallback Used: false`);
    } catch (err) {
      const status = err.status || (err.code === 'NETWORK_ERROR' ? 0 : 'unknown');
      console.warn(`[NavigationEdges] API Failure. URL: /api/warehouses/navigation-nodes/, Status: ${status}, Count: 0, Fallback Used: true`);
      setIsFallbackActive(true);
      setEdges(fallbackEdges);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const handleOpenAdd = () => {
    if (isFallbackActive) return;
    setEditingEdge(null);
    setSource(rawNodes[0]?.id || 'NODE-001');
    setTarget(rawNodes[1]?.id || 'NODE-002');
    setDistance('10.0');
    setDirection('Bidirectional');
    setStatus('Clear');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (edge) => {
    if (isFallbackActive) return;
    setEditingEdge(edge);
    setSource(edge.sourceId);
    setTarget(edge.targetId);
    setDistance(String(edge.distance));
    setDirection(edge.direction);
    setStatus(edge.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (isFallbackActive) return;
    const edge = edges.find(e => e.id === id);
    if (!edge) return;

    if (window.confirm(`Are you sure you want to delete edge ${id}?`)) {
      try {
        const srcNode = rawNodes.find(n => n.id === edge.sourceId);
        if (srcNode) {
          const cleanSrc = (srcNode.connections || []).filter(c => (typeof c === 'object' && c !== null ? c.node_id : c) !== edge.targetId);
          await updateNavigationNode(srcNode.id, { connections: cleanSrc });
        }
        
        if (edge.direction === 'Bidirectional') {
          const tgtNode = rawNodes.find(n => n.id === edge.targetId);
          if (tgtNode) {
            const cleanTgt = (tgtNode.connections || []).filter(c => (typeof c === 'object' && c !== null ? c.node_id : c) !== edge.sourceId);
            await updateNavigationNode(tgtNode.id, { connections: cleanTgt });
          }
        }

        await loadData();
        showToast("Edge link deleted successfully.");
      } catch (err) {
        showToast(`Failed to delete edge: ${err.message || 'unknown error'}`);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isFallbackActive) return;
    if (!source || !target || !distance) return;

    const srcNode = rawNodes.find(n => n.id === source || n.node_name === source);
    const tgtNode = rawNodes.find(n => n.id === target || n.node_name === target);

    if (!srcNode || !tgtNode) {
      showToast("Could not find source or target waypoint by ID or name.");
      return;
    }

    try {
      if (editingEdge) {
        const oldSrcNode = rawNodes.find(n => n.id === editingEdge.sourceId);
        const oldTgtNode = rawNodes.find(n => n.id === editingEdge.targetId);
        if (oldSrcNode) {
          const cleanSrc = (oldSrcNode.connections || []).filter(c => (typeof c === 'object' && c !== null ? c.node_id : c) !== editingEdge.targetId);
          await updateNavigationNode(oldSrcNode.id, { connections: cleanSrc });
        }
        if (editingEdge.direction === 'Bidirectional' && oldTgtNode) {
          const cleanTgt = (oldTgtNode.connections || []).filter(c => (typeof c === 'object' && c !== null ? c.node_id : c) !== editingEdge.sourceId);
          await updateNavigationNode(oldTgtNode.id, { connections: cleanTgt });
        }
      }

      const srcConns = (srcNode.connections || []).filter(c => (typeof c === 'object' && c !== null ? c.node_id : c) !== tgtNode.id);
      srcConns.push({ node_id: tgtNode.id, weight: Number(distance) });
      await updateNavigationNode(srcNode.id, { connections: srcConns });

      if (direction === 'Bidirectional') {
        const tgtConns = (tgtNode.connections || []).filter(c => (typeof c === 'object' && c !== null ? c.node_id : c) !== srcNode.id);
        tgtConns.push({ node_id: srcNode.id, weight: Number(distance) });
        await updateNavigationNode(tgtNode.id, { connections: tgtConns });
      }

      await loadData();
      showToast(editingEdge ? "Edge link updated successfully." : "Edge link created successfully.");
      setIsModalOpen(false);
    } catch (err) {
      showToast(`Failed to link waypoints: ${err.message || 'unknown error'}`);
    }
  };

  const filteredEdges = edges.filter(e => 
    e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.target.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEdges.length / pageSize);
  const paginatedEdges = filteredEdges.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
            <Activity className="w-7 h-7 text-[#0071C1]" />
            Navigation Edges Setup
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Build point-to-point connections, configure segment path limits, and specify traffic capacities.
          </p>
        </div>
        <Button 
          className="gap-2 font-semibold" 
          onClick={handleOpenAdd}
          disabled={isFallbackActive}
        >
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
                      <Badge variant={e.status === 'Clear' ? 'success' : e.status === 'Congested' ? 'warning' : e.status === 'Under Maintenance' ? 'error' : 'secondary'}>
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
                          disabled={isFallbackActive}
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] h-7 px-2 font-medium text-red-600 border-red-100 hover:bg-red-50"
                          onClick={() => handleDelete(e.id)}
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
                <Input 
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
                <Input 
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
              <Input 
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

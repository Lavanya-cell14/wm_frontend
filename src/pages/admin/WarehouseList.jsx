import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Badge, Button, Card, CardContent, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Modal, Input, Pagination } from 'shared-ui';
import { Building2, Plus, MapPin, X, AlertTriangle, Loader2, Edit, Trash2, Layers, Network, Eye } from 'lucide-react';
import { 
  getWarehouses, 
  getZones, 
  getBins, 
  createWarehouseApi, 
  updateWarehouseApi, 
  deleteWarehouseApi,
  getSpatialEntitiesApi,
  createSpatialEntityApi,
  updateSpatialEntityApi,
  deleteSpatialEntityApi
} from '../../services/warehouseStructureService';
import { getLayoutGraphApi } from '../../services/layoutService';

const normalizeContextWarehouse = (wh) => ({
  id: wh.id,
  warehouse_name: wh.name,
  code: wh.id,
  address: wh.location,
  length: null,
  width: null,
  height: null,
});

const normalizeApiWarehouse = (wh) => ({
  id: wh.id,
  warehouse_name: wh.name || wh.warehouse_name,
  code: wh.id?.slice(0, 8).toUpperCase() || wh.code,
  address: wh.location || wh.address,
  length: wh.length != null ? Number(wh.length) : null,
  width: wh.width != null ? Number(wh.width) : null,
  height: wh.height != null ? Number(wh.height) : null,
  total_area_sqft: wh.total_area_sqft ? Number(wh.total_area_sqft) : null,
});

export default function WarehouseList() {
  const { warehouses: contextWarehouses, bins: contextBins } = useWarehouse();

  // Tabs: 'facilities' | 'spatial-entities' | 'layout-graph'
  const [activeTab, setActiveTab] = useState('facilities');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Data lists
  const [warehouses, setWarehouses] = useState([]);
  const [spatialEntities, setSpatialEntities] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [fallbackUsed, setFallbackUsed] = useState(false);

  // Detail & Modals
  const [selectedWh, setSelectedWh] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states - Warehouse
  const [whName, setWhName] = useState('');
  const [whAddress, setWhAddress] = useState('');
  const [whLength, setWhLength] = useState('');
  const [whWidth, setWhWidth] = useState('');
  const [whHeight, setWhHeight] = useState('');

  // Form states - Spatial Entity
  const [seName, setSeName] = useState('');
  const [seType, setSeType] = useState('Aisle');
  const [seWarehouse, setSeWarehouse] = useState('');
  const [seXStart, setSeXStart] = useState('');
  const [seYStart, setSeYStart] = useState('');
  const [seZStart, setSeZStart] = useState('');
  const [seXEnd, setSeXEnd] = useState('');
  const [seYEnd, setSeYEnd] = useState('');
  const [seZEnd, setSeZEnd] = useState('');

  // Load active tab data
  const loadData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      if (activeTab === 'facilities') {
        const res = await getWarehouses();
        const apiWhs = res.results.map(normalizeApiWarehouse);
        setWarehouses(apiWhs.length > 0 ? apiWhs : contextWarehouses.map(normalizeContextWarehouse));
        setFallbackUsed(apiWhs.length === 0);
      } else if (activeTab === 'spatial-entities') {
        const res = await getSpatialEntitiesApi();
        setSpatialEntities(res.results || []);
        // Make sure we have a warehouse loaded if none is set yet
        const whRes = await getWarehouses();
        if (whRes.results && whRes.results.length > 0) {
          setWarehouses(whRes.results.map(normalizeApiWarehouse));
        } else {
          setWarehouses(contextWarehouses.map(normalizeContextWarehouse));
        }
      } else if (activeTab === 'layout-graph') {
        const res = await getLayoutGraphApi();
        setGraphData(res || { nodes: [], edges: [] });
      }
    } catch (err) {
      console.error(err);
      setApiError('API call failed. Using local storage data fallback.');
      setFallbackUsed(true);
      if (activeTab === 'facilities') {
        setWarehouses(contextWarehouses.map(normalizeContextWarehouse));
      } else if (activeTab === 'spatial-entities') {
        setSpatialEntities([
          { id: 'se-1', name: 'Aisle Alpha Main', entity_type: 'Aisle', x_start: 0, y_start: 0, z_start: 0, x_end: 15, y_end: 2, z_end: 0 },
          { id: 'se-2', name: 'Column Column 4', entity_type: 'Column', x_start: 12, y_start: 5, z_start: 0, x_end: 13, y_end: 6, z_end: 4 }
        ]);
        setWarehouses(contextWarehouses.map(normalizeContextWarehouse));
      } else if (activeTab === 'layout-graph') {
        setGraphData({
          nodes: [
            { id: 'n-1', label: 'Dock A', x: 0, y: 0 },
            { id: 'n-2', label: 'Row 1 Start', x: 0, y: 10 },
            { id: 'n-3', label: 'Row 1 End', x: 20, y: 10 }
          ],
          edges: [
            { source: 'n-1', target: 'n-2', weight: 10 },
            { source: 'n-2', target: 'n-3', weight: 20 }
          ]
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Modals helpers - Warehouse
  const openAddWh = () => {
    setWhName('');
    setWhAddress('');
    setWhLength('');
    setWhWidth('');
    setWhHeight('');
    setShowAddModal(true);
  };

  const openEditWh = (wh) => {
    setSelectedItem(wh);
    setWhName(wh.warehouse_name || '');
    setWhAddress(wh.address || '');
    setWhLength(wh.length || '');
    setWhWidth(wh.width || '');
    setWhHeight(wh.height || '');
    setShowEditModal(true);
  };

  const openDeleteWh = (wh) => {
    setSelectedItem(wh);
    setShowDeleteModal(true);
  };

  // Modals helpers - Spatial Entity
  const openAddSe = () => {
    setSeName('');
    setSeType('Aisle');
    setSeWarehouse(warehouses[0]?.id || '');
    setSeXStart('0');
    setSeYStart('0');
    setSeZStart('0');
    setSeXEnd('5');
    setSeYEnd('1');
    setSeZEnd('3');
    setShowAddModal(true);
  };

  const openEditSe = (se) => {
    setSelectedItem(se);
    setSeName(se.name || '');
    setSeType(se.entity_type || 'Aisle');
    setSeWarehouse(se.warehouse || '');
    setSeXStart(se.x_start != null ? String(se.x_start) : '');
    setSeYStart(se.y_start != null ? String(se.y_start) : '');
    setSeZStart(se.z_start != null ? String(se.z_start) : '');
    setSeXEnd(se.x_end != null ? String(se.x_end) : '');
    setSeYEnd(se.y_end != null ? String(se.y_end) : '');
    setSeZEnd(se.z_end != null ? String(se.z_end) : '');
    setShowEditModal(true);
  };

  const openDeleteSe = (se) => {
    setSelectedItem(se);
    setShowDeleteModal(true);
  };

  // Actions execution
  const handleCreate = async () => {
    try {
      if (activeTab === 'facilities') {
        const payload = {
          name: whName,
          location: whAddress,
          length: whLength ? Number(whLength) : null,
          width: whWidth ? Number(whWidth) : null,
          height: whHeight ? Number(whHeight) : null
        };
        await createWarehouseApi(payload);
      } else {
        const payload = {
          name: seName,
          entity_type: seType,
          warehouse: seWarehouse || null,
          x_start: seXStart ? Number(seXStart) : 0,
          y_start: seYStart ? Number(seYStart) : 0,
          z_start: seZStart ? Number(seZStart) : 0,
          x_end: seXEnd ? Number(seXEnd) : 0,
          y_end: seYEnd ? Number(seYEnd) : 0,
          z_end: seZEnd ? Number(seZEnd) : 0,
        };
        await createSpatialEntityApi(payload);
      }
    } catch (err) {
      console.warn("API Error - falling back locally:", err);
      // Fallback local update
      if (activeTab === 'facilities') {
        const mockNew = {
          id: `wh-${Date.now()}`,
          warehouse_name: whName,
          code: `MOCK-${whName.slice(0, 3).toUpperCase()}`,
          address: whAddress,
          length: Number(whLength) || null,
          width: Number(whWidth) || null,
          height: Number(whHeight) || null
        };
        setWarehouses([...warehouses, mockNew]);
      } else {
        const mockNew = {
          id: `se-${Date.now()}`,
          name: seName,
          entity_type: seType,
          x_start: Number(seXStart) || 0,
          y_start: Number(seYStart) || 0,
          z_start: Number(seZStart) || 0,
          x_end: Number(seXEnd) || 0,
          y_end: Number(seYEnd) || 0,
          z_end: Number(seZEnd) || 0,
        };
        setSpatialEntities([...spatialEntities, mockNew]);
      }
    } finally {
      setShowAddModal(false);
      if (!fallbackUsed) loadData();
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      if (activeTab === 'facilities') {
        const payload = {
          name: whName,
          location: whAddress,
          length: whLength ? Number(whLength) : null,
          width: whWidth ? Number(whWidth) : null,
          height: whHeight ? Number(whHeight) : null
        };
        await updateWarehouseApi(selectedItem.id, payload);
      } else {
        const payload = {
          name: seName,
          entity_type: seType,
          warehouse: seWarehouse || null,
          x_start: seXStart ? Number(seXStart) : 0,
          y_start: seYStart ? Number(seYStart) : 0,
          z_start: seZStart ? Number(seZStart) : 0,
          x_end: seXEnd ? Number(seXEnd) : 0,
          y_end: seYEnd ? Number(seYEnd) : 0,
          z_end: seZEnd ? Number(seZEnd) : 0,
        };
        await updateSpatialEntityApi(selectedItem.id, payload);
      }
    } catch (err) {
      console.warn("API Error - falling back locally:", err);
      // Fallback local update
      if (activeTab === 'facilities') {
        setWarehouses(warehouses.map(w => w.id === selectedItem.id ? {
          ...w,
          warehouse_name: whName,
          address: whAddress,
          length: Number(whLength) || null,
          width: Number(whWidth) || null,
          height: Number(whHeight) || null
        } : w));
      } else {
        setSpatialEntities(spatialEntities.map(s => s.id === selectedItem.id ? {
          ...s,
          name: seName,
          entity_type: seType,
          x_start: Number(seXStart) || 0,
          y_start: Number(seYStart) || 0,
          z_start: Number(seZStart) || 0,
          x_end: Number(seXEnd) || 0,
          y_end: Number(seYEnd) || 0,
          z_end: Number(seZEnd) || 0,
        } : s));
      }
    } finally {
      setShowEditModal(false);
      setSelectedItem(null);
      if (!fallbackUsed) loadData();
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      if (activeTab === 'facilities') {
        await deleteWarehouseApi(selectedItem.id);
      } else {
        await deleteSpatialEntityApi(selectedItem.id);
      }
    } catch (err) {
      console.warn("API Error - falling back locally:", err);
      // Fallback local delete
      if (activeTab === 'facilities') {
        setWarehouses(warehouses.filter(w => w.id !== selectedItem.id));
      } else {
        setSpatialEntities(spatialEntities.filter(s => s.id !== selectedItem.id));
      }
    } finally {
      setShowDeleteModal(false);
      setSelectedItem(null);
      if (!fallbackUsed) loadData();
    }
  };

  // Searching & Pagination
  const filtered = (activeTab === 'facilities' ? warehouses : spatialEntities).filter(item => {
    if (activeTab === 'facilities') {
      return (
        (item.warehouse_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.address || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      return (
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.entity_type || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#0071C1]" />
            Facilities & Structure Setup
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure warehouses facilities, local spatial obstacles/aisles, and view active topology route graphs.
          </p>
        </div>
        
        {activeTab !== 'layout-graph' && (
          <Button 
            className="bg-[#0071C1] hover:bg-[#005c9e] text-white gap-2 font-bold px-4 py-2"
            onClick={activeTab === 'facilities' ? openAddWh : openAddSe}
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'facilities' ? 'Add Warehouse' : 'Add Spatial Entity'}
          </Button>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-150">
        <button
          onClick={() => { setActiveTab('facilities'); setCurrentPage(1); setSearchQuery(''); }}
          className={`pb-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'facilities' 
              ? 'border-[#0071C1] text-[#0071C1]' 
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Building2 className="w-4.5 h-4.5" />
          Facility List
        </button>
        <button
          onClick={() => { setActiveTab('spatial-entities'); setCurrentPage(1); setSearchQuery(''); }}
          className={`pb-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'spatial-entities' 
              ? 'border-[#0071C1] text-[#0071C1]' 
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Layers className="w-4.5 h-4.5" />
          Spatial Entities CRUD
        </button>
        <button
          onClick={() => { setActiveTab('layout-graph'); setCurrentPage(1); setSearchQuery(''); }}
          className={`pb-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'layout-graph' 
              ? 'border-[#0071C1] text-[#0071C1]' 
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Network className="w-4.5 h-4.5" />
          Layout Graph Preview
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab !== 'layout-graph' ? (
        <Card className="border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-slate-50/50">
            <SearchFilterBar
              searchPlaceholder={
                activeTab === 'facilities'
                  ? 'Search facilities by name or address...'
                  : 'Search spatial entities by name or type...'
              }
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              Loading records from WMS API...
            </div>
          )}

          {!loading && apiError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border-b border-amber-100 text-xs text-amber-800 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {apiError}
            </div>
          )}

          <CardContent className="p-0">
            {activeTab === 'facilities' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Warehouse Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Floor Dimensions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500 text-sm">
                        No facilities found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedList.map((wh) => (
                      <TableRow key={wh.id} className="hover:bg-slate-50/10">
                        <TableCell>
                          <div className="font-bold text-gray-900 text-sm">{wh.warehouse_name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{wh.id}</div>
                        </TableCell>
                        <TableCell className="text-gray-600 text-xs font-semibold">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {wh.address || '—'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {wh.code || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">
                          {wh.length != null && wh.width != null
                            ? `${wh.length}m × ${wh.width}m × ${wh.height}m`
                            : wh.total_area_sqft != null
                              ? `${wh.total_area_sqft.toLocaleString()} sqft`
                              : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs text-gray-600"
                              onClick={() => setSelectedWh(wh)}
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs text-blue-600"
                              onClick={() => openEditWh(wh)}
                            >
                              <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs text-red-600"
                              onClick={() => openDeleteWh(wh)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity Name</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Start Point (X, Y, Z)</TableHead>
                    <TableHead>End Point (X, Y, Z)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500 text-sm">
                        No spatial entities found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedList.map((se) => (
                      <TableRow key={se.id} className="hover:bg-slate-50/10">
                        <TableCell>
                          <div className="font-bold text-gray-900 text-sm">{se.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{se.id}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="primary" className="text-[10px] font-bold">
                            {se.entity_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">
                          {`(${se.x_start}, ${se.y_start}, ${se.z_start})`}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">
                          {`(${se.x_end}, ${se.y_end}, ${se.z_end})`}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs text-blue-600"
                              onClick={() => openEditSe(se)}
                            >
                              <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs text-red-600"
                              onClick={() => openDeleteSe(se)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

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
      ) : (
        /* Layout Graph View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border border-gray-100 shadow-sm h-fit">
            <CardHeader className="bg-slate-50/50 pb-4 border-b border-gray-100">
              <CardTitle className="text-sm font-bold uppercase text-gray-700">Topology Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs font-semibold text-gray-600 space-y-4">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>Total Nodes Count:</span>
                <span className="text-gray-900 font-extrabold">{graphData.nodes?.length || 0}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>Total Edges Connection:</span>
                <span className="text-gray-900 font-extrabold">{graphData.edges?.length || 0}</span>
              </div>
              <div className="bg-blue-50 border border-blue-100 text-blue-900 rounded-xl p-4 leading-relaxed font-semibold">
                This layout topology is parsed dynamically from the active warehouse CAD or layout design file and maps coordinates for automated picker routing engines.
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border border-gray-100 shadow-sm">
            <CardHeader className="bg-slate-50/50 pb-4 border-b border-gray-100">
              <CardTitle className="text-sm font-bold uppercase text-gray-700">Nodes & Edges Blueprint</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 text-xs mb-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Nodes List
                  </h4>
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50 pr-2">
                    {graphData.nodes?.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">No nodes in graph.</p>
                    ) : (
                      graphData.nodes?.map((node, i) => (
                        <div key={i} className="py-2 flex justify-between items-center text-xs font-semibold">
                          <span className="text-gray-900 font-bold">{node.label || node.id}</span>
                          <span className="font-mono text-gray-400 text-[10px]">{`(${node.x}, ${node.y})`}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-bold text-gray-800 text-xs mb-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    Paths Connections
                  </h4>
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50 pr-2">
                    {graphData.edges?.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">No path edges defined.</p>
                    ) : (
                      graphData.edges?.map((edge, i) => (
                        <div key={i} className="py-2 flex justify-between items-center text-xs font-semibold">
                          <span className="text-gray-700 font-medium">
                            {edge.source} &rarr; {edge.target}
                          </span>
                          <Badge variant="outline" className="font-mono text-[9px] font-bold">
                            {edge.weight ? `${edge.weight}m` : '—'}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Warehouse Detail Drawer */}
      {selectedWh && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6 text-xs font-semibold">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-[#0071C1]">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">{selectedWh.warehouse_name}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedWh.id}</p>
                  </div>
                </div>
                <Button className="text-gray-400 hover:text-gray-600 font-bold" onClick={() => setSelectedWh(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Address</div>
                  <div className="font-bold text-slate-800 text-xs">{selectedWh.address || '—'}</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Warehouse Code</div>
                  <div className="font-bold text-slate-800 text-xs font-mono">{selectedWh.code || '—'}</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Floor Dimensions</div>
                  <div className="font-bold text-slate-800 text-xs">
                    {selectedWh.length != null && selectedWh.width != null
                      ? `${selectedWh.length}m × ${selectedWh.width}m`
                      : '—'}
                  </div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Ceiling Height</div>
                  <div className="font-bold text-slate-800 text-xs">
                    {selectedWh.height != null ? `${selectedWh.height}m` : '—'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between">
                <div className="font-bold text-slate-800">Operational Status</div>
                <Badge variant="success" className="uppercase font-bold tracking-wider">Active</Badge>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full justify-center mt-6 text-xs"
              onClick={() => setSelectedWh(null)}
            >
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
          title={activeTab === 'facilities' ? 'Register New Facility' : 'Create Spatial Entity'}
          footer={
            <>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Create</Button>
            </>
          }
        >
          {activeTab === 'facilities' ? (
            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-700 mb-1">Warehouse Name *</label>
                <Input value={whName} onChange={(e) => setWhName(e.target.value)} placeholder="e.g. Main Distribution" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Address *</label>
                <Input value={whAddress} onChange={(e) => setWhAddress(e.target.value)} placeholder="e.g. 123 Logistics St" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-700 mb-1">Length (m)</label>
                  <Input type="number" value={whLength} onChange={(e) => setWhLength(e.target.value)} placeholder="100" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Width (m)</label>
                  <Input type="number" value={whWidth} onChange={(e) => setWhWidth(e.target.value)} placeholder="80" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Height (m)</label>
                  <Input type="number" value={whHeight} onChange={(e) => setWhHeight(e.target.value)} placeholder="12" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-gray-700 mb-1">Entity Name *</label>
                <Input value={seName} onChange={(e) => setSeName(e.target.value)} placeholder="e.g. Aisle A Left Border" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 mb-1">Entity Type</label>
                  <select 
                    value={seType} 
                    onChange={(e) => setSeType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                  >
                    <option value="Aisle">Aisle</option>
                    <option value="Obstacle">Obstacle</option>
                    <option value="Wall">Wall</option>
                    <option value="Column">Column</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Parent Warehouse</label>
                  <select 
                    value={seWarehouse} 
                    onChange={(e) => setSeWarehouse(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.warehouse_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-700 mb-1">X Start</label>
                  <Input type="number" value={seXStart} onChange={(e) => setSeXStart(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Y Start</label>
                  <Input type="number" value={seYStart} onChange={(e) => setSeYStart(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Z Start</label>
                  <Input type="number" value={seZStart} onChange={(e) => setSeZStart(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-700 mb-1">X End</label>
                  <Input type="number" value={seXEnd} onChange={(e) => setSeXEnd(e.target.value)} placeholder="10" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Y End</label>
                  <Input type="number" value={seYEnd} onChange={(e) => setSeYEnd(e.target.value)} placeholder="2" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Z End</label>
                  <Input type="number" value={seZEnd} onChange={(e) => setSeZEnd(e.target.value)} placeholder="4" />
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={activeTab === 'facilities' ? 'Edit Facility details' : 'Edit Spatial Entity'}
          footer={
            <>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleUpdate} className="bg-blue-600 text-white hover:bg-blue-700 font-bold">Save Changes</Button>
            </>
          }
        >
          {activeTab === 'facilities' ? (
            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-700 mb-1">Warehouse Name *</label>
                <Input value={whName} onChange={(e) => setWhName(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Address *</label>
                <Input value={whAddress} onChange={(e) => setWhAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-700 mb-1">Length (m)</label>
                  <Input type="number" value={whLength} onChange={(e) => setWhLength(e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Width (m)</label>
                  <Input type="number" value={whWidth} onChange={(e) => setWhWidth(e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Height (m)</label>
                  <Input type="number" value={whHeight} onChange={(e) => setWhHeight(e.target.value)} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-gray-700 mb-1">Entity Name *</label>
                <Input value={seName} onChange={(e) => setSeName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 mb-1">Entity Type</label>
                  <select 
                    value={seType} 
                    onChange={(e) => setSeType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                  >
                    <option value="Aisle">Aisle</option>
                    <option value="Obstacle">Obstacle</option>
                    <option value="Wall">Wall</option>
                    <option value="Column">Column</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Parent Warehouse</label>
                  <select 
                    value={seWarehouse} 
                    onChange={(e) => setSeWarehouse(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-xs text-gray-700"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.warehouse_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-700 mb-1">X Start</label>
                  <Input type="number" value={seXStart} onChange={(e) => setSeXStart(e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Y Start</label>
                  <Input type="number" value={seYStart} onChange={(e) => setSeYStart(e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Z Start</label>
                  <Input type="number" value={seZStart} onChange={(e) => setSeZStart(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-700 mb-1">X End</label>
                  <Input type="number" value={seXEnd} onChange={(e) => setSeXEnd(e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Y End</label>
                  <Input type="number" value={seYEnd} onChange={(e) => setSeYEnd(e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Z End</label>
                  <Input type="number" value={seZEnd} onChange={(e) => setSeZEnd(e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* DELETE CONFIRM MODAL */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Confirmation"
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
              Are you sure you want to delete <strong>{selectedItem?.warehouse_name || selectedItem?.name}</strong>? This action is irreversible.
            </p>
          </div>
        </Modal>
      )}

    </div>
  );
}

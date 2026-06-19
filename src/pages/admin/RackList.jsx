import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from 'shared-ui';
import { Layers, Plus, X, AlertTriangle, Loader2 } from 'lucide-react';
import { getRacks, getRackById, getRackCoordinates, getZones } from '../../services/warehouseStructureService';

export default function RackList() {
  // Read-only context for fallback references
  const { racks: contextRacks, zones: contextZones, bins: contextBins, shelves: contextShelves } = useWarehouse();
  
  const [racks, setRacks] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRack, setSelectedRack] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const normalizeApiRack = (r) => ({
    id: r.id,
    zoneId: r.zone,
    name: r.rack_code,
    rackCode: r.rack_code,
    maxWeight: Number(r.max_weight),
    currentWeight: Number(r.current_weight || 120),
    status: r.status || 'Active',
    x: Number(r.x),
    y: Number(r.y),
    z: Number(r.z),
    width: Number(r.width),
    height: Number(r.height),
    depth: Number(r.depth),
    rotationAngle: Number(r.rotation_angle),
  });

  const normalizeContextRack = (r) => ({
    id: r.id,
    zoneId: r.zoneId,
    name: r.name,
    rackCode: r.id,
    maxWeight: Number(r.maxWeight),
    currentWeight: Number(r.currentWeight || 120),
    status: r.status || 'Active',
    x: Number(r.x || 12),
    y: Number(r.y || 5),
    z: Number(r.z || 0),
  });

  const normalizeContextZone = (z) => ({
    id: z.id,
    zone_name: z.name,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setApiError(null);
        // [TEMPORARY LOG FOR VERIFICATION]
        console.warn("[RackList] Calling APIs: /api/warehouses/racks/, /api/warehouses/rack-coordinates/, /api/zones/");
        
        // Fetch racks, coordinates, and zones in parallel
        const [racksRes, coordsRes, zonesRes] = await Promise.all([
          getRacks(),
          getRackCoordinates(),
          getZones()
        ]);
        
        if (!cancelled) {
          const apiRacks = racksRes.results.map(normalizeApiRack);
          setRacks(apiRacks);
          setCoordinates(coordsRes.results);
          setZones(zonesRes.results);
          // [TEMPORARY LOG FOR VERIFICATION]
          console.warn(`[RackList] API Success. URL: /api/warehouses/racks/, Status: 200, Count: ${apiRacks.length}, Fallback Used: false`);
        }
      } catch (err) {
        if (!cancelled) {
          const status = err.status || (err.code === 'NETWORK_ERROR' ? 0 : 'unknown');
          setApiError('Racks/Coordinates API unreachable — showing cached data.');
          const fallbackRacks = contextRacks.map(normalizeContextRack);
          setRacks(fallbackRacks);
          setZones(contextZones.map(normalizeContextZone));
          setCoordinates([]); // Empty coordinate mapping
          // [TEMPORARY LOG FOR VERIFICATION]
          console.warn(`[RackList] API Error. URL: /api/warehouses/racks/, Status: ${status}, Count: ${fallbackRacks.length}, Fallback Used: true`, err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [contextRacks, contextZones]);

  const handleViewRack = async (rack) => {
    setSelectedRack(rack);
    try {
      const detail = await getRackById(rack.id);
      setSelectedRack(normalizeApiRack(detail));
    } catch (err) {
      console.warn("Could not fetch rack detail, using list view state:", err);
    }
  };

  const filtered = racks.filter(r => 
    (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.rackCode || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Filter coordinates for details view
  const rackCoords = selectedRack
    ? coordinates.filter((c) => c.rack === selectedRack.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-[#0071C1]" />
            Racks Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure layout rack rows, loading weights capacity limits, and slots counts.</p>
        </div>
        <Button className="gap-2" onClick={() => alert('Add Rack action pending backend API integration.')}>
          <Plus className="w-4 h-4" />
          Add Rack
        </Button>
      </div>

      {/* Table */}
      <Card className="border border-gray-100 shadow-xs">
        <div className="p-4 border-b border-gray-100 bg-slate-50/50">
          <SearchFilterBar 
            searchPlaceholder="Search racks by code..." 
            searchValue={searchQuery}
            onSearchChange={setSearchQuery} 
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            Loading racks from API...
          </div>
        )}

        {/* Error / Fallback warning banner */}
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
                <TableHead>Rack Code</TableHead>
                <TableHead>Zone Name</TableHead>
                <TableHead>Aisle Position</TableHead>
                <TableHead>Shelf Count</TableHead>
                <TableHead>Bin Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1, 2, 3].map((n) => (
                  <TableRow key={n}>
                    {[1, 2, 3, 4, 5, 6].map((c) => (
                      <TableCell key={c}>
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">No racks matching criteria.</TableCell>
                </TableRow>
              ) : (
                pagedList.map((r) => {
                  const zone = zones.find(z => z.id === r.zoneId) || { name: 'Zone A', zone_name: 'Zone A' };
                  const zoneName = zone.zone_name || zone.name;
                  const shelfCount = contextShelves.filter(s => s.rackId === r.id).length || 4;
                  return (
                    <TableRow key={r.id} className="hover:bg-slate-50/10">
                      <TableCell>
                        <div className="font-bold text-gray-900 text-sm">{r.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{r.id}</div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600">{zoneName}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600 font-mono">
                        {zoneName === 'Zone B' ? 'Aisle 2' : zoneName === 'Zone C' ? 'Aisle 3' : 'Aisle 1'}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-slate-700">{shelfCount} Shelves</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-slate-700">{contextBins.length} Bins</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-gray-600" onClick={() => handleViewRack(r)}>
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-blue-600" onClick={() => alert('Edit Rack blueprint properties endpoint pending.')}>
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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

      {/* Details Drawer Overlay */}
      {selectedRack && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6 text-xs">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-[#0071C1]">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">{selectedRack.name}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedRack.id}</p>
                  </div>
                </div>
                <Button className="text-gray-400 hover:text-gray-600 font-bold" onClick={() => setSelectedRack(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Max Load Capacity</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedRack.maxWeight} kg</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Current Weight Load</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedRack.currentWeight || 120} kg</div>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-100 rounded-xl">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">3D Offsets Mapping</div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-center mt-2">
                  <div className="bg-slate-50 p-1.5 rounded">X: {selectedRack.x != null ? selectedRack.x : 12}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Y: {selectedRack.y != null ? selectedRack.y : 5}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Z: {selectedRack.z != null ? selectedRack.z : 0}</div>
                </div>
              </div>

              {/* Access Points from rack-coordinates API */}
              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-2">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">
                  Access Points (Rack Coordinates)
                </div>
                {rackCoords.length === 0 ? (
                  <p className="text-gray-500 italic text-[11px]">No access coordinates defined for this rack.</p>
                ) : (
                  <div className="space-y-1.5 font-mono text-[10px]">
                    {rackCoords.map((coord) => (
                      <div key={coord.id} className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-gray-100">
                        <span className="font-bold text-slate-700 capitalize">{coord.side} side</span>
                        <span className="text-gray-500">
                          ({Number(coord.access_point_x).toFixed(2)}, {Number(coord.access_point_y).toFixed(2)}, {Number(coord.access_point_z).toFixed(2)})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button variant="outline" className="w-full justify-center mt-6 text-sm" onClick={() => setSelectedRack(null)}>
              Close Details View
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

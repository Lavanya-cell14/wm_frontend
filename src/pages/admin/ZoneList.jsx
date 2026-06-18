import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Badge, Button, Card, CardContent, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import { Layers, Plus, X, AlertTriangle, Loader2 } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import { getZones } from '../../services/warehouseStructureService';

// ---------------------------------------------------------------------------
// Normalize context zones to match API field shape.
// Used as fallback when the API call fails.
// API shape: { id, warehouse, zone_group, zone_name, zone_type, x, y, z, width, height, depth }
// ---------------------------------------------------------------------------
const normalizeContextZone = (z) => ({
  id: z.id,
  zone_name: z.name,
  zone_type: z.type,
  warehouse: z.warehouse,
  zone_group: null,       // not available in context mock
  x: z.x,
  y: z.y,
  z: z.z,
  width: z.width,
  height: z.height,
  depth: z.depth,
  // Context-only extras kept for graceful display in fallback mode
  _capacityPercent: z.capacityPercent,
  _status: z.status,
});

// Truncate UUIDs for compact display
const shortId = (id) => {
  if (!id || id.length < 8) return id || '—';
  return `${id.slice(0, 8)}…`;
};

export default function ZoneList() {
  // Keep context for fallback only — WarehouseContext.jsx is NOT modified.
  const { zones: contextZones } = useWarehouse();

  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // ---------------------------------------------------------------------------
  // Fetch zones from real API.
  // On failure: show error banner and fall back to context mock zones.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setApiError(null);
        const { results } = await getZones();
        if (!cancelled) setZones(results);
      } catch (err) {
        if (!cancelled) {
          setApiError('Zones API unreachable — showing cached data.');
          setZones(contextZones.map(normalizeContextZone));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [contextZones]);

  const filtered = zones.filter((z) =>
    (z.zone_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (z.zone_type || '').toLowerCase().includes(searchQuery.toLowerCase())
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
            Zones Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure layout storage zones, visual boundaries and temperature constraints.
          </p>
        </div>
        <Button className="gap-2" onClick={() => alert('Add Zone — write API not yet integrated.')}>
          <Plus className="w-4 h-4" />
          Add Zone
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border border-gray-100 shadow-xs">
        <div className="p-4 border-b border-gray-100 bg-slate-50/50">
          <SearchFilterBar
            searchPlaceholder="Search zones by name or type..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            Loading zones from API...
          </div>
        )}

        {/* Error / fallback state */}
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
                <TableHead>Zone Name</TableHead>
                <TableHead>Zone Type</TableHead>
                <TableHead>Zone Group</TableHead>
                <TableHead>Spatial Dimensions</TableHead>
                <TableHead>Coordinates (X, Y, Z)</TableHead>
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
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500 text-sm">
                    No zones found.
                  </TableCell>
                </TableRow>
              ) : (
                pagedList.map((z) => (
                  <TableRow key={z.id} className="hover:bg-slate-50/10">
                    <TableCell>
                      <div className="font-bold text-gray-900 text-sm">{z.zone_name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{z.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500">
                        {z.zone_type || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600 font-mono">
                      {z.zone_group ? shortId(z.zone_group) : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {z.width != null && z.height != null && z.depth != null
                        ? `${z.width}m × ${z.height}m × ${z.depth}m`
                        : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {z.x != null ? `(${z.x}, ${z.y}, ${z.z})` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-gray-600"
                          onClick={() => setSelectedZone(z)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-blue-600"
                          onClick={() => alert('Edit Zone — write API not yet integrated.')}
                        >
                          Edit
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
      {selectedZone && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6 text-xs">

              {/* Drawer Header */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-[#0071C1]">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">{selectedZone.zone_name}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedZone.id}</p>
                  </div>
                </div>
                <Button
                  className="text-gray-400 hover:text-gray-600 font-bold"
                  onClick={() => setSelectedZone(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Zone Type + Group */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Zone Type</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedZone.zone_type || '—'}</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Zone Group ID</div>
                  <div className="font-bold text-slate-800 text-sm font-mono truncate" title={selectedZone.zone_group}>
                    {selectedZone.zone_group ? shortId(selectedZone.zone_group) : '—'}
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-2">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">
                  3D Position Offsets
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-center text-[10px]">
                  <div className="bg-slate-50 p-1.5 rounded">X: {selectedZone.x ?? '—'}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Y: {selectedZone.y ?? '—'}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Z: {selectedZone.z ?? '—'}</div>
                </div>
              </div>

              {/* Dimensions */}
              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-2">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">
                  Physical Dimensions
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-center text-[10px]">
                  <div className="bg-slate-50 p-1.5 rounded">W: {selectedZone.width != null ? `${selectedZone.width}m` : '—'}</div>
                  <div className="bg-slate-50 p-1.5 rounded">H: {selectedZone.height != null ? `${selectedZone.height}m` : '—'}</div>
                  <div className="bg-slate-50 p-1.5 rounded">D: {selectedZone.depth != null ? `${selectedZone.depth}m` : '—'}</div>
                </div>
              </div>

              {/* Fallback-only extras (shown when context data is used) */}
              {selectedZone._capacityPercent != null && (
                <div className="p-3 bg-white border border-gray-100 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-2">Space Utilisation</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${selectedZone._capacityPercent > 80 ? 'bg-red-500' : 'bg-blue-600'}`}
                        style={{ width: `${selectedZone._capacityPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 shrink-0">
                      {selectedZone._capacityPercent}%
                    </span>
                  </div>
                </div>
              )}

              {/* Associated Inventory — static informational block (from UI design) */}
              <div className="p-3 bg-white border border-gray-100 rounded-xl">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Associated Inventory Items</div>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Real-time stock cycles and picking congestion safety margins are actively monitored under this zone coordinates outline.
                </p>
              </div>

              {/* Warehouse reference */}
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Parent Warehouse</div>
                <div className="font-bold text-slate-800 text-sm font-mono truncate" title={selectedZone.warehouse}>
                  {selectedZone.warehouse || '—'}
                </div>
              </div>

            </div>

            <Button
              variant="outline"
              className="w-full justify-center mt-6 text-sm"
              onClick={() => setSelectedZone(null)}
            >
              Close Details View
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

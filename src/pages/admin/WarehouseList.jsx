import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Badge, Button, Card, CardContent, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import { Building2, Plus, MapPin, X, AlertTriangle, Loader2 } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import { getWarehouses } from '../../services/warehouseStructureService';

// ---------------------------------------------------------------------------
// Normalize context warehouse to match API field shape.
// Used as fallback when the API call fails.
// API shape: { id, warehouse_name, code, address, length, width, height }
// ---------------------------------------------------------------------------
const normalizeContextWarehouse = (wh) => ({
  id: wh.id,
  warehouse_name: wh.name,
  code: wh.id,
  address: wh.location,
  length: null,
  width: null,
  height: null,
});

export default function WarehouseList() {
  // Keep context for zones/bins cross-references in the drawer.
  // WarehouseContext.jsx is NOT modified — it remains the fallback mock layer.
  const { warehouses: contextWarehouses, zones, bins } = useWarehouse();

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWh, setSelectedWh] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // ---------------------------------------------------------------------------
  // Fetch warehouses from real API.
  // On failure: show error banner and fall back to context mock data.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setApiError(null);
        const { results } = await getWarehouses();
        if (!cancelled) setWarehouses(results);
      } catch (err) {
        if (!cancelled) {
          setApiError('Warehouses API unreachable — showing cached data.');
          setWarehouses(contextWarehouses.map(normalizeContextWarehouse));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [contextWarehouses]);

  const filtered = warehouses.filter((wh) =>
    (wh.warehouse_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (wh.address || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#0071C1]" />
            Warehouses Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure physical warehouse properties and layout files.
          </p>
        </div>
        <Button className="gap-2" onClick={() => alert('Add Warehouse — write API not yet integrated.')}>
          <Plus className="w-4 h-4" />
          Add Warehouse
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border border-gray-100 shadow-xs">
        <div className="p-4 border-b border-gray-100 bg-slate-50/50">
          <SearchFilterBar
            searchPlaceholder="Search warehouses by name or address..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            Loading warehouses from API...
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
                <TableHead>Warehouse Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Floor Dimensions</TableHead>
                <TableHead>Total Bins</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton rows while loading
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
                    No warehouses found.
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
                        : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">
                      {bins.length} Bins
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-gray-600"
                          onClick={() => setSelectedWh(wh)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-blue-600"
                          onClick={() => alert('Edit Warehouse — write API not yet integrated.')}
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
      {selectedWh && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6 text-xs">

              {/* Drawer Header */}
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
                <Button
                  className="text-gray-400 hover:text-gray-600 font-bold"
                  onClick={() => setSelectedWh(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Address</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedWh.address || '—'}</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Warehouse Code</div>
                  <div className="font-bold text-slate-800 text-sm font-mono">{selectedWh.code || '—'}</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Floor Dimensions</div>
                  <div className="font-bold text-slate-800 text-sm">
                    {selectedWh.length != null && selectedWh.width != null
                      ? `${selectedWh.length}m × ${selectedWh.width}m`
                      : '—'}
                  </div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Ceiling Height</div>
                  <div className="font-bold text-slate-800 text-sm">
                    {selectedWh.height != null ? `${selectedWh.height}m` : '—'}
                  </div>
                </div>
              </div>

              {/* Operational Status */}
              <div className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between">
                <div className="font-bold text-slate-800">Operational Status</div>
                <Badge variant="success" className="uppercase font-bold tracking-wider">Active</Badge>
              </div>

              {/* Zone Layout — from context, matched by warehouse_name */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-gray-900 uppercase tracking-widest text-[10px]">
                  Zone Layout Allocation
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white">
                  {zones.filter((z) => z.warehouse === selectedWh.warehouse_name).length === 0 ? (
                    <div className="p-4 text-xs text-gray-400 text-center">
                      Zone cross-reference will be available after zones integration completes.
                    </div>
                  ) : (
                    zones
                      .filter((z) => z.warehouse === selectedWh.warehouse_name)
                      .map((zone) => (
                        <div key={zone.id} className="p-3 flex justify-between items-center hover:bg-slate-50/50">
                          <div>
                            <span className="font-bold text-slate-700">{zone.name}</span>
                            <span className="text-gray-400 ml-1.5 text-[10px]">({zone.type})</span>
                          </div>
                          <Badge variant="outline">{zone.capacityPercent}% Space Used</Badge>
                        </div>
                      ))
                  )}
                </div>
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
    </div>
  );
}

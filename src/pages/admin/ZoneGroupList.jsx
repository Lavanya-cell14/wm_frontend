import React, { useState, useEffect } from 'react';
import { Badge, Button, Card, CardContent, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import { Layers, Plus, X, AlertTriangle, Loader2 } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import { getZoneGroups } from '../../services/warehouseStructureService';

// ---------------------------------------------------------------------------
// Fallback mock data — used when API is unreachable.
// Normalized to match API field shape: { id, warehouse, code, name, description, zone_group_type }
// ---------------------------------------------------------------------------
const FALLBACK_ZONE_GROUPS = [
  {
    id: 'ZG-001',
    name: 'Zone Group Alpha',
    code: 'ZG-A',
    warehouse: 'Central Fulfillment A',
    description: 'Standard ambient inventory operations',
    zone_group_type: 'GENERAL_STORAGE',
  },
  {
    id: 'ZG-002',
    name: 'Zone Group Beta',
    code: 'ZG-B',
    warehouse: 'Central Fulfillment A',
    description: 'Temperature controlled storage for perishables and electronics',
    zone_group_type: 'COLD_STORAGE',
  },
];

export default function ZoneGroupList() {
  const [zoneGroups, setZoneGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZg, setSelectedZg] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // ---------------------------------------------------------------------------
  // Fetch zone groups from real API.
  // On failure: show error banner and fall back to FALLBACK_ZONE_GROUPS.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setApiError(null);
        const { results } = await getZoneGroups();
        if (!cancelled) setZoneGroups(results);
      } catch (err) {
        if (!cancelled) {
          setApiError('Zone Groups API unreachable — showing cached data.');
          setZoneGroups(FALLBACK_ZONE_GROUPS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = zoneGroups.filter((zg) =>
    (zg.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (zg.zone_group_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (zg.code || '').toLowerCase().includes(searchQuery.toLowerCase())
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
            Zone Groups Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure high-level partitions and ambient controls grouping active zones.
          </p>
        </div>
        <Button className="gap-2" onClick={() => alert('Add Zone Group — write API not yet integrated.')}>
          <Plus className="w-4 h-4" />
          Add Zone Group
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border border-gray-100 shadow-xs">
        <div className="p-4 border-b border-gray-100 bg-slate-50/50">
          <SearchFilterBar
            searchPlaceholder="Search zone groups by name, code, or type..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            Loading zone groups from API...
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
                <TableHead>Zone Group Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1, 2, 3].map((n) => (
                  <TableRow key={n}>
                    {[1, 2, 3, 4, 5].map((c) => (
                      <TableCell key={c}>
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500 text-sm">
                    No zone groups found.
                  </TableCell>
                </TableRow>
              ) : (
                pagedList.map((zg) => (
                  <TableRow key={zg.id} className="hover:bg-slate-50/10">
                    <TableCell>
                      <div className="font-bold text-gray-900 text-sm">{zg.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{zg.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {zg.code || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="primary" className="text-[10px]">
                        {zg.zone_group_type || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs max-w-xs truncate" title={zg.description}>
                      {zg.description || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-gray-600"
                          onClick={() => setSelectedZg(zg)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-blue-600"
                          onClick={() => alert('Edit Zone Group — write API not yet integrated.')}
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
      {selectedZg && (
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
                    <h3 className="font-extrabold text-gray-900 text-base">{selectedZg.name}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedZg.id}</p>
                  </div>
                </div>
                <Button
                  className="text-gray-400 hover:text-gray-600 font-bold"
                  onClick={() => setSelectedZg(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Group Code</div>
                  <div className="font-bold text-slate-800 text-sm font-mono">{selectedZg.code || '—'}</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Group Type</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedZg.zone_group_type || '—'}</div>
                </div>
              </div>

              {/* Warehouse reference */}
              <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Parent Warehouse</div>
                <div className="font-bold text-slate-800 text-sm font-mono truncate" title={selectedZg.warehouse}>
                  {selectedZg.warehouse || '—'}
                </div>
              </div>

              {/* Description */}
              <div className="p-3 bg-white border border-gray-100 rounded-xl">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">
                  Operational Purpose Description
                </div>
                <p className="font-medium text-slate-700 leading-relaxed mt-1">
                  {selectedZg.description || 'No description provided.'}
                </p>
              </div>

            </div>

            <Button
              variant="outline"
              className="w-full justify-center mt-6 text-sm"
              onClick={() => setSelectedZg(null)}
            >
              Close Details View
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

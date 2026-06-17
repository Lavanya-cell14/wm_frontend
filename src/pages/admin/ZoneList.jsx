import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import { Layers, Plus, X } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';

export default function ZoneList() {
  const { zones, bins, inventory } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filtered = zones.filter(z => 
    z.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    z.type.toLowerCase().includes(searchQuery.toLowerCase())
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
          <p className="text-gray-500 text-sm mt-1">Configure layout storage zones, visual boundaries and temperature constraints.</p>
        </div>
        <Button className="gap-2" onClick={() => alert('Add Zone action pending backend API integration.')}>
          <Plus className="w-4 h-4" />
          Add Zone
        </Button>
      </div>

      {/* Table */}
      <Card className="border border-gray-100 shadow-xs">
        <div className="p-4 border-b border-gray-100 bg-slate-50/50">
          <SearchFilterBar 
            searchPlaceholder="Search zones by name or type..." 
            searchValue={searchQuery}
            onSearchChange={setSearchQuery} 
          />
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone Name</TableHead>
                <TableHead>Zone Group</TableHead>
                <TableHead>Zone Type</TableHead>
                <TableHead>Physical Capacity</TableHead>
                <TableHead>Occupancy %</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">No zones matching criteria.</TableCell>
                </TableRow>
              ) : (
                pagedList.map((z) => (
                  <TableRow key={z.id} className="hover:bg-slate-50/10">
                    <TableCell>
                      <div className="font-bold text-gray-900 text-sm">{z.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{z.id}</div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600">
                      {z.name.endsWith('C') || z.name.endsWith('D') ? 'Zone Group Beta' : 'Zone Group Alpha'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500">{z.type}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 font-semibold">1,500 kg limit</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${z.capacityPercent > 80 ? 'bg-red-500' : 'bg-blue-600'}`}
                            style={{ width: `${z.capacityPercent || 40}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{z.capacityPercent || 40}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-gray-600" onClick={() => setSelectedZone(z)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-blue-600" onClick={() => alert('Edit Zone coordinates blueprint endpoint pending.')}>
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

      {/* Details Drawer Overlay */}
      {selectedZone && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6 text-xs">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-[#0071C1]">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">{selectedZone.name}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedZone.id}</p>
                  </div>
                </div>
                <Button className="text-gray-400 hover:text-gray-600 font-bold" onClick={() => setSelectedZone(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Zone Type Profile</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedZone.type}</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Utilization Status</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedZone.capacityPercent}% Space Used</div>
                </div>
              </div>

              {/* Offset coordinates */}
              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-2">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">3D Coordinate Boundary (Offsets)</div>
                <div className="grid grid-cols-3 gap-2 font-mono text-center text-[10px]">
                  <div className="bg-slate-50 p-1.5 rounded">X: {selectedZone.x || 0}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Y: {selectedZone.y || 0}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Z: {selectedZone.z || 0}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-center text-[10px] mt-2">
                  <div className="bg-slate-50 p-1.5 rounded">Width: {selectedZone.width || 10}m</div>
                  <div className="bg-slate-50 p-1.5 rounded">Height: {selectedZone.height || 8}m</div>
                  <div className="bg-slate-50 p-1.5 rounded">Depth: {selectedZone.depth || 10}m</div>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-100 rounded-xl">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Associated Inventory Items</div>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Real-time stock cycles and picking congestion safety margins are actively monitored under this zone coordinates outline.
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-center mt-6 text-sm" onClick={() => setSelectedZone(null)}>
              Close Details View
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

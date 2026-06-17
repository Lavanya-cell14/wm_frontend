import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import { Activity, Plus, AlertTriangle, X } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';

export default function AisleList() {
  const { zones, racks } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAisle, setSelectedAisle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Mock Aisles data
  const [aisles, setAisles] = useState([
    { id: 'AIS-001', code: 'Aisle 1', zone: 'Zone A', racksCount: 3, status: 'Operational', details: 'Ambient corridor near dispatcher dock' },
    { id: 'AIS-002', code: 'Aisle 2', zone: 'Zone B', racksCount: 4, status: 'Operational', details: 'Electronics corridor near security center' },
    { id: 'AIS-003', code: 'Aisle 3', zone: 'Zone C', racksCount: 3, status: 'Blocked', details: 'Blocked due to AGV maintenance lane closing' },
    { id: 'AIS-004', code: 'Aisle 4', zone: 'Zone D', racksCount: 2, status: 'Operational', details: 'Cold storage loading corridor' }
  ]);

  const filtered = aisles.filter(a => 
    a.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.zone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#0071C1]" />
            Aisles Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure physical navigation corridors and path blocking flags.</p>
        </div>
        <Button className="gap-2" onClick={() => alert('Add Aisle action pending backend API integration.')}>
          <Plus className="w-4 h-4" />
          Add Aisle
        </Button>
      </div>

      {/* Table */}
      <Card className="border border-gray-100 shadow-xs">
        <div className="p-4 border-b border-gray-100 bg-slate-50/50">
          <SearchFilterBar 
            searchPlaceholder="Search aisles by code or zone..." 
            searchValue={searchQuery}
            onSearchChange={setSearchQuery} 
          />
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aisle Code</TableHead>
                <TableHead>Zone Location</TableHead>
                <TableHead>Connected Racks</TableHead>
                <TableHead>Path Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">No aisles matching criteria.</TableCell>
                </TableRow>
              ) : (
                pagedList.map((a) => (
                  <TableRow key={a.id} className="hover:bg-slate-50/10">
                    <TableCell>
                      <div className="font-bold text-gray-900 text-sm">{a.code}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{a.id}</div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600">{a.zone}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">{a.racksCount} Racks</TableCell>
                    <TableCell>
                      {a.status === 'Blocked' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Operational
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-gray-600" onClick={() => setSelectedAisle(a)}>
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`h-7 px-2.5 text-xs ${a.status === 'Blocked' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-600 hover:bg-red-50'}`}
                          onClick={() => alert(`Aisle toggle status triggered for ${a.code}`)}
                        >
                          {a.status === 'Blocked' ? 'Unblock' : 'Block'}
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
      {selectedAisle && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6 text-xs">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-[#0071C1]">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">{selectedAisle.code}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedAisle.id}</p>
                  </div>
                </div>
                <Button className="text-gray-400 hover:text-gray-600 font-bold" onClick={() => setSelectedAisle(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Associated Zone</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedAisle.zone}</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Pathing Status</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedAisle.status}</div>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-100 rounded-xl">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Transit Details & Congestion notes</div>
                <p className="font-medium text-slate-700 leading-relaxed mt-1">{selectedAisle.details}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-center mt-6 text-sm" onClick={() => setSelectedAisle(null)}>
              Close Details View
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

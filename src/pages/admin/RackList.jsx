import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Button, 
  Badge, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  SearchFilterBar 
} from 'shared-ui';
import { Layers, Plus, X } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';

export default function RackList() {
  const { racks, zones, bins, shelves } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRack, setSelectedRack] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filtered = racks.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.rackCode?.toLowerCase().includes(searchQuery.toLowerCase())
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
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">No racks matching criteria.</TableCell>
                </TableRow>
              ) : (
                pagedList.map((r) => {
                  const zone = zones.find(z => z.id === r.zoneId) || { name: 'Zone A' };
                  const shelfCount = shelves.filter(s => s.rackId === r.id).length || 4;
                  return (
                    <TableRow key={r.id} className="hover:bg-slate-50/10">
                      <TableCell>
                        <div className="font-bold text-gray-900 text-sm">{r.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{r.id}</div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600">{zone.name}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600 font-mono">
                        {zone.name === 'Zone B' ? 'Aisle 2' : zone.name === 'Zone C' ? 'Aisle 3' : 'Aisle 1'}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-slate-700">{shelfCount} Shelves</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-slate-700">{bins.length} Bins</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-gray-600" onClick={() => setSelectedRack(r)}>
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
                <button className="text-gray-400 hover:text-gray-600 font-bold" onClick={() => setSelectedRack(null)}>
                  <X className="w-5 h-5" />
                </button>
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
                  <div className="bg-slate-50 p-1.5 rounded">X: {selectedRack.x || 12}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Y: {selectedRack.y || 5}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Z: {selectedRack.z || 0}</div>
                </div>
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

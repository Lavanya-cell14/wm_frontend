import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from 'shared-ui';
import { Box, Plus, X } from 'lucide-react';

export default function BinList() {
  const { bins, inventory } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBin, setSelectedBin] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filtered = bins.filter(b => 
    b.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.zone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Box className="w-7 h-7 text-[#0071C1]" />
            Bins Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure physical storage bin coordinates, load capacities, and active product assignments.</p>
        </div>
        <Button className="gap-2" onClick={() => alert('Add Bin action pending backend API integration.')}>
          <Plus className="w-4 h-4" />
          Add Bin
        </Button>
      </div>

      {/* Table */}
      <Card className="border border-gray-100 shadow-xs">
        <div className="p-4 border-b border-gray-100 bg-slate-50/50">
          <SearchFilterBar 
            searchPlaceholder="Search bins by code..." 
            searchValue={searchQuery}
            onSearchChange={setSearchQuery} 
          />
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bin Code</TableHead>
                <TableHead>Shelf Level</TableHead>
                <TableHead>Rack Row</TableHead>
                <TableHead>Zone Name</TableHead>
                <TableHead>Occupancy Status</TableHead>
                <TableHead>Current Product</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">No bins matching criteria.</TableCell>
                </TableRow>
              ) : (
                pagedList.map((b) => {
                  const product = inventory.find(i => i.bin === b.code);
                  
                  let badgeVariant = 'default';
                  if (b.status === 'FULL') badgeVariant = 'error';
                  else if (b.status === 'EMPTY') badgeVariant = 'outline';
                  else badgeVariant = 'success';

                  return (
                    <TableRow key={b.code} className="hover:bg-slate-50/10">
                      <TableCell className="font-bold text-blue-700 font-mono text-sm">{b.code}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600 font-mono">{b.shelf}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600 font-mono">
                        {b.zone === 'Zone B' ? 'RACK-002' : b.zone === 'Zone C' ? 'RACK-004' : 'RACK-001'}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600">{b.zone}</TableCell>
                      <TableCell>
                        <Badge variant={badgeVariant} className="text-[10px] font-bold uppercase tracking-wider">
                          {b.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-medium">
                        {product ? `${product.name} (${product.sku})` : <span className="text-gray-400 font-normal">Empty Slot</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-gray-600" onClick={() => setSelectedBin(b)}>
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-blue-600" onClick={() => alert('Edit Bin status endpoint pending.')}>
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
      {selectedBin && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6 text-xs">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-[#0071C1]">
                    <Box className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-blue-700 font-mono text-base">{selectedBin.code}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{selectedBin.zone}</p>
                  </div>
                </div>
                <Button className="text-gray-400 hover:text-gray-600 font-bold" onClick={() => setSelectedBin(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Max Weight Capacity</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedBin.maxWeight || 150} kg</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Max Volume Limit</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedBin.maxCapacity} units</div>
                </div>
              </div>

              {/* Offset coordinates */}
              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-2">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">3D Spatial Position Offset</div>
                <div className="grid grid-cols-3 gap-2 font-mono text-center text-[10px]">
                  <div className="bg-slate-50 p-1.5 rounded">X: {selectedBin.x || 12}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Y: {selectedBin.y || 6}</div>
                  <div className="bg-slate-50 p-1.5 rounded">Z: {selectedBin.z || 1}</div>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-center mt-6 text-sm" onClick={() => setSelectedBin(null)}>
              Close Details View
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

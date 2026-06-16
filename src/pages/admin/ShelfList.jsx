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

export default function ShelfList() {
  const { shelves, racks, bins } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filtered = shelves.filter(s => 
    s.shelfLevel.toLowerCase().includes(searchQuery.toLowerCase())
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
            Shelves Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure layout vertical levels, load capacity thresholds, and coordinate indexes.</p>
        </div>
        <Button className="gap-2" onClick={() => alert('Add Shelf action pending backend API integration.')}>
          <Plus className="w-4 h-4" />
          Add Shelf
        </Button>
      </div>

      {/* Table */}
      <Card className="border border-gray-100 shadow-xs">
        <div className="p-4 border-b border-gray-100 bg-slate-50/50">
          <SearchFilterBar 
            searchPlaceholder="Search shelves by level..." 
            searchValue={searchQuery}
            onSearchChange={setSearchQuery} 
          />
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shelf Code</TableHead>
                <TableHead>Rack row</TableHead>
                <TableHead>Level Position</TableHead>
                <TableHead>Bin Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">No shelves matching criteria.</TableCell>
                </TableRow>
              ) : (
                pagedList.map((s) => {
                  const rack = racks.find(r => r.id === s.rackId) || { name: 'Rack 1' };
                  const binCount = bins.filter(b => b.shelf === s.shelfLevel).length || 5;
                  return (
                    <TableRow key={s.id} className="hover:bg-slate-50/10">
                      <TableCell>
                        <div className="font-bold text-gray-900 text-sm">{s.shelfLevel}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{s.id}</div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600">{rack.name}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600 font-mono">{s.shelfLevel}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-slate-700">{binCount} Bins</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-gray-600" onClick={() => setSelectedShelf(s)}>
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-blue-600" onClick={() => alert('Edit Shelf parameters endpoint pending.')}>
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
      {selectedShelf && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6 text-xs">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-[#0071C1]">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">{selectedShelf.shelfLevel}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedShelf.id}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 font-bold" onClick={() => setSelectedShelf(null)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Max Capacity Load</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedShelf.maxWeight} kg</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Level Index</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedShelf.shelfLevel}</div>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-100 rounded-xl">
                <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Vertical Offset Parameters</div>
                <p className="font-semibold text-slate-800 mt-2">Height from ground: 2.2 meters</p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-center mt-6 text-sm" onClick={() => setSelectedShelf(null)}>
              Close Details View
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

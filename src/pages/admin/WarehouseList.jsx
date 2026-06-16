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
import { Building2, Plus, MapPin, ChevronRight, Activity, Layers, X } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';

export default function WarehouseList() {
  const { warehouses, zones, bins, inventory } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWh, setSelectedWh] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filtered = warehouses.filter(wh => 
    wh.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    wh.location.toLowerCase().includes(searchQuery.toLowerCase())
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
          <p className="text-gray-500 text-sm mt-1">Configure physical warehouse properties and layout files.</p>
        </div>
        <Button className="gap-2" onClick={() => alert('Add Warehouse action pending backend API integration.')}>
          <Plus className="w-4 h-4" />
          Add Warehouse
        </Button>
      </div>

      {/* Table */}
      <Card className="border border-gray-100 shadow-xs">
        <div className="p-4 border-b border-gray-100 bg-slate-50/50">
          <SearchFilterBar 
            searchPlaceholder="Search warehouses by name or location..." 
            searchValue={searchQuery}
            onSearchChange={setSearchQuery} 
          />
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warehouse Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Total Zones</TableHead>
                <TableHead>Total Bins</TableHead>
                <TableHead>Occupancy %</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">No facilities matching criteria.</TableCell>
                </TableRow>
              ) : (
                pagedList.map((wh) => (
                  <TableRow key={wh.id} className="hover:bg-slate-50/10">
                    <TableCell>
                      <div className="font-bold text-gray-900 text-sm">{wh.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{wh.id}</div>
                    </TableCell>
                    <TableCell className="text-gray-600 text-xs font-semibold">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {wh.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{zones.filter(z => z.warehouse === wh.name).length || 4} Zones</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">{bins.length} Bins</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${wh.capacity > 85 ? 'bg-red-500' : 'bg-blue-600'}`}
                            style={{ width: `${wh.capacity || 40}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{wh.capacity || 40}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-gray-600" onClick={() => setSelectedWh(wh)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-blue-600" onClick={() => alert('Edit Warehouse configuration endpoint pending.')}>
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

      {/* Drawer Details Overlay */}
      {selectedWh && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div className="space-y-6 text-xs">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-[#0071C1]">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">{selectedWh.name}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedWh.id}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 font-bold" onClick={() => setSelectedWh(null)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Geographic Location</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedWh.location}</div>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-3 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase tracking-wider mb-1">Total Floor Size</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedWh.area}</div>
                </div>
              </div>

              {/* Status */}
              <div className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between">
                <div className="font-bold text-slate-800">Operational status</div>
                <Badge variant="success" className="uppercase font-bold tracking-wider">Active</Badge>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-gray-900 uppercase tracking-widest text-[10px]">Zone Layout Allocation</h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white">
                  {zones.filter(z => z.warehouse === selectedWh.name).map((zone) => (
                    <div key={zone.id} className="p-3 flex justify-between items-center hover:bg-slate-50/50">
                      <div>
                        <span className="font-bold text-slate-700">{zone.name}</span>
                        <span className="text-gray-400 ml-1.5 text-[10px]">({zone.type})</span>
                      </div>
                      <Badge variant="outline">{zone.capacityPercent}% Space Used</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-center mt-6 text-xs" onClick={() => setSelectedWh(null)}>
              Close Facility Overview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

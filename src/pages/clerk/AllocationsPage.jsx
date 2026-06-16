import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Badge, 
  Button, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  StatCard,
  SearchFilterBar
} from 'shared-ui';
import Pagination from '../../components/ui/Pagination';
import { Network, ChevronRight, Eye, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AllocationsPage() {
  const navigate = useNavigate();
  const { inboundReceipts = [], aiRecommendations = [] } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter items that have bin allocations
  const allocatedItems = inboundReceipts.filter(receipt => {
    const rec = aiRecommendations.find(a => a.inboundId === receipt.id) || {};
    const hasBin = receipt.bin || rec.bin;
    
    const matchesSearch = 
      receipt.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      receipt.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (receipt.bin && receipt.bin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.bin && rec.bin.toLowerCase().includes(searchQuery.toLowerCase()));

    return hasBin && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(allocatedItems.length / pageSize));
  const paginatedAllocated = allocatedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStorageStatusInfo = (status) => {
    switch (status) {
      case 'STORED':
        return { label: 'Stored', variant: 'success' };
      case 'IN_PROGRESS':
      case 'ASSIGNED_TO_STAFF':
        return { label: 'In Progress', variant: 'warning' };
      default:
        return { label: 'Allocated', variant: 'primary' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with breadcrumb trail */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <span>Receiving & Inventory Officer</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0071C1]">Allocations</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Network className="w-7 h-7 text-[#0071C1]" />
            Bin Allocation Monitor
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor real-time coordinates, shelf levels, and physical storage transit statuses of active allocations.
          </p>
        </div>
      </div>

      {/* Info banner explaining status stages */}
      <Card className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-100/30">
        <CardContent className="p-4 flex gap-3 items-start">
          <div className="p-2 bg-blue-100/60 rounded-lg text-blue-700">
            <Info className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">Allocation Life Cycle: </span>
            <span className="font-semibold text-slate-800">Allocated</span> (Slot assigned and awaiting staff pick) &rarr; <span className="font-semibold text-slate-800">In Progress</span> (Staff operator walking to destination) &rarr; <span className="font-semibold text-slate-800">Stored</span> (Barcode scanned at bin and committed to stock balance).
          </div>
        </CardContent>
      </Card>

      {/* Search Toolbar */}
      <div className="space-y-3">
        <SearchFilterBar 
          searchPlaceholder="Search active allocations by SKU, name, or bin..." 
          searchValue={searchQuery}
          onSearchChange={setSearchQuery} 
        />
      </div>

      {/* Allocations Table */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Zone Group</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Aisle</TableHead>
                <TableHead>Rack</TableHead>
                <TableHead>Shelf</TableHead>
                <TableHead>Bin</TableHead>
                <TableHead>Storage Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAllocated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-gray-500 font-semibold text-xs">
                    No active bin allocations recorded.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAllocated.map((receipt) => {
                  const rec = aiRecommendations.find(a => a.inboundId === receipt.id) || {};
                  const bin = receipt.bin || rec.bin || 'Unassigned';
                  const zone = receipt.zone || rec.zone || 'Unassigned';
                  const rack = receipt.rack || rec.rack || 'Unassigned';
                  const shelf = receipt.shelf || rec.shelf || 'Unassigned';
                  
                  // Derivations for layout parts
                  const zoneGroup = zone === 'Zone D' ? 'Cold Storage ZG' : 'Ambient Storage ZG';
                  const aisle = zone === 'Zone C' ? 'Aisle 3' : 'Aisle 1';

                  const statusInfo = getStorageStatusInfo(receipt.status);

                  return (
                    <TableRow key={receipt.id} className="hover:bg-slate-50/20 transition-colors">
                      <TableCell>
                        <div className="font-bold text-gray-900 text-xs">{receipt.productName}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">SKU: {receipt.sku} | Qty: {receipt.verifiedQuantity || receipt.quantityReceived}</div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-700">{zoneGroup}</TableCell>
                      <TableCell className="text-xs text-slate-700 font-semibold">{zone}</TableCell>
                      <TableCell className="text-xs text-slate-700 font-semibold font-mono">{aisle}</TableCell>
                      <TableCell className="text-xs text-slate-700 font-semibold font-mono">{rack}</TableCell>
                      <TableCell className="text-xs text-slate-700 font-semibold">{shelf}</TableCell>
                      <TableCell className="font-mono text-xs text-blue-700 font-bold bg-blue-50/40 px-2 py-0.5 rounded border border-blue-100/40 w-fit">
                        {bin}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="text-[9px] uppercase font-bold">
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[11px] h-7 px-2 font-semibold"
                            onClick={() => navigate(`/inventory/inbound`)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Inspect Inbound
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
              totalItems={allocatedItems.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

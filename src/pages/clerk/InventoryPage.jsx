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
  SearchFilterBar,
  Pagination
} from 'shared-ui';
import { Box, ChevronRight, Filter, Info, Wrench, AlertTriangle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InventoryPage() {
  const navigate = useNavigate();
  const { inventory = [] } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Calculate global inventory counts
  const totalStockCount = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const allocatedStockCount = inventory.reduce((sum, item) => sum + (item.reserved || 0), 0);
  const availableStockCount = Math.max(0, totalStockCount - allocatedStockCount - inventory.reduce((sum, item) => sum + (item.damaged || 0), 0));
  const lowStockCount = inventory.filter(item => (item.quantity || 0) <= (item.reorderLevel || 0) && (item.quantity || 0) > 0).length;
  const outOfStockCount = inventory.filter(item => (item.quantity || 0) === 0).length;

  // Filter list of inventory items
  const filteredInventory = inventory.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bin.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (stockFilter === 'LOW') {
      return matchesSearch && (p.quantity || 0) <= (p.reorderLevel || 0) && (p.quantity || 0) > 0;
    }
    if (stockFilter === 'OUT') {
      return matchesSearch && (p.quantity || 0) === 0;
    }
    if (stockFilter === 'RESERVED') {
      return matchesSearch && (p.reserved || 0) > 0;
    }
    return matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / pageSize));
  const paginatedInventory = filteredInventory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Header section with breadcrumb trail */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <span>Receiving & Inventory Officer</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0071C1]">Inventory</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Box className="w-7 h-7 text-[#0071C1]" />
            Inventory Balances
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor real-time physical stock counts, available balances, locks, and damaged quarantines.
          </p>
        </div>
        
        {/* Navigation shortcuts to adjustments / reserves */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="text-xs font-semibold gap-1.5"
            onClick={() => navigate('/inventory/adjust')}
          >
            <Wrench className="w-3.5 h-3.5" />
            Stock Adjust
          </Button>
          <Button 
            variant="outline" 
            className="text-xs font-semibold gap-1.5 text-red-600 border-red-100 hover:bg-red-50"
            onClick={() => navigate('/inventory/damaged')}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Damages
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Available Stock" value={availableStockCount} icon={Box} subtitle="Ready for allocations" />
        <StatCard title="Allocated Stock" value={allocatedStockCount} icon={Package} subtitle="Committed to active orders" />
        <StatCard title="Stored Stock" value={totalStockCount} icon={Box} subtitle="Physically present in bins" />
        <StatCard title="Low Stock Items" value={lowStockCount} icon={AlertTriangle} subtitle="Requires procurement action" />
        <StatCard title="Out of Stock" value={outOfStockCount} icon={AlertTriangle} subtitle="Completely depleted SKUs" />
      </div>

      {/* Filters Toolbar */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <SearchFilterBar 
              searchPlaceholder="Search inventory by SKU, name, or bin..." 
              searchValue={searchQuery}
              onSearchChange={setSearchQuery} 
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-500">Filter Stock State:</span>
            <select
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs font-semibold bg-white p-2"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="ALL">All Items</option>
              <option value="LOW">Low Stock Alerts</option>
              <option value="OUT">Out of Stock</option>
              <option value="RESERVED">Has Committed Holds</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Bin Location</TableHead>
                <TableHead>Total Quantity</TableHead>
                <TableHead>Allocated Quantity</TableHead>
                <TableHead>Stored Quantity</TableHead>
                <TableHead>Available Quantity</TableHead>
                <TableHead>Procurement Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500 font-semibold text-xs">
                    No inventory balances found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInventory.map((item) => {
                  const availableQty = Math.max(0, item.quantity - (item.reserved || 0) - (item.damaged || 0));
                  
                  return (
                    <TableRow key={item.sku} className="hover:bg-slate-50/20 transition-colors">
                      <TableCell>
                        <div className="font-bold text-gray-900 text-xs">{item.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.sku}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-blue-700 font-bold bg-blue-50/30 px-2 py-0.5 rounded border border-blue-100/40 w-fit">
                        {item.bin}
                      </TableCell>
                      <TableCell className="font-bold text-slate-800 text-xs">{item.quantity} units</TableCell>
                      <TableCell className="text-purple-700 font-semibold text-xs">{item.reserved || 0} units</TableCell>
                      <TableCell className="text-slate-700 text-xs font-semibold">{item.quantity} units</TableCell>
                      <TableCell className="text-emerald-700 font-bold text-xs">{availableQty} units</TableCell>
                      <TableCell>
                        {item.quantity === 0 ? (
                          <Badge variant="error" className="text-[9px] uppercase font-bold">Out of Stock</Badge>
                        ) : item.quantity <= item.reorderLevel ? (
                          <Badge variant="warning" className="text-[9px] uppercase font-bold">Low Stock</Badge>
                        ) : (
                          <Badge variant="success" className="text-[9px] uppercase font-bold">Healthy</Badge>
                        )}
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
              totalItems={filteredInventory.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

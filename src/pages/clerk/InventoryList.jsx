import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  StatusBadge, 
  SearchFilterBar, 
  AlertBanner 
} from 'shared-ui';
import Pagination from '../../components/ui/Pagination';
import { Box, Wrench, AlertTriangle, Package, ShieldCheck, Eye, Search } from 'lucide-react';

export default function InventoryList() {
  const navigate = useNavigate();
  const { inventory, zones } = useWarehouse();
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ['All', ...new Set(inventory.map(item => item.category))];
  const activeZones = ['All', ...new Set(zones.map(z => z.name))];

  // Reset pagination to page 1 when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedZone, selectedStatus]);

  // Filtering Logic
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesZone = selectedZone === 'All' || item.zone === selectedZone;
    
    let matchesStatus = true;
    const available = item.quantity - (item.reserved || 0) - (item.damaged || 0);
    
    if (selectedStatus === 'Low Stock') {
      matchesStatus = item.quantity <= item.reorderLevel;
    } else if (selectedStatus === 'Out of Stock') {
      matchesStatus = available === 0;
    } else if (selectedStatus === 'In Stock') {
      matchesStatus = available > item.reorderLevel;
    } else if (selectedStatus === 'Damaged') {
      matchesStatus = (item.damaged || 0) > 0;
    }

    return matchesSearch && matchesCategory && matchesZone && matchesStatus;
  });

  // Pagination parameters
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Box className="w-7 h-7 text-[#0071C1]" />
          Master Inventory List
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Perform digital cycle counts, view bin storage allocations, and analyze physical inventory reserves.
        </p>
      </div>

      {/* Dynamic Search & Filtering Panel */}
      <div className="space-y-3">
        <SearchFilterBar 
          searchPlaceholder="Search stock by SKU, product name, or barcode..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <Card className="border border-gray-100 shadow-xs">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wider block text-[10px]">Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)} 
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wider block text-[10px]">Warehouse Zone</label>
                <select 
                  value={selectedZone} 
                  onChange={(e) => setSelectedZone(e.target.value)} 
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                >
                  {activeZones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wider block text-[10px]">Stock Status</label>
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)} 
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                >
                  <option value="All">All Statuses</option>
                  <option value="In Stock">Healthy Stock (&gt; Reorder)</option>
                  <option value="Low Stock">Low Stock (&le; Reorder)</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Damaged">Quarantined Damage</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Inventory Tabular Ledger */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-100 flex flex-row justify-between items-center bg-slate-50/50">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Inventory Registry Ledger</CardTitle>
            <CardDescription>Live database counts showing physical vs. allocatable units.</CardDescription>
          </div>
          <Badge variant="primary">{filteredInventory.length} SKUs Found</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product / SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Bin Code</TableHead>
                <TableHead>Total Stock</TableHead>
                <TableHead>Allocated Holds</TableHead>
                <TableHead>Damaged Qty</TableHead>
                <TableHead>Available Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-gray-500 text-sm font-medium">
                    No items match the current search or filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInventory.map((item) => {
                  const available = Math.max(0, item.quantity - (item.reserved || 0) - (item.damaged || 0));
                  const isLow = item.quantity <= item.reorderLevel;
                  
                  let status = 'In Stock';
                  if (available === 0) status = 'Out of Stock';
                  else if (isLow) status = 'Low Stock';

                  return (
                    <TableRow key={item.sku} className="hover:bg-gray-50/50 transition-colors">
                      {/* Product SKU */}
                      <TableCell>
                        <div className="font-semibold text-gray-900 text-xs">{item.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.sku}</div>
                      </TableCell>
                      
                      {/* Category */}
                      <TableCell className="text-xs text-gray-600 font-medium">
                        {item.category}
                      </TableCell>
                      
                      {/* Bin Location */}
                      <TableCell>
                        <span className="font-mono text-[11px] text-blue-700 font-bold bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100">
                          {item.bin}
                        </span>
                      </TableCell>
                      
                      {/* Total Qty */}
                      <TableCell className="font-bold text-gray-900 text-xs">
                        {item.quantity} units
                      </TableCell>
                      
                      {/* Reserved Qty */}
                      <TableCell className="text-xs text-purple-600 font-semibold bg-purple-50/10">
                        {item.reserved || 0} units
                      </TableCell>
                      
                      {/* Damaged Qty */}
                      <TableCell className={`text-xs font-semibold ${item.damaged > 0 ? 'text-red-600 bg-red-50/10' : 'text-gray-400'}`}>
                        {item.damaged || 0} units
                      </TableCell>
                      
                      {/* Available Qty */}
                      <TableCell className="font-bold text-emerald-700 text-xs bg-emerald-50/10">
                        {available} units
                      </TableCell>
                      
                      {/* Status */}
                      <TableCell>
                        <StatusBadge status={status} />
                      </TableCell>
                      
                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex gap-1.5 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[11px] h-7 px-2 font-medium"
                            onClick={() => navigate('/inventory/lookup', { state: { sku: item.sku } })}
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-400 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[11px] h-7 px-2 font-medium"
                            onClick={() => navigate('/inventory/adjust', { state: { sku: item.sku } })}
                          >
                            <Wrench className="w-3.5 h-3.5 text-gray-400 mr-1" />
                            Adjust
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[11px] h-7 px-2 font-medium text-red-600 border-red-100 hover:bg-red-50"
                            onClick={() => navigate('/inventory/damaged', { state: { sku: item.sku } })}
                          >
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                            Damage
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredInventory.length}
            pageSize={itemsPerPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}

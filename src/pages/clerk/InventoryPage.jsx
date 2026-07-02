import React, { useState, useEffect, useMemo } from 'react';
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
import { Box, ChevronRight, Filter, Info, Wrench, AlertTriangle, Package, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../services/productService';
import { getInventory, getStorageAllocations } from '../../services/inventoryService';
import { getBins } from '../../services/warehouseStructureService';

// [TEMPORARY LOOKUP - REMOVE WHEN CATEGORY API IS FINALIZED]
const CATEGORY_LOOKUP = {
  '408dd788-9c1b-464c-94a4-866727fddbb8': 'Wireless Devices',
  'dc5340ad-fdb0-415d-8d94-75eff6a9610f': 'Power Chargers & Adapters',
  '1bd76b1d-75b0-4b61-ad85-0c16e7def7a3': 'Earbuds & Audio',
  '0c3d3fab-fbab-4306-8b60-e2e7676fdd3e': 'Fasteners & Hardware',
  'bfacdace-cde8-482b-8795-52ffd4edba92': 'Scanner Accessories',
};

const normalizeContextInventory = (item) => ({
  sku: item.sku,
  name: item.name,
  category: item.category,
  bin: item.bin,
  quantity: item.quantity,
  reserved: item.reserved,
  damaged: item.damaged,
  reorderLevel: item.reorderLevel,
});

export default function InventoryPage() {
  const navigate = useNavigate();
  const { inventory: contextInventory = [] } = useWarehouse();
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [searchVal, setSearchVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchVal);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchVal]);
  const [stockFilter, setStockFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setApiError(null);
        // [TEMPORARY LOG FOR VERIFICATION]
        console.warn("[InventoryPage] Calling APIs: /api/inventory/, /api/products/, /api/movements/allocations/, /api/bins/");
        const [invRes, productsRes, allocationsRes, binsRes] = await Promise.all([
          getInventory(),
          getProducts(),
          getStorageAllocations(),
          getBins()
        ]);
        if (!cancelled) {
          const mappedInventory = invRes.results.map(inv => {
            const product = productsRes.results.find(p => p.id === (inv.product?.id || inv.product));
            const sku = inv.sku || (product ? product.sku : '—');
            const name = inv.product_name || (product ? product.product_name : `Product ${inv.product}`);
            const category = inv.category || (product ? (CATEGORY_LOOKUP[product.category] || 'General') : 'General');
            
            // Resolve bin assignment
            const alloc = allocationsRes.results.find(a => a.product === (inv.product?.id || inv.product));
            let binCode = 'BIN-001';
            if (alloc) {
              const binObj = binsRes.results.find(b => b.id === alloc.bin);
              if (binObj) {
                binCode = binObj.bin_code;
              }
            }
            return {
              sku,
              name,
              category,
              bin: binCode,
              quantity: inv.total_quantity,
              reserved: inv.reserved_quantity,
              damaged: inv.damaged_quantity,
              reorderLevel: 10, // Derived Spec UI value
            };
          });
          setInventoryList(mappedInventory);
          // [TEMPORARY LOG FOR VERIFICATION]
          console.warn(`[InventoryPage] API Success. URL: /api/inventory/, Status: 200, Count: ${mappedInventory.length}, Fallback Used: false`);
        }
      } catch (err) {
        if (!cancelled) {
          const status = err.status || (err.code === 'NETWORK_ERROR' ? 0 : 'unknown');
          setApiError('Inventory Balances API unreachable — showing cached data.');
          const fallbackData = contextInventory.map(normalizeContextInventory);
          setInventoryList(fallbackData);
          // [TEMPORARY LOG FOR VERIFICATION]
          console.warn(`[InventoryPage] API Error. URL: /api/inventory/, Status: ${status}, Count: ${fallbackData.length}, Fallback Used: true`, err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [contextInventory]);

  const inventory = inventoryList;

  // Calculate global inventory counts (memoized)
  const stats = useMemo(() => {
    const totalStockCount = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const allocatedStockCount = inventory.reduce((sum, item) => sum + (item.reserved || 0), 0);
    const availableStockCount = Math.max(0, totalStockCount - allocatedStockCount - inventory.reduce((sum, item) => sum + (item.damaged || 0), 0));
    const lowStockCount = inventory.filter(item => (item.quantity || 0) <= (item.reorderLevel || 0) && (item.quantity || 0) > 0).length;
    const outOfStockCount = inventory.filter(item => (item.quantity || 0) === 0).length;

    return {
      totalStockCount,
      allocatedStockCount,
      availableStockCount,
      lowStockCount,
      outOfStockCount
    };
  }, [inventory]);

  // Filter list of inventory items (memoized)
  const filteredInventory = useMemo(() => {
    return inventory.filter(p => {
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
  }, [inventory, searchQuery, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / pageSize));
  const paginatedInventory = useMemo(() => {
    return filteredInventory.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredInventory, currentPage, pageSize]);

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
        <StatCard title="Available Stock" value={stats.availableStockCount} icon={Box} subtitle="Ready for allocations" />
        <StatCard title="Allocated Stock" value={stats.allocatedStockCount} icon={Package} subtitle="Committed to active orders" />
        <StatCard title="Stored Stock" value={stats.totalStockCount} icon={Box} subtitle="Physically present in bins" />
        <StatCard title="Low Stock Items" value={stats.lowStockCount} icon={AlertTriangle} subtitle="Requires procurement action" />
        <StatCard title="Out of Stock" value={stats.outOfStockCount} icon={AlertTriangle} subtitle="Completely depleted SKUs" />
      </div>

      {/* Filters Toolbar */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <SearchFilterBar 
              searchPlaceholder="Search inventory by SKU, name, or bin..." 
              searchValue={searchVal}
              onSearchChange={setSearchVal} 
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
        {/* Loading state */}
        {loading && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            Loading inventory balances from API...
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
              {loading ? (
                // Skeleton rows while loading
                [1, 2, 3].map((n) => (
                  <TableRow key={n}>
                    {[1, 2, 3, 4, 5, 6, 7].map((c) => (
                      <TableCell key={c}>
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedInventory.length === 0 ? (
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

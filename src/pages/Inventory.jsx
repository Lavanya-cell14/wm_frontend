import React, { useState, useEffect, useMemo } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { useAuth } from '../context/AuthContext';
import { adjustInventory } from '../services/inventoryService';
import { Card, CardContent, CardHeader, CardTitle, DashboardStatCard, Button, Badge, StatusBadge, SearchFilterBar, Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, AlertBanner, Modal, Input } from 'shared-ui';
import { Package, ShieldCheck, ShieldAlert, Settings, AlertCircle } from 'lucide-react';

export default function Inventory() {
  const { isLoading, error, inventory, adjustStock, markDamaged, warehouses, zones } = useWarehouse();
  const { user } = useAuth();
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modal control
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [damageQty, setDamageQty] = useState('');

  // Memoize expensive calculations to optimize unnecessarily triggered re-renders
  const stats = useMemo(() => {
    const totalStock = inventory.reduce((sum, i) => sum + i.quantity, 0);
    const reservedStock = inventory.reduce((sum, i) => sum + (i.reserved || 0), 0);
    const damagedStock = inventory.reduce((sum, i) => sum + (i.damaged || 0), 0);
    const availableStock = totalStock - reservedStock;
    const lowStockCount = inventory.filter(i => i.quantity <= 20).length;

    return {
      totalStock,
      reservedStock,
      damagedStock,
      availableStock,
      lowStockCount
    };
  }, [inventory]);

  const handleOpenAdjust = (item) => {
    setSelectedItem(item);
    setAdjustQty('');
    setShowAdjustModal(true);
  };

  const handleOpenDamage = (item) => {
    setSelectedItem(item);
    setDamageQty('');
    setShowDamageModal(true);
  };

  const submitAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedItem || !adjustQty) return;
    const qty = parseInt(adjustQty);
    const payload = {
      product_id: selectedItem.sku,
      bin_id: selectedItem.bin || 'BIN-001',
      quantity: qty,
      reason: 'Manual adjustment via inventory screen',
      operator: user?.email || 'operator',
    };
    try {
      console.warn(`[Inventory] Calling API: POST /api/inventory/adjust/ with payload`, payload);
      await adjustInventory(payload);
      console.warn(`[Inventory] API Success: POST /api/inventory/adjust/`);
    } catch (err) {
      console.error(`[Inventory] API Error falling back to context:`, err);
    }
    adjustStock(selectedItem.sku, qty, user);
    setShowAdjustModal(false);
  };

  const submitDamage = (e) => {
    e.preventDefault();
    if (!selectedItem || !damageQty) return;
    markDamaged(selectedItem.sku, parseInt(damageQty), user);
    setShowDamageModal(false);
  };

  // Reset pagination to page 1 when any search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedWarehouse, selectedZone, selectedStatus]);

  // Filter logic
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesWh = selectedWarehouse === 'All' || item.warehouse === selectedWarehouse;
    const matchesZone = selectedZone === 'All' || item.zone === selectedZone;
    
    let matchesStatus = true;
    if (selectedStatus === 'Low Stock') matchesStatus = item.quantity <= 20;
    if (selectedStatus === 'In Stock') matchesStatus = item.quantity > 20;
    if (selectedStatus === 'Out of Stock') matchesStatus = item.quantity === 0;

    return matchesSearch && matchesCat && matchesWh && matchesZone && matchesStatus;
  });

  // Unique categories
  const categories = ['All', ...new Set(inventory.map(i => i.category))];

  // Pagination parameters
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / itemsPerPage));
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071C1]"></div>
        <p className="text-sm text-gray-500 font-semibold animate-pulse">Syncing live inventory from Central API database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {error && (
        <AlertBanner 
          type="error" 
          title="API Synchronization Warning" 
          message={error} 
        />
      )}
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Package className="w-7 h-7 text-[#0071C1]" />
          Inventory Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">Audit warehouse products, adjust items levels, and record damaged goods in real-time.</p>
      </div>

      {/* KPI Stats - Hover scale transitions applied */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
          <DashboardStatCard title="Available Stock" value={stats.availableStock} icon={ShieldCheck} />
        </div>
        <div className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
          <DashboardStatCard title="Reserved Stock" value={stats.reservedStock} icon={Settings} />
        </div>
        <div className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
          <DashboardStatCard title="Damaged Stock" value={stats.damagedStock} icon={ShieldAlert} />
        </div>
        <div className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
          <DashboardStatCard title="Low Stock Items" value={stats.lowStockCount} icon={AlertCircle} trend={stats.lowStockCount > 3 ? 10 : 0} />
        </div>
      </div>

      {/* Filter panel */}
      <Card className="border border-gray-150 shadow-xs">
        <CardContent className="p-4 space-y-4">
          <SearchFilterBar 
            placeholder="Search stock by SKU, product name..." 
            onSearch={(val) => setSearchQuery(val)} 
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-gray-500 uppercase tracking-wide">Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full border border-gray-200 p-2 rounded-lg font-semibold outline-none focus:border-blue-500 text-gray-900 bg-white">
                {categories.map(c => <option key={c} value={c} className="text-gray-900 bg-white">{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-500 uppercase tracking-wide">Warehouse</label>
              <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} className="w-full border border-gray-200 p-2 rounded-lg font-semibold outline-none focus:border-blue-500 text-gray-900 bg-white">
                <option value="All" className="text-gray-900 bg-white">All Warehouses</option>
                {warehouses.map(w => <option key={w.id} value={w.name} className="text-gray-900 bg-white">{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-500 uppercase tracking-wide">Zone</label>
              <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className="w-full border border-gray-200 p-2 rounded-lg font-semibold outline-none focus:border-blue-500 text-gray-900 bg-white">
                <option value="All" className="text-gray-900 bg-white">All Zones</option>
                {zones.map(z => <option key={z.id} value={z.zone_name || z.name || ''} className="text-gray-900 bg-white">{z.zone_name || z.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-500 uppercase tracking-wide">Stock Status</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full border border-gray-200 p-2 rounded-lg font-semibold outline-none focus:border-blue-500 text-gray-900 bg-white">
                <option value="All" className="text-gray-900 bg-white">All Stock Levels</option>
                <option value="In Stock" className="text-gray-900 bg-white">In Stock</option>
                <option value="Low Stock" className="text-gray-900 bg-white">Low Stock</option>
                <option value="Out of Stock" className="text-gray-900 bg-white">Out of Stock</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table grid with sticky headers and responsive scrolling */}
      <Card className="border border-gray-150 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-full text-xs">
              <TableHeader className="sticky top-0 z-10 bg-[#F4FCFF]">
                <TableRow>
                  <TableHead className="font-bold">Product / SKU</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Bin Code</TableHead>
                  <TableHead className="font-bold">Total Qty</TableHead>
                  <TableHead className="font-bold">Reserved</TableHead>
                  <TableHead className="font-bold">Damaged</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Last Updated</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 font-bold text-gray-400">
                      No inventory matched filter requirements.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedInventory.map((item) => {
                    const isLow = item.quantity <= 20;
                    return (
                      <TableRow key={item.sku} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">{item.sku}</div>
                        </TableCell>
                        <TableCell className="text-gray-600 font-semibold">{item.category}</TableCell>
                        <TableCell className="font-mono text-xs text-blue-700 font-bold bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100 w-fit">
                          {item.bin}
                        </TableCell>
                        <TableCell className="font-bold text-gray-900">{item.quantity} units</TableCell>
                        <TableCell className="text-gray-600 font-semibold">{item.reserved || 0} units</TableCell>
                        <TableCell className="text-red-600 font-semibold">{item.damaged || 0} units</TableCell>
                        <TableCell>
                          <StatusBadge status={isLow ? 'warning' : 'success'} />
                        </TableCell>
                        <TableCell className="text-gray-400 text-[11px] font-semibold">{item.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" className="text-xs text-gray-600" onClick={() => handleOpenAdjust(item)}>
                              Adjust
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs text-red-600 border-red-100 hover:bg-red-50" onClick={() => handleOpenDamage(item)}>
                              Flag Damage
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredInventory.length}
            pageSize={itemsPerPage}
          />
        </CardContent>
      </Card>

      {/* ADJUST STOCK MODAL - MIGRATE TO REUSABLE MODAL & NIFO INPUT */}
      <Modal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title="Adjust Product Stock"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowAdjustModal(false)}>Cancel</Button>
            <Button type="button" onClick={submitAdjustment}>Submit Adjustment</Button>
          </>
        }
      >
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="font-bold text-slate-900 text-sm">{selectedItem?.name}</div>
          <div className="text-slate-500 font-mono mt-0.5">{selectedItem?.sku}</div>
          <div className="mt-2 text-slate-700 font-semibold">Current Level: {selectedItem?.quantity} units</div>
        </div>

        <Input 
          label="Adjustment Quantity (+/-)"
          type="number"
          value={adjustQty}
          onChange={(e) => setAdjustQty(e.target.value)}
          placeholder="e.g. 20 or -15" 
          required
        />
      </Modal>

      {/* DAMAGE STOCK MODAL - MIGRATE TO REUSABLE MODAL & NIFO INPUT */}
      <Modal
        isOpen={showDamageModal}
        onClose={() => setShowDamageModal(false)}
        title="Flag Damaged Inventory"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowDamageModal(false)}>Cancel</Button>
            <Button type="button" variant="danger" onClick={submitDamage}>Record Damage</Button>
          </>
        }
      >
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="font-bold text-slate-900 text-sm">{selectedItem?.name}</div>
          <div className="text-slate-500 font-mono mt-0.5">{selectedItem?.sku}</div>
          <div className="mt-2 text-slate-700 font-semibold">Available Units: {selectedItem?.quantity}</div>
        </div>

        <Input 
          label="Quantity Flagged Damaged"
          type="number"
          value={damageQty}
          onChange={(e) => setDamageQty(e.target.value)}
          placeholder="e.g. 5" 
          required
        />
      </Modal>
    </div>
  );
}

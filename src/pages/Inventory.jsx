import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { useAuth } from '../context/AuthContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import StatCard from '../components/dashboard/StatCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatusBadge from '../components/ui/StatusBadge';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Package, ShieldCheck, ShieldAlert, Settings, Plus, Minus, X, AlertCircle } from 'lucide-react';

export default function Inventory() {
  const { inventory, adjustStock, markDamaged, warehouses, zones } = useWarehouse();
  const { user } = useAuth();
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal control
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [damageQty, setDamageQty] = useState('');

  // Calculations
  const totalStock = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const reservedStock = inventory.reduce((sum, i) => sum + (i.reserved || 0), 0);
  const damagedStock = inventory.reduce((sum, i) => sum + (i.damaged || 0), 0);
  const availableStock = totalStock - reservedStock;
  const lowStockCount = inventory.filter(i => i.quantity <= 20).length;

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

  const submitAdjustment = (e) => {
    e.preventDefault();
    if (!selectedItem || !adjustQty) return;
    adjustStock(selectedItem.sku, parseInt(adjustQty), user);
    setShowAdjustModal(false);
  };

  const submitDamage = (e) => {
    e.preventDefault();
    if (!selectedItem || !damageQty) return;
    markDamaged(selectedItem.sku, parseInt(damageQty), user);
    setShowDamageModal(false);
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Package className="w-7 h-7 text-[#0071C1]" />
          Inventory Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">Audit warehouse products, adjust items levels, and record damaged goods in real-time.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Stock Units" value={totalStock} icon={Package} />
        <StatCard title="Available Stock" value={availableStock} icon={ShieldCheck} />
        <StatCard title="Reserved Stock" value={reservedStock} icon={Settings} />
        <StatCard title="Damaged Stock" value={damagedStock} icon={ShieldAlert} />
        <StatCard title="Low Stock Items" value={lowStockCount} icon={AlertCircle} trend={lowStockCount > 3 ? 10 : 0} />
      </div>

      {/* Filter panel */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-4 space-y-4">
          <SearchFilterBar 
            placeholder="Search stock by SKU, product name..." 
            onSearch={(val) => setSearchQuery(val)} 
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-gray-500 uppercase">Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full border border-gray-200 p-2 rounded-lg font-semibold outline-none focus:border-blue-500">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-500 uppercase">Warehouse</label>
              <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} className="w-full border border-gray-200 p-2 rounded-lg font-semibold outline-none focus:border-blue-500">
                <option value="All">All Warehouses</option>
                {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-500 uppercase">Zone</label>
              <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className="w-full border border-gray-200 p-2 rounded-lg font-semibold outline-none focus:border-blue-500">
                <option value="All">All Zones</option>
                {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-500 uppercase">Stock Status</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full border border-gray-200 p-2 rounded-lg font-semibold outline-none focus:border-blue-500">
                <option value="All">All Stock Levels</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product / SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Bin Code</TableHead>
                <TableHead>Total Qty</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Damaged</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const isLow = item.quantity <= 20;
                return (
                  <TableRow key={item.sku} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{item.sku}</div>
                    </TableCell>
                    <TableCell className="text-gray-600 text-xs font-semibold">{item.category}</TableCell>
                    <TableCell className="font-mono text-xs text-blue-700 font-bold bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100 w-fit">
                      {item.bin}
                    </TableCell>
                    <TableCell className="font-bold text-gray-900 text-sm">{item.quantity} units</TableCell>
                    <TableCell className="text-gray-600 text-xs font-semibold">{item.reserved || 0} units</TableCell>
                    <TableCell className="text-red-600 text-xs font-semibold">{item.damaged || 0} units</TableCell>
                    <TableCell>
                      <StatusBadge status={isLow ? 'warning' : 'success'} />
                    </TableCell>
                    <TableCell className="text-gray-400 text-[11px] font-semibold">{item.lastUpdated}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs text-gray-600" onClick={() => handleOpenAdjust(item)}>
                          Adjust
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs text-red-600 border-red-100 hover:bg-red-50" onClick={() => handleOpenDamage(item)}>
                          Flag Damage
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ADJUST STOCK MODAL */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submitAdjustment} className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Adjust Product Stock</h3>
              </div>
              <button type="button" className="text-slate-400 hover:text-white font-semibold text-lg" onClick={() => setShowAdjustModal(false)}>×</button>
            </div>
            
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="font-bold text-slate-900 text-sm">{selectedItem.name}</div>
                <div className="text-slate-500 font-mono mt-0.5">{selectedItem.sku}</div>
                <div className="mt-2 text-slate-700 font-semibold">Current Level: {selectedItem.quantity} units</div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase tracking-wider">Adjustment Quantity (+/-)</label>
                <input 
                  type="number" 
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="e.g. 20 or -15" 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowAdjustModal(false)}>Cancel</Button>
              <Button type="submit">Submit Adjustment</Button>
            </div>
          </form>
        </div>
      )}

      {/* DAMAGE STOCK MODAL */}
      {showDamageModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submitDamage} className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-sm">Flag Damaged Inventory</h3>
              </div>
              <button type="button" className="text-slate-400 hover:text-white font-semibold text-lg" onClick={() => setShowDamageModal(false)}>×</button>
            </div>
            
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="font-bold text-slate-900 text-sm">{selectedItem.name}</div>
                <div className="text-slate-500 font-mono mt-0.5">{selectedItem.sku}</div>
                <div className="mt-2 text-slate-700 font-semibold">Available Units: {selectedItem.quantity}</div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase tracking-wider">Quantity Flagged Damaged</label>
                <input 
                  type="number" 
                  value={damageQty}
                  onChange={(e) => setDamageQty(e.target.value)}
                  placeholder="e.g. 5" 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowDamageModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Record Damage</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

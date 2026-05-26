import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import StatCard from '../components/dashboard/StatCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatusBadge from '../components/ui/StatusBadge';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { ArrowUpFromLine, Plus, Clock, UserCheck, X } from 'lucide-react';

export default function Orders() {
  const { orders, createOrder, dispatchOrder } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states - Add
  const [customerName, setCustomerName] = useState('');
  const [productCount, setProductCount] = useState('');

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!customerName || !productCount) return;
    createOrder({
      customer: customerName,
      productCount: parseInt(productCount)
    });
    setCustomerName('');
    setProductCount('');
    setShowAddModal(false);
  };

  const filteredOrders = orders.filter(ord => 
    ord.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ord.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ArrowUpFromLine className="w-7 h-7 text-[#0071C1]" />
            Outbound Customer Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">Audit customer shipments dispatch queues, picking stages, and fulfillment rates.</p>
        </div>
        <Button className="gap-1.5" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Create Customer Order
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Fulfillment Rate" value="98.7%" icon={ArrowUpFromLine} />
        <StatCard title="Pending Outbounds" value={orders.filter(o => o.status !== 'Dispatched').length} icon={Clock} />
        <StatCard title="Dispatched Today" value={orders.filter(o => o.status === 'Dispatched').length} icon={UserCheck} />
        <StatCard title="Average Dispatch Time" value="25 mins" icon={Clock} />
      </div>

      {/* Filters */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-4">
          <SearchFilterBar 
            placeholder="Search customer orders by ID or customer name..." 
            onSearch={(val) => setSearchQuery(val)} 
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Expected Dispatch</TableHead>
                <TableHead>Item Count</TableHead>
                <TableHead>Fulfillment Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((ord) => (
                <TableRow key={ord.id}>
                  <TableCell className="font-bold text-gray-900 font-mono text-sm">{ord.id}</TableCell>
                  <TableCell className="text-gray-600 text-sm font-semibold">{ord.customer}</TableCell>
                  <TableCell className="text-gray-500 text-xs font-semibold">{ord.dispatchTime}</TableCell>
                  <TableCell className="font-bold text-gray-900 text-xs">{ord.productCount} units</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${ord.status === 'Dispatched' ? 'bg-green-500' : 'bg-blue-600 animate-pulse'}`} 
                          style={{ width: `${ord.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{ord.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ord.status === 'Dispatched' ? 'success' : ord.status === 'In Progress' ? 'warning' : 'info'} />
                  </TableCell>
                  <TableCell className="text-right">
                    {ord.status !== 'Dispatched' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold" onClick={() => dispatchOrder(ord.id)}>
                        Dispatch
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CREATE ORDER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateOrder} className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ArrowUpFromLine className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Create Customer Outbound Order</h3>
              </div>
              <button type="button" className="text-slate-400 hover:text-white font-semibold text-lg" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase tracking-wider">Customer Client Name</label>
                <input 
                  type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} 
                  placeholder="e.g. NextGen Systems" className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500" required
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase tracking-wider">Total Product Items Qty</label>
                <input 
                  type="number" value={productCount} onChange={(e) => setProductCount(e.target.value)} 
                  placeholder="e.g. 15" className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500" required
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit">Create Order</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

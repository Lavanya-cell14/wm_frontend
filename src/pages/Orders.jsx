import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { Card, CardContent, CardHeader, CardTitle, DashboardStatCard, Button, Badge, StatusBadge, SearchFilterBar, Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Modal, Input } from 'shared-ui';
import { ArrowUpFromLine, Clock, UserCheck } from 'lucide-react';

export default function Orders() {
  const { orders, createOrder, dispatchOrder, generateNextId } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Form states - Add
  const [customerName, setCustomerName] = useState('');
  const [productCount, setProductCount] = useState('');

  const nextOrderId = generateNextId('ORD-', orders.map(o => o.id));

  const handleCreateOrder = (e) => {
    if (e) e.preventDefault();
    if (!customerName || !productCount) return;
    createOrder({
      customer: customerName,
      productCount: parseInt(productCount)
    });
    setCustomerName('');
    setProductCount('');
    setShowAddModal(false);
  };

  // Reset pagination to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredOrders = orders.filter(ord => 
    ord.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ord.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination parameters
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 select-none">
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
          Create Customer Order
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
          <DashboardStatCard title="Fulfillment Rate" value="98.7%" icon={ArrowUpFromLine} />
        </div>
        <div className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
          <DashboardStatCard title="Pending Outbounds" value={orders.filter(o => o.status !== 'Dispatched').length} icon={Clock} />
        </div>
        <div className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
          <DashboardStatCard title="Dispatched Today" value={orders.filter(o => o.status === 'Dispatched').length} icon={UserCheck} />
        </div>
        <div className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
          <DashboardStatCard title="Average Dispatch Time" value="25 mins" icon={Clock} />
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-gray-150 shadow-xs">
        <CardContent className="p-4">
          <SearchFilterBar 
            placeholder="Search customer orders by ID or customer name..." 
            onSearch={(val) => setSearchQuery(val)} 
          />
        </CardContent>
      </Card>

      {/* Table grid with sticky headers and responsive scrolling */}
      <Card className="border border-gray-150 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-full text-xs">
              <TableHeader className="sticky top-0 z-10 bg-[#F4FCFF]">
                <TableRow>
                  <TableHead className="font-bold">Order ID</TableHead>
                  <TableHead className="font-bold">Customer</TableHead>
                  <TableHead className="font-bold">Expected Dispatch</TableHead>
                  <TableHead className="font-bold">Item Count</TableHead>
                  <TableHead className="font-bold">Fulfillment Progress</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 font-bold text-gray-400">
                      No outbound orders matched criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((ord) => (
                    <TableRow key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-bold text-gray-900 font-mono text-sm">{ord.id}</TableCell>
                      <TableCell className="text-gray-600 font-semibold">{ord.customer}</TableCell>
                      <TableCell className="text-gray-500 font-semibold">{ord.dispatchTime}</TableCell>
                      <TableCell className="font-bold text-gray-900">{ord.productCount} units</TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredOrders.length}
            pageSize={itemsPerPage}
          />
        </CardContent>
      </Card>

      {/* CREATE ORDER MODAL - REUSABLE MODAL & NIFO INPUT */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Customer Outbound Order"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="button" onClick={handleCreateOrder}>Create Order</Button>
          </>
        }
      >
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="text-slate-500 font-bold text-[10px] uppercase">Assigned Order ID</div>
          <div className="text-[#0071C1] font-extrabold text-sm font-mono mt-0.5">{nextOrderId}</div>
        </div>

        <Input 
          label="Customer Client Name"
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)} 
          placeholder="e.g. NextGen Systems"
          required
        />
        
        <Input 
          label="Total Product Items Qty"
          type="number"
          value={productCount}
          onChange={(e) => setProductCount(e.target.value)} 
          placeholder="e.g. 15"
          required
        />
      </Modal>
    </div>
  );
}

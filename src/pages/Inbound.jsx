import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { Card, CardContent, CardHeader, CardTitle, DashboardStatCard, Button, Badge, StatusBadge, SearchFilterBar, Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, AlertBanner, Modal, Input } from 'shared-ui';
import { ArrowDownToLine, Clock, UserCheck, User, Loader2 } from 'lucide-react';

export default function Inbound() {
  const { inboundTasks, createInboundShipment, assignInboundStaff, inventory, generateNextId, isLoading, error } = useWarehouse();
  
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form states - Add
  const [supplierName, setSupplierName] = useState('');
  const [productName, setProductName] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [priority, setPriority] = useState('Medium');

  // Form states - Assign
  const [staffName, setStaffName] = useState('Warehouse Staff');

  const handleOpenAddModal = () => {
    const nextSku = generateNextId('PRD-', inventory.map(item => item.sku));
    setSkuCode(nextSku);
    setSupplierName('');
    setProductName('');
    setQuantity('');
    setPriority('Medium');
    setShowAddModal(true);
  };

  const handleCreateShipment = (e) => {
    if (e) e.preventDefault();
    if (!supplierName || !productName || !quantity) return;
    createInboundShipment({
      supplier: supplierName,
      product: productName,
      sku: skuCode,
      quantity: parseInt(quantity),
      priority
    });
    setSupplierName('');
    setProductName('');
    setSkuCode('');
    setQuantity('');
    setShowAddModal(false);
  };

  const handleOpenAssign = (task) => {
    setSelectedTask(task);
    setShowAssignModal(true);
  };

  const handleAssignStaff = (e) => {
    if (e) e.preventDefault();
    if (!selectedTask || !staffName) return;
    assignInboundStaff(selectedTask.id, staffName);
    setShowAssignModal(false);
  };

  // Reset pagination to page 1 when any search/tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-[#0071C1] animate-spin" />
        <span className="text-sm font-semibold text-slate-500 animate-pulse">Querying inbound cloud shipments catalog...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <AlertBanner type="error" message={error} />
      </div>
    );
  }

  const filteredShipments = inboundTasks.filter(ship => {
    const matchesTab = ship.status === activeTab;
    const matchesSearch = ship.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ship.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ship.product.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Pagination parameters
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / itemsPerPage));
  const paginatedShipments = filteredShipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ArrowDownToLine className="w-7 h-7 text-[#0071C1]" />
            Inbound Shipment Logs
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review expected cargo, authorize new supplier loads, and assign verification teams.</p>
        </div>
        <Button className="gap-1.5" onClick={handleOpenAddModal}>
          Authorize Shipment
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
          <DashboardStatCard title="Total Shipments Logged" value={inboundTasks.length} icon={ArrowDownToLine} />
        </div>
        <div className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
          <DashboardStatCard title="Pending Shipments" value={inboundTasks.filter(t => t.status === 'Pending').length} icon={Clock} />
        </div>
        <div className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
          <DashboardStatCard title="Receiving Verification" value={inboundTasks.filter(t => t.status === 'In Progress').length} icon={UserCheck} />
        </div>
        <div className="hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
          <DashboardStatCard title="Fully Received" value={inboundTasks.filter(t => t.status === 'Completed').length} icon={StatusBadge} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['Pending', 'In Progress', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
            className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 outline-none ${
              activeTab === tab 
                ? 'border-[#0071C1] text-[#0071C1]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === tab ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {inboundTasks.filter(t => t.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="border border-gray-150 shadow-xs">
        <CardContent className="p-4">
          <SearchFilterBar 
            placeholder="Search shipments by ID, supplier, or product name..." 
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
                  <TableHead className="font-bold">Shipment ID</TableHead>
                  <TableHead className="font-bold">Supplier</TableHead>
                  <TableHead className="font-bold">Expected / ETA</TableHead>
                  <TableHead className="font-bold">Quantity / SKU</TableHead>
                  <TableHead className="font-bold">Priority</TableHead>
                  <TableHead className="font-bold">Assigned Staff</TableHead>
                  <TableHead className="font-bold">Progress Tracker</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 font-bold text-gray-400">
                      No inbound shipments matched selection.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedShipments.map((ship) => (
                    <TableRow key={ship.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-bold text-gray-900 font-mono text-sm">{ship.id}</TableCell>
                      <TableCell className="text-gray-600 font-semibold">{ship.supplier}</TableCell>
                      <TableCell className="text-gray-500 font-semibold">{ship.expectedArrival}</TableCell>
                      <TableCell>
                        <div className="font-bold text-gray-900 text-sm">{ship.product}</div>
                        <div className="text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded w-fit font-bold font-mono mt-1 border border-blue-100">
                          {ship.quantity} units ({ship.sku})
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ship.priority === 'High' ? 'error' : 'warning'}>{ship.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {ship.assignedStaff}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${ship.status === 'Completed' ? 'bg-green-500' : 'bg-blue-600'}`} 
                            style={{ width: ship.status === 'Completed' ? '100%' : ship.status === 'In Progress' ? '50%' : '10%' }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {ship.status !== 'Completed' && (
                          <Button variant="outline" size="sm" className="text-xs text-gray-600 border-gray-200 hover:bg-gray-50" onClick={() => handleOpenAssign(ship)}>
                            Assign Staff
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
            totalItems={filteredShipments.length}
            pageSize={itemsPerPage}
          />
        </CardContent>
      </Card>

      {/* AUTHORIZE SHIPMENT MODAL - REUSABLE MODAL & NIFO INPUT */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Authorize Inbound Shipment"
        maxWidth="max-w-md"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="button" onClick={handleCreateShipment}>Authorize Cargo</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Supplier Partner"
            type="text" 
            value={supplierName} 
            onChange={(e) => setSupplierName(e.target.value)} 
            placeholder="e.g. Dell Logistics" 
            required
          />
          
          <Input 
            label="Product Name"
            type="text" 
            value={productName} 
            onChange={(e) => setProductName(e.target.value)} 
            placeholder="e.g. Dell Laptop" 
            required
          />
          
          <Input 
            label="SKU Code (Auto-allocated)"
            type="text" 
            value={skuCode} 
            disabled 
            className="cursor-not-allowed bg-slate-50 border-gray-300 text-slate-400"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Shipment Quantity"
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              placeholder="e.g. 50" 
              required
            />
            
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-medium text-[#4A4D4E]">Priority Level</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-md border-[#56A8F0] border-[1px] h-[36px] px-3 w-full text-sm text-[#4A4D4E] focus:ring-1 focus:ring-[#56A8F0] focus:border-[#56A8F0] outline-none">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* ASSIGN STAFF MODAL - REUSABLE MODAL & NIFO SELECTIONS */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Personnel"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button type="button" onClick={handleAssignStaff}>Assign Task</Button>
          </>
        }
      >
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
          <div className="font-bold text-slate-900 text-sm">Shipment: {selectedTask?.id}</div>
          <div className="text-slate-500 font-semibold mt-1">Supplier: {selectedTask?.supplier}</div>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[13px] font-medium text-[#4A4D4E]">Select Staff Member</label>
          <select value={staffName} onChange={(e) => setStaffName(e.target.value)} className="rounded-md border-[#56A8F0] border-[1px] h-[36px] px-3 w-full text-sm text-[#4A4D4E] focus:ring-1 focus:ring-[#56A8F0] focus:border-[#56A8F0] outline-none">
            <option>Warehouse Staff</option>
            <option>Inventory Clerk</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}

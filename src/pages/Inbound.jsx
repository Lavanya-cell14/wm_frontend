import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import StatCard from '../components/dashboard/StatCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatusBadge from '../components/ui/StatusBadge';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { ArrowDownToLine, Plus, Clock, UserCheck, X, User } from 'lucide-react';

export default function Inbound() {
  const { inboundTasks, createInboundShipment, assignInboundStaff } = useWarehouse();
  
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const handleCreateShipment = (e) => {
    e.preventDefault();
    if (!supplierName || !productName || !quantity) return;
    createInboundShipment({
      supplier: supplierName,
      product: productName,
      sku: skuCode || 'SKU-9999',
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
    e.preventDefault();
    if (!selectedTask || !staffName) return;
    assignInboundStaff(selectedTask.id, staffName);
    setShowAssignModal(false);
  };

  const filteredShipments = inboundTasks.filter(ship => {
    const matchesTab = ship.status === activeTab;
    const matchesSearch = ship.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ship.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ship.product.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ArrowDownToLine className="w-7 h-7 text-[#0071C1]" />
            Inbound Shipment Logs
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review expected cargo, authorize new supplier loads, and assign verification teams.</p>
        </div>
        <Button className="gap-1.5" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Authorize Shipment
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Shipments Logged" value={inboundTasks.length} icon={ArrowDownToLine} />
        <StatCard title="Pending Shipments" value={inboundTasks.filter(t => t.status === 'Pending').length} icon={Clock} />
        <StatCard title="Receiving Verification" value={inboundTasks.filter(t => t.status === 'In Progress').length} icon={UserCheck} />
        <StatCard title="Fully Received" value={inboundTasks.filter(t => t.status === 'Completed').length} icon={StatusBadge} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['Pending', 'In Progress', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
            className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
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
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-4">
          <SearchFilterBar 
            placeholder="Search shipments by ID, supplier, or product name..." 
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
                <TableHead>Shipment ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Expected / ETA</TableHead>
                <TableHead>Quantity / SKU</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned Staff</TableHead>
                <TableHead>Progress Tracker</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.map((ship) => (
                <TableRow key={ship.id}>
                  <TableCell className="font-bold text-gray-900 font-mono text-sm">{ship.id}</TableCell>
                  <TableCell className="text-gray-600 text-sm font-semibold">{ship.supplier}</TableCell>
                  <TableCell className="text-gray-500 text-xs font-semibold">{ship.expectedArrival}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900 text-sm">{ship.product}</div>
                    <div className="text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded w-fit font-bold font-mono mt-1">
                      {ship.quantity} units ({ship.sku})
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ship.priority === 'High' ? 'error' : 'warning'}>{ship.priority}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm font-semibold">
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
                      <Button variant="outline" size="sm" className="gap-1 text-xs text-gray-600" onClick={() => handleOpenAssign(ship)}>
                        Assign Staff
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AUTHORIZE SHIPMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateShipment} className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Authorize Inbound Shipment</h3>
              </div>
              <button type="button" className="text-slate-400 hover:text-white font-semibold text-lg" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider">Supplier Partner</label>
                  <input 
                    type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} 
                    placeholder="e.g. Dell Logistics" className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500" required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider">Product Name</label>
                  <input 
                    type="text" value={productName} onChange={(e) => setProductName(e.target.value)} 
                    placeholder="e.g. Dell Laptop" className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500" required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider">SKU Code</label>
                  <input 
                    type="text" value={skuCode} onChange={(e) => setSkuCode(e.target.value)} 
                    placeholder="e.g. SKU-1001" className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider">Shipment Quantity</label>
                  <input 
                    type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} 
                    placeholder="e.g. 50" className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500" required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider">Priority Level</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit">Authorize Cargo</Button>
            </div>
          </form>
        </div>
      )}

      {/* ASSIGN STAFF MODAL */}
      {showAssignModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAssignStaff} className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Assign Personnel</h3>
              </div>
              <button type="button" className="text-slate-400 hover:text-white font-semibold text-lg" onClick={() => setShowAssignModal(false)}>×</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="font-bold text-slate-900 text-sm">Shipment: {selectedTask.id}</div>
                <div className="text-slate-500 font-semibold mt-1">Supplier: {selectedTask.supplier}</div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase tracking-wider">Select Operator / Staff</label>
                <select value={staffName} onChange={(e) => setStaffName(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500">
                  <option>Warehouse Staff</option>
                  <option>Route Operator</option>
                  <option>Inventory Clerk</option>
                  <option>Dave Operator</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
              <Button type="submit">Assign Task</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

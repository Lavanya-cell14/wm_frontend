import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../context/WarehouseContext';
import StatCard from '../components/dashboard/StatCard';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  AlertBanner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from 'shared-ui';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import { 
  Package, Box, Building2, LayoutGrid, CheckCircle2, TrendingUp, AlertTriangle, 
  ArrowDownToLine, ArrowUpFromLine, Activity, Lightbulb, Clock, Layers, 
  Map, UserCheck, ShieldAlert, Cpu, Sparkles, Navigation, User, ArrowRight, Weight, Ruler
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    isLoading, error, inventory, warehouses, zones, bins, movements, 
    aiRecommendations, auditLogs, workers, inboundReceipts, 
    generateBinRecommendation, acceptAiRecommendation, rejectAiRecommendation, 
    assignPutawayTask, putawayTasks, damagedRecords 
  } = useWarehouse();

  // Selected receipt for dispatch modal
  const [selectedReceiptForAssign, setSelectedReceiptForAssign] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignPriority, setAssignPriority] = useState('Medium');

  // Selected bin detail modal
  const [selectedBinDetail, setSelectedBinDetail] = useState(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);

  const [toastMessage, setToastMessage] = useState('');

  // Pagination States
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [tasksPage, setTasksPage] = useState(1);
  const dashboardPageSize = 5;

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (isLoading) {
    return <div className="p-6 text-center text-slate-500 font-semibold">Loading manager dashboard telemetry...</div>;
  }

  // Derived counts for the 12 KPIs
  const totalInboundToday = inboundReceipts.length;
  const waitingBinAssignment = inboundReceipts.filter(r => r.status === 'WAITING_FOR_BIN_ASSIGNMENT').length;
  const suggestionsPendingReview = aiRecommendations.filter(r => r.status === 'PENDING_REVIEW').length;
  const approvedBinSuggestions = aiRecommendations.filter(r => r.status === 'APPROVED' || r.status === 'RECOMMENDATION_APPROVED').length;
  
  const tasksAssigned = putawayTasks.filter(t => t.status === 'ASSIGNED' || t.status === 'Pending').length;
  const tasksInProgress = putawayTasks.filter(t => t.status === 'In Progress' || t.status === 'IN_PROGRESS').length;
  const tasksCompletedToday = movements.filter(m => m.type === 'Putaway' && m.status === 'Completed').length;
  
  const pendingPutawayItems = inboundReceipts.filter(r => 
    r.status === 'BIN_SUGGESTED' || 
    r.status === 'RECOMMENDATION_APPROVED' || 
    r.status === 'ASSIGNED_TO_STAFF' || 
    r.status === 'IN_PROGRESS'
  ).length;

  const warehouseCapacityUsage = '84.2%';
  const lowStockAlerts = inventory.filter(item => item.quantity <= 20).length;
  const damagedStockAlerts = damagedRecords ? damagedRecords.length : 1;
  const binUtilizationPercentage = '78%';

  // Handles clicking "Generate AI Recommendation"
  const handleGenerateRecommendation = (receiptId, productName) => {
    generateBinRecommendation(receiptId);
    triggerToast(`AI placement slot analysis generated for "${productName}"!`);
  };

  // Handles approving recommendation
  const handleApproveRecommendation = (rec) => {
    acceptAiRecommendation(rec.id);
    triggerToast(`AI suggested slotting for "${rec.productName}" APPROVED! Ready for personnel assignment.`);
  };

  // Handles rejecting recommendation
  const handleRejectRecommendation = (rec) => {
    rejectAiRecommendation(rec.id);
    triggerToast(`AI suggestion for "${rec.productName}" rejected. Placement returned to pending assignment queue.`);
  };

  // Handles dispatch submit
  const handleDispatchSubmit = (e) => {
    e.preventDefault();
    if (!selectedReceiptForAssign || !selectedStaffId) return;
    
    const staffMember = workers.find(w => w.id === selectedStaffId) || { name: 'Warehouse Staff' };
    assignPutawayTask(selectedReceiptForAssign.id, staffMember.id, staffMember.name, assignPriority);
    
    triggerToast(`Task successfully dispatched to ${staffMember.name}!`);
    setSelectedReceiptForAssign(null);
    setSelectedStaffId('');
  };

  // Opens assign modal
  const handleOpenAssign = (receipt) => {
    setSelectedReceiptForAssign(receipt);
    const firstStaff = workers.find(w => w.role === 'STAFF') || workers[0];
    setSelectedStaffId(firstStaff ? firstStaff.id : '');
    setAssignPriority('Medium');
  };

  // Queues & Paginations
  const pendingReceipts = inboundReceipts.filter(r => r.status === 'WAITING_FOR_BIN_ASSIGNMENT');
  const pendingTotalPages = Math.max(1, Math.ceil(pendingReceipts.length / dashboardPageSize));
  const activePendingPage = Math.min(pendingPage, pendingTotalPages);
  const paginatedPending = pendingReceipts.slice((activePendingPage - 1) * dashboardPageSize, activePendingPage * dashboardPageSize);

  const approvedReceipts = inboundReceipts.filter(r => r.status === 'RECOMMENDATION_APPROVED');
  const approvedTotalPages = Math.max(1, Math.ceil(approvedReceipts.length / dashboardPageSize));
  const activeApprovedPage = Math.min(approvedPage, approvedTotalPages);
  const paginatedApproved = approvedReceipts.slice((activeApprovedPage - 1) * dashboardPageSize, activeApprovedPage * dashboardPageSize);

  const tasksTotalPages = Math.max(1, Math.ceil(putawayTasks.length / dashboardPageSize));
  const activeTasksPage = Math.min(tasksPage, tasksTotalPages);
  const paginatedTasks = putawayTasks.slice((activeTasksPage - 1) * dashboardPageSize, activeTasksPage * dashboardPageSize);

  return (
    <div className="space-y-6 select-none">
      {error && <AlertBanner type="error" title="Synchronization Error" message={error} />}

      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#0071C1]" />
            Manager Command & Dispatch Center
          </h1>
          <p className="text-gray-500 text-sm mt-1">Supervise warehouse operations, authorize AI bin recommends, and allocate staff workflow directives.</p>
        </div>
      </div>

      {/* Grid of the 12 metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title="Total Inbound Today" value={totalInboundToday} icon={ArrowDownToLine} />
        <StatCard title="Waiting Bin Assignment" value={waitingBinAssignment} icon={Clock} />
        <StatCard title="Suggestions Pending Review" value={suggestionsPendingReview} icon={Lightbulb} trend={2} trendLabel="recs" />
        <StatCard title="Approved Suggestions" value={approvedBinSuggestions} icon={CheckCircle2} />
        <StatCard title="Staff Tasks Assigned" value={tasksAssigned} icon={UserCheck} />
        <StatCard title="Staff Tasks In Progress" value={tasksInProgress} icon={Activity} />
        <StatCard title="Staff Tasks Completed" value={tasksCompletedToday} icon={CheckCircle2} />
        <StatCard title="Pending Putaway Items" value={pendingPutawayItems} icon={Box} />
        <StatCard title="Warehouse Capacity" value={warehouseCapacityUsage} icon={Layers} />
        <StatCard title="Low Stock Alerts" value={lowStockAlerts} icon={AlertTriangle} trend={lowStockAlerts > 3 ? 'up' : 'down'} trendValue={lowStockAlerts} />
        <StatCard title="Damaged Stock Alerts" value={damagedStockAlerts} icon={ShieldAlert} />
        <StatCard title="Bin Utilization" value={binUtilizationPercentage} icon={TrendingUp} />
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Queues & Approvals */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Section A: Pending Bin Assignment */}
          <Card className="border border-gray-100 shadow-xs">
            <CardHeader className="bg-slate-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Pending Bin Assignment Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inbound ID</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Qty / Supplier</TableHead>
                    <TableHead>Dimensions / Weight</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPending.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-400 font-bold">
                        No products waiting for bin assignment.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPending.map((r) => (
                      <TableRow key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-bold font-mono text-xs text-gray-900">{r.id}</TableCell>
                        <TableCell className="font-mono text-xs text-gray-500">{r.sku}</TableCell>
                        <TableCell className="font-semibold text-gray-800">{r.productName}</TableCell>
                        <TableCell>
                          <div className="font-bold text-gray-900">{r.verifiedQuantity || r.quantityReceived} units</div>
                          <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{r.supplier}</div>
                        </TableCell>
                        <TableCell className="font-mono text-[10px] text-gray-500">
                          <div>{r.dimensions}</div>
                          <div>{r.weight}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            className="bg-[#0071C1] hover:bg-[#005c9e] text-white text-[10px] py-1.5 px-3 font-bold flex items-center gap-1.5 ml-auto"
                            onClick={() => handleGenerateRecommendation(r.id, r.productName)}
                          >
                            <Cpu className="w-3.5 h-3.5" />
                            Generate AI Recommendation
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {pendingTotalPages > 1 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination
                  currentPage={activePendingPage}
                  totalPages={pendingTotalPages}
                  totalItems={pendingReceipts.length}
                  pageSize={dashboardPageSize}
                  onPageChange={setPendingPage}
                />
              </div>
            )}
          </Card>

          {/* Section B: AI Recommendation Review */}
          <Card className="border border-gray-100 shadow-xs">
            <CardHeader className="bg-slate-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                AI Bin Recommendation Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {aiRecommendations.filter(rec => rec.status === 'PENDING_REVIEW').length === 0 ? (
                <div className="text-center py-6 text-gray-400 font-bold text-xs bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No bin recommendation slots pending review.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiRecommendations.filter(rec => rec.status === 'PENDING_REVIEW').map((rec) => (
                    <div key={rec.id} className="border border-gray-100 rounded-xl p-4 bg-white hover:shadow-md transition-shadow flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-900 text-xs">{rec.title}</h4>
                            <span className="font-mono text-[9px] text-gray-400 bg-gray-100 px-1 py-0.5 rounded">{rec.sku}</span>
                          </div>
                          <Badge variant="warning">{rec.confidence}% fit</Badge>
                        </div>
                        
                        <div className="bg-blue-50/40 p-2.5 rounded-lg border border-blue-100 text-[11px] font-semibold text-blue-900">
                          Suggested Spot: <span className="font-mono font-bold text-blue-700">{rec.bin}</span> ({rec.zone} | {rec.rack} | {rec.shelf})
                        </div>

                        <p className="text-[11px] text-gray-500 leading-normal line-clamp-2">{rec.reason}</p>
                      </div>

                      <div className="border-t border-gray-150 pt-3 flex gap-2 justify-end w-full">
                        <Button 
                          variant="outline" size="sm" className="text-[10px] px-2.5 text-gray-600 font-semibold"
                          onClick={() => setSelectedBinDetail(rec)}
                        >
                          Details
                        </Button>
                        <Button 
                          variant="outline" size="sm" className="text-[10px] px-2.5 text-red-600 border-red-150 hover:bg-red-50 font-bold"
                          onClick={() => handleRejectRecommendation(rec)}
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm" className="text-[10px] px-3 bg-green-600 hover:bg-green-700 text-white font-bold"
                          onClick={() => handleApproveRecommendation(rec)}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section B-2: Ready for Staff Assignment (Approved recommendations) */}
          <Card className="border border-gray-100 shadow-xs">
            <CardHeader className="bg-slate-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Approved Placement Dispatches (Ready to Assign)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inbound ID</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Target Bin</TableHead>
                    <TableHead>Dimensions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApproved.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-400 font-bold">
                        No approved bin placements waiting for staff assignment.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedApproved.map((r) => {
                      const rec = aiRecommendations.find(a => a.inboundId === r.id) || {};
                      return (
                        <TableRow key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="font-bold font-mono text-xs text-gray-900">{r.id}</TableCell>
                          <TableCell className="font-semibold text-gray-800">{r.productName}</TableCell>
                          <TableCell className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100 w-fit">{rec.bin || 'Pending'}</TableCell>
                          <TableCell className="font-mono text-xs text-gray-500">{r.dimensions}</TableCell>
                          <TableCell>
                            <Badge variant="success" className="text-[10px] uppercase">Approved</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] py-1.5 px-3.5 font-bold"
                              onClick={() => handleOpenAssign(r)}
                            >
                              Assign Personnel
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {approvedTotalPages > 1 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination
                  currentPage={activeApprovedPage}
                  totalPages={approvedTotalPages}
                  totalItems={approvedReceipts.length}
                  pageSize={dashboardPageSize}
                  onPageChange={setApprovedPage}
                />
              </div>
            )}
          </Card>

          {/* Section C: Staff Task Monitoring */}
          <Card className="border border-gray-100 shadow-xs">
            <CardHeader className="bg-slate-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Staff Putaway Task Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task ID</TableHead>
                    <TableHead>Product / SKU</TableHead>
                    <TableHead>Assigned Staff</TableHead>
                    <TableHead>Transit Path</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-400 font-bold">
                        No active staff tasks assigned.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTasks.map((task) => (
                      <TableRow key={task.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-bold font-mono text-xs text-gray-900">{task.id}</TableCell>
                        <TableCell>
                          <div className="font-semibold text-gray-900">{task.product}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{task.sku} ({task.quantity} units)</div>
                        </TableCell>
                        <TableCell className="text-gray-700 font-semibold flex items-center gap-1.5 py-4">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {task.assignedStaffName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-[11px] text-gray-600">
                            <span className="font-mono text-gray-500">Dock</span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1 rounded">{task.destinationBin || task.bin}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={task.status === 'Completed' || task.status === 'STORED' ? 'success' : task.status === 'In Progress' || task.status === 'IN_PROGRESS' ? 'primary' : 'warning'} 
                            className="text-[10px] uppercase font-bold"
                          >
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" size="sm" className="text-[10px] text-gray-600 font-bold"
                            onClick={() => setSelectedTaskDetail(task)}
                          >
                            Route
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {tasksTotalPages > 1 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination
                  currentPage={activeTasksPage}
                  totalPages={tasksTotalPages}
                  totalItems={putawayTasks.length}
                  pageSize={dashboardPageSize}
                  onPageChange={setTasksPage}
                />
              </div>
            )}
          </Card>

        </div>

        {/* Right Side: Alerts & Layout Summaries */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Section D: Warehouse Alerts */}
          <Card className="border border-gray-150">
            <CardHeader className="border-b border-gray-100 pb-4 bg-slate-50/30">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-red-600 animate-pulse" />
                Layout & Operations Advisory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              
              {/* Alert: Bin capacity high */}
              <div className="p-3 rounded-xl bg-red-50/60 border border-red-100 flex gap-3 text-xs leading-normal">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-955">Zone Capacity High (Zone C)</h4>
                  <p className="text-[11px] text-red-700 mt-0.5">Utilization has reached 88%. Please avoid routing heavy industrial items into Rack 3 shelf rows.</p>
                </div>
              </div>

              {/* Alert: Product pending putaway too long */}
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex gap-3 text-xs leading-normal">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-955">Inbound Backlog Alert</h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">3 receipts are currently waiting in WAITING_FOR_BIN_ASSIGNMENT for over 2 hours.</p>
                </div>
              </div>

              {/* Alert: Damaged stock reported */}
              <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex gap-3 text-xs leading-normal">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-955">Damaged Stock Quarantined</h4>
                  <p className="text-[11px] text-rose-700 mt-0.5">Damaged industrial drill reported by inventory clerk. Items moved into quarantine holding bay.</p>
                </div>
              </div>

              {/* Alert: Low stock */}
              <div className="p-3 rounded-xl bg-slate-50 border border-gray-200 flex gap-3 text-xs leading-normal">
                <Box className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Low Stock Reorders Due</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Total of {lowStockAlerts} items have fallen below safety inventory reorder levels.</p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Microservices Health summary widget */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4 flex justify-between items-center bg-slate-50/50">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">Quick Layout Capacity</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {zones.map((zone) => (
                <div key={zone.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-gray-700">
                    <span>{zone.name} ({zone.type})</span>
                    <span>{zone.capacityPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full ${zone.capacityPercent > 80 ? 'bg-red-500' : 'bg-blue-600'}`} 
                      style={{ width: `${zone.capacityPercent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

      </div>

      {/* DISPATCH/ASSIGN STAFF MODAL */}
      {selectedReceiptForAssign && (
        <Modal
          isOpen={!!selectedReceiptForAssign}
          onClose={() => setSelectedReceiptForAssign(null)}
          title="Dispatch Putaway Directives"
          maxWidth="max-w-md"
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setSelectedReceiptForAssign(null)}>Cancel</Button>
              <Button type="button" onClick={handleDispatchSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Dispatch Task</Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-500">Inbound ID:</span>
                <span className="text-gray-900 font-mono font-bold">{selectedReceiptForAssign.id}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-500">Product name:</span>
                <span className="text-gray-900 font-bold">{selectedReceiptForAssign.productName}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-500">Verified quantity:</span>
                <span className="text-gray-900 font-bold">{selectedReceiptForAssign.verifiedQuantity} units</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-500">Suggested placement:</span>
                <span className="text-blue-700 font-bold bg-blue-50 px-1 rounded font-mono">
                  {aiRecommendations.find(a => a.inboundId === selectedReceiptForAssign.id)?.bin || 'BIN-002'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700 uppercase">Select Personnel (STAFF)</label>
              <select 
                value={selectedStaffId} 
                onChange={(e) => setSelectedStaffId(e.target.value)} 
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white"
              >
                {workers.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700 uppercase">Task Priority</label>
              <select 
                value={assignPriority} 
                onChange={(e) => setAssignPriority(e.target.value)} 
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white"
              >
                <option value="High">High (Immediate Slotting)</option>
                <option value="Medium">Medium (Standard Slotting)</option>
                <option value="Low">Low (Replenish Hold)</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* VIEW BIN DETAILS MODAL */}
      {selectedBinDetail && (
        <Modal
          isOpen={!!selectedBinDetail}
          onClose={() => setSelectedBinDetail(null)}
          title="Placement Recommendation Analysis"
          maxWidth="max-w-md"
          footer={
            <Button onClick={() => setSelectedBinDetail(null)} className="w-full justify-center">Close</Button>
          }
        >
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              AI Recommendation Diagnostics
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-gray-400 font-bold block uppercase mb-0.5">Suggested Spot</span>
                <span className="font-bold text-gray-900 font-mono">{selectedBinDetail.bin}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-gray-400 font-bold block uppercase mb-0.5">Zone</span>
                <span className="font-bold text-gray-900">{selectedBinDetail.zone}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-gray-400 font-bold block uppercase mb-0.5">Rack</span>
                <span className="font-bold text-gray-900">{selectedBinDetail.rack}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-gray-400 font-bold block uppercase mb-0.5">Shelf Level</span>
                <span className="font-bold text-gray-900">{selectedBinDetail.shelf}</span>
              </div>
            </div>

            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-150 space-y-1.5">
              <span className="font-bold text-blue-900 block">AI Slotting Rationale:</span>
              <p className="text-blue-950 leading-relaxed font-semibold">{selectedBinDetail.reason}</p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-gray-900 uppercase">Neural Engine Fit Metrics</h5>
              <div className="grid grid-cols-2 gap-2 font-semibold text-[11px] text-gray-600">
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span>Physical Volume Fit:</span>
                  <span className="text-gray-900 font-bold">{selectedBinDetail.fitScore || 94}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span>Space Availability:</span>
                  <span className="text-gray-900 font-bold">{selectedBinDetail.capacityScore || 92}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span>Weight Limit Safety:</span>
                  <span className="text-gray-900 font-bold">{selectedBinDetail.weightSafetyScore || 95}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span>Route Travel Efficiency:</span>
                  <span className="text-gray-900 font-bold">{selectedBinDetail.routeEfficiencyScore || 88}%</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* VIEW ROUTE PREVIEW MODAL */}
      {selectedTaskDetail && (
        <Modal
          isOpen={!!selectedTaskDetail}
          onClose={() => setSelectedTaskDetail(null)}
          title="Personnel Putaway Pathfinding Route"
          maxWidth="max-w-md"
          footer={
            <Button onClick={() => setSelectedTaskDetail(null)} className="w-full justify-center">Close Route Map</Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <div className="font-bold text-slate-900">Task: {selectedTaskDetail.id}</div>
              <div className="text-slate-500 font-medium">Item: {selectedTaskDetail.product} ({selectedTaskDetail.sku})</div>
              <div className="text-slate-500 font-medium">Assigned Worker: <span className="font-bold text-slate-800">{selectedTaskDetail.assignedStaffName}</span></div>
            </div>

            <div className="space-y-3 relative border-l border-dashed border-blue-400 pl-4 ml-2.5">
              <div className="relative">
                <span className="absolute -left-[20.5px] top-1.5 w-3 h-3 rounded-full bg-blue-600"></span>
                <div className="font-bold text-gray-900">Receiving Dock A</div>
                <div className="text-gray-400 text-[10px]">Staging pickup cargo manifest verify point</div>
              </div>
              <div className="relative">
                <span className="absolute -left-[20.5px] top-1.5 w-3 h-3 rounded-full bg-slate-400"></span>
                <div className="font-semibold text-gray-700">Aisle 1 Aisle-way Transit</div>
                <div className="text-gray-400 text-[10px]">Move straight through aisle 1 lanes</div>
              </div>
              <div className="relative">
                <span className="absolute -left-[20.5px] top-1.5 w-3 h-3 rounded-full bg-blue-600 font-bold text-white flex items-center justify-center text-[9px] border border-blue-800">✓</span>
                <div className="font-bold text-blue-700 uppercase">Target Location: {selectedTaskDetail.destinationBin || selectedTaskDetail.bin}</div>
                <div className="text-gray-400 text-[10px]">Zone: {selectedTaskDetail.destinationZone || 'Zone B'} | Rack: {selectedTaskDetail.destinationRack || 'Rack 2'} | Shelf: {selectedTaskDetail.destinationShelf || 'Level 1'}</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex justify-between font-mono text-[10px] text-gray-500">
              <span>EST TIME: 5 minutes</span>
              <span>TOTAL DISTANCE: 45 meters</span>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

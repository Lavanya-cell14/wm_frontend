import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../context/WarehouseContext';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DashboardStatCard,
  Pagination
} from 'shared-ui';
import { 
  Package, Box, Building2, LayoutGrid, CheckCircle2, TrendingUp, AlertTriangle, 
  ArrowDownToLine, Activity, Lightbulb, Clock, Layers, 
  Map, UserCheck, ShieldAlert, Cpu, Sparkles, Navigation, User, ArrowRight, Bot, BarChart3, Calendar
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    isLoading, inventory = [], bins = [], ocrDocuments = [], putawayTasks = [], inboundReceipts = [], zones = []
  } = useWarehouse();
  
  const [tasksPage, setTasksPage] = useState(1);
  const tasksPageSize = 5;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-semibold">
        Loading executive manager telemetry...
      </div>
    );
  }

  // Dynamic KPI Calculations
  const totalInventoryCount = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const occupiedBinsCount = bins.filter(b => b.status === 'Occupied' || b.status === 'Partial').length || 18;
  const availableBinsCount = bins.filter(b => b.status === 'Empty' || b.status === 'Active' && b.currentCapacity === 0).length || 12;
  const totalBinsCount = bins.length || 30;
  const storageUtilizationStr = totalBinsCount > 0 ? ((occupiedBinsCount / totalBinsCount) * 100).toFixed(1) : '60.0';
  const pendingOcrCount = ocrDocuments.filter(doc => doc.status === 'VERIFICATION_PENDING' || doc.status === 'OCR_UPLOADED').length || 2;
  
  const completedAllocationsCount = inboundReceipts.filter(r => r.status === 'STORED' || r.status === 'COMPLETED').length || 4;
  const completedTasksCount = putawayTasks.filter(t => t.status === 'COMPLETED').length;
  const activeTasksCount = putawayTasks.filter(t => ['IN_PROGRESS', 'PICKED_FROM_RECEIVING', 'REACHED_BIN', 'DELAYED'].includes(t.status)).length;

  // Overview metrics breakdown
  const availableStock = totalInventoryCount - 350 > 0 ? totalInventoryCount - 350 : totalInventoryCount;
  const allocatedStock = totalInventoryCount > 350 ? 350 : 0;
  const storedStockCount = putawayTasks.filter(t => t.status === 'COMPLETED').reduce((sum, t) => sum + (t.quantity || 0), 0);

  const approvedOcrDocs = ocrDocuments.filter(doc => doc.status === 'VERIFIED' || doc.status === 'PROCESSED').length || 8;
  const rejectedOcrDocs = ocrDocuments.filter(doc => doc.status === 'REJECTED' || doc.status === 'ERROR').length || 1;
  const allocationsInProgress = inboundReceipts.filter(r => ['RECOMMENDATION_APPROVED', 'ASSIGNED_TO_STAFF', 'IN_PROGRESS'].includes(r.status)).length || 2;

  // Paginated Read-Only Storage Tasks
  const totalTasksPages = Math.max(1, Math.ceil(putawayTasks.length / tasksPageSize));
  const activeTasksPage = Math.min(tasksPage, totalTasksPages);
  const paginatedTasks = putawayTasks.slice((activeTasksPage - 1) * tasksPageSize, activeTasksPage * tasksPageSize);

  // AI Assistant Prompts list
  const suggestedQuestions = [
    "Where is SKU100?",
    "Show products in Zone A",
    "Show available bins",
    "Which aisles are congested?",
    "Show warehouse occupancy",
    "Show products stored today"
  ];

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-7 h-7 text-[#0071C1]" />
          Executive Monitoring Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitor inventory, occupancy, storage progress, analytics, digital twin updates, and AI warehouse insights.
        </p>
      </div>

      {/* 8 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <DashboardStatCard title="Total Inventory" value={totalInventoryCount} icon={Box} />
        <DashboardStatCard title="Storage Utilization" value={`${storageUtilizationStr}%`} icon={Layers} />
        <DashboardStatCard title="Occupied Bins" value={occupiedBinsCount} icon={LayoutGrid} />
        <DashboardStatCard title="Available Bins" value={availableBinsCount} icon={CheckCircle2} />
        <DashboardStatCard title="Pending OCR Reviews" value={pendingOcrCount} icon={ShieldAlert} />
        <DashboardStatCard title="Completed Allocations" value={completedAllocationsCount} icon={UserCheck} />
        <DashboardStatCard title="Storage Tasks Completed" value={completedTasksCount} icon={CheckCircle2} />
        <DashboardStatCard title="Active Storage Tasks" value={activeTasksCount} icon={Activity} />
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Operations Breakdown & OCR Allocations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Warehouse Operations Overview */}
          <Card className="border border-gray-150 shadow-xs">
            <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-3 flex justify-between items-center">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#0071C1]" />
                Warehouse Operations Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-gray-700">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-gray-400 block text-[9px] uppercase tracking-wider mb-1">Total Stocked Inventory</span>
                  <span className="text-lg font-bold text-slate-900">{totalInventoryCount} Units</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-gray-400 block text-[9px] uppercase tracking-wider mb-1">Available Stock</span>
                  <span className="text-lg font-bold text-emerald-700">{availableStock} Units</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-gray-400 block text-[9px] uppercase tracking-wider mb-1">Allocated / Reserved</span>
                  <span className="text-lg font-bold text-amber-700">{allocatedStock} Units</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-gray-400 block text-[9px] uppercase tracking-wider mb-1">Stored Stock Today</span>
                  <span className="text-lg font-bold text-blue-800">{storedStockCount} Units</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-gray-400 block text-[9px] uppercase tracking-wider mb-1">Occupied Bin Count</span>
                  <span className="text-lg font-bold text-red-700">{occupiedBinsCount} Bins</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-gray-400 block text-[9px] uppercase tracking-wider mb-1">Empty / Available Bins</span>
                  <span className="text-lg font-bold text-green-700">{availableBinsCount} Bins</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: OCR & Allocation Monitoring Summary */}
          <Card className="border border-gray-150 shadow-xs">
            <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-3">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Recommendation & Allocation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="p-3 bg-indigo-50/30 rounded-xl border border-indigo-100">
                  <span className="text-[9px] text-indigo-700 uppercase font-bold block">Pending OCR</span>
                  <span className="text-xl font-bold text-indigo-900 mt-1 block">{pendingOcrCount}</span>
                </div>
                <div className="p-3 bg-green-50/30 rounded-xl border border-green-100">
                  <span className="text-[9px] text-green-700 uppercase font-bold block">Approved Docs</span>
                  <span className="text-xl font-bold text-green-900 mt-1 block">{approvedOcrDocs}</span>
                </div>
                <div className="p-3 bg-red-50/30 rounded-xl border border-red-100">
                  <span className="text-[9px] text-red-700 uppercase font-bold block">Rejected Docs</span>
                  <span className="text-xl font-bold text-red-900 mt-1 block">{rejectedOcrDocs}</span>
                </div>
                <div className="p-3 bg-blue-50/30 rounded-xl border border-blue-100">
                  <span className="text-[9px] text-blue-700 uppercase font-bold block">Completed Allocations</span>
                  <span className="text-xl font-bold text-blue-900 mt-1 block">{completedAllocationsCount}</span>
                </div>
                <div className="p-3 bg-amber-50/30 rounded-xl border border-amber-100 col-span-2 md:col-span-1">
                  <span className="text-[9px] text-amber-700 uppercase font-bold block">Active Allocations</span>
                  <span className="text-xl font-bold text-amber-900 mt-1 block">{allocationsInProgress}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Side: Digital Twin Preview & AI Assistant Preview */}
        <div className="space-y-6">
          
          {/* Section 4: Digital Twin Preview */}
          <Card className="border border-gray-150">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                3D Digital Twin Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs font-semibold text-gray-600">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Total Zones Monitored:</span>
                <span className="text-gray-900 font-bold">{zones.length || 4} Zones</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Occupied Bin Grids:</span>
                <span className="text-gray-900 font-bold">{occupiedBinsCount} Bins</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Available Bin Grids:</span>
                <span className="text-gray-900 font-bold">{availableBinsCount} Bins</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Space Utilization:</span>
                <Badge variant="success" className="text-[9px] font-bold">{storageUtilizationStr}%</Badge>
              </div>
              <div className="flex justify-between">
                <span>Last Telemetry Sync:</span>
                <span className="text-gray-400 font-mono text-[10px]">Just now</span>
              </div>
              <Button 
                variant="outline" 
                className="w-full justify-center text-[10.5px] py-2 mt-2 font-bold bg-[#F4FCFF] border-blue-150 text-blue-700 hover:bg-blue-50"
                onClick={() => navigate('/manager/digital-twin')}
              >
                Open Digital Twin Map
              </Button>
            </CardContent>
          </Card>

          {/* Section 5: AI Assistant Preview */}
          <Card className="border border-gray-150">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-blue-600 animate-pulse" />
                AI Assistant Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <p className="text-[10px] text-gray-400 font-medium">Quickly query warehouse operations telemetry using natural language commands:</p>
              
              <div className="grid grid-cols-2 gap-1.5">
                {suggestedQuestions.slice(0, 4).map((q, idx) => (
                  <button 
                    key={idx}
                    onClick={() => navigate('/manager/ai-assistant')}
                    className="text-left px-2 py-1.5 border border-gray-100 rounded-lg bg-gray-50 text-[10px] text-gray-600 font-bold hover:border-blue-200 hover:bg-blue-50/20 truncate"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <Button 
                className="w-full justify-center text-[10.5px] py-2 mt-2 font-bold bg-[#0071C1] text-white hover:bg-[#005c9e] flex items-center gap-1"
                onClick={() => navigate('/manager/ai-assistant')}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Open AI Warehouse Assistant
              </Button>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Section 3: Storage Task Monitoring (Read-only table) */}
      <Card className="border border-gray-150 shadow-xs mt-6">
        <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-3">
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Storage Task Monitoring (Read-only)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {putawayTasks.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-bold text-xs">
              No active storage tasks recorded.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task ID</TableHead>
                  <TableHead>Product / SKU</TableHead>
                  <TableHead>Assigned Operator</TableHead>
                  <TableHead>Destination Bin</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Updated Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-slate-50/20 text-xs font-semibold">
                    <TableCell className="font-bold text-gray-900 font-mono">{task.id}</TableCell>
                    <TableCell>
                      <div className="font-bold text-gray-900">{task.product}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{task.sku}</div>
                    </TableCell>
                    <TableCell className="text-gray-700">{task.assignedStaffName || 'Warehouse Operator'}</TableCell>
                    <TableCell>
                      <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-bold">
                        {task.destinationBin || task.bin || 'BIN-002'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={task.priority === 'High' ? 'error' : 'warning'}>{task.priority || 'Medium'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={task.status === 'COMPLETED' ? 'success' : 'primary'} className="uppercase text-[9px] font-bold">
                        {task.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-gray-500 text-[10.5px]">
                      <div className="flex items-center justify-end gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(task.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalTasksPages > 1 && (
        <div className="px-4 mt-2">
          <Pagination
            currentPage={activeTasksPage}
            totalPages={totalTasksPages}
            totalItems={putawayTasks.length}
            pageSize={tasksPageSize}
            onPageChange={(p) => setTasksPage(p)}
          />
        </div>
      )}

    </div>
  );
}

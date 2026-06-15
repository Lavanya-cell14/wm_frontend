import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/dashboard/StatCard';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import AlertBanner from '../../components/ui/AlertBanner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { 
  ScanBarcode, ClipboardList, ArrowDownToLine, Activity, CheckCircle2, 
  Lightbulb, Clock, ShieldAlert, Eye, Route, Navigation, Layers, 
  Play, Check, AlertTriangle, ArrowRight, Map, CheckSquare, ChevronRight, User
} from 'lucide-react';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    putawayTasks, 
    startPutawayTask, 
    confirmPickedFromReceiving, 
    confirmReachedBin, 
    completePutawayTask 
  } = useWarehouse();

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Derive Staff metrics
  const assignedTasks = putawayTasks.filter(t => t.status === 'ASSIGNED' || t.status === 'Pending').length;
  const pendingPutaway = putawayTasks.filter(t => t.status !== 'COMPLETED').length;
  const inProgressTasks = putawayTasks.filter(t => 
    t.status === 'IN_PROGRESS' || 
    t.status === 'PICKED_FROM_RECEIVING' || 
    t.status === 'REACHED_BIN'
  ).length;
  const completedToday = putawayTasks.filter(t => t.status === 'COMPLETED').length;
  const delayedTasks = putawayTasks.filter(t => t.status === 'DELAYED' || t.issue).length;
  const highPriorityTasks = putawayTasks.filter(t => t.priority === 'High' && t.status !== 'COMPLETED').length;
  const avgCompletionTime = completedToday > 0 ? "6.8 mins" : "7.2 mins";

  // Find first active task in progress for the active task section
  const activeTask = putawayTasks.find(t => 
    t.status === 'IN_PROGRESS' || 
    t.status === 'PICKED_FROM_RECEIVING' || 
    t.status === 'REACHED_BIN'
  );

  const currentActiveRoute = activeTask ? `${activeTask.destinationBin} (${activeTask.destinationZone})` : 'None';

  // Active task step descriptions
  const getStepNumber = (status) => {
    if (status === 'IN_PROGRESS') return 1;
    if (status === 'PICKED_FROM_RECEIVING') return 2;
    if (status === 'REACHED_BIN') return 3;
    return 0;
  };

  const getStepProgressWidth = (status) => {
    if (status === 'IN_PROGRESS') return '25%';
    if (status === 'PICKED_FROM_RECEIVING') return '60%';
    if (status === 'REACHED_BIN') return '90%';
    return '0%';
  };

  const handleStartTask = (taskId) => {
    startPutawayTask(taskId);
    showToast(`Putaway task ${taskId} initiated! Status changed to IN_PROGRESS.`);
  };

  const handleNextAction = (task) => {
    if (task.status === 'IN_PROGRESS') {
      confirmPickedFromReceiving(task.id);
      showToast(`Cargo picked up from Receiving Dock! Route guidance activated.`);
    } else if (task.status === 'PICKED_FROM_RECEIVING') {
      confirmReachedBin(task.id);
      showToast(`Reached destination bin ${task.destinationBin || task.bin}.`);
    } else if (task.status === 'REACHED_BIN') {
      completePutawayTask(task.id, user);
      showToast(`Cargo placed. Bin occupancy updated. Inbound completed!`);
    }
  };

  // Mock Alerts
  const mockAlerts = [
    { id: 1, title: "Task Delayed", desc: "Putaway task PTW-002 has exceeded average completion target by 4 mins.", type: "warning" },
    { id: 2, title: "Destination Bin Full (BIN-003)", desc: "Occupancy limit alert. Manager recomms redirecting excess Dell laptops to BIN-002.", type: "error" },
    { id: 3, title: "Cargo Mismatch (Staging)", desc: "Invoice mismatch checked on rig manifest items at Receiving Dock A.", type: "info" }
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Activity className="w-7 h-7 text-[#0071C1]" />
          Personnel Command Center
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Perform storage putaways, follow optimized pathing guidance, and report cargo issues.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Tasks" value={assignedTasks} icon={ClipboardList} />
        <StatCard title="Pending Putaways" value={pendingPutaway} icon={Clock} />
        <StatCard title="In Progress Tasks" value={inProgressTasks} icon={Play} />
        <StatCard title="Completed Today" value={completedToday} icon={CheckCircle2} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Delayed Tasks" value={delayedTasks} icon={AlertTriangle} />
        <StatCard title="High Priority Tasks" value={highPriorityTasks} icon={ShieldAlert} />
        <StatCard title="Avg Completion Time" value={avgCompletionTime} icon={Clock} />
        <StatCard title="Current Active Route" value={currentActiveRoute} icon={Navigation} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Columns (Assigned Tasks and Active Task Workspace) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Section B: Active Task Workspace */}
          {activeTask ? (
            <Card className="border border-blue-200 bg-blue-50/10 shadow-xs">
              <CardHeader className="bg-blue-50/30 border-b border-blue-150 pb-4">
                <CardTitle className="text-base font-bold text-blue-900 flex justify-between items-center w-full">
                  <span className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-blue-600 animate-pulse" />
                    Active Task Workspace - In Progress
                  </span>
                  <Badge variant="primary" className="animate-pulse">Task: {activeTask.id}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Product Description</span>
                    <span className="font-bold text-gray-950 block text-sm">{activeTask.product}</span>
                    <span className="font-mono text-xs text-gray-400">{activeTask.sku} ({activeTask.quantity} units)</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Current Step Location</span>
                    <span className="font-bold text-blue-700 block text-sm">
                      {activeTask.status === 'IN_PROGRESS' ? 'Receiving Dock' : activeTask.status === 'PICKED_FROM_RECEIVING' ? 'In Aisle Transit' : `Target Bin: ${activeTask.destinationBin || activeTask.bin}`}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">Destination: {activeTask.destinationBin || activeTask.bin}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Priority / Time Limit</span>
                    <span className="font-bold text-gray-900 block text-sm">{activeTask.priority} Priority</span>
                    <span className="text-xs text-gray-500 font-medium">Due: {activeTask.dueTime || 'Today'}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-blue-800 font-bold uppercase tracking-wider">
                    <span className={activeTask.status === 'IN_PROGRESS' ? 'text-blue-700' : 'text-gray-400'}>1. Start (Dock)</span>
                    <span className={activeTask.status === 'PICKED_FROM_RECEIVING' ? 'text-blue-700' : 'text-gray-400'}>2. Aisle Navigation</span>
                    <span className={activeTask.status === 'REACHED_BIN' ? 'text-blue-700' : 'text-gray-400'}>3. Placement & Store</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: getStepProgressWidth(activeTask.status) }}
                    ></div>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    className="flex-1 justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 text-xs gap-2"
                    onClick={() => handleNextAction(activeTask)}
                  >
                    {activeTask.status === 'IN_PROGRESS' && <><Play className="w-4 h-4" /> Confirm Picked from Receiving</>}
                    {activeTask.status === 'PICKED_FROM_RECEIVING' && <><Navigation className="w-4 h-4" /> Confirm Reached Destination Bin</>}
                    {activeTask.status === 'REACHED_BIN' && <><Check className="w-4 h-4" /> Mark Product Placed & Store</>}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs"
                    onClick={() => navigate('/staff/active')}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500 font-bold text-xs">
              No task is currently in progress. Start an assigned putaway task below to activate workspace.
            </div>
          )}

          {/* Section A: My Assigned Putaway Tasks */}
          <Card className="border border-gray-150 shadow-xs">
            <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                My Assigned Putaway Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task ID</TableHead>
                    <TableHead>SKU / Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Locations</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {putawayTasks.filter(t => t.status === 'ASSIGNED' || t.status === 'Pending').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-gray-400 font-bold">
                        No assigned tasks waiting to be started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    putawayTasks.filter(t => t.status === 'ASSIGNED' || t.status === 'Pending').map((t) => (
                      <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-bold font-mono text-xs text-gray-900">{t.id}</TableCell>
                        <TableCell>
                          <div className="font-semibold text-gray-800">{t.product}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{t.sku}</div>
                        </TableCell>
                        <TableCell className="font-bold text-gray-900">{t.quantity} units</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-[11px] text-gray-600">
                            <span className="font-mono text-[10px] bg-gray-100 px-1 py-0.5 rounded">Dock</span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="font-mono text-blue-700 bg-blue-50 px-1 rounded font-bold">{t.destinationBin || t.bin || 'BIN-002'}</span>
                          </div>
                          <div className="text-[9px] text-gray-400 mt-1 font-semibold">({t.destinationZone || t.zone || 'Zone A'})</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={t.priority === 'High' ? 'error' : 'warning'}>{t.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold">{t.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] py-1.5 px-3.5 font-bold flex items-center gap-1.5"
                              onClick={() => handleStartTask(t.id)}
                            >
                              <Play className="w-3.5 h-3.5" /> Start
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>

        {/* Right Column (Alerts & Completed Today) */}
        <div className="space-y-6">
          
          {/* Section D: Alerts */}
          <Card className="border border-gray-150">
            <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-4">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-red-600 animate-pulse" />
                Active Alerts / Handle Warnings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex gap-3 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-950">Task Delayed (Overdue)</h4>
                  <p className="text-[10px] text-amber-700 mt-0.5">Putaway PTW-002 has exceeded estimated pick time by 4 minutes.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-red-50/50 border border-red-100 flex gap-3 text-xs">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-950">Destination Bin Occupied</h4>
                  <p className="text-[10px] text-red-700 mt-0.5">BIN-003 is currently full. Managers advise routing stock to BIN-002.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex gap-3 text-xs">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-950">Product Damaged during Handling</h4>
                  <p className="text-[10px] text-rose-700 mt-0.5">Please check and log damage if items are broken during bin slotting.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section C: Completed Today */}
          <Card className="border border-gray-150">
            <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-4">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                <CheckSquare className="w-4.5 h-4.5 text-emerald-600" />
                Completed Today ({completedToday})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {putawayTasks.filter(t => t.status === 'COMPLETED').length === 0 ? (
                  <div className="p-6 text-center text-gray-400 font-bold text-xs">
                    No completed tasks recorded today.
                  </div>
                ) : (
                  putawayTasks.filter(t => t.status === 'COMPLETED').map((t) => (
                    <div key={t.id} className="p-3 hover:bg-slate-50/30 transition-colors flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-gray-950">{t.product}</h4>
                        <span className="font-mono text-[9px] text-gray-400">ID: {t.id} | Qty: {t.quantity}</span>
                      </div>
                      <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        {t.destinationBin || t.bin}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}

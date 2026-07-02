import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import { 
  DashboardStatCard, Button, Card, CardContent, CardHeader, CardTitle, CardDescription, 
  Badge, AlertBanner, Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from 'shared-ui';
import { 
  ClipboardList, Activity, Clock, ShieldAlert, Navigation, 
  Layers, Play, Check, AlertTriangle, ArrowRight, CheckSquare, 
  Map, LayoutGrid, Box, Eye, CheckCircle2
} from 'lucide-react';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    putawayTasks = [], 
    startPutawayTask, 
    confirmPickedFromReceiving, 
    confirmReachedBin, 
    completePutawayTask,
    aiRecommendations = []
  } = useWarehouse();

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // KPI Calculations
  const assignedTasksCount = putawayTasks.filter(t => t.status === 'ASSIGNED' || t.status === 'Pending').length;
  const pendingTasksCount = putawayTasks.filter(t => t.status !== 'COMPLETED').length;
  const inProgressTasksCount = putawayTasks.filter(t => 
    ['IN_PROGRESS', 'PICKED_FROM_RECEIVING', 'REACHED_BIN'].includes(t.status)
  ).length;
  const completedTodayCount = putawayTasks.filter(t => t.status === 'COMPLETED').length;

  // Active Task
  const activeTask = putawayTasks.find(t => 
    ['IN_PROGRESS', 'PICKED_FROM_RECEIVING', 'REACHED_BIN', 'DELAYED'].includes(t.status)
  );

  const getStepProgressWidth = (status) => {
    if (status === 'IN_PROGRESS') return '25%';
    if (status === 'PICKED_FROM_RECEIVING') return '60%';
    if (status === 'REACHED_BIN') return '90%';
    return '0%';
  };

  const getStepNumberLabel = (status) => {
    if (status === 'IN_PROGRESS') return '1. Start (Dock)';
    if (status === 'PICKED_FROM_RECEIVING') return '2. Navigation';
    if (status === 'REACHED_BIN') return '3. Placement & Confirm';
    return 'Assigned';
  };

  const handleStartTask = (taskId) => {
    startPutawayTask(taskId);
    showToast(`Storage task ${taskId} initiated! Status changed to In Progress.`);
  };

  const handleNextAction = (task) => {
    if (task.status === 'IN_PROGRESS') {
      confirmPickedFromReceiving(task.id);
      showToast(`Cargo picked up from Receiving Dock! Route guidance activated.`);
    } else if (task.status === 'PICKED_FROM_RECEIVING') {
      confirmReachedBin(task.id);
      showToast(`Reached destination bin ${task.destinationBin || task.bin || 'BIN-002'}.`);
    } else if (task.status === 'REACHED_BIN') {
      completePutawayTask(task.id, user);
      showToast(`Placement confirmed! Storage marked complete.`);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Activity className="w-7 h-7 text-[#0071C1]" />
          Warehouse Operator Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          View assigned storage tasks, follow navigation guidance, complete placement steps, and update storage completion.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStatCard 
          title="Assigned Tasks" 
          value={assignedTasksCount} 
          icon={ClipboardList} 
          onClick={() => navigate('/operator/storage-tasks')}
        />
        <DashboardStatCard 
          title="Pending Tasks" 
          value={pendingTasksCount} 
          icon={Clock} 
          onClick={() => navigate('/operator/storage-tasks')}
        />
        <DashboardStatCard 
          title="In Progress Tasks" 
          value={inProgressTasksCount} 
          icon={Play} 
          onClick={() => navigate(activeTask ? '/operator/active' : '/operator/storage-tasks')}
        />
        <DashboardStatCard 
          title="Completed Today" 
          value={completedTodayCount} 
          icon={CheckCircle2} 
          onClick={() => {
            const el = document.getElementById('recent-completed-tasks');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Assigned Queue & Completed List) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Section 1: Assigned Storage Queue */}
          <Card className="border border-gray-150 shadow-xs">
            <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-3">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#0071C1]" />
                Assigned Storage Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task ID</TableHead>
                    <TableHead>SKU / Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Location Details</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {putawayTasks.filter(t => t.status === 'ASSIGNED' || t.status === 'Pending').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-400 font-bold text-xs">
                        No assigned storage tasks waiting to be started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    putawayTasks.filter(t => t.status === 'ASSIGNED' || t.status === 'Pending').map((t) => {
                      const zone = t.destinationZone || t.zone || 'Zone A';
                      const bin = t.destinationBin || t.bin || 'BIN-002';
                      const zoneGroup = zone === 'Zone D' ? 'Cold Storage ZG' : 'Ambient Storage ZG';
                      
                      return (
                        <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold">
                          <TableCell className="font-bold font-mono text-gray-900">{t.id}</TableCell>
                          <TableCell>
                            <div className="font-bold text-gray-900">{t.product}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{t.sku}</div>
                          </TableCell>
                          <TableCell className="font-bold text-gray-900">{t.quantity} units</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 border border-slate-200 rounded">Dock</span>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className="font-mono text-blue-700 bg-blue-50 px-1 rounded border border-blue-100 font-bold">{bin}</span>
                            </div>
                            <div className="text-[9px] text-gray-400 mt-1 font-medium">{zoneGroup} &bull; {zone}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={t.priority === 'High' ? 'error' : 'warning'}>{t.priority}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[9px] uppercase font-bold">{t.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] py-1 px-2.5 font-bold flex items-center gap-1"
                              onClick={() => handleStartTask(t.id)}
                            >
                              <Play className="w-3.5 h-3.5" /> Start
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Section 5: Recent Completed Tasks */}
          <Card id="recent-completed-tasks" className="border border-gray-150 shadow-xs">
            <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                <CheckSquare className="w-4.5 h-4.5 text-emerald-600" />
                Recent Completed Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Stored Bin</TableHead>
                    <TableHead>Completion Time</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {putawayTasks.filter(t => t.status === 'COMPLETED').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-gray-400 font-semibold text-xs">
                        No completed tasks recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    putawayTasks.filter(t => t.status === 'COMPLETED').slice(0, 3).map((t) => (
                      <TableRow key={t.id} className="text-xs font-semibold text-gray-700">
                        <TableCell>
                          <div className="font-bold text-gray-900">{t.product}</div>
                          <div className="text-[9px] text-gray-400 font-mono mt-0.5">Task: {t.id} | Qty: {t.quantity}</div>
                        </TableCell>
                        <TableCell className="font-mono text-blue-700 font-bold bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100 w-fit">
                          {t.destinationBin || t.bin}
                        </TableCell>
                        <TableCell className="text-gray-500">Just now</TableCell>
                        <TableCell className="text-gray-900">Operator</TableCell>
                        <TableCell>
                          <Badge variant="success" className="text-[9px] uppercase font-bold">Stored</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>

        {/* Right Column (Active Task Preview, Navigation Summary, Placement Summary) */}
        <div className="space-y-6">
          
          {/* Section 2: Active Storage Task Preview */}
          <Card className="border border-blue-200 bg-blue-50/5 shadow-xs">
            <CardHeader className="bg-blue-50/25 border-b border-blue-150 pb-3">
              <CardTitle className="text-sm font-bold text-blue-900 flex justify-between items-center w-full">
                <span className="flex items-center gap-1.5">
                  <Play className="w-4.5 h-4.5 text-blue-600 animate-pulse" />
                  Active Storage Preview
                </span>
                {activeTask && <Badge variant="primary" className="text-[9px]">Task: {activeTask.id}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs font-semibold">
              {activeTask ? (
                <>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest block">Product Details</span>
                      <div className="font-bold text-gray-950 text-xs mt-0.5">{activeTask.product}</div>
                      <div className="text-[9px] text-gray-400 font-mono">SKU: {activeTask.sku} &bull; Qty: {activeTask.quantity} units</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>Pickup: <span className="text-gray-900 font-bold">{activeTask.pickupLocation || 'Receiving Dock'}</span></div>
                      <div>Target Bin: <span className="font-mono text-blue-700 font-bold bg-blue-50 px-1 rounded">{activeTask.destinationBin || activeTask.bin}</span></div>
                    </div>
                  </div>

                  {/* Progress info */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-blue-800 uppercase font-bold">
                      <span>Step: {getStepNumberLabel(activeTask.status)}</span>
                      <span>Progress: {getStepProgressWidth(activeTask.status)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: getStepProgressWidth(activeTask.status) }}
                      ></div>
                    </div>
                  </div>

                  {/* Active Shortcuts */}
                  <div className="flex gap-2 pt-1">
                    <Button 
                      className="flex-1 justify-center py-2 text-[10px] font-bold"
                      onClick={() => handleNextAction(activeTask)}
                    >
                      Next Step Action
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 justify-center py-2 text-[10px] font-bold"
                      onClick={() => navigate('/operator/storage-tasks')}
                    >
                      Workspace
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center text-gray-400 font-bold text-[11px]">
                  No active task in progress. Start an assigned task.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Navigation Summary Preview */}
          <Card className="border border-gray-150">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-[#0071C1]" />
                Navigation Summary Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs font-semibold text-gray-600">
              {activeTask ? (
                <>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span>Current Location:</span>
                    <span className="text-gray-900 font-bold">Receiving Dock A</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span>Destination Bin:</span>
                    <span className="font-mono text-blue-700 font-bold">{activeTask.destinationBin || activeTask.bin}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span>Distance Weight:</span>
                    <span className="text-gray-900 font-bold">45 meters</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span>Estimated Duration:</span>
                    <span className="text-gray-900 font-bold">5.0 mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Route Status:</span>
                    <Badge variant="success" className="text-[9px] font-bold">CLEAR</Badge>
                  </div>
                  <Button variant="outline" className="w-full justify-center text-[10px] py-1.5 mt-2 font-bold" onClick={() => navigate('/operator/navigation')}>
                    Open Live Navigation Map
                  </Button>
                </>
              ) : (
                <div className="py-2 text-center text-gray-400 text-[11px]">
                  Start a task to initialize routing.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Placement Guidance Preview */}
          <Card className="border border-gray-150">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500 animate-pulse" />
                Placement Guidance Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs font-semibold text-gray-600">
              {activeTask ? (
                <>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span>Coordinates (Offsets):</span>
                    <span className="text-gray-900 font-mono font-bold">X: 12.0m, Y: 5.0m, Z: 1.0m</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span>Orientation Orientation:</span>
                    <span className="text-gray-900 font-bold">Horizontal Align</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span>Strategy Mode:</span>
                    <span className="text-gray-900 font-bold">FIFO Storage</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span>Stacking restriction:</span>
                    <span className="text-red-600 font-bold">Do Not Stack</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Label Direction:</span>
                    <span className="text-gray-900 font-bold">Facing Outward</span>
                  </div>
                  <Button variant="outline" className="w-full justify-center text-[10px] py-1.5 mt-2 font-bold" onClick={() => navigate('/operator/placement-guidance')}>
                    Inspect Placement Rules
                  </Button>
                </>
              ) : (
                <div className="py-2 text-center text-gray-400 text-[11px]">
                  Start a task to initialize placement calculations.
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}

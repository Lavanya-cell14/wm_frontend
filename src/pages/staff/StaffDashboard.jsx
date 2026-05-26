import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/dashboard/StatCard';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import AlertBanner from '../../components/ui/AlertBanner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { 
  ScanBarcode, ClipboardList, ArrowDownToLine, Activity, CheckCircle2, 
  Lightbulb, Clock, ShieldAlert, Eye, Route, Navigation, Layers, 
  Play, Check, AlertTriangle, ArrowRight, Map 
} from 'lucide-react';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    recentScans, 
    putawayTasks, 
    inboundTasks, 
    movements, 
    kpis, 
    startInboundTask, 
    completeInboundTask, 
    startPutawayTask, 
    completePutawayTask 
  } = useWarehouse();

  const [toastMessage, setToastMessage] = useState('');
  const [activeRouteModal, setActiveRouteModal] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Quick action navigation
  const handleQuickAction = (path) => {
    navigate(path);
  };

  // Simulated AI insights
  const aiInsights = [
    { id: 1, title: 'Zone B Nearing Capacity', severity: 'High', desc: 'Zone B is at 88% capacity. AI suggests shifting electronics overflow to Zone C.', type: 'warning' },
    { id: 2, title: 'Fast-Moving SKU-1001 Detected', severity: 'Medium', desc: 'Dell Laptops have 4x pick frequency. Auto-balancing recommends moving closer to dispatch.', type: 'info' },
    { id: 3, title: 'Congested Aisle Detected', severity: 'High', desc: 'Forklift traffic is high in Aisle A2. Reroute picking AGVs through aisle A3.', type: 'critical' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Title / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#0071C1]" />
            Staff Command Center
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time warehouse operational dashboard for {user?.name || 'Warehouse Staff'}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => handleQuickAction('/staff/scanner')}>
            <ScanBarcode className="w-4 h-4" />
            Quick Scan
          </Button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Scanned Today" 
          value={kpis.scannedToday} 
          icon={ScanBarcode} 
          trend={15} 
          trendLabel="vs yesterday"
        />
        
        <div className="relative">
          <StatCard 
            title="Pending Putaway" 
            value={putawayTasks.filter(t => t.status !== 'Completed').length} 
            icon={ClipboardList} 
          />
          {putawayTasks.filter(t => t.status !== 'Completed').length > 3 && (
            <span className="absolute top-3 right-3 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
              High
            </span>
          )}
        </div>

        <StatCard 
          title="Active Inbound Tasks" 
          value={inboundTasks.filter(t => t.status === 'In Progress' || t.status === 'Pending').length} 
          icon={ArrowDownToLine} 
        />

        <StatCard 
          title="Assigned Movements" 
          value={kpis.assignedMovements} 
          icon={Route} 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Completed Today" 
          value={kpis.completedToday} 
          icon={CheckCircle2} 
        />
        <StatCard 
          title="AI Suggestions Accepted" 
          value={kpis.aiAccepted} 
          icon={Lightbulb} 
        />
        <StatCard 
          title="Avg Putaway Time" 
          value={kpis.avgPutawayTime} 
          icon={Clock} 
        />
        
        {/* System Indicator Card */}
        <Card>
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex items-center space-x-2 mb-2">
              <ShieldAlert className="text-[#0071C1] w-5 h-5" />
              <h2 className="text-sm font-semibold text-gray-900">Operational Status</h2>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-ping"></span>
              <span className="font-bold text-gray-900 text-lg uppercase tracking-wider">ALL SYSTEMS GREEN</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QUICK ACTION PANEL */}
      <Card className="bg-gradient-to-r from-slate-900 to-[#114a87] text-white">
        <CardContent className="p-6">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-300" />
            Quick Operational Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Button className="bg-white/10 hover:bg-white/20 border-white/10 text-white text-xs font-semibold gap-2 justify-center py-2.5" onClick={() => handleQuickAction('/staff/scanner')}>
              <ScanBarcode className="w-4 h-4" /> Scan Product
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 border-white/10 text-white text-xs font-semibold gap-2 justify-center py-2.5" onClick={() => handleQuickAction('/staff/inbound')}>
              <ArrowDownToLine className="w-4 h-4" /> Inbound Tasks
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 border-white/10 text-white text-xs font-semibold gap-2 justify-center py-2.5" onClick={() => handleQuickAction('/staff/putaway')}>
              <ClipboardList className="w-4 h-4" /> Putaway Queue
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 border-white/10 text-white text-xs font-semibold gap-2 justify-center py-2.5" onClick={() => handleQuickAction('/staff/movements')}>
              <Activity className="w-4 h-4" /> Movement Tracking
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-2 justify-center py-2.5 col-span-2 md:col-span-1" onClick={() => handleQuickAction('/digital-twin')}>
              <Map className="w-4 h-4" /> Open Digital Twin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* MAIN SECTIONS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Putaway Queue & Recent Scans */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* PENDING PUTAWAY QUEUE */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader className="flex flex-row justify-between items-center border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#0071C1]" />
                Pending Putaway Queue
              </CardTitle>
              <Badge variant="warning">{putawayTasks.length} Active</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {putawayTasks.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    No active putaway tasks in the queue.
                  </div>
                ) : (
                  putawayTasks.map((task) => (
                    <div key={task.id} className="p-4 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">{task.product}</span>
                          <span className="text-xs text-gray-500">({task.sku})</span>
                          <Badge variant={task.priority === 'High' ? 'error' : 'warning'}>{task.priority}</Badge>
                          {task.status === 'In Progress' && (
                            <Badge variant="primary" className="animate-pulse">Active</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                          <div><span className="text-gray-400">Target Bin:</span> <span className="font-medium font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{task.bin}</span></div>
                          <div><span className="text-gray-400">Zone:</span> <span className="font-medium">{task.zone}</span></div>
                          <div><span className="text-gray-400">Est. Time:</span> <span className="font-medium">{task.estTime}</span></div>
                          <div><span className="text-gray-400">Distance:</span> <span className="font-medium">{task.distance}</span></div>
                        </div>
                        {/* Route progress indicator */}
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                          <div 
                            className={`h-1.5 rounded-full ${task.status === 'In Progress' ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`} 
                            style={{ width: task.status === 'In Progress' ? '50%' : '10%' }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 shrink-0 w-full md:w-auto">
                        {task.status === 'Pending' ? (
                          <Button size="sm" className="w-full md:w-auto gap-1" onClick={() => {
                            startPutawayTask(task.id);
                            showToast(`Putaway task ${task.id} started.`);
                          }}>
                            <Play className="w-3.5 h-3.5" /> Start
                          </Button>
                        ) : (
                          <Button size="sm" className="w-full md:w-auto bg-green-600 hover:bg-green-700 gap-1 text-white" onClick={() => {
                            completePutawayTask(task.id, user);
                            showToast(`Product stored successfully in Bin ${task.bin}!`);
                          }}>
                            <Check className="w-3.5 h-3.5" /> Store
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="w-full md:w-auto gap-1" onClick={() => setActiveRouteModal(task)}>
                          <Navigation className="w-3.5 h-3.5 text-gray-500" /> Nav
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* RECENT SCANS TABLE */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader className="flex flex-row justify-between items-center border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ScanBarcode className="w-5 h-5 text-[#0071C1]" />
                Recent Arriving Scans
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => handleQuickAction('/staff/scanner')}>
                Open Scanner
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product / SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Suggested Bin</TableHead>
                    <TableHead>Scan Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentScans.slice(0, 5).map((scan, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="font-semibold text-gray-900 text-sm">{scan.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{scan.sku}</div>
                      </TableCell>
                      <TableCell className="text-gray-600 text-xs">{scan.category}</TableCell>
                      <TableCell className="font-mono text-xs text-blue-700 font-semibold">{scan.suggested}</TableCell>
                      <TableCell className="text-gray-500 text-xs">{scan.time}</TableCell>
                      <TableCell>
                        <StatusBadge status={scan.status === 'Stored' ? 'success' : scan.status === 'In Progress' ? 'warning' : 'info'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Shipments, Insights, Mini Digital Twin */}
        <div className="space-y-6">
          
          {/* ACTIVE INBOUND SHIPMENTS */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-[#0071C1]" />
                Active Inbound Receiving
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {inboundTasks.filter(t => t.status !== 'Completed').slice(0, 3).map((shipment) => (
                  <div key={shipment.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{shipment.id}</span>
                          <span className="text-xs text-gray-500">({shipment.supplier})</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Expected: {shipment.expectedArrival}</div>
                      </div>
                      <Badge variant={shipment.status === 'In Progress' ? 'primary' : 'outline'}>
                        {shipment.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <div>Items: <span className="font-semibold text-gray-900">{shipment.quantity} {shipment.product}</span></div>
                      <div>Staff: <span className="font-medium">{shipment.assignedStaff}</span></div>
                    </div>

                    {/* Progress tracking */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                        <span>GATE ASSIGNED</span>
                        <span>UNLOADING</span>
                        <span>COMPLETED</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${shipment.status === 'In Progress' ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`} 
                          style={{ width: shipment.status === 'In Progress' ? '50%' : '10%' }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      {shipment.status === 'Pending' ? (
                        <Button size="sm" className="flex-1 text-xs justify-center" onClick={() => {
                          startInboundTask(shipment.id);
                          showToast(`Inbound Receiving started for shipment ${shipment.id}`);
                        }}>
                          Start Receiving
                        </Button>
                      ) : (
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs justify-center" onClick={() => {
                          completeInboundTask(shipment.id, user);
                          showToast(`Inbound Receiving completed for shipment ${shipment.id}`);
                        }}>
                          Complete Verification
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="flex-1 text-xs justify-center" onClick={() => handleQuickAction('/staff/scanner')}>
                        Scanner
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI OPERATIONAL INSIGHTS */}
          <Card className="shadow-sm border border-gray-100 bg-blue-50/10">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                AI Operational Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {aiInsights.map((insight) => (
                <div key={insight.id} className="p-3 bg-white border border-gray-100 rounded-xl shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-gray-900 text-xs">{insight.title}</span>
                    <Badge variant={insight.type === 'warning' || insight.type === 'critical' ? 'error' : 'info'}>
                      {insight.severity}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-normal">{insight.desc}</p>
                  <Button variant="ghost" className="text-blue-600 text-[10px] font-bold p-0 justify-start hover:bg-transparent">
                    Apply Recommended Action →
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* MINI DIGITAL TWIN PREVIEW */}
          <Card className="shadow-sm border border-gray-100 overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0071C1]" />
                Mini Digital Twin
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="w-full h-36 bg-slate-950 rounded-xl border border-slate-800 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                
                {/* 2D grid representation */}
                <div className="relative z-10 w-full px-6 flex flex-col gap-2 text-[10px]">
                  <div className="flex justify-between text-slate-400 font-bold border-b border-slate-800 pb-1">
                    <span>ZONE A</span>
                    <span>ZONE B [ACTIVE SUGGESTION]</span>
                    <span>ZONE C</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-12 bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center justify-center text-emerald-400 font-semibold">
                      Zone A: 65%
                    </div>
                    <div className="h-12 bg-blue-500/20 border border-blue-500/50 rounded flex flex-col items-center justify-center text-blue-400 font-bold animate-pulse">
                      <span>BIN-B-12-03</span>
                      <span className="text-[8px] opacity-75">Target Location</span>
                    </div>
                    <div className="h-12 bg-amber-500/20 border border-amber-500/40 rounded flex items-center justify-center text-amber-400 font-semibold">
                      Zone C: 88%
                    </div>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full justify-center gap-2 text-xs" onClick={() => handleQuickAction('/digital-twin')}>
                <Map className="w-4 h-4 text-gray-500" />
                Open Full Digital Twin View
              </Button>
            </CardContent>
          </Card>
          
          {/* LIVE MOVEMENT ACTIVITY timeline view */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#0071C1]" />
                Live Movement Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative border-l-2 border-slate-100 pl-4 space-y-6">
                {movements.slice(0, 3).map((mov, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600"></span>
                    <div className="text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-900">{mov.item}</span>
                        <span className="text-gray-400 text-[10px]">{mov.time}</span>
                      </div>
                      <p className="text-gray-600 text-[11px] mb-1">
                        From <span className="font-medium font-mono text-gray-800">{mov.from}</span> to <span className="font-medium font-mono text-blue-700 bg-blue-50 px-1 rounded">{mov.to}</span>
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{mov.type}</span>
                        <Badge variant="success" className="text-[9px] px-1.5 py-0">Completed</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Route preview navigation modal */}
      {activeRouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">Pathfinding route preview</h3>
                  <p className="text-xs text-slate-300">Task: {activeRouteModal.id}</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-white font-semibold text-lg" onClick={() => setActiveRouteModal(null)}>×</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">1</div>
                  <div>
                    <h4 className="font-semibold text-xs text-gray-900">Receiving Dock A</h4>
                    <p className="text-[10px] text-gray-500">Unloading zone gate</p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-blue-400 h-6 ml-3"></div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">2</div>
                  <div>
                    <h4 className="font-semibold text-xs text-gray-900">Aisle {activeRouteModal.aisle}</h4>
                    <p className="text-[10px] text-gray-500">Optimized route navigation path</p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-blue-400 h-6 ml-3"></div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">3</div>
                  <div>
                    <h4 className="font-semibold text-xs text-gray-900">Rack {activeRouteModal.rack} - Bin {activeRouteModal.bin}</h4>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Final target bin location</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-xl space-y-1 text-xs text-blue-900">
                <div className="flex justify-between font-semibold"><span>Total Distance:</span> <span>{activeRouteModal.distance}</span></div>
                <div className="flex justify-between font-semibold"><span>Est. Transit Time:</span> <span>{activeRouteModal.estTime}</span></div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 justify-center" onClick={() => setActiveRouteModal(null)}>
                  Close Route Map
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

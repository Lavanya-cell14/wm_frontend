import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import AlertBanner from '../../components/ui/AlertBanner';
import StatusBadge from '../../components/ui/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { ClipboardList, Play, CheckCircle2, Navigation, MapPin, Box, ArrowRight, Hourglass } from 'lucide-react';

export default function PutawayTasks() {
  const { user } = useAuth();
  const { putawayTasks, startPutawayTask, completePutawayTask } = useWarehouse();
  const [toastMessage, setToastMessage] = useState('');
  const [activeRouteModal, setActiveRouteModal] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-[#0071C1]" />
            AI Putaway Tasks
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Storage operations queue. Follow optimized paths to place verified stock into bins.
          </p>
        </div>
        <Badge variant="warning" className="text-sm px-3 py-1 font-bold">
          {putawayTasks.length} Active Tasks
        </Badge>
      </div>

      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-0">
          {putawayTasks.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Box className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-900 text-base">No active putaways</h3>
              <p className="text-gray-500 text-sm">Excellent! The operational storage queue is completely cleared.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task ID</TableHead>
                  <TableHead>Product / SKU</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Target Bin Details</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Est. Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {putawayTasks.map((task) => (
                  <TableRow key={task.id} className={task.status === 'In Progress' ? 'bg-blue-50/10' : ''}>
                    <TableCell className="font-bold text-gray-900 font-mono text-sm">{task.id}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-gray-900 text-sm">{task.product}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{task.sku}</div>
                    </TableCell>
                    <TableCell className="font-bold text-gray-900 text-sm">{task.quantity} Units</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-blue-700 bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100 font-bold">
                          {task.bin}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          ({task.zone} • Aisle {task.aisle} • Rack {task.rack})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={task.priority === 'High' ? 'error' : 'warning'}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-xs font-semibold">
                      <div className="flex items-center gap-1">
                        <Hourglass className="w-3.5 h-3.5 text-gray-400" />
                        {task.estTime}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={task.status === 'In Progress' ? 'warning' : 'info'} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {task.status === 'Pending' ? (
                          <Button size="sm" className="gap-1" onClick={() => {
                            startPutawayTask(task.id);
                            showToast(`Putaway task ${task.id} started.`);
                          }}>
                            <Play className="w-3.5 h-3.5" /> Start
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1 font-bold" onClick={() => {
                            completePutawayTask(task.id, user);
                            showToast(`Stock verified and stored in ${task.bin}!`);
                          }}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="gap-1 text-gray-600" onClick={() => setActiveRouteModal(task)}>
                          <Navigation className="w-3.5 h-3.5 text-gray-500" /> Navigate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pathfinding routing modal */}
      {activeRouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
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

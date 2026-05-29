import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import AlertBanner from '../../components/ui/AlertBanner';
import StatusBadge from '../../components/ui/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { ClipboardList, Play, CheckCircle2, Navigation, MapPin, Box, ArrowRight, Hourglass, Sparkles, Clock, X } from 'lucide-react';
import { getZoneLabel } from '../../utils/zoneMapping';
import Pagination from '../../components/ui/Pagination';

export default function PutawayTasks() {
  const { user } = useAuth();
  const { putawayTasks, startPutawayTask, completePutawayTask } = useWarehouse();
  const [toastMessage, setToastMessage] = useState('');
  const [activeRouteModal, setActiveRouteModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const totalPages = Math.max(1, Math.ceil(putawayTasks.length / pageSize));
  const pagedTasks = putawayTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset page when tasks list changes (e.g., new task created or filtered elsewhere)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [putawayTasks.length]);

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
                {pagedTasks.map((task) => (
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
        <div className="px-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={putawayTasks.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(Math.max(1, Math.min(totalPages, p)))}
          />
        </div>

      {/* Pathfinding routing modal */}
      {activeRouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <Card className="max-w-2xl w-full overflow-hidden shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-[#0071C1] to-blue-700 text-white pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Navigation className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Guided Navigation</h3>
                  <p className="text-blue-100 text-xs mt-0.5">Task {activeRouteModal.id} • {activeRouteModal.product}</p>
                </div>
              </div>
              <button 
                className="p-1 hover:bg-white/20 rounded-lg transition-colors" 
                onClick={() => setActiveRouteModal(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Step-by-step guidance */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#0071C1]" />
                  Step-by-Step Route
                </h4>
                
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#0071C1] text-white flex items-center justify-center font-bold">1</div>
                    <div className="w-0.5 h-12 bg-gray-200 my-2"></div>
                  </div>
                  <div className="pb-4">
                    <h5 className="font-bold text-gray-900">Start at Receiving Dock</h5>
                    <p className="text-sm text-gray-600 mt-1">Collect your shipment from the inbound staging area.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#0071C1] text-white flex items-center justify-center font-bold">2</div>
                    <div className="w-0.5 h-12 bg-gray-200 my-2"></div>
                  </div>
                  <div className="pb-4">
                    <h5 className="font-bold text-gray-900">{getZoneLabel(activeRouteModal.zone)} ({activeRouteModal.zone})</h5>
                    <p className="text-sm text-gray-600 mt-1">Navigate to the designated zone area.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#0071C1] text-white flex items-center justify-center font-bold">3</div>
                    <div className="w-0.5 h-12 bg-gray-200 my-2"></div>
                  </div>
                  <div className="pb-4">
                    <h5 className="font-bold text-gray-900">Aisle {activeRouteModal.aisle}</h5>
                    <p className="text-sm text-gray-600 mt-1">Locate and enter the correct aisle.</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#0071C1] text-white flex items-center justify-center font-bold">4</div>
                    <div className="w-0.5 h-12 bg-gray-200 my-2"></div>
                  </div>
                  <div className="pb-4">
                    <h5 className="font-bold text-gray-900">{activeRouteModal.rack} - {activeRouteModal.shelf}</h5>
                    <p className="text-sm text-gray-600 mt-1">Navigate to the specific rack and shelf location.</p>
                  </div>
                </div>

                {/* Step 5 - Final */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">📍</div>
                  </div>
                  <div className="pb-4">
                    <h5 className="font-bold text-green-900 text-lg">{activeRouteModal.bin}</h5>
                    <p className="text-sm text-green-700 mt-1 font-semibold">Place all items into this bin location.</p>
                  </div>
                </div>
              </div>

              {/* Product and Metrics Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-1">Product</div>
                  <div className="font-bold text-gray-900">{activeRouteModal.product}</div>
                  <div className="text-xs text-gray-500 font-mono mt-1">{activeRouteModal.sku}</div>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-1">Quantity</div>
                  <div className="font-bold text-gray-900 text-lg">{activeRouteModal.quantity} units</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-xs text-orange-700 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Est. Time
                  </div>
                  <div className="font-bold text-gray-900">{activeRouteModal.estTime}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-xs text-purple-700 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Confidence
                  </div>
                  <div className="font-bold text-gray-900">{activeRouteModal.confidence || 96}%</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 justify-center bg-gradient-to-r from-[#0071C1] to-blue-700 text-white font-bold py-3" onClick={() => setActiveRouteModal(null)}>
                  <Navigation className="w-4 h-4 mr-2" />
                  Start Navigation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import SharedKeyValueCard from '../../components/shared/SharedKeyValueCard';
import { ClipboardList, Play, CheckCircle2, Navigation, MapPin, Box, ArrowRight, Hourglass, Sparkles, Clock, X, Eye } from 'lucide-react';

export default function PutawayTasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { putawayTasks, startPutawayTask } = useWarehouse();
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState(null);
  const pageSize = 8;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Filter tasks to show those that are NOT completed yet (or show all with sorting)
  const activeTasks = putawayTasks.filter(t => t.status !== 'COMPLETED');

  const totalPages = Math.max(1, Math.ceil(activeTasks.length / pageSize));
  const pagedTasks = activeTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleStart = (taskId) => {
    startPutawayTask(taskId);
    showToast(`Putaway task ${taskId} initiated! Status changed to IN_PROGRESS.`);
    // Navigate to active task page to perform steps
    setTimeout(() => navigate('/operator/active'), 800);
  };

  return (
    <div className="space-y-6 select-none">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-[#0071C1]" />
            Storage Tasks
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View assigned storage tasks, follow placement instructions, and mark completion.
          </p>
        </div>
        <Badge variant="warning" className="text-sm px-3 py-1 font-bold">
          {activeTasks.length} Active Tasks
        </Badge>
      </div>

      <Card className="border border-gray-150 shadow-xs">
        <CardContent className="p-0">
          {activeTasks.length === 0 ? (
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
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Destination Bin</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedTasks.map((task) => (
                  <TableRow key={task.id} className={task.status === 'IN_PROGRESS' || task.status === 'PICKED_FROM_RECEIVING' || task.status === 'REACHED_BIN' ? 'bg-blue-50/10' : ''}>
                    <TableCell className="font-bold text-gray-900 font-mono text-xs">{task.id}</TableCell>
                    <TableCell>
                      <div className="font-bold text-gray-900">{task.product}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{task.sku}</div>
                    </TableCell>
                    <TableCell className="font-bold text-gray-950">{task.quantity} Units</TableCell>
                    <TableCell>
                      <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-bold">
                        {task.destinationBin || task.bin || 'BIN-002'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={task.priority === 'High' ? 'error' : 'warning'}>
                        {task.priority || 'Medium'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={task.status === 'COMPLETED' ? 'success' : (task.status === 'IN_PROGRESS' || task.status === 'PICKED_FROM_RECEIVING' || task.status === 'REACHED_BIN' ? 'primary' : 'warning')}
                        className="text-[10px] uppercase font-bold"
                      >
                        {task.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1.5 justify-end items-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[11px] h-7 px-2 font-medium bg-[#F4FCFF] border-blue-100 text-blue-700 hover:bg-blue-50"
                          onClick={() => setSelectedTaskForModal(task)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-blue-500" />
                          View Details
                        </Button>
                        {(task.status === 'ASSIGNED' || task.status === 'Pending') ? (
                          <Button size="sm" className="gap-1.5 py-1 text-xs font-bold" onClick={() => handleStart(task.id)}>
                            <Play className="w-3.5 h-3.5" /> Start
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-[#0071C1] hover:bg-[#005c9e] text-white gap-1.5 py-1 text-xs font-bold" onClick={() => navigate('/operator/active')}>
                            <Eye className="w-3.5 h-3.5" /> View Active
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {totalPages > 1 && (
        <div className="px-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={activeTasks.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(Math.max(1, Math.min(totalPages, p)))}
          />
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedTaskForModal && (
        <Modal
          isOpen={!!selectedTaskForModal}
          onClose={() => setSelectedTaskForModal(null)}
          title={`Storage Task Details: ${selectedTaskForModal.id}`}
          maxWidth="max-w-xl"
          footer={
            <Button onClick={() => setSelectedTaskForModal(null)}>Close Task</Button>
          }
        >
          <div className="space-y-4 text-xs font-semibold text-gray-700">
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">Product Details</span>
                <span className="text-sm font-bold block mt-0.5">{selectedTaskForModal.product}</span>
                <span className="text-[10px] font-mono text-slate-300 mt-0.5 block">SKU: {selectedTaskForModal.sku}</span>
              </div>
              <Badge variant="primary" className="text-[10px] uppercase font-bold text-white bg-blue-600">
                {selectedTaskForModal.status.replace(/_/g, ' ')}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Inbound Receipt ID</span>
                <span className="text-slate-800 font-semibold text-xs mt-1 block font-mono">{selectedTaskForModal.inboundId || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Assigned By</span>
                <span className="text-slate-800 font-semibold text-xs mt-1 block">{selectedTaskForModal.assignedBy || 'Warehouse Manager'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Product Dimensions</span>
                <span className="text-slate-800 font-semibold text-xs mt-1 block font-mono">{selectedTaskForModal.dimensions || '30x30x30 cm'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Product Weight</span>
                <span className="text-slate-800 font-semibold text-xs mt-1 block font-mono">{selectedTaskForModal.weight || '4.5 kg'}</span>
              </div>
            </div>

            <SharedKeyValueCard
              title="AI Placement Orientation"
              items={[
                { label: "Orientation", value: selectedTaskForModal.orientation || "Orientation data not available from backend allocation." },
                { label: "Max Units Fit", value: selectedTaskForModal.maxUnitsFit ?? "N/A" },
                { label: "Utilization Score", value: selectedTaskForModal.utilizationScore ? `${selectedTaskForModal.utilizationScore}%` : "N/A" },
                { label: "Placement Instruction", value: selectedTaskForModal.placementInstruction || "N/A" },
              ]}
            />
            <div className="p-4 border border-gray-100 rounded-2xl bg-white space-y-2">
              <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 uppercase text-[10px] tracking-wider text-indigo-600">AI Routing Instructions</h4>
              <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 space-y-1.5">
                <span className="font-bold text-indigo-950 block">AI Neural Placement Reason:</span>
                <p className="text-slate-700 font-semibold leading-relaxed">{selectedTaskForModal.aiReason || 'Optimal slotting calculated based on frequency of access and product dimensions matching bin capacity.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                <div>Source Pickup: <span className="font-bold text-slate-800">{selectedTaskForModal.pickupLocation || 'Receiving Dock'}</span></div>
                <div>Destination Bin: <span className="font-bold font-mono text-blue-700">{selectedTaskForModal.destinationBin || selectedTaskForModal.bin || 'BIN-002'}</span></div>
                <div>Transit Route: <span className="font-bold text-slate-800">{selectedTaskForModal.routeSteps ? selectedTaskForModal.routeSteps.join(' → ') : 'Dock → Aisle 2 → Zone A → Target Bin'}</span></div>
                <div>Estimated Duration: <span className="font-bold text-slate-800">{selectedTaskForModal.estimatedTime || '3.5 min'}</span></div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, AlertBanner, Modal, Input } from 'shared-ui';
import { 
  Navigation, Check, Play, AlertTriangle, Clock, MapPin, 
  Package, Weight, Ruler, ChevronRight, UserCheck, ShieldAlert 
} from 'lucide-react';

export default function ActiveTask() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    putawayTasks, 
    startPutawayTask, 
    confirmPickedFromReceiving, 
    confirmReachedBin, 
    completePutawayTask,
    reportPutawayIssue,
    aiRecommendations
  } = useWarehouse();

  const [toastMessage, setToastMessage] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  
  // Issue Form States
  const [issueType, setIssueType] = useState('Product damaged');
  const [issueDesc, setIssueDesc] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Find active task in progress
  const activeTask = putawayTasks.find(t => 
    t.status === 'IN_PROGRESS' || 
    t.status === 'PICKED_FROM_RECEIVING' || 
    t.status === 'REACHED_BIN' ||
    t.status === 'DELAYED'
  );

  const recommendation = activeTask ? aiRecommendations.find(a => a.inboundId === activeTask.inboundId) : null;

  const handleStart = () => {
    if (!activeTask) return;
    startPutawayTask(activeTask.id);
    showToast(`Task started! Status is now IN_PROGRESS.`);
  };

  const handlePick = () => {
    if (!activeTask) return;
    confirmPickedFromReceiving(activeTask.id);
    showToast(`Picked from Receiving! Path guidance activated.`);
  };

  const handleReached = () => {
    if (!activeTask) return;
    confirmReachedBin(activeTask.id);
    showToast(`Arrived at suggested bin code.`);
  };

  const handleComplete = () => {
    if (!activeTask) return;
    completePutawayTask(activeTask.id, user);
    showToast(`Storage completed successfully! Product stored.`);
    setTimeout(() => navigate('/operator/dashboard'), 1000);
  };

  const handleReportIssue = (e) => {
    e.preventDefault();
    if (!activeTask || !issueDesc) return;
    reportPutawayIssue(activeTask.id, issueType, issueDesc, user);
    showToast(`Issue logged! Task marked as DELAYED.`);
    setShowIssueModal(false);
    setIssueDesc('');
  };

  if (!activeTask) {
    // Show fallback to select a task
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 select-none">
        <Package className="w-16 h-16 text-gray-300 animate-pulse" />
        <h2 className="text-xl font-bold text-gray-900">No In-Progress Tasks</h2>
        <p className="text-gray-500 text-sm max-w-sm">
          Please select and start a storage task from the dashboard or storage tasks queue.
        </p>
        <Button onClick={() => navigate('/operator/storage-tasks')} className="bg-[#0071C1] hover:bg-[#005c9e] text-white font-bold py-2 px-6">
          Open Storage Tasks Queue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Navigation className="w-7 h-7 text-blue-600 animate-pulse" />
            Active Storage Task Workspace
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Task ID: <span className="font-mono font-bold text-gray-900">{activeTask.id}</span> • Inbound ID: <span className="font-mono font-bold text-gray-900">{activeTask.inboundId}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={activeTask.priority === 'High' ? 'error' : 'warning'} className="text-sm px-3 py-1 font-bold">
            {activeTask.priority} Priority
          </Badge>
          <Badge variant="primary" className="text-sm px-3 py-1 font-bold animate-pulse uppercase">
            {activeTask.status.replace(/_/g, ' ')}
          </Badge>
        </div>
      </div>

      {/* Step workflow progression widget */}
      <Card className="border border-blue-150 bg-blue-50/10">
        <CardContent className="p-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-gray-950 text-sm">Storage Step Actions</h3>
            <p className="text-xs text-gray-500">Perform the task actions sequentially as you retrieve and place the inventory.</p>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {activeTask.status === 'ASSIGNED' && (
              <Button onClick={handleStart} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 gap-1.5 flex-1 md:flex-initial">
                <Play className="w-4 h-4" /> Start Task
              </Button>
            )}
            
            {activeTask.status === 'IN_PROGRESS' && (
              <Button onClick={handlePick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 gap-1.5 flex-1 md:flex-initial">
                <Package className="w-4 h-4" /> Confirm Picked from Dock
              </Button>
            )}

            {activeTask.status === 'PICKED_FROM_RECEIVING' && (
              <Button onClick={handleReached} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 gap-1.5 flex-1 md:flex-initial">
                <MapPin className="w-4 h-4" /> Confirm Reached Bin
              </Button>
            )}

            {activeTask.status === 'REACHED_BIN' && (
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 px-5 gap-1.5 flex-1 md:flex-initial">
                <Check className="w-4 h-4" /> Complete Storage
              </Button>
            )}

            <Button 
              variant="outline" 
              onClick={() => navigate('/operator/navigation')}
              className="text-blue-600 border-blue-200 hover:bg-blue-50 font-bold text-xs py-2 px-4 flex-1 md:flex-initial"
            >
              Open Navigation
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowIssueModal(true)}
              className="text-red-600 border-red-200 hover:bg-red-50 font-bold text-xs py-2 px-4 flex-1 md:flex-initial"
            >
              Report Issue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Product Details & AI recomendation) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-150">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" /> Product Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-gray-700">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">SKU Code</span>
                  <span className="font-bold text-gray-950 font-mono text-sm">{activeTask.sku}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Product name</span>
                  <span className="font-bold text-gray-950 text-sm truncate block">{activeTask.product}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Total Quantity</span>
                  <span className="font-bold text-gray-950 text-sm block">{activeTask.quantity} Units</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Pickup Manifest</span>
                  <span className="font-bold text-gray-950 text-sm block">{activeTask.pickupLocation || 'Receiving Dock'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
                  <Weight className="w-5 h-5 text-orange-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Weight (Gross)</span>
                    <span className="font-bold text-gray-950">{recommendation?.weight || '18.5 kg'}</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-purple-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Dimensions (Outer)</span>
                    <span className="font-bold text-gray-950">{recommendation?.dimensions || '52 x 32 x 28 cm'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-150">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" /> AI Slotting Coordinates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                    <div className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[9px]">Zone</div>
                    <div className="font-bold text-gray-900 text-sm">{activeTask.destinationZone || 'Zone B'}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                    <div className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[9px]">Rack</div>
                    <div className="font-bold text-gray-900 text-sm">{activeTask.destinationRack || 'Rack 2'}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                    <div className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[9px]">Shelf</div>
                    <div className="font-bold text-gray-900 text-sm">{activeTask.destinationShelf || 'Level 1'}</div>
                  </div>
                  <div className="bg-blue-600 p-2.5 rounded-lg border border-blue-700">
                    <div className="text-blue-100 font-bold uppercase tracking-wider mb-0.5 text-[9px]">Bin Code</div>
                    <div className="font-bold text-white text-sm font-mono">{activeTask.destinationBin || activeTask.bin}</div>
                  </div>
                </div>
              </div>

              {recommendation?.reason && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs leading-normal">
                  <span className="font-bold text-slate-800 uppercase block mb-1">AI Recommendation Reason</span>
                  <p className="text-slate-600 font-semibold">{recommendation.reason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Columns (Route steps, Obstacles, Issue logs) */}
        <div className="space-y-6">
          <Card className="border border-gray-150">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-1.5 text-gray-700">
                <Clock className="w-4.5 h-4.5 text-blue-600" /> Route Estimates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs font-semibold text-gray-600">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Estimated Distance:</span>
                <span className="text-gray-900 font-bold">45 meters</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Estimated Time:</span>
                <span className="text-gray-900 font-bold">5 minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Route Path:</span>
                <span className="text-gray-500 font-mono text-[10px] truncate max-w-[150px]">{activeTask.routePath || 'Dock -> Zone'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Issue Logs */}
          {activeTask.issue && (
            <Card className="border border-red-200 bg-red-50/10">
              <CardHeader className="border-b border-red-150 pb-3 bg-red-50/30">
                <CardTitle className="text-xs font-bold uppercase text-red-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" /> Reported Issue
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-xs space-y-2">
                <div className="flex justify-between font-bold text-red-950">
                  <span>Type: {activeTask.issue.issueType}</span>
                  <span className="text-[10px] text-red-600">{new Date(activeTask.issue.reportedAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-red-800 leading-normal font-semibold">{activeTask.issue.description}</p>
                <div className="text-[10px] text-red-400 font-bold">Reported By: {activeTask.issue.reportedBy}</div>
              </CardContent>
            </Card>
          )}
        </div>

      </div>

      {/* REPORT ISSUE MODAL */}
      {showIssueModal && (
        <Modal
          isOpen={showIssueModal}
          onClose={() => setShowIssueModal(false)}
          title="Report Handling Issue"
          maxWidth="max-w-md"
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setShowIssueModal(false)}>Cancel</Button>
              <Button type="button" onClick={handleReportIssue} className="bg-red-600 hover:bg-red-700 text-white font-bold">Log Issue</Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700 uppercase">Issue Type</label>
              <select 
                value={issueType} 
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white"
              >
                <option value="Product damaged">Product damaged during transit</option>
                <option value="Quantity mismatch">Quantity mismatch with invoice</option>
                <option value="Bin occupied">Destination bin occupied</option>
                <option value="Bin full">Destination bin full</option>
                <option value="Route blocked">Transit pathway / Aisle blocked</option>
                <option value="Wrong product">Wrong product item loaded</option>
                <option value="Barcode mismatch">Barcode scanning mismatch</option>
                <option value="Other">Other issue</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700 uppercase">Description Details</label>
              <textarea
                value={issueDesc}
                onChange={(e) => setIssueDesc(e.target.value)}
                placeholder="Explain the layout issue or item defect in detail..."
                rows={4}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white"
                required
              />
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

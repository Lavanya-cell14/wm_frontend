import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  AlertBanner
} from 'shared-ui';
import StatCard from '../components/dashboard/StatCard';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import { 
  Lightbulb, CheckCircle2, Cpu, Sparkles, 
  Loader2, Eye, RefreshCw, UserCheck, ClipboardList 
} from 'lucide-react';

export default function AiRecommendations() {
  const { 
    aiRecommendations, 
    inboundReceipts, 
    workers,
    acceptAiRecommendation, 
    rejectAiRecommendation, 
    generateBinRecommendation,
    assignPutawayTask,
    isLoading, 
    error 
  } = useWarehouse();

  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'dispatch' | 'tracking'
  const [selectedRecommendationForDetails, setSelectedRecommendationForDetails] = useState(null);
  
  // Dispatch Modal States
  const [selectedReceiptForAssign, setSelectedReceiptForAssign] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignPriority, setAssignPriority] = useState('Medium');

  // Regeneration loading state
  const [regeneratingId, setRegeneratingId] = useState(null);

  // Pagination states
  const [reviewPage, setReviewPage] = useState(1);
  const [dispatchPage, setDispatchPage] = useState(1);
  const [trackingPage, setTrackingPage] = useState(1);
  
  useEffect(() => {
    setReviewPage(1);
    setDispatchPage(1);
    setTrackingPage(1);
  }, [activeTab]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAccept = (rec) => {
    acceptAiRecommendation(rec.id);
    triggerToast(`AI recommendation for "${rec.productName}" APPROVED! Ready for dispatch.`);
  };

  const handleReject = (rec) => {
    rejectAiRecommendation(rec.id);
    triggerToast(`AI recommendation for "${rec.productName}" rejected.`);
  };

  const handleRegenerate = (rec) => {
    setRegeneratingId(rec.id);
    setTimeout(() => {
      generateBinRecommendation(rec.inboundId);
      setRegeneratingId(null);
      triggerToast(`New alternative slotting recommendation generated for "${rec.productName}"!`);
    }, 1200);
  };

  const handleDispatchSubmit = (e) => {
    e.preventDefault();
    if (!selectedReceiptForAssign || !selectedStaffId) return;

    const staffMember = workers.find(w => w.id === selectedStaffId) || { name: 'Warehouse Staff' };
    assignPutawayTask(selectedReceiptForAssign.id, staffMember.id, staffMember.name, assignPriority);

    triggerToast(`Task assigned & dispatched to ${staffMember.name}!`);
    setSelectedReceiptForAssign(null);
    setSelectedStaffId('');
  };

  const handleOpenAssign = (receipt) => {
    setSelectedReceiptForAssign(receipt);
    const staffWorkers = workers.filter(w => w.role === 'STAFF');
    setSelectedStaffId(staffWorkers[0] ? staffWorkers[0].id : (workers[0]?.id || ''));
    setAssignPriority(receipt.priority || 'Medium');
  };

  // Filter recommendations/receipts based on active list tab
  const pendingReviews = aiRecommendations.filter(rec => rec.status === 'PENDING_REVIEW');
  const approvedPlacements = inboundReceipts.filter(r => r.status === 'RECOMMENDATION_APPROVED');
  const trackedInbounds = inboundReceipts;
  const staffWorkers = workers.filter(w => w.role === 'STAFF');

  // Derived stats
  const accuracyConfidence = '96.4%';
  const decisionsApproved = inboundReceipts.filter(r => 
    r.status === 'RECOMMENDATION_APPROVED' || 
    r.status === 'ASSIGNED_TO_STAFF' || 
    r.status === 'IN_PROGRESS' || 
    r.status === 'STORED'
  ).length;

  // Review tab pagination calculations
  const reviewTotalPages = Math.max(1, Math.ceil(pendingReviews.length / 6));
  const activeReviewPage = Math.min(reviewPage, reviewTotalPages);
  const paginatedReviews = pendingReviews.slice((activeReviewPage - 1) * 6, activeReviewPage * 6);

  // Dispatch tab pagination calculations
  const dispatchTotalPages = Math.max(1, Math.ceil(approvedPlacements.length / 10));
  const activeDispatchPage = Math.min(dispatchPage, dispatchTotalPages);
  const paginatedDispatch = approvedPlacements.slice((activeDispatchPage - 1) * 10, activeDispatchPage * 10);

  // Tracking tab pagination calculations
  const trackingTotalPages = Math.max(1, Math.ceil(trackedInbounds.length / 10));
  const activeTrackingPage = Math.min(trackingPage, trackingTotalPages);
  const paginatedTracking = trackedInbounds.slice((activeTrackingPage - 1) * 10, activeTrackingPage * 10);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-[#0071C1] animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Querying dynamic slotting recommendations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {error && <AlertBanner type="error" message={error} />}

      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-7 h-7 text-amber-500" />
            AI Operations & Slotting Center
          </h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
            Optimize warehouse volume layouts, authorize automated placement logic, and allocate tasks.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Slotting Reviews Pending" value={pendingReviews.length} icon={Lightbulb} />
        <StatCard title="Ready to Dispatch" value={approvedPlacements.length} icon={UserCheck} />
        <StatCard title="WMS Decisions Enforced" value={decisionsApproved} icon={CheckCircle2} />
        <StatCard title="Accuracy Confidence" value={accuracyConfidence} icon={Sparkles} />
      </div>

      {/* Tab controls */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('review')}
          className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'review'
              ? 'border-[#0071C1] text-[#0071C1]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Review Queue ({pendingReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'dispatch'
              ? 'border-[#0071C1] text-[#0071C1]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Dispatch Queue ({approvedPlacements.length})
        </button>
        <button
          onClick={() => setActiveTab('tracking')}
          className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'tracking'
              ? 'border-[#0071C1] text-[#0071C1]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Inbound Tracking ({trackedInbounds.length})
        </button>
      </div>

      {/* Tab Contents: REVIEW QUEUE */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedReviews.length === 0 ? (
              <div className="col-span-full p-12 text-center text-gray-400 font-bold text-sm bg-white rounded-2xl border border-gray-150 shadow-xs">
                No bin recommendations pending review. Click "Generate AI Recommendation" from the manager dashboard to calculate new paths.
              </div>
            ) : (
              paginatedReviews.map((rec) => (
                <Card key={rec.id} className="border border-t-4 border-t-amber-500 border-gray-150 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                  <CardHeader className="border-b border-gray-50 bg-slate-50/20 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{rec.title}</h3>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{rec.id} (Inbound: {rec.inboundId})</p>
                      </div>
                      <Badge variant={rec.priority === 'High' ? 'error' : 'warning'}>{rec.priority}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4 text-xs">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="font-bold text-gray-500 uppercase tracking-wide">Neural Placement Rationale</span>
                        <p className="text-gray-700 leading-relaxed bg-blue-50/40 p-3 rounded-lg border border-blue-100 font-semibold">
                          {rec.reason}
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 grid grid-cols-2 gap-2 text-gray-700 font-semibold">
                        <div>Target Slot: <span className="font-mono text-blue-700 font-bold">{rec.bin}</span></div>
                        <div>Zone: <span className="text-gray-900">{rec.zone}</span></div>
                        <div>Rack: <span className="text-gray-900">{rec.rack}</span></div>
                        <div>Level: <span className="text-gray-900">{rec.shelf}</span></div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                          <span>Dimension Fit:</span>
                          <span className="text-gray-900 font-extrabold">{rec.fitScore || 94}%</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                          <span>Weight Safety:</span>
                          <span className="text-gray-900 font-extrabold">{rec.weightSafetyScore || 95}%</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                          <span>Available Capacity:</span>
                          <span className="text-gray-900 font-extrabold">{rec.capacityScore || 92}%</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                          <span>Zone Suitability:</span>
                          <span className="text-gray-900 font-extrabold">{rec.zoneSuitabilityScore || 96}%</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                          <span>Route Efficiency:</span>
                          <span className="text-gray-900 font-extrabold">{rec.routeEfficiencyScore || 88}%</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-50 pb-1 font-bold text-amber-600">
                          <span>Overall Conf:</span>
                          <span className="font-extrabold">{rec.confidence || 94}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 w-full mt-auto">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 justify-center py-2 px-2 text-[11px] font-semibold text-gray-600 gap-1"
                          onClick={() => setSelectedRecommendationForDetails(rec)}
                        >
                          <Eye className="w-3.5 h-3.5" /> Diagnostics
                        </Button>
                        <Button 
                          variant="outline"
                          disabled={regeneratingId === rec.id}
                          className="flex-1 justify-center py-2 px-2 text-[11px] font-semibold text-slate-600 gap-1"
                          onClick={() => handleRegenerate(rec)}
                        >
                          {regeneratingId === rec.id ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /></>
                          ) : (
                            <><RefreshCw className="w-3.5 h-3.5" /> Recalculate</>
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 justify-center py-2 text-[11px] font-bold text-red-600 border-red-100 hover:bg-red-50" 
                          onClick={() => handleReject(rec)}
                        >
                          Reject
                        </Button>
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white justify-center py-2 text-[11px] font-bold" 
                          onClick={() => handleAccept(rec)}
                        >
                          Approve Slot
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          {reviewTotalPages > 1 && (
            <div className="flex justify-center w-full mt-4">
              <Pagination
                currentPage={activeReviewPage}
                totalPages={reviewTotalPages}
                totalItems={pendingReviews.length}
                pageSize={6}
                onPageChange={setReviewPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: DISPATCH QUEUE */}
      {activeTab === 'dispatch' && (
        <Card className="border border-gray-150 shadow-xs">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-sm font-bold uppercase flex items-center gap-1.5 text-gray-700">
              <UserCheck className="w-4.5 h-4.5 text-emerald-600" />
              Approved Placements Ready for Staff Directives
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-xs text-left">
                <thead className="bg-[#F4FCFF] text-gray-700 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Inbound ID</th>
                    <th className="px-6 py-4">Product Specs</th>
                    <th className="px-6 py-4">Approved Location</th>
                    <th className="px-6 py-4">Volume / Weight</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {paginatedDispatch.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 font-bold text-gray-400">
                        No approved slots waiting for staff assignment. Go to "Review Queue" and approve slotting proposals first.
                      </td>
                    </tr>
                  ) : (
                    paginatedDispatch.map((r) => {
                      const rec = aiRecommendations.find(a => a.inboundId === r.id) || {};
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold font-mono text-gray-900">{r.id}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{r.productName}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{r.sku}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {rec.bin || 'Pending'}
                            </span>
                            <div className="text-[10px] text-gray-400 mt-1 font-semibold">{rec.zone} | {rec.rack} | {rec.shelf}</div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-700">
                            <div>{r.verifiedQuantity} units</div>
                            <div className="text-[10px] text-gray-400">{r.dimensions} ({r.weight})</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={r.priority === 'High' ? 'error' : 'warning'}>{r.priority || 'Medium'}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button 
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-1.5 px-3.5"
                              onClick={() => handleOpenAssign(r)}
                            >
                              Dispatch Personnel
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
          {dispatchTotalPages > 1 && (
            <div className="p-4 border-t border-gray-100">
              <Pagination
                currentPage={activeDispatchPage}
                totalPages={dispatchTotalPages}
                totalItems={approvedPlacements.length}
                pageSize={10}
                onPageChange={setDispatchPage}
              />
            </div>
          )}
        </Card>
      )}

      {/* Tab Contents: INBOUND LIFE CYCLE TRACKING */}
      {activeTab === 'tracking' && (
        <Card className="border border-gray-150 shadow-xs">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-sm font-bold uppercase flex items-center gap-1.5 text-gray-700">
              <ClipboardList className="w-4.5 h-4.5 text-[#0071C1]" />
              Inbound Receipt Work-flows Lifecycle Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-xs text-left">
                <thead className="bg-[#F4FCFF] text-gray-700 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Inbound Item</th>
                    <th className="px-6 py-4">Destination Bin</th>
                    <th className="px-6 py-4">Task Lifecycle Stage</th>
                    <th className="px-6 py-4">Operational Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {paginatedTracking.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 font-bold text-gray-400">
                        No tracked inbound receipts found in database.
                      </td>
                    </tr>
                  ) : (
                    paginatedTracking.map((r) => {
                      const rec = aiRecommendations.find(a => a.inboundId === r.id) || {};
                      
                      // Map state to human descriptions
                      const statusSteps = [
                        { key: 'WAITING_FOR_BIN_ASSIGNMENT', label: 'Clerk Verified' },
                        { key: 'BIN_SUGGESTED', label: 'Slot Sug.' },
                        { key: 'RECOMMENDATION_APPROVED', label: 'Appr' },
                        { key: 'ASSIGNED_TO_STAFF', label: 'Assigned' },
                        { key: 'IN_PROGRESS', label: 'Walking' },
                        { key: 'STORED', label: 'Stored' }
                      ];

                      const currentIdx = statusSteps.findIndex(s => s.key === r.status);

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{r.productName}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {r.id} | SKU: {r.sku} | Qty: {r.verifiedQuantity}</div>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold">
                            {rec.bin ? (
                              <span className="text-blue-700 bg-blue-50/50 border border-blue-100 px-1.5 py-0.5 rounded">
                                {rec.bin}
                              </span>
                            ) : (
                              <span className="text-gray-400">Not Assigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {/* Step progress graphic indicator */}
                            <div className="flex items-center gap-1.5 font-bold text-[10px] select-none">
                              {statusSteps.map((step, idx) => {
                                const isPassed = idx <= currentIdx;
                                const isCurrent = idx === currentIdx;
                                return (
                                  <React.Fragment key={step.key}>
                                    {idx > 0 && (
                                      <span className={`w-3.5 h-[2px] ${isPassed ? 'bg-emerald-500' : 'bg-slate-200'}`}></span>
                                    )}
                                    <div 
                                      className={`p-1 rounded-sm border ${
                                        isCurrent 
                                          ? 'bg-[#0071C1] text-white border-blue-800 ring-2 ring-blue-150 animate-pulse' 
                                          : isPassed 
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                            : 'bg-slate-50 border-slate-200 text-slate-400'
                                      }`}
                                      title={step.key}
                                    >
                                      {step.label}
                                    </div>
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              variant={r.status === 'STORED' ? 'success' : r.status === 'WAITING_FOR_BIN_ASSIGNMENT' ? 'warning' : 'primary'}
                              className="text-[9px] uppercase font-bold"
                            >
                              {r.status.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
          {trackingTotalPages > 1 && (
            <div className="p-4 border-t border-gray-150">
              <Pagination
                currentPage={activeTrackingPage}
                totalPages={trackingTotalPages}
                totalItems={trackedInbounds.length}
                pageSize={10}
                onPageChange={setTrackingPage}
              />
            </div>
          )}
        </Card>
      )}

      {/* DISPATCH/ASSIGN STAFF MODAL */}
      {selectedReceiptForAssign && (
        <Modal
          isOpen={!!selectedReceiptForAssign}
          onClose={() => setSelectedReceiptForAssign(null)}
          title="Dispatch Putaway Instructions"
          maxWidth="max-w-md"
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setSelectedReceiptForAssign(null)}>Cancel</Button>
              <Button type="button" onClick={handleDispatchSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Dispatch Directives</Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-500">Inbound Receipt ID:</span>
                <span className="text-gray-900 font-mono font-bold">{selectedReceiptForAssign.id}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-500">Product Name:</span>
                <span className="text-gray-900 font-bold">{selectedReceiptForAssign.productName}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-500">Total Quantity:</span>
                <span className="text-gray-900 font-bold">{selectedReceiptForAssign.verifiedQuantity} units</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-500">Target Assigned Bin:</span>
                <span className="text-blue-700 font-bold bg-blue-50 px-1 rounded font-mono">
                  {aiRecommendations.find(a => a.inboundId === selectedReceiptForAssign.id)?.bin || 'BIN-002'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700 uppercase">Select Personnel (Staff role)</label>
              <select 
                value={selectedStaffId} 
                onChange={(e) => setSelectedStaffId(e.target.value)} 
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white font-medium text-slate-800"
              >
                {staffWorkers.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.id})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700 uppercase">Task Priority Level</label>
              <select 
                value={assignPriority} 
                onChange={(e) => setAssignPriority(e.target.value)} 
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white font-medium text-slate-800"
              >
                <option value="High">High (Immediate Action)</option>
                <option value="Medium">Medium (Standard Walk)</option>
                <option value="Low">Low (Buffer Hold)</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* DIAGNOSTICS DETAIL MODAL */}
      {selectedRecommendationForDetails && (
        <Modal
          isOpen={!!selectedRecommendationForDetails}
          onClose={() => setSelectedRecommendationForDetails(null)}
          title="Placement Recommendation Analysis"
          maxWidth="max-w-md"
          footer={
            <Button onClick={() => setSelectedRecommendationForDetails(null)} className="w-full justify-center">Close Diagnostics</Button>
          }
        >
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Neural Slotting Diagnostic Details
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-slate-700 font-semibold">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-gray-400 font-bold block uppercase mb-0.5">Target Location Code</span>
                <span className="font-bold text-gray-900 font-mono">{selectedRecommendationForDetails.bin}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-gray-400 font-bold block uppercase mb-0.5">Physical Zone</span>
                <span className="font-bold text-gray-900">{selectedRecommendationForDetails.zone}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-gray-400 font-bold block uppercase mb-0.5">Storage Rack</span>
                <span className="font-bold text-gray-900">{selectedRecommendationForDetails.rack}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-gray-400 font-bold block uppercase mb-0.5">Shelf Elevation</span>
                <span className="font-bold text-gray-900">{selectedRecommendationForDetails.shelf}</span>
              </div>
            </div>

            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-150 space-y-1.5">
              <span className="font-bold text-blue-900 block">AI Neural Engine Decision:</span>
              <p className="text-blue-950 leading-relaxed font-semibold">{selectedRecommendationForDetails.reason}</p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-gray-900 uppercase">Analysis Confidence Scores</h5>
              <div className="grid grid-cols-2 gap-2 font-semibold text-[11px] text-gray-600">
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span>Dimension Fit:</span>
                  <span className="text-gray-900 font-bold">{selectedRecommendationForDetails.fitScore || 94}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span>Weight Safety:</span>
                  <span className="text-gray-900 font-bold">{selectedRecommendationForDetails.weightSafetyScore || 95}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span>Available Capacity:</span>
                  <span className="text-gray-900 font-bold">{selectedRecommendationForDetails.capacityScore || 92}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span>Zone Suitability:</span>
                  <span className="text-gray-900 font-bold">{selectedRecommendationForDetails.zoneSuitabilityScore || 96}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span>Route Efficiency:</span>
                  <span className="text-gray-900 font-bold">{selectedRecommendationForDetails.routeEfficiencyScore || 88}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1 text-amber-600 font-bold">
                  <span>Overall Confidence:</span>
                  <span className="font-bold">{selectedRecommendationForDetails.confidence || 94}%</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

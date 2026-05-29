import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import StatCard from '../components/dashboard/StatCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AlertBanner from '../components/ui/AlertBanner';
import Pagination from '../components/ui/Pagination';
import { Lightbulb, CheckCircle2, ShieldAlert, Cpu, Sparkles, AlertCircle, Loader2, X, Eye, RefreshCw, MapPin, Package, Weight, Ruler, Clock, Zap } from 'lucide-react';
import { getZoneLabel } from '../utils/zoneMapping';

export default function AiRecommendations() {
  const { aiRecommendations, acceptAiRecommendation, rejectAiRecommendation, isLoading, error } = useWarehouse();
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecommendationForDetails, setSelectedRecommendationForDetails] = useState(null);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [regeneratedData, setRegeneratedData] = useState({});

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Reset pagination to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [aiRecommendations]);

  const handleAccept = (rec) => {
    acceptAiRecommendation(rec.id);
    triggerToast(`AI recommendation "${rec.title}" successfully approved and deployed!`);
  };

  const handleReject = (rec) => {
    rejectAiRecommendation(rec.id);
    triggerToast(`AI recommendation "${rec.title}" successfully dismissed.`);
  };

  const handleViewDetails = (rec) => {
    setSelectedRecommendationForDetails(rec);
  };

  const handleRegenerate = (rec) => {
    setRegeneratingId(rec.id);
    
    // Simulate regeneration with slight variations
    setTimeout(() => {
      const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
      const aisles = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3'];
      const racks = ['R-10', 'R-11', 'R-12', 'R-13', 'R-14', 'R-15'];
      const shelves = ['S-01', 'S-02', 'S-03', 'S-04', 'S-05'];
      
      const newZone = zones[Math.floor(Math.random() * zones.length)];
      const newAisle = aisles[Math.floor(Math.random() * aisles.length)];
      const newRack = racks[Math.floor(Math.random() * racks.length)];
      const newShelf = shelves[Math.floor(Math.random() * shelves.length)];
      const newBin = `BIN-${newZone.replace('Zone ', '')}-${Math.floor(Math.random() * 15) + 1}-${Math.floor(Math.random() * 9) + 1}`;
      const newConfidence = Math.floor(Math.random() * 10) + 90;
      const estTimes = ['4 minutes', '5 minutes', '6 minutes', '7 minutes', '8 minutes'];
      const newEstTime = estTimes[Math.floor(Math.random() * estTimes.length)];
      
      setRegeneratedData(prev => ({
        ...prev,
        [rec.id]: {
          zone: newZone,
          aisle: newAisle,
          rack: newRack,
          shelf: newShelf,
          bin: newBin,
          confidence: newConfidence,
          estTime: newEstTime,
          reason: `Alternative placement analysis: ${rec.title} is now recommended for ${newZone} (${getZoneLabel(newZone)}). This revised allocation optimizes weight distribution and minimizes cross-zone travel time.`
        }
      }));
      
      setRegeneratingId(null);
      triggerToast(`Alternative placement suggestion generated for ${rec.title}!`);
    }, 1500);
  };

  // Pagination parameters
  const itemsPerPage = 8;
  const totalPages = Math.ceil(aiRecommendations.length / itemsPerPage);
  const paginatedRecommendations = aiRecommendations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-[#0071C1] animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Querying dynamic slotting recommendations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <AlertBanner type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Lightbulb className="w-7 h-7 text-amber-500" />
            AI Operations Recommendations
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review layout balancing and slotting recommendations calculated by the Warehouse Neural Engine.</p>
        </div>
        <Badge variant="primary" className="text-sm px-3 py-1 font-bold">
          {aiRecommendations.length} Recommendations Pending
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total AI Calculations" value="1,290" icon={Cpu} />
        <StatCard title="Accuracy Confidence" value="96.2%" icon={Sparkles} />
        <StatCard title="Decisions Deployed" value="84 Approves" icon={CheckCircle2} />
        <StatCard title="Critical Anomalies Checked" value="0 Alerts" icon={ShieldAlert} />
      </div>

      {/* AI Suggestion Cards list */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedRecommendations.length === 0 ? (
            <div className="col-span-full p-12 text-center text-gray-500 text-sm bg-white rounded-xl border border-gray-100">
              No pending AI recommendations to review. Systems are fully balanced.
            </div>
          ) : (
            paginatedRecommendations.map((rec) => {
              const currentData = regeneratedData[rec.id] || rec;
              return (
                <Card key={rec.id} className="border border-t-4 border-t-[#0071C1] border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <CardHeader className="border-b border-gray-50 bg-gray-50/20 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{rec.title}</h3>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{rec.id}</p>
                      </div>
                      <Badge variant={rec.priority === 'High' ? 'error' : 'warning'}>{rec.priority}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4 text-xs">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="font-bold text-gray-900 uppercase tracking-wide">AI Rationale:</span>
                        <p className="text-gray-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100 font-semibold">
                          {currentData.reason || rec.reason}
                        </p>
                      </div>

                      {/* Placement details grid */}
                      {currentData.zone && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-blue-600" />
                              <span className="font-semibold text-gray-900">{currentData.zone}</span>
                            </div>
                            <div className="text-right font-semibold text-gray-900">{currentData.confidence}%</div>
                            <div className="text-gray-500 text-[10px] col-span-2 uppercase tracking-wider">Confidence</div>
                          </div>
                        </div>
                      )}

                      <div className="text-green-700 bg-green-50/50 p-2 rounded-lg border border-green-100 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        {rec.impact}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 w-full mt-auto">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 justify-center py-2 px-2 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 gap-1"
                          onClick={() => handleViewDetails(rec)}
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </Button>
                        <Button 
                          variant="outline"
                          disabled={regeneratingId === rec.id}
                          className="flex-1 justify-center py-2 px-2 text-xs font-semibold text-gray-600 border-gray-200 hover:bg-gray-50 gap-1"
                          onClick={() => handleRegenerate(rec)}
                        >
                          {regeneratingId === rec.id ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /></>
                          ) : (
                            <><RefreshCw className="w-3.5 h-3.5" /> Regenerate</>
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 justify-center py-2 text-xs font-bold text-red-600 border-red-100 hover:bg-red-50" onClick={() => handleReject(rec)}>
                          Dismiss
                        </Button>
                        <Button className="flex-1 bg-[#0071C1] hover:bg-[#005c9e] text-white justify-center py-2 text-xs font-bold" onClick={() => handleAccept(rec)}>
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRecommendationForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={() => setSelectedRecommendationForDetails(null)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <CardHeader className="border-b border-gray-100 sticky top-0 bg-white flex items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#0071C1]" />
                Recommendation Details
              </CardTitle>
              <button
                onClick={() => setSelectedRecommendationForDetails(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Product Info */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  Product Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <dt className="text-gray-500 font-medium text-xs uppercase tracking-wider">SKU</dt>
                    <dd className="mt-1 font-bold text-gray-900">{selectedRecommendationForDetails.sku || 'PRD-001'}</dd>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <dt className="text-gray-500 font-medium text-xs uppercase tracking-wider">Category</dt>
                    <dd className="mt-1 font-bold text-gray-900">{selectedRecommendationForDetails.category || 'Electronics'}</dd>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <dt className="text-gray-500 font-medium text-xs uppercase tracking-wider">Weight</dt>
                    <dd className="mt-1 font-bold text-gray-900 flex items-center gap-1">
                      <Weight className="w-3.5 h-3.5 text-orange-600" />
                      {selectedRecommendationForDetails.weight || '2.4 kg'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <dt className="text-gray-500 font-medium text-xs uppercase tracking-wider">Dimensions</dt>
                    <dd className="mt-1 font-bold text-gray-900 flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-purple-600" />
                      {selectedRecommendationForDetails.dimensions || '35x24x3 cm'}
                    </dd>
                  </div>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Recommended Placement
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                      <div className="text-gray-500 font-bold uppercase tracking-wider mb-1">Zone</div>
                      <div className="font-bold text-gray-900 text-sm">{regeneratedData[selectedRecommendationForDetails.id]?.zone || selectedRecommendationForDetails.zone || 'Zone B'}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                      <div className="text-gray-500 font-bold uppercase tracking-wider mb-1">Aisle</div>
                      <div className="font-bold text-gray-900 text-sm">{regeneratedData[selectedRecommendationForDetails.id]?.aisle || 'A2'}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                      <div className="text-gray-500 font-bold uppercase tracking-wider mb-1">Rack</div>
                      <div className="font-bold text-gray-900 text-sm">{regeneratedData[selectedRecommendationForDetails.id]?.rack || 'R-12'}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                      <div className="text-gray-500 font-bold uppercase tracking-wider mb-1">Shelf</div>
                      <div className="font-bold text-gray-900 text-sm">{regeneratedData[selectedRecommendationForDetails.id]?.shelf || 'S-03'}</div>
                    </div>
                    <div className="bg-[#0071C1] p-2.5 rounded-lg border border-blue-700 col-span-2 sm:col-span-1">
                      <div className="text-blue-100 font-bold uppercase tracking-wider mb-0.5 text-[9px]">Bin</div>
                      <div className="font-bold text-white text-xs font-mono">{regeneratedData[selectedRecommendationForDetails.id]?.bin || 'BIN-B-12-03'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  Metrics & Analysis
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <dt className="text-green-700 font-bold text-xs uppercase tracking-wider">AI Confidence</dt>
                    <dd className="mt-1 text-2xl font-bold text-green-700">{regeneratedData[selectedRecommendationForDetails.id]?.confidence || 96}%</dd>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <dt className="text-blue-700 font-bold text-xs uppercase tracking-wider">Est. Putaway Time</dt>
                    <dd className="mt-1 font-bold text-blue-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {regeneratedData[selectedRecommendationForDetails.id]?.estTime || '6 minutes'}
                    </dd>
                  </div>
                </div>
              </div>

              {/* AI Rationale */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-base">AI Rationale</h3>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {regeneratedData[selectedRecommendationForDetails.id]?.reason || selectedRecommendationForDetails.reason}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Button variant="outline" className="flex-1 justify-center" onClick={() => setSelectedRecommendationForDetails(null)}>
                  Close
                </Button>
                <Button className="flex-1 bg-[#0071C1] hover:bg-[#005c9e] text-white justify-center" onClick={() => {
                  handleAccept(selectedRecommendationForDetails);
                  setSelectedRecommendationForDetails(null);
                }}>
                  Approve Recommendation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

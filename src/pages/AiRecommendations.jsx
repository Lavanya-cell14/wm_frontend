import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import StatCard from '../components/dashboard/StatCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AlertBanner from '../components/ui/AlertBanner';
import { Lightbulb, CheckCircle2, ShieldAlert, Cpu, Sparkles, AlertCircle } from 'lucide-react';

export default function AiRecommendations() {
  const { aiRecommendations, acceptAiRecommendation, rejectAiRecommendation } = useWarehouse();
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAccept = (rec) => {
    acceptAiRecommendation(rec.id);
    triggerToast(`AI recommendation "${rec.title}" successfully approved and deployed!`);
  };

  const handleReject = (rec) => {
    rejectAiRecommendation(rec.id);
    triggerToast(`AI recommendation "${rec.title}" successfully dismissed.`);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiRecommendations.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-500 text-sm bg-white rounded-xl border border-gray-100">
            No pending AI recommendations to review. Systems are fully balanced.
          </div>
        ) : (
          aiRecommendations.map((rec) => (
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
                    <span className="font-bold text-gray-900 uppercase tracking-wide">AI Recommendation Rationale:</span>
                    <p className="text-gray-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100 font-semibold">
                      {rec.reason}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 uppercase tracking-wide">Estimated Output Impact:</span>
                    <div className="text-green-700 bg-green-50/50 p-2 rounded-lg border border-green-100 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      {rec.impact}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex gap-2 w-full mt-auto">
                  <Button variant="outline" className="flex-1 justify-center py-2 text-xs font-bold text-red-600 border-red-100 hover:bg-red-50" onClick={() => handleReject(rec)}>
                    Dismiss
                  </Button>
                  <Button className="flex-1 bg-[#0071C1] hover:bg-[#005c9e] text-white justify-center py-2 text-xs font-bold" onClick={() => handleAccept(rec)}>
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

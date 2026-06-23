import React from 'react';
import { Card, CardContent } from 'shared-ui';

export default function DigitalTwinLegend({ stats }) {
  const legendItems = [
    { label: 'Empty Bin', color: 'bg-slate-200 border-slate-350', description: 'Available for allocation' },
    { label: 'Occupied Bin', color: 'bg-[#0071C1] border-blue-700', description: 'Stored stock quantity > 0' },
    { label: 'Reserved Bin', color: 'bg-amber-500 border-amber-600', description: 'Committed for outbound orders' },
    { label: 'Assigned Bin', color: 'bg-indigo-500 border-indigo-600', description: 'Active putaway/retrieval task pending' },
    { label: 'AI Recommended / Target', color: 'bg-emerald-500 border-emerald-600 animate-pulse', description: 'Recommended slotting placement' },
  ];

  return (
    <Card className="border border-slate-100 bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-4 space-y-4">
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Digital Twin Legend</h4>
        <div className="space-y-2">
          {legendItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-650">
              <span className={`w-3.5 h-3.5 rounded-md border shrink-0 ${item.color}`} />
              <div className="flex flex-col">
                <span className="text-slate-800 font-bold leading-tight">{item.label}</span>
                <span className="text-[10px] text-gray-400 font-medium">{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {stats && (
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Utilization Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-slate-700 font-semibold text-[11px] leading-tight">
            <div className="bg-slate-50 border border-slate-100/50 p-2 rounded-xl text-center">
              <span className="text-[10px] text-gray-400 block font-bold mb-0.5">TOTAL BINS</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{stats.total}</span>
            </div>
            <div className="bg-slate-50 border border-slate-100/50 p-2 rounded-xl text-center">
              <span className="text-[10px] text-gray-400 block font-bold mb-0.5">OCCUPIED</span>
              <span className="text-sm font-bold text-[#0071C1] font-mono">{stats.occupied}</span>
            </div>
            <div className="bg-slate-50 border border-slate-100/50 p-2 rounded-xl text-center">
              <span className="text-[10px] text-gray-400 block font-bold mb-0.5">EMPTY BINS</span>
              <span className="text-sm font-bold text-emerald-600 font-mono">{stats.empty}</span>
            </div>
            <div className="bg-slate-50 border border-slate-100/50 p-2 rounded-xl text-center">
              <span className="text-[10px] text-gray-400 block font-bold mb-0.5">OCCUPANCY</span>
              <span className="text-sm font-bold text-indigo-600 font-mono">{stats.occupancyPercent}%</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

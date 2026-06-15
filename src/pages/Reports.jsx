import React from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { BarChart3, Download, FileSpreadsheet, FileText } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Reports() {
  const reports = [
    { title: 'Inbound Cargo Receipt Logs', type: 'PDF', size: '1.2 MB', date: '2026-06-14' },
    { title: 'AGV Path Efficiency Metrics', type: 'CSV', size: '4.8 MB', date: '2026-06-13' },
    { title: 'Weekly Product Stock Audits', type: 'XLSX', size: '3.1 MB', date: '2026-06-10' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-[#0071C1]" />
          Operations Reports Registry
        </h1>
        <p className="text-gray-500 text-sm mt-1">Download consolidated warehouse sheets, stock audits, and pathing telemetry metrics.</p>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-sm font-bold uppercase text-slate-500">Available Reports Registry</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {reports.map((rep, i) => (
              <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50/30 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    {rep.type === 'PDF' ? <FileText className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{rep.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{rep.date} • {rep.size}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 text-[11px]" onClick={() => alert('Report download pending backend API registry compilation.')}>
                  <Download className="w-3 h-3" /> Download {rep.type}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

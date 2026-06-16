import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Badge, 
  Button 
} from 'shared-ui';
import { 
  BarChart3, 
  Download, 
  Eye, 
  TrendingUp, 
  Activity, 
  FileText, 
  Clock, 
  AlertCircle,
  Building2,
  Box,
  Server
} from 'lucide-react';
import Modal from '../../components/ui/Modal';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);

  const reportsList = [
    {
      id: 'structure',
      title: 'Warehouse Structure Report',
      description: 'Audits registered zones, zone groups, aisles, racks, shelves, and bin capacities.',
      lastGenerated: 'Today, 08:30 AM',
      type: 'PDF',
      icon: Building2,
      stats: {
        'Total Warehouses': '1 Active',
        'Registered Zones': '4 Zones',
        'Configured Bins': '30 Bins',
        'Total Racks': '6 Racks'
      },
      chartData: [
        { label: 'Zones', value: 4 },
        { label: 'Aisles', value: 6 },
        { label: 'Racks', value: 6 },
        { label: 'Shelves', value: 12 },
        { label: 'Bins', value: 30 }
      ]
    },
    {
      id: 'user_activity',
      title: 'User Activity Report',
      description: 'Consolidates system mutation histories, sign-in frequencies, and credential provisioning logs.',
      lastGenerated: 'Today, 11:45 AM',
      type: 'PDF / XLSX',
      icon: Activity,
      stats: {
        'Active User Sessions': '4 Sessions',
        'Total Mutations Logs': '148 Events',
        'Failed Authentication Warnings': '0 Alerts',
        'System Operator SLA Rate': '99.8%'
      },
      chartData: [
        { label: '06-12', value: 120 },
        { label: '06-13', value: 85 },
        { label: '06-14', value: 160 },
        { label: '06-15', value: 110 },
        { label: '06-16', value: 148 }
      ]
    },
    {
      id: 'health',
      title: 'System Health Report',
      description: 'Reviews backend gateway response rate latencies, database connections pool status, and microservices SLA.',
      lastGenerated: 'Today, 10:15 AM',
      type: 'PDF',
      icon: Server,
      stats: {
        'Avg Gateway Latency': '12.4 ms',
        'Active Database Pool': '34 / 200 conns',
        'Microservice SLA Index': '99.98%',
        'Telemetry Disk Quota': '14.8 GB / 200 GB'
      },
      chartData: [
        { label: 'Backend', value: 12 },
        { label: 'Postgres', value: 2 },
        { label: 'MongoDB', value: 5 },
        { label: 'Qdrant', value: 8 },
        { label: 'OCR API', value: 240 }
      ]
    },
    {
      id: 'ocr',
      title: 'OCR Document Count Report',
      description: 'Audits processed supplier invoices, parsing confidence margins, and verification discrepancies flags.',
      lastGenerated: 'Yesterday, 10:15 PM',
      type: 'PDF / CSV',
      icon: FileText,
      stats: {
        'Total OCR Documents': '12 Files',
        'Average Parsing Confidence': '96.8%',
        'OCR Discrepancy Warnings': '2 Flags',
        'Manual Reviews Performed': '8 Items'
      },
      chartData: [
        { label: 'Mon', value: 94 },
        { label: 'Tue', value: 96 },
        { label: 'Wed', value: 98 },
        { label: 'Thu', value: 95 },
        { label: 'Fri', value: 97 }
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory Summary Report',
      description: 'Tracks overall stocking quantities, reorders due warnings, and quarantined damaged units.',
      lastGenerated: 'Today, 06:00 AM',
      type: 'CSV / XLSX',
      icon: Box,
      stats: {
        'Total Stock Quantity': '1,484 Units',
        'Low Stock Items Warning': '2 items',
        'Quarantined Damaged Records': '1 items',
        'Active Reserves Holds': '3 holds'
      },
      chartData: [
        { label: 'Week 1', value: 620 },
        { label: 'Week 2', value: 680 },
        { label: 'Week 3', value: 710 },
        { label: 'Week 4', value: 742 }
      ]
    }
  ];

  const handleDownload = (report) => {
    alert(`Initializing telemetry document generation for ${report.title}. The system will compile data and download the ${report.type} bundle.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-[#0071C1]" />
          Platform Reports Control Hub
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Compile historical warehouse structure configurations, user audit trails, system service latency, OCR document queues, and inventory summary metrics.
        </p>
      </div>

      {/* Reports Roster Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportsList.map((rep) => {
          const Icon = rep.icon;
          return (
            <Card key={rep.id} className="border border-gray-100 shadow-sm bg-white overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <CardHeader className="border-b border-slate-50 bg-slate-50/20 pb-4 flex flex-row items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-[#0071C1]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-800">{rep.title}</CardTitle>
                    <CardDescription className="text-xs text-gray-500 mt-1">{rep.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold tracking-wider">
                  {rep.type}
                </Badge>
              </CardHeader>

              <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                {/* SVG Mini Chart Indicator */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-2">Metrics Preview Trend</span>
                  <div className="h-24 flex items-end justify-between px-2 pt-2 gap-2">
                    {rep.chartData.map((d, index) => {
                      const maxVal = Math.max(...rep.chartData.map((cd) => cd.value));
                      const percentHeight = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center group/bar relative">
                          <div className="absolute -top-7 opacity-0 group-hover/bar:opacity-100 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded font-mono transition-opacity duration-200 pointer-events-none z-10 font-bold">
                            {d.value}
                          </div>
                          <div 
                            style={{ height: `${percentHeight}%` }} 
                            className="w-full bg-gradient-to-t from-[#1d5fa3] to-[#2672bb] rounded-t hover:from-blue-600 hover:to-blue-400 transition-all duration-300 min-h-[4px]"
                          />
                          <span className="text-[9px] text-gray-400 mt-1.5 font-mono truncate max-w-full">{d.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Info and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 gap-4 border-t border-slate-50">
                  <div className="text-[10px] text-gray-400 font-medium">
                    Last Compiled: <span className="text-gray-600 font-bold">{rep.lastGenerated}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      className="text-xs py-1.5 px-3 font-bold gap-1.5"
                      onClick={() => setSelectedReport(rep)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect Metrics
                    </Button>
                    <Button 
                      className="text-xs py-1.5 px-3 font-bold gap-1.5 bg-[#0071C1] text-white hover:bg-[#005c9e]"
                      onClick={() => handleDownload(rep)}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export {rep.type.split(' ')[0]}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Inspector Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Metrics Inspector: ${selectedReport.title}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-6 text-xs text-gray-700">
            <div>
              <p className="text-gray-500 leading-normal">
                {selectedReport.description}
              </p>
              <div className="text-[10px] text-gray-400 mt-1.5">
                Audit Trail Ref: <span className="font-mono font-semibold text-slate-500">REP-LOG-{selectedReport.id.toUpperCase()}</span>
              </div>
            </div>

            {/* Compiled Stats list */}
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(selectedReport.stats).map(([k, v]) => (
                <div key={k} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">{k}</span>
                  <span className="text-base font-extrabold text-slate-800 block mt-1">{v}</span>
                </div>
              ))}
            </div>

            {/* Detailed Chart Visualization */}
            <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800">
              <span className="text-[10px] uppercase tracking-widest text-[#0071C1] font-extrabold block mb-4">Historical Data Series</span>
              
              <div className="h-32 relative flex items-end justify-between px-4 gap-4">
                <div className="absolute inset-x-0 bottom-4 border-b border-white/5"></div>
                <div className="absolute inset-x-0 bottom-16 border-b border-white/5"></div>
                <div className="absolute inset-x-0 bottom-28 border-b border-white/5"></div>

                {selectedReport.chartData.map((d, index) => {
                  const maxVal = Math.max(...selectedReport.chartData.map((cd) => cd.value));
                  const percentHeight = maxVal > 0 ? (d.value / maxVal) * 80 : 0;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center relative z-10 group/item">
                      <div 
                        style={{ height: `${percentHeight}px` }}
                        className="w-8 bg-blue-500/80 rounded-t border border-blue-400 flex items-center justify-center font-mono text-[9px] font-bold text-white group-hover/item:bg-blue-400 transition-colors"
                      >
                        {d.value}
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400 mt-2 font-mono">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 justify-end pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                onClick={() => setSelectedReport(null)}
              >
                Close Inspector
              </Button>
              <Button 
                className="bg-[#0071C1] text-white hover:bg-[#005c9e] gap-1.5"
                onClick={() => {
                  handleDownload(selectedReport);
                  setSelectedReport(null);
                }}
              >
                <Download className="w-4 h-4" />
                Generate Full Export
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

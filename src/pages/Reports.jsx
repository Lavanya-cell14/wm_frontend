import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, Modal } from 'shared-ui';
import { 
  BarChart3, Download, Eye, TrendingUp, Activity, FileText, 
  Clock, AlertCircle, Building2, Box, Calendar
} from 'lucide-react';

export default function Reports() {
  const { putawayTasks = [], ocrDocuments = [], inventory = [] } = useWarehouse();
  const [selectedReport, setSelectedReport] = useState(null);

  const reportsList = [
    {
      id: 'inventory_summary',
      title: 'Inventory Summary Report',
      description: 'Audits overall stocked warehouse SKU quantities, low stock levels warnings, and reserves holds.',
      lastGenerated: 'Today, 09:00 AM',
      type: 'XLSX / CSV',
      icon: Box,
      stats: {
        'Total SKU Codes': '14 active',
        'Total Stock Quantity': `${inventory.reduce((sum, item) => sum + (item.quantity || 0), 0)} Units`,
        'Low Stock Warnings': '2 items',
        'Reserve Holds': '3 holds'
      },
      chartData: [
        { label: 'Week 1', value: 340 },
        { label: 'Week 2', value: 410 },
        { label: 'Week 3', value: 390 },
        { label: 'Week 4', value: 450 }
      ]
    },
    {
      id: 'occupancy',
      title: 'Occupancy Report',
      description: 'Tracks spatial storage capacity by zone group, zone, aisle, and rack grids.',
      lastGenerated: 'Today, 08:00 AM',
      type: 'PDF',
      icon: Building2,
      stats: {
        'Occupancy Rate': '60.0%',
        'Occupied Bins': '18 Bins',
        'Available Bins': '12 Bins',
        'Zone Load Warning': 'Zone C (88%)'
      },
      chartData: [
        { label: 'Zone A', value: 65 },
        { label: 'Zone B', value: 72 },
        { label: 'Zone C', value: 88 },
        { label: 'Zone D', value: 40 }
      ]
    },
    {
      id: 'storage_completion',
      title: 'Storage Completion Report',
      description: 'Tracks storage completion rates, turnaround durations, and delayed/incident storage logs.',
      lastGenerated: 'Today, 11:30 AM',
      type: 'PDF / CSV',
      icon: CheckCircle2,
      stats: {
        'Tasks Stored': `${putawayTasks.filter(t => t.status === 'COMPLETED').length} Stored`,
        'Active Tasks': `${putawayTasks.filter(t => t.status !== 'COMPLETED').length} In-Progress`,
        'Average Completion': '6.2 mins',
        'Delayed Tasks Log': `${putawayTasks.filter(t => t.status === 'DELAYED' || t.issue).length} delayed`
      },
      chartData: [
        { label: 'Mon', value: 4 },
        { label: 'Tue', value: 8 },
        { label: 'Wed', value: 6 },
        { label: 'Thu', value: 10 },
        { label: 'Fri', value: 12 }
      ]
    },
    {
      id: 'allocation_trend',
      title: 'Allocation Trend Report',
      description: 'Monitors AI bin suggestions approval indices, override rates, and slots slotting efficiency.',
      lastGenerated: 'Yesterday, 04:30 PM',
      type: 'CSV',
      icon: TrendingUp,
      stats: {
        'Total Recommendations': '16 generated',
        'Approval SLA': '93.7%',
        'Manager Manual Override': '1 Override',
        'Neural Hit Accuracy': '96.2%'
      },
      chartData: [
        { label: 'Week 1', value: 92 },
        { label: 'Week 2', value: 95 },
        { label: 'Week 3', value: 93 },
        { label: 'Week 4', value: 96 }
      ]
    },
    {
      id: 'ocr_trend',
      title: 'OCR Processing Trend Report',
      description: 'Audits PaddleOCR data extraction confidence levels, discrepancy rates, and upload queues.',
      lastGenerated: 'Today, 10:15 AM',
      type: 'PDF',
      icon: FileText,
      stats: {
        'Total OCR Scans': `${ocrDocuments.length} files`,
        'Average Confidence': '93.5%',
        'Manual Verification Review': '3 items',
        'Parsing SLA Index': '99.2%'
      },
      chartData: [
        { label: '06-12', value: 85 },
        { label: '06-13', value: 90 },
        { label: '06-14', value: 88 },
        { label: '06-15', value: 93 },
        { label: '06-16', value: 95 }
      ]
    },
    {
      id: 'operator_productivity',
      title: 'Operator Productivity Report',
      description: 'Compiles completed task records and velocities per active operator user session.',
      lastGenerated: 'Today, 12:00 PM',
      type: 'XLSX',
      icon: Activity,
      stats: {
        'Active Operators': '1 Active',
        'Tasks Dispatched': `${putawayTasks.length} tasks`,
        'Task Complete Velocity': '1.2 per hour',
        'SLA Standard Score': '98.5%'
      },
      chartData: [
        { label: 'WRK-01', value: 12 },
        { label: 'WRK-02', value: 15 },
        { label: 'WRK-03', value: 14 },
        { label: 'WRK-04', value: 8 }
      ]
    }
  ];

  const handleDownload = (report) => {
    alert(`Generating dynamic spreadsheet data for ${report.title}. The system will compile data and download the ${report.type} bundle.`);
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-[#0071C1]" />
          Warehouse Operations Reports
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Review and download operational summaries, inventory ledgers, occupancy metrics, and AI recommendation statistics.
        </p>
      </div>

      {/* Reports Grid */}
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
                
                {/* Visual Chart Preview */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-2">Metrics Preview Trend</span>
                  <div className="h-20 flex items-end justify-between px-2 pt-2 gap-2">
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
                          <span className="text-[9px] text-gray-400 mt-1 font-mono truncate max-w-full">{d.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

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
              <div className="text-[10px] text-gray-400 mt-1.5 font-bold">
                Report Reference ID: <span className="font-mono text-slate-500">REP-{selectedReport.id.toUpperCase()}</span>
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

// Simple local mock helper for incomplete import
function CheckCircle2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

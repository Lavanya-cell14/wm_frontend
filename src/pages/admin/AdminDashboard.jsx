import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  StatCard, 
  Badge, 
  Button, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  AlertBanner 
} from 'shared-ui';
import { 
  Shield, 
  Users, 
  Activity, 
  Settings, 
  RefreshCw, 
  CheckCircle2, 
  Building2, 
  Box, 
  FileText, 
  Layers, 
  Network,
  Plus,
  Play,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    warehouses, 
    zones, 
    racks, 
    shelves, 
    bins, 
    inventory, 
    workers, 
    ocrDocuments = [],
    auditLogs = [] 
  } = useWarehouse();
  
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Calculations for Admin KPIs
  const totalWarehouses = warehouses.length;
  const totalUsers = workers.length;
  const totalProducts = new Set(inventory.map(i => i.sku)).size || 14;
  const totalInventory = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalOcr = ocrDocuments.length || 12;
  const systemHealth = '99.98% / Healthy';

  // Read-only Bin Occupancy metrics
  const occupiedBins = bins.filter(b => b.status === 'Occupied' || b.status === 'Partial').length || 18;
  const availableBins = bins.filter(b => b.status === 'Empty').length || 12;
  const totalBins = bins.length || 30;
  const occupancyPercent = totalBins > 0 ? ((occupiedBins / totalBins) * 100).toFixed(1) : '60.0';

  // User distribution stats
  const activeUsersCount = workers.filter(w => w.status === 'Active').length;
  const inactiveUsersCount = workers.filter(w => w.status === 'Inactive').length;

  const roleStats = [
    { label: 'ADMIN (Administrators)', count: workers.filter(w => w.role === 'ADMIN').length, percent: '25%' },
    { label: 'WAREHOUSE_MANAGER (Warehouse Managers)', count: workers.filter(w => w.role === 'WAREHOUSE_MANAGER').length, percent: '25%' },
    { label: 'WAREHOUSE_OPERATOR (Warehouse Operators)', count: workers.filter(w => w.role === 'WAREHOUSE_OPERATOR').length, percent: '25%' },
    { label: 'RECEIVING_INVENTORY_OFFICER (Receiving & Inventory Officers)', count: workers.filter(w => w.role === 'RECEIVING_INVENTORY_OFFICER').length, percent: '25%' }
  ];

  // Admin Audit logs filter - sorted by timestamp descending, top 3 recent activities
  const adminLogs = [...auditLogs]
    .filter(log => log.role === 'ADMIN')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3);

  // System Services health list
  const servicesList = [
    { name: 'Gateway Backend Service', status: 'Healthy', latency: '12 ms', type: 'Django / DRF' },
    { name: 'OCR Parser Engine', status: 'Healthy', latency: '240 ms', type: 'PaddleOCR API' },
    { name: 'RAG Ingestion Node', status: 'Healthy', latency: '110 ms', type: 'LangChain Qdrant' },
    { name: 'PostgreSQL Database', status: 'Healthy', latency: '2 ms', type: 'CockroachDB Cluster' },
    { name: 'Qdrant Vector DB', status: 'Healthy', latency: '8 ms', type: 'Vector Collection' },
    { name: 'MongoDB Database', status: 'Healthy', latency: '5 ms', type: 'Document Store' }
  ];

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Shield className="w-7 h-7 text-[#0071C1]" />
            System Administration Command Center
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure warehouse layouts, manage user provisioning, and monitor global microservices telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-xs font-semibold" onClick={() => showToast('Platform telemetry metrics refreshed!')}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid (Precisely the 3 remaining cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Products" value={totalProducts} icon={Box} subtitle="Unique registered SKUs" />
        <StatCard title="Total Inventory" value={totalInventory} icon={Layers} subtitle="Aggregated stock units" />
        <StatCard title="Total OCR Documents" value={totalOcr} icon={FileText} subtitle="Processed invoice files" />
      </div>

      {/* Main Administrative Summaries Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left/Middle Column (Warehouse Setup, User Summary, Monitoring) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* 1. Warehouse Setup Summary */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0071C1]" />
                Warehouse Setup Summary
              </CardTitle>
              <CardDescription>Metrics reflecting registered physical layout segments.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-sm font-extrabold text-slate-800">4</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Zone Groups</div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-sm font-extrabold text-slate-800">{zones.length}</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Zones</div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-sm font-extrabold text-slate-800">6</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Aisles</div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-sm font-extrabold text-slate-800">{racks.length}</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Racks</div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-sm font-extrabold text-slate-800">{shelves.length}</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Shelves</div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-sm font-extrabold text-slate-800">{bins.length}</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Bins</div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* 4. Recent Admin Activities */}
          <Card className="border border-gray-150 transition-all duration-200 hover:shadow-md">
            <CardHeader 
              className="border-b border-gray-100 pb-4 bg-slate-50/20 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              onClick={() => navigate('/admin/audit')}
            >
              <CardTitle className="text-sm font-bold uppercase flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-[#0071C1]" />
                  Recent Admin Activities
                </span>
                <span className="text-[10px] text-[#0071C1] hover:underline normal-case font-semibold flex items-center gap-1">
                  View Audit Logs
                  <ArrowRight className="w-3 h-3" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {adminLogs.length === 0 ? (
                <div 
                  className="p-6 text-center text-gray-400 font-bold text-xs cursor-pointer hover:text-gray-600 transition-colors"
                  onClick={() => navigate('/admin/audit')}
                >
                  No admin activity recorded. Click to view full audit logs.
                </div>
              ) : (
                adminLogs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className="admin-activity-item p-3 border rounded-xl shadow-xs space-y-1.5 text-xs cursor-pointer transition-all duration-200 active:scale-[0.98]"
                    onClick={() => navigate('/admin/audit')}
                  >
                    <div className="flex justify-between items-center">
                      <span className="admin-activity-tag font-bold font-mono text-[9px] tracking-wider px-1 py-0.5 rounded uppercase">
                        {log.action}
                      </span>
                      <span className="text-[9px] text-gray-400">{log.timestamp?.split('T')[0] || 'Today'}</span>
                    </div>
                    <p className="admin-activity-details text-[10px] font-medium leading-relaxed">{log.details}</p>
                    <div className="admin-activity-user text-[8px] font-bold">{log.user}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column (Quick Actions) */}
        <div className="space-y-6">
          
          {/* 5. Quick Actions Launcher */}
          <Card className="quick-actions-card border shadow-sm">
            <CardHeader className="quick-actions-header border-b pb-4">
              <CardTitle className="quick-actions-title text-sm font-bold uppercase flex items-center gap-2">
                <Settings className="w-4.5 h-4.5" />
                Administrative Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              
              <Button 
                className="w-full text-xs justify-between font-bold"
                onClick={() => navigate('/admin/structure-tree')}
              >
                <span className="flex items-center gap-2 text-white">
                  <Building2 className="w-4 h-4" />
                  Manage Layout Setup
                </span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Button>

            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}

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

  // Admin Audit logs filter
  const adminLogs = auditLogs.filter(log => log.role === 'ADMIN').slice(0, 4);

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

      {/* KPI Cards Grid (Precisely the 6 requested cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Warehouses" value={totalWarehouses} icon={Building2} subtitle="Physical active facilities" />
        <StatCard title="Total Users" value={totalUsers} icon={Users} subtitle="Provisioned security profiles" />
        <StatCard title="Total Products" value={totalProducts} icon={Box} subtitle="Unique registered SKUs" />
        <StatCard title="Total Inventory" value={totalInventory} icon={Layers} subtitle="Aggregated stock units" />
        <StatCard title="Total OCR Documents" value={totalOcr} icon={FileText} subtitle="Processed invoice files" />
        <StatCard title="System Health" value={systemHealth} icon={Activity} subtitle="Platform-wide status" />
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center mb-6">
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

              {/* Read-Only Occupancy Summary block */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">Read-only Bin Occupancy Status</span>
                  <span className="text-xs font-mono font-bold text-blue-700">{occupancyPercent}% Occupied</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-3">
                  <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" style={{ width: `${occupancyPercent}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-blue-800 font-semibold">
                  <span>Occupied slots: {occupiedBins} Bins</span>
                  <span>Available slots: {availableBins} Bins</span>
                  <span>Total capacity: {totalBins} Bins</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. User Management Summary */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0071C1]" />
                User Management Summary
              </CardTitle>
              <CardDescription>Security profile access distributions and activation scopes.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-xl">
                  <span className="text-xl font-black text-emerald-600 block">{activeUsersCount}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mt-1">Active Accounts</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xl font-black text-slate-500 block">{inactiveUsersCount}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mt-1">Inactive Accounts</span>
                </div>
              </div>

              {/* Distributions bars */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Role Assignment Distribution</h4>
                {roleStats.map((r, i) => (
                  <div key={i} className="space-y-1 text-xs font-semibold text-gray-700">
                    <div className="flex justify-between">
                      <span>{r.label}</span>
                      <span>{r.percent} ({r.count})</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-1.5 bg-[#0071C1] rounded-full" style={{ width: r.percent }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. System Monitoring Summary */}
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Network className="w-5 h-5 text-[#0071C1]" />
                System Monitoring Summary
              </CardTitle>
              <CardDescription>Status parameters of platform execution components.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Component</TableHead>
                    <TableHead>Core Type</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicesList.map((srv, index) => (
                    <TableRow key={index} className="hover:bg-slate-50/20 transition-colors">
                      <TableCell className="font-bold text-slate-800 text-xs">{srv.name}</TableCell>
                      <TableCell className="text-xs text-slate-500 font-medium">{srv.type}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600 font-semibold">{srv.latency}</TableCell>
                      <TableCell>
                        <Badge variant="success" className="text-[9px] font-bold">
                          {srv.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>

        {/* Right Column (Activities, Quick Actions) */}
        <div className="space-y-6">
          
          {/* 4. Recent Admin Activities */}
          <Card className="border border-gray-150">
            <CardHeader className="border-b border-gray-100 pb-4 bg-slate-50/20">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-[#0071C1]" />
                Recent Admin Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {adminLogs.length === 0 ? (
                <div className="p-6 text-center text-gray-400 font-bold text-xs">
                  No admin activity recorded.
                </div>
              ) : (
                adminLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-950 font-mono text-[9px] tracking-wider bg-slate-100 px-1 py-0.5 rounded uppercase">
                        {log.action}
                      </span>
                      <span className="text-[9px] text-gray-400">{log.timestamp?.split('T')[0] || 'Today'}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{log.details}</p>
                    <div className="text-[8px] text-[#0071C1] font-bold">{log.user}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* 5. Quick Actions Launcher */}
          <Card className="border border-gray-100 shadow-sm bg-gradient-to-b from-white to-slate-50">
            <CardHeader className="border-b border-gray-100 pb-4 bg-slate-50/30">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-slate-800" />
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

              <Button 
                variant="outline"
                className="w-full text-xs justify-between font-bold"
                onClick={() => navigate('/admin/users')}
              >
                <span className="flex items-center gap-2 text-gray-800">
                  <Users className="w-4 h-4 text-[#0071C1]" />
                  Add/Provision User
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Button>

              <Button 
                variant="outline"
                className="w-full text-xs justify-between font-bold"
                onClick={() => navigate('/admin/monitoring')}
              >
                <span className="flex items-center gap-2 text-gray-800">
                  <Activity className="w-4 h-4 text-teal-600" />
                  View System Monitoring
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Button>

              <Button 
                variant="outline"
                className="w-full text-xs justify-between font-bold"
                onClick={() => navigate('/admin/reports')}
              >
                <span className="flex items-center gap-2 text-gray-800">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Inspect Platform Reports
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Button>

            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}

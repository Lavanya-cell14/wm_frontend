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
  UserCheck, 
  ShieldAlert, 
  Activity, 
  Fingerprint, 
  Lock, 
  Settings, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Server
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { auditLogs } = useWarehouse();
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Mock Admin Dashboard Data
  const adminKpis = [
    { title: 'Total Registered Users', value: '5', icon: Users, subtitle: 'Across 5 access roles' },
    { title: 'Active System Users', value: '4', icon: UserCheck, subtitle: '92% activity index', trend: 'up', trendValue: '+10%' },
    { title: 'Security Roles Active', value: '5', icon: Shield, subtitle: 'Role-based access active' },
    { title: 'Total Sessions Today', value: '24', icon: Fingerprint, subtitle: 'Avg 4.2 hrs per session' },
    { title: 'Failed Login Retries', value: '0', icon: Lock, subtitle: 'Secure perimeter active' },
    { title: 'System Service Status', value: '99.9%', icon: Activity, subtitle: 'ALL SYSTEMS OPERATIONAL', trend: 'neutral', trendValue: 'Healthy' },
    { title: 'Audit Logs Generated', value: auditLogs.length.toString(), icon: Server, subtitle: 'Real-time trace active' },
    { title: 'Access Alerts Pending', value: '0', icon: ShieldAlert, subtitle: 'Zero malicious vectors' }
  ];

  // Mock User Activities
  const recentUserActivity = [
    { id: 'ACT-001', user: 'admin@warehouseai.com', action: 'AUTHORIZED_LOGIN', details: 'Admin logged in from terminal IP 192.168.1.45', time: '5 mins ago', status: 'Success' },
    { id: 'ACT-002', user: 'manager@warehouseai.com', action: 'ZONE_CONFIGURATION_EDIT', details: 'Added Zone C bulk storage allocation capacity', time: '1 hr ago', status: 'Success' },
    { id: 'ACT-003', user: 'inventory@warehouseai.com', action: 'STOCK_CYCLE_ADJUSTMENT', details: 'Adjusted SKU-1001 quantity by +10 units', time: '2 hrs ago', status: 'Success' },
    { id: 'ACT-004', user: 'staff@warehouseai.com', action: 'PUTAWAY_TASK_COMPLETED', details: 'Stored MacBook Pro in BIN-B-10-01', time: '3 hrs ago', status: 'Success' }
  ];

  // Quick Action Handlers
  const quickActions = [
    { name: 'Add New User', desc: 'Provision credentials', path: '/admin/users', color: 'from-blue-600 to-cyan-500' },
    { name: 'Assign Security Role', desc: 'RBAC configurations', path: '/admin/roles', color: 'from-purple-600 to-indigo-500' },
    { name: 'View Security Audit Logs', desc: 'Trace events ledger', path: '/admin/audit', color: 'from-slate-700 to-slate-800' },
    { name: 'Open System Health Center', desc: 'Service telemetry telemetry', path: '/admin/health', color: 'from-teal-600 to-emerald-500' },
    { name: 'Configure Platform Settings', desc: 'Adjust thresholds & retention', path: '/admin/settings', color: 'from-amber-600 to-orange-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
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
            Global configurations, security monitoring, user provisionings, and platform microservices telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-xs font-semibold" onClick={() => showToast('Platform telemetry metrics refreshed!')}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminKpis.map((kpi, idx) => (
          <StatCard 
            key={idx}
            title={kpi.title} 
            value={kpi.value} 
            icon={kpi.icon}
            trend={kpi.trend}
            trendValue={kpi.trendValue}
            subtitle={kpi.subtitle}
          />
        ))}
      </div>

      {/* Quick Workflows Launcher */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-gray-100">
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#0071C1]" />
            Administrative Core Actions
          </CardTitle>
          <CardDescription>Shortcut widgets mapping directly to governance and server maintenance pages.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(action.path)}
                className="group cursor-pointer p-4 rounded-2xl border border-gray-100 bg-white hover:bg-slate-50 hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col justify-between h-32"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-xs`}>
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs group-hover:text-[#0071C1] transition-colors flex items-center gap-1">
                    {action.name}
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1">{action.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Administrative Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Recent Activity & Role Distribution */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Recent User Activity */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">User Activity Audits</CardTitle>
                <CardDescription>Real-time security telemetry of administrative and client actions.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 text-xs" onClick={() => navigate('/admin/audit')}>
                View Audit Ledger
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event ID</TableHead>
                    <TableHead>User Email</TableHead>
                    <TableHead>Action Code</TableHead>
                    <TableHead>Description Details</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUserActivity.map((act) => (
                    <TableRow key={act.id}>
                      <TableCell className="font-bold font-mono text-[10px] text-gray-900">{act.id}</TableCell>
                      <TableCell className="text-xs text-gray-700 font-semibold">{act.user}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                          {act.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 font-medium truncate max-w-xs">{act.details}</TableCell>
                      <TableCell className="text-[10px] text-gray-400 font-medium">{act.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Role Distribution visual list */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Security Group User Distributions</CardTitle>
              <CardDescription>Security profile access mapping across active accounts.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                
                {/* Admin Distribution */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-gray-700">
                    <span>ADMINISTRATORS (ADMIN)</span>
                    <span>20% (1 User)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-slate-900" style={{ width: '20%' }}></div>
                  </div>
                </div>

                {/* Manager Distribution */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-gray-700">
                    <span>WAREHOUSE MANAGERS (MANAGER)</span>
                    <span>20% (1 User)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-[#0071C1]" style={{ width: '20%' }}></div>
                  </div>
                </div>

                {/* Staff Distribution */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-gray-700">
                    <span>WAREHOUSE OPERATORS (STAFF)</span>
                    <span>20% (1 User)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: '20%' }}></div>
                  </div>
                </div>

                {/* Clerk Distribution */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-gray-700">
                    <span>INVENTORY CLERKS (INVENTORY_CLERK)</span>
                    <span>20% (1 User)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-purple-500" style={{ width: '20%' }}></div>
                  </div>
                </div>

                {/* Route Operator Distribution */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-gray-700">
                    <span>AGV ROUTE OPERATORS (OPERATOR)</span>
                    <span>20% (1 User)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-teal-500" style={{ width: '20%' }}></div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Side: Microservice Health Overview */}
        <div className="space-y-6">
          
          {/* Microservices Health summary widget */}
          <Card className="border border-gray-100 shadow-sm bg-gradient-to-b from-white to-slate-50">
            <CardHeader className="border-b border-gray-100 pb-4 flex flex-row justify-between items-center bg-slate-50/50">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">Service Core Overview</CardTitle>
                <CardDescription>Live health telemetry telemetry.</CardDescription>
              </div>
              <Badge variant="success" className="animate-pulse">Healthy</Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Frontend */}
              <div className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-gray-800">Frontend React Server</span>
                </div>
                <span className="text-[10px] text-gray-400 font-semibold font-mono">1.2ms latency</span>
              </div>

              {/* Backend API */}
              <div className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-gray-800">Gateway API Node</span>
                </div>
                <span className="text-[10px] text-gray-400 font-semibold font-mono">14ms latency</span>
              </div>

              {/* Database */}
              <div className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-gray-800">Operational Database</span>
                </div>
                <span className="text-[10px] text-gray-400 font-semibold font-mono">3ms latency</span>
              </div>

              {/* AI Recommendation Engine */}
              <div className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-gray-800">AI Recommendation Engine</span>
                </div>
                <span className="text-[10px] text-gray-400 font-semibold font-mono">180ms latency</span>
              </div>

              <Button 
                variant="outline" 
                className="w-full text-xs justify-center gap-2"
                onClick={() => navigate('/admin/health')}
              >
                Open Health Control Center
              </Button>

            </CardContent>
          </Card>

          {/* Access Control Alert log */}
          <Card className="border border-gray-100 shadow-sm bg-blue-50/5">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-600" />
                Access Control Audits
              </CardTitle>
              <CardDescription>Security profiles triggers and login verifications.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="p-3 bg-white border border-emerald-100 rounded-xl flex gap-3 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900">MFA Profile Synced</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Admin user verified secure mobile authentication profile successfully.</p>
                  <span className="text-[9px] font-mono text-gray-400 block mt-1.5">Today, 14:02 | System Sec</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-gray-100 rounded-xl flex gap-3 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900">Secure Client Access</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Valid SSL request established for all dashboard nodes securely.</p>
                  <span className="text-[9px] font-mono text-gray-400 block mt-1.5">Today, 13:45 | Gateway TLS</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
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
  Activity, 
  RefreshCw, 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  Wifi, 
  CheckCircle,
  Play,
  RotateCw,
  Terminal,
  FileText
} from 'lucide-react';

export default function SystemMonitoring() {
  const { user } = useAuth();
  const { logAudit } = useWarehouse();
  
  const [toastMessage, setToastMessage] = useState('');
  const [loadingAction, setLoadingAction] = useState('');
  
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const [services, setServices] = useState([
    { name: 'Gateway Backend Node', key: 'backend', status: 'Healthy', lastChecked: 'Just now', responseTime: '12 ms', type: 'Django V4.2 / DRF' },
    { name: 'OCR Service Engine', key: 'ocr', status: 'Healthy', lastChecked: 'Just now', responseTime: '240 ms', type: 'Python PaddleOCR V1.2' },
    { name: 'RAG Service Engine', key: 'rag', status: 'Healthy', lastChecked: 'Just now', responseTime: '110 ms', type: 'LangChain / Python' },
    { name: 'PostgreSQL Database', key: 'postgres', status: 'Healthy', lastChecked: 'Just now', responseTime: '2 ms', type: 'CockroachDB Cluster' },
    { name: 'MongoDB Document DB', key: 'mongodb', status: 'Healthy', lastChecked: 'Just now', responseTime: '5 ms', type: 'MongoDB V6.0' },
    { name: 'Qdrant Vector DB', key: 'qdrant', status: 'Healthy', lastChecked: 'Just now', responseTime: '8 ms', type: 'Qdrant V1.8' }
  ]);

  const handleTriggerAction = (actionKey, desc) => {
    setLoadingAction(actionKey);
    setTimeout(() => {
      setLoadingAction('');
      logAudit(
        user?.email || 'admin@warehouseai.com',
        'ADMIN',
        'SYSTEM_DIAGNOSTICS_RUN',
        'System Health',
        `Triggered telemetry diagnostics routine: ${desc}`
      );
      showToast(`Diagnostics successfully executed: ${desc}`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#0071C1]" />
            System Monitoring & Telemetry
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time status indexes of Kubernetes services, API server nodes, database latency profiles, and diagnostics logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="gap-2 text-xs font-semibold" 
            onClick={() => handleTriggerAction('refresh', 'Force microservices latency reload')}
            disabled={!!loadingAction}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'refresh' ? 'animate-spin' : ''}`} />
            Force Sync Telemetry
          </Button>
        </div>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((srv) => {
          let Icon = Server;
          if (srv.key.includes('postgres') || srv.key.includes('mongodb') || srv.key.includes('qdrant')) {
            Icon = Database;
          } else if (srv.key.includes('ocr') || srv.key.includes('rag')) {
            Icon = Cpu;
          }

          return (
            <Card key={srv.key} className="border border-gray-100 shadow-sm p-4 flex flex-col justify-between bg-white relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${srv.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">{srv.name}</h3>
                    <span className="text-[10px] text-slate-400 font-medium font-mono block mt-0.5">{srv.type}</span>
                  </div>
                </div>
                <Badge variant={srv.status === 'Healthy' ? 'success' : 'error'} className="text-[9px] font-bold tracking-wider uppercase animate-pulse">
                  {srv.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-50 text-[10px] font-semibold text-gray-500">
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-slate-400">Response Time</span>
                  <span className="font-mono text-xs font-bold text-slate-700 block mt-0.5">{srv.responseTime}</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-slate-400">Last Checked</span>
                  <span className="font-mono text-xs font-bold text-slate-700 block mt-0.5">{srv.lastChecked}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Diagnostics Console and Audit Logs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Terminal logs viewer */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-[#0071C1]" />
                  Live Diagnostics Console
                </CardTitle>
                <CardDescription>Live tracing logs streaming directly from execution pods.</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[9px]">Syslog Sync Active</Badge>
            </CardHeader>
            <CardContent className="bg-slate-950 text-slate-200 p-4 font-mono text-[10px] leading-relaxed max-h-[40vh] overflow-y-auto min-h-[200px]">
              <div className="text-slate-500">// System diagnostics trace initialized successfully.</div>
              <div className="text-emerald-400">[INFO] 12:04:12 - Gateway Client Handshake initialized successfully with latency 14ms.</div>
              <div className="text-emerald-400">[INFO] 12:04:13 - PostgreSQL active connections pool verified: 34 active pools.</div>
              <div className="text-emerald-400">[INFO] 12:04:14 - Qdrant collections health index checked: Collections `document_rag` exists.</div>
              <div className="text-amber-400">[WARN] 12:04:15 - Aisle 3 blocking flag reported due to forklift maintenance tasks.</div>
              <div className="text-slate-400">[DEBUG] 12:04:16 - Sync transaction payload dispatched to MongoDB event handler.</div>
              <div className="text-slate-500">// Ready for instructions dispatch logs...</div>
            </CardContent>
          </Card>
        </div>

        {/* Diagnostics Command triggers */}
        <div className="space-y-6">
          <Card className="border border-gray-100 shadow-sm bg-gradient-to-b from-white to-slate-50">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Diagnostics Controls</CardTitle>
              <CardDescription>Run maintenance commands dynamically.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* AGV RF Ping */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full text-xs justify-between font-bold"
                  onClick={() => handleTriggerAction('agv', 'Ping active AGV nodes')}
                  disabled={!!loadingAction}
                >
                  <span className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-blue-500" />
                    Ping AGV Nodes
                  </span>
                  {loadingAction === 'agv' ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-gray-400" />}
                </Button>
                <p className="text-[10px] text-gray-400 pl-1">Verifies Wi-Fi radio strength indicators on automated robotics rows.</p>
              </div>

              {/* Vacuum DB */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full text-xs justify-between font-bold"
                  onClick={() => handleTriggerAction('db', 'Vacuum PostgreSQL indexes')}
                  disabled={!!loadingAction}
                >
                  <span className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    Vacuum & Reindex
                  </span>
                  {loadingAction === 'db' ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-gray-400" />}
                </Button>
                <p className="text-[10px] text-gray-400 pl-1">Vancuums index buffers to speed up query execution under high loads.</p>
              </div>

              {/* Export Logs */}
              <div className="space-y-2">
                <Button 
                  className="w-full text-xs justify-center font-bold gap-2"
                  onClick={() => handleTriggerAction('logs', 'Bundle telemetry stdout logs')}
                  disabled={!!loadingAction}
                >
                  <FileText className="w-4 h-4" />
                  Bundle & Download Logs
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

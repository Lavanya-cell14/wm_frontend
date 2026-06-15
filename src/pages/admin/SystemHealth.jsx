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
  Download, 
  Settings, 
  Wifi, 
  CheckCircle,
  Play,
  RotateCw
} from 'lucide-react';

export default function SystemHealth() {
  const { user } = useAuth();
  const { logAudit } = useWarehouse();
  
  const [toastMessage, setToastMessage] = useState('');
  const [loadingAction, setLoadingAction] = useState('');
  
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const [services, setServices] = useState([
    { name: 'Gateway API Server', type: 'NodeJS V18', latency: '14ms', status: 'Healthy', version: 'v2.4.1', memory: '184 MB' },
    { name: 'Operational Postgres DB', type: 'CockroachDB Cluster', latency: '3ms', status: 'Healthy', version: 'v23.2.0', memory: '1.2 GB' },
    { name: 'OCR Document Parser Service', type: 'Python PaddleOCR', latency: '240ms', status: 'Healthy', version: 'v1.2.0', memory: '850 MB' },
    { name: 'AI Recommendation Inference', type: 'FastAPI / ONNX Runtime', latency: '182ms', status: 'Healthy', version: 'v1.8.9', memory: '4.8 GB' },
    { name: 'Frontend React Client', type: 'React 18 / Vite Build', latency: '1.2ms', status: 'Healthy', version: 'v5.4.2 (Production)', memory: '45 MB' },
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
            Platform & Service Telemetry
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
            Force Sync telemetry
          </Button>
        </div>
      </div>

      {/* System Telemetry KPI Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Core Latency */}
        <Card className="border border-gray-100 shadow-sm p-4 flex items-center gap-4 bg-white">
          <div className="p-3 rounded-xl bg-blue-50 text-[#0071C1]">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Average Gateway Latency</span>
            <span className="text-xl font-bold text-gray-900 mt-0.5">14.2 ms</span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">99.98% Service SLA</span>
          </div>
        </Card>

        {/* Database Transactions */}
        <Card className="border border-gray-100 shadow-sm p-4 flex items-center gap-4 bg-white">
          <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Active DB Conn Pool</span>
            <span className="text-xl font-bold text-gray-900 mt-0.5">34 / 200</span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">0 deadlocks logged</span>
          </div>
        </Card>

        {/* CPU Load */}
        <Card className="border border-gray-100 shadow-sm p-4 flex items-center gap-4 bg-white">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Admin Node CPU Load</span>
            <span className="text-xl font-bold text-gray-900 mt-0.5">8.4%</span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">4 cores active</span>
          </div>
        </Card>

        {/* Storage Volume */}
        <Card className="border border-gray-100 shadow-sm p-4 flex items-center gap-4 bg-white">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Telemetry Disk Space</span>
            <span className="text-xl font-bold text-gray-900 mt-0.5">14.8 GB</span>
            <span className="text-[10px] text-gray-500 font-medium block mt-0.5">Out of 200 GB quota</span>
          </div>
        </Card>

      </div>

      {/* Services Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Services status roster */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Kubernetes Pod Services Status</CardTitle>
              <CardDescription>Live health indicators and telemetry stats generated by service sidecar containers.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service / Pod</TableHead>
                    <TableHead>Execution Core</TableHead>
                    <TableHead>Response Rate</TableHead>
                    <TableHead>Memory Allocated</TableHead>
                    <TableHead>Service Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((srv, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/10 transition-colors">
                      <TableCell className="font-bold text-gray-900 text-xs">
                        {srv.name}
                        <span className="block font-mono text-[9px] text-[#0071C1] mt-0.5">{srv.version}</span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 font-medium">{srv.type}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-600 font-semibold">{srv.latency}</TableCell>
                      <TableCell className="text-xs text-gray-500 font-medium">{srv.memory}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          {srv.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Diagnostics & Operations Action Commands */}
        <div className="space-y-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#0071C1]" />
                Command Diagnostics Center
              </CardTitle>
              <CardDescription>Trigger automated health tasks on global clusters.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              
              {/* Trigger AGV Ping */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full text-xs justify-between font-semibold"
                  onClick={() => handleTriggerAction('agvPing', 'Fleet AGV RF Transceivers handshake checks')}
                  disabled={!!loadingAction}
                >
                  <span className="flex items-center gap-2 text-gray-800">
                    <Wifi className="w-4 h-4 text-[#0071C1]" />
                    Run Fleet AGV RF Pings
                  </span>
                  {loadingAction === 'agvPing' ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin text-[#0071C1]" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </Button>
                <p className="text-[10px] text-gray-400 pl-1 leading-normal">
                  Pings all active AGVs on path nodes to verify RSSI radio strength signals.
                </p>
              </div>

              <div className="h-px bg-gray-100 my-2"></div>

              {/* Database Reindex */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full text-xs justify-between font-semibold"
                  onClick={() => handleTriggerAction('dbIndex', 'PostgreSQL database index vacuum')}
                  disabled={!!loadingAction}
                >
                  <span className="flex items-center gap-2 text-gray-800">
                    <Database className="w-4 h-4 text-teal-600" />
                    Vacuum & Reindex Database
                  </span>
                  {loadingAction === 'dbIndex' ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </Button>
                <p className="text-[10px] text-gray-400 pl-1 leading-normal">
                  Rebuilds query indexes across SKU tables to optimize search speed under heavy loads.
                </p>
              </div>

              <div className="h-px bg-gray-100 my-2"></div>

              {/* Core Telemetry logs download */}
              <div className="space-y-2">
                <Button 
                  className="w-full text-xs justify-center font-bold gap-2"
                  onClick={() => handleTriggerAction('downloadLogs', 'Export core telemetry debug logs')}
                  disabled={!!loadingAction}
                >
                  {loadingAction === 'downloadLogs' ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Export System Debug Logs
                </Button>
                <p className="text-[10px] text-gray-400 pl-1 leading-normal text-center">
                  Bundles recent system stdout errors and audit trails in gzip format.
                </p>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

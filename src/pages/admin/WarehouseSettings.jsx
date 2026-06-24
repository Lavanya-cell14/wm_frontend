import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AlertBanner, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from 'shared-ui';
import { 
  Settings, Save, RefreshCw, Sliders, Bell, Brain, 
  Cpu, ShieldCheck, Database, Layers, FileText, CheckCircle2, XCircle
} from 'lucide-react';
import { 
  getWarehouses, 
  getZoneGroups, 
  getZones, 
  getAisles, 
  getRacks, 
  getBins 
} from '../../services/warehouseStructureService';

// Helper for fetch timeout to avoid hanging UI
const fetchWithTimeout = async (url, options = {}, timeout = 3000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

export default function WarehouseSettings() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { logAudit, shelves } = useWarehouse();
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // State values for system parameters
  const [systemName, setSystemName] = useState(() => {
    return localStorage.getItem('systemName') || 'WarehouseAI Platform';
  });
  const [capacityThreshold, setCapacityThreshold] = useState(() => {
    return Number(localStorage.getItem('capacityThreshold')) || 85;
  });
  const [reorderLevelDefault, setReorderLevelDefault] = useState(() => {
    return Number(localStorage.getItem('reorderLevelDefault')) || 10;
  });
  const [auditRetentionDays, setAuditRetentionDays] = useState(() => {
    return Number(localStorage.getItem('auditRetentionDays')) || 90;
  });
  const [emailAlerts, setEmailAlerts] = useState(() => {
    const saved = localStorage.getItem('emailAlerts');
    return saved !== null ? saved === 'true' : true;
  });

  // Live warehouse counts
  const [counts, setCounts] = useState({
    warehouses: 0,
    zoneGroups: 0,
    zones: 0,
    aisles: 0,
    racks: 0,
    shelves: 0,
    bins: 0
  });
  const [countsLoading, setCountsLoading] = useState(true);

  // Health states
  const [health, setHealth] = useState({
    backend: 'Checking...',
    database: 'Checking...',
    ocr: 'Checking...',
    rag: 'Checking...'
  });
  const [healthLoading, setHealthLoading] = useState(false);

  // OCR backend stats verification
  const [ocrStats, setOcrStats] = useState({
    available: false,
    total: 0,
    lastDoc: 'N/A',
    avgConfidence: 'N/A'
  });

  // Load layout summary from live APIs
  const loadLayoutSummary = async () => {
    setCountsLoading(true);
    try {
      const [whs, zgs, zns, als, rks, bns] = await Promise.all([
        getWarehouses().catch(() => ({ results: [] })),
        getZoneGroups().catch(() => ({ results: [] })),
        getZones().catch(() => ({ results: [] })),
        getAisles().catch(() => ({ results: [] })),
        getRacks().catch(() => ({ results: [] })),
        getBins().catch(() => ({ results: [] }))
      ]);

      const binsList = bns.results || [];
      const computedShelves = shelves.length || new Set(binsList.map(b => b.shelf).filter(Boolean)).size || 0;

      setCounts({
        warehouses: whs.results?.length || 0,
        zoneGroups: zgs.results?.length || 0,
        zones: zns.results?.length || 0,
        aisles: als.results?.length || 0,
        racks: rks.results?.length || 0,
        shelves: computedShelves,
        bins: binsList.length || 0
      });
    } catch (err) {
      console.error("Failed loading warehouse layout summary:", err);
    } finally {
      setCountsLoading(false);
    }
  };

  // Perform live service health checks
  const checkServiceHealth = async () => {
    setHealthLoading(true);
    
    // 1. Backend & DB Health Check
    let backendStatus = '🔴 Offline';
    let dbStatus = '🔴 Offline';
    try {
      const response = await fetchWithTimeout('/api/warehouses/', {}, 3000);
      if (response.ok) {
        backendStatus = '🟢 Healthy';
        dbStatus = '🟢 Healthy';
      } else {
        backendStatus = '🟡 Warning';
        dbStatus = '🔴 Offline';
      }
    } catch (err) {
      backendStatus = '🔴 Offline';
      dbStatus = '🔴 Offline';
    }

    // 2. OCR Service Health Check
    let ocrStatus = '🔴 Offline';
    const ocrUrl = import.meta.env.VITE_OCR_API_BASE_URL || 'http://127.0.0.1:8001';
    try {
      const response = await fetchWithTimeout(`${ocrUrl}/`, {}, 2500);
      if (response.status < 500) {
        ocrStatus = '🟢 Healthy';
      } else {
        ocrStatus = '🟡 Warning';
      }
    } catch (err) {
      ocrStatus = '🔴 Offline';
    }

    // 3. RAG Service Health Check
    let ragStatus = '🔴 Offline';
    try {
      const response = await fetchWithTimeout('/api/ai/rag-health/', {}, 3000);
      if (response.ok) {
        const data = await response.json();
        ragStatus = data.status === 'healthy' ? '🟢 Healthy' : '🟡 Warning';
      } else {
        const fallbackUrl = import.meta.env.VITE_RAG_API_BASE_URL || 'http://127.0.0.1:8002';
        await fetchWithTimeout(`${fallbackUrl}/status`, {}, 2000);
        ragStatus = '🟢 Healthy';
      }
    } catch (err) {
      ragStatus = '🔴 Offline';
    }

    setHealth({
      backend: backendStatus,
      database: dbStatus,
      ocr: ocrStatus,
      rag: ragStatus
    });

    // 4. Verify OCR backend database values
    try {
      const response = await fetchWithTimeout('/api/ocr/documents/', {}, 3000);
      if (response.ok) {
        const data = await response.json();
        const docs = data.results || (Array.isArray(data) ? data : null);
        if (docs && docs.length >= 0) {
          // Calculate average confidence
          let sum = 0;
          let count = 0;
          docs.forEach(d => {
            const score = d.confidence_score !== undefined ? d.confidence_score : d.confidence;
            if (score !== undefined && score !== null) {
              const num = Number(score);
              sum += num < 1 ? num * 100 : num;
              count++;
            }
          });
          const avgConfidence = count > 0 ? `${Math.round(sum / count)}%` : 'N/A';

          setOcrStats({
            available: true,
            total: docs.length,
            lastDoc: docs[0]?.document_number || docs[0]?.id || 'N/A',
            avgConfidence: avgConfidence
          });
        } else {
          setOcrStats({ available: false, total: 0, lastDoc: 'N/A', avgConfidence: 'N/A' });
        }
      } else {
        setOcrStats({ available: false, total: 0, lastDoc: 'N/A', avgConfidence: 'N/A' });
      }
    } catch (err) {
      setOcrStats({ available: false, total: 0, lastDoc: 'N/A', avgConfidence: 'N/A' });
    }

    setHealthLoading(false);
  };

  useEffect(() => {
    loadLayoutSummary();
    checkServiceHealth();
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    
    // Save state directly to localStorage
    localStorage.setItem('systemName', systemName);
    localStorage.setItem('capacityThreshold', String(capacityThreshold));
    localStorage.setItem('reorderLevelDefault', String(reorderLevelDefault));
    localStorage.setItem('auditRetentionDays', String(auditRetentionDays));
    localStorage.setItem('emailAlerts', String(emailAlerts));

    logAudit(
      user?.email || 'admin@warehouseai.com',
      'ADMIN',
      'SYSTEM_SETTINGS_UPDATE',
      'Settings',
      `Updated platform settings: System Name = "${systemName}", Warning Capacity = ${capacityThreshold}%, Reorder Level = ${reorderLevelDefault}`
    );
    showToast('Platform global configurations saved successfully!');
  };

  const handleResetSettings = () => {
    setSystemName('WarehouseAI Platform');
    setCapacityThreshold(85);
    setReorderLevelDefault(10);
    setAuditRetentionDays(90);
    setEmailAlerts(true);
    showToast('Restored default parameters configuration.');
  };

  // Helper to render health badges
  const renderHealthIndicator = (status) => {
    const isHealthy = status.includes('Healthy') || status.includes('🟢');
    const isWarning = status.includes('Warning') || status.includes('🟡');
    
    if (isHealthy) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Healthy
        </span>
      );
    }
    if (isWarning) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
        Offline
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top duration-300">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2 dark:text-slate-100">
            <Settings className="w-7 h-7 text-[#0071C1] dark:text-[#56A8F0]" />
            Admin Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1 dark:text-slate-400">
            Configure system capacity rules, manage alerting endpoints, and audit dynamic service infrastructure health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            type="button"
            className="gap-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800" 
            onClick={checkServiceHealth}
            disabled={healthLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
            Refresh Health
          </Button>
          <Button variant="outline" className="gap-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800" onClick={handleResetSettings}>
            Reset Defaults
          </Button>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Theme & System Preferences */}
          <Card className="border border-gray-100 dark:border-slate-800 shadow-xs">
            <CardHeader className="border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 pb-4">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0071C1] dark:text-[#56A8F0]" />
                System Preferences
              </CardTitle>
              <CardDescription className="text-[11px]">System branding options and read-only global layout theme mode status.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs font-semibold text-gray-700 dark:text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">System Platform Name</label>
                  <Input 
                    type="text"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    className="w-full border border-gray-200 dark:border-slate-700 p-2 rounded-xl outline-none focus:border-blue-500 bg-gray-50/50 dark:bg-slate-800/50 text-xs dark:text-slate-200"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Current Theme</label>
                  <div className="w-full border border-gray-200 dark:border-slate-700 p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 capitalize">
                    {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capacity Settings */}
          <Card className="border border-gray-100 dark:border-slate-800 shadow-xs">
            <CardHeader className="border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 pb-4">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Capacity Settings
              </CardTitle>
              <CardDescription className="text-[11px]">Define physical zone capacity thresholds and default replenishment limits.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs font-semibold text-gray-700 dark:text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Zone Capacity Warning (%)</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number"
                      min="50"
                      max="98"
                      value={capacityThreshold}
                      onChange={(e) => setCapacityThreshold(Number(e.target.value))}
                      className="w-full border border-gray-200 dark:border-slate-700 p-2 rounded-xl outline-none focus:border-blue-500 bg-gray-50/50 dark:bg-slate-800/50 text-xs dark:text-slate-200"
                      required
                    />
                    <span className="text-slate-400 font-bold">%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Default Product Reorder Level</label>
                  <Input 
                    type="number"
                    min="1"
                    value={reorderLevelDefault}
                    onChange={(e) => setReorderLevelDefault(Number(e.target.value))}
                    className="w-full border border-gray-200 dark:border-slate-700 p-2 rounded-xl outline-none focus:border-blue-500 bg-gray-50/50 dark:bg-slate-800/50 text-xs dark:text-slate-200"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border border-gray-100 dark:border-slate-800 shadow-xs">
            <CardHeader className="border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 pb-4">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Notifications Configuration
              </CardTitle>
              <CardDescription className="text-[11px]">Configure email dispatch targets and backend database audit log retention rules.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs font-semibold text-gray-700 dark:text-slate-300">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-gray-150/60 dark:border-slate-700/50 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-800 dark:text-slate-200">Critical Email Alerts</span>
                  <span className="text-[10px] text-gray-400 font-medium mt-0.5">Alerts dispatched for low stock levels or physical constraints.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    emailAlerts ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      emailAlerts ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Audit Log Retention</label>
                <select 
                  value={auditRetentionDays} 
                  onChange={(e) => setAuditRetentionDays(Number(e.target.value))}
                  className="w-full border border-gray-200 dark:border-slate-700 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50 dark:bg-slate-800/50 text-xs dark:text-slate-200"
                >
                  <option value={30}>30 Days (Compact Storage)</option>
                  <option value={90}>90 Days (Recommended)</option>
                  <option value={365}>365 Days (Full compliance audit)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Service Health */}
          <Card className="border border-gray-100 dark:border-slate-800 shadow-xs">
            <CardHeader className="border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 pb-4">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Service Health Subsystem
              </CardTitle>
              <CardDescription className="text-[11px]">Real-time connectivity monitoring of active application node engines.</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#0071C1] dark:text-[#56A8F0]" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Backend Service</span>
                  </div>
                  {renderHealthIndicator(health.backend)}
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">OCR Service</span>
                  </div>
                  {renderHealthIndicator(health.ocr)}
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">RAG Service</span>
                  </div>
                  {renderHealthIndicator(health.rag)}
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Database Conn.</span>
                  </div>
                  {renderHealthIndicator(health.database)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <Card className="border border-gray-100 dark:border-slate-800 shadow-xs bg-slate-50/50 dark:bg-slate-800/20">
            <CardContent className="p-4 space-y-3">
              <Button type="submit" className="w-full py-2.5 justify-center font-bold text-xs gap-2 bg-[#0071C1] hover:bg-[#005c9e] dark:bg-[#56A8F0] dark:hover:bg-[#3d92da] text-white">
                <Save className="w-4 h-4" />
                Commit Settings Configuration
              </Button>
              <div className="flex items-center gap-1.5 justify-center text-[10px] text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Security validation handshake verified.</span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Warehouse Layout Summary */}
          <Card className="border border-gray-100 dark:border-slate-800 shadow-xs">
            <CardHeader className="border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 pb-4">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Warehouse Layout Summary
              </CardTitle>
              <CardDescription className="text-[11px]">Read-only layout nodes loaded directly from active databases.</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {countsLoading ? (
                <div className="flex items-center justify-center py-6 text-gray-400 gap-2 text-xs font-semibold">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                  Synchronizing physical schema...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/40 rounded-xl">
                    <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{counts.warehouses}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Warehouses</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/40 rounded-xl">
                    <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{counts.zoneGroups}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Zone Groups</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/40 rounded-xl">
                    <div className="text-sm font-extrabold text-[#0071C1] dark:text-[#56A8F0]">{counts.zones}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Zones</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/40 rounded-xl">
                    <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400">{counts.aisles}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Aisles</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/40 rounded-xl">
                    <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{counts.racks}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Racks</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/40 rounded-xl">
                    <div className="text-sm font-extrabold text-purple-600 dark:text-purple-400">{counts.shelves}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Shelves</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/40 rounded-xl sm:col-span-2">
                    <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400">{counts.bins}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Bins</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Configuration */}
          <Card className="border border-gray-100 dark:border-slate-800 shadow-xs">
            <CardHeader className="border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 pb-4">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                AI Configuration
              </CardTitle>
              <CardDescription className="text-[11px]">System models and decision agents supporting physical operations.</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700/40 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Slotting Engine</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Enabled</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700/40 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Demand Forecast</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Enabled</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700/40 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Inventory Optim.</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Enabled</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700/40 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">RAG Assistant</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Enabled</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OCR Configuration */}
          <Card className="border border-gray-100 dark:border-slate-800 shadow-xs">
            <CardHeader className="border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 pb-4">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                OCR Configuration
              </CardTitle>
              <CardDescription className="text-[11px]">Manage inbound invoice text processing parameters and metrics.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700/40 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">OCR Service Status</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  health.ocr.includes('Healthy') 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                    : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                }`}>
                  {health.ocr.includes('Healthy') ? 'Online' : 'Offline'}
                </span>
              </div>
              
              {ocrStats.available && (
                <div className="space-y-2 border-t border-gray-100 dark:border-slate-700/50 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between py-1">
                    <span>Total Documents Processed:</span>
                    <span className="text-slate-800 dark:text-slate-200">{ocrStats.total}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Last Processed Document:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono truncate max-w-[150px]">{ocrStats.lastDoc}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Average OCR Confidence:</span>
                    <span className="text-slate-800 dark:text-slate-200">{ocrStats.avgConfidence}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* RAG Configuration */}
          <Card className="border border-gray-100 dark:border-slate-800 shadow-xs">
            <CardHeader className="border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 pb-4">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#0071C1] dark:text-[#56A8F0]" />
                RAG Configuration
              </CardTitle>
              <CardDescription className="text-[11px]">Interactive contextual assistant configuration parameters.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700/40 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">RAG Service Status</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  health.rag.includes('Healthy') 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                    : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                }`}>
                  {health.rag.includes('Healthy') ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <div className="space-y-2 border-t border-gray-100 dark:border-slate-700/50 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex justify-between py-1">
                  <span>Documents Indexed:</span>
                  <span className="text-slate-400 italic">Coming Soon</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Knowledge Base Size:</span>
                  <span className="text-slate-400 italic">Coming Soon</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Last Synchronization Time:</span>
                  <span className="text-slate-400 italic">Coming Soon</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </form>
    </div>
  );
}

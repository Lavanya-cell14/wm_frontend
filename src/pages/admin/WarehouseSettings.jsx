import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import { AlertBanner, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from 'shared-ui';
import { Settings, Save, RefreshCw, Sliders, Bell, Cpu, ShieldCheck } from 'lucide-react';

export default function WarehouseSettings() {
  const { user } = useAuth();
  const { logAudit, warehouses, zones, racks, shelves, bins } = useWarehouse();
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // State values for system parameters
  const [systemName, setSystemName] = useState('WarehouseAI Platform');
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [themeMode, setThemeMode] = useState('System Default');
  const [capacityThreshold, setCapacityThreshold] = useState(85);
  const [reorderLevelDefault, setReorderLevelDefault] = useState(10);
  const [agvSpeedLimit, setAgvSpeedLimit] = useState(1.8);
  const [agvCollisionBuffer, setAgvCollisionBuffer] = useState(0.5);
  const [auditRetentionDays, setAuditRetentionDays] = useState(90);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [roboticAlgorithm, setRoboticAlgorithm] = useState('Dynamic-AStar');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    logAudit(
      user?.email || 'admin@warehouseai.com',
      'ADMIN',
      'SYSTEM_SETTINGS_UPDATE',
      'Settings',
      `Updated platform global settings parameters (System: ${systemName}, Threshold: ${capacityThreshold}%, AGV Speed: ${agvSpeedLimit} m/s, Theme: ${themeMode})`
    );
    showToast('Platform global configurations saved successfully!');
  };

  const handleResetSettings = () => {
    setSystemName('WarehouseAI Platform');
    setSessionTimeout(30);
    setThemeMode('System Default');
    setCapacityThreshold(85);
    setReorderLevelDefault(10);
    setAgvSpeedLimit(1.8);
    setAgvCollisionBuffer(0.5);
    setAuditRetentionDays(90);
    setEmailAlerts(true);
    setSmsAlerts(false);
    setRoboticAlgorithm('Dynamic-AStar');
    showToast('Restored default parameters configuration.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Settings className="w-7 h-7 text-[#0071C1]" />
            Warehouse & Platform Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Governs physical storage capacities, robotic automation fleets, telemetry alert limits, and retention schedules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-xs font-semibold" onClick={handleResetSettings}>
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </Button>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Inputs Fields */}
        <div className="lg:col-span-2 space-y-6 text-xs font-semibold text-gray-700">
          
          {/* Platform branding, session & theme */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#0071C1]" />
                Platform Configurations
              </CardTitle>
              <CardDescription>Adjust system branding, authentication session variables, and theme mode.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* System Name */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wide block text-[10px]">System Platform Name</label>
                  <Input 
                    type="text"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50 text-xs"
                    required
                  />
                </div>
                {/* Session Timeout */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wide block text-[10px]">Session Timeout</label>
                  <select 
                    value={sessionTimeout} 
                    onChange={(e) => setSessionTimeout(Number(e.target.value))}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50 text-xs"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={120}>120 Minutes</option>
                  </select>
                </div>
                {/* Theme Mode */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wide block text-[10px]">Theme Mode</label>
                  <select 
                    value={themeMode} 
                    onChange={(e) => setThemeMode(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50 text-xs animate-none"
                  >
                    <option value="Light Mode">Light Mode</option>
                    <option value="Dark Mode">Dark Mode (Premium)</option>
                    <option value="System Default">System Default</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warehouse Configuration Overview */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                Warehouse Layout Configuration Overview
              </CardTitle>
              <CardDescription>Read-only summary of the current active physical facilities layout configuration.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                  <div className="text-lg font-extrabold text-slate-800">{warehouses.length}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Warehouses</div>
                </div>
                <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                  <div className="text-lg font-extrabold text-[#0071C1]">{zones.length}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Zones</div>
                </div>
                <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                  <div className="text-lg font-extrabold text-teal-600">{racks.length}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Racks</div>
                </div>
                <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                  <div className="text-lg font-extrabold text-purple-600">{shelves.length}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Shelves</div>
                </div>
                <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                  <div className="text-lg font-extrabold text-amber-600">{bins.length}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Bins</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage capacity parameters */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#0071C1]" />
                Capacity & Inventory Control
              </CardTitle>
              <CardDescription>Configure physical storage triggers and auto-replenishment values.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Capacity warning percent */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wide block text-[10px]">Zone Capacity Warning Trigger (%)</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number"
                      min="50"
                      max="98"
                      value={capacityThreshold}
                      onChange={(e) => setCapacityThreshold(e.target.value)}
                      className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50 text-xs"
                      required
                    />
                    <span className="text-slate-400">%</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Triggers warning flags when any zone capacity exceeds this limit.</span>
                </div>

                {/* Reorder default quantity */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wide block text-[10px]">Default Product Reorder Level (Units)</label>
                  <Input 
                    type="number"
                    min="1"
                    value={reorderLevelDefault}
                    onChange={(e) => setReorderLevelDefault(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50 text-xs"
                    required
                  />
                  <span className="text-[10px] text-gray-400 block mt-0.5">Fallback inventory limit that triggers restocking procurement flows.</span>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* AGV Fleet options */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-teal-600" />
                AGV Fleet & Robotics Parameters
              </CardTitle>
              <CardDescription>Tweak automated robotic vehicles thresholds and pathing configurations.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Max speed */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wide block text-[10px]">Max AGV Cruising Speed (m/s)</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="3.0"
                      value={agvSpeedLimit}
                      onChange={(e) => setAgvSpeedLimit(e.target.value)}
                      className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50 text-xs"
                      required
                    />
                    <span className="text-slate-400">m/s</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Safety speed restriction across standard navigation paths.</span>
                </div>

                {/* Collision Buffer */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wide block text-[10px]">AGV Proximity Safety Buffer (m)</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number"
                      step="0.1"
                      min="0.2"
                      max="1.5"
                      value={agvCollisionBuffer}
                      onChange={(e) => setAgvCollisionBuffer(e.target.value)}
                      className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50 text-xs"
                      required
                    />
                    <span className="text-slate-400">m</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Physical exclusion perimeter required before automatic breaks.</span>
                </div>

                {/* Pathing algorithm */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-gray-500 uppercase tracking-wide block text-[10px]">Robotics Routing Pathfinding Algorithm</label>
                  <select 
                    value={roboticAlgorithm} 
                    onChange={(e) => setRoboticAlgorithm(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50 text-xs"
                  >
                    <option value="Dynamic-AStar">Dynamic A* (Optimal Shortest Path + Recalculate)</option>
                    <option value="Static-Dijkstra">Static Dijkstra (Consistent Paths, Static Obstacles)</option>
                    <option value="Predictive-QLearning">Predictive Q-Learning AI (Adaptive Congestion Bypass)</option>
                  </select>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Determines dynamic pathing solutions when fleet dispatches routes.</span>
                </div>

              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Side Toggles & Submissions */}
        <div className="space-y-6">
          
          {/* Notifications config */}
          <Card className="border border-gray-150 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Alerts & Subsystems Notifications
              </CardTitle>
              <CardDescription>Control alerting channels for platform events.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Email Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-800">Critical Email Dispatch</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Dispatches emails for low stock & safety stops.</span>
                </div>
                <Button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    emailAlerts ? 'bg-blue-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      emailAlerts ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </Button>
              </div>

              {/* SMS Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-800">Emergency SMS Alerts</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Direct SMS dispatches for emergency AGV collision stops.</span>
                </div>
                <Button
                  type="button"
                  onClick={() => setSmsAlerts(!smsAlerts)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    smsAlerts ? 'bg-blue-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      smsAlerts ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </Button>
              </div>

              {/* Audit logs retention */}
              <div className="space-y-1 font-semibold text-gray-700 text-xs mt-2">
                <label className="text-gray-500 uppercase tracking-wide block text-[10px]">Audit Logs Retention (Days)</label>
                <select 
                  value={auditRetentionDays} 
                  onChange={(e) => setAuditRetentionDays(Number(e.target.value))}
                  className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50 text-xs"
                >
                  <option value={30}>30 Days (Compact Storage)</option>
                  <option value={90}>90 Days (Recommended)</option>
                  <option value={365}>365 Days (Full compliance audit)</option>
                </select>
              </div>

            </CardContent>
          </Card>

          {/* Submit Actions */}
          <Card className="border border-gray-100 shadow-sm bg-gradient-to-b from-white to-slate-50">
            <CardContent className="p-4 space-y-3">
              <Button type="submit" className="w-full py-3 justify-center font-bold text-xs gap-2 bg-[#0071C1] hover:bg-[#005c9e] text-white">
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

      </form>
    </div>
  );
}

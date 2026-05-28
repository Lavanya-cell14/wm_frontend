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
  AlertBanner 
} from 'shared-ui';
import { Navigation, Wifi, RefreshCw, Cpu, Battery, Gauge, Compass, Thermometer } from 'lucide-react';

export default function AgvTracking() {
  const { user } = useAuth();
  const { logAudit } = useWarehouse();
  
  const [toastMessage, setToastMessage] = useState('');
  const [loadingDiagnostic, setLoadingDiagnostic] = useState(false);
  const [selectedAgvId, setSelectedAgvId] = useState('AGV-101');
  const [speedOverride, setSpeedOverride] = useState(1.4);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const agvDatabase = {
    'AGV-101': { id: 'AGV-101', status: 'Transit', battery: 94, load: 'MacBook Pro (15 units)', x: 32, y: 5, z: 1, temp: 24, signal: 'Strong (RSSI -42dBm)', firmware: 'v1.4.2' },
    'AGV-102': { id: 'AGV-102', status: 'Charging', battery: 18, load: 'None (Stationary)', x: 10, y: 12, z: 0, temp: 32, signal: 'Excellent (RSSI -35dBm)', firmware: 'v1.4.2' },
    'AGV-103': { id: 'AGV-103', status: 'Transit', battery: 82, load: 'Industrial Drills Pro (25 units)', x: 58, y: 6, z: 2, temp: 26, signal: 'Good (RSSI -58dBm)', firmware: 'v1.4.0' },
    'AGV-104': { id: 'AGV-104', status: 'Idle', battery: 76, load: 'None (Holding)', x: 5, y: 2, z: 0, temp: 21, signal: 'Weak (RSSI -74dBm)', firmware: 'v1.3.8' }
  };

  const currentAgv = agvDatabase[selectedAgvId];

  const handleTriggerDiagnostics = () => {
    setLoadingDiagnostic(true);
    setTimeout(() => {
      setLoadingDiagnostic(false);
      logAudit(
        user?.email || 'operator@warehouseai.com',
        'OPERATOR',
        'AGV_DIAGNOSTICS_SUCCESS',
        'AGV Controller',
        `Executed complete hardware diagnostics review for unit ${selectedAgvId}. All motors and LIDAR systems functional.`
      );
      showToast(`Diagnostics review successful for ${selectedAgvId}! All systems nominal.`);
    }, 1500);
  };

  const handleSpeedOverride = (e) => {
    const val = Number(e.target.value);
    setSpeedOverride(val);
  };

  const handleCommitSpeedOverride = () => {
    logAudit(
      user?.email || 'operator@warehouseai.com',
      'OPERATOR',
      'AGV_SPEED_OVERRIDE_COMMIT',
      'AGV Controller',
      `Manual speed regulator override committed for unit ${selectedAgvId} at ${speedOverride} m/s`
    );
    showToast(`Cruising speed restricted to ${speedOverride} m/s for ${selectedAgvId}.`);
  };

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
            <Wifi className="w-7 h-7 text-[#0071C1]" />
            AGV Real-time Telemetry & Tracking
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Examine high-fidelity telemetry feeds, dynamic navigation vectors, battery health metrics, and LIDAR clearance indexes for specific robotic nodes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-xs font-semibold" onClick={() => showToast('Radio handshake codes dispatched!')}>
            <RefreshCw className="w-3.5 h-3.5" />
            Dispatch radio ping
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - AGV details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            
            {/* Header select */}
            <CardHeader className="border-b border-gray-100 bg-slate-50/50 pb-4 flex flex-row flex-wrap justify-between items-center gap-4">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">Robotic Node Selector</CardTitle>
                <CardDescription>Select an active node to review hardware parameters.</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Node:</span>
                <select 
                  value={selectedAgvId}
                  onChange={(e) => setSelectedAgvId(e.target.value)}
                  className="border border-gray-200 p-2 text-xs font-bold rounded-xl outline-none focus:border-blue-500 bg-white"
                >
                  <option value="AGV-101">AGV-101 (Dell / MacBook Transit)</option>
                  <option value="AGV-102">AGV-102 (Dock charging pool)</option>
                  <option value="AGV-103">AGV-103 (Heavy Industrial cargo)</option>
                  <option value="AGV-104">AGV-104 (Idle West perimeter)</option>
                </select>
              </div>
            </CardHeader>

            {/* Telemetry metrics details */}
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-gray-600">
              
              {/* Coordinates Grid mapping */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100/50 space-y-3">
                <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5 border-b border-gray-200 pb-2">
                  <Compass className="w-4 h-4 text-[#0071C1]" />
                  Position Coordinates
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2 bg-white rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">X Vector</span>
                    <span className="font-mono font-bold text-gray-900 text-sm">{currentAgv.x}m</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Y Vector</span>
                    <span className="font-mono font-bold text-gray-900 text-sm">{currentAgv.y}m</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Z Vector</span>
                    <span className="font-mono font-bold text-gray-900 text-sm">Level {currentAgv.z}</span>
                  </div>
                </div>
              </div>

              {/* Status details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100/50 space-y-3">
                <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5 border-b border-gray-200 pb-2">
                  <Cpu className="w-4 h-4 text-purple-600" />
                  Hardware Metadata
                </h4>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span>RF Radio Connectivity:</span>
                    <span className="text-gray-900 font-bold">{currentAgv.signal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Microcode Firmware:</span>
                    <span className="text-gray-900 font-bold font-mono">{currentAgv.firmware}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Cargo Load:</span>
                    <span className="text-[#0071C1] font-bold">{currentAgv.load}</span>
                  </div>
                </div>
              </div>

              {/* Battery gauge */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100/50 space-y-3">
                <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5 border-b border-gray-200 pb-2">
                  <Battery className="w-4 h-4 text-emerald-600" />
                  Battery Telemetry
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span>Charge Remaining:</span>
                    <span className="text-gray-900 font-bold">{currentAgv.battery}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${currentAgv.battery <= 20 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${currentAgv.battery}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Motor Temperature */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100/50 space-y-3">
                <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5 border-b border-gray-200 pb-2">
                  <Thermometer className="w-4 h-4 text-amber-600" />
                  Core Temperature
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span>Internal Heat Index:</span>
                    <span className="text-gray-900 font-bold">{currentAgv.temp}°C</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${currentAgv.temp >= 30 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                      style={{ width: `${currentAgv.temp * 2.5}%` }}
                    ></div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column - Manual override controls */}
        <div className="space-y-6">
          <Card className="border border-gray-100 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-[#0071C1]" />
                Manual SpeedOverride
              </CardTitle>
              <CardDescription>Manually override vehicle cruising boundaries.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Slider override */}
              <div className="space-y-2 text-xs font-semibold text-gray-700">
                <div className="flex justify-between items-center">
                  <label className="text-gray-500 uppercase block text-[10px]">Speed Limit (m/s)</label>
                  <span className="font-mono text-gray-900 font-bold">{speedOverride} m/s</span>
                </div>
                <input 
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={speedOverride}
                  onChange={handleSpeedOverride}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0071C1]"
                />
                <Button 
                  className="w-full text-xs justify-center font-bold h-9 mt-2"
                  onClick={handleCommitSpeedOverride}
                >
                  Commit Speed Override
                </Button>
              </div>

              <div className="h-px bg-gray-100 my-2"></div>

              {/* Ping diagnostic button */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full text-xs justify-center font-bold gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                  onClick={handleTriggerDiagnostics}
                  disabled={loadingDiagnostic}
                >
                  {loadingDiagnostic ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />
                  ) : (
                    <Wifi className="w-4 h-4" />
                  )}
                  Diagnostics Handshake Test
                </Button>
                <p className="text-[10px] text-gray-400 pl-1 text-center leading-normal">
                  Dispatches emergency hardware polling signals to audit internal motor controllers.
                </p>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

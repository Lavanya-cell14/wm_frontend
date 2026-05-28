import React, { useState } from 'react';
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
  AlertBanner 
} from 'shared-ui';
import { 
  Navigation, 
  Battery, 
  RotateCcw, 
  AlertOctagon, 
  Activity, 
  Cpu, 
  TrendingUp,
  RefreshCw,
  Zap,
  Play
} from 'lucide-react';

export default function RouteDashboard() {
  const { user } = useAuth();
  const { logAudit } = useWarehouse();
  const [toastMessage, setToastMessage] = useState('');
  
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const [fleetStats, setFleetStats] = useState({
    activeRobots: 4,
    avgBattery: 84,
    activeRoutesCount: 3,
    eStops: 0
  });

  const [agvs, setAgvs] = useState([
    { id: 'AGV-101', status: 'Transit', battery: 94, load: 'MacBook Pro (15 units)', route: 'Dock A → Zone B', speed: '1.4 m/s', temp: '24°C' },
    { id: 'AGV-102', status: 'Charging', battery: 18, load: 'None (Stationary)', route: 'Charge Station #1', speed: '0.0 m/s', temp: '32°C' },
    { id: 'AGV-103', status: 'Transit', battery: 82, load: 'Industrial Drills (25 units)', route: 'Dock B → Zone C', speed: '1.6 m/s', temp: '26°C' },
    { id: 'AGV-104', status: 'Idle', battery: 76, load: 'None', route: 'Holding Area West', speed: '0.0 m/s', temp: '21°C' },
  ]);

  const handleFleetAction = (actionKey, desc) => {
    logAudit(
      user?.email || 'operator@warehouseai.com',
      'OPERATOR',
      'AGV_FLEET_COMMAND',
      'AGV Controller',
      `Sent fleet command: ${desc}`
    );
    showToast(`Fleet directive dispatched: ${desc}`);
  };

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
            <Navigation className="w-7 h-7 text-[#0071C1]" />
            AGV Robotics Roster & Navigation Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time coordinates monitoring, battery indices tracking, load capacities, and active dispatch control of the robotic automated guided vehicle fleet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-xs font-semibold" onClick={() => showToast('Fleet telemetry and batteries status refreshed!')}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Fleet State
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Robot Nodes" 
          value={fleetStats.activeRobots.toString()} 
          icon={Cpu} 
          subtitle="4 Online / 0 Faulted"
        />
        <StatCard 
          title="Fleet Avg Battery" 
          value={`${fleetStats.avgBattery}%`} 
          icon={Battery} 
          trend="up"
          trendValue="Dynamic Grid Enabled"
        />
        <StatCard 
          title="Active Transit Paths" 
          value={fleetStats.activeRoutesCount.toString()} 
          icon={Activity} 
          trend="neutral"
          trendValue="Safe perimeter active"
        />
        <StatCard 
          title="Emergency Stop Signals" 
          value={fleetStats.eStops.toString()} 
          icon={AlertOctagon} 
          trend="neutral"
          trendValue="0 security overrides"
        />
      </div>

      {/* Fleet Controls & Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Fleet AGVs Status Roster */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Robotic Fleet Fleet Status</CardTitle>
              <CardDescription>Live coordinates and health diagnostics broadcasted from active transponders.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {agvs.map((agv) => {
                let statusColor = 'border-slate-100 bg-white';
                let badgeVariant = 'default';
                
                if (agv.status === 'Transit') {
                  statusColor = 'border-blue-100 bg-blue-50/5';
                  badgeVariant = 'primary';
                } else if (agv.status === 'Charging') {
                  statusColor = 'border-amber-100 bg-amber-50/5';
                  badgeVariant = 'warning';
                } else if (agv.status === 'Idle') {
                  statusColor = 'border-emerald-100 bg-emerald-50/5';
                  badgeVariant = 'success';
                }

                return (
                  <div key={agv.id} className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-44 ${statusColor} hover:shadow-md`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm font-mono flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-slate-500" />
                          {agv.id}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium block mt-0.5">{agv.route}</span>
                      </div>
                      <Badge variant={badgeVariant} className="text-[9px] uppercase tracking-wider font-bold">
                        {agv.status}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 my-3">
                      <div className="flex justify-between text-[11px] font-semibold text-gray-600">
                        <span className="flex items-center gap-1">
                          <Battery className="w-3.5 h-3.5 text-emerald-500" />
                          Battery Power
                        </span>
                        <span className={agv.battery <= 20 ? 'text-red-500 font-bold' : 'text-gray-900'}>{agv.battery}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${agv.battery <= 20 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${agv.battery}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1 border-t border-gray-100/50">
                      <span>Speed: <span className="font-mono text-gray-700 font-semibold">{agv.speed}</span></span>
                      <span>Temp: <span className="font-mono text-gray-700 font-semibold">{agv.temp}</span></span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Global AGV Commands */}
        <div className="space-y-6">
          
          {/* Dispatch console card */}
          <Card className="border border-gray-100 shadow-sm bg-gradient-to-b from-white to-slate-50">
            <CardHeader className="border-b border-gray-100 pb-4 flex flex-row justify-between items-center bg-slate-50/50">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">Control Override Console</CardTitle>
                <CardDescription>Global fleet command dispatches override.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              
              {/* Force return to home */}
              <Button 
                variant="outline" 
                className="w-full text-xs justify-start gap-3 font-semibold hover:border-blue-200"
                onClick={() => handleFleetAction('dockAll', 'Recall all active robotic fleet vehicles to home docks')}
              >
                <RotateCcw className="w-4 h-4 text-[#0071C1]" />
                Recall Roster to Dock Bases
              </Button>

              {/* Force charge */}
              <Button 
                variant="outline" 
                className="w-full text-xs justify-start gap-3 font-semibold hover:border-amber-200"
                onClick={() => handleFleetAction('chargeLow', 'Dispatch low battery units to dynamic charging grids')}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                Dispatch Low Nodes to Charger
              </Button>

              {/* Ping diagnostic fleet check */}
              <Button 
                variant="outline" 
                className="w-full text-xs justify-start gap-3 font-semibold hover:border-teal-200"
                onClick={() => handleFleetAction('calibrateSensor', 'Fleet automated proximity sensors calibration')}
              >
                <Cpu className="w-4 h-4 text-teal-600" />
                Trigger Sensor Recalibration
              </Button>

              <div className="h-px bg-gray-100 my-2"></div>

              {/* EMERGENCY STOP PANIC OVERRIDE */}
              <Button 
                className="w-full py-3 text-xs justify-center font-bold gap-2 bg-red-600 hover:bg-red-700 hover:shadow-lg border-red-700 shadow-sm text-white"
                onClick={() => handleFleetAction('emergencyStop', 'GLOBAL EMERGENCY ROBOTICS STOP INITIATED')}
              >
                <AlertOctagon className="w-4 h-4 animate-pulse" />
                GLOBAL PANIC STOP (E-STOP)
              </Button>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

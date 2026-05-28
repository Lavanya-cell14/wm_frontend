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
import { MonitorPlay, ShieldCheck, Compass, AlertTriangle, Play, RefreshCw, Layers } from 'lucide-react';

export default function TwinRouteView() {
  const { user } = useAuth();
  const { logAudit } = useWarehouse();
  
  const [toastMessage, setToastMessage] = useState('');
  const [activeZoneHighlight, setActiveZoneHighlight] = useState('ALL');
  const [simulatedObstacle, setSimulatedObstacle] = useState(false);
  const [optimizingPath, setOptimizingPath] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSimulateObstacle = () => {
    const nextState = !simulatedObstacle;
    setSimulatedObstacle(nextState);
    
    logAudit(
      user?.email || 'operator@warehouseai.com',
      'OPERATOR',
      nextState ? 'AGV_OBSTACLE_SIMULATION_START' : 'AGV_OBSTACLE_SIMULATION_CLEAR',
      'Twin Simulation',
      nextState 
        ? 'Injected mock obstacle blockage in Aisle B-10 coordinate sector.' 
        : 'Cleared mock obstacle sector blockage.'
    );

    if (nextState) {
      showToast('Obstacle detected in sector Aisle B-10! Re-routing procedures initialized...');
      setOptimizingPath(true);
      setTimeout(() => {
        setOptimizingPath(false);
        showToast('AGV Fleet successfully re-routed via alternative Zone C bypass.');
      }, 2000);
    } else {
      showToast('Aisle B-10 obstacle cleared. Standard paths restored.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type={simulatedObstacle ? 'warning' : 'success'} message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <MonitorPlay className="w-7 h-7 text-[#0071C1]" />
            AGV Digital Twin & 3D Route Simulator
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Visual telemetry engine mapping robotic paths vectors, dynamic blockages, and safety perimeters onto the physical warehouse grid.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="gap-2 text-xs font-semibold" 
            onClick={() => showToast('Digital Twin state synchronized!')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Layout Twin
          </Button>
        </div>
      </div>

      {/* Primary Twin Grid Simulator Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Side: 3D Grid Simulator View */}
        <div className="xl:col-span-3 space-y-4">
          <Card className="border border-gray-100 shadow-sm overflow-hidden bg-slate-950 text-white relative">
            <CardHeader className="border-b border-white/5 bg-white/2 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-400" />
                    Interactive Space Vector Grid
                  </CardTitle>
                  <CardDescription className="text-slate-400">Top-down digital model of Central Fulfillment Facility A.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
                    Live Simulation Active
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[450px]">
              
              {/* Main Simulated Space Grid map */}
              <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl p-4 aspect-video grid grid-cols-8 grid-rows-5 gap-2 relative shadow-inner">
                
                {/* Visual Indicators Layer */}
                {/* Dock Zone */}
                <div className="col-span-2 row-span-1 border border-dashed border-blue-500/30 rounded-xl bg-blue-500/5 flex items-center justify-center text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                  Dock A
                </div>
                {/* Empty spaces */}
                <div className="col-span-4 bg-slate-950/20 rounded-xl border border-white/5"></div>
                {/* Dock B */}
                <div className="col-span-2 row-span-1 border border-dashed border-purple-500/30 rounded-xl bg-purple-500/5 flex items-center justify-center text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                  Dock B
                </div>

                {/* Zone A: Fast Moving */}
                <div className="col-span-3 row-span-2 border border-slate-700/50 rounded-xl bg-slate-800/40 p-2 flex flex-col justify-between">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Zone A (Fast Moving)</span>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="h-6 bg-slate-700/30 rounded flex items-center justify-center font-mono text-[9px] text-slate-400 border border-white/5">S01</div>
                    <div className="h-6 bg-slate-700/30 rounded flex items-center justify-center font-mono text-[9px] text-slate-400 border border-white/5">S02</div>
                    <div className="h-6 bg-blue-500/20 rounded flex items-center justify-center font-mono text-[9px] text-blue-300 font-bold border border-blue-500/30">AGV1</div>
                  </div>
                </div>

                {/* Main Aisle Pathway */}
                <div className="col-span-2 row-span-2 border border-dashed border-slate-700/10 rounded-xl flex items-center justify-center relative">
                  {simulatedObstacle && (
                    <div className="absolute top-4 left-6 px-2.5 py-1 rounded bg-red-500 text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md border border-red-600 z-10 animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      Obstacle Block
                    </div>
                  )}
                  <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Main Aisle B</span>
                </div>

                {/* Zone B: Electronics */}
                <div className="col-span-3 row-span-2 border border-slate-700/50 rounded-xl bg-slate-800/40 p-2 flex flex-col justify-between">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Zone B (Electronics)</span>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="h-6 bg-slate-700/30 rounded flex items-center justify-center font-mono text-[9px] text-slate-400 border border-white/5">S03</div>
                    <div className="h-6 bg-purple-500/20 rounded flex items-center justify-center font-mono text-[9px] text-purple-300 font-bold border border-purple-500/30">AGV3</div>
                    <div className="h-6 bg-slate-700/30 rounded flex items-center justify-center font-mono text-[9px] text-slate-400 border border-white/5">S04</div>
                  </div>
                </div>

                {/* Charging station */}
                <div className="col-span-2 bg-amber-500/5 border border-dashed border-amber-500/30 rounded-xl p-2 flex flex-col justify-between">
                  <span className="text-[8px] uppercase font-bold text-amber-400 tracking-wider">Charger Stations</span>
                  <div className="h-6 bg-amber-500/10 rounded flex items-center justify-center font-mono text-[9px] text-amber-300 font-bold border border-amber-500/25">AGV2</div>
                </div>

                {/* Zone C: Bulk storage */}
                <div className="col-span-4 row-span-1 border border-slate-700/50 rounded-xl bg-slate-800/40 p-2 flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Zone C (Bulk Storage)</span>
                  <div className="flex gap-2">
                    <div className="w-10 h-6 bg-slate-700/30 rounded flex items-center justify-center font-mono text-[9px] text-slate-400 border border-white/5">S10</div>
                    <div className="w-10 h-6 bg-slate-700/30 rounded flex items-center justify-center font-mono text-[9px] text-slate-400 border border-white/5">S11</div>
                  </div>
                </div>

                {/* AGV Idle area */}
                <div className="col-span-2 bg-slate-800/10 border border-white/5 rounded-xl p-2 flex items-center justify-center text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                  Holding West
                </div>

              </div>

              {/* Path Routing telemetry summary overlay */}
              <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-white/5 text-xs text-slate-400">
                <div className="flex gap-4">
                  <div>
                    <span>Simulation Engine: </span>
                    <span className="font-bold text-white">ThreeJS/WebGL Active</span>
                  </div>
                  <div>
                    <span>Path update interval: </span>
                    <span className="font-bold text-white">500ms</span>
                  </div>
                </div>
                {optimizingPath && (
                  <div className="flex items-center gap-2 text-teal-400 animate-pulse font-bold">
                    <Compass className="w-4 h-4 animate-spin" />
                    AI Pathing Optimizer Recalculating...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Simulation Control Board */}
        <div className="space-y-6">
          <Card className="border border-gray-100 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#0071C1]" />
                Twin Controls Board
              </CardTitle>
              <CardDescription>Manually inject environment perturbations to validate path safety models.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Inject obstacle button */}
              <div className="space-y-2">
                <Button 
                  className={`w-full py-3 text-xs justify-center font-bold gap-2 ${
                    simulatedObstacle 
                      ? 'bg-slate-700 hover:bg-slate-800 hover:shadow text-white border-slate-800' 
                      : 'bg-amber-600 hover:bg-amber-700 hover:shadow-md text-white border-amber-700'
                  }`}
                  onClick={handleSimulateObstacle}
                >
                  <AlertTriangle className="w-4 h-4" />
                  {simulatedObstacle ? 'Clear Simulated Obstacle' : 'Simulate Obstacle in Aisle B'}
                </Button>
                <p className="text-[10px] text-gray-400 leading-normal pl-1 text-center">
                  Simulates a structural blockage trigger that forces all AGVs to compute real-time bypasses.
                </p>
              </div>

              <div className="h-px bg-gray-100 my-2"></div>

              {/* Safety factor details */}
              <div className="p-3.5 bg-blue-50/20 border border-blue-100/50 rounded-2xl space-y-3">
                <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Routing Diagnostic Index
                </h4>
                
                <div className="space-y-2 text-[11px] text-gray-600 font-semibold">
                  <div className="flex justify-between">
                    <span>Pathing Grid Safety Factor:</span>
                    <span className="text-emerald-600 font-bold">99.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active AGVs Collision Margin:</span>
                    <span className="text-gray-900 font-bold">0.8m safety clearance</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dynamic Re-route Latency:</span>
                    <span className="text-[#0071C1] font-mono font-bold">8ms avg</span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

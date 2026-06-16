import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, AlertBanner } from 'shared-ui';
import WarehouseScene from '../../three/WarehouseScene';
import { 
  Navigation, MapPin, ArrowRight, Play, CheckCircle2, 
  AlertTriangle, Clock, Sparkles, ClipboardList, ChevronRight 
} from 'lucide-react';
import { getZoneLabel } from '../../utils/zoneMapping';

export default function RouteGuidance() {
  const navigate = useNavigate();
  const { putawayTasks, zones, bins, inventory } = useWarehouse();
  
  const [toastMessage, setToastMessage] = useState('');
  const [navigationActive, setNavigationActive] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [obstacleReported, setObstacleReported] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Find active task in progress
  const activeTask = putawayTasks.find(t => 
    t.status === 'IN_PROGRESS' || 
    t.status === 'PICKED_FROM_RECEIVING' || 
    t.status === 'REACHED_BIN' ||
    t.status === 'DELAYED'
  );

  const steps = activeTask ? [
    { label: "Start at Receiving Dock A", desc: "Verify manifests and collect pallet." },
    { label: "Enter Main Corridor", desc: "Proceed down corridor line towards storage aisles." },
    { label: `Aisle 1 - Turn into ${activeTask.destinationZone || activeTask.zone}`, desc: "Navigate down aisle towards suggested rack rows." },
    { label: `Position at ${activeTask.destinationRack || 'Rack 2'} (${activeTask.destinationShelf || 'Level 1'})`, desc: "Position forklift under correct shelf elevation slot." },
    { label: `Verify Bin Code: ${activeTask.destinationBin || activeTask.bin}`, desc: "Prepare to slot product items into destination bin." }
  ] : [];

  const handleStartNav = () => {
    setNavigationActive(true);
    setCurrentStepIdx(0);
    showToast("Route guidance navigation STARTED. Please follow coordinates.");
  };

  const handleNextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      showToast(`Navigated to step ${currentStepIdx + 2}.`);
    } else {
      showToast("Arrived at target bin location!");
    }
  };

  const handleObstacle = () => {
    setObstacleReported(true);
    showToast("Obstacle logged. Routing engine recalculating pathways...");
  };

  const handleArrive = () => {
    if (!activeTask) return;
    showToast("Destination confirmed. Redirecting to placement completion...");
    setTimeout(() => navigate('/operator/active'), 1000);
  };

  if (!activeTask) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 select-none">
        <Navigation className="w-16 h-16 text-gray-300 animate-pulse" />
        <h2 className="text-xl font-bold text-gray-900">No Active Routing Guidance</h2>
        <p className="text-gray-500 text-sm max-w-sm">
          Please select and start a storage task from the storage tasks queue first.
        </p>
        <Button onClick={() => navigate('/operator/storage-tasks')} className="bg-[#0071C1] hover:bg-[#005c9e] text-white font-bold py-2 px-6">
          Open Storage Tasks Queue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Navigation className="w-7 h-7 text-[#0071C1]" />
            Navigation
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Task ID: <span className="font-mono font-bold text-gray-950">{activeTask.id}</span> • Product: <span className="font-bold text-gray-800">{activeTask.product}</span>
          </p>
        </div>
        <Badge variant="warning" className="text-xs px-2.5 py-1 uppercase font-bold animate-pulse">
          Read-only Route Map
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Three.js Map (Visual rendering) */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border border-gray-150 shadow-xs overflow-hidden">
            <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-4 flex justify-between items-center">
              <CardTitle className="text-sm font-bold uppercase text-gray-700">3D Target Bin Coordinate highlight</CardTitle>
              <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                Target Spot: {activeTask.destinationBin || activeTask.bin}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <WarehouseScene 
                zones={zones}
                bins={bins}
                inventory={inventory}
                selectedBinCode={activeTask.destinationBin || activeTask.bin}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Step-by-Step Instructions Timeline & Controls */}
        <div className="space-y-6">
          
          {/* Controls */}
          <Card className="border border-gray-150">
            <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-4">
              <CardTitle className="text-sm font-bold uppercase text-gray-700">Navigation Controls</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {!navigationActive ? (
                <Button onClick={handleStartNav} className="w-full bg-[#0071C1] hover:bg-[#005c9e] text-white font-bold justify-center py-2.5 gap-2">
                  <Play className="w-4 h-4" /> Start Navigation
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleNextStep} 
                      disabled={currentStepIdx === steps.length - 1}
                      className="flex-1 bg-[#0071C1] hover:bg-[#005c9e] text-white font-bold justify-center py-2 text-xs"
                    >
                      Next Step Completed
                    </Button>
                    <Button 
                      onClick={handleArrive} 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold justify-center py-2 text-xs"
                    >
                      Confirm Reached Bin
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleObstacle}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 font-bold justify-center py-2 text-xs"
                  >
                    Report Blocked Route
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline steps */}
          <Card className="border border-gray-150">
            <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-4">
              <CardTitle className="text-sm font-bold uppercase text-gray-700">Transit Path Steps</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {obstacleReported && (
                <div className="mb-4">
                  <AlertBanner type="warning" message="Obstacle detected in Aisle 1. Standard path recalculating via Aisle 2 corridor." />
                </div>
              )}

              <div className="relative border-l border-dashed border-slate-200 pl-4 ml-2.5 space-y-5">
                {steps.map((step, idx) => {
                  const isCurrent = navigationActive && idx === currentStepIdx;
                  const isPassed = navigationActive && idx < currentStepIdx;
                  return (
                    <div key={idx} className="relative text-xs">
                      <span className={`absolute -left-[21.5px] top-1.5 w-3 h-3 rounded-full border ${
                        isCurrent 
                          ? 'bg-blue-600 border-blue-800 ring-2 ring-blue-150 animate-ping' 
                          : isPassed 
                            ? 'bg-green-500 border-green-700' 
                            : 'bg-slate-200 border-slate-300'
                      }`}></span>
                      <div className="space-y-0.5">
                        <h4 className={`font-bold ${isCurrent ? 'text-blue-900' : isPassed ? 'text-slate-500' : 'text-gray-900'}`}>
                          {step.label}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-medium leading-normal">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex justify-between font-mono text-[9px] text-gray-500 mt-4">
                <span>EST TRANSIT: 5 mins</span>
                <span>DISTANCE: 45m</span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

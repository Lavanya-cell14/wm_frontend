import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, AlertBanner, Modal } from 'shared-ui';
import { 
  Layers, Package, MapPin, CheckSquare, Sparkles, 
  ArrowRight, ShieldAlert, CheckCircle2, QrCode, 
  HelpCircle, RefreshCw, AlertTriangle, Clock
} from 'lucide-react';

export default function PlacementGuidance() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { putawayTasks = [], completePutawayTask } = useWarehouse();
  
  const [toastMessage, setToastMessage] = useState('');
  
  // Modal states
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Scanner state inputs
  const [scannedSku, setScannedSku] = useState('');
  const [scannedBin, setScannedBin] = useState('');
  const [skuError, setSkuError] = useState('');
  const [binError, setBinError] = useState('');
  const [isScannerValidated, setIsScannerValidated] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Find active storage task
  const activeTask = putawayTasks.find(t => 
    ['IN_PROGRESS', 'PICKED_FROM_RECEIVING', 'REACHED_BIN', 'DELAYED'].includes(t.status)
  );

  const handleStartScanner = () => {
    setScannedSku('');
    setScannedBin('');
    setSkuError('');
    setBinError('');
    setIsScannerValidated(false);
    setShowScannerModal(true);
  };

  const handleDemoAutofillSku = () => {
    if (!activeTask) return;
    setScannedSku(activeTask.sku);
    setSkuError('');
  };

  const handleDemoAutofillBin = () => {
    if (!activeTask) return;
    setScannedBin(activeTask.destinationBin || activeTask.bin || 'BIN-002');
    setBinError('');
  };

  const handleValidateScan = () => {
    if (!activeTask) return;
    
    let valid = true;
    if (scannedSku.trim().toUpperCase() !== activeTask.sku.toUpperCase()) {
      setSkuError(`SKU Mismatch! Expected: ${activeTask.sku}`);
      valid = false;
    } else {
      setSkuError('');
    }

    const expectedBin = (activeTask.destinationBin || activeTask.bin || 'BIN-002').toUpperCase();
    if (scannedBin.trim().toUpperCase() !== expectedBin) {
      setBinError(`Bin Mismatch! Expected: ${expectedBin}`);
      valid = false;
    } else {
      setBinError('');
    }

    if (valid) {
      setIsScannerValidated(true);
      showToast("Verification complete! Barcode match confirmed.");
    }
  };

  const handleContinueToCompletion = () => {
    setShowScannerModal(false);
    setShowCompletionModal(true);
  };

  const handleConfirmStorageComplete = () => {
    if (!activeTask) return;
    completePutawayTask(activeTask.id, user);
    setShowCompletionModal(false);
    showToast(`Storage completed! Task ${activeTask.id} marked as Stored/Completed.`);
    setTimeout(() => {
      navigate('/operator/completed-tasks');
    }, 1000);
  };

  if (!activeTask) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-center space-y-4 select-none">
        <Layers className="w-16 h-16 text-gray-300 animate-pulse" />
        <h2 className="text-xl font-bold text-gray-900">No Active Storage Tasks</h2>
        <p className="text-gray-500 text-sm max-w-sm">
          Please select and initiate a storage task from your queue first to display placement guidance.
        </p>
        <Button onClick={() => navigate('/operator/storage-tasks')} className="bg-[#0071C1] hover:bg-[#005c9e] text-white font-bold py-2.5 px-6">
          Open Storage Tasks Queue
        </Button>
      </div>
    );
  }

  // Coordinates mapping logic
  const xCoord = activeTask.destinationZone === 'Zone B' ? '14.5m' : '8.2m';
  const yCoord = activeTask.destinationRack === 'RACK-003' ? '4.8m' : '3.0m';
  const zCoord = activeTask.destinationShelf === 'S-03' ? '2.1m' : '1.2m';

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-[#0071C1]" />
            AI Placement & Slotting Guidance
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Task ID: <span className="font-mono font-bold text-gray-950">{activeTask.id}</span> • Product SKU: <span className="font-mono font-bold text-gray-950">{activeTask.sku}</span>
          </p>
        </div>
        <Badge variant="warning" className="text-xs px-2.5 py-1 uppercase font-bold animate-pulse">
          3D Slots Optimized
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Layout & Coordinate Details */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border border-gray-150 shadow-xs">
            <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-4">
              <CardTitle className="text-sm font-bold uppercase text-gray-700 flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-[#0071C1]" />
                Spatial Slot Coordinates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* X Coordinate */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-slate-300 font-bold font-mono text-[9px] uppercase tracking-wider">Aisle Offset</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">X - Coordinate</div>
                  <div className="text-2xl font-extrabold text-blue-800 font-mono">{xCoord}</div>
                  <p className="text-[10px] text-gray-500 mt-2 font-medium">Lateral distance along the main aisle runway</p>
                </div>

                {/* Y Coordinate */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-slate-300 font-bold font-mono text-[9px] uppercase tracking-wider">Bay Offset</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Y - Coordinate</div>
                  <div className="text-2xl font-extrabold text-blue-800 font-mono">{yCoord}</div>
                  <p className="text-[10px] text-gray-500 mt-2 font-medium">Depth distance inside the storage rack structure</p>
                </div>

                {/* Z Coordinate */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-slate-300 font-bold font-mono text-[9px] uppercase tracking-wider">Height Offset</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Z - Coordinate</div>
                  <div className="text-2xl font-extrabold text-[#0071C1] font-mono">{zCoord}</div>
                  <p className="text-[10px] text-gray-500 mt-2 font-medium">Vertical elevator shelf height level offset</p>
                </div>

              </div>

              {/* Placement Specifics */}
              <div className="mt-6 border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
                <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-gray-400">Orientation:</span>
                  <span className="text-gray-900 font-bold">Horizontal Align</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-gray-400">Bin Space Utilization:</span>
                  <span className="text-indigo-600 font-bold">72% Optimized</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-50 md:border-none">
                  <span className="text-gray-400">Placement Strategy:</span>
                  <span className="text-gray-900 font-bold">FIFO Storage</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-50 md:border-none">
                  <span className="text-gray-400">Stacking Restriction:</span>
                  <Badge variant="error" className="text-[9px] font-bold">Do Not Stack</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Neural Instructions Details */}
          <Card className="border border-gray-150">
            <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-4">
              <CardTitle className="text-sm font-bold uppercase text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                AI Neural Placement Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs font-semibold leading-relaxed text-slate-700 space-y-4">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-950 block text-[11px] uppercase tracking-wider mb-1">AI Smart Instructions Summary:</span>
                <ul className="list-disc list-inside space-y-1 mt-2 text-slate-800">
                  <li>Place horizontally on the shelf board</li>
                  <li>Ensure SKU barcode label is facing outward for manual verification scanner</li>
                  <li>Do not stack other pallets/boxes on top of this product</li>
                  <li>Leave 5cm lateral clearance on both sides for easy retrieval</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Active Task Specifications & Complete Button */}
        <div className="space-y-6">
          <Card className="border border-gray-150">
            <CardHeader className="bg-slate-50/40 border-b border-gray-100 pb-4">
              <CardTitle className="text-sm font-bold uppercase text-gray-700">Storage Destination</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 font-semibold text-xs text-gray-600">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Product Name:</span>
                <span className="text-gray-900 font-bold text-right max-w-[160px] truncate">{activeTask.product}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Quantity To Store:</span>
                <span className="text-gray-900 font-bold">{activeTask.quantity} Units</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Target Zone:</span>
                <span className="text-gray-900 font-bold">{activeTask.destinationZone || activeTask.zone || 'Zone B'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Target Bin Code:</span>
                <span className="font-mono text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {activeTask.destinationBin || activeTask.bin || 'BIN-002'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Label Direction:</span>
                <span className="text-gray-900 font-bold">Facing Outward</span>
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full bg-[#0071C1] hover:bg-[#005c9e] text-white font-bold py-3.5 justify-center text-sm gap-2"
            onClick={handleStartScanner}
          >
            <CheckSquare className="w-5 h-5" />
            Mark Placement Complete
          </Button>
        </div>
      </div>

      {/* SCANNER VALIDATION MODAL */}
      {showScannerModal && (
        <Modal
          isOpen={showScannerModal}
          onClose={() => setShowScannerModal(false)}
          title="Physical Barcode & Bin Verification Scanner"
          maxWidth="max-w-md"
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setShowScannerModal(false)}>
                Cancel Verification
              </Button>
              {!isScannerValidated ? (
                <Button type="button" onClick={handleValidateScan} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Validate Barcodes
                </Button>
              ) : (
                <Button type="button" onClick={handleContinueToCompletion} className="bg-green-600 hover:bg-green-700 text-white font-bold gap-1">
                  Continue Placement <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-gray-500 font-medium leading-relaxed">
              Verify matching credentials by scanning the cargo product barcode and the shelf rack destination bin label.
            </p>

            {/* Scan Product input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block font-bold text-gray-700 uppercase">1. Scan Product SKU / Barcode</label>
                <button 
                  type="button" 
                  onClick={handleDemoAutofillSku}
                  className="text-blue-600 hover:underline font-bold text-[10px]"
                >
                  [Autofill SKU: {activeTask.sku}]
                </button>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={scannedSku}
                  onChange={(e) => { setScannedSku(e.target.value.toUpperCase()); setSkuError(''); }}
                  placeholder="Scan product SKU barcode label..."
                  disabled={isScannerValidated}
                  className="w-full border border-gray-300 pl-3 pr-3 py-2.5 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white"
                />
              </div>
              {skuError && (
                <span className="text-red-600 font-bold block text-[10px]">{skuError}</span>
              )}
            </div>

            {/* Scan Bin input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block font-bold text-gray-700 uppercase">2. Scan Destination Bin Label</label>
                <button 
                  type="button" 
                  onClick={handleDemoAutofillBin}
                  className="text-blue-600 hover:underline font-bold text-[10px]"
                >
                  [Autofill Bin: {activeTask.destinationBin || activeTask.bin || 'BIN-002'}]
                </button>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={scannedBin}
                  onChange={(e) => { setScannedBin(e.target.value.toUpperCase()); setBinError(''); }}
                  placeholder="Scan shelf bin location barcode tag..."
                  disabled={isScannerValidated}
                  className="w-full border border-gray-300 pl-3 pr-3 py-2.5 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 bg-white"
                />
              </div>
              {binError && (
                <span className="text-red-600 font-bold block text-[10px]">{binError}</span>
              )}
            </div>

            {isScannerValidated && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span>Verification Successful! Both barcodes match perfectly. Click continue to update completion.</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* STORAGE COMPLETION CONFIRMATION MODAL */}
      {showCompletionModal && (
        <Modal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          title="Confirm Storage Completion"
          maxWidth="max-w-md"
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setShowCompletionModal(false)}>
                Go Back
              </Button>
              <Button type="button" onClick={handleConfirmStorageComplete} className="bg-green-600 hover:bg-green-700 text-white font-bold">
                Mark Storage Complete
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-gray-500 font-medium leading-relaxed">
              Verify completion details for this storage task. Marking this complete updates inventory state and logs worker metadata.
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-slate-800 font-semibold">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-gray-400">Stored Product:</span>
                <span className="text-gray-900 font-bold">{activeTask.product}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-gray-400">Warehouse Zone:</span>
                <span className="text-gray-900 font-bold">{activeTask.destinationZone || activeTask.zone || 'Zone B'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-gray-400">Aisle Row:</span>
                <span className="text-gray-900 font-bold">{activeTask.destinationAisle || 'Aisle A1'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-gray-400">Rack / Shelf:</span>
                <span className="text-gray-900 font-bold">
                  {activeTask.destinationRack || 'Rack 2'} &bull; {activeTask.destinationShelf || 'Level 1'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-gray-400">Destination Bin:</span>
                <span className="font-mono text-blue-700 font-bold">{activeTask.destinationBin || activeTask.bin}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-gray-400">Responsible Operator:</span>
                <span className="text-gray-900 font-bold">{user?.name || 'Warehouse Operator'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-gray-400">Storage Status:</span>
                <Badge variant="primary" className="text-[9px] uppercase font-bold">PENDING COMPLETION</Badge>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Timestamp Completed:</span>
                <span className="text-gray-900 font-mono text-[10px]">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

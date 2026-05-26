import React, { useState, useEffect } from 'react';
import { ScanBarcode, Box, Loader2, CheckCircle2, Lightbulb, PackageSearch, AlertCircle, ArrowRight, Play, RefreshCw, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import AlertBanner from '../../components/ui/AlertBanner';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductScanner() {
  const [skuInput, setSkuInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scannedData, setScannedData] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const { acceptRecommendation } = useWarehouse();
  const { user } = useAuth();

  const scanSteps = [
    'Scanning Product Barcode...',
    'Fetching Supplier Metadata...',
    'AI Analyzing Warehouse Space & Bin Capacity...',
    'Generating Optimal Storage Recommendation...'
  ];

  const mockProductData = {
    sku: 'SKU-1001',
    name: 'Dell Laptop',
    category: 'Electronics',
    weight: '2.4 kg',
    dimensions: '35 x 24 x 3 cm',
    quantity: 50,
    supplier: 'Dell Logistics',
    handling: 'Keep dry, avoid heavy stacking'
  };

  const mockAiRecommendation = {
    zone: 'Zone B',
    aisle: 'A2',
    rack: 'R-12',
    shelf: 'S-03',
    bin: 'BIN-B-12-03',
    capacity: 72,
    confidence: 94,
    estTime: '8 minutes',
    distance: '65m',
    reason: 'Electronics are already stored in Zone B. This rack has enough capacity, suitable weight support, and is close to the optimized picking route.'
  };

  const handleScan = () => {
    if (!skuInput) return;
    setIsScanning(true);
    setScannedData(null);
    setShowToast(false);
    setCurrentStep(0);
  };

  // Step-by-step progress simulation
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < scanSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsScanning(false);
          setScannedData({
            product: mockProductData,
            recommendation: mockAiRecommendation
          });
          return prev;
        }
      });
    }, 450); // total ~1.8 seconds

    return () => clearInterval(interval);
  }, [isScanning]);

  const handleAccept = () => {
    if (!scannedData) return;
    acceptRecommendation(scannedData.recommendation, scannedData.product, user);
    setShowToast(true);
    setTimeout(() => {
      setScannedData(null);
      setSkuInput('');
      setShowToast(false);
    }, 3000);
  };

  const handleDemoFill = () => {
    setSkuInput('SKU-1001');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ScanBarcode className="w-7 h-7 text-[#0071C1]" />
          Smart Product Receiving Scanner
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Scan inbound barcodes to automatically query weight, supplier specs, handling guidelines, and trigger real-time AI placement suggestions.
        </p>
      </div>

      {showToast && (
        <AlertBanner 
          type="success" 
          message="Putaway task created successfully! Inventory mock data updated, movement logged, and staff dashboard refreshed."
        />
      )}

      {/* Barcode Scanner input box */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold text-gray-700">Scan Barcode / SKU</label>
                <button 
                  type="button" 
                  onClick={handleDemoFill}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold"
                >
                  Quick Fill Demo SKU (SKU-1001)
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ScanBarcode className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={skuInput}
                  onChange={(e) => setSkuInput(e.target.value)}
                  placeholder="Enter SKU-1001 or scan product code..."
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3.5 border font-semibold outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  disabled={isScanning}
                />
              </div>
            </div>
            <Button 
              onClick={handleScan} 
              disabled={isScanning || !skuInput}
              className="w-full md:w-auto py-3.5 px-8 justify-center shrink-0"
            >
              {isScanning ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                'Scan Product'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step Scanning Progress Indicator */}
      {isScanning && (
        <Card className="border border-blue-100 bg-blue-50/10">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="font-bold text-gray-900 text-sm">Processing Inbound Smart Query...</span>
            </div>
            
            <div className="space-y-2">
              {scanSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-2.5 text-xs">
                  {currentStep > index ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : currentStep === index ? (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-200 shrink-0"></div>
                  )}
                  <span className={`${currentStep === index ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Simulated progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div 
                className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / scanSteps.length) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scanned metadata results & recommendation */}
      {scannedData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Metadata Card */}
          <Card className="h-full border border-gray-100">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{scannedData.product.name}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{scannedData.product.sku}</p>
                  </div>
                </div>
                <Badge variant="primary">{scannedData.product.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-6 text-sm">
                <div>
                  <dt className="text-gray-400 font-medium text-xs">Quantity</dt>
                  <dd className="mt-1 font-semibold text-gray-900">{scannedData.product.quantity} Units</dd>
                </div>
                <div>
                  <dt className="text-gray-400 font-medium text-xs">Supplier</dt>
                  <dd className="mt-1 font-semibold text-gray-900">{scannedData.product.supplier}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 font-medium text-xs">Weight</dt>
                  <dd className="mt-1 font-semibold text-gray-900">{scannedData.product.weight}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 font-medium text-xs">Dimensions</dt>
                  <dd className="mt-1 font-semibold text-gray-900">{scannedData.product.dimensions}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-gray-400 font-semibold text-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-orange-500" /> Handling Rules
                  </dt>
                  <dd className="mt-1 font-semibold text-orange-700 bg-orange-50 px-3 py-2.5 rounded-lg border border-orange-100 text-xs">
                    {scannedData.product.handling}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* AI Recommendation Card */}
          <Card className="h-full border border-t-4 border-t-[#0071C1] border-gray-100">
            <CardHeader className="border-b border-gray-100 bg-blue-50/20 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0071C1] font-bold text-sm">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  AI Placement Suggestion
                </div>
                <Badge variant="success" className="gap-1 bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="w-3 h-3" /> {scannedData.recommendation.confidence}% Confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col h-[calc(100%-73px)]">
              
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-xs">
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Zone</div>
                    <div className="font-bold text-gray-900 text-sm">{scannedData.recommendation.zone}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-xs">
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Aisle</div>
                    <div className="font-bold text-gray-900 text-sm">{scannedData.recommendation.aisle}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-xs">
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Rack</div>
                    <div className="font-bold text-gray-900 text-sm">{scannedData.recommendation.rack}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-xs">
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Shelf</div>
                    <div className="font-bold text-gray-900 text-sm">{scannedData.recommendation.shelf}</div>
                  </div>
                  <div className="bg-[#0071C1] p-2.5 rounded-lg border border-blue-700 shadow-xs col-span-2 sm:col-span-1 flex flex-col justify-center">
                    <div className="text-[9px] text-blue-100 uppercase font-bold tracking-wider mb-0.5">Target Bin</div>
                    <div className="font-bold text-white text-xs font-mono">{scannedData.recommendation.bin}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6 flex-1">
                <h4 className="text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wide">AI Rationale:</h4>
                <p className="text-xs text-gray-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  {scannedData.recommendation.reason}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Bin Capacity:</span>
                    <span className="font-bold text-green-600">{scannedData.recommendation.capacity}%</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Est. Putaway Time:</span>
                    <span className="font-bold text-gray-900">{scannedData.recommendation.estTime}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-auto">
                <Button variant="outline" className="text-xs font-semibold py-2 px-3 justify-center gap-1.5 text-gray-600">
                  <RefreshCw className="w-3.5 h-3.5 text-gray-500" /> Regenerate
                </Button>
                <Button variant="outline" className="text-xs font-semibold py-2 px-3 justify-center gap-1.5 text-gray-600">
                  <Eye className="w-3.5 h-3.5 text-gray-500" /> View Digital Twin
                </Button>
                <Button className="col-span-2 bg-[#0071C1] hover:bg-[#005c9e] text-xs font-semibold py-2 px-3 justify-center gap-1.5 text-white" onClick={handleAccept}>
                  Accept Recommendation <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

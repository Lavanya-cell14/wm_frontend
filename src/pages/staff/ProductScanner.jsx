import React, { useState, useEffect } from 'react';
import { ScanBarcode, Box, Loader2, CheckCircle2, Lightbulb, PackageSearch, AlertCircle, ArrowRight, Play, RefreshCw, Eye, X, MapPin, Weight, Ruler, Clock, Zap, Package } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import AlertBanner from '../../components/ui/AlertBanner';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import { getZoneLabel } from '../../utils/zoneMapping';

export default function ProductScanner() {
  const [skuInput, setSkuInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scannedData, setScannedData] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [regeneratingRec, setRegeneratingRec] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { acceptRecommendation, inventory } = useWarehouse();
  const { user } = useAuth();

  const scanSteps = [
    'Scanning Product Barcode...',
    'Fetching Supplier Metadata...',
    'AI Analyzing Warehouse Space & Bin Capacity...',
    'Generating Optimal Storage Recommendation...'
  ];

  // Helper validation for rigid SKU/Barcode format only (no names like dell, laptop, macbook allowed)
  const validateSkuFormat = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return false;
    
    // Pure barcode (digits only)
    if (/^\d+$/.test(trimmed)) return true;
    
    // Standard alphanumeric SKU formats with hyphens: e.g. SKU-1001, PRD-0001, PRD-001
    // Must contain a hyphen and contain digits to avoid name searches
    if (/^[A-Z0-9]+-[A-Z0-9]+$/i.test(trimmed)) {
      return /\d/.test(trimmed);
    }
    
    return false;
  };

  const handleScan = () => {
    setErrorMsg('');
    const inputUpper = skuInput.trim().toUpperCase();
    
    if (!inputUpper) {
      setErrorMsg('Please enter a valid SKU or Barcode.');
      return;
    }

    if (!validateSkuFormat(inputUpper)) {
      setErrorMsg('Please enter a valid SKU or Barcode.');
      return;
    }

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
          
          const searchSku = skuInput.trim().toUpperCase();
          const matchedItem = inventory.find(item => item.sku.toUpperCase() === searchSku);
          
          let productData;
          if (matchedItem) {
            productData = {
              sku: matchedItem.sku,
              name: matchedItem.name,
              category: matchedItem.category,
              weight: matchedItem.weight || '2.0 kg',
              dimensions: matchedItem.dimensions || '25 x 25 x 25 cm',
              quantity: matchedItem.quantity || 10,
              supplier: matchedItem.supplier || 'Central Cloud Logistics',
              handling: 'Keep dry, avoid heavy stacking'
            };
          } else {
            // Fallback for valid unregistered demo SKU/Barcode
            productData = {
              sku: searchSku,
              name: `Product ${searchSku}`,
              category: searchSku.startsWith('PRD-') ? 'Electronics' : 'Accessories',
              weight: '1.8 kg',
              dimensions: '20 x 20 x 20 cm',
              quantity: 25,
              supplier: 'Standard Logistics Corp',
              handling: 'Keep dry, avoid heavy stacking'
            };
          }

          // Link AI recommendation dynamically to the zone/bin properties from the SKU-linked product metadata
          const targetZone = matchedItem ? matchedItem.zone : 'Zone B';
          const targetBin = matchedItem ? matchedItem.bin : 'BIN-B-12-03';
          const targetCategory = matchedItem ? matchedItem.category : 'Electronics';

          const recommendationData = {
            zone: targetZone,
            aisle: matchedItem ? matchedItem.rack.replace('RACK-', 'A') : 'A2',
            rack: matchedItem ? matchedItem.rack.replace('RACK-', 'R-') : 'R-12',
            shelf: matchedItem ? matchedItem.shelf : 'S-03',
            bin: targetBin,
            capacity: matchedItem ? (matchedItem.quantity > 40 ? 88 : 64) : 72,
            confidence: matchedItem ? 96 : 85,
            estTime: '6 minutes',
            distance: '45m',
            reason: `${targetCategory} specifications for ${searchSku} are mapped to ${targetZone}. This slot has perfect weight capacity support and minimizes putaway travel time.`
          };

          setScannedData({
            product: productData,
            recommendation: recommendationData
          });
          
          return prev;
        }
      });
    }, 450); // total ~1.8 seconds

    return () => clearInterval(interval);
  }, [isScanning, skuInput, inventory]);

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

  const handleDemoFill = (type) => {
    setSkuInput(type === 'PRD' ? 'PRD-0001' : 'SKU-1001');
    setErrorMsg('');
  };

  const handleRegenerateRecommendation = () => {
    if (!scannedData) return;
    setRegeneratingRec(true);

    // Simulate regeneration with variations
    setTimeout(() => {
      const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
      const aisles = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3'];
      const racks = ['R-10', 'R-11', 'R-12', 'R-13', 'R-14', 'R-15'];
      const shelves = ['S-01', 'S-02', 'S-03', 'S-04', 'S-05'];
      
      const newZone = zones[Math.floor(Math.random() * zones.length)];
      const newAisle = aisles[Math.floor(Math.random() * aisles.length)];
      const newRack = racks[Math.floor(Math.random() * racks.length)];
      const newShelf = shelves[Math.floor(Math.random() * shelves.length)];
      const newBin = `BIN-${newZone.replace('Zone ', '')}-${Math.floor(Math.random() * 15) + 1}-${Math.floor(Math.random() * 9) + 1}`;
      const newConfidence = Math.floor(Math.random() * 10) + 90;
      
      setScannedData(prev => ({
        ...prev,
        recommendation: {
          ...prev.recommendation,
          zone: newZone,
          aisle: newAisle,
          rack: newRack,
          shelf: newShelf,
          bin: newBin,
          confidence: newConfidence,
          reason: `Alternative placement: ${scannedData.product.category} item is now recommended for ${newZone} (${getZoneLabel(newZone)}). This revised allocation optimizes bin space and minimizes putaway travel time.`
        }
      }));
      
      setRegeneratingRec(false);
    }, 1500);
  };

  const handleViewDetails = () => {
    setShowDetailsModal(true);
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
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                  <button 
                    type="button" 
                    onClick={() => handleDemoFill('SKU')}
                    className="hover:underline"
                  >
                    Demo SKU-1001
                  </button>
                  <span className="text-gray-300">|</span>
                  <button 
                    type="button" 
                    onClick={() => handleDemoFill('PRD')}
                    className="hover:underline"
                  >
                    Demo PRD-0001
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ScanBarcode className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={skuInput}
                  onChange={(e) => {
                    setSkuInput(e.target.value.toUpperCase());
                    setErrorMsg('');
                  }}
                  placeholder="Enter SKU (e.g. SKU-1001, PRD-0001) or Scan Barcode..."
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3.5 border font-semibold outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  disabled={isScanning}
                />
              </div>
              {errorMsg && (
                <div className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  {errorMsg}
                </div>
              )}
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

              <div className="grid grid-cols-2 gap-2 mt-auto">
                <Button 
                  className="text-sm font-semibold py-2.5 px-4 justify-center gap-2 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
                  onClick={handleRegenerateRecommendation}
                  disabled={regeneratingRec}
                >
                  {regeneratingRec ? (
                    <><Loader2 className="w-4 h-4 text-blue-600 animate-spin" /></>
                  ) : (
                    <><RefreshCw className="w-4 h-4 text-blue-600" /> Regenerate</>
)}
                </Button>
                <Button 
                  className="text-sm font-semibold py-2.5 px-4 justify-center gap-2 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap"
                  onClick={handleViewDetails}
                >
                  <Eye className="w-4 h-4 text-blue-600" /> Details
                </Button>
                <Button className="col-span-2 bg-[#0071C1] hover:bg-[#005c9e] text-sm font-semibold py-2.5 px-3 justify-center gap-2 text-white rounded-lg transition-colors" onClick={handleAccept}>
                  Accept Recommendation <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showDetailsModal && scannedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={() => setShowDetailsModal(false)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <CardHeader className="border-b border-gray-100 sticky top-0 bg-white flex items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#0071C1]" />
                Product & Recommendation Details
              </CardTitle>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Product Info */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Box className="w-4 h-4 text-blue-600" />
                  Product Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <dt className="text-gray-500 font-medium text-xs uppercase tracking-wider">SKU</dt>
                    <dd className="mt-1 font-bold text-gray-900">{scannedData.product.sku}</dd>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <dt className="text-gray-500 font-medium text-xs uppercase tracking-wider">Category</dt>
                    <dd className="mt-1 font-bold text-gray-900">{scannedData.product.category}</dd>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <dt className="text-gray-500 font-medium text-xs uppercase tracking-wider">Weight</dt>
                    <dd className="mt-1 font-bold text-gray-900 flex items-center gap-1">
                      <Weight className="w-3.5 h-3.5 text-orange-600" />
                      {scannedData.product.weight}
                    </dd>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <dt className="text-gray-500 font-medium text-xs uppercase tracking-wider">Dimensions</dt>
                    <dd className="mt-1 font-bold text-gray-900 flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-purple-600" />
                      {scannedData.product.dimensions}
                    </dd>
                  </div>
                  <div className="col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <dt className="text-gray-500 font-medium text-xs uppercase tracking-wider">Quantity</dt>
                    <dd className="mt-1 font-bold text-gray-900">{scannedData.product.quantity} units</dd>
                  </div>
                  <div className="col-span-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <dt className="text-orange-700 font-medium text-xs uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Handling Rules
                    </dt>
                    <dd className="mt-1 font-semibold text-orange-700">{scannedData.product.handling}</dd>
                  </div>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  AI-Recommended Placement
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                      <div className="text-gray-500 font-bold uppercase tracking-wider mb-1">Zone</div>
                      <div className="font-bold text-gray-900 text-sm">{scannedData.recommendation.zone}</div>
                      <div className="text-[9px] text-gray-500 mt-0.5">{getZoneLabel(scannedData.recommendation.zone)}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                      <div className="text-gray-500 font-bold uppercase tracking-wider mb-1">Aisle</div>
                      <div className="font-bold text-gray-900 text-sm">{scannedData.recommendation.aisle}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                      <div className="text-gray-500 font-bold uppercase tracking-wider mb-1">Rack</div>
                      <div className="font-bold text-gray-900 text-sm">{scannedData.recommendation.rack}</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                      <div className="text-gray-500 font-bold uppercase tracking-wider mb-1">Shelf</div>
                      <div className="font-bold text-gray-900 text-sm">{scannedData.recommendation.shelf}</div>
                    </div>
                    <div className="bg-[#0071C1] p-2.5 rounded-lg border border-blue-700 col-span-2 sm:col-span-1 flex flex-col justify-center">
                      <div className="text-blue-100 font-bold uppercase tracking-wider mb-0.5 text-[9px]">Bin</div>
                      <div className="font-bold text-white text-xs font-mono">{scannedData.recommendation.bin}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  Metrics & Analysis
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <dt className="text-green-700 font-bold text-xs uppercase tracking-wider">AI Confidence</dt>
                    <dd className="mt-1 text-2xl font-bold text-green-700">{scannedData.recommendation.confidence}%</dd>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <dt className="text-blue-700 font-bold text-xs uppercase tracking-wider">Est. Putaway Time</dt>
                    <dd className="mt-1 font-bold text-blue-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {scannedData.recommendation.estTime}
                    </dd>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <dt className="text-purple-700 font-bold text-xs uppercase tracking-wider">Bin Capacity</dt>
                    <dd className="mt-1 font-bold text-purple-700">{scannedData.recommendation.capacity}%</dd>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <dt className="text-amber-700 font-bold text-xs uppercase tracking-wider">Distance</dt>
                    <dd className="mt-1 font-bold text-amber-700">{scannedData.recommendation.distance}</dd>
                  </div>
                </div>
              </div>

              {/* AI Rationale */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">AI Rationale</h3>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {scannedData.recommendation.reason}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Button variant="outline" className="flex-1 justify-center" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
                <Button className="flex-1 bg-[#0071C1] hover:bg-[#005c9e] text-white justify-center" onClick={() => {
                  handleAccept();
                  setShowDetailsModal(false);
                }}>
                  Accept & Create Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


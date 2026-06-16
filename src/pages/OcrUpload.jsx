import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../context/WarehouseContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, DashboardStatCard, Button, Badge, StatusBadge, AlertBanner } from 'shared-ui';
import { 
  FileText, UploadCloud, Trash2, ShieldAlert, Sparkles, 
  CheckCircle2, AlertCircle, RefreshCw, Send, Loader2, X, AlertTriangle, CheckSquare
} from 'lucide-react';

const mockOcrTemplates = {
  'dell_monitor_invoice.pdf': {
    document_type: 'Invoice',
    document_number: 'INV-2026-1024',
    supplier: 'Dell Sourcing Ltd',
    sku: '', // Missing SKU warning
    product_name: 'Dell Monitor 27" UltraSharp',
    category: 'Electronics',
    quantity: 40,
    uom: 'BOX',
    length: 65,
    width: 18,
    height: 42,
    weight: 6.5,
    confidence_score: 94,
    validation_status: 'Warning',
    warnings: ['Missing SKU - Manual SKU assignment required in inventory log.', 'Unregistered SKU code pattern.']
  },
  'hp_printer_packing_slip.jpg': {
    document_type: 'Packing List',
    document_number: 'PS-5502',
    supplier: 'HP Supply Logistics',
    sku: 'SKU-7734',
    product_name: 'HP LaserJet Printer Pro',
    category: 'Electronics',
    quantity: 15,
    uom: 'BOX',
    length: '', // Missing dimensions warning
    width: '',
    height: '',
    weight: 14.2,
    confidence_score: 88,
    validation_status: 'Warning',
    warnings: ['Missing dimensions - Cargo volume measurements required for slotting bin allocation.']
  },
  'logitech_mouse_bol.png': {
    document_type: 'Bill of Lading',
    document_number: 'BOL-8812-US',
    supplier: 'Logitech Imports Inc',
    sku: 'SKU-1198',
    product_name: 'Logitech Wireless Mouse M510',
    category: 'Accessories',
    quantity: 250,
    uom: 'PCS',
    length: 12,
    width: 6,
    height: 4,
    weight: 0.12,
    confidence_score: 68, // Low confidence extraction
    validation_status: 'Warning',
    warnings: [
      'Low confidence extraction (68%) - Please review scanned values manually.',
      'Duplicate document warning - Document ID BOL-8812-US already processed on 2026-06-12.'
    ]
  },
  'drill_delivery_docket.pdf': {
    document_type: 'Delivery Docket',
    document_number: 'DD-9901',
    supplier: 'Industrial Tools Corp',
    sku: 'SKU-3092',
    product_name: 'Heavy Duty Drilling Rig 500W',
    category: 'Industrial Tools',
    quantity: 8,
    uom: 'BOX',
    length: 52,
    width: 32,
    height: 28,
    weight: 18.5,
    confidence_score: 98,
    validation_status: 'Valid',
    warnings: []
  }
};

export default function OcrUpload() {
  const navigate = useNavigate();
  const { ocrDocuments, setOcrDocuments, addOcrDocument, logAudit } = useWarehouse();
  const { user } = useAuth();
  
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeFileId, setActiveFileId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const fileInputRef = useRef(null);

  // Set first document as active on mount if available
  useEffect(() => {
    if (ocrDocuments && ocrDocuments.length > 0 && !activeFileId) {
      setActiveFileId(ocrDocuments[0].id);
    }
  }, [ocrDocuments, activeFileId]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const addFiles = (fileList) => {
    const filesArray = Array.from(fileList);
    let addedCount = 0;
    
    filesArray.forEach(file => {
      const nameLower = file.name.toLowerCase();
      let matchedKey = Object.keys(mockOcrTemplates).find(key => nameLower.includes(key.split('.')[0]));
      
      let template = null;
      if (matchedKey) {
        template = { ...mockOcrTemplates[matchedKey] };
      } else {
        // Generic fallback data
        template = {
          document_type: 'Invoice',
          document_number: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
          supplier: 'Generic Freight Supplier',
          sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
          product_name: file.name.split('.')[0].replace(/[-_]/g, ' '),
          category: 'Safety Equipment',
          quantity: Math.floor(10 + Math.random() * 90),
          uom: 'BOX',
          length: 30,
          width: 30,
          height: 30,
          weight: 4.5,
          confidence_score: 95,
          validation_status: 'Valid',
          warnings: []
        };
      }

      const newId = `OCR-${Math.floor(100 + Math.random() * 900)}`;
      const newDoc = {
        id: newId,
        fileName: file.name,
        documentType: template.document_type,
        supplierName: template.supplier,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.email || 'inventory@warehouseai.com',
        status: 'OCR_UPLOADED',
        confidenceScore: template.confidence_score,
        extractedItems: [
          {
            id: `EXT-${Date.now()}-${Math.floor(Math.random()*100)}`,
            sku: template.sku,
            productName: template.product_name,
            category: template.category,
            quantity: Number(template.quantity),
            uom: template.uom,
            length: template.length,
            width: template.width,
            height: template.height,
            weight: template.weight,
            batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
            expiryDate: '2028-12-31',
            confidenceScore: template.confidence_score,
            validationStatus: template.validation_status
          }
        ],
        warnings: template.warnings ? template.warnings.length : 0,
        warningsList: template.warnings || []
      };

      addOcrDocument(newDoc);
      setActiveFileId(newId);
      addedCount++;
    });

    showToast(`Successfully added ${addedCount} file(s).`);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      addFiles(e.target.files);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const removeFile = (id) => {
    setOcrDocuments(prev => {
      const filtered = prev.filter(f => f.id !== id);
      if (activeFileId === id) {
        setActiveFileId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
    showToast('Removed document from queue.', 'info');
  };

  const handleClear = () => {
    setOcrDocuments([]);
    setActiveFileId(null);
    showToast('Cleared all selected documents.', 'info');
  };

  const handleProcess = () => {
    const activeDoc = ocrDocuments.find(d => d.id === activeFileId);
    if (!activeDoc) {
      showToast('No document selected.', 'warning');
      return;
    }

    if (activeDoc.status !== 'OCR_UPLOADED') {
      showToast('Document already processed.', 'warning');
      return;
    }

    setProcessing(true);
    
    // Simulate OCR processing steps
    setOcrDocuments(prev => prev.map(d => d.id === activeFileId ? { ...d, status: 'OCR_PROCESSING' } : d));

    setTimeout(() => {
      setOcrDocuments(prev => prev.map(d => d.id === activeFileId ? { ...d, status: 'VERIFICATION_PENDING' } : d));
      setProcessing(false);
      showToast('OCR analysis completed successfully! Ready for verification.');
      
      logAudit(
        user?.email || 'inventory@warehouseai.com',
        user?.role || 'RECEIVING_INVENTORY_OFFICER',
        'OCR_DOCUMENT_PROCESS',
        'Inbound OCR',
        `Processed document ${activeDoc.fileName} using Warehouse Neural OCR Engine.`
      );
    }, 2000);
  };

  const handleFillDemoFile = (templateName) => {
    const template = mockOcrTemplates[templateName];
    const newId = `OCR-${Math.floor(100 + Math.random() * 900)}`;
    const newDoc = {
      id: newId,
      fileName: templateName,
      documentType: template.document_type,
      supplierName: template.supplier,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user?.email || 'inventory@warehouseai.com',
      status: 'OCR_UPLOADED',
      confidenceScore: template.confidence_score,
      extractedItems: [
        {
          id: `EXT-${Date.now()}`,
          sku: template.sku,
          productName: template.product_name,
          category: template.category,
          quantity: Number(template.quantity),
          uom: template.uom,
          length: template.length,
          width: template.width,
          height: template.height,
          weight: template.weight,
          batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
          expiryDate: '2028-12-31',
          confidenceScore: template.confidence_score,
          validationStatus: template.validation_status
        }
      ],
      warnings: template.warnings ? template.warnings.length : 0,
      warningsList: template.warnings || []
    };

    setOcrDocuments(prev => [newDoc, ...prev]);
    setActiveFileId(newId);
    showToast(`Added demo file: ${templateName}`);
  };

  const activeFile = ocrDocuments.find(f => f.id === activeFileId);
  const totalFiles = ocrDocuments.length;
  const pendingCount = ocrDocuments.filter(f => f.status === 'OCR_UPLOADED').length;
  const processingCount = ocrDocuments.filter(f => f.status === 'OCR_PROCESSING').length;
  const verificationPendingCount = ocrDocuments.filter(f => f.status === 'VERIFICATION_PENDING').length;
  const verifiedCount = ocrDocuments.filter(f => f.status === 'VERIFIED').length;

  return (
    <div className="space-y-6">
      {/* Toast banner */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-250">
          <AlertBanner 
            type={toast.type} 
            message={toast.message} 
          />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <UploadCloud className="w-7 h-7 text-[#0071C1]" />
            Inbound OCR Scanner
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Upload cargo manifests, bill of ladings, or invoices to extract product metadata and dimensions automatically.
          </p>
        </div>

        {/* Quick Demo Fills */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1.5 mr-1">Load Demo Documents:</span>
          <button 
            onClick={() => handleFillDemoFile('dell_monitor_invoice.pdf')}
            className="px-2.5 py-1 text-[10px] font-bold bg-white text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors"
          >
            Dell Invoice
          </button>
          <button 
            onClick={() => handleFillDemoFile('hp_printer_packing_slip.jpg')}
            className="px-2.5 py-1 text-[10px] font-bold bg-white text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors"
          >
            HP Slip
          </button>
          <button 
            onClick={() => handleFillDemoFile('logitech_mouse_bol.png')}
            className="px-2.5 py-1 text-[10px] font-bold bg-white text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors"
          >
            Logitech BOL
          </button>
          <button 
            onClick={() => handleFillDemoFile('drill_delivery_docket.pdf')}
            className="px-2.5 py-1 text-[10px] font-bold bg-white text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors"
          >
            Drill Docket
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <DashboardStatCard title="Selected Documents" value={totalFiles} icon={FileText} />
        <DashboardStatCard title="Pending Process" value={pendingCount} icon={RefreshCw} />
        <DashboardStatCard title="Pending Verification" value={verificationPendingCount} icon={AlertCircle} />
        <DashboardStatCard title="Fully Verified" value={verifiedCount} icon={CheckCircle2} />
      </div>

      {/* Drag & Drop File Container */}
      <Card className="border border-gray-150 shadow-xs">
        <CardContent className="p-6">
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`w-full border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center transition-all ${
              dragActive 
                ? 'border-blue-500 bg-blue-50/30' 
                : 'border-gray-200 hover:border-blue-300 bg-[#F4FCFF]/50'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              onChange={handleChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden" 
            />
            
            <div className="p-4 bg-white rounded-full shadow-xs text-blue-500 mb-3 border border-blue-50">
              <UploadCloud className="w-8 h-8" />
            </div>
            
            <h3 className="font-bold text-sm text-gray-900">Drag & Drop inbound files here</h3>
            <p className="text-xs text-gray-400 mt-1 mb-4">Supports PDF, JPG, JPEG, or PNG up to 10MB per file</p>
            
            <div className="flex gap-2">
              <Button onClick={handleButtonClick}>
                Select File
              </Button>
              {totalFiles > 0 && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleProcess}
                    disabled={processing || !activeFile || activeFile.status !== 'OCR_UPLOADED'}
                  >
                    {processing ? (
                      <span className="flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</span>
                    ) : (
                      'Process Selected'
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    className="text-red-600 border-red-100 hover:bg-red-50"
                    onClick={handleClear}
                  >
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Files Table & Visual Extraction Preview Block */}
      {totalFiles > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Uploaded Files List */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border border-gray-150 h-full flex flex-col">
              <CardHeader className="border-b border-gray-100 pb-3">
                <CardTitle className="text-xs uppercase font-bold tracking-wider text-gray-500">Document Selection Queue</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto max-h-[500px]">
                <div className="divide-y divide-gray-100">
                  {ocrDocuments.map(f => (
                    <div 
                      key={f.id}
                      onClick={() => setActiveFileId(f.id)}
                      className={`p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-gray-50/50 ${
                        activeFileId === f.id ? 'bg-blue-50/40 border-l-4 border-[#0071C1]' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <FileText className={`w-4 h-4 shrink-0 ${activeFileId === f.id ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className="text-xs font-bold text-gray-900 truncate block">{f.fileName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-semibold">
                          <span>{f.documentType}</span>
                          <span>•</span>
                          <span className="font-mono text-gray-500">{f.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {f.status === 'OCR_UPLOADED' && (
                          <Badge variant="outline" className="text-[9px]">Uploaded</Badge>
                        )}
                        {f.status === 'OCR_PROCESSING' && (
                          <Badge variant="primary" className="text-[9px] bg-blue-50 text-blue-700 animate-pulse border-blue-200">
                            <span className="flex items-center gap-1"><Loader2 className="w-2.5 h-2.5 animate-spin" /> Parsers</span>
                          </Badge>
                        )}
                        {f.status === 'VERIFICATION_PENDING' && (
                          <Badge variant="warning" className="text-[9px]">Review</Badge>
                        )}
                        {f.status === 'VERIFIED' && (
                          <Badge variant="success" className="text-[9px]">Verified</Badge>
                        )}
                        {f.status === 'REJECTED' && (
                          <Badge variant="danger" className="text-[9px]">Rejected</Badge>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(f.id);
                          }}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: OCR Extraction Details Preview */}
          <div className="lg:col-span-2">
            {activeFile ? (
              <Card className={`border border-gray-100 shadow-sm transition-all h-full ${
                activeFile.status === 'OCR_UPLOADED' ? 'border-dashed' : ''
              }`}>
                <CardHeader className="border-b border-gray-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                      OCR Data Preview Panel
                    </CardTitle>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{activeFile.fileName}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeFile.status === 'OCR_UPLOADED' && (
                      <Button 
                        size="sm" 
                        onClick={handleProcess}
                        className="text-xs h-8 gap-1.5"
                        disabled={processing}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${processing ? 'animate-spin' : ''}`} />
                        Process manifest
                      </Button>
                    )}
                    {activeFile.status === 'VERIFICATION_PENDING' && (
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/ocr-verification', { state: { documentId: activeFile.id } })}
                        className="text-xs h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        <CheckSquare className="w-3 h-3" />
                        Verify Extracted Data
                      </Button>
                    )}
                    {activeFile.status === 'VERIFIED' && (
                      <Badge variant="success" className="bg-emerald-600 text-white font-bold text-[10px]">
                        Receipt Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {/* Status: Uploaded */}
                  {activeFile.status === 'OCR_UPLOADED' && (
                    <div className="py-16 flex flex-col items-center justify-center text-center text-gray-400 space-y-3">
                      <FileText className="w-12 h-12 text-gray-300" />
                      <h3 className="font-bold text-sm text-gray-800">Document Uploaded</h3>
                      <p className="text-xs text-gray-500 max-w-sm">
                        Please click the <strong>Process manifest</strong> button to parse and extract tabular data.
                      </p>
                    </div>
                  )}

                  {/* Status: Processing */}
                  {activeFile.status === 'OCR_PROCESSING' && (
                    <div className="py-16 flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                      <h3 className="font-bold text-sm text-gray-800">Neural OCR Engine Extracting...</h3>
                      <p className="text-xs text-slate-400 animate-pulse">Running document bounding grid alignments...</p>
                    </div>
                  )}

                  {/* Status: VERIFICATION_PENDING or VERIFIED or REJECTED */}
                  {(activeFile.status === 'VERIFICATION_PENDING' || activeFile.status === 'VERIFIED' || activeFile.status === 'REJECTED') && activeFile.extractedItems && activeFile.extractedItems.length > 0 && (
                    <div className="space-y-6">
                      
                      {/* Document Confidence & Validation Warnings */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="text-[9px] text-gray-400 font-bold uppercase block">Validation Status</span>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              activeFile.status === 'VERIFIED' ? 'bg-green-500' : activeFile.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'
                            }`}></span>
                            <span className="text-xs font-bold text-gray-800">
                              {activeFile.status === 'VERIFIED' ? 'Verified' : activeFile.status === 'REJECTED' ? 'Rejected' : 'Pending Verification'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl md:col-span-2">
                          <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase">
                            <span>OCR Confidence Score</span>
                            <span className={
                              activeFile.confidenceScore > 90 ? 'text-green-600' : 'text-amber-600'
                            }>{activeFile.confidenceScore}%</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div 
                              className={`h-1.5 rounded-full ${
                                activeFile.confidenceScore > 90 ? 'bg-green-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${activeFile.confidenceScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Redirect Banner for Verification Pending */}
                      {activeFile.status === 'VERIFICATION_PENDING' && (
                        <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-blue-800">Manual Verification Required</h4>
                            <p className="text-[11px] text-blue-600 mt-0.5">Please review the parsed entity records, correct any OCR bounding box mismatches, and confirm to generate an inbound receipt.</p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => navigate('/ocr-verification', { state: { documentId: activeFile.id } })}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shrink-0 flex items-center gap-1.5"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            Open Verification Form
                          </Button>
                        </div>
                      )}

                      {/* Warnings list */}
                      {activeFile.warningsList && activeFile.warningsList.length > 0 && (
                        <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1.5">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            Extraction Warnings Detected
                          </h4>
                          <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-700 font-medium">
                            {activeFile.warningsList.map((warn, i) => (
                              <li key={i}>{warn}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Fields details grid */}
                      <div className="border border-slate-100 bg-slate-50/20 rounded-2xl overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-100 p-3 text-xs font-bold uppercase text-slate-500 tracking-wider">
                          Extracted Entity Details (Read-only)
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4 text-xs font-semibold">
                          <div>
                            <span className="text-[10px] text-gray-400 block font-medium">Document Type</span>
                            <span className="text-gray-900 font-bold">{activeFile.documentType}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-medium">Document ID Number</span>
                            <span className="text-gray-900 font-mono font-bold">{activeFile.id}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-medium">Supplier Entity</span>
                            <span className="text-gray-900 font-bold">{activeFile.supplierName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-medium">Uploader Email</span>
                            <span className="text-gray-900 font-mono">{activeFile.uploadedBy}</span>
                          </div>
                          
                          <div className="col-span-full border-t border-slate-100 my-1 pt-3 font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                            Product Extracted Manifest Line Items
                          </div>

                          {activeFile.extractedItems.map((item, index) => (
                            <React.Fragment key={item.id || index}>
                              <div>
                                <span className="text-[10px] text-gray-400 block font-medium">SKU Reference</span>
                                {item.sku ? (
                                  <span className="text-[#0071C1] font-mono font-bold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded w-fit block">{item.sku}</span>
                                ) : (
                                  <span className="text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded w-fit block italic font-bold">MISSING SKU</span>
                                )}
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 block font-medium">Product Title</span>
                                <span className="text-gray-900 font-bold">{item.productName}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 block font-medium">Category</span>
                                <span className="text-gray-900 font-bold">{item.category}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 block font-medium">Parsed Quantity</span>
                                <span className="text-gray-900 font-bold">{item.quantity} {item.uom || 'Units'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 block font-medium">Weight</span>
                                <span className="text-gray-900 font-bold">{item.weight ? `${item.weight} kg` : 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 block font-medium">Dimensions (L x W x H)</span>
                                {item.length ? (
                                  <span className="text-gray-900 font-bold">
                                    {item.length} x {item.width} x {item.height} cm
                                  </span>
                                ) : (
                                  <span className="text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded w-fit block italic font-bold">MISSING DIMENSIONS</span>
                                )}
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white p-12 text-center text-xs">
                <div>
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <span>Choose a document from the queue list to preview extracted records.</span>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

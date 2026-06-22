import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../context/WarehouseContext';
import { useAuth } from '../context/AuthContext';
import { processOcrDocument, uploadOcrDocumentDjangoApi, normalizeOcrResponse } from '../services/ocrService';
import { AlertBanner, Badge, Button, Card, CardContent, CardHeader, CardTitle, DashboardStatCard, Input, StatusBadge } from 'shared-ui';
import { 
  FileText, UploadCloud, Trash2, ShieldAlert, Sparkles, 
  CheckCircle2, AlertCircle, RefreshCw, Send, Loader2, X, AlertTriangle, CheckSquare
} from 'lucide-react';



export default function OcrUpload() {
  const navigate = useNavigate();
  const { ocrDocuments, setOcrDocuments, addOcrDocument, logAudit } = useWarehouse();
  const { user } = useAuth();
  
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeFileId, setActiveFileId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [apiOfflineWarning, setApiOfflineWarning] = useState('');
  const [rawOcrDebugData, setRawOcrDebugData] = useState(null);
  const [processingStartTime, setProcessingStartTime] = useState(null);
  
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
      // Check if we can re-associate with an existing document of the same filename that is missing a file object
      const matchingRestoredDoc = ocrDocuments.find(d => 
        d.fileName === file.name && 
        !(d.fileObject instanceof File || d.fileObject instanceof Blob)
      );

      if (matchingRestoredDoc) {
        setOcrDocuments(prev => prev.map(d => 
          d.id === matchingRestoredDoc.id 
            ? { ...d, fileObject: file, status: 'OCR_UPLOADED' } 
            : d
        ));
        setActiveFileId(matchingRestoredDoc.id);
        addedCount++;
        return;
      }

      const newId = `OCR-${Math.floor(100 + Math.random() * 900)}`;
      const newDoc = {
        id: newId,
        fileName: file.name,
        fileObject: file, // Keep actual file for API call
        documentType: 'Invoice',
        supplierName: '',
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.email || 'inventory@warehouseai.com',
        status: 'OCR_UPLOADED',
        confidenceScore: 0,
        extractedItems: [
          {
            id: `EXT-${Date.now()}-${Math.floor(Math.random()*100)}`,
            sku: '',
            productName: file.name.split('.')[0].replace(/[-_]/g, ' '),
            category: '',
            quantity: 0,
            uom: 'BOX',
            length: '',
            width: '',
            height: '',
            weight: '',
            batchNumber: '',
            expiryDate: '',
            confidenceScore: 0,
            validationStatus: 'Warning'
          }
        ],
        warnings: 0,
        warningsList: []
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

  const handleProcess = async () => {
    const activeDoc = ocrDocuments.find(d => d.id === activeFileId);
    if (!activeDoc) {
      showToast('No document selected.', 'warning');
      return;
    }

    const hasRealFile = activeDoc.fileObject instanceof File || activeDoc.fileObject instanceof Blob;

    console.log("[OCR Button] Process Selected clicked. Logs before setting OCR_PROCESSING:");
    console.log("- activeDoc.id:", activeDoc.id);
    console.log("- hasRealFile:", hasRealFile);
    if (hasRealFile) {
      console.log("- file constructor:", activeDoc.fileObject.constructor.name);
      console.log("- file name:", activeDoc.fileObject.name);
      console.log("- file size:", activeDoc.fileObject.size);
    }

    if (!hasRealFile) {
      showToast("Please re-select the file before processing. Browser cannot restore uploaded files after refresh.", "warning");
      // Keep status as OCR_UPLOADED, do not set OCR_PROCESSING, do not show stuck state
      setOcrDocuments(prev => prev.map(d => d.id === activeFileId ? { ...d, status: 'OCR_UPLOADED' } : d));
      setProcessing(false);
      return;
    }

    if (
      activeDoc.status !== 'OCR_UPLOADED' &&
      activeDoc.status !== 'ERROR' &&
      activeDoc.status !== 'PARSING' &&
      activeDoc.status !== 'parsing' &&
      activeDoc.status !== 'processing' &&
      activeDoc.status !== 'OCR_PROCESSING'
    ) {
      showToast('Document already processed.', 'warning');
      return;
    }

    setProcessing(true);
    setProcessingStartTime(Date.now());
    console.log("[OCR Flow] Starting handleProcess. Current activeDoc.status:", activeDoc.status, "processing state:", true);
    setOcrDocuments(prev => prev.map(d => d.id === activeFileId ? { ...d, status: 'OCR_PROCESSING' } : d));
    setRawOcrDebugData(null); // Clear previous debug data

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn("[OCR Flow] 90s timeout reached, aborting OCR request...");
      controller.abort();
    }, 90000);

    // 1. Optional Django/backend sync try/catch
    try {
      console.log("[OCR] Optional backend sync started");
      console.warn("[OCR Upload] Saving file to Django BE via /api/ocr/upload/");
      const djangoRes = await uploadOcrDocumentDjangoApi(activeDoc.fileObject);
      if (djangoRes?.skipped) {
        showToast("Backend login token missing. Django OCR sync skipped.", "warning");
      }
    } catch (djangoErr) {
      console.error("[OCR] Optional backend sync failed:", djangoErr);
      showToast("Django backend save failed. Extraction will continue locally.", "warning");
    }

    // 2. OCR extraction try/catch
    let res = null;
    try {
      console.log("[OCR] Extract request started");
      console.log("[OCR Flow] Before calling processOcrDocument for file:", activeDoc.fileName);
      res = await processOcrDocument(activeDoc.fileObject, { signal: controller.signal });
      clearTimeout(timeoutId);
      console.log("[OCR] Extract success raw response:", res);
    } catch (extractErr) {
      clearTimeout(timeoutId);
      console.error('[OCR Flow Error] API failure:', extractErr);
      
      const isTimeout = extractErr.name === 'AbortError' || extractErr.message.includes('timeout');
      const errorMsg = isTimeout 
        ? "OCR request completed slowly. Please retry."
        : `OCR processing error: ${extractErr.message}`;
      
      showToast(errorMsg, 'error');
      setApiOfflineWarning(errorMsg);

      console.log("[OCR Flow] Setting document status to ERROR");
      setOcrDocuments(prev => prev.map(d => d.id === activeFileId ? { 
        ...d, 
        status: 'ERROR',
        warnings: 1,
        warningsList: [errorMsg]
      } : d));
      setProcessing(false);
      setProcessingStartTime(null);
      return;
    }

    // 3. Normalization try/catch
    let normalized = null;
    try {
      normalized = normalizeOcrResponse(res, activeDoc);
      console.log("[OCR] Normalize success:", normalized);
      if (!normalized.mappedItems || normalized.mappedItems.length === 0) {
        throw new Error("No products found in OCR response products list.");
      }
    } catch (mapperError) {
      console.error("[OCR] Normalize failed:", mapperError);
      setRawOcrDebugData(res);
      
      const fallbackItems = [
        {
          id: `EXT-${Date.now()}-fallback`,
          sku: '',
          productName: activeDoc.fileName.split('.')[0].replace(/[-_]/g, ' '),
          category: 'General',
          quantity: 1,
          uom: 'BOX',
          length: '',
          width: '',
          height: '',
          weight: '',
          batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
          expiryDate: '2028-12-31',
          confidenceScore: 50,
          validationStatus: 'Warning',
          storageType: 'GENERAL',
          isFragile: false,
          isStackable: true
        }
      ];

      setOcrDocuments(prev => prev.map(d => 
        d.id === activeFileId 
          ? {
              ...d,
              status: 'VERIFICATION_PENDING',
              confidenceScore: 50,
              extractedItems: fallbackItems,
              supplierName: 'MANUAL_REVIEW',
              documentType: 'Invoice',
              totalAmount: '',
              taxAmount: '',
              fileName: activeDoc.fileName,
              warnings: 1,
              warningsList: [`Normalization/Mapper error: ${mapperError.message}. Ready for manual review.`]
            } 
          : d
      ));

      localStorage.setItem('latestProcessedDocId', activeFileId);
      showToast('OCR response normalization failed. Document marked for Manual Review.', 'warning');
      setProcessing(false);
      setProcessingStartTime(null);
      return;
    }

    console.log("[OCR Flow] Before setting OCR document state to VERIFICATION_PENDING with ID:", activeFileId);
    setOcrDocuments(prev => prev.map(d => 
      d.id === activeFileId 
        ? {
            ...d,
            id: d.id, // Keep the uploaded ID (e.g. OCR-117)
            documentNumber: normalized.documentNumber, // Attach normalized document number (e.g. INV-2026-1001)
            status: 'VERIFICATION_PENDING',
            confidenceScore: normalized.confidenceScore,
            extractedItems: normalized.mappedItems,
            supplierName: normalized.supplierName,
            documentType: normalized.documentType,
            totalAmount: normalized.totalAmount,
            taxAmount: normalized.taxAmount,
            fileName: activeDoc.fileName, // Keep actual uploaded file name
            warnings: 0,
            warningsList: []
          } 
        : d
    ));
    
    console.log("[OCR Flow] Final document status after mapping: VERIFICATION_PENDING");
    localStorage.setItem('latestProcessedDocId', activeFileId);

    showToast('OCR analysis completed successfully! Ready for verification.');

    logAudit(
      user?.email || 'inventory@warehouseai.com',
      user?.role || 'RECEIVING_INVENTORY_OFFICER',
      'OCR_DOCUMENT_PROCESS',
      'Inbound OCR',
      `Processed document ${activeDoc.fileName} using WMS Neural OCR Engine.`
    );
    setProcessing(false);
    setProcessingStartTime(null);
  };

  const activeFile = ocrDocuments.find(f => f.id === activeFileId);
  const totalFiles = ocrDocuments.length;
  const pendingCount = ocrDocuments.filter(f => f.status === 'OCR_UPLOADED').length;
  const processingCount = ocrDocuments.filter(f => f.status === 'OCR_PROCESSING').length;
  const verificationPendingCount = ocrDocuments.filter(f => f.status === 'VERIFICATION_PENDING').length;
  const verifiedCount = ocrDocuments.filter(f => f.status === 'VERIFIED').length;

  // Watchdog timer to prevent infinite loading of OCR_PROCESSING status
  useEffect(() => {
    const isSpinnerActive = activeFile && (
      activeFile.status === 'OCR_PROCESSING' || 
      activeFile.status === 'PARSING' || 
      activeFile.status === 'parsing' || 
      activeFile.status === 'processing'
    );
    if (isSpinnerActive) {
      console.log(`[Watchdog] Active document ${activeFile.id} entered spinner state (${activeFile.status}). Starting 90s watchdog timer.`);
      const timer = setTimeout(() => {
        console.warn(`[Watchdog] 90s timeout reached for document ${activeFile.id}. Force stopping spinner and setting status to ERROR.`);
        
        setOcrDocuments(prev => prev.map(d => 
          d.id === activeFile.id 
            ? { 
                ...d, 
                status: 'ERROR',
                warnings: 1,
                warningsList: ['Watchdog timeout: The OCR extraction process timed out after 90 seconds.']
              } 
            : d
        ));
        setProcessing(false);
        showToast("OCR request completed slowly or response mapping failed. Please retry or check OCR response.", "danger");
      }, 90000);

      return () => {
        console.log(`[Watchdog] Clearing watchdog timer for document ${activeFile.id} (exited spinner state).`);
        clearTimeout(timer);
      };
    }
  }, [activeFileId, activeFile?.status]);

  const isSpinnerVisible = !!(processing && activeFile && (
    activeFile.status === 'OCR_PROCESSING' || 
    activeFile.status === 'PARSING' || 
    activeFile.status === 'parsing' || 
    activeFile.status === 'processing'
  ));

  const isStuck = !!(activeFile && (
    activeFile.status === 'OCR_PROCESSING' || 
    activeFile.status === 'PARSING' || 
    activeFile.status === 'parsing' || 
    activeFile.status === 'processing'
  ) && (!processing || (processingStartTime && Date.now() - processingStartTime > 90000)));

  console.log("[OCR Render Log] activeFile.id:", activeFile?.id, "activeFile.status:", activeFile?.status, "processing:", processing, "isSpinnerVisible:", isSpinnerVisible);

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

      {apiOfflineWarning && (
        <AlertBanner 
          type="warning" 
          title="Service Connection Warning" 
          message={apiOfflineWarning} 
        />
      )}

      {rawOcrDebugData && (
        <Card className="border border-red-200 bg-red-50/50 p-4 rounded-2xl">
          <CardHeader className="pb-2 flex justify-between items-center">
            <CardTitle className="text-xs uppercase font-bold text-red-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-650" />
              OCR Debug: Unexpected Response Shape
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7 text-red-700 border-red-200 hover:bg-red-50 bg-white font-semibold"
              onClick={() => setRawOcrDebugData(null)}
            >
              Clear Debug
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-red-700 font-semibold">
              The OCR API returned a 200 OK, but the response did not match the expected structure. Below is the raw response received:
            </p>
            <pre className="p-3 bg-slate-900 text-green-400 rounded-lg text-[10px] font-mono overflow-auto max-h-40 select-all">
              {JSON.stringify(rawOcrDebugData, null, 2)}
            </pre>
          </CardContent>
        </Card>
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
            <Input 
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
                    disabled={processing || !activeFile || (activeFile.status !== 'OCR_UPLOADED' && activeFile.status !== 'ERROR')}
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
                    Clear OCR Queue
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
                        {(f.status === 'OCR_PROCESSING' || f.status === 'PARSING' || f.status === 'parsing' || f.status === 'processing') && (
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
                        {f.status === 'ERROR' && (
                          <Badge variant="danger" className="text-[9px]">Error</Badge>
                        )}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(f.id);
                          }}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: OCR Extraction Details Preview */}
          <div className="lg:col-span-2">            {activeFile ? (
              <Card className={`border border-gray-100 shadow-sm transition-all h-full ${
                activeFile?.status === 'OCR_UPLOADED' ? 'border-dashed' : ''
              }`}>
                <CardHeader className="border-b border-gray-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                      OCR Data Preview Panel
                    </CardTitle>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{activeFile?.fileName}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeFile?.status === 'OCR_UPLOADED' && (
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
                    {activeFile?.status === 'VERIFICATION_PENDING' && (
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/ocr-verification', { state: { documentId: activeFile?.id } })}
                        className="text-xs h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        <CheckSquare className="w-3 h-3" />
                        Verify Extracted Data
                      </Button>
                    )}
                    {activeFile?.status === 'VERIFIED' && (
                      <Badge variant="success" className="bg-emerald-600 text-white font-bold text-[10px]">
                        Receipt Verified
                      </Badge>
                    )}
                    {activeFile?.status === 'ERROR' && (
                      <Badge variant="danger" className="bg-red-650 text-white font-bold text-[10px]">
                        Failed
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {/* Status: Uploaded */}
                  {activeFile?.status === 'OCR_UPLOADED' && (
                    <div className="py-16 flex flex-col items-center justify-center text-center text-gray-400 space-y-3">
                      <FileText className="w-12 h-12 text-gray-300" />
                      {!(activeFile?.fileObject instanceof File || activeFile?.fileObject instanceof Blob) ? (
                        <>
                          <h3 className="font-bold text-sm text-red-650">File Binary Missing</h3>
                          <p className="text-xs text-red-500 max-w-sm">
                            Please re-select the file before processing. Browser cannot restore uploaded files after refresh.
                          </p>
                          <Button size="sm" onClick={handleButtonClick} className="mt-2">
                            Re-select File
                          </Button>
                        </>
                      ) : (
                        <>
                          <h3 className="font-bold text-sm text-gray-800">Document Uploaded</h3>
                          <p className="text-xs text-gray-500 max-w-sm">
                            Please click the <strong>Process manifest</strong> button to parse and extract tabular data.
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Status: Processing Spinner */}
                  {isSpinnerVisible && (
                    <div className="py-16 flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                      <h3 className="font-bold text-sm text-gray-800">Neural OCR Engine Extracting...</h3>
                      <p className="text-xs text-slate-400 animate-pulse">Running document bounding grid alignments...</p>
                    </div>
                  )}

                  {/* Status: Stuck Processing */}
                  {isStuck && (
                    <div className="py-16 flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                      <AlertTriangle className="w-12 h-12 text-amber-500 animate-bounce" />
                      <h3 className="font-bold text-sm text-amber-800">Processing Interrupted or Stuck</h3>
                      <p className="text-xs text-slate-500 max-w-md">
                        This document status is marked as processing, but no extraction is active. You can reset the status and try again.
                      </p>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setOcrDocuments(prev => prev.map(d => d.id === activeFile.id ? { ...d, status: 'OCR_UPLOADED' } : d));
                          setRawOcrDebugData(null);
                          setProcessing(false);
                          showToast('Document status reset to Uploaded.', 'info');
                        }} 
                        className="mt-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset Stuck Processing
                      </Button>
                    </div>
                  )}

                  {/* Status: ERROR */}
                  {activeFile?.status === 'ERROR' && (
                    <div className="py-16 flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                      <AlertTriangle className="w-12 h-12 text-red-500" />
                      <h3 className="font-bold text-sm text-red-800">OCR Processing Failed</h3>
                      <p className="text-xs text-slate-500 max-w-md">
                        {activeFile?.warningsList?.[0] || "OCR request completed slowly or response mapping failed. Please retry or check OCR response."}
                      </p>
                      {rawOcrDebugData && (
                        <div className="w-full max-w-lg mt-4 text-left">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Raw OCR Response Details:</span>
                          <pre className="p-3 bg-slate-900 text-green-400 rounded-lg text-[10px] font-mono overflow-auto max-h-40 select-all">
                            {JSON.stringify(rawOcrDebugData, null, 2)}
                          </pre>
                        </div>
                      )}
                      <Button size="sm" onClick={handleProcess} disabled={processing} className="mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1">
                        <RefreshCw className={`w-3.5 h-3.5 ${processing ? 'animate-spin' : ''}`} />
                        {processing ? 'Retrying...' : 'Retry OCR Processing'}
                      </Button>
                    </div>
                  )}

                  {/* Status: VERIFICATION_PENDING or VERIFIED or REJECTED */}
                  {(activeFile?.status === 'VERIFICATION_PENDING' || activeFile?.status === 'VERIFIED' || activeFile?.status === 'REJECTED') && activeFile?.extractedItems && activeFile?.extractedItems.length > 0 && (
                    <div className="space-y-6">
                      
                      {/* Document Confidence & Validation Warnings */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="text-[9px] text-gray-400 font-bold uppercase block">Validation Status</span>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              activeFile?.status === 'VERIFIED' ? 'bg-green-500' : activeFile?.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'
                            }`}></span>
                            <span className="text-xs font-bold text-gray-800">
                              {activeFile?.status === 'VERIFIED' ? 'Verified' : activeFile?.status === 'REJECTED' ? 'Rejected' : 'Pending Verification'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl md:col-span-2">
                          <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase">
                            <span>OCR Confidence Score</span>
                            <span className={
                              activeFile?.confidenceScore > 90 ? 'text-green-600' : 'text-amber-600'
                            }>{activeFile?.confidenceScore}%</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div 
                              className={`h-1.5 rounded-full ${
                                activeFile?.confidenceScore > 90 ? 'bg-green-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${activeFile?.confidenceScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Redirect Banner for Verification Pending */}
                      {activeFile?.status === 'VERIFICATION_PENDING' && (
                        <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-blue-800">Manual Verification Required</h4>
                            <p className="text-[11px] text-blue-600 mt-0.5">Please review the parsed entity records, correct any OCR bounding box mismatches, and confirm to generate an inbound receipt.</p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => navigate('/ocr-verification', { state: { documentId: activeFile?.id } })}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shrink-0 flex items-center gap-1.5"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            Open Verification Form
                          </Button>
                        </div>
                      )}

                      {/* Warnings list */}
                      {activeFile?.warningsList && activeFile?.warningsList.length > 0 && (
                        <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1.5">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            Extraction Warnings Detected
                          </h4>
                          <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-700 font-medium">
                            {activeFile?.warningsList.map((warn, i) => (
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
                            <span className="text-gray-900 font-bold">{activeFile?.documentType}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-medium">Document ID Number</span>
                            <span className="text-gray-900 font-mono font-bold">{activeFile?.documentNumber || activeFile?.id}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-medium">Supplier Entity</span>
                            <span className="text-gray-900 font-bold">{activeFile?.supplierName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-medium">Uploader Email</span>
                            <span className="text-gray-900 font-mono">{activeFile?.uploadedBy}</span>
                          </div>
                          
                          <div className="col-span-full border-t border-slate-100 my-1 pt-3 font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                            Product Extracted Manifest Line Items
                          </div>
 
                          {activeFile?.extractedItems?.map((item, index) => (
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

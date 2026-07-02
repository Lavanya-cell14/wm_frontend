import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import { AlertBanner, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, StatCard, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import { 
  Box, 
  Activity, 
  RefreshCw,
  UploadCloud,
  CheckSquare,
  FileText,
  AlertTriangle,
  Package,
  Layers,
  Sparkles,
  ClipboardList,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { uploadOcrDocumentDjangoApi, fetchOcrDocumentApi, normalizeOcrResponse } from '../../services/ocrService';

export default function ClerkDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    inventory = [], 
    ocrDocuments = [], 
    inboundReceipts = [],
    aiRecommendations = [],
    addOcrDocument,
    setOcrDocuments
  } = useWarehouse();

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleCardClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    showToast(`Uploading ${file.name}...`, 'info');

    let backendDocId = null;
    const tempId = `OCR-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Upload to Django backend — Django proxies to OCR service via OCR_SERVICE_URL
    let res = null;
    try {
      const djangoRes = await uploadOcrDocumentDjangoApi(file);
      if (djangoRes?.document_id) {
        backendDocId = djangoRes.document_id;
        console.log("[Dashboard Upload] Django upload succeeded. Doc ID:", backendDocId);

        // 2. Fetch extracted data from Django backend
        const docDetails = await fetchOcrDocumentApi(backendDocId);
        if (docDetails?.extracted_json) {
          res = docDetails.extracted_json;
        } else {
          throw new Error("Django backend returned no extracted data. Check OCR service logs.");
        }
      } else {
        throw new Error("Django backend did not return a document ID.");
      }
    } catch (err) {
      console.warn("[Dashboard Upload] Django OCR pipeline failed, using manual review fallback:", err);
      res = null;
    }

    const usedId = backendDocId || tempId;

    // 3. Normalization
    try {
      if (!res) throw new Error("No OCR data returned from backend.");
      const normalized = normalizeOcrResponse(res, { fileName: file.name, id: usedId });
      
      // 4. Construct OCR Document object
      const newDoc = {
        id: usedId,
        fileName: file.name,
        fileObject: file,
        documentType: normalized.documentType || 'Invoice',
        supplierName: normalized.supplierName || 'Unknown Supplier',
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.email || 'inventory@warehouseai.com',
        status: 'VERIFICATION_PENDING',
        confidenceScore: normalized.confidenceScore || 95,
        extractedItems: normalized.mappedItems || [],
        warnings: 0,
        warningsList: []
      };

      addOcrDocument(newDoc);
      showToast("OCR manifest processed successfully!", "success");
      
      // Redirect to verification form with the backend doc id
      setTimeout(() => {
        navigate('/inventory/ocr-review', { state: { documentId: usedId } });
      }, 1200);

    } catch (err) {
      console.error("[Dashboard Upload] OCR extraction failed:", err);
      
      // Fallback manual review
      const fallbackItems = [
        {
          id: `EXT-${Date.now()}-fallback`,
          sku: '',
          productName: file.name.split('.')[0].replace(/[-_]/g, ' '),
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

      const fallbackDoc = {
        id: usedId,
        fileName: file.name,
        fileObject: file,
        documentType: 'Invoice',
        supplierName: 'MANUAL_REVIEW',
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.email || 'inventory@warehouseai.com',
        status: 'VERIFICATION_PENDING',
        confidenceScore: 50,
        extractedItems: fallbackItems,
        warnings: 1,
        warningsList: [`Extraction failed: ${err.message}. Ready for manual review.`]
      };

      addOcrDocument(fallbackDoc);
      showToast("Extraction failed. Document marked for Manual Review.", "warning");
      
      setTimeout(() => {
        navigate('/inventory/ocr-review', { state: { documentId: usedId } });
      }, 1200);
    } finally {
      setUploading(false);
    }
  };

  // Calculations for KPIs memoized with useMemo
  const kpis = useMemo(() => {
    const todayUploads = ocrDocuments.length;
    const pendingReviews = ocrDocuments.filter(d => d.status === 'VERIFICATION_PENDING').length;
    const approvedDocs = ocrDocuments.filter(d => d.status === 'VERIFIED').length;
    const rejectedDocs = ocrDocuments.filter(d => d.status === 'REJECTED').length;
    const completedDocs = inboundReceipts.filter(r => r.status === 'STORED').length;
    
    const totalProducts = inventory.length;
    const totalStock = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const reservedStock = inventory.reduce((sum, item) => sum + (item.reserved || 0), 0);
    const damagedStock = inventory.reduce((sum, item) => sum + (item.damaged || 0), 0);
    const availableStock = Math.max(0, totalStock - reservedStock - damagedStock);

    const pendingAllocations = inboundReceipts.filter(r => 
      ['WAITING_FOR_BIN_ASSIGNMENT', 'BIN_SUGGESTED', 'BIN_ALLOCATED', 'ASSIGNED_TO_STAFF', 'IN_PROGRESS'].includes(r.status)
    ).length;

    const lowStockCount = inventory.filter(item => (item.quantity || 0) <= (item.reorderLevel || 0) && (item.quantity || 0) > 0).length;
    const outOfStockCount = inventory.filter(item => (item.quantity || 0) === 0).length;

    const ocrProcessing = ocrDocuments.filter(d => d.status === 'OCR_PROCESSING').length;
    const ocrUploaded = ocrDocuments.filter(d => d.status === 'OCR_UPLOADED').length;

    return {
      todayUploads,
      pendingReviews,
      approvedDocs,
      rejectedDocs,
      completedDocs,
      totalProducts,
      totalStock,
      reservedStock,
      damagedStock,
      availableStock,
      pendingAllocations,
      lowStockCount,
      outOfStockCount,
      ocrProcessing,
      ocrUploaded
    };
  }, [inventory, ocrDocuments, inboundReceipts]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-[#0071C1]" />
            Receiving & Inventory Officer Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage OCR processing, product records, inventory status, storage recommendations, and bin allocations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-xs font-semibold" onClick={() => showToast('Dashboard statistics updated!')}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh State
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Today's Uploads" 
          value={kpis.todayUploads} 
          icon={UploadCloud} 
          subtitle="Manifest files added" 
          onClick={() => navigate('/inventory/ocr-center')}
        />
        <StatCard 
          title="Pending Reviews" 
          value={kpis.pendingReviews} 
          icon={CheckSquare} 
          subtitle="Awaiting officer confirm" 
          onClick={() => navigate('/inventory/ocr-review')}
        />
        <StatCard 
          title="Approved Docs" 
          value={kpis.approvedDocs} 
          icon={FileText} 
          subtitle="Receipts generated" 
          onClick={() => navigate('/inventory/ocr-history')}
        />
        <StatCard 
          title="Rejected Docs" 
          value={kpis.rejectedDocs} 
          icon={AlertTriangle} 
          subtitle="Quarantined filings" 
          onClick={() => navigate('/inventory/ocr-history')}
        />
        <StatCard 
          title="Completed Docs" 
          value={kpis.completedDocs} 
          icon={FileText} 
          subtitle="Manifests stored" 
          onClick={() => navigate('/inventory/ocr-history')}
        />
      </div>

      {/* Main content grids */}
      <div className="space-y-6">
        {/* Row of 3 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* OCR Processing Summary */}
          <Card className="border border-gray-100 shadow-sm h-full flex flex-col">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-bold text-gray-800">OCR Processing Summary</CardTitle>
              <CardDescription>Intake documents state metrics.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-3 text-center text-xs font-bold text-slate-800 flex-grow">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="text-sm font-black">{kpis.ocrProcessing + kpis.ocrUploaded}</div>
                <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Processing</div>
              </div>
              <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-700">
                <div className="text-sm font-black">{kpis.pendingReviews}</div>
                <div className="text-[9px] text-amber-500 font-bold uppercase mt-0.5">Review Required</div>
              </div>
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
                <div className="text-sm font-black">{kpis.approvedDocs}</div>
                <div className="text-[9px] text-emerald-500 font-bold uppercase mt-0.5">Approved</div>
              </div>
              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700">
                <div className="text-sm font-black">{kpis.rejectedDocs}</div>
                <div className="text-[9px] text-rose-500 font-bold uppercase mt-0.5">Rejected</div>
              </div>
              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 col-span-2">
                <div className="text-sm font-black">{kpis.completedDocs}</div>
                <div className="text-[9px] text-blue-500 font-bold uppercase mt-0.5">Completed (Fully Stored)</div>
              </div>
            </CardContent>
          </Card>

          {/* Product & Inventory Summary */}
          <Card className="border border-gray-100 shadow-sm h-full flex flex-col">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-bold text-gray-800">Product & Inventory Summary</CardTitle>
              <CardDescription>Consolidated stock ledger balances.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-3 text-center text-xs font-bold text-slate-800 flex-grow">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="text-sm font-black">{kpis.totalProducts}</div>
                <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Total Products</div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="text-sm font-black">{kpis.totalStock}</div>
                <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Total Inventory</div>
              </div>
              <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 col-span-2 sm:col-span-1">
                <div className="text-sm font-black">{kpis.lowStockCount}</div>
                <div className="text-[9px] text-amber-500 font-bold uppercase mt-0.5">Low Stock</div>
              </div>
              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 col-span-2 sm:col-span-1">
                <div className="text-sm font-black">{kpis.outOfStockCount}</div>
                <div className="text-[9px] text-rose-500 font-bold uppercase mt-0.5">Out of Stock</div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Manifest Card */}
          <Card 
            className="border border-gray-150 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 h-full flex flex-col"
            style={{ borderTop: '4px solid #3b82f6' }}
            onClick={handleCardClick}
          >
            <CardContent className="p-5 flex-grow flex flex-col justify-between">
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
              />
              
              <div>
                {/* Top Row: Icon on Left, Total Count on Right */}
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-[#0071C1] flex items-center justify-center">
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-[#0071C1]" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-[#0071C1]" />
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800 leading-none">{kpis.todayUploads}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Total</div>
                  </div>
                </div>

                {/* Middle: Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Upload Manifest</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Upload new inbound invoices, cargo packing slips, or bills of lading to extract data.
                  </p>
                </div>
              </div>

              {/* Bottom: Configure Queue Link */}
              <div className="mt-5 pt-1">
                <span 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the file upload input
                    navigate('/inventory/inbound');
                  }}
                  className="inline-flex items-center text-xs font-semibold text-[#0071C1] hover:text-blue-700 hover:underline gap-1 transition-colors cursor-pointer"
                >
                  Configure Queue <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent OCR Documents (Full Width) */}
        <Card className="border border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-gray-100 pb-3">
            <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <FileText className="w-4.5 h-4.5 text-[#0071C1]" />
              Recent OCR Documents
            </CardTitle>
            <CardDescription>Intake filings parser pipeline ledger.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead className="text-center">Confidence Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Uploaded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ocrDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">No documents uploaded.</TableCell>
                  </TableRow>
                ) : (
                  ocrDocuments.slice(0, 4).map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="font-bold text-gray-900 text-xs">{doc.fileName}</div>
                        <div className="text-[9px] text-gray-400 font-mono">{doc.id}</div>
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs font-semibold">{doc.documentType || 'Invoice'}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={doc.confidenceScore >= 90 ? 'success' : 'warning'} className="text-[10px] font-bold">
                          {doc.confidenceScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          doc.status === 'VERIFIED' ? 'success' : 
                          doc.status === 'REJECTED' ? 'error' : 'warning'
                        } className="text-[9px] uppercase font-bold">
                          {doc.status === 'VERIFIED' ? 'Approved' : doc.status === 'REJECTED' ? 'Rejected' : 'Review Required'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs">{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-gray-400 font-mono text-[10px] truncate max-w-[100px]">{doc.uploadedBy}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

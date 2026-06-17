import React, { useState } from 'react';
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
  ClipboardList
} from 'lucide-react';

export default function ClerkDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    inventory = [], 
    ocrDocuments = [], 
    inboundReceipts = [],
    aiRecommendations = []
  } = useWarehouse();

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Calculations for KPIs
  const todayUploads = ocrDocuments.length || 6;
  const pendingReviews = ocrDocuments.filter(d => d.status === 'VERIFICATION_PENDING').length;
  const approvedDocs = ocrDocuments.filter(d => d.status === 'VERIFIED').length || 4;
  const rejectedDocs = ocrDocuments.filter(d => d.status === 'REJECTED').length || 1;
  const completedDocs = inboundReceipts.filter(r => r.status === 'STORED').length || 2;
  
  const totalProducts = inventory.length;
  const totalStock = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const reservedStock = inventory.reduce((sum, item) => sum + (item.reserved || 0), 0);
  const damagedStock = inventory.reduce((sum, item) => sum + (item.damaged || 0), 0);
  const availableStock = Math.max(0, totalStock - reservedStock - damagedStock);

  const pendingAllocations = inboundReceipts.filter(r => 
    ['WAITING_FOR_BIN_ASSIGNMENT', 'BIN_SUGGESTED', 'ASSIGNED_TO_STAFF', 'IN_PROGRESS'].includes(r.status)
  ).length;

  const lowStockCount = inventory.filter(item => (item.quantity || 0) <= (item.reorderLevel || 0) && (item.quantity || 0) > 0).length;
  const outOfStockCount = inventory.filter(item => (item.quantity || 0) === 0).length;

  // OCR summary state counts
  const ocrProcessing = ocrDocuments.filter(d => d.status === 'OCR_PROCESSING').length;
  const ocrUploaded = ocrDocuments.filter(d => d.status === 'OCR_UPLOADED').length;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <StatCard title="Today's Uploads" value={todayUploads} icon={UploadCloud} subtitle="Manifest files added" />
        <StatCard title="Pending Reviews" value={pendingReviews} icon={CheckSquare} subtitle="Awaiting officer confirm" />
        <StatCard title="Approved Docs" value={approvedDocs} icon={FileText} subtitle="Receipts generated" />
        <StatCard title="Rejected Docs" value={rejectedDocs} icon={AlertTriangle} subtitle="Quarantined filings" />
        <StatCard title="Completed Docs" value={completedDocs} icon={FileText} subtitle="Manifests stored" />
        <StatCard title="Total Products" value={totalProducts} icon={Box} subtitle="Unique SKUs active" />
        <StatCard title="Available Stock" value={availableStock} icon={Box} subtitle="Total free units" />
        <StatCard title="Pending Allocations" value={pendingAllocations} icon={Activity} subtitle="Inbound placements queue" />
      </div>

      {/* Main content grids */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (OCR summary, Recent OCR, Product Summary) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Section 1: OCR Processing Summary & Product Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* OCR Summary */}
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-gray-100 pb-3">
                <CardTitle className="text-sm font-bold text-gray-800">OCR Processing Summary</CardTitle>
                <CardDescription>Intake documents state metrics.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-2 gap-3 text-center text-xs font-bold text-slate-800">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-sm font-black">{ocrProcessing + ocrUploaded}</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Processing</div>
                </div>
                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-700">
                  <div className="text-sm font-black">{pendingReviews}</div>
                  <div className="text-[9px] text-amber-500 font-bold uppercase mt-0.5">Review Required</div>
                </div>
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
                  <div className="text-sm font-black">{approvedDocs}</div>
                  <div className="text-[9px] text-emerald-500 font-bold uppercase mt-0.5">Approved</div>
                </div>
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700">
                  <div className="text-sm font-black">{rejectedDocs}</div>
                  <div className="text-[9px] text-rose-500 font-bold uppercase mt-0.5">Rejected</div>
                </div>
                <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 col-span-2">
                  <div className="text-sm font-black">{completedDocs}</div>
                  <div className="text-[9px] text-blue-500 font-bold uppercase mt-0.5">Completed (Fully Stored)</div>
                </div>
              </CardContent>
            </Card>

            {/* Product & Inventory Summary */}
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-gray-100 pb-3">
                <CardTitle className="text-sm font-bold text-gray-800">Product & Inventory Summary</CardTitle>
                <CardDescription>Consolidated stock ledger balances.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-2 gap-3 text-center text-xs font-bold text-slate-800">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-sm font-black">{totalProducts}</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Total Products</div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-sm font-black">{totalStock}</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Total Inventory</div>
                </div>
                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 col-span-2 sm:col-span-1">
                  <div className="text-sm font-black">{lowStockCount}</div>
                  <div className="text-[9px] text-amber-500 font-bold uppercase mt-0.5">Low Stock</div>
                </div>
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 col-span-2 sm:col-span-1">
                  <div className="text-sm font-black">{outOfStockCount}</div>
                  <div className="text-[9px] text-rose-500 font-bold uppercase mt-0.5">Out of Stock</div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Section 2: Recent OCR Documents Table */}
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

        {/* Right Column (Quick Actions & Recommendations/Allocations Previews) */}
        <div className="space-y-6">
          
          {/* Quick Actions Shortcuts */}
          <Card className="border border-gray-150 shadow-sm bg-gradient-to-b from-[#F9FCFF] to-white">
            <CardHeader className="border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                Officer Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button className="w-full text-xs justify-center" onClick={() => navigate('/inventory/ocr-center')}>OCR Processing Hub</Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="text-xs justify-center" onClick={() => navigate('/inventory/products')}>Products Catalog</Button>
                <Button variant="outline" className="text-xs justify-center" onClick={() => navigate('/inventory/inventory')}>Stock Balances</Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Recommendation Monitor Preview */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-bold text-gray-800">Recommendation Monitor Preview</CardTitle>
              <CardDescription>Latest placement slotting suggestions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                <TableHeader className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px]">
                  <TableRow>
                    <TableHead className="p-3">Product</TableHead>
                    <TableHead className="p-3">Zone/ZG</TableHead>
                    <TableHead className="p-3 text-center">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                  {aiRecommendations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-gray-500">No proposals recorded.</TableCell>
                    </TableRow>
                  ) : (
                    aiRecommendations.slice(0, 3).map((rec) => {
                      const recommendedZg = rec.zone === 'Zone D' ? 'Cold Storage' : 'Ambient';
                      return (
                        <TableRow key={rec.id} className="hover:bg-slate-50/10">
                          <TableCell className="p-3">
                            <div className="font-bold text-gray-900 text-[11px] truncate max-w-[120px]">{rec.productName}</div>
                            <div className="text-[9px] text-gray-400 font-mono">{rec.sku}</div>
                          </TableCell>
                          <TableCell className="p-3 text-gray-500 font-semibold text-[11px]">{rec.zone} ({recommendedZg})</TableCell>
                          <TableCell className="p-3 text-center">
                            <Badge variant={rec.confidence >= 90 ? 'success' : 'warning'} className="font-mono font-bold text-[9px]">
                              {rec.confidence}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Section 5: Allocation Monitor Preview */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-bold text-gray-800">Allocation Monitor Preview</CardTitle>
              <CardDescription>Real-time slotting transit stages.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                <TableHeader className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px]">
                  <TableRow>
                    <TableHead className="p-3">Product</TableHead>
                    <TableHead className="p-3">Bin Code</TableHead>
                    <TableHead className="p-3">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                  {inboundReceipts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-gray-500">No active allocations.</TableCell>
                    </TableRow>
                  ) : (
                    inboundReceipts.slice(0, 3).map((r) => {
                      const rec = aiRecommendations.find(a => a.inboundId === r.id) || {};
                      const bin = r.bin || rec.bin || 'Pending';
                      
                      let statusLabel = 'Allocated';
                      let statusVariant = 'primary';
                      if (r.status === 'STORED') {
                        statusLabel = 'Stored';
                        statusVariant = 'success';
                      } else if (r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED_TO_STAFF') {
                        statusLabel = 'In Progress';
                        statusVariant = 'warning';
                      }

                      return (
                        <TableRow key={r.id} className="hover:bg-slate-50/10">
                          <TableCell className="p-3">
                            <div className="font-bold text-gray-900 text-[11px] truncate max-w-[120px]">{r.productName}</div>
                            <div className="text-[9px] text-gray-400 font-mono">{r.sku}</div>
                          </TableCell>
                          <TableCell className="p-3 font-mono text-[11px] text-blue-700 font-bold">{bin}</TableCell>
                          <TableCell className="p-3">
                            <Badge variant={statusVariant} className="text-[9px] font-bold uppercase">{statusLabel}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}

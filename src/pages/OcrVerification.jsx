import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWarehouse } from '../context/WarehouseContext';
import { useAuth } from '../context/AuthContext';
import { verifyOcrDocumentApi, rejectOcrDocumentApi } from '../services/ocrService';
import { AlertBanner, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import { 
  CheckSquare, XSquare, Plus, Trash2, ArrowLeft, Save, HelpCircle, AlertTriangle, 
  FileText, ShieldCheck, Sparkles, Check, CheckCircle2, ChevronRight 
} from 'lucide-react';

export default function OcrVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ocrDocuments, setOcrDocuments, verifyOcrDocument, rejectOcrDocument, fetchData } = useWarehouse();
  
  const [selectedDocId, setSelectedDocId] = useState('');
  const [docDetails, setDocDetails] = useState({ document_number: '', supplier: '' });
  const [items, setItems] = useState([]);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [apiOfflineWarning, setApiOfflineWarning] = useState('');
  const [activeTab, setActiveTab] = useState('queue');

  // Get initial document ID from location state or fallback to first VERIFICATION_PENDING doc
  useEffect(() => {
    if (selectedDocId) return; // Already editing a document, do not overwrite user session edits!
    
    const pendingDocs = ocrDocuments.filter(d => d.status === 'VERIFICATION_PENDING');
    let docId = location.state?.documentId;
    
    if (!docId) {
      const latestId = localStorage.getItem('latestProcessedDocId');
      if (latestId && pendingDocs.some(d => d.id === latestId)) {
        docId = latestId;
      }
    }
    
    if (!docId && pendingDocs.length > 0) {
      docId = pendingDocs[0].id;
    }
    
    if (docId) {
      handleSelectDocument(docId);
    }
  }, [location.state, ocrDocuments, selectedDocId]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSelectDocument = (docId) => {
    const doc = ocrDocuments.find(d => d.id === docId);
    if (doc) {
      setSelectedDocId(docId);
      setDocDetails({
        document_number: doc.documentNumber || doc.id,
        supplier: doc.supplierName,
        total_amount: doc.totalAmount || '',
        tax_amount: doc.taxAmount || ''
      });
      // Clone items so we can edit locally
      setItems(JSON.parse(JSON.stringify(doc.extractedItems || [])));
      setActiveTab('editor');
    }
  };

  const handleItemChange = (idx, field, val) => {
    setItems(prev => prev.map((item, i) => {
      if (i === idx) {
        const updated = { ...item, [field]: val };
        // If they edited a field, let's bump the confidence score of that field to 100% since it's now manually verified/typed
        if (field === 'sku' || field === 'quantity' || field === 'productName') {
          updated.confidenceScore = 100;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleAddRow = () => {
    const newRow = {
      id: `EXT-NEW-${Date.now()}`,
      sku: '',
      productName: '',
      category: 'Electronics',
      quantity: 1,
      uom: 'BOX',
      length: '',
      width: '',
      height: '',
      weight: '',
      confidenceScore: 100,
      validationStatus: 'Valid',
      storageType: 'GENERAL',
      isFragile: false,
      isStackable: true
    };
    setItems(prev => [...prev, newRow]);
  };

  const handleRemoveRow = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveDraft = () => {
    if (!selectedDocId) return;
    
    setOcrDocuments(prev => prev.map(d => 
      d.id === selectedDocId 
        ? { 
            ...d, 
            extractedItems: items,
            supplierName: docDetails.supplier,
            id: docDetails.document_number,
            totalAmount: docDetails.total_amount,
            taxAmount: docDetails.tax_amount
          } 
        : d
    ));
    showToast('Draft saved successfully!');
  };

  const handleConfirmAndVerify = async () => {
    if (!selectedDocId) return;
    
    // Simple verification validations
    const hasEmptySku = items.some(item => !item.sku.trim());
    if (hasEmptySku) {
      showToast('All items must have a valid SKU assigned before confirmation.', 'danger');
      return;
    }

    const hasInvalidQty = items.some(item => Number(item.quantity) <= 0);
    if (hasInvalidQty) {
      showToast('All items must have a quantity greater than zero.', 'danger');
      return;
    }

    // Call real API
    try {
      setApiOfflineWarning('');
      const formattedPayload = {
        extracted_data: {
          document_info: {
            document_number: docDetails.document_number
          },
          party_info: {
            supplier_name: docDetails.supplier
          },
          shipment_info: {
            delivery_date: new Date().toISOString()
          },
          products: items.map(item => ({
            sku: item.sku,
            product_name: item.productName,
            category: item.category,
            quantity: Number(item.quantity),
            weight: { value: Number(item.weight || 0.0) },
            dimensions: {
              length: Number(item.length || 0.0),
              width: Number(item.width || 0.0),
              height: Number(item.height || 0.0)
            },
            is_fragile: !!item.isFragile,
            is_hazardous: item.category === 'Hazardous' || item.storageType === 'HAZARDOUS'
          }))
        }
      };
      await verifyOcrDocumentApi(selectedDocId, formattedPayload);
      showToast('OCR Document verified and inbound receipt created!', 'success');
    } catch (err) {
      console.error('[OCR Verification] Approval API failed, falling back to local context update:', err);
      let errorMsg = 'Django Backend is currently offline. Your verification is being processed locally.';
      if (err.status === 404) {
        errorMsg = 'Document not found on backend database. Your verification is being processed locally.';
      } else if (err.status === 400) {
        const backendError = err.detail?.error || err.detail?.detail || err.message;
        errorMsg = `Backend validation error: ${backendError}. Your verification is being processed locally.`;
      } else if (err.status === 401 || err.status === 403) {
        errorMsg = 'Authentication error. Your verification is being processed locally.';
      }
      showToast('Django Backend error. Updating local context for UI safety.', 'warning');
      setApiOfflineWarning(errorMsg);
    }

    // Call context modifier
    verifyOcrDocument(selectedDocId, items, docDetails);
    
    // Sync state from backend
    if (fetchData) {
      await fetchData(true);
    }
    
    // Redirect to recommendations page
    setTimeout(() => {
      navigate('/inventory/recommendations');
    }, 1500);
  };

  const handleReject = async () => {
    if (!selectedDocId) return;
    if (!rejectReason.trim()) {
      showToast('Please provide a rejection reason.', 'warning');
      return;
    }

    // Call real API
    try {
      setApiOfflineWarning('');
      await rejectOcrDocumentApi(selectedDocId, rejectReason);
      showToast('Document rejected and quarantined.', 'info');
    } catch (err) {
      console.error('[OCR Verification] Rejection API failed, falling back to local context update:', err);
      let errorMsg = 'Django Backend is currently offline. Your rejection is being processed locally.';
      if (err.status === 404) {
        errorMsg = 'Document not found on backend database. Your rejection is being processed locally.';
      } else if (err.status === 400) {
        const backendError = err.detail?.error || err.detail?.detail || err.message;
        errorMsg = `Backend validation error: ${backendError}. Your rejection is being processed locally.`;
      } else if (err.status === 401 || err.status === 403) {
        errorMsg = 'Authentication error. Your rejection is being processed locally.';
      }
      showToast('Django Backend error. Updating local context for UI safety.', 'warning');
      setApiOfflineWarning(errorMsg);
    }

    rejectOcrDocument(selectedDocId, rejectReason);
    setShowRejectModal(false);
    setRejectReason('');
    
    // Find next pending doc if any
    const nextPending = ocrDocuments.find(d => d.id !== selectedDocId && d.status === 'VERIFICATION_PENDING');
    if (nextPending) {
      handleSelectDocument(nextPending.id);
    } else {
      setSelectedDocId('');
      setItems([]);
    }
  };

  const pendingDocuments = ocrDocuments.filter(d => d.status === 'VERIFICATION_PENDING');
  const selectedDoc = ocrDocuments.find(d => d.id === selectedDocId);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-250">
          <AlertBanner type={toast.type} message={toast.message} />
        </div>
      )}

      {apiOfflineWarning && (
        <AlertBanner 
          type="warning" 
          title="Backend Connection Warning" 
          message={apiOfflineWarning} 
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-[#0071C1]" />
            OCR Verification Panel
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review, correct, and verify machine-extracted invoice data to generate warehouse inbound receipts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/ocr-upload')} className="gap-1.5 text-xs font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            Upload Queue
          </Button>
        </div>
      </div>

      {/* Mobile Tab Toggle */}
      <div className="flex xl:hidden border border-gray-155 rounded-xl p-1 bg-slate-50 gap-1 mb-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex-1 py-2 text-xs font-bold text-center rounded-lg transition-all ${
            activeTab === 'queue'
              ? 'bg-[#0071C1] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100/50'
          }`}
        >
          Pending Queue ({pendingDocuments.length})
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-2 text-xs font-bold text-center rounded-lg transition-all ${
            activeTab === 'editor'
              ? 'bg-[#0071C1] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100/50'
          }`}
        >
          Verification Editor
        </button>
      </div>

      {/* Main Panel grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Column: Pending Docs List */}
        <div className={`xl:col-span-1 space-y-4 ${activeTab === 'queue' ? 'block' : 'hidden xl:block'}`}>
          <Card className="border border-gray-150 h-full">
            <CardHeader className="border-b border-gray-100 pb-3 bg-slate-50/50">
              <CardTitle className="text-xs uppercase font-bold tracking-wider text-gray-500">Awaiting Verification ({pendingDocuments.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
              {pendingDocuments.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <span>No documents pending verification! All manifests matched.</span>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pendingDocuments.map(d => (
                    <div 
                      key={d.id}
                      onClick={() => handleSelectDocument(d.id)}
                      className={`p-4 flex flex-col cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedDocId === d.id ? 'bg-blue-50/50 border-l-4 border-[#0071C1]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 truncate max-w-[150px]">{d.fileName}</span>
                        <Badge variant="warning" className="text-[9px] uppercase">{d.id}</Badge>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-[10px] text-gray-400 font-semibold">
                        <span>Supplier: {d.supplierName}</span>
                        <span className="text-blue-600 font-bold">{d.confidenceScore}% conf</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 3/4 Column: Verification Editor */}
        <div className={`xl:col-span-3 ${activeTab === 'editor' ? 'block' : 'hidden xl:block'}`}>
          {selectedDoc ? (
            <div className="space-y-6">
              
              {/* Document Overview Metadata */}
              <Card className="border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{selectedDoc.fileName}</h3>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">Manifest Reference ID: {selectedDoc.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleSaveDraft} className="text-xs gap-1">
                      <Save className="w-3.5 h-3.5" /> Save Draft
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowRejectModal(true)} className="text-xs gap-1 text-red-600 border-red-100 hover:bg-red-50">
                      <XSquare className="w-3.5 h-3.5" /> Reject Document
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4 bg-slate-50/20 grid grid-cols-1 sm:grid-cols-5 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Supplier Entity Name</span>
                    <Input 
                      type="text" 
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs font-semibold p-2 bg-white"
                      value={docDetails.supplier}
                      onChange={(e) => setDocDetails({ ...docDetails, supplier: e.target.value })}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Document ID / PO Code</span>
                    <Input 
                      type="text" 
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs font-semibold p-2 bg-white"
                      value={docDetails.document_number}
                      onChange={(e) => setDocDetails({ ...docDetails, document_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Total Amount ($)</span>
                    <Input 
                      type="number" 
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs font-semibold p-2 bg-white"
                      value={docDetails.total_amount || ''}
                      onChange={(e) => setDocDetails({ ...docDetails, total_amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Tax Amount ($)</span>
                    <Input 
                      type="number" 
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs font-semibold p-2 bg-white"
                      value={docDetails.tax_amount || ''}
                      onChange={(e) => setDocDetails({ ...docDetails, tax_amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">OCR Extraction Confidence</span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                           className={`h-2 rounded-full ${selectedDoc.confidenceScore > 90 ? 'bg-green-500' : 'bg-amber-500'}`}
                           style={{ width: `${selectedDoc.confidenceScore}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-700">{selectedDoc.confidenceScore}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items Table Editor */}
              <Card className="border border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-gray-150 pb-3 flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">Manifest Line Items</CardTitle>
                    <CardDescription className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      Low confidence extraction cells (under 85%) are highlighted in yellow. Verify all values.
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={handleAddRow} className="text-xs gap-1 bg-[#F4FCFF] border border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </Button>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table className="min-w-full divide-y divide-gray-200 text-left text-xs font-semibold">
                    <TableHeader className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
                      <TableRow>
                        <TableHead className="p-3">SKU *</TableHead>
                        <TableHead className="p-3">Product Title *</TableHead>
                        <TableHead className="p-3">Category</TableHead>
                        <TableHead className="p-3">Quantity</TableHead>
                        <TableHead className="p-3">UOM</TableHead>
                        <TableHead className="p-3">Dims (LxWxH cm)</TableHead>
                        <TableHead className="p-3">Weight (kg)</TableHead>
                        <TableHead className="p-3">Storage Type</TableHead>
                        <TableHead className="p-3 text-center">Fragile</TableHead>
                        <TableHead className="p-3 text-center">Stackable</TableHead>
                        <TableHead className="p-3 text-center">Confidence</TableHead>
                        <TableHead className="p-3 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 bg-white">
                      {items.map((item, idx) => {
                        const isLowConf = item.confidenceScore < 85;
                        const isSkuMissing = !item.sku;
                        const isDimsMissing = !item.length;
                        
                        return (
                          <TableRow key={item.id || idx} className="hover:bg-slate-50/40">
                            {/* SKU */}
                            <TableCell className="p-3 min-w-[100px]">
                              <Input 
                                type="text"
                                className={`w-full rounded-md border-gray-200 p-1.5 font-mono text-xs focus:ring-blue-500 focus:border-blue-500 ${
                                  isSkuMissing ? 'border-red-300 bg-red-50 text-red-700 font-bold placeholder-red-400' : isLowConf ? 'bg-amber-50' : 'border-gray-200'
                                }`}
                                placeholder="Enter SKU..."
                                value={item.sku}
                                onChange={(e) => handleItemChange(idx, 'sku', e.target.value.toUpperCase())}
                              />
                            </TableCell>

                            {/* Name */}
                            <TableCell className="p-3 min-w-[180px]">
                              <Input 
                                type="text"
                                className="w-full rounded-md border-gray-200 p-1.5 text-xs focus:ring-blue-500 focus:border-blue-500"
                                value={item.productName}
                                onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                              />
                            </TableCell>

                            {/* Category */}
                            <TableCell className="p-3">
                              <select 
                                className="rounded-md border-gray-200 p-1.5 text-xs focus:ring-blue-500 focus:border-blue-500 bg-white"
                                value={item.category}
                                onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                              >
                                <option value="Electronics">Electronics</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Industrial Tools">Industrial Tools</option>
                                <option value="Safety Equipment">Safety Equipment</option>
                                <option value="Packaging Supplies">Packaging Supplies</option>
                              </select>
                            </TableCell>

                            {/* Qty */}
                            <TableCell className="p-3 min-w-[70px]">
                              <Input 
                                type="number"
                                className="w-full rounded-md border-gray-200 p-1.5 text-xs focus:ring-blue-500 focus:border-blue-500 font-bold"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              />
                            </TableCell>

                            {/* UOM */}
                            <TableCell className="p-3 min-w-[70px]">
                              <Input 
                                type="text"
                                className="w-full rounded-md border-gray-200 p-1.5 text-xs focus:ring-blue-500 focus:border-blue-500 font-mono"
                                value={item.uom}
                                onChange={(e) => handleItemChange(idx, 'uom', e.target.value)}
                              />
                            </TableCell>

                            {/* Dims */}
                            <TableCell className="p-3 min-w-[140px]">
                              <div className="flex items-center gap-1">
                                <Input 
                                  type="number"
                                  placeholder="L"
                                  className={`w-10 rounded-md border-gray-200 p-1 text-xs focus:ring-blue-500 focus:border-blue-500 ${
                                    isDimsMissing ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                                  }`}
                                  value={item.length}
                                  onChange={(e) => handleItemChange(idx, 'length', e.target.value)}
                                />
                                <span className="text-gray-400 text-[10px]">x</span>
                                <Input 
                                  type="number"
                                  placeholder="W"
                                  className={`w-10 rounded-md border-gray-200 p-1 text-xs focus:ring-blue-500 focus:border-blue-500 ${
                                    isDimsMissing ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                                  }`}
                                  value={item.width}
                                  onChange={(e) => handleItemChange(idx, 'width', e.target.value)}
                                />
                                <span className="text-gray-400 text-[10px]">x</span>
                                <Input 
                                  type="number"
                                  placeholder="H"
                                  className={`w-10 rounded-md border-gray-200 p-1 text-xs focus:ring-blue-500 focus:border-blue-500 ${
                                    isDimsMissing ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                                  }`}
                                  value={item.height}
                                  onChange={(e) => handleItemChange(idx, 'height', e.target.value)}
                                />
                              </div>
                            </TableCell>

                            {/* Weight */}
                            <TableCell className="p-3 min-w-[70px]">
                              <Input 
                                type="number"
                                step="any"
                                className="w-full rounded-md border-gray-200 p-1.5 text-xs focus:ring-blue-500 focus:border-blue-500"
                                value={item.weight}
                                onChange={(e) => handleItemChange(idx, 'weight', e.target.value)}
                              />
                            </TableCell>

                            {/* Storage Type */}
                            <TableCell className="p-3 min-w-[120px]">
                              <select 
                                className="rounded-md border-gray-200 p-1.5 text-xs focus:ring-blue-500 focus:border-blue-500 bg-white w-full font-semibold"
                                value={item.storageType || 'GENERAL'}
                                onChange={(e) => handleItemChange(idx, 'storageType', e.target.value)}
                              >
                                <option value="GENERAL">General</option>
                                <option value="COLD">Cold</option>
                                <option value="FAST">Fast Moving</option>
                                <option value="HAZARDOUS">Hazardous</option>
                              </select>
                            </TableCell>

                            {/* Fragile */}
                            <TableCell className="p-3 text-center">
                              <input 
                                type="checkbox"
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                checked={!!item.isFragile}
                                onChange={(e) => handleItemChange(idx, 'isFragile', e.target.checked)}
                              />
                            </TableCell>

                            {/* Stackable */}
                            <TableCell className="p-3 text-center">
                              <input 
                                type="checkbox"
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                checked={!!item.isStackable}
                                onChange={(e) => handleItemChange(idx, 'isStackable', e.target.checked)}
                              />
                            </TableCell>

                            {/* Confidence Badge */}
                            <TableCell className="p-3 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.confidenceScore >= 90 
                                  ? 'bg-green-50 text-green-700 border border-green-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                              }`}>
                                {item.confidenceScore}%
                              </span>
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="p-3 text-right">
                              <Button 
                                onClick={() => handleRemoveRow(idx)}
                                className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Confirm Actions */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate('/ocr-upload')}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmAndVerify}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  Confirm and Create Inbound Receipt
                </Button>
              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white p-12 text-center text-xs">
              <div>
                <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <span>Select an OCR document from the queue queue list to verify its line items.</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden transform transition-all">
            <div className="p-5">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <XSquare className="w-5 h-5 text-red-500" />
                Reject Manifest Document
              </h3>
              <p className="text-gray-500 text-xs mt-1.5">
                Marking this OCR document as rejected will quarantine it and block receipt creation. Please detail the reason for verification failure.
              </p>
              <textarea 
                rows="3" 
                className="mt-4 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-xs p-2.5 font-semibold"
                placeholder="e.g. illegible text, duplicate manifest, supplier mismatch, empty fields..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="bg-slate-50 px-5 py-3.5 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold" onClick={handleReject}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

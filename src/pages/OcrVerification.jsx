import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWarehouse } from '../context/WarehouseContext';
import { useAuth } from '../context/AuthContext';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatusBadge from '../components/ui/StatusBadge';
import AlertBanner from '../components/ui/AlertBanner';
import Input from '../components/ui/Input';
import { 
  CheckSquare, XSquare, Plus, Trash2, ArrowLeft, Save, HelpCircle, AlertTriangle, 
  FileText, ShieldCheck, Sparkles, Check, CheckCircle2, ChevronRight 
} from 'lucide-react';

export default function OcrVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ocrDocuments, setOcrDocuments, verifyOcrDocument, rejectOcrDocument } = useWarehouse();
  
  const [selectedDocId, setSelectedDocId] = useState('');
  const [docDetails, setDocDetails] = useState({ document_number: '', supplier: '' });
  const [items, setItems] = useState([]);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Get initial document ID from location state or fallback to first VERIFICATION_PENDING doc
  useEffect(() => {
    const pendingDocs = ocrDocuments.filter(d => d.status === 'VERIFICATION_PENDING');
    let docId = location.state?.documentId;
    
    if (!docId && pendingDocs.length > 0) {
      docId = pendingDocs[0].id;
    }
    
    if (docId) {
      handleSelectDocument(docId);
    }
  }, [location.state, ocrDocuments]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSelectDocument = (docId) => {
    const doc = ocrDocuments.find(d => d.id === docId);
    if (doc) {
      setSelectedDocId(docId);
      setDocDetails({
        document_number: doc.id,
        supplier: doc.supplierName
      });
      // Clone items so we can edit locally
      setItems(JSON.parse(JSON.stringify(doc.extractedItems || [])));
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
      validationStatus: 'Valid'
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
        ? { ...d, extractedItems: items } 
        : d
    ));
    showToast('Draft saved successfully!');
  };

  const handleConfirmAndVerify = () => {
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

    // Call context modifier
    verifyOcrDocument(selectedDocId, items, docDetails);
    
    showToast('OCR Document verified and inbound receipt created!', 'success');
    
    // Redirect to inbound receipts
    setTimeout(() => {
      navigate('/inventory/inbound');
    }, 1500);
  };

  const handleReject = () => {
    if (!selectedDocId) return;
    if (!rejectReason.trim()) {
      showToast('Please provide a rejection reason.', 'warning');
      return;
    }

    rejectOcrDocument(selectedDocId, rejectReason);
    showToast('Document rejected and quarantined.', 'info');
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

      {/* Main Panel grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Column: Pending Docs List */}
        <div className="xl:col-span-1 space-y-4">
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
        <div className="xl:col-span-3">
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

                <CardContent className="p-4 bg-slate-50/20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Supplier Entity Name</span>
                    <input 
                      type="text" 
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs font-semibold p-2 bg-white"
                      value={docDetails.supplier}
                      onChange={(e) => setDocDetails({ ...docDetails, supplier: e.target.value })}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Document ID / PO Code</span>
                    <input 
                      type="text" 
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs font-semibold p-2 bg-white"
                      value={docDetails.document_number}
                      onChange={(e) => setDocDetails({ ...docDetails, document_number: e.target.value })}
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
                  <table className="min-w-full divide-y divide-gray-200 text-left text-xs font-semibold">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">SKU *</th>
                        <th className="p-3">Product Title *</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Quantity</th>
                        <th className="p-3">UOM</th>
                        <th className="p-3">Dims (LxWxH cm)</th>
                        <th className="p-3">Weight (kg)</th>
                        <th className="p-3 text-center">Confidence</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {items.map((item, idx) => {
                        const isLowConf = item.confidenceScore < 85;
                        const isSkuMissing = !item.sku;
                        const isDimsMissing = !item.length;
                        
                        return (
                          <tr key={item.id || idx} className="hover:bg-slate-50/40">
                            {/* SKU */}
                            <td className="p-3 min-w-[100px]">
                              <input 
                                type="text"
                                className={`w-full rounded-md border-gray-200 p-1.5 font-mono text-xs focus:ring-blue-500 focus:border-blue-500 ${
                                  isSkuMissing ? 'border-red-300 bg-red-50 text-red-700 font-bold placeholder-red-400' : isLowConf ? 'bg-amber-50' : 'border-gray-200'
                                }`}
                                placeholder="Enter SKU..."
                                value={item.sku}
                                onChange={(e) => handleItemChange(idx, 'sku', e.target.value.toUpperCase())}
                              />
                            </td>

                            {/* Name */}
                            <td className="p-3 min-w-[180px]">
                              <input 
                                type="text"
                                className="w-full rounded-md border-gray-200 p-1.5 text-xs focus:ring-blue-500 focus:border-blue-500"
                                value={item.productName}
                                onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                              />
                            </td>

                            {/* Category */}
                            <td className="p-3">
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
                            </td>

                            {/* Qty */}
                            <td className="p-3 min-w-[70px]">
                              <input 
                                type="number"
                                className="w-full rounded-md border-gray-200 p-1.5 text-xs focus:ring-blue-500 focus:border-blue-500 font-bold"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              />
                            </td>

                            {/* UOM */}
                            <td className="p-3 min-w-[70px]">
                              <input 
                                type="text"
                                className="w-full rounded-md border-gray-200 p-1.5 text-xs focus:ring-blue-500 focus:border-blue-500 font-mono"
                                value={item.uom}
                                onChange={(e) => handleItemChange(idx, 'uom', e.target.value)}
                              />
                            </td>

                            {/* Dims */}
                            <td className="p-3 min-w-[140px]">
                              <div className="flex items-center gap-1">
                                <input 
                                  type="number"
                                  placeholder="L"
                                  className={`w-10 rounded-md border-gray-200 p-1 text-xs focus:ring-blue-500 focus:border-blue-500 ${
                                    isDimsMissing ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                                  }`}
                                  value={item.length}
                                  onChange={(e) => handleItemChange(idx, 'length', e.target.value)}
                                />
                                <span className="text-gray-400 text-[10px]">x</span>
                                <input 
                                  type="number"
                                  placeholder="W"
                                  className={`w-10 rounded-md border-gray-200 p-1 text-xs focus:ring-blue-500 focus:border-blue-500 ${
                                    isDimsMissing ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                                  }`}
                                  value={item.width}
                                  onChange={(e) => handleItemChange(idx, 'width', e.target.value)}
                                />
                                <span className="text-gray-400 text-[10px]">x</span>
                                <input 
                                  type="number"
                                  placeholder="H"
                                  className={`w-10 rounded-md border-gray-200 p-1 text-xs focus:ring-blue-500 focus:border-blue-500 ${
                                    isDimsMissing ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                                  }`}
                                  value={item.height}
                                  onChange={(e) => handleItemChange(idx, 'height', e.target.value)}
                                />
                              </div>
                            </td>

                            {/* Weight */}
                            <td className="p-3 min-w-[70px]">
                              <input 
                                type="number"
                                step="any"
                                className="w-full rounded-md border-gray-200 p-1.5 text-xs focus:ring-blue-500 focus:border-blue-500"
                                value={item.weight}
                                onChange={(e) => handleItemChange(idx, 'weight', e.target.value)}
                              />
                            </td>

                            {/* Confidence Badge */}
                            <td className="p-3 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.confidenceScore >= 90 
                                  ? 'bg-green-50 text-green-700 border border-green-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                              }`}>
                                {item.confidenceScore}%
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => handleRemoveRow(idx)}
                                className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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

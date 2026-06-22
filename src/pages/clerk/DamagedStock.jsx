import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import { AlertBanner, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, SearchFilterBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination, Modal } from 'shared-ui';
import { AlertTriangle, Clock, User, Eye } from 'lucide-react';

export default function DamagedStock() {
  const location = useLocation();
  const { user } = useAuth();
  const { 
    inventory, 
    damagedRecords, 
    reportDamage, 
    updateDamageStatus 
  } = useWarehouse();

  // Form states
  const [selectedSku, setSelectedSku] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Dropped / Broken');
  const [customNotes, setCustomNotes] = useState('');
  const [customBin, setCustomBin] = useState('');

  // Search, Pagination and Details Modal states
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const itemsPerPage = 10;

  // Notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    if (location.state?.sku) {
      setSelectedSku(location.state.sku);
    } else if (inventory.length > 0) {
      setSelectedSku(inventory[0].sku);
    }
  }, [location.state, inventory]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const selectedItem = inventory.find(i => i.sku === selectedSku);

  // Set default bin of selected item
  useEffect(() => {
    if (selectedItem) {
      setCustomBin(selectedItem.bin);
    }
  }, [selectedItem]);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleReportDamageSubmit = (e) => {
    e.preventDefault();
    if (!selectedSku || !quantity) {
      showToast('Please specify a SKU and a damaged quantity.', 'error');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      showToast('Damaged quantity must be a positive integer.', 'error');
      return;
    }

    const available = (selectedItem?.quantity || 0) - (selectedItem?.reserved || 0) - (selectedItem?.damaged || 0);
    if (qty > available) {
      showToast(`Cannot quarantine ${qty} units. Only ${available} available unreserved units remain.`, 'error');
      return;
    }

    const success = reportDamage(
      selectedSku, 
      qty, 
      reason, 
      customBin || selectedItem?.bin || 'DAMAGED-ZONE', 
      customNotes || 'No notes provided', 
      user
    );

    if (success) {
      showToast(`Logged ${qty} damaged units of ${selectedSku} as REPORTED.`, 'success');
      setQuantity('');
      setCustomNotes('');
    } else {
      showToast('Failed to log damaged inventory. Check available quantities.', 'error');
    }
  };

  const handleStatusTransition = (recordId, nextStatus) => {
    updateDamageStatus(recordId, nextStatus, user);
    showToast(`Quarantine record ${recordId} updated to: ${nextStatus}`, 'success');
  };

  const getStatusColor = (status) => {
    const s = String(status).toUpperCase();
    switch (s) {
      case 'REPORTED': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'UNDER_REVIEW': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'APPROVED': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DISPOSED': return 'bg-red-50 text-red-700 border-red-200';
      case 'RESTOCKED': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    const s = String(status).toUpperCase();
    return s.replace(/_/g, ' ');
  };

  // Filtered damaged records
  const filteredRecords = damagedRecords.filter(rec => {
    const query = searchQuery.toLowerCase();
    return (
      rec.id.toLowerCase().includes(query) ||
      rec.sku.toLowerCase().includes(query) ||
      rec.product.toLowerCase().includes(query) ||
      rec.reason.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type={toastType} message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-7 h-7 text-red-600 animate-pulse" />
          Damaged Stock Quarantine
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Log damaged cargo shipments, flag broken stock during cycle counts, and manage quarantined inventory reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Report Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">
                Log Damaged Inventory
              </CardTitle>
              <CardDescription>Flags and isolates items in the database, reserving them in a virtual quarantine.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleReportDamageSubmit} className="space-y-4 text-xs font-semibold text-gray-700">
                
                {/* SKU Selector */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase block text-[10px]">Quarantined Product SKU</label>
                  <select 
                    value={selectedSku} 
                    onChange={(e) => setSelectedSku(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                  >
                    {inventory.map(item => {
                      const avail = item.quantity - (item.reserved || 0) - (item.damaged || 0);
                      return (
                        <option key={item.sku} value={item.sku} disabled={avail <= 0}>
                          {item.sku} - {item.name} ({avail} avail)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Display Current Specs */}
                {selectedItem && (
                  <div className="p-3 bg-red-50/10 rounded-xl border border-red-100/50 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Total In-Stock:</span>
                      <span className="font-bold text-gray-900">{selectedItem.quantity} units</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Already Damaged:</span>
                      <span className="font-bold text-red-600 font-mono">{selectedItem.damaged || 0} units</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Available to Flag:</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        {selectedItem.quantity - (selectedItem.reserved || 0) - (selectedItem.damaged || 0)} units
                      </span>
                    </div>
                  </div>
                )}

                {/* Damaged Quantity */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase block text-[10px]">Damaged Quantity</label>
                  <Input 
                    type="number"
                    placeholder="e.g. 5"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                    required
                    min="1"
                  />
                </div>

                {/* Quarantine Bin Source */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase block text-[10px]">Source Bin Location</label>
                  <Input 
                    type="text"
                    placeholder="e.g. BIN-B-10-01"
                    value={customBin}
                    onChange={(e) => setCustomBin(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50 font-mono"
                    required
                  />
                </div>

                {/* Reason Selection */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase block text-[10px]">Damage Reason Type</label>
                  <select 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                  >
                    <option value="Dropped / Broken">Dropped / Broken in Warehouse</option>
                    <option value="Water Damage">Water / Liquid Exposure</option>
                    <option value="Supplier Defect">Supplier Factory Defect</option>
                    <option value="Crushed Package">Crushed / Damaged During Transit</option>
                    <option value="Environmental">Expired / Humidity Overexposure</option>
                  </select>
                </div>

                {/* Custom Notes */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase block text-[10px]">Detailed Incident Notes</label>
                  <textarea 
                    placeholder="Describe how damage was discovered, barcode tag state, etc."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    rows="3"
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                  />
                </div>

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white justify-center mt-2">
                  File Damage Quarantine
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Ledger Log Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col justify-between">
            <div>
              <CardHeader className="border-b border-gray-100 bg-slate-50/50 flex flex-row justify-between items-center pb-4">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">Quarantined Stock Review Board</CardTitle>
                  <CardDescription>Manage active quarantine cycles, process claims, and write-off damaged goods.</CardDescription>
                </div>
                <Badge variant="error">{filteredRecords.length} Logs</Badge>
              </CardHeader>
              <div className="p-4 border-b border-gray-100 bg-slate-50/10">
                <SearchFilterBar 
                  searchPlaceholder="Search quarantine logs by ID, SKU, product, reason..."
                  searchValue={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Damage ID</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product Title</TableHead>
                      <TableHead>Quantity Damaged</TableHead>
                      <TableHead>Damage Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-gray-500 text-sm font-medium">
                          No quarantine records found matching the query.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRecords.map((rec) => {
                        let normStatus = String(rec.status).toUpperCase();
                        if (normStatus === 'WRITTEN OFF') normStatus = 'DISPOSED';
                        if (normStatus === 'RESOLVED') normStatus = 'RESTOCKED';

                        return (
                          <TableRow key={rec.id} className="hover:bg-slate-50/20">
                            {/* Damage ID */}
                            <TableCell className="font-bold text-gray-900 text-xs font-mono">{rec.id}</TableCell>
                            
                            {/* SKU */}
                            <TableCell className="font-mono text-gray-500 text-xs">{rec.sku}</TableCell>
                            
                            {/* Product Title */}
                            <TableCell className="font-semibold text-gray-900 text-xs">{rec.product}</TableCell>
                            
                            {/* Quantity Damaged */}
                            <TableCell className="font-bold text-red-600 text-xs font-mono text-center">
                              {rec.quantity}
                            </TableCell>
                            
                            {/* Damage Reason */}
                            <TableCell className="text-xs text-gray-700 font-medium">
                              {rec.reason}
                            </TableCell>
                            
                            {/* Status */}
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(normStatus)}`}>
                                {getStatusLabel(normStatus)}
                              </span>
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-[10px] h-7 px-1.5 font-medium border-blue-200 hover:bg-blue-50 text-blue-700"
                                  onClick={() => setSelectedItemForModal(rec)}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Details
                                </Button>
                                {normStatus === 'REPORTED' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-[10px] h-7 px-1.5 font-medium border-blue-200 hover:bg-blue-50 text-blue-700"
                                    onClick={() => handleStatusTransition(rec.id, 'UNDER_REVIEW')}
                                  >
                                    Audit
                                  </Button>
                                )}
                                {normStatus === 'UNDER_REVIEW' && (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-[10px] h-7 px-1.5 font-medium border-purple-200 hover:bg-purple-50 text-purple-700"
                                      onClick={() => handleStatusTransition(rec.id, 'APPROVED')}
                                    >
                                      Approve
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-[10px] h-7 px-1.5 font-medium border-red-200 hover:bg-red-50 text-red-700"
                                      onClick={() => handleStatusTransition(rec.id, 'DISPOSED')}
                                    >
                                      Dispose
                                    </Button>
                                  </>
                                )}
                                {normStatus === 'APPROVED' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-[10px] h-7 px-1.5 font-medium border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                                    onClick={() => handleStatusTransition(rec.id, 'RESTOCKED')}
                                  >
                                    Restock
                                  </Button>
                                )}
                                {(normStatus === 'DISPOSED' || normStatus === 'RESTOCKED') && (
                                  <span className="text-[10px] font-semibold text-gray-400 italic py-1">
                                    Resolved
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </div>
            
            {/* Pagination placement */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredRecords.length}
                  pageSize={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedItemForModal && (
        <Modal
          isOpen={!!selectedItemForModal}
          onClose={() => setSelectedItemForModal(null)}
          title={`Quarantine Details: ${selectedItemForModal.product}`}
          maxWidth="max-w-md"
          footer={
            <Button onClick={() => setSelectedItemForModal(null)}>Close Details</Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Damage Record ID</span>
                <div className="text-sm font-bold font-mono mt-0.5">{selectedItemForModal.id}</div>
              </div>
              <Badge variant="error" className="text-[10px] uppercase font-bold">
                {getStatusLabel(selectedItemForModal.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">SKU Code</span>
                <span className="text-slate-800 font-semibold text-xs mt-1 block font-mono">{selectedItemForModal.sku}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Quarantined Quantity</span>
                <span className="text-red-600 font-bold text-xs mt-1 block">{selectedItemForModal.quantity} Units</span>
              </div>
            </div>

            <div className="p-4 border border-gray-100 rounded-2xl bg-white space-y-2">
              <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 uppercase text-[10px] tracking-wider text-[#0071C1]">Incident Logistics</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>Source Bin: <span className="font-bold font-mono text-slate-900">{selectedItemForModal.bin || 'N/A'}</span></div>
                <div>Reported By: <span className="font-bold text-slate-900">{selectedItemForModal.reportedBy || 'officer@warehouse.com'}</span></div>
                <div className="col-span-2">Reported Date: <span className="font-bold text-slate-900">{selectedItemForModal.reportedDate ? new Date(selectedItemForModal.reportedDate).toLocaleString() : 'N/A'}</span></div>
              </div>
            </div>

            <div className="p-4 border border-gray-100 rounded-2xl bg-white space-y-2">
              <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 uppercase text-[10px] tracking-wider text-red-600">Damage Reason & Notes</h4>
              <div className="space-y-1">
                <div className="font-bold text-slate-900">Reason: <span className="font-normal text-slate-700">{selectedItemForModal.reason}</span></div>
                <div className="font-bold text-slate-900 mt-2">Notes:</div>
                <p className="text-slate-600 leading-relaxed font-normal bg-slate-50 p-2.5 rounded-lg border border-gray-100 font-sans">{selectedItemForModal.notes || 'No notes provided.'}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Badge, 
  Button, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  AlertBanner 
} from 'shared-ui';
import { AlertTriangle, Hammer, Trash2, ArrowRightLeft, ShieldAlert } from 'lucide-react';

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
      showToast(`Logged ${qty} damaged units of ${selectedSku} into quarantine.`, 'success');
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
                  <input 
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
                  <input 
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
          <Card className="border border-gray-100 shadow-sm overflow-hidden h-full">
            <CardHeader className="border-b border-gray-100 bg-slate-50/50 flex flex-row justify-between items-center pb-4">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">Quarantined Stock Review Board</CardTitle>
                <CardDescription>Manage active quarantine cycles, process claims, and write-off damaged goods.</CardDescription>
              </div>
              <Badge variant="error">{damagedRecords.length} Quarantine Logs</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record ID / Date</TableHead>
                    <TableHead>Product / SKU</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Reason & Notes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {damagedRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-gray-500 text-sm font-medium">
                        Excellent! No inventory currently flagged in quarantine.
                      </TableCell>
                    </TableRow>
                  ) : (
                    damagedRecords.map((rec) => {
                      let statusVariant = 'warning';
                      if (rec.status === 'Written Off') statusVariant = 'error';
                      if (rec.status === 'Restocked' || rec.status === 'Resolved') statusVariant = 'success';
                      if (rec.status === 'Sent for Repair') statusVariant = 'primary';

                      return (
                        <TableRow key={rec.id}>
                          {/* Record ID / Date */}
                          <TableCell>
                            <div className="font-bold text-gray-900 text-xs font-mono">{rec.id}</div>
                            <div className="text-[9px] text-gray-400 mt-1">
                              {new Date(rec.reportedDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          
                          {/* Product SKU */}
                          <TableCell>
                            <div className="font-semibold text-gray-900 text-xs">{rec.product}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{rec.sku}</div>
                          </TableCell>
                          
                          {/* Qty */}
                          <TableCell className="font-bold text-red-600 text-xs font-mono">
                            {rec.quantity} units
                          </TableCell>
                          
                          {/* Bin */}
                          <TableCell className="font-mono text-xs text-gray-700 font-medium">
                            {rec.bin}
                          </TableCell>
                          
                          {/* Reason */}
                          <TableCell className="max-w-[150px]">
                            <div className="font-semibold text-gray-800 text-xs">{rec.reason}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5 truncate" title={rec.notes}>{rec.notes}</div>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Badge variant={statusVariant} className="text-[10px]">
                              {rec.status}
                            </Badge>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            {rec.status === 'Reported' ? (
                              <div className="flex gap-1 justify-end">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-[10px] h-7 px-1.5 font-medium border-red-200 hover:bg-red-50 text-red-700"
                                  onClick={() => handleStatusTransition(rec.id, 'Written Off')}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Scrap
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-[10px] h-7 px-1.5 font-medium border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                                  onClick={() => handleStatusTransition(rec.id, 'Restocked')}
                                >
                                  <Hammer className="w-3 h-3 mr-1" />
                                  Repair
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-semibold text-gray-400 italic">
                                Audited
                              </span>
                            )}
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

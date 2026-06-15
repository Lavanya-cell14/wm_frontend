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
import { Wrench, RefreshCw, AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

export default function StockAdjustment() {
  const location = useLocation();
  const { user } = useAuth();
  const { inventory, stockAdjustments, adjustStock } = useWarehouse();

  // Selected item states
  const [selectedSku, setSelectedSku] = useState('');
  const [qtyDelta, setQtyDelta] = useState('');
  const [reason, setReason] = useState('Manual correction');
  const [notes, setNotes] = useState('');
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Pre-fill SKU if passed from state
  useEffect(() => {
    if (location.state?.sku) {
      setSelectedSku(location.state.sku);
    } else if (inventory.length > 0) {
      setSelectedSku(inventory[0].sku);
    }
  }, [location.state, inventory]);

  const selectedItem = inventory.find(i => i.sku === selectedSku);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleAdjustmentSubmit = (e) => {
    e.preventDefault();
    if (!selectedSku || !qtyDelta) {
      showToast('Please select a SKU and provide an adjustment quantity.', 'error');
      return;
    }

    const delta = parseInt(qtyDelta);
    if (isNaN(delta) || delta === 0) {
      showToast('Adjustment quantity must be a non-zero integer.', 'error');
      return;
    }

    // Safety check for decreasing stock
    if (delta < 0 && Math.abs(delta) > (selectedItem?.quantity || 0)) {
      showToast(`Cannot adjust stock below 0! Current quantity is ${selectedItem?.quantity}.`, 'error');
      return;
    }

    const submitReason = `${reason}${notes.trim() ? ` - ${notes.trim()}` : ''}`;
    const success = adjustStock(selectedSku, delta, user, submitReason);

    if (success) {
      showToast(`Stock for ${selectedSku} adjusted by ${delta > 0 ? '+' : ''}${delta} successfully!`, 'success');
      setQtyDelta('');
      setNotes('');
    } else {
      showToast('Failed to perform stock adjustment. Check inventory logs.', 'error');
    }
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
          <Wrench className="w-7 h-7 text-[#0071C1]" />
          Stock Discrepancy Adjustment
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Perform digital correction on physical inventory discrepancies. Updates are broadcast instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Form Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                Adjustment Request
              </CardTitle>
              <CardDescription>Enter quantity change. Positive increases stock, negative decreases.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleAdjustmentSubmit} className="space-y-4 text-xs font-semibold text-gray-700">
                
                {/* SKU Selector */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase block text-[10px]">Select Product SKU</label>
                  <select 
                    value={selectedSku} 
                    onChange={(e) => setSelectedSku(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                  >
                    {inventory.map(item => (
                      <option key={item.sku} value={item.sku}>
                        {item.sku} - {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Display Current Specs */}
                {selectedItem && (
                  <div className="p-3 bg-blue-50/30 rounded-xl border border-blue-100 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Product Name:</span>
                      <span className="font-bold text-gray-900 text-right">{selectedItem.name}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Current Stock:</span>
                      <span className="font-bold text-blue-700 font-mono">{selectedItem.quantity} units</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Storage Location:</span>
                      <span className="font-bold text-gray-800 font-mono">{selectedItem.bin}</span>
                    </div>
                  </div>
                )}

                {/* Quantity Delta */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase block text-[10px]">Stock Count Offset (+/-)</label>
                  <input 
                    type="number"
                    placeholder="e.g. 50 (Increase) or -10 (Decrease)"
                    value={qtyDelta}
                    onChange={(e) => setQtyDelta(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                    required
                  />
                  <p className="text-[10px] text-gray-400 font-normal italic">
                    Type a negative value to reduce stock. e.g. -5
                  </p>
                </div>

                {/* Reason Selection */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase block text-[10px]">Adjustment Reason</label>
                  <select 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                  >
                    <option value="OCR correction">OCR correction</option>
                    <option value="Physical count mismatch">Physical count mismatch</option>
                    <option value="Damaged item">Damaged item</option>
                    <option value="Returned item">Returned item</option>
                    <option value="Manual correction">Manual correction</option>
                    <option value="Reserved stock correction">Reserved stock correction</option>
                  </select>
                </div>

                {/* Notes log field */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase block text-[10px]">Audit Notes / Explanation</label>
                  <input 
                    type="text"
                    placeholder="Specify detailed reason or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500 bg-gray-50/50"
                  />
                </div>

                <Button type="submit" className="w-full justify-center mt-2">
                  Apply Adjustment
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
                <CardTitle className="text-base font-bold text-gray-900">Recent Stock Adjustments Ledger</CardTitle>
                <CardDescription>Audited records of manual offsets in the current session.</CardDescription>
              </div>
              <Badge variant="outline">{stockAdjustments.length} logged</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Product / SKU</TableHead>
                    <TableHead>Previous</TableHead>
                    <TableHead>New Qty</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockAdjustments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-500 text-sm font-medium">
                        No manual stock adjustments logged yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stockAdjustments.map((adj) => {
                      const diff = adj.newQuantity - adj.previousQuantity;
                      const isUp = diff > 0;
                      
                      return (
                        <TableRow key={adj.id}>
                          <TableCell className="text-[10px] text-gray-400 font-medium">
                            {new Date(adj.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-gray-900 text-xs">{adj.product}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{adj.sku}</div>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 font-mono">
                            {adj.previousQuantity} units
                          </TableCell>
                          <TableCell className="text-xs font-bold text-gray-900 font-mono">
                            {adj.newQuantity} units
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${isUp ? 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded'}`}>
                              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {isUp ? `+${diff}` : diff}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-gray-600 font-medium max-w-[120px] truncate" title={adj.reason}>
                            {adj.reason}
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  StatCard, 
  Badge, 
  Button, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  StatusBadge, 
  AlertBanner 
} from 'shared-ui';
import { 
  Box, 
  Wrench, 
  AlertTriangle, 
  Package, 
  Search, 
  Activity, 
  ShieldCheck, 
  ClipboardList, 
  ArrowRight, 
  ShieldAlert, 
  TrendingUp, 
  RefreshCw,
  UploadCloud,
  CheckSquare,
  ArrowDownToLine,
  FileText
} from 'lucide-react';

export default function ClerkDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    inventory, 
    movements, 
    reservations, 
    damagedRecords,
    ocrDocuments = [],
    inboundReceipts = [],
    kpis 
  } = useWarehouse();

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Calculations
  const pendingOcr = ocrDocuments.filter(d => ['OCR_UPLOADED', 'OCR_PROCESSING', 'VERIFICATION_PENDING'].includes(d.status)).length;
  const verificationPending = ocrDocuments.filter(d => d.status === 'VERIFICATION_PENDING').length;
  const verifiedToday = ocrDocuments.filter(d => d.status === 'VERIFIED').length;
  const inboundWaitingBin = inboundReceipts.filter(r => r.status === 'WAITING_FOR_BIN_ASSIGNMENT').length;

  const totalStock = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const reservedStock = inventory.reduce((sum, i) => sum + (i.reserved || 0), 0);
  const damagedStock = inventory.reduce((sum, i) => sum + (i.damaged || 0), 0);
  const availableStock = Math.max(0, totalStock - reservedStock - damagedStock);
  const lowStockItems = inventory.filter(i => i.quantity <= i.reorderLevel);

  const quickActions = [
    { name: 'Inbound OCR Upload', path: '/ocr-upload', icon: UploadCloud, desc: 'Upload warehouse documents', color: 'from-blue-500 to-indigo-500' },
    { name: 'OCR Verification', path: '/ocr-verification', icon: CheckSquare, desc: 'Verify extracted document details', color: 'from-indigo-500 to-purple-500' },
    { name: 'Inbound Products', path: '/inventory/inbound', icon: ArrowDownToLine, desc: 'View received inbound receipts', color: 'from-pink-500 to-rose-500' },
    { name: 'Inventory List', path: '/inventory/list', icon: Box, desc: 'View and filter all stock', color: 'from-emerald-500 to-teal-500' },
    { name: 'Stock Adjustment', path: '/inventory/adjust', icon: Wrench, desc: 'Adjust stock quantities & logs', color: 'from-amber-500 to-orange-500' },
    { name: 'Damaged Stock', path: '/inventory/damaged', icon: AlertTriangle, desc: 'Track and quarantine damaged stock', color: 'from-rose-500 to-red-500' },
    { name: 'Reserved Stock', path: '/inventory/reserved', icon: Package, desc: 'Hold inventory for orders', color: 'from-purple-500 to-pink-500' },
    { name: 'Product Lookup', path: '/inventory/lookup', icon: Search, desc: 'Lookup item details & coordinates', color: 'from-teal-500 to-emerald-500' },
    { name: 'Inventory Movements', path: '/inventory/movements', icon: Activity, desc: 'Audit log of all stock moves', color: 'from-slate-700 to-slate-800' },
  ];

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
            <Activity className="w-7 h-7 text-[#0071C1]" />
            Clerk Command Center
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time inventory management console for {user?.name || 'Inventory Clerk'}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-xs font-semibold" onClick={() => showToast('Dashboard stats refreshed!')}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh State
          </Button>
        </div>
      </div>

      {/* Receiving KPI Stats Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Receiving & OCR Processing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Pending OCR Documents" 
            value={pendingOcr} 
            icon={UploadCloud} 
            subtitle="Uploaded or processing"
          />
          <StatCard 
            title="Verification Pending" 
            value={verificationPending} 
            icon={CheckSquare} 
            trend={verificationPending > 0 ? "down" : "neutral"}
            trendValue={verificationPending > 0 ? "Requires Review" : "All Verified"}
          />
          <StatCard 
            title="Documents Verified" 
            value={verifiedToday} 
            icon={FileText} 
            subtitle="Processed to Inbound Receipts"
          />
          <StatCard 
            title="Waiting Bin Assignment" 
            value={inboundWaitingBin} 
            icon={ArrowDownToLine} 
            trend="neutral"
            trendValue="Inbound queue"
          />
        </div>

        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Inventory & Audit Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Stock Units" 
            value={totalStock} 
            icon={Box} 
            subtitle="All active warehouse stock"
          />
          <StatCard 
            title="Low Stock Items" 
            value={lowStockItems.length} 
            icon={ShieldAlert} 
            trend={lowStockItems.length > 0 ? "down" : "neutral"}
            trendValue={lowStockItems.length > 0 ? "Action required" : "Healthy levels"}
          />
          <StatCard 
            title="Damaged / Quarantine" 
            value={damagedStock} 
            icon={AlertTriangle} 
            trend={damagedStock > 0 ? 'down' : 'neutral'}
            trendValue={damagedStock > 0 ? `${damagedRecords.length} Items Flagged` : '0 quarantined'}
          />
          <StatCard 
            title="Reserved Units" 
            value={reservedStock} 
            icon={Package} 
            trend="neutral"
            trendValue={`${reservations.length} Active holds`}
          />
        </div>
      </div>

      {/* Quick Access Actions */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-gray-100">
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#0071C1]" />
            Quick Inventory Workflows
          </CardTitle>
          <CardDescription>Select a workspace module below to process real-time updates.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <div 
                  key={action.name}
                  onClick={() => navigate(action.path)}
                  className="group cursor-pointer p-4 rounded-2xl border border-gray-100 bg-white hover:bg-slate-50 hover:shadow-md hover:border-slate-200 transition-all duration-300 flex items-center gap-4"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      {action.name}
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{action.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Dashboard Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left/Middle Column - Low Stock & Active Reservations */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Low Stock Alerts */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  Low Stock & Reorder Alerts
                </CardTitle>
                <CardDescription>Items that require inventory procurement replenishment.</CardDescription>
              </div>
              <Badge variant={lowStockItems.length > 0 ? 'warning' : 'success'}>
                {lowStockItems.length} Warnings
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU / Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Current Qty</TableHead>
                    <TableHead>Reorder Pt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                        All items have healthy stocking levels!
                      </TableCell>
                    </TableRow>
                  ) : (
                    lowStockItems.map((item) => (
                      <TableRow key={item.sku}>
                        <TableCell>
                          <div className="font-semibold text-gray-900 text-xs">{item.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.sku}</div>
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-blue-700 font-semibold">
                          {item.bin}
                        </TableCell>
                        <TableCell className="font-bold text-gray-900 text-xs">{item.quantity} units</TableCell>
                        <TableCell className="text-gray-500 text-xs font-semibold">{item.reorderLevel} units</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-red-50 text-red-700 border-red-200">
                            Low Stock
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-7 py-0 px-2"
                            onClick={() => navigate('/inventory/adjust', { state: { sku: item.sku } })}
                          >
                            Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Active Inventory Reservations */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  Active Stock Holds / Reservations
                </CardTitle>
                <CardDescription>Products currently committed to active pending order picklists.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 text-xs" onClick={() => navigate('/inventory/reserved')}>
                Manage Holds
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hold ID</TableHead>
                    <TableHead>Product / SKU</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Clerk / Order</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                        No active stock holds at the moment.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reservations.slice(0, 3).map((res) => (
                      <TableRow key={res.id}>
                        <TableCell className="font-bold text-gray-900 text-xs font-mono">{res.id}</TableCell>
                        <TableCell>
                          <div className="font-semibold text-gray-900 text-xs">{res.product}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{res.sku}</div>
                        </TableCell>
                        <TableCell className="font-bold text-gray-900 text-xs">{res.qty} units</TableCell>
                        <TableCell className="text-gray-600 text-xs">{res.user}</TableCell>
                        <TableCell className="text-gray-400 text-[10px]">
                          {new Date(res.timestamp).toLocaleDateString()} {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="primary" className="text-[10px]">Reserved</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Recent Movements & Damage Summary */}
        <div className="space-y-6">
          
          {/* Recent Movement Log */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#0071C1]" />
                  Recent Stock Movements
                </CardTitle>
                <CardDescription>Live telemetry tracking stock updates.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 text-xs" onClick={() => navigate('/inventory/movements')}>
                Full Log
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative border-l-2 border-slate-100 pl-4 space-y-6">
                {movements.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-xs">
                    No movements logged in current session.
                  </div>
                ) : (
                  movements.slice(0, 4).map((mov, i) => (
                    <div key={i} className="relative">
                      <span className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 shadow-sm"></span>
                      <div className="text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-900">{mov.item}</span>
                          <span className="text-gray-400 text-[9px]">{mov.time}</span>
                        </div>
                        <p className="text-gray-600 text-[10px] mb-1">
                          From <span className="font-mono text-gray-800">{mov.from}</span> to <span className="font-mono text-blue-700 bg-blue-50 px-1 rounded">{mov.to}</span>
                        </p>
                        <div className="flex justify-between items-center mt-1.5">
                          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">{mov.type?.replace('_', ' ')}</span>
                          <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
                            Qty: {mov.qty > 0 ? `+${mov.qty}` : mov.qty}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Damaged / Quarantine Overview */}
          <Card className="border border-gray-100 shadow-sm bg-rose-50/10">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                Damaged Quarantine Log
              </CardTitle>
              <CardDescription>Quarantined stock items pending adjustment audit.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {damagedRecords.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-xs">
                  Zero active quarantine reports!
                </div>
              ) : (
                damagedRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="p-3 bg-white border border-gray-100 rounded-xl shadow-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-900 text-xs">{record.product}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{record.sku}</div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-red-50 text-red-700 border-red-100">
                        {record.quantity} units
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-600">
                      <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">Reason:</span> {record.reason}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                      <span>Bin: <span className="font-mono text-gray-600 font-semibold">{record.bin}</span></span>
                      <span>{new Date(record.reportedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
              <Button 
                variant="outline" 
                className="w-full text-xs justify-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => navigate('/inventory/damaged')}
              >
                Flag New Damage
              </Button>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}

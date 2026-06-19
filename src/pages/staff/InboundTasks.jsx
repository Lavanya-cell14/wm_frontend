import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import { AlertBanner, Badge, Button, Card, CardContent, CardHeader, CardTitle, Pagination, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared-ui';
import { ArrowDownToLine, ScanBarcode, Play, CheckSquare, Eye, Clock, Box } from 'lucide-react';
import { getInboundShipments, patchInboundShipment } from '../../services/inboundService';

const mapBackendInboundToTask = (ship) => {
  let mappedStatus = 'Pending';
  if (ship.status === 'COMPLETED') {
    mappedStatus = 'Completed';
  } else if (ship.status === 'IN_PROGRESS' || ship.status === 'IN_TRANSIT') {
    mappedStatus = 'In Progress';
  }
  
  return {
    id: ship.shipment_code || ship.id,
    supplier: ship.supplier_name,
    expectedArrival: ship.expected_arrival ? new Date(ship.expected_arrival).toLocaleString() : 'N/A',
    product: `Shipment from ${ship.supplier_name}`,
    sku: 'SKU-GENERIC',
    quantity: 50,
    priority: 'Medium',
    status: mappedStatus,
    assignedStaff: ship.status === 'IN_PROGRESS' ? 'Warehouse Operator' : 'Unassigned',
    _rawBackendId: ship.id
  };
};

export default function InboundTasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { inboundTasks, startInboundTask, completeInboundTask } = useWarehouse();
  const [activeTab, setActiveTab] = useState('Pending');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [toastMessage, setToastMessage] = useState('');

  const [backendTasks, setBackendTasks] = useState([]);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      console.warn("[InboundTasks] Calling API: GET /api/inbound/");
      const data = await getInboundShipments();
      const mapped = data.results.map(mapBackendInboundToTask);
      setBackendTasks(mapped);
      setFallbackUsed(false);
      console.warn(`[InboundTasks] API Success. URL: /api/inbound/, Status: 200, Count: ${data.count}, Fallback Used: false`);
    } catch (err) {
      const status = err.status || (err.code === 'NETWORK_ERROR' ? 0 : 'unknown');
      setApiError('Inbound Shipments API unreachable — showing mock fallback data.');
      setFallbackUsed(true);
      console.error(`[InboundTasks] API Error. URL: /api/inbound/, Status: ${status}, Detail: ${err.message}. Fallback Used: true (using context/WireMock data)`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const displayList = fallbackUsed ? inboundTasks : backendTasks;

  const filteredTasks = displayList.filter(task => {
    if (activeTab === 'Pending') return task.status === 'Pending';
    if (activeTab === 'In Progress') return task.status === 'In Progress';
    if (activeTab === 'Completed') return task.status === 'Completed';
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));

  // Reset to first page when tab changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const pagedTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleStartTask = async (taskId, rawBackendId) => {
    if (!fallbackUsed && rawBackendId) {
      try {
        console.warn(`[InboundTasks] Calling API: PATCH /api/inbound/${rawBackendId}/`);
        await patchInboundShipment(rawBackendId, { status: 'IN_PROGRESS' });
        setBackendTasks(prev => prev.map(task => 
          task._rawBackendId === rawBackendId ? { ...task, status: 'In Progress', assignedStaff: 'Warehouse Operator' } : task
        ));
        console.warn(`[InboundTasks] API Success. URL: /api/inbound/${rawBackendId}/, Status: 200, Fallback Used: false`);
        showToast(`Receiving verification initiated for shipment ${taskId}.`);
      } catch (err) {
        const status = err.status || (err.code === 'NETWORK_ERROR' ? 0 : 'unknown');
        console.error(`[InboundTasks] API Error. URL: /api/inbound/${rawBackendId}/, Status: ${status}, Detail: ${err.message}.`);
        showToast('Failed to start task on backend.');
      }
    } else {
      startInboundTask(taskId);
      showToast(`Receiving verification initiated for shipment ${taskId} (Mock Fallback).`);
    }
  };

  const handleCompleteTask = async (taskId, rawBackendId) => {
    if (!fallbackUsed && rawBackendId) {
      try {
        console.warn(`[InboundTasks] Calling API: PATCH /api/inbound/${rawBackendId}/`);
        await patchInboundShipment(rawBackendId, { status: 'COMPLETED' });
        setBackendTasks(prev => prev.map(task => 
          task._rawBackendId === rawBackendId ? { ...task, status: 'Completed' } : task
        ));
        console.warn(`[InboundTasks] API Success. URL: /api/inbound/${rawBackendId}/, Status: 200, Fallback Used: false`);
        showToast(`Verify successful! Shipment ${taskId} logged as fully received.`);
      } catch (err) {
        const status = err.status || (err.code === 'NETWORK_ERROR' ? 0 : 'unknown');
        console.error(`[InboundTasks] API Error. URL: /api/inbound/${rawBackendId}/, Status: ${status}, Detail: ${err.message}.`);
        showToast('Failed to complete task on backend.');
      }
    } else {
      completeInboundTask(taskId, user);
      showToast(`Verify successful! Shipment ${taskId} logged as fully received (Mock Fallback).`);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {fallbackUsed && (
        <div className="mb-4">
          <AlertBanner type="warning" message="Inbound Shipments API unreachable — showing mock fallback data." />
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ArrowDownToLine className="w-7 h-7 text-[#0071C1]" />
          Inbound Shipment Tasks
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Review, start, and complete receiving verification tasks for arriving shipments.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-gray-200">
        {['Pending', 'In Progress', 'Completed'].map((tab) => {
          const count = displayList.filter(t => t.status === tab).length;
          return (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
                activeTab === tab 
                  ? 'border-[#0071C1] text-[#0071C1]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === tab ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Content area */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-0">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Box className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-900 text-base">No tasks found</h3>
              <p className="text-gray-500 text-sm">There are no receiving tasks in this status category.</p>
            </div>
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Expected / ETA</TableHead>
                  <TableHead>Product / Quantity</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Staff</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-bold text-gray-900 font-mono text-sm">{task.id}</TableCell>
                    <TableCell className="text-gray-600 text-sm font-semibold">{task.supplier}</TableCell>
                    <TableCell className="text-gray-500 text-xs font-semibold">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {task.expectedArrival}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-gray-900 text-sm">{task.product}</div>
                      <div className="text-xs text-blue-700 bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100 w-fit font-bold font-mono mt-1">
                        {task.quantity} Units
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'outline'}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'warning' : 'info'} />
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm font-semibold">{task.assignedStaff}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {task.status === 'Pending' && (
                          <Button size="sm" className="gap-1.5" onClick={() => handleStartTask(task.id, task._rawBackendId)}>
                            <Play className="w-3.5 h-3.5" /> Start
                          </Button>
                        )}
                        {task.status === 'In Progress' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5 font-bold" onClick={() => handleCompleteTask(task.id, task._rawBackendId)}>
                            <CheckSquare className="w-3.5 h-3.5" /> Complete
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="gap-1.5 text-gray-600" onClick={() => navigate('/staff/scanner')}>
                          <ScanBarcode className="w-3.5 h-3.5 text-gray-500" /> Scanner
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              <div className="px-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredTasks.length}
                  pageSize={pageSize}
                  onPageChange={(p) => setCurrentPage(Math.max(1, Math.min(totalPages, p)))}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import AlertBanner from '../../components/ui/AlertBanner';
import StatusBadge from '../../components/ui/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { ArrowDownToLine, ScanBarcode, Play, CheckSquare, Eye, Clock, Box } from 'lucide-react';

export default function InboundTasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { inboundTasks, startInboundTask, completeInboundTask } = useWarehouse();
  const [activeTab, setActiveTab] = useState('Pending');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredTasks = inboundTasks.filter(task => {
    if (activeTab === 'Pending') return task.status === 'Pending';
    if (activeTab === 'In Progress') return task.status === 'In Progress';
    if (activeTab === 'Completed') return task.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
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
          const count = inboundTasks.filter(t => t.status === tab).length;
          return (
            <button
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
            </button>
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
                {filteredTasks.map((task) => (
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
                          <Button size="sm" className="gap-1.5" onClick={() => {
                            startInboundTask(task.id);
                            showToast(`Receiving verification initiated for shipment ${task.id}.`);
                          }}>
                            <Play className="w-3.5 h-3.5" /> Start
                          </Button>
                        )}
                        {task.status === 'In Progress' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5 font-bold" onClick={() => {
                            completeInboundTask(task.id, user);
                            showToast(`Verify successful! Shipment ${task.id} logged as fully received.`);
                          }}>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

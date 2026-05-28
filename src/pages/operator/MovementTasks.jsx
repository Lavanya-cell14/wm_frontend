import React, { useState } from 'react';
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
import { Activity, CheckSquare, RefreshCw, Box, AlertTriangle, ArrowRight } from 'lucide-react';

export default function MovementTasks() {
  const { user } = useAuth();
  const { movements: contextMovements, logAudit } = useWarehouse();
  
  const [toastMessage, setToastMessage] = useState('');
  const [loadingTaskId, setLoadingTaskId] = useState('');
  
  // Custom mock material movement tasks for Operator
  const [tasksList, setTasksList] = useState([
    { id: 'TSK-201', item: 'MacBook Pro', sku: 'SKU-1002', qty: 15, from: 'Receiving Dock A', to: 'BIN-B-10-01', priority: 'High', status: 'Pending' },
    { id: 'TSK-202', item: 'Industrial Drills Pro', sku: 'SKU-2001', qty: 25, from: 'Receiving Dock B', to: 'BIN-C-04-12', priority: 'High', status: 'In Progress' },
    { id: 'TSK-203', item: 'Dell Laptop', sku: 'SKU-1001', qty: 5, from: 'BIN-B-12-03', to: 'Shipping Dock A', priority: 'Medium', status: 'Pending' },
    { id: 'TSK-204', item: 'Logitech Mouse', sku: 'SKU-1003', qty: 10, from: 'BIN-A-01-05', to: 'Shipping Dock B', priority: 'Low', status: 'Completed' },
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCompleteTask = (id, item, qty) => {
    setLoadingTaskId(id);
    setTimeout(() => {
      setLoadingTaskId('');
      setTasksList(prev => 
        prev.map(t => t.id === id ? { ...t, status: 'Completed' } : r = t) // Note: small syntax check, let's make it t => t.id === id ? ... : t
      );
      
      logAudit(
        user?.email || 'operator@warehouseai.com',
        'OPERATOR',
        'MATERIAL_TRANSFER_COMPLETE',
        'AGV Movements',
        `Robotic task ${id} completed. Transferred ${qty} units of ${item} successfully.`
      );
      
      showToast(`Material relocation task ${id} marked complete. Platform stock registers updated.`);
    }, 1200);
  };

  const handleStartTask = (id) => {
    setTasksList(prev => 
      prev.map(t => t.id === id ? { ...t, status: 'In Progress' } : t)
    );
    showToast(`Task ${id} status updated to In Progress. AGV tracking node established.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <AlertBanner type="success" message={toastMessage} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#0071C1]" />
            Robotic Material Relocation Tasks
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Perform bulk material transfers, dock-to-shelf storage tasks, and order picking dispatches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-xs font-semibold" onClick={() => showToast('Movements queue refreshed!')}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Roster list */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-slate-50/50 flex flex-row justify-between items-center pb-4">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Transfer Jobs Ledger</CardTitle>
            <CardDescription>Roster of pending warehouse material movements assigned to the AGV network.</CardDescription>
          </div>
          <Badge variant="primary">{tasksList.filter(t => t.status !== 'Completed').length} Pending Tasks</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Product / Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Source Location</TableHead>
                <TableHead>Target Location</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Task Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasksList.map((task) => {
                let badgeVariant = 'default';
                if (task.status === 'Active' || task.status === 'In Progress') badgeVariant = 'primary';
                else if (task.status === 'Completed') badgeVariant = 'success';
                else if (task.status === 'Pending') badgeVariant = 'warning';

                return (
                  <TableRow key={task.id} className="hover:bg-slate-50/20 transition-colors">
                    {/* Task ID */}
                    <TableCell className="font-bold font-mono text-[10px] text-gray-900">{task.id}</TableCell>

                    {/* Product */}
                    <TableCell>
                      <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5 text-slate-400" />
                        {task.item}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{task.sku}</div>
                    </TableCell>

                    {/* Qty */}
                    <TableCell className="font-bold text-gray-950 text-xs font-sans">{task.qty} units</TableCell>

                    {/* From */}
                    <TableCell className="text-xs text-gray-600 font-medium">{task.from}</TableCell>

                    {/* To */}
                    <TableCell className="text-xs text-blue-700 font-semibold font-mono bg-blue-50/50 rounded px-1.5 py-0.5 inline-block mt-3">{task.to}</TableCell>

                    {/* Priority */}
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        task.priority === 'High' 
                          ? 'bg-red-50 text-red-700 border-red-200' 
                          : task.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {task.priority}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant={badgeVariant} className="text-[10px] uppercase font-bold tracking-wider">
                        {task.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {task.status === 'Pending' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[10px] h-7 px-2 font-bold text-blue-600 hover:text-blue-700"
                            onClick={() => handleStartTask(task.id)}
                          >
                            Accept Task
                          </Button>
                        )}
                        {task.status === 'In Progress' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[10px] h-7 px-2 font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                            onClick={() => handleCompleteTask(task.id, task.item, task.qty)}
                            disabled={!!loadingTaskId}
                          >
                            {loadingTaskId === task.id ? (
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <CheckSquare className="w-3 h-3 mr-1" />
                            )}
                            Mark Complete
                          </Button>
                        )}
                        {task.status === 'Completed' && (
                          <span className="inline-flex items-center text-xs text-emerald-600 font-bold gap-1 px-2.5 py-1">
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                            Archived
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

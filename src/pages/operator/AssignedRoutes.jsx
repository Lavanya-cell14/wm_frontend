import React, { useState, useEffect } from 'react';
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
import Pagination from '../../components/ui/Pagination';
import { Map, Plus, RefreshCw, Compass, Play, CheckCircle2, RotateCw } from 'lucide-react';

export default function AssignedRoutes() {
  const { user } = useAuth();
  const { routes: contextRoutes, logAudit } = useWarehouse();
  
  const [toastMessage, setToastMessage] = useState('');
  const [loadingRouteId, setLoadingRouteId] = useState('');
  const [routesList, setRoutesList] = useState([
    ...contextRoutes,
    { id: 'RTE-102', from: 'Receiving Dock B', to: 'BIN-C-04-12', distance: '120m', time: '8 mins', operator: 'AGV Operator', status: 'Pending' },
    { id: 'RTE-103', from: 'Zone A (BIN-A-01-05)', to: 'Shipping Bay C', distance: '45m', time: '3 mins', operator: 'AGV Operator', status: 'Completed' },
    { id: 'RTE-104', from: 'Zone B (BIN-B-10-01)', to: 'Quarantine Area', distance: '85m', time: '5 mins', operator: 'System Auto', status: 'Completed' }
  ]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination parameters
  const itemsPerPage = 8;
  const totalPages = Math.ceil(routesList.length / itemsPerPage);
  const paginatedRoutesList = routesList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDispatchRoute = (id) => {
    setLoadingRouteId(id);
    setTimeout(() => {
      setLoadingRouteId('');
      setRoutesList(prev => 
        prev.map(r => r.id === id ? { ...r, status: 'Active' } : r)
      );
      logAudit(
        user?.email || 'operator@warehouseai.com',
        'OPERATOR',
        'AGV_ROUTE_DISPATCH',
        'AGV Routing',
        `Dispatched automated robotic vehicle on route ${id}`
      );
      showToast(`Robotic AGV dispatched successfully on Route ${id}!`);
    }, 1200);
  };

  const handleOptimizeRoute = (id) => {
    setLoadingRouteId(`opt-${id}`);
    setTimeout(() => {
      setLoadingRouteId('');
      setRoutesList(prev => 
        prev.map(r => {
          if (r.id === id) {
            // Simulated optimization: reduces distance/time
            const distNum = parseInt(r.distance);
            const optimizedDist = Math.max(15, Math.round(distNum * 0.85));
            const optimizedTime = Math.max(1, Math.round(optimizedDist / 15));
            return {
              ...r,
              distance: `${optimizedDist}m`,
              time: `${optimizedTime} mins`
            };
          }
          return r;
        })
      );
      logAudit(
        user?.email || 'operator@warehouseai.com',
        'OPERATOR',
        'AGV_ROUTE_OPTIMIZE',
        'AGV Routing',
        `Re-optimized coordinates grid for route path ${id}`
      );
      showToast(`Dynamic path algorithm recalculated! Distance optimized for Route ${id}.`);
    }, 1500);
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
            <Map className="w-7 h-7 text-[#0071C1]" />
            Assigned Robot Travel Routes
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Dispatch, optimize, and oversee active automated paths between docks and zone storage locations.
          </p>
        </div>
        <Button className="gap-2 font-semibold" onClick={() => showToast('Create route dialog initiated.')}>
          <Plus className="w-4 h-4" />
          Propose Manual Path
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-slate-50/50 flex flex-row justify-between items-center pb-4">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Platform Path Queue</CardTitle>
            <CardDescription>Live list of robot routes, expected arrival times, and active telemetry states.</CardDescription>
          </div>
          <Badge variant="primary">{routesList.length} Total Routes</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route ID</TableHead>
                <TableHead>Origin / Source</TableHead>
                <TableHead>Destination / Bin</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Estimated Duration</TableHead>
                <TableHead>Assigned Operator</TableHead>
                <TableHead>Path Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRoutesList.map((route) => {
                let badgeVariant = 'default';
                if (route.status === 'Active') badgeVariant = 'primary';
                else if (route.status === 'Completed') badgeVariant = 'success';
                else if (route.status === 'Pending') badgeVariant = 'warning';

                return (
                  <TableRow key={route.id} className="hover:bg-slate-50/20 transition-colors">
                    {/* ID */}
                    <TableCell className="font-bold font-mono text-[10px] text-gray-900">{route.id}</TableCell>

                    {/* From */}
                    <TableCell className="font-semibold text-xs text-gray-800">{route.from}</TableCell>

                    {/* To */}
                    <TableCell className="font-semibold text-xs text-[#0071C1] font-mono">{route.to}</TableCell>

                    {/* Distance */}
                    <TableCell className="text-xs text-gray-500 font-medium font-mono">{route.distance}</TableCell>

                    {/* Duration */}
                    <TableCell className="text-xs text-gray-500 font-medium font-mono">{route.time}</TableCell>

                    {/* Operator */}
                    <TableCell className="text-xs text-gray-600 font-semibold">{route.operator}</TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant={badgeVariant} className="text-[10px] uppercase font-bold tracking-wider">
                        {route.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {route.status === 'Pending' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[10px] h-7 px-2 font-bold hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                            onClick={() => handleDispatchRoute(route.id)}
                            disabled={!!loadingRouteId}
                          >
                            {loadingRouteId === route.id ? (
                              <RotateCw className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3 mr-1" />
                            )}
                            Dispatch
                          </Button>
                        )}
                        {route.status !== 'Completed' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[10px] h-7 px-2 font-bold text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                            onClick={() => handleOptimizeRoute(route.id)}
                            disabled={!!loadingRouteId}
                          >
                            {loadingRouteId === `opt-${route.id}` ? (
                              <RotateCw className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Compass className="w-3 h-3 mr-1" />
                            )}
                            Optimize
                          </Button>
                        )}
                        {route.status === 'Completed' && (
                          <span className="inline-flex items-center text-xs text-emerald-600 font-bold gap-1 px-2.5 py-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={routesList.length}
            pageSize={itemsPerPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}

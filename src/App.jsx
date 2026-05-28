import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WarehouseProvider } from './context/WarehouseContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Login Page
import Login from './pages/Login';

// Manager Pages
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ProductIntelligence from './pages/ProductIntelligence';
import Warehouse from './pages/Warehouse';
import ZonesBins from './pages/ZonesBins';
import Inbound from './pages/Inbound';
import Orders from './pages/Orders';
import Movements from './pages/Movements';
import Analytics from './pages/Analytics';
import AuditLogs from './pages/AuditLogs';
import UsersRoles from './pages/UsersRoles';
import DigitalTwin from './pages/DigitalTwin';
import RoutesOptimization from './pages/RoutesOptimization';
import AiRecommendations from './pages/AiRecommendations';
import AiCopilot from './pages/AiCopilot';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import ProductScanner from './pages/staff/ProductScanner';
import InboundTasks from './pages/staff/InboundTasks';
import PutawayTasks from './pages/staff/PutawayTasks';
import MovementTracking from './pages/staff/MovementTracking';

// Clerk Pages
import ClerkDashboard from './pages/clerk/ClerkDashboard';
import InventoryList from './pages/clerk/InventoryList';
import StockAdjustment from './pages/clerk/StockAdjustment';
import DamagedStock from './pages/clerk/DamagedStock';
import ReservedStock from './pages/clerk/ReservedStock';
import ProductLookup from './pages/clerk/ProductLookup';
import MovementHistory from './pages/clerk/MovementHistory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import RoleManagement from './pages/admin/RoleManagement';
import WarehouseSettings from './pages/admin/WarehouseSettings';
import SystemHealth from './pages/admin/SystemHealth';

// Operator Pages
import RouteDashboard from './pages/operator/RouteDashboard';
import AssignedRoutes from './pages/operator/AssignedRoutes';
import MovementTasks from './pages/operator/MovementTasks';
import TwinRouteView from './pages/operator/TwinRouteView';
import AgvTracking from './pages/operator/AgvTracking';

const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-[60vh] text-gray-500">
    <h1 className="text-2xl font-semibold">{title} Page Coming Soon</h1>
  </div>
);

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'MANAGER': return <Navigate to="/manager/dashboard" replace />;
    case 'STAFF': return <Navigate to="/staff/dashboard" replace />;
    case 'INVENTORY_CLERK': return <Navigate to="/inventory/dashboard" replace />;
    case 'ADMIN': return <Navigate to="/admin/dashboard" replace />;
    case 'OPERATOR': return <Navigate to="/operator/dashboard" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <WarehouseProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RootRedirect />} />
            
            {/* MANAGER ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
              <Route path="/manager/dashboard" element={<Dashboard />} />
              <Route path="/warehouse" element={<Warehouse />} />
              <Route path="/zones-bins" element={<ZonesBins />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/product-intelligence" element={<ProductIntelligence />} />
              <Route path="/inbound" element={<Inbound />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/movements" element={<Movements />} />
              <Route path="/digital-twin" element={<DigitalTwin />} />
              <Route path="/routes" element={<RoutesOptimization />} />
              <Route path="/ai-recommendations" element={<AiRecommendations />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Route>

            {/* STAFF ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/scanner" element={<ProductScanner />} />
              <Route path="/staff/inbound" element={<InboundTasks />} />
              <Route path="/staff/putaway" element={<PutawayTasks />} />
              <Route path="/staff/movements" element={<MovementTracking />} />
            </Route>

            {/* INVENTORY CLERK ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['INVENTORY_CLERK']} />}>
              <Route path="/inventory/dashboard" element={<ClerkDashboard />} />
              <Route path="/inventory/list" element={<InventoryList />} />
              <Route path="/inventory/adjust" element={<StockAdjustment />} />
              <Route path="/inventory/damaged" element={<DamagedStock />} />
              <Route path="/inventory/reserved" element={<ReservedStock />} />
              <Route path="/inventory/lookup" element={<ProductLookup />} />
              <Route path="/inventory/movements" element={<MovementHistory />} />
            </Route>

            {/* ADMIN ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/roles" element={<RoleManagement />} />
              <Route path="/admin/settings" element={<WarehouseSettings />} />
              <Route path="/admin/audit" element={<AuditLogs />} />
              <Route path="/admin/health" element={<SystemHealth />} />
            </Route>

            {/* OPERATOR ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['OPERATOR']} />}>
              <Route path="/operator/dashboard" element={<RouteDashboard />} />
              <Route path="/operator/routes" element={<AssignedRoutes />} />
              <Route path="/operator/movements" element={<MovementTasks />} />
              <Route path="/operator/twin" element={<TwinRouteView />} />
              <Route path="/operator/tracking" element={<AgvTracking />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </WarehouseProvider>
    </AuthProvider>
  );
}

export default App;

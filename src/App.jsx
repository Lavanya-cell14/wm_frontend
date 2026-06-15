import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WarehouseProvider } from './context/WarehouseContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Login Page
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Warehouse from './pages/Warehouse';
import ZonesBins from './pages/ZonesBins';
import Inbound from './pages/Inbound';
import Movements from './pages/Movements';
import Analytics from './pages/Analytics';
import AuditLogs from './pages/AuditLogs';
import DigitalTwin from './pages/DigitalTwin';
import RoutesOptimization from './pages/RoutesOptimization';
import AiRecommendations from './pages/AiRecommendations';
import OcrUpload from './pages/OcrUpload';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import ProductScanner from './pages/staff/ProductScanner';
import InboundTasks from './pages/staff/InboundTasks';
import PutawayTasks from './pages/staff/PutawayTasks';
import MovementTracking from './pages/staff/MovementTracking';
import ActiveTask from './pages/staff/ActiveTask';
import RouteGuidance from './pages/staff/RouteGuidance';
import CompletedTasks from './pages/staff/CompletedTasks';

// Clerk Pages
import ClerkDashboard from './pages/clerk/ClerkDashboard';
import InventoryList from './pages/clerk/InventoryList';
import StockAdjustment from './pages/clerk/StockAdjustment';
import DamagedStock from './pages/clerk/DamagedStock';
import ReservedStock from './pages/clerk/ReservedStock';
import ProductLookup from './pages/clerk/ProductLookup';
import MovementHistory from './pages/clerk/MovementHistory';
import OcrVerification from './pages/OcrVerification';
import InboundProducts from './pages/clerk/InboundProducts';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import RoleManagement from './pages/admin/RoleManagement';
import WarehouseSettings from './pages/admin/WarehouseSettings';
import SystemHealth from './pages/admin/SystemHealth';


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
              <Route path="/inbound" element={<Inbound />} />
              <Route path="/movements" element={<Movements />} />
              <Route path="/digital-twin" element={<DigitalTwin />} />
              <Route path="/routes" element={<RoutesOptimization />} />
              <Route path="/ai-recommendations" element={<AiRecommendations />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>



            {/* STAFF ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/scanner" element={<ProductScanner />} />
              <Route path="/staff/inbound" element={<InboundTasks />} />
              <Route path="/staff/putaway" element={<PutawayTasks />} />
              <Route path="/staff/movements" element={<MovementTracking />} />
              <Route path="/staff/active" element={<ActiveTask />} />
              <Route path="/staff/route-guidance" element={<RouteGuidance />} />
              <Route path="/staff/completed" element={<CompletedTasks />} />
            </Route>

            {/* INVENTORY CLERK ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['INVENTORY_CLERK']} />}>
              <Route path="/inventory/dashboard" element={<ClerkDashboard />} />
              <Route path="/ocr-upload" element={<OcrUpload />} />
              <Route path="/ocr-verification" element={<OcrVerification />} />
              <Route path="/inventory/inbound" element={<InboundProducts />} />
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

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </WarehouseProvider>
    </AuthProvider>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { WarehouseProvider } from './context/WarehouseContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';

import RoleSelection from './pages/RoleSelection';

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
import ManagerReports from './pages/Reports';
import AiCopilot from './pages/AiCopilot';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import ProductScanner from './pages/staff/ProductScanner';
import InboundTasks from './pages/staff/InboundTasks';
import PutawayTasks from './pages/staff/PutawayTasks';
import MovementTracking from './pages/staff/MovementTracking';
import ActiveTask from './pages/staff/ActiveTask';
import RouteGuidance from './pages/staff/RouteGuidance';
import CompletedTasks from './pages/staff/CompletedTasks';
import PlacementGuidance from './pages/staff/PlacementGuidance';

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
import OcrCenterLanding from './pages/clerk/OcrCenterLanding';
import OcrHistory from './pages/clerk/OcrHistory';
import ProductsPage from './pages/clerk/ProductsPage';
import InventoryPage from './pages/clerk/InventoryPage';
import RecommendationsPage from './pages/clerk/RecommendationsPage';
import AllocationsPage from './pages/clerk/AllocationsPage';
import Orders from './pages/Orders';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import RoleManagement from './pages/admin/RoleManagement';
import WarehouseSettings from './pages/admin/WarehouseSettings';
import SystemHealth from './pages/admin/SystemHealth';
import WarehouseTree from './pages/admin/WarehouseTree';
import WarehouseList from './pages/admin/WarehouseList';
import ZoneGroupList from './pages/admin/ZoneGroupList';
import ZoneList from './pages/admin/ZoneList';
import AisleList from './pages/admin/AisleList';
import RackList from './pages/admin/RackList';
import ShelfList from './pages/admin/ShelfList';
import BinList from './pages/admin/BinList';
import Reports from './pages/admin/Reports';
import NavigationNodes from './pages/admin/NavigationNodes';
import NavigationEdges from './pages/admin/NavigationEdges';
import WalkingPaths from './pages/admin/WalkingPaths';
import WarehouseSetupLanding from './pages/admin/WarehouseSetupLanding';
import NavigationSetupLanding from './pages/admin/NavigationSetupLanding';

const LayoutWrapper = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

function App() {
  return (
    <AuthProvider>
      <WarehouseProvider>
        <Router>
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          
          {/* DASHBOARD ROUTES WITH MAIN LAYOUT */}
          <Route element={<LayoutWrapper />}>
            {/* WAREHOUSE MANAGER ROUTES */}
            <Route path="/manager/dashboard" element={<Dashboard />} />
            <Route path="/manager/analytics" element={<Analytics />} />
            <Route path="/manager/digital-twin" element={<DigitalTwin />} />
            <Route path="/manager/ai-assistant" element={<AiCopilot />} />
            <Route path="/manager/reports" element={<ManagerReports />} />

            {/* Redirects for legacy manager paths */}
            <Route path="/analytics" element={<Navigate to="/manager/analytics" replace />} />
            <Route path="/digital-twin" element={<Navigate to="/manager/digital-twin" replace />} />
            <Route path="/warehouse" element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="/zones-bins" element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="/inventory" element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="/inbound" element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="/movements" element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="/routes" element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="/ai-recommendations" element={<Navigate to="/manager/dashboard" replace />} />

            {/* WAREHOUSE OPERATOR ROUTES */}
            <Route path="/operator/dashboard" element={<StaffDashboard />} />
            <Route path="/operator/storage-tasks" element={<PutawayTasks />} />
            <Route path="/operator/navigation" element={<RouteGuidance />} />
            <Route path="/operator/placement-guidance" element={<PlacementGuidance />} />
            <Route path="/operator/completed-tasks" element={<CompletedTasks />} />
            <Route path="/operator/active" element={<ActiveTask />} />
            
            {/* Internal / Secondary operator routes */}
            <Route path="/operator/scanner" element={<ProductScanner />} />
            <Route path="/operator/inbound" element={<InboundTasks />} />
            <Route path="/operator/movements" element={<MovementTracking />} />

            {/* Redirects for legacy staff routes */}
            <Route path="/staff/dashboard" element={<Navigate to="/operator/dashboard" replace />} />
            <Route path="/staff/putaway" element={<Navigate to="/operator/storage-tasks" replace />} />
            <Route path="/staff/active" element={<Navigate to="/operator/active" replace />} />
            <Route path="/staff/route-guidance" element={<Navigate to="/operator/navigation" replace />} />
            <Route path="/staff/completed" element={<Navigate to="/operator/completed-tasks" replace />} />
            <Route path="/staff/scanner" element={<Navigate to="/operator/scanner" replace />} />
            <Route path="/staff/inbound" element={<Navigate to="/operator/inbound" replace />} />
            <Route path="/staff/movements" element={<Navigate to="/operator/movements" replace />} />

            {/* RECEIVING & INVENTORY OFFICER ROUTES */}
            <Route path="/inventory/dashboard" element={<ClerkDashboard />} />
            <Route path="/inventory/ocr-center" element={<OcrCenterLanding />} />
            <Route path="/inventory/ocr-upload" element={<OcrUpload />} />
            <Route path="/inventory/ocr-review" element={<OcrVerification />} />
            <Route path="/inventory/ocr-history" element={<OcrHistory />} />
            <Route path="/inventory/products" element={<ProductsPage />} />
            <Route path="/inventory/inventory" element={<InventoryPage />} />
            <Route path="/inventory/recommendations" element={<RecommendationsPage />} />
            <Route path="/inventory/allocations" element={<AllocationsPage />} />
            <Route path="/inventory/orders" element={<Orders />} />
            
            {/* Fallback/compatibility routes */}
            <Route path="/ocr-upload" element={<OcrUpload />} />
            <Route path="/ocr-verification" element={<OcrVerification />} />
            <Route path="/inventory/inbound" element={<InboundProducts />} />
            <Route path="/inventory/list" element={<InventoryList />} />
            <Route path="/inventory/adjust" element={<StockAdjustment />} />
            <Route path="/inventory/damaged" element={<DamagedStock />} />
            <Route path="/inventory/reserved" element={<ReservedStock />} />
            <Route path="/inventory/lookup" element={<ProductLookup />} />
            <Route path="/inventory/movements" element={<MovementHistory />} />

            {/* ADMIN ROUTES */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/warehouse-setup" element={<WarehouseSetupLanding />} />
            <Route path="/admin/navigation-setup" element={<NavigationSetupLanding />} />
            <Route path="/admin/structure-tree" element={<WarehouseTree />} />
            <Route path="/admin/warehouses" element={<WarehouseList />} />
            <Route path="/admin/zone-groups" element={<ZoneGroupList />} />
            <Route path="/admin/zones" element={<ZoneList />} />
            <Route path="/admin/aisles" element={<AisleList />} />
            <Route path="/admin/racks" element={<RackList />} />
            <Route path="/admin/shelves" element={<ShelfList />} />
            <Route path="/admin/bins" element={<BinList />} />
            <Route path="/admin/nav-nodes" element={<NavigationNodes />} />
            <Route path="/admin/nav-edges" element={<NavigationEdges />} />
            <Route path="/admin/walking-paths" element={<WalkingPaths />} />
            <Route path="/admin/walking_paths" element={<Navigate to="/admin/walking-paths" replace />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/roles" element={<RoleManagement />} />
            <Route path="/admin/settings" element={<WarehouseSettings />} />
            <Route path="/admin/reports" element={<Reports />} />
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

import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { WarehouseProvider, useWarehouse } from './context/WarehouseContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import LoadingSkeleton from './components/shared/LoadingSkeleton';

// Eager load critical/entry page
import RoleSelection from './pages/RoleSelection';

// Lazy load Manager Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Warehouse = lazy(() => import('./pages/Warehouse'));
const ZonesBins = lazy(() => import('./pages/ZonesBins'));
const Inbound = lazy(() => import('./pages/Inbound'));
const Movements = lazy(() => import('./pages/Movements'));
const Analytics = lazy(() => import('./pages/Analytics'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const DigitalTwin = lazy(() => import('./pages/DigitalTwin'));
const RoutesOptimization = lazy(() => import('./pages/RoutesOptimization'));
const AiRecommendations = lazy(() => import('./pages/AiRecommendations'));
const OcrUpload = lazy(() => import('./pages/OcrUpload'));
const ManagerReports = lazy(() => import('./pages/Reports'));
const AiCopilot = lazy(() => import('./pages/AiCopilot'));

// Lazy load Staff Pages
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
const ProductScanner = lazy(() => import('./pages/staff/ProductScanner'));
const InboundTasks = lazy(() => import('./pages/staff/InboundTasks'));
const PutawayTasks = lazy(() => import('./pages/staff/PutawayTasks'));
const MovementTracking = lazy(() => import('./pages/staff/MovementTracking'));
const ActiveTask = lazy(() => import('./pages/staff/ActiveTask'));
const RouteGuidance = lazy(() => import('./pages/staff/RouteGuidance'));
const PlacementGuidance = lazy(() => import('./pages/staff/PlacementGuidance'));

// Lazy load Clerk Pages
const ClerkDashboard = lazy(() => import('./pages/clerk/ClerkDashboard'));
const InventoryList = lazy(() => import('./pages/clerk/InventoryList'));
const StockAdjustment = lazy(() => import('./pages/clerk/StockAdjustment'));
const DamagedStock = lazy(() => import('./pages/clerk/DamagedStock'));
const ReservedStock = lazy(() => import('./pages/clerk/ReservedStock'));
const ProductLookup = lazy(() => import('./pages/clerk/ProductLookup'));
const MovementHistory = lazy(() => import('./pages/clerk/MovementHistory'));
const OcrVerification = lazy(() => import('./pages/OcrVerification'));
const InboundProducts = lazy(() => import('./pages/clerk/InboundProducts'));
const OcrCenterLanding = lazy(() => import('./pages/clerk/OcrCenterLanding'));
const OcrHistory = lazy(() => import('./pages/clerk/OcrHistory'));
const ProductsPage = lazy(() => import('./pages/clerk/ProductsPage'));
const InventoryPage = lazy(() => import('./pages/clerk/InventoryPage'));
const RecommendationsPage = lazy(() => import('./pages/clerk/RecommendationsPage'));
const AllocationsPage = lazy(() => import('./pages/clerk/AllocationsPage'));
const Orders = lazy(() => import('./pages/Orders'));

// Lazy load Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const RoleManagement = lazy(() => import('./pages/admin/RoleManagement'));
const WarehouseSettings = lazy(() => import('./pages/admin/WarehouseSettings'));
const SystemHealth = lazy(() => import('./pages/admin/SystemHealth'));
const WarehouseTree = lazy(() => import('./pages/admin/WarehouseTree'));
const WarehouseList = lazy(() => import('./pages/admin/WarehouseList'));
const ZoneGroupList = lazy(() => import('./pages/admin/ZoneGroupList'));
const ZoneList = lazy(() => import('./pages/admin/ZoneList'));
const AisleList = lazy(() => import('./pages/admin/AisleList'));
const RackList = lazy(() => import('./pages/admin/RackList'));
const ShelfList = lazy(() => import('./pages/admin/ShelfList'));
const BinList = lazy(() => import('./pages/admin/BinList'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const NavigationNodes = lazy(() => import('./pages/admin/NavigationNodes'));
const NavigationEdges = lazy(() => import('./pages/admin/NavigationEdges'));
const WalkingPaths = lazy(() => import('./pages/admin/WalkingPaths'));
const WarehouseSetupLanding = lazy(() => import('./pages/admin/WarehouseSetupLanding'));
const NavigationSetupLanding = lazy(() => import('./pages/admin/NavigationSetupLanding'));

const LayoutWrapper = () => {
  const location = useLocation();
  const warehouse = useWarehouse();

  React.useEffect(() => {
    const path = location.pathname;
    
    // Check path patterns and trigger appropriate API fetches silently
    if (path === '/manager/dashboard') {
      warehouse.fetchWarehouseStructure?.(true);
      warehouse.fetchInventoryData?.(true);
      warehouse.fetchInboundData?.(true);
      warehouse.fetchPutawayTasks?.(true);
      warehouse.fetchOcrDocuments?.(true);
    } else if (path === '/manager/analytics') {
      warehouse.fetchInventoryData?.(true);
      warehouse.fetchWarehouseStructure?.(true);
      warehouse.fetchPutawayTasks?.(true);
      warehouse.fetchOcrDocuments?.(true);
    } else if (path === '/manager/digital-twin') {
      warehouse.fetchWarehouseStructure?.(true);
      warehouse.fetchInventoryData?.(true);
    } else if (path === '/manager/inventory') {
      warehouse.fetchInventoryData?.(true);
      warehouse.fetchWarehouseStructure?.(true);
    } else if (path === '/manager/reports') {
      warehouse.fetchPutawayTasks?.(true);
      warehouse.fetchOcrDocuments?.(true);
      warehouse.fetchInventoryData?.(true);
    } else if (path === '/manager/audit') {
      warehouse.fetchUsers?.(true);
      warehouse.fetchAuditLogs?.(true);
    } else if (path === '/manager/orders') {
      warehouse.fetchOrders?.(true);
    } else if (path === '/manager/routes') {
      warehouse.fetchRoutes?.(true);
    } else if (path.startsWith('/operator/dashboard')) {
      warehouse.fetchPutawayTasks?.(true);
      warehouse.fetchRecommendations?.(true);
    } else if (path.startsWith('/operator/storage-tasks')) {
      warehouse.fetchPutawayTasks?.(true);
    } else if (path.startsWith('/operator/navigation')) {
      warehouse.fetchPutawayTasks?.(true);
      warehouse.fetchWarehouseStructure?.(true);
      warehouse.fetchInventoryData?.(true);
    } else if (path.startsWith('/operator/placement-guidance')) {
      warehouse.fetchPutawayTasks?.(true);
    } else if (path.startsWith('/operator/active')) {
      warehouse.fetchPutawayTasks?.(true);
    } else if (path.startsWith('/operator/scanner')) {
      warehouse.fetchRecommendations?.(true);
    } else if (path.startsWith('/operator/inbound')) {
      warehouse.fetchInboundData?.(true);
    } else if (path.startsWith('/operator/movements')) {
      warehouse.fetchMovements?.(true);
    } else if (path.startsWith('/inventory/dashboard')) {
      warehouse.fetchInventoryData?.(true);
      warehouse.fetchOcrDocuments?.(true);
      warehouse.fetchInboundData?.(true);
      warehouse.fetchRecommendations?.(true);
    } else if (path.startsWith('/inventory/ocr-')) {
      warehouse.fetchOcrDocuments?.(true);
    } else if (path.startsWith('/inventory/recommendations')) {
      warehouse.fetchUsers?.(true);
      warehouse.fetchInboundData?.(true);
      warehouse.fetchPutawayTasks?.(true);
    } else if (path.startsWith('/inventory/allocations')) {
      warehouse.fetchInboundData?.(true);
    } else if (path.startsWith('/admin/dashboard')) {
      warehouse.fetchWarehouseStructure?.(true);
      warehouse.fetchInventoryData?.(true);
      warehouse.fetchUsers?.(true);
      warehouse.fetchOcrDocuments?.(true);
      warehouse.fetchAuditLogs?.(true);
    } else if (
      path.startsWith('/admin/warehouse-setup') ||
      path.startsWith('/admin/navigation-setup') ||
      path.startsWith('/admin/structure-tree') ||
      path.startsWith('/admin/warehouses') ||
      path.startsWith('/admin/zone-groups') ||
      path.startsWith('/admin/zones') ||
      path.startsWith('/admin/aisles') ||
      path.startsWith('/admin/racks') ||
      path.startsWith('/admin/shelves') ||
      path.startsWith('/admin/bins') ||
      path.startsWith('/admin/nav-nodes') ||
      path.startsWith('/admin/nav-edges') ||
      path.startsWith('/admin/walking-paths') ||
      path.startsWith('/admin/settings') ||
      path.startsWith('/admin/reports')
    ) {
      warehouse.fetchWarehouseStructure?.(true);
    } else if (path.startsWith('/admin/users') || path.startsWith('/admin/roles')) {
      warehouse.fetchUsers?.(true);
    } else if (path.startsWith('/admin/audit')) {
      warehouse.fetchAuditLogs?.(true);
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MainLayout>
      <Suspense fallback={<LoadingSkeleton />}>
        <Outlet />
      </Suspense>
    </MainLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WarehouseProvider>
          <Router>
            <Suspense fallback={<LoadingSkeleton />}>
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
                  <Route path="/manager/inventory" element={<Inventory />} />
                  <Route path="/manager/orders" element={<Orders />} />
                  <Route path="/manager/routes" element={<RoutesOptimization />} />
                  <Route path="/manager/audit" element={<AuditLogs />} />

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
                  <Route path="/staff/completed" element={<Navigate to="/operator/dashboard" replace />} />
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
            </Suspense>
          </Router>
        </WarehouseProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

# Implementation Plan: Admin Dashboard and Sidebar Refactoring

This plan outlines the changes needed to realign the Admin role UI to focus solely on platform configuration, setup, monitoring, reports, and settings, in alignment with backend requirements.

## User Review Required

> [!IMPORTANT]
> Admin users will no longer see operational screens (e.g., OCR verification, inbound processing, active scanner, digital twin layouts). All of these actions are moved exclusively to Manager, Staff, or Inventory Clerk dashboards.
> A new Navigation Setup section is introduced for defining routing networks: Navigation Nodes, Navigation Edges, and Walking Paths.

---

## Proposed Changes

### Navigation Configuration & Sidebar Refactoring

#### [MODIFY] [sidebarItems.js](file:///d:/wm_frontend/src/data/sidebarItems.js)
*   Clean the Admin sidebar array to show only:
    *   Dashboard
    *   Warehouse Setup (sub-items: Warehouses, Zone Groups, Zones, Aisles, Racks, Shelves, Bins)
    *   Navigation Setup (sub-items: Navigation Nodes, Navigation Edges, Walking Paths)
    *   Users
    *   System Monitoring
    *   Reports
    *   Settings
*   Strictly remove all other operational nodes.

#### [MODIFY] [App.jsx](file:///d:/wm_frontend/src/App.jsx)
*   Import new Navigation Setup pages (`NavigationNodes`, `NavigationEdges`, `WalkingPaths`).
*   Map Admin routes for navigation setup:
    *   `/admin/nav-nodes` ──> `NavigationNodes`
    *   `/admin/nav-edges` ──> `NavigationEdges`
    *   `/admin/walking-paths` ──> `WalkingPaths`

#### [NEW] [NavigationNodes.jsx](file:///d:/wm_frontend/src/pages/admin/NavigationNodes.jsx)
*   Create a data grid and form interface for creating, viewing, editing, and deleting **Navigation Nodes** (Node ID, Label, Coordinates X/Y/Z, Type, Status) with mock data and edit actions.

#### [NEW] [NavigationEdges.jsx](file:///d:/wm_frontend/src/pages/admin/NavigationEdges.jsx)
*   Create a grid and form interface for managing **Navigation Edges** (Edge ID, Source Node, Target Node, Distance in meters, Direction Type, Status).

#### [NEW] [WalkingPaths.jsx](file:///d:/wm_frontend/src/pages/admin/WalkingPaths.jsx)
*   Create a grid and form interface for managing **Walking Paths** (Path ID, Name, Nodes Sequence, Total Distance, Role Restrictions, Status).

---

### Page Refactoring

#### [MODIFY] [AdminDashboard.jsx](file:///d:/wm_frontend/src/pages/admin/AdminDashboard.jsx)
*   Redesign Dashboard to show exactly 6 KPI cards:
    1.  Total Warehouses
    2.  Total Users
    3.  Total Products
    4.  Total Inventory (aggregated stock counts)
    5.  Total OCR Documents
    6.  System Health
*   Render detailed summary grids below:
    1.  *Warehouse Setup Summary* (Counts, read-only occupancy).
    2.  *User Management Summary* (Active/Inactive counts, distributions, activity list).
    3.  *System Monitoring Summary* (Microservice status tables).
    4.  *Recent Admin Activities* (Audited layout mutations, user provision, settings updates).
    5.  *Quick Actions* (Branded buttons for adding warehouse/user, checking monitoring/reports).

#### [MODIFY] [Reports.jsx](file:///d:/wm_frontend/src/pages/admin/Reports.jsx)
*   Update the reports listed in the UI to focus strictly on Admin reports:
    1.  Warehouse Structure Report
    2.  User Activity Report
    3.  System Health Report
    4.  OCR Document Count Report
    5.  Inventory Summary Report

#### [MODIFY] [WarehouseSettings.jsx](file:///d:/wm_frontend/src/pages/admin/WarehouseSettings.jsx)
*   Ensure Settings focuses strictly on:
    *   Platform name & Branding
    *   Session timeout
    *   Notification settings (Email/SMS toggle placeholders)
    *   System warning thresholds
    *   Report retention settings

---

## Verification Plan

### Automated Checks
*   Verify successful Vite builds: `npm run build`

### Manual Verification
*   Log in as System Admin (`admin@warehouseai.com`) and verify that ONLY configuration, users, navigation, system monitoring, settings, and reports are present in the sidebar.
*   Check that CRUD dialogs function properly for all Warehouse Setup and Navigation Setup layers.

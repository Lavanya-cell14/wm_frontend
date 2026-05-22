cd d:\wm_frontend\src

New-Item -Path "components\layout", "components\ui", "components\dashboard", "components\inventory", "components\productTracking", "data" -ItemType Directory -Force | Out-Null

if (Test-Path "layouts\MainLayout.jsx") { Move-Item -Path "layouts\MainLayout.jsx" -Destination "components\layout\MainLayout.jsx" -Force }
if (Test-Path "components\Sidebar.jsx") { Move-Item -Path "components\Sidebar.jsx" -Destination "components\layout\Sidebar.jsx" -Force }
if (Test-Path "components\Navbar.jsx") { Move-Item -Path "components\Navbar.jsx" -Destination "components\layout\Topbar.jsx" -Force }
if (Test-Path "components\StatCard.jsx") { Move-Item -Path "components\StatCard.jsx" -Destination "components\dashboard\StatCard.jsx" -Force }

if (Test-Path "layouts" -and @(Get-ChildItem -Path "layouts").Count -eq 0) { Remove-Item -Path "layouts" -Recurse -Force }

$uiFiles = "Button.jsx", "Card.jsx", "Input.jsx", "Badge.jsx", "Table.jsx"
foreach ($file in $uiFiles) {
    $name = $file.Replace(".jsx","")
    if (!(Test-Path "components\ui\$file")) {
        $content = "export default function " + $name + "() { return <div>" + $name + "</div>; }"
        Out-File -FilePath "components\ui\$file" -InputObject $content -Encoding utf8
    }
}

if (!(Test-Path "components\dashboard\RecentActivity.jsx")) {
    Out-File -FilePath "components\dashboard\RecentActivity.jsx" -InputObject "export default function RecentActivity() { return <div>RecentActivity</div>; }" -Encoding utf8
}

$invFiles = "InventoryTable.jsx", "StockStatusBadge.jsx"
foreach ($file in $invFiles) {
    $name = $file.Replace(".jsx","")
    if (!(Test-Path "components\inventory\$file")) {
        $content = "export default function " + $name + "() { return <div>" + $name + "</div>; }"
        Out-File -FilePath "components\inventory\$file" -InputObject $content -Encoding utf8
    }
}

$ptFiles = "ProductCard.jsx", "TrackingStatus.jsx"
foreach ($file in $ptFiles) {
    $name = $file.Replace(".jsx","")
    if (!(Test-Path "components\productTracking\$file")) {
        $content = "export default function " + $name + "() { return <div>" + $name + "</div>; }"
        Out-File -FilePath "components\productTracking\$file" -InputObject $content -Encoding utf8
    }
}

if (!(Test-Path "data\sidebarItems.js")) {
    Out-File -FilePath "data\sidebarItems.js" -InputObject "export const sidebarItems = [];" -Encoding utf8
}

$newPages = "ProductTracking.jsx", "Analytics.jsx"
foreach ($page in $newPages) {
    $name = $page.Replace(".jsx","")
    if (!(Test-Path "pages\$page")) {
        $content = "export default function " + $name + "() { return <div>" + $name + "</div>; }"
        Out-File -FilePath "pages\$page" -InputObject $content -Encoding utf8
    }
}

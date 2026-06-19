import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, SearchFilterBar, StatCard, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from 'shared-ui';
import { Package, Plus, ChevronRight, Filter, Info, Eye, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../services/productService';
import { getInventory } from '../../services/inventoryService';

// [TEMPORARY LOOKUP - REMOVE WHEN CATEGORY API IS FINALIZED]
const CATEGORY_LOOKUP = {
  '408dd788-9c1b-464c-94a4-866727fddbb8': 'Wireless Devices',
  'dc5340ad-fdb0-415d-8d94-75eff6a9610f': 'Power Chargers & Adapters',
  '1bd76b1d-75b0-4b61-ad85-0c16e7def7a3': 'Earbuds & Audio',
  '0c3d3fab-fbab-4306-8b60-e2e7676fdd3e': 'Fasteners & Hardware',
  'bfacdace-cde8-482b-8795-52ffd4edba92': 'Scanner Accessories',
};

const normalizeApiProduct = (p, invRecords = []) => {
  const inv = invRecords.find(i => i.product === p.id);
  return {
    sku: p.sku,
    name: p.product_name,
    category: CATEGORY_LOOKUP[p.category] || 'General',
    weight: p.weight ? `${Number(p.weight)} kg` : 'N/A',
    dimensions: 'N/A', // Derived Spec UI value
    reorderLevel: 10,  // Derived Spec UI value
    quantity: inv ? inv.total_quantity : 0,
    reserved: inv ? inv.reserved_quantity : 0,
    damaged: inv ? inv.damaged_quantity : 0,
  };
};

const normalizeContextProduct = (item) => ({
  sku: item.sku,
  name: item.name,
  category: item.category,
  weight: item.weight,
  dimensions: item.dimensions,
  reorderLevel: item.reorderLevel,
  quantity: item.quantity,
  reserved: item.reserved,
  damaged: item.damaged,
});

export default function ProductsPage() {
  const navigate = useNavigate();
  const { inventory: contextInventory = [] } = useWarehouse();
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setApiError(null);
        // [TEMPORARY LOG FOR VERIFICATION]
        console.warn("[ProductsPage] Calling APIs: /api/products/, /api/inventory/");
        const [productsRes, inventoryRes] = await Promise.all([
          getProducts(),
          getInventory()
        ]);
        if (!cancelled) {
          const apiProducts = productsRes.results.map(p => 
            normalizeApiProduct(p, inventoryRes.results)
          );
          setProductsList(apiProducts);
          // [TEMPORARY LOG FOR VERIFICATION]
          console.warn(`[ProductsPage] API Success. URL: /api/products/, Status: 200, Count: ${apiProducts.length}, Fallback Used: false`);
        }
      } catch (err) {
        if (!cancelled) {
          const status = err.status || (err.code === 'NETWORK_ERROR' ? 0 : 'unknown');
          setApiError('Products Registry API unreachable — showing cached data.');
          const fallbackData = contextInventory.map(normalizeContextProduct);
          setProductsList(fallbackData);
          // [TEMPORARY LOG FOR VERIFICATION]
          console.warn(`[ProductsPage] API Error. URL: /api/products/, Status: ${status}, Count: ${fallbackData.length}, Fallback Used: true`, err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [contextInventory]);

  const inventory = productsList;

  // Extract unique categories
  const categoriesList = Array.from(new Set(inventory.map(p => p.category).filter(Boolean)));

  // Calculate KPIs
  const totalProducts = inventory.length;
  const categoriesCount = categoriesList.length;
  const totalStockCount = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const lowStockCount = inventory.filter(item => (item.quantity || 0) <= (item.reorderLevel || 0) && (item.quantity || 0) > 0).length;
  const outOfStockCount = inventory.filter(item => (item.quantity || 0) === 0).length;

  // Filter products
  const filteredProducts = inventory.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Header section with breadcrumb trail */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <span>Receiving & Inventory Officer</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0071C1]">Products</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-[#0071C1]" />
            Products Registry
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Browse and inspect unique SKUs, catalog specifications, cargo properties, and classification segments.
          </p>
        </div>
        <Button className="gap-2 font-semibold" onClick={() => alert('Add Product action pending backend integration.')}>
          <Plus className="w-4 h-4" />
          Add SKU
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Products" value={totalProducts} icon={Package} subtitle="Unique registered SKUs" />
        <StatCard title="Categories" value={categoriesCount} icon={Package} subtitle="Physical storage profiles" />
        <StatCard title="Total Stock Units" value={totalStockCount} icon={Package} subtitle="Aggregated inventory items" />
        <StatCard title="Low Stock Items" value={lowStockCount} icon={Package} subtitle="Below safety threshold" />
        <StatCard title="Out of Stock" value={outOfStockCount} icon={Package} subtitle="Depleted capacity slots" />
      </div>

      {/* Filters Toolbar */}
      <Card className="border border-gray-100 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <SearchFilterBar 
              searchPlaceholder="Search products by SKU or title..." 
              searchValue={searchQuery}
              onSearchChange={setSearchQuery} 
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-500">Filter Category:</span>
            <select
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs font-semibold bg-white p-2"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            Loading products from API...
          </div>
        )}

        {/* Error / fallback state */}
        {!loading && apiError && (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border-b border-amber-100 text-xs text-amber-800 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {apiError}
          </div>
        )}

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="p-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton rows while loading
                [1, 2, 3].map((n) => (
                  <TableRow key={n}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                      <TableCell key={c}>
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-500 font-semibold text-xs">
                    No products matching search parameters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => {
                  // Classify product based on category or stock status
                  let classification = 'Standard Storage';
                  if (product.category === 'Cold Storage' || product.category?.toLowerCase().includes('cold')) {
                    classification = 'Temperature Controlled';
                  } else if (product.category === 'Bulk Storage' || product.category?.toLowerCase().includes('bulk')) {
                    classification = 'Heavy Bulk Area';
                  } else if (product.category === 'Electronics') {
                    classification = 'High-Value Fragile';
                  }

                  return (
                    <TableRow key={product.sku} className="hover:bg-slate-50/20 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-[#0071C1]">{product.sku}</TableCell>
                      <TableCell className="font-bold text-gray-900 text-xs">{product.name}</TableCell>
                      <TableCell className="text-gray-500 text-xs font-semibold">{product.category || 'Unassigned'}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-700">{product.weight || 'N/A'}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-700">{product.dimensions || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          classification.startsWith('High') ? 'error' : 
                          classification.startsWith('Temp') ? 'warning' : 'primary'
                        } className="text-[10px]">
                          {classification}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400 font-mono text-[10px]">2026-06-01</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[11px] h-7 px-2 font-semibold"
                            onClick={() => navigate(`/inventory/lookup`, { state: { sku: product.sku } })}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                            Passport
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-gray-100">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProducts.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Badge, 
  Button, 
  AlertBanner,
  Pagination
} from 'shared-ui';
import { Box, Search, Filter, Layers, ShieldCheck, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export default function Products() {
  const { products, isLoading, error } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ['All', ...new Set(products.map(item => item.category))];

  // Reset pagination to page 1 when any search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const filteredProducts = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Pagination parameters
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-[#0071C1] animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Querying central master product catalog...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <AlertBanner type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Box className="w-7 h-7 text-[#0071C1]" />
            Master Product & SKU Catalog
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Global catalog index mapping raw specifications, packaging dimensions, barcoding codes, and active replenishment limits.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 text-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKUs, product labels, dimensions..."
            className="w-full pl-9 pr-4 py-3 rounded-2xl border border-gray-100 shadow-xs outline-none focus:border-blue-500 bg-white font-medium text-gray-800"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-150 p-3 rounded-2xl outline-none focus:border-blue-500 bg-white font-bold text-gray-800"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedProducts.map((prod) => {
          const isLow = prod.quantity <= prod.reorderLevel;
          return (
            <Card key={prod.sku} className="border border-gray-100 hover:border-blue-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-80 bg-white group">
              <CardHeader className="pb-3 border-b border-gray-50 bg-slate-50/30 group-hover:bg-blue-50/10 transition-colors">
                <div className="flex justify-between items-start">
                  <Badge variant="primary" className="text-[9px] uppercase tracking-wider font-bold">
                    {prod.category}
                  </Badge>
                  <span className="font-mono text-[9px] text-[#0071C1] font-bold">{prod.sku}</span>
                </div>
                <CardTitle className="text-sm font-bold text-gray-900 mt-2 line-clamp-1">{prod.name}</CardTitle>
                <CardDescription className="text-[10px] text-gray-400 font-mono">Bin Allocation: {prod.bin}</CardDescription>
              </CardHeader>

              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                
                {/* Product Stats Grid */}
                <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold text-gray-600">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[9px] text-gray-400 block font-bold uppercase">Replenish Limit</span>
                    <span className="font-bold text-gray-800">{prod.reorderLevel} units</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[9px] text-gray-400 block font-bold uppercase">Packaging Spec</span>
                    <span className="font-bold text-gray-800">Boxed (Standard)</span>
                  </div>
                </div>

                {/* Stock Warning Panel */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-4">
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase font-bold">Current Stock</span>
                    <span className={`text-base font-black ${isLow ? 'text-amber-600' : 'text-gray-900'}`}>{prod.quantity} Units</span>
                  </div>
                  <div>
                    {isLow ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border bg-amber-50 text-amber-700 border-amber-200">
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                        Reorder Restock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        Adequate Level
                      </span>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
          );
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredProducts.length}
        pageSize={itemsPerPage}
      />
    </div>
  );
}

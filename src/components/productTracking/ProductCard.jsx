import React from 'react';
import Card, { CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import { Package, MapPin, Calendar } from 'lucide-react';

export default function ProductCard({ product }) {
  if (!product) return null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="h-40 bg-gray-100 rounded-t-2xl sm:rounded-t-3xl flex items-center justify-center border-b border-gray-100 relative">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-t-2xl sm:rounded-t-3xl" />
          ) : (
            <Package className="w-12 h-12 text-gray-300" />
          )}
          <div className="absolute top-4 right-4">
            <Badge variant="primary">{product.category || 'General'}</Badge>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">SKU: {product.sku}</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm text-gray-600 gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>Location: {product.location || 'Unassigned'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Last Updated: {product.lastUpdated || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

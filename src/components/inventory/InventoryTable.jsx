import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import Badge from '../ui/Badge';

export default function InventoryTable({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No inventory data available.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'in stock': return <Badge variant="success">In Stock</Badge>;
      case 'low stock': return <Badge variant="warning">Low Stock</Badge>;
      case 'out of stock': return <Badge variant="error">Out of Stock</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Product Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.sku}>
            <TableCell className="font-medium">{item.sku}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>{item.location}</TableCell>
            <TableCell className="text-right">{item.quantity}</TableCell>
            <TableCell>{getStatusBadge(item.status)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

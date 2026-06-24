import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from 'shared-ui';

/**
 * SharedKeyValueCard – displays a title and a list of key/value pairs.
 * Props:
 *   title: string – header title.
 *   items: Array<{ label: string, value: string | number }>
 */
export default function SharedKeyValueCard({ title, items }) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 rounded-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 p-4">
        {items && items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}:</span>
            <span className="text-gray-900 dark:text-gray-100">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

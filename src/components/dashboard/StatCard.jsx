import React from 'react';
import Card, { CardContent } from '../ui/Card';

export default function StatCard({ title, value, icon: Icon, trend, trendLabel }) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="text-[#0071C1] w-5 h-5" />}
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            {trend !== undefined && (
              <div className="flex items-center mt-2 gap-1.5">
                <span className={`text-xs font-semibold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}>
                  {isPositive ? '+' : ''}{trend}%
                </span>
                {trendLabel && <span className="text-xs text-gray-500">{trendLabel}</span>}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

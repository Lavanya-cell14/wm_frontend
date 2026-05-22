import React from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

export default function TrackingStatus({ steps = [], currentStepIndex = 0 }) {
  if (!steps || steps.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracking Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative border-l-2 border-gray-100 ml-3 md:ml-4 space-y-6">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={index} className="relative pl-6">
                <span className="absolute -left-[11px] top-0.5 bg-white">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 bg-white" />
                  ) : isCurrent ? (
                    <Clock className="w-5 h-5 text-[#0071C1] bg-white" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 bg-white" />
                  )}
                </span>
                
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </span>
                  )}
                  {step.date && (
                    <span className="text-xs text-gray-400 mt-1">
                      {step.date}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

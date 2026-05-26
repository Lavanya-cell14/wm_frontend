import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, Box, Search, PackageSearch, Navigation, Map } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function AiCopilot() {
  const [query, setQuery] = useState('');
  
  const suggestedPrompts = [
    "Where is the highest congestion currently?",
    "Show me low stock items in Zone A1",
    "Optimize routes for AGV-04",
    "What's the status of INB-2023-001?"
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Bot className="w-7 h-7 text-blue-600" />
            Warehouse Copilot
          </h1>
          <p className="text-gray-500 text-sm mt-1">Ask questions, request analysis, and trigger actions using natural language.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          
          {/* Welcome Message */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 shadow-sm mt-1">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 text-sm text-gray-700 inline-block">
                Hello! I'm your Warehouse AI Assistant. I can help you analyze inventory, monitor movements, resolve bottlenecks, or generate reports. How can I assist you today?
              </div>
              
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">
                {suggestedPrompts.map((prompt, i) => (
                  <button 
                    key={i}
                    className="text-left p-3 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-sm text-gray-600 font-medium flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Example User Message */}
          <div className="flex gap-4 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1">
              <User className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1 flex flex-col items-end">
              <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-sm shadow-sm text-sm inline-block">
                What is the current stock level for SKU-1029?
              </div>
            </div>
          </div>

          {/* Example AI Response */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 shadow-sm mt-1">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 text-sm text-gray-700 max-w-2xl">
                <p className="mb-3">We currently have <strong>450 units</strong> of SKU-1029 (Widget Pro) in stock. However, 300 of these are reserved for pending outbound orders.</p>
                
                <Card className="mb-4 bg-gray-50 border-gray-200">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">SKU-1029 Overview</span>
                      <Badge variant="outline">Electronics</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mt-2">
                      <div>
                        <div className="text-gray-500 text-xs">Total Stock</div>
                        <div className="font-medium">450</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Available</div>
                        <div className="font-medium text-green-600">150</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Locations</div>
                        <div className="font-medium">BIN-A1-02</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <p className="mb-3">Since the available quantity (150) is approaching the minimum reorder threshold (100), I recommend creating a replenishment recommendation.</p>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Box className="w-3.5 h-3.5" /> View in Inventory
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Map className="w-3.5 h-3.5" /> Show on Map
                  </Button>
                  <Button size="sm" className="gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5" /> Create Recommendation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="relative flex items-center max-w-4xl mx-auto">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Copilot..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-5 pr-14 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
            />
            <button className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex items-center justify-center">
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400 font-medium tracking-wide">AI CAN MAKE MISTAKES. PLEASE VERIFY CRITICAL ACTIONS.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

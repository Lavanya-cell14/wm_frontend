import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, Box, Search, PackageSearch, Navigation, Map, ShieldAlert, Cpu } from 'lucide-react';
import { Badge, Button, Card, CardContent, Input } from 'shared-ui';
import { askRag } from '../services/ragService';

export default function AiCopilot() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I'm your AI Warehouse Assistant. I can help you analyze inventory, monitor occupancy, locate products, or review storage trends. How can I assist you today?"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const suggestedPrompts = [
    "Where is SKU100?",
    "Show products in Zone A",
    "Show available bins",
    "Find fragile products",
    "Which aisles are congested?",
    "Show warehouse occupancy",
    "Show products stored today"
  ];

  const mockAnswers = {
    "WHERE IS SKU100?": "SKU-1001 (Heavy Duty Drilling Rig) is stored in Zone C, Rack 4, Shelf S-04, Bin BIN-004. Current stock level is 8 units.",
    "SHOW PRODUCTS IN ZONE A": "Zone A (Fast Moving) currently stores:\n- SKU-1002 (Power Grinder) - 120 units in BIN-001\nTotal stock in Zone A is 120 units with 65% capacity utilization.",
    "SHOW AVAILABLE BINS": "There are 12 available/empty bins in Central Fulfillment A:\n- Zone A: BIN-006, BIN-007\n- Zone B: BIN-008, BIN-009, BIN-010\n- Zone C: BIN-012, BIN-015\n- Zone D: BIN-018, BIN-019, BIN-020",
    "FIND FRAGILE PRODUCTS": "Fragile items identified in inventory logs:\n- SKU-3092 (Heavy Duty Drilling Rig 500W) - Mapped to Zone C (Requires dry storage, avoid heavy stacking).\n- SKU-3001 (Battery Cells) - Mapped to Zone B (Temperature control rules apply).",
    "WHICH AISLES ARE CONGESTED?": "Traffic congestion analysis indicates:\n- Aisle A1 (Zone A): Moderate traffic due to concurrent storage tasks.\n- Aisle B2 (Zone B): Clear.\n- Aisle C3 (Zone C): Clear.",
    "SHOW WAREHOUSE OCCUPANCY": "Warehouse space utilization breakdown:\n- Zone A (Fast Moving): 65% occupied\n- Zone B (Electronics): 72% occupied\n- Zone C (Bulk Storage): 88% occupied (High Load Warning)\n- Zone D (Cold Storage): 40% occupied\nOverall facility storage utilization: 60.0% occupied.",
    "SHOW PRODUCTS STORED TODAY": "Items checked in and stored today:\n- Dell Laptop (15 units stored in BIN-003 by Warehouse Operator)\n- MacBook Pro (5 units stored in BIN-002 by Warehouse Operator)"
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = textToSend.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setQuery('');
    setIsTyping(true);

    try {
      const response = await askRag(userMsg);
      const botText = response.suggestion || "No suggestion received from AI assistant.";
      setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
    } catch (err) {
      console.error('[AI Copilot] RAG service query failed, falling back:', err);
      
      const warningText = "⚠️ RAG AI Assistant is offline. (Port 8002 unreachable). Showing offline template responses.";
      const matchKey = userMsg.toUpperCase().replace(/[?]/g, '');
      let botText = "I have queried the vector database and warehouse registry, but could not find a specific match for that request. Try asking one of the suggested prompts below.";
      
      // Try to find a match in mock answers
      for (const k of Object.keys(mockAnswers)) {
        if (matchKey.includes(k) || k.includes(matchKey)) {
          botText = mockAnswers[k];
          break;
        }
      }

      setMessages(prev => [
        ...prev, 
        { sender: 'bot', text: warningText, isSystemWarning: true },
        { sender: 'bot', text: botText }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 max-w-5xl mx-auto w-full select-none animate-in fade-in duration-200">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Bot className="w-7 h-7 text-[#0071C1]" />
            AI Warehouse Assistant
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-semibold">
            Ask warehouse-related questions powered by RAG, Qdrant, and Gemini.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-0">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
          {messages.map((msg, idx) => {
            const isBot = msg.sender === 'bot';
            if (msg.isSystemWarning) {
              return (
                <div key={idx} className="flex justify-center my-2">
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs max-w-xl">
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }
            return (
              <div key={idx} className={`flex gap-3.5 ${isBot ? '' : 'flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs mt-1 ${
                  isBot ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isBot ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                </div>
                <div className={`flex-1 flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                  <div className={`p-3.5 rounded-2xl max-w-xl text-xs font-semibold leading-relaxed shadow-sm border ${
                    isBot 
                      ? 'bg-white text-slate-800 border-slate-100 rounded-tl-xs' 
                      : 'bg-blue-600 text-white border-blue-700 rounded-tr-xs'
                  } whitespace-pre-line`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 shadow-xs mt-1 text-white">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border border-slate-100 text-xs font-bold text-slate-400 flex items-center gap-1.5 shadow-sm">
                <Cpu className="w-3.5 h-3.5 animate-spin text-blue-500" />
                AI is searching indexes...
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts Grid */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Suggested Warehouse Queries</div>
          <div className="flex flex-wrap gap-2 max-w-4xl">
            {suggestedPrompts.map((prompt, i) => (
              <Button 
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={isTyping}
                className="text-left px-3 py-2 rounded-xl border border-gray-150 bg-white hover:border-blue-300 hover:bg-blue-50/20 transition-all text-xs text-gray-600 font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <div className="relative flex items-center max-w-4xl mx-auto">
            <Input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query inventory records, occupancy states, or aisle traffic..."
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(query)}
              disabled={isTyping}
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-5 pr-14 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
            />
            <Button 
              onClick={() => handleSendMessage(query)}
              disabled={isTyping || !query.trim()}
              className="absolute right-2.5 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </div>
          <div className="text-center mt-2.5">
            <span className="text-[10px] text-gray-400 font-bold tracking-wider">AI INSIGHTS MAY REFLECT MOCK HANDSHAKES. CONFIRM IN LIVE GRIDS.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

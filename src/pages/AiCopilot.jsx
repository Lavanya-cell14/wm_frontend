import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, Box, Search, PackageSearch, Navigation, Map, ShieldAlert, Cpu, Settings2 } from 'lucide-react';
import { Badge, Button, Card, CardContent, Input } from 'shared-ui';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import { askRag } from '../services/ragService';
import { queryAiCopilotApi } from '../services/recommendationService';

export default function AiCopilot() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I'm your AI Warehouse Assistant. I can help you analyze inventory, monitor occupancy, locate products, or review storage trends. How can I assist you today?"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Mode selection: 'rag' (port 8002) | 'wms' (port 8000)
  const [queryMode, setQueryMode] = useState('rag');

  const suggestedPrompts = [
    "Where is SKU100?",
    "Show products in Zone A",
    "Show available bins",
    "Find fragile products",
    "Which aisles are congested?",
    "Show warehouse occupancy",
    "Show products stored today"
  ];

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = textToSend.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setQuery('');
    setIsTyping(true);

    try {
      if (queryMode === 'rag') {
        // Hits RAG FastAPI server on port 8002
        console.warn("[AiCopilot] Sending query to RAG Server API (/api/ai/analyze)");
        const response = await askRag(userMsg);
        const botText = response.suggestion || response.response || "No suggestion received from RAG AI assistant.";
        setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
      } else {
        // Hits WMS Django Backend server on port 8000
        console.warn("[AiCopilot] Sending query to WMS Backend query API (/api/ai/query/)");
        const response = await queryAiCopilotApi(userMsg);
        const botText = response.response || response.suggestion || "No response received from WMS AI query engine.";
        setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
      }
    } catch (err) {
      console.error('[AI Copilot] API query failed:', err);
      
      const warningText = queryMode === 'rag' 
        ? "⚠️ RAG AI Assistant is offline (Port 8002 unreachable)."
        : "⚠️ WMS Query API is offline (Port 8000 unreachable).";
        
      const botText = `Unable to connect to AI service: ${err.message || 'Connection refused'}. Please try again later.`;

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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Bot className="w-7 h-7 text-[#0071C1]" />
            AI Warehouse Assistant
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-semibold">
            Ask warehouse questions powered by RAG, Gemini, or alternate WMS query logic.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
          <button
            onClick={() => setQueryMode('rag')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
              queryMode === 'rag'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            RAG Assistant (Port 8002)
          </button>
          <button
            onClick={() => setQueryMode('wms')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
              queryMode === 'wms'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            WMS Query (Port 8000)
          </button>
        </div>
      </div>

      <ErrorBoundary
        title="AI Assistant Interface Failed"
        message="An unexpected error occurred while rendering the AI assistant chat view. You can reload the chat component to try again."
      >
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

        {/* Input Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-150 shrink-0">
          <div className="flex gap-2">
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage(query);
              }}
              placeholder={
                queryMode === 'rag' 
                  ? "Ask about inventory analysis, stock locations, or fragile items..."
                  : "Query WMS backend directly for operational coordinates..."
              }
              disabled={isTyping}
              className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <Button 
              onClick={() => handleSendMessage(query)}
              disabled={isTyping || !query.trim()}
              className="bg-[#0071C1] hover:bg-[#005c9e] text-white rounded-xl px-4 flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      </ErrorBoundary>
    </div>
  );
}

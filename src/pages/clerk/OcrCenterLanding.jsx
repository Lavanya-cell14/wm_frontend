import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from 'shared-ui';
import { 
  UploadCloud, 
  CheckSquare, 
  History, 
  ArrowRight, 
  Info,
  ChevronRight,
  Sparkles,
  FileText
} from 'lucide-react';

export default function OcrCenterLanding() {
  const navigate = useNavigate();
  const { ocrDocuments = [] } = useWarehouse();

  // Calculate quick stats for OCR documents
  const totalCount = ocrDocuments.length;
  const reviewCount = ocrDocuments.filter(d => d.status === 'VERIFICATION_PENDING').length;
  const historyCount = ocrDocuments.filter(d => ['VERIFIED', 'REJECTED'].includes(d.status)).length;

  const ocrModules = [
    {
      title: 'Upload Manifest',
      description: 'Upload new inbound invoices, cargo packing slips, or bills of lading to extract data.',
      count: totalCount,
      countLabel: 'Total',
      icon: UploadCloud,
      path: '/inventory/ocr-upload',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      title: 'Review Queue',
      description: 'Check high/low confidence parsed values, assign missing SKUs, and verify dimensions.',
      count: reviewCount,
      countLabel: 'Pending',
      icon: CheckSquare,
      path: '/inventory/ocr-review',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      title: 'Document History',
      description: 'Browse verified, historical document logs and download extracted CSV manifests.',
      count: historyCount,
      countLabel: 'Processed',
      icon: History,
      path: '/inventory/ocr-history',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header section with breadcrumb trail */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <span>Receiving & Inventory Officer</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0071C1]">OCR Center</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#0071C1]" />
            OCR Manifest Intake Hub
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Automate data ingestion from supplier invoices and freight bills using neural layout parsing.
          </p>
        </div>
      </div>

      {/* Info banner explaining OCR flow */}
      <Card className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-100/30">
        <CardContent className="p-4 flex gap-3 items-start">
          <div className="p-2 bg-blue-100/60 rounded-lg text-blue-700">
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">OCR Workflow Guide: </span>
            Upload a document image or PDF &rarr; Run model parser &rarr; Manually inspect warnings or correct cell values in Review Queue &rarr; Approve to commit items to Inbound Products ledger.
          </div>
        </CardContent>
      </Card>

      {/* Interactive Grid of OCR Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ocrModules.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              onClick={() => navigate(card.path)}
              className="group cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300"
            >
              <Card className="h-full border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden relative">
                {/* Visual top border strip gradient */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
                
                <CardHeader className="pt-6 pb-2 px-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-3 rounded-xl border ${card.bgColor} transition-transform group-hover:scale-110 duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    {/* Badge displaying current active record counts */}
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black text-slate-800 tracking-tight leading-none">
                        {card.count}
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                        {card.countLabel}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-base font-bold text-gray-900 group-hover:text-[#0071C1] transition-colors duration-200">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="px-5 pb-5 pt-0 flex-1 flex flex-col justify-between">
                  <CardDescription className="text-xs text-gray-500 leading-relaxed mb-4">
                    {card.description}
                  </CardDescription>
                  
                  {/* Footer link animation trigger */}
                  <div className="flex items-center text-xs font-bold text-[#0071C1] group-hover:text-blue-700 transition-colors mt-auto">
                    Configure Queue 
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1.5 duration-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

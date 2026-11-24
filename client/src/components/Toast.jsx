import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export function Toast({ alert }) {
  if (!alert) return null;

  const getIcon = () => {
    switch (alert.type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[#FF4E45] shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#2BAE66] shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-[#3EA6FF] shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-50 animate-fade-in flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#212121] border border-[#303030] shadow-2xl text-xs font-medium text-[#F1F1F1] max-w-sm">
      {getIcon()}
      <span className="leading-snug">{alert.text}</span>
    </div>
  );
}


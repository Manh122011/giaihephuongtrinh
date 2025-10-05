
import React from 'react';
import Button from './Button';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: string;
  isLoading: boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, report, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl p-6 relative animate-fade-in-down">
        <h2 className="text-2xl font-bold text-indigo-400 mb-4">Your Performance Report</h2>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
             <p className="mt-4 text-slate-300">Gemini is analyzing your performance...</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto pr-2 text-slate-300 whitespace-pre-wrap">
            {report}
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;

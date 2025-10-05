import React, { useState } from 'react';
import Button from './Button';
import { getGeminiFeedbackForNotes } from '../services/geminiService';

const Notepad: React.FC = () => {
  const [notes, setNotes] = useState('');
  const [geminiResponse, setGeminiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskGemini = async () => {
    setIsLoading(true);
    setGeminiResponse('');
    const response = await getGeminiFeedbackForNotes(notes);
    setGeminiResponse(response);
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-b-xl shadow-2xl border border-t-0 border-slate-700 animate-fade-in-down">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Jot down your thoughts, calculations, or ask a question... For example: 'Solve for x: 3x - 7 = 11'"
        className="w-full h-64 bg-slate-900 border-2 border-slate-700 rounded-lg p-4 text-slate-300 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        aria-label="Notepad"
      />
      <div className="mt-4 text-center">
        <Button onClick={handleAskGemini} disabled={isLoading || !notes.trim()}>
          {isLoading ? 'Thinking...' : 'Ask Gemini'}
        </Button>
      </div>

      {(isLoading || geminiResponse) && (
        <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-indigo-400 mb-2">Gemini's Response:</h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
            </div>
          ) : (
            <div className="text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {geminiResponse}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notepad;

import React, { useState } from 'react';

const Notepad: React.FC = () => {
  const [notes, setNotes] = useState('');

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-b-xl shadow-2xl border border-t-0 border-slate-700 animate-fade-in-down">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Jot down your thoughts, calculations, or reminders here..."
        className="w-full h-96 bg-slate-900 border-2 border-slate-700 rounded-lg p-4 text-slate-300 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        aria-label="Notepad"
      />
    </div>
  );
};

export default Notepad;

import React from 'react';
import Notepad from './components/Notepad';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 font-sans">
      <div className="w-full max-w-md mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-400">Gemini Notepad</h1>
          <p className="text-slate-400 mt-2">Jot down your thoughts and get instant AI feedback.</p>
        </header>
        <main>
          <Notepad />
        </main>
      </div>
    </div>
  );
};

export default App;

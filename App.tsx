import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Difficulty, Operation, Problem, Score, HistoryItem } from './types';
import Select from './components/Select';
import Button from './components/Button';
import ScoreDisplay from './components/ScoreDisplay';
import ReportModal from './components/ReportModal';
import { generatePerformanceReport } from './services/geminiService';
import EliminationHelper from './components/EliminationHelper';
import Notepad from './components/Notepad';

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [operation, setOperation] = useState<Operation>(Operation.ADDITION);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [systemAnswer, setSystemAnswer] = useState({ x: '', y: '' });
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState<Score>({ correct: 0, incorrect: 0 });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [report, setReport] = useState('');
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  const [activeTab, setActiveTab] = useState<'tutor' | 'notepad'>('tutor');

  const answerInputRef = useRef<HTMLInputElement>(null);

  const generateProblem = useCallback(() => {
    if (operation === Operation.SYSTEM_OF_EQUATIONS) {
      let range = 5;
      let coeffRange = 5;
      if (difficulty === Difficulty.MEDIUM) {
        range = 10;
        coeffRange = 10;
      }
      if (difficulty === Difficulty.HARD) {
        range = 15;
        coeffRange = 15;
      }

      const rand = (r: number) => Math.floor(Math.random() * (2 * r + 1)) - r;
      const randCoeff = (r: number) => {
        let val = 0;
        while(val === 0) val = rand(r);
        return val;
      };

      let x, y, a, b, d, e, c, f;
      let det = 0;
      while (det === 0) {
        x = rand(range);
        y = rand(range);
        a = randCoeff(coeffRange);
        b = randCoeff(coeffRange);
        d = randCoeff(coeffRange);
        e = randCoeff(coeffRange);
        det = a * e - b * d;
      }
      c = a * x + b * y;
      f = d * x + e * y;
      
      setProblem({
          operation: Operation.SYSTEM_OF_EQUATIONS,
          eq1: {a, b, c},
          // Fix: Map properties d, e, f to a, b, c to conform to the standardized equation structure.
          eq2: { a: d, b: e, c: f },
          solution: {x, y}
      });
    } else {
      let maxNum = 10;
      if (difficulty === Difficulty.MEDIUM) maxNum = 50;
      if (difficulty === Difficulty.HARD) maxNum = 100;

      let num1 = Math.floor(Math.random() * maxNum) + 1;
      let num2 = Math.floor(Math.random() * maxNum) + 1;
      let answer = 0;

      switch (operation) {
        case Operation.ADDITION:
          answer = num1 + num2;
          break;
        case Operation.SUBTRACTION:
          if (num1 < num2) [num1, num2] = [num2, num1];
          answer = num1 - num2;
          break;
        case Operation.MULTIPLICATION:
           if (difficulty === Difficulty.EASY) {
              num1 = Math.floor(Math.random() * 10) + 1;
              num2 = Math.floor(Math.random() * 10) + 1;
          } else if (difficulty === Difficulty.MEDIUM) {
              num1 = Math.floor(Math.random() * 20) + 1;
              num2 = Math.floor(Math.random() * 12) + 1;
          } else {
              num1 = Math.floor(Math.random() * 50) + 1;
              num2 = Math.floor(Math.random() * 20) + 1;
          }
          answer = num1 * num2;
          break;
        case Operation.DIVISION:
          const divisor = Math.floor(Math.random() * (maxNum / 2)) + 1;
          answer = Math.floor(Math.random() * (maxNum / 2)) + 1;
          num1 = divisor * answer;
          num2 = divisor;
          break;
      }
      setProblem({ num1, num2, operation, answer });
    }
  }, [difficulty, operation]);

  useEffect(() => {
    generateProblem();
    setScore({ correct: 0, incorrect: 0 });
    setHistory([]);
    setUserAnswer('');
    setSystemAnswer({ x: '', y: '' });
    setShowHelper(false);
  }, [difficulty, operation, generateProblem]);

  const formatEquation = ({ a, b, c }: { a: number, b: number, c: number }) => {
    const xPart = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
    let equation = xPart;
    if (b > 0) {
        equation += ` + ${b === 1 ? 'y' : `${b}y`}`;
    } else if (b < 0) {
        equation += ` - ${Math.abs(b) === 1 ? 'y' : `${Math.abs(b)}y`}`;
    }
    equation += ` = ${c}`;
    return equation;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem) return;

    let isCorrect = false;
    let problemString = '';
    let userAnswerString = '';
    let correctAnswerString = '';

    if (problem.operation === Operation.SYSTEM_OF_EQUATIONS) {
      if (!systemAnswer.x.trim() || !systemAnswer.y.trim()) return;
      const userX = parseInt(systemAnswer.x, 10);
      const userY = parseInt(systemAnswer.y, 10);
      isCorrect = userX === problem.solution.x && userY === problem.solution.y;
      problemString = `${formatEquation(problem.eq1)}\n${formatEquation(problem.eq2)}`;
      userAnswerString = `x=${systemAnswer.x}, y=${systemAnswer.y}`;
      correctAnswerString = `x=${problem.solution.x}, y=${problem.solution.y}`;
    } else {
      if (!userAnswer.trim()) return;
      const answerNum = parseInt(userAnswer, 10);
      isCorrect = answerNum === problem.answer;
      problemString = `${problem.num1} ${problem.operation} ${problem.num2}`;
      userAnswerString = userAnswer;
      correctAnswerString = problem.answer.toString();
    }

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setScore(prev => ({
      ...prev,
      [isCorrect ? 'correct' : 'incorrect']: prev[isCorrect ? 'correct' : 'incorrect'] + 1
    }));
    
    setHistory(prev => [...prev, {
      problem: problemString,
      userAnswer: userAnswerString,
      correctAnswer: correctAnswerString,
      isCorrect
    }]);

    setTimeout(() => {
      setFeedback(null);
      setUserAnswer('');
      setSystemAnswer({ x: '', y: '' });
      generateProblem();
      answerInputRef.current?.focus();
    }, 1000);
  };
  
  const handleGenerateReport = async () => {
    setIsReportModalOpen(true);
    setIsLoadingReport(true);
    const generatedReport = await generatePerformanceReport(history);
    setReport(generatedReport);
    setIsLoadingReport(false);
  };

  const getFeedbackClasses = () => {
    if (feedback === 'correct') return 'border-emerald-500 ring ring-emerald-500/50';
    if (feedback === 'incorrect') return 'border-red-500 ring ring-red-500/50';
    return 'border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/50';
  };
  
  const getTabClass = (tabName: 'tutor' | 'notepad') => {
    const baseClass = "px-6 py-3 font-semibold rounded-t-lg focus:outline-none transition-colors";
    if (activeTab === tabName) {
      return `${baseClass} bg-slate-800/50 text-indigo-400`;
    }
    return `${baseClass} text-slate-400 hover:bg-slate-700/30`;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 font-sans">
      <div className="w-full max-w-md mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-400">Gemini Math Tutor</h1>
          <p className="text-slate-400 mt-2">Practice your math skills and get smart feedback!</p>
        </header>

        <div className="flex border-b border-slate-700">
            <button className={getTabClass('tutor')} onClick={() => setActiveTab('tutor')}>
                Math Tutor
            </button>
            <button className={getTabClass('notepad')} onClick={() => setActiveTab('notepad')}>
                Notepad
            </button>
        </div>

        {activeTab === 'tutor' ? (
          <main className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-b-xl shadow-2xl border border-t-0 border-slate-700">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Select<Difficulty>
                label="Difficulty"
                options={Object.values(Difficulty)}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              />
              <Select<Operation>
                label="Operation"
                options={Object.values(Operation)}
                value={operation}
                onChange={(e) => setOperation(e.target.value as Operation)}
              />
            </div>

            <div className="mb-6">
              <ScoreDisplay score={score} />
            </div>

            {problem && (
              <form onSubmit={handleSubmit}>
                <div className="text-4xl lg:text-5xl font-mono text-center mb-6 py-4 bg-slate-900 rounded-lg tracking-wider">
                  {problem.operation === Operation.SYSTEM_OF_EQUATIONS ? (
                      <div className="flex flex-col items-center justify-center text-2xl lg:text-3xl leading-relaxed">
                          <span>{formatEquation(problem.eq1)}</span>
                          <span>{formatEquation(problem.eq2)}</span>
                      </div>
                  ) : (
                      <>
                          {problem.num1} <span className="text-indigo-400 mx-2">{problem.operation}</span> {problem.num2}
                      </>
                  )}
                </div>
                
                {problem.operation === Operation.SYSTEM_OF_EQUATIONS ? (
                  <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2">
                          <label htmlFor="x-answer" className="text-2xl font-mono text-slate-300">x=</label>
                          <input
                              id="x-answer"
                              ref={answerInputRef}
                              type="number"
                              value={systemAnswer.x}
                              onChange={(e) => setSystemAnswer(prev => ({ ...prev, x: e.target.value }))}
                              className={`w-24 text-center text-2xl p-3 bg-slate-900 rounded-md border-2 transition-all duration-300 ${getFeedbackClasses()}`}
                              autoFocus
                              disabled={feedback !== null}
                          />
                      </div>
                      <div className="flex items-center gap-2">
                          <label htmlFor="y-answer" className="text-2xl font-mono text-slate-300">y=</label>
                          <input
                              id="y-answer"
                              type="number"
                              value={systemAnswer.y}
                              onChange={(e) => setSystemAnswer(prev => ({ ...prev, y: e.target.value }))}
                              className={`w-24 text-center text-2xl p-3 bg-slate-900 rounded-md border-2 transition-all duration-300 ${getFeedbackClasses()}`}
                              disabled={feedback !== null}
                          />
                      </div>
                  </div>
                ) : (
                  <input
                      ref={answerInputRef}
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Your Answer"
                      className={`w-full text-center text-2xl p-4 bg-slate-900 rounded-md border-2 transition-all duration-300 ${getFeedbackClasses()}`}
                      autoFocus
                      disabled={feedback !== null}
                  />
                )}

                {problem.operation === Operation.SYSTEM_OF_EQUATIONS && (
                  <div className="my-4 text-center">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => setShowHelper(s => !s)}
                      className="text-sm px-4 py-2"
                    >
                      {showHelper ? 'Hide' : 'Show'} Elimination Helper
                    </Button>
                  </div>
                )}

                {showHelper && problem.operation === Operation.SYSTEM_OF_EQUATIONS && (
                  <EliminationHelper problem={problem} />
                )}
                
                <Button type="submit" className="w-full mt-4 text-lg" disabled={feedback !== null || (problem.operation === Operation.SYSTEM_OF_EQUATIONS && (!systemAnswer.x || !systemAnswer.y))}>
                  Submit
                </Button>
              </form>
            )}

            <div className="mt-8 text-center">
              <Button 
                  variant="secondary"
                  onClick={handleGenerateReport}
                  disabled={history.length === 0}
              >
                Generate Performance Report
              </Button>
              {history.length === 0 && <p className="text-xs text-slate-500 mt-2">Answer a few questions to enable reports.</p>}
            </div>
          </main>
        ) : (
          <Notepad />
        )}
      </div>
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={report}
        isLoading={isLoadingReport}
      />
    </div>
  );
};

export default App;
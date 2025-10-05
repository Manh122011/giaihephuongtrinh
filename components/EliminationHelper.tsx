import React, { useState, useMemo } from 'react';
import { Problem } from '../types';

type SystemProblem = Extract<Problem, { operation: 'System of Equations' }>;

interface EliminationHelperProps {
  problem: SystemProblem;
}

const formatEquation = ({ a, b, c }: { a: number, b: number, c: number }) => {
    const xPart = a === 1 ? 'x' : a === -1 ? '-x' : a === 0 ? '' : `${a}x`;
    const yPartRaw = Math.abs(b) === 1 ? 'y' : `${Math.abs(b)}y`;
    
    let equation = '';
    
    if (xPart) {
        equation += xPart;
        if (b > 0) {
            equation += ` + ${yPartRaw}`;
        } else if (b < 0) {
            equation += ` - ${yPartRaw}`;
        }
    } else { 
        if (b > 0) {
            equation += yPartRaw;
        } else if (b < 0) {
            equation += `-${yPartRaw}`;
        } else {
            equation = '0';
        }
    }

    equation += ` = ${c}`;
    return equation;
};


const EliminationHelper: React.FC<EliminationHelperProps> = ({ problem }) => {
  const [multiplier1, setMultiplier1] = useState('1');
  const [multiplier2, setMultiplier2] = useState('1');
  const [combineOp, setCombineOp] = useState<'+' | '-'>('+');

  const m1 = parseInt(multiplier1) || 0;
  const m2 = parseInt(multiplier2) || 0;

  const multipliedEq1 = useMemo(() => ({
    a: problem.eq1.a * m1,
    b: problem.eq1.b * m1,
    c: problem.eq1.c * m1
  }), [problem.eq1, m1]);

  const multipliedEq2 = useMemo(() => ({
    a: problem.eq2.a * m2,
    b: problem.eq2.b * m2,
    c: problem.eq2.c * m2
  }), [problem.eq2, m2]);
  
  const combinedEq = useMemo(() => {
      if (combineOp === '+') {
          return {
              a: multipliedEq1.a + multipliedEq2.a,
              b: multipliedEq1.b + multipliedEq2.b,
              c: multipliedEq1.c + multipliedEq2.c,
          }
      } else { 
          return {
              a: multipliedEq1.a - multipliedEq2.a,
              b: multipliedEq1.b - multipliedEq2.b,
              c: multipliedEq1.c - multipliedEq2.c,
          }
      }
  }, [multipliedEq1, multipliedEq2, combineOp]);

  return (
    <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-700 animate-fade-in-down">
      <h3 className="text-lg font-semibold text-indigo-400 mb-4 text-center">
        Workspace: Elimination Method
      </h3>
      <div className="space-y-4 text-sm sm:text-base">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono p-2 bg-slate-800 rounded">
            ({formatEquation(problem.eq1)})
          </span>
          <span className="text-slate-400">×</span>
          <input
            type="number"
            value={multiplier1}
            onChange={(e) => setMultiplier1(e.target.value)}
            className="w-16 text-center p-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="Multiplier for equation 1"
          />
          <span className="text-slate-400">→</span>
          <span className="font-mono p-2 bg-slate-800 rounded flex-grow text-center">
            {formatEquation(multipliedEq1)}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono p-2 bg-slate-800 rounded">
            ({formatEquation(problem.eq2)})
          </span>
          <span className="text-slate-400">×</span>
          <input
            type="number"
            value={multiplier2}
            onChange={(e) => setMultiplier2(e.target.value)}
            className="w-16 text-center p-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="Multiplier for equation 2"
          />
          <span className="text-slate-400">→</span>
          <span className="font-mono p-2 bg-slate-800 rounded flex-grow text-center">
            {formatEquation(multipliedEq2)}
          </span>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-700">
            <div className="flex items-center justify-center gap-4 font-mono text-lg">
                <p className="text-right flex-1">{formatEquation(multipliedEq1)}</p>
                <div className="flex flex-col items-center">
                   <select 
                     value={combineOp}
                     onChange={(e) => setCombineOp(e.target.value as '+' | '-')}
                     className="bg-slate-700 font-bold text-2xl rounded-md border-slate-600 focus:ring-indigo-500 focus:border-indigo-500"
                     aria-label="Combine operation"
                   >
                     <option value="+">+</option>
                     <option value="-">-</option>
                   </select>
                </div>
                <p className="text-left flex-1">{`(${formatEquation(multipliedEq2)})`}</p>
            </div>
             <hr className="my-2 border-slate-600 w-3/4 mx-auto" />
             <p className="font-mono text-xl text-center font-bold bg-slate-800 rounded p-2 mt-2">
                {formatEquation(combinedEq)}
             </p>
        </div>
      </div>
    </div>
  );
};

export default EliminationHelper;

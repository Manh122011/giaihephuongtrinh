
import React from 'react';
import { Score } from '../types';

interface ScoreDisplayProps {
  score: Score;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  return (
    <div className="flex justify-center space-x-8 text-lg">
      <div className="text-center">
        <p className="font-bold text-emerald-400 text-3xl">{score.correct}</p>
        <p className="text-sm text-slate-400">Correct</p>
      </div>
      <div className="text-center">
        <p className="font-bold text-red-400 text-3xl">{score.incorrect}</p>
        <p className="text-sm text-slate-400">Incorrect</p>
      </div>
    </div>
  );
};

export default ScoreDisplay;

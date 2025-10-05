
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export enum Operation {
  ADDITION = '+',
  SUBTRACTION = '-',
  MULTIPLICATION = '×',
  DIVISION = '÷',
  SYSTEM_OF_EQUATIONS = 'System of Equations',
}

export type Problem = {
  operation: Operation.ADDITION | Operation.SUBTRACTION | Operation.MULTIPLICATION | Operation.DIVISION;
  num1: number;
  num2: number;
  answer: number;
} | {
  operation: Operation.SYSTEM_OF_EQUATIONS;
  eq1: { a: number; b: number; c: number };
  // Fix: Standardize the structure for equations to use properties 'a', 'b', and 'c'.
  eq2: { a: number; b: number; c: number };
  solution: { x: number; y: number };
};


export interface Score {
  correct: number;
  incorrect: number;
}

export interface HistoryItem {
  problem: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}
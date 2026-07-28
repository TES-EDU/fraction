export type ScreenType =
  | 'start'
  | 'curriculumSelect'
  | 'game'
  | 'result'
  | 'settings';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameOver' | 'result';

export interface SoundSettings {
  enabled: boolean;
  volume: number;
}

export interface Fraction {
  numerator: number;
  denominator: number;
}

export type FractionProblemType =
  | 'circle'
  | 'bar'
  | 'sameDenominator'
  | 'equivalent';

export type FractionGradingMode = 'partition' | 'equivalentValue' | 'integer';

export interface Problem {
  id: string;
  level: number;
  type: FractionProblemType;
  expression: string;
  prompt: string;
  visualFraction?: Fraction;
  left?: Fraction;
  right?: Fraction;
  operator?: '+' | '-';
  equivalentLeft?: Fraction;
  equivalentRight?: {
    numerator: number | null;
    denominator: number | null;
  };
  blankField?: 'numerator' | 'denominator' | 'both';
  answer: Fraction | number;
  gradingMode: FractionGradingMode;
}

export interface ProblemResult {
  problemId: string;
  expression: string;
  correctAnswer: string;
  userAnswer: string | null;
  result: 'correct' | 'wrong' | 'missed';
  tags: string[];
}

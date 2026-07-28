import { create } from 'zustand';
import type {
  Fraction,
  GameStatus,
  Problem,
  ProblemResult,
  ScreenType,
} from '../game/types';
import {
  areEquivalent,
  formatProblemAnswer,
  generateFractionProblems,
} from '../game/fractionProblemGenerator';
import { setBestScore } from '../utils/storage';

type InputField = 'numerator' | 'denominator' | 'blank';

interface GameStore {
  screen: ScreenType;
  status: GameStatus;
  setScreen: (screen: ScreenType) => void;
  levelId: string;
  setLevelId: (levelId: string) => void;
  showVisualAid: boolean;
  setShowVisualAid: (show: boolean) => void;
  soundEnabled: boolean;
  soundVolume: number;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  currentQuestionIndex: number;
  questions: Problem[];
  correctCount: number;
  wrongCount: number;
  missedCount: number;
  score: number;
  maxCombo: number;
  combo: number;
  answeredProblems: ProblemResult[];
  startTime: number | null;
  elapsedSeconds: number;
  userNumerator: string;
  userDenominator: string;
  userBlank: string;
  activeField: InputField;
  isShowingFeedback: boolean;
  feedbackResult: 'correct' | 'wrong' | null;
  startGame: () => void;
  appendDigit: (digit: string) => void;
  deleteDigit: () => void;
  clearDigits: () => void;
  setActiveField: (field: InputField) => void;
  submitAnswer: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  goToResult: () => void;
  resetGame: () => void;
}

const emptyInput = {
  userNumerator: '',
  userDenominator: '',
  userBlank: '',
};

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'start',
  status: 'ready',
  levelId: '1',
  showVisualAid: false,
  soundEnabled: true,
  soundVolume: 0.7,
  currentQuestionIndex: 0,
  questions: [],
  correctCount: 0,
  wrongCount: 0,
  missedCount: 0,
  score: 0,
  maxCombo: 0,
  combo: 0,
  answeredProblems: [],
  startTime: null,
  elapsedSeconds: 0,
  ...emptyInput,
  activeField: 'numerator',
  isShowingFeedback: false,
  feedbackResult: null,

  setScreen: (screen) => set({ screen }),
  setLevelId: (levelId) => set({ levelId }),
  setShowVisualAid: (showVisualAid) => set({ showVisualAid }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setSoundVolume: (volume) => set({ soundVolume: volume }),
  pauseGame: () => set({ status: 'paused' }),
  resumeGame: () => set({ status: 'playing' }),

  startGame: () => {
    const level = Number.parseInt(get().levelId, 10) || 1;
    set({
      status: 'playing',
      screen: 'game',
      currentQuestionIndex: 0,
      questions: generateFractionProblems(level),
      correctCount: 0,
      wrongCount: 0,
      missedCount: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      answeredProblems: [],
      startTime: Date.now(),
      elapsedSeconds: 0,
      ...emptyInput,
      activeField: level === 4 && !get().showVisualAid ? 'blank' : 'denominator',
      isShowingFeedback: false,
      feedbackResult: null,
    });
  },

  appendDigit: (digit) => {
    const state = get();
    if (state.isShowingFeedback) return;
    const key = state.activeField === 'numerator'
      ? 'userNumerator'
      : state.activeField === 'denominator'
        ? 'userDenominator'
        : 'userBlank';
    const currentValue = state[key];
    if (currentValue.length >= 2) return;
    if (state.activeField === 'denominator' && digit === '0') return;
    const nextValue = currentValue + digit;
    if (
      state.activeField === 'denominator'
      && Number.parseInt(nextValue, 10) > 12
    ) return;
    set({ [key]: nextValue } as Partial<GameStore>);
    if (state.activeField === 'denominator') {
      if (nextValue !== '1') {
        set({ activeField: 'numerator' });
      }
    }
  },

  deleteDigit: () => {
    const state = get();
    if (state.isShowingFeedback) return;
    const key = state.activeField === 'numerator'
      ? 'userNumerator'
      : state.activeField === 'denominator'
        ? 'userDenominator'
        : 'userBlank';
    if (
      state.activeField === 'numerator'
      && state.userNumerator.length === 0
      && state.userDenominator.length > 0
    ) {
      set({ userDenominator: '', activeField: 'denominator' });
      return;
    }
    set({ [key]: state[key].slice(0, -1) } as Partial<GameStore>);
  },

  clearDigits: () => set({ ...emptyInput }),
  setActiveField: (activeField) => {
    if (!get().isShowingFeedback) set({ activeField });
  },

  submitAnswer: () => {
    const state = get();
    if (state.isShowingFeedback) return;
    const problem = state.questions[state.currentQuestionIndex];
    if (!problem) return;

    let isCorrect = false;
    let userAnswer: string | null = null;

    if (
      problem.gradingMode === 'integer'
      || (problem.type === 'equivalent' && !state.showVisualAid)
    ) {
      if (!state.userBlank) return;
      const typedValue = Number.parseInt(state.userBlank, 10);
      userAnswer = state.userBlank;
      if (problem.type === 'equivalent') {
        const correctFraction = problem.answer as Fraction;
        isCorrect = typedValue === (
          problem.blankField === 'numerator'
            ? correctFraction.numerator
            : correctFraction.denominator
        );
      } else {
        isCorrect = typedValue === problem.answer;
      }
    } else {
      if (!state.userNumerator || !state.userDenominator) return;
      const typedFraction: Fraction = {
        numerator: Number.parseInt(state.userNumerator, 10),
        denominator: Number.parseInt(state.userDenominator, 10),
      };
      if (typedFraction.denominator === 0) return;
      userAnswer = `${typedFraction.numerator}/${typedFraction.denominator}`;
      const correctFraction = problem.answer as Fraction;
      isCorrect = problem.gradingMode === 'partition'
        ? typedFraction.numerator === correctFraction.numerator
          && typedFraction.denominator === correctFraction.denominator
        : areEquivalent(typedFraction, correctFraction);
      if (
        isCorrect
        && problem.type === 'equivalent'
        && problem.equivalentLeft
      ) {
        isCorrect = typedFraction.numerator !== problem.equivalentLeft.numerator
          || typedFraction.denominator !== problem.equivalentLeft.denominator;
      }
    }

    const correctCount = state.correctCount + (isCorrect ? 1 : 0);
    const wrongCount = state.wrongCount + (isCorrect ? 0 : 1);
    const combo = isCorrect ? state.combo + 1 : 0;
    const result: ProblemResult = {
      problemId: problem.id,
      expression: problem.expression,
      correctAnswer: formatProblemAnswer(problem),
      userAnswer,
      result: isCorrect ? 'correct' : 'wrong',
      tags: [
        `level:${state.levelId}`,
        `type:${problem.type}`,
        ...(problem.operator ? [`operator:${problem.operator}`] : []),
      ],
    };

    set({
      isShowingFeedback: true,
      feedbackResult: isCorrect ? 'correct' : 'wrong',
      correctCount,
      wrongCount,
      score: correctCount * 10,
      combo,
      maxCombo: Math.max(state.maxCombo, combo),
      answeredProblems: [...state.answeredProblems, result],
    });

    window.setTimeout(() => {
      const nextIndex = get().currentQuestionIndex + 1;
      if (nextIndex >= get().questions.length) {
        const startedAt = get().startTime;
        const elapsedSeconds = startedAt
          ? Math.round((Date.now() - startedAt) / 1000)
          : 0;
        setBestScore(get().score);
        set({
          screen: 'result',
          status: 'result',
          elapsedSeconds,
          isShowingFeedback: false,
          feedbackResult: null,
        });
        return;
      }

      const nextProblem = get().questions[nextIndex];
      set({
        currentQuestionIndex: nextIndex,
        ...emptyInput,
        activeField: nextProblem.gradingMode === 'integer'
          || (nextProblem.type === 'equivalent' && !get().showVisualAid)
          ? 'blank'
          : 'denominator',
        isShowingFeedback: false,
        feedbackResult: null,
      });
    }, 1000);
  },

  goToResult: () => set({ screen: 'result', status: 'result' }),

  resetGame: () => set({
    status: 'ready',
    currentQuestionIndex: 0,
    questions: [],
    correctCount: 0,
    wrongCount: 0,
    missedCount: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    answeredProblems: [],
    startTime: null,
    elapsedSeconds: 0,
    ...emptyInput,
    activeField: 'numerator',
    isShowingFeedback: false,
    feedbackResult: null,
  }),
}));

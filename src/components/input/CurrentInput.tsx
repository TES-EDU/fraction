import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { FONT_FAMILY, COLORS } from '../../constants';

const CurrentInput: React.FC = () => {
  const questions = useGameStore((s) => s.questions);
  const currentQuestionIndex = useGameStore((s) => s.currentQuestionIndex);
  const userNumerator = useGameStore((s) => s.userNumerator);
  const userDenominator = useGameStore((s) => s.userDenominator);
  const userBlank = useGameStore((s) => s.userBlank);
  const activeField = useGameStore((s) => s.activeField);
  const setActiveField = useGameStore((s) => s.setActiveField);
  const showVisualAid = useGameStore((s) => s.showVisualAid);
  const problem = questions[currentQuestionIndex];

  const inputBox = (
    value: string,
    field: 'numerator' | 'denominator' | 'blank',
    label: string,
  ) => {
    const isActive = activeField === field;
    return (
      <button
        type="button"
        onClick={() => setActiveField(field)}
        role="textbox"
        aria-label={`${label} 입력`}
        className="flex h-16 w-20 items-center justify-center rounded-2xl text-3xl font-bold shadow-inner transition-all duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:h-20 md:w-24 md:text-4xl"
        style={{
          backgroundColor: isActive ? COLORS.paleSky : '#FFFFFF',
          border: isActive
            ? `3px solid ${COLORS.pacificBlue}`
            : `2px solid ${COLORS.border}`,
          color: COLORS.yaleBlue,
          fontFamily: FONT_FAMILY,
        }}
      >
        {value || '?'}
      </button>
    );
  };

  if (
    problem?.gradingMode === 'integer'
    || (problem?.type === 'equivalent' && !showVisualAid)
  ) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center gap-2 px-4"
        style={{ fontFamily: FONT_FAMILY }}
      >
        <span className="text-lg font-bold" style={{ color: COLORS.textMid }}>
          빈칸에 들어갈 수
        </span>
        {inputBox(userBlank, 'blank', '빈칸')}
      </div>
    );
  }

  return (
    <div
      className="flex h-full items-center justify-center px-4"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <div className="flex flex-col items-center">
        {inputBox(userNumerator, 'numerator', '분자')}
        <div
          className="my-2 h-[5px] w-24 rounded-full md:w-28"
          style={{ backgroundColor: COLORS.yaleBlue }}
        />
        {inputBox(userDenominator, 'denominator', '분모')}
      </div>
    </div>
  );
};

export default CurrentInput;

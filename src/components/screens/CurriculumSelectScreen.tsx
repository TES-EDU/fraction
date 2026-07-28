import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getLevelDisplayName } from '../../game/fractionProblemGenerator';
import { FONT_FAMILY, COLORS } from '../../constants';

const LEVELS = [1, 2, 3, 4];

const LEVEL_DESCRIPTIONS = [
  '원의 색칠된 부분을 분수로 나타내요',
  '막대의 색칠된 부분을 분수로 나타내요',
  '분모가 같은 분수를 더하고 빼요',
  '크기가 같은 두 분수를 그림으로 이해해요',
];

const LevelIcon: React.FC<{ level: number }> = ({ level }) => {
  if (level === 1) {
    return (
      <div
        className="h-20 w-20 rounded-full border-[4px] shadow-sm"
        style={{
          borderColor: COLORS.yaleBlue,
          background: `conic-gradient(${COLORS.pacificBlue} 0 33%, #fff 33% 100%)`,
        }}
      />
    );
  }
  if (level === 2) {
    return (
      <div
        className="grid h-14 w-32 grid-cols-4 overflow-hidden rounded-xl border-[4px] bg-white shadow-sm"
        style={{ borderColor: COLORS.yaleBlue }}
      >
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            style={{
              backgroundColor: index < 2 ? COLORS.pacificBlue : '#fff',
              borderRight: index < 3 ? `2px solid ${COLORS.yaleBlue}` : undefined,
            }}
          />
        ))}
      </div>
    );
  }
  if (level === 3) {
    return (
      <div className="flex items-center gap-3 text-2xl font-black" style={{ color: COLORS.yaleBlue }}>
        <span className="flex flex-col items-center leading-none">
          <span>1</span>
          <span className="mt-1 w-8 border-t-[3px] pt-1" style={{ borderColor: COLORS.yaleBlue }}>4</span>
        </span>
        <span style={{ color: COLORS.pacificBlue }}>±</span>
        <span className="flex flex-col items-center leading-none">
          <span>2</span>
          <span className="mt-1 w-8 border-t-[3px] pt-1" style={{ borderColor: COLORS.yaleBlue }}>4</span>
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 text-2xl font-black" style={{ color: COLORS.yaleBlue }}>
      <span className="flex flex-col items-center leading-none">
        <span>1</span>
        <span className="mt-1 w-8 border-t-[3px] pt-1" style={{ borderColor: COLORS.yaleBlue }}>2</span>
      </span>
      <span style={{ color: COLORS.pacificBlue }}>=</span>
      <span className="flex flex-col items-center leading-none">
        <span>2</span>
        <span className="mt-1 w-8 border-t-[3px] pt-1" style={{ borderColor: COLORS.yaleBlue }}>4</span>
      </span>
    </div>
  );
};

const CurriculumSelectScreen: React.FC = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const setLevelId = useGameStore((s) => s.setLevelId);
  const setShowVisualAid = useGameStore((s) => s.setShowVisualAid);
  const startGame = useGameStore((s) => s.startGame);
  const [pendingLevel, setPendingLevel] = useState<number | null>(null);

  const handleLevelSelect = (level: number) => {
    if (level >= 3) {
      setPendingLevel(level);
      return;
    }
    setLevelId(String(level));
    setShowVisualAid(false);
    startGame();
  };

  const startWithVisualChoice = (showVisualAid: boolean) => {
    if (pendingLevel === null) return;
    setLevelId(String(pendingLevel));
    setShowVisualAid(showVisualAid);
    setPendingLevel(null);
    startGame();
  };

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        fontFamily: FONT_FAMILY,
        background: `linear-gradient(135deg, ${COLORS.cream} 0%, ${COLORS.frozenWater} 100%)`,
      }}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 shadow-sm shrink-0"
        style={{
          backgroundColor: 'rgba(190, 233, 232, 0.3)',
          backdropFilter: 'blur(8px)',
          borderBottom: `2px solid ${COLORS.border}`,
        }}
      >
        <button
          onClick={() => setScreen('start')}
          aria-label="뒤로 가기"
          className="text-2xl px-3 py-1 rounded-xl hover:bg-white/60 active:scale-95 transition-all font-bold"
          style={{ color: COLORS.yaleBlue }}
        >
          ←
        </button>
        <h1 className="text-2xl font-bold" style={{ color: COLORS.yaleBlue }}>
          분수 학습 단계
        </h1>
        <button
          onClick={() => setScreen('settings')}
          aria-label="설정"
          className="text-2xl px-3 py-1 rounded-xl hover:bg-white/60 active:scale-95 transition-all"
          style={{ color: COLORS.yaleBlue }}
        >
          ⚙️
        </button>
      </div>

      {pendingLevel !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl"
            style={{ border: `2px solid ${COLORS.border}` }}
          >
            <div className="mb-3 text-5xl">▰</div>
            <h2 className="mb-2 text-2xl font-black" style={{ color: COLORS.yaleBlue }}>
              그림도 같이 볼까요?
            </h2>
            <p className="mb-6 text-base font-bold" style={{ color: COLORS.textMid }}>
              분수식 아래에 칸이 나뉜 막대 그림을 함께 보여줍니다.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => startWithVisualChoice(false)}
                className="rounded-2xl border-2 bg-white py-4 text-xl font-black active:scale-95"
                style={{ borderColor: COLORS.border, color: COLORS.yaleBlue }}
              >
                아니오
              </button>
              <button
                type="button"
                onClick={() => startWithVisualChoice(true)}
                className="rounded-2xl py-4 text-xl font-black text-white active:scale-95"
                style={{ backgroundColor: COLORS.pacificBlue }}
              >
                네
              </button>
            </div>
            <button
              type="button"
              onClick={() => setPendingLevel(null)}
              className="mt-4 text-sm font-bold underline"
              style={{ color: COLORS.textMid }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Grid container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-4xl mx-auto w-full flex items-center justify-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleLevelSelect(lvl)}
              aria-label={`${lvl}단계: ${getLevelDisplayName(lvl)}`}
              className="relative flex flex-col items-center justify-start rounded-3xl border-2 bg-white px-5 pb-6 pt-14 shadow-sm transition-all duration-150 active:scale-95 hover:scale-[1.02] hover:shadow-md"
              style={{
                minHeight: '340px',
                borderColor: COLORS.border,
              }}
            >
              <span
                className="absolute left-5 top-5 rounded-full px-3 py-1 text-sm font-black"
                style={{ color: COLORS.pacificBlue, backgroundColor: `${COLORS.frozenWater}66` }}
              >
                {lvl}단계
              </span>
              <div
                className="mb-5 flex h-36 w-full items-center justify-center rounded-3xl"
                style={{ backgroundColor: `${COLORS.paleSky}99` }}
              >
                <LevelIcon level={lvl} />
              </div>
              <span
                className="mb-3 text-center text-xl font-black leading-tight md:text-2xl"
                style={{ color: COLORS.pacificBlue }}
              >
                {getLevelDisplayName(lvl)}
              </span>
              <span
                className="text-center text-sm font-bold leading-relaxed"
                style={{ color: COLORS.textMid }}
              >
                {LEVEL_DESCRIPTIONS[lvl - 1]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div
        className="px-4 py-4 text-center shrink-0 border-t"
        style={{ backgroundColor: 'rgba(190, 233, 232, 0.15)', borderColor: COLORS.border }}
      >
        <p className="text-sm font-medium" style={{ color: COLORS.textMid }}>
          각 단계는 10문제로 구성되어 있어요.
        </p>
      </div>
    </div>
  );
};

export default CurriculumSelectScreen;

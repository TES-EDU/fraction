import React from 'react';
import type { Fraction, Problem } from '../../game/types';
import { COLORS, FONT_FAMILY } from '../../constants';

interface FractionTextProps {
  fraction: Fraction | { numerator: number | null; denominator: number | null };
  blank?: 'numerator' | 'denominator' | 'both';
  accent?: boolean;
}

const FractionText: React.FC<FractionTextProps> = ({
  fraction,
  accent = false,
}) => (
  <span
    className="inline-flex min-w-[92px] flex-col items-center justify-center font-black"
    style={{
      color: accent ? COLORS.pacificBlue : COLORS.yaleBlue,
      fontFamily: FONT_FAMILY,
    }}
  >
    <span className="flex h-16 min-w-[78px] items-center justify-center text-4xl">
      {fraction.numerator ?? '?'}
    </span>
    <span
      className="h-[5px] w-full rounded-full"
      style={{ backgroundColor: COLORS.yaleBlue }}
    />
    <span className="flex h-16 min-w-[78px] items-center justify-center text-4xl">
      {fraction.denominator ?? '?'}
    </span>
  </span>
);

const CircleFraction: React.FC<{ fraction: Fraction }> = ({ fraction }) => {
  const { numerator, denominator } = fraction;
  const size = 420;
  const center = size / 2;
  const radius = 170;
  const sliceAngle = (Math.PI * 2) / denominator;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-full w-full drop-shadow-lg"
      role="img"
      aria-label={`전체 ${denominator}칸 중 ${numerator}칸 색칠`}
    >
      {Array.from({ length: denominator }, (_, index) => {
        const startAngle = index * sliceAngle - Math.PI / 2;
        const endAngle = (index + 1) * sliceAngle - Math.PI / 2;
        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);
        const largeArc = sliceAngle > Math.PI ? 1 : 0;
        const path = [
          `M ${center} ${center}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
          'Z',
        ].join(' ');

        return (
          <path
            key={index}
            d={path}
            fill={index < numerator ? COLORS.pacificBlue : '#FFFFFF'}
            stroke={COLORS.yaleBlue}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        );
      })}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={COLORS.yaleBlue}
        strokeWidth="7"
      />
    </svg>
  );
};

const BarFraction: React.FC<{ fraction: Fraction }> = ({ fraction }) => {
  const { numerator, denominator } = fraction;
  const width = 480;
  const height = 180;
  const cellWidth = width / denominator;

  return (
    <svg
      viewBox="0 0 540 260"
      className="h-full w-full drop-shadow-lg"
      role="img"
      aria-label={`전체 ${denominator}칸 중 ${numerator}칸 색칠`}
    >
      {Array.from({ length: denominator }, (_, index) => (
        <rect
          key={index}
          x={30 + index * cellWidth}
          y={40}
          width={cellWidth}
          height={height}
          fill={index < numerator ? COLORS.pacificBlue : '#FFFFFF'}
          stroke={COLORS.yaleBlue}
          strokeWidth="4"
        />
      ))}
      <rect
        x={30}
        y={40}
        width={width}
        height={height}
        rx={8}
        fill="none"
        stroke={COLORS.yaleBlue}
        strokeWidth="7"
      />
    </svg>
  );
};

const MiniBar: React.FC<{ fraction: Fraction; color?: string }> = ({
  fraction,
  color = COLORS.pacificBlue,
}) => (
  <div
    className="grid h-16 w-full max-w-[310px] overflow-hidden rounded-xl border-[3px] bg-white shadow-sm"
    style={{
      gridTemplateColumns: `repeat(${fraction.denominator}, minmax(0, 1fr))`,
      borderColor: COLORS.yaleBlue,
    }}
    aria-label={`전체 ${fraction.denominator}칸 중 ${fraction.numerator}칸 색칠`}
  >
    {Array.from({ length: fraction.denominator }, (_, index) => (
      <span
        key={index}
        style={{
          backgroundColor: index < fraction.numerator ? color : '#FFFFFF',
          borderRight: index < fraction.denominator - 1
            ? `2px solid ${COLORS.yaleBlue}`
            : undefined,
        }}
      />
    ))}
  </div>
);

const OperationVisual: React.FC<{ problem: Problem; showVisualAid: boolean }> = ({
  problem,
  showVisualAid,
}) => (
  <div className="flex w-full flex-col items-center justify-center gap-7">
    <div className="flex items-center justify-center gap-8 md:gap-12">
      <FractionText fraction={problem.left!} />
      <span className="text-6xl font-black" style={{ color: COLORS.yaleBlue }}>
        {problem.operator}
      </span>
      <FractionText fraction={problem.right!} />
      <span className="text-6xl font-black" style={{ color: COLORS.yaleBlue }}>
        =
      </span>
      <span className="text-7xl font-black" style={{ color: COLORS.pacificBlue }}>
        ?
      </span>
    </div>
    {showVisualAid && (
      <div className="grid w-full max-w-2xl grid-cols-[1fr_auto_1fr] items-center gap-4">
        <MiniBar fraction={problem.left!} />
        <span className="text-4xl font-black" style={{ color: COLORS.yaleBlue }}>
          {problem.operator}
        </span>
        <MiniBar fraction={problem.right!} color="#FF9F7A" />
      </div>
    )}
  </div>
);

const EquivalentVisual: React.FC<{ problem: Problem; showVisualAid: boolean }> = ({
  problem,
  showVisualAid,
}) => {
  const completedRight = problem.answer as Fraction;
  const displayedRight = showVisualAid
    ? { numerator: null, denominator: null }
    : {
        numerator: problem.blankField === 'numerator'
          ? null
          : completedRight.numerator,
        denominator: problem.blankField === 'denominator'
          ? null
          : completedRight.denominator,
      };
  const displayedBlank = showVisualAid ? 'both' : problem.blankField;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-7">
      <div className="flex items-center justify-center gap-8 md:gap-12">
        <FractionText fraction={problem.equivalentLeft!} />
        <span className="text-6xl font-black" style={{ color: COLORS.yaleBlue }}>
          =
        </span>
        <FractionText
          fraction={displayedRight}
          blank={displayedBlank}
          accent
        />
      </div>
      {showVisualAid && (
        <div className="grid w-full max-w-2xl grid-cols-[1fr_auto_1fr] items-center gap-4">
          <MiniBar fraction={problem.equivalentLeft!} />
          <span className="text-4xl font-black" style={{ color: COLORS.yaleBlue }}>
            =
          </span>
          <MiniBar fraction={completedRight} />
        </div>
      )}
    </div>
  );
};

const FractionVisual: React.FC<{ problem: Problem; showVisualAid: boolean }> = ({
  problem,
  showVisualAid,
}) => (
  <div
    className="flex h-full w-full flex-col items-center justify-center gap-4"
    style={{ fontFamily: FONT_FAMILY }}
  >
    <p
      className="shrink-0 text-center text-xl font-bold md:text-2xl"
      style={{ color: COLORS.yaleBlue }}
    >
      {problem.type === 'equivalent'
        ? showVisualAid
          ? '아래 그림을 분수로 나타내어 동치분수를 완성하세요.'
          : '빈칸에 알맞은 수를 입력하여 동치분수를 완성하세요.'
        : problem.prompt}
    </p>
    <div className="flex min-h-0 w-full flex-1 items-center justify-center">
      {problem.type === 'circle' && (
        <CircleFraction fraction={problem.visualFraction!} />
      )}
      {problem.type === 'bar' && (
        <BarFraction fraction={problem.visualFraction!} />
      )}
      {problem.type === 'sameDenominator' && (
        <OperationVisual problem={problem} showVisualAid={showVisualAid} />
      )}
      {problem.type === 'equivalent' && (
        <EquivalentVisual problem={problem} showVisualAid={showVisualAid} />
      )}
    </div>
  </div>
);

export default React.memo(FractionVisual);

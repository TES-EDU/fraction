import type { Fraction, Problem } from './types';

export const QUESTIONS_PER_LEVEL = 10;

const LEVEL_NAMES = [
  '원형 그림',
  '막대 그림',
  '동분모 덧셈·뺄셈',
  '동치분수 빈칸',
] as const;

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const gcd = (a: number, b: number): number => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x || 1;
};

export function areEquivalent(a: Fraction, b: Fraction): boolean {
  return a.denominator !== 0
    && b.denominator !== 0
    && a.numerator * b.denominator === b.numerator * a.denominator;
}

export function formatFraction(fraction: Fraction): string {
  return `${fraction.numerator}/${fraction.denominator}`;
}

export function formatProblemAnswer(problem: Problem): string {
  return typeof problem.answer === 'number'
    ? String(problem.answer)
    : formatFraction(problem.answer);
}

export function getLevelDisplayName(level: number): string {
  return LEVEL_NAMES[level - 1] ?? '분수 학습';
}

function createVisualProblem(level: 1 | 2, index: number): Problem {
  const denominator = randomInt(2, level === 1 ? 8 : 9);
  const numerator = randomInt(1, denominator - 1);
  const type = level === 1 ? 'circle' : 'bar';
  const fraction = { numerator, denominator };

  return {
    id: `${type}_${index}_${Date.now()}_${Math.random()}`,
    level,
    type,
    expression: `${type === 'circle' ? '원형' : '막대'}: ${formatFraction(fraction)}`,
    prompt: '색칠한 부분을 분수로 나타내세요.',
    visualFraction: fraction,
    answer: fraction,
    gradingMode: 'partition',
  };
}

function createOperationProblem(operator: '+' | '-', index: number): Problem {
  const denominator = randomInt(3, 9);
  let leftNumerator: number;
  let rightNumerator: number;

  if (operator === '+') {
    leftNumerator = randomInt(1, denominator - 2);
    rightNumerator = randomInt(1, denominator - leftNumerator);
  } else {
    leftNumerator = randomInt(2, denominator - 1);
    rightNumerator = randomInt(1, leftNumerator - 1);
  }

  const left = { numerator: leftNumerator, denominator };
  const right = { numerator: rightNumerator, denominator };
  const answer = {
    numerator: operator === '+'
      ? leftNumerator + rightNumerator
      : leftNumerator - rightNumerator,
    denominator,
  };

  return {
    id: `operation_${operator}_${index}_${Date.now()}_${Math.random()}`,
    level: 3,
    type: 'sameDenominator',
    expression: `${formatFraction(left)} ${operator} ${formatFraction(right)}`,
    prompt: '계산한 값을 분수로 입력하세요.',
    left,
    right,
    operator,
    answer,
    gradingMode: 'partition',
  };
}

function createEquivalentProblem(
  numerator: number,
  denominator: number,
  multiplier: number,
  index: number,
): Problem {
  const rightNumerator = numerator * multiplier;
  const rightDenominator = denominator * multiplier;
  const answer = {
    numerator: rightNumerator,
    denominator: rightDenominator,
  };
  const left = { numerator, denominator };
  const right = {
    numerator: rightNumerator,
    denominator: rightDenominator,
  };

  return {
    id: `equivalent_${index}_${Date.now()}_${Math.random()}`,
    level: 4,
    type: 'equivalent',
    expression: `${formatFraction(left)} = ${formatFraction(answer)}`,
    prompt: '아래 그림을 분수로 나타내어 동치분수를 완성하세요.',
    equivalentLeft: left,
    equivalentRight: right,
    blankField: index % 2 === 0 ? 'numerator' : 'denominator',
    answer,
    gradingMode: 'equivalentValue',
  };
}

function createEquivalentProblems(): Problem[] {
  const candidates: Array<{
    numerator: number;
    denominator: number;
    multiplier: number;
  }> = [];

  for (let denominator = 2; denominator <= 6; denominator += 1) {
    for (let numerator = 1; numerator < denominator; numerator += 1) {
      if (gcd(numerator, denominator) !== 1) continue;
      for (let multiplier = 2; multiplier <= 4; multiplier += 1) {
        if (
          numerator * multiplier <= 12
          && denominator * multiplier <= 12
        ) {
          candidates.push({ numerator, denominator, multiplier });
        }
      }
    }
  }

  return candidates
    .sort(() => Math.random() - 0.5)
    .slice(0, QUESTIONS_PER_LEVEL)
    .map((candidate, index) => createEquivalentProblem(
      candidate.numerator,
      candidate.denominator,
      candidate.multiplier,
      index,
    ));
}

function uniqueProblems(
  count: number,
  createProblem: (index: number) => Problem,
): Problem[] {
  const problems: Problem[] = [];
  const signatures = new Set<string>();
  let attempts = 0;

  while (problems.length < count && attempts < 500) {
    attempts += 1;
    const problem = createProblem(problems.length);
    const signature = `${problem.type}:${problem.expression}`;
    if (signatures.has(signature)) continue;
    signatures.add(signature);
    problems.push(problem);
  }

  if (problems.length !== count) {
    throw new Error(`분수 문제 ${count}개를 중복 없이 만들지 못했습니다.`);
  }

  return problems;
}

export function generateFractionProblems(level: number): Problem[] {
  switch (level) {
    case 1:
      return uniqueProblems(QUESTIONS_PER_LEVEL, (i) => createVisualProblem(1, i));
    case 2:
      return uniqueProblems(QUESTIONS_PER_LEVEL, (i) => createVisualProblem(2, i));
    case 3: {
      const addition = uniqueProblems(5, (i) => createOperationProblem('+', i));
      const subtraction = uniqueProblems(5, (i) => createOperationProblem('-', i));
      return [...addition, ...subtraction].sort(() => Math.random() - 0.5);
    }
    case 4: {
      return createEquivalentProblems();
    }
    default:
      return generateFractionProblems(1);
  }
}

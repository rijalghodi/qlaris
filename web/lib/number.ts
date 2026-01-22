export const delimitNumber = (number: number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const MONEY_UNIT = [1000, 2000, 5000, 10000, 20000, 50000, 100000];

export const getSuggestionMoneys = (total: number) => {
  const result = new Set<number>();
  const maxUnit = MONEY_UNIT[MONEY_UNIT.length - 1];

  // 1. always include total
  result.add(total);

  // 2. mod-based rule
  for (const unit of MONEY_UNIT) {
    if (total < unit && total % unit !== 0) {
      result.add(unit);
    }
  }

  // 3. total > max unit → next suitable multiple
  if (total > maxUnit && total % maxUnit !== 0) {
    const next = Math.ceil(total / maxUnit) * maxUnit;
    result.add(next);
  }

  return Array.from(result).sort((a, b) => a - b);
};

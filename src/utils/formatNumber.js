// Indian-style compact number formatting:
// 950 -> "950", 1000 -> "1k", 1500 -> "1.5k", 150000 -> "1.5L", 25000000 -> "2.5Cr"
export function formatCompactNumber(num) {
  const n = Number(num) || 0;
  if (n < 1000) return String(n);

  const fmt = (value, suffix) => {
    const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
    return `${rounded}${suffix}`;
  };

  if (n < 100000) return fmt(n / 1000, 'k');
  if (n < 10000000) return fmt(n / 100000, 'L');
  return fmt(n / 10000000, 'Cr');
}

export default { formatCompactNumber };

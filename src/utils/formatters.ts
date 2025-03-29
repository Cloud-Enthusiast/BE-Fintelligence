
/**
 * Format a number as Indian currency (INR)
 */
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Format a number as a percentage
 */
export const formatPercent = (value: number) => {
  return `${value}%`;
};

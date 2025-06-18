export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const calculateTax = (amount: number, rate: number = 0.08): number => {
  return amount * rate;
};

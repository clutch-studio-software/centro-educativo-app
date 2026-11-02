export const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export const formatCurrency = (amount) => {
  return currencyFormatter.format(amount || 0);
};

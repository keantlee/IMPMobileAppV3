export const formatCurrency = (amount: string | number) => {
    const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(numericValue || 0);
};

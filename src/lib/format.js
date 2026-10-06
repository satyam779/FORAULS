const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const formatPrice = (n) => inr.format(n);

export const discount = (price, mrp) => Math.round(((mrp - price) / mrp) * 100);

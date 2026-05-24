export const discountPct = (mrp: number, offer: number) => Math.round(((mrp - offer) / mrp) * 100);
export const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
export const generateOrderId = () => 'ROA-' + Date.now().toString().slice(-6) + Math.random().toString(36).slice(2, 5).toUpperCase();
export const DELIVERY_FREE_THRESHOLD = 499;
export const DELIVERY_CHARGE = 49;
export const getDeliveryCharge = (total: number) => total >= DELIVERY_FREE_THRESHOLD ? 0 : DELIVERY_CHARGE;
export const CATEGORIES = [
  { value: 'coffee', label: 'Coffee', emoji: '☕' },
  { value: 'turmeric', label: 'Turmeric', emoji: '🌿' },
  { value: 'honey', label: 'Honey', emoji: '🍯' },
];

/**
 * WhatsApp Integration
 * Redirects to WhatsApp with order details for confirmation
 */

const WA_NUMBER = '917036252018';

export function openWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, '_blank');
}

export function buildOrderMessage(
  orderId: string,
  items: { name: string; weight: string; qty: number; price: number }[],
  total: number,
  address?: { name: string; address: string; city: string; pincode: string; phone: string }
): string {
  let message = `🌿 *New Order — Roots of Araku*\n\n`;
  message += `📋 *Order ID:* #${orderId}\n\n`;
  message += `🛒 *Items:*\n`;
  items.forEach((item) => {
    message += `  • ${item.name} (${item.weight}) × ${item.qty} — ₹${item.price * item.qty}\n`;
  });
  message += `\n💰 *Total: ₹${total}*\n`;

  if (address) {
    message += `\n📍 *Delivery Address:*\n`;
    message += `  ${address.name}\n`;
    message += `  ${address.address}\n`;
    message += `  ${address.city} - ${address.pincode}\n`;
    message += `  📞 ${address.phone}\n`;
  }

  message += `\nPlease confirm this order. Thank you! 🙏`;
  return message;
}
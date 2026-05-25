const WA_NUMBER = '917036252018';

export function openWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, '_blank');
}

export function buildOrderMessage(orderId: string, itemCount: number, total: number): string {
  return `New Order — Roots of Araku\n\nOrder ID: #${orderId}\nItems: ${itemCount}\nTotal: ₹${total}\n\nPlease confirm order. Thank you!`;
}

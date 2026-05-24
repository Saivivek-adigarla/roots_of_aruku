const WA_NUMBER = '917036252018';

export function openWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, '_blank');
}

export function buildOrderMessage(order: { orderId: string; customerName: string; customerPhone: string; deliveryAddress: { line1: string; line2?: string; city: string; state: string; pincode: string }; items: Array<{ name: string; weight: string; qty: number; offerPrice: number }>; totalAmount: number; deliveryCharge: number; paymentMethod: string }) {
  const itemLines = order.items.map(i => `- ${i.name} ${i.weight} x${i.qty} = ₹${i.offerPrice * i.qty}`).join('\n');
  const addr = order.deliveryAddress;
  return `🌿 New Order — Roots of Araku\n\n👤 Name: ${order.customerName}\n📞 Phone: ${order.customerPhone}\n📍 Address: ${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}, ${addr.city}, ${addr.state} - ${addr.pincode}\n💳 Payment: ${order.paymentMethod}\n🆔 Order ID: #${order.orderId}\n\nOrder Items:\n${itemLines}\n\nTotal: ₹${order.totalAmount}\n🚚 Delivery: ${order.deliveryCharge === 0 ? 'FREE' : '₹' + order.deliveryCharge}\n\nPlease confirm order. Thank you! 🙏`;
}

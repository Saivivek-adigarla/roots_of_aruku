import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Phone, MessageSquare } from 'lucide-react';
import { stripHtml } from '../utils/security';
import { openWhatsApp } from '../utils/whatsapp';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  showActions?: boolean;
}

const KNOWLEDGE_BASE: { patterns: RegExp[]; response: string }[] = [
  { patterns: [/coffee/i, /కాఫీ/], response: 'We offer premium Araku Valley coffee — Tribal Reserve, Estate Blend, Valley Drip, and Mountain Roast Beans. All 100% organic, tribal-sourced. Would you like to see our collection?' },
  { patterns: [/turmeric/i, /పసుపు/], response: 'Our Wild Turmeric is harvested from Eastern Ghats forests with high curcumin content. Available in 50g to 1Kg packs starting at just ₹39. Great for cooking and wellness!' },
  { patterns: [/honey/i, /తేనె/], response: 'Wild Golden Honey from Araku Valley forests — raw, unfiltered, enzyme-rich. Available in 500g (₹299), 1Kg (₹649), and 5Kg (₹2499). Pure and natural!' },
  { patterns: [/price/i, /ధర/i, /cost/i, /ఖర్చు/], response: 'Our products range from ₹39 (Wild Turmeric 50g) to ₹2,499 (Wild Golden Honey 5Kg). All with launch offer discounts! Check /products for full pricing.' },
  { patterns: [/delivery/i, /డెలివరీ/, /shipping/i, /షిప్పింగ్/], response: 'Free delivery on orders above ₹499! Standard delivery takes 3-5 business days across India. Tracking available via WhatsApp.' },
  { patterns: [/payment/i, /చెల్లింపు/, /upi/i, /pay/i], response: 'We accept UPI payments only (pickurstay@ybl). You can pay via Google Pay, PhonePe, Paytm, BHIM, or any UPI app. QR code available at checkout!' },
  { patterns: [/order/i, /ఆర్డర్/, /track/i, /ట్రాక్/], response: 'You can track your order in My Orders section or message us on WhatsApp with your order ID for real-time updates.' },
  { patterns: [/return/i, /refund/i, /రిఫండ్/], response: 'We offer easy returns within 7 days of delivery. Contact us via WhatsApp for return/refund requests. Full refund for unopened products.' },
  { patterns: [/offer/i, /discount/i, /coupon/i, /ఆఫర్/], response: 'Launch offers running now — up to 33% OFF on all products! Use coupon codes at checkout for additional discounts.' },
  { patterns: [/contact/i, /support/i, /సహాయం/, /help/i, /సపోర్ట్/], response: 'You can reach us via:\n- WhatsApp: +91 7036252018\n- Email: pickurstay@gmail.com\nWe respond within 2 hours during business hours (9AM-9PM IST).' },
  { patterns: [/araku/i, /అరకు/, /tribal/i, /organic/i, /ఆర్గానిక్/], response: 'Araku Valley in the Eastern Ghats is home to ancient tribal communities. Our products are 100% organic, sustainably harvested, and directly sourced from tribal farmers. No pesticides, no chemicals — pure nature!' },
  { patterns: [/hello/i, /hi/i, /నమస్కారం/, /హలో/], response: 'Hello! Namaskaram! 🙏 I\'m your PickUrStay assistant. I can help with products, orders, payments, and more. I understand Telugu and English. How can I help you today?' },
];

function getAIResponse(message: string): { content: string; showActions: boolean } {
  const lower = message.toLowerCase();

  for (const entry of KNOWLEDGE_BASE) {
    if (entry.patterns.some(p => p.test(lower))) {
      return { content: entry.response, showActions: false };
    }
  }

  return {
    content: "I couldn't find an exact answer for that. Let me connect you with our support team who can help!",
    showActions: true,
  };
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'assistant', content: "Namaskaram! 🙏 I'm your PickUrStay assistant. I understand Telugu & English. Ask me about products, orders, payments, or anything! How can I help?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    const newMsgId = messages.length;
    setMessages(prev => [...prev, { id: newMsgId, role: 'user', content: userMessage }]);

    setLoading(true);
    try {
      // Try edge function first
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ message: stripHtml(userMessage) }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const responseText = typeof data.response === 'string' ? stripHtml(data.response) : '';
        if (responseText) {
          setMessages(prev => [...prev, { id: newMsgId + 1, role: 'assistant', content: responseText }]);
          setLoading(false);
          return;
        }
      }
      throw new Error('fallback');
    } catch {
      // Fallback to local knowledge base
      const { content, showActions } = getAIResponse(userMessage);
      setMessages(prev => [...prev, { id: newMsgId + 1, role: 'assistant', content, showActions }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleCallSupport = () => {
    window.open('tel:+917036252018', '_self');
  };

  const handleWhatsAppSupport = () => {
    openWhatsApp('Hi, I need help with my query on PickUrStay. Can you assist me?');
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-maroon-700 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-maroon-800 transition-all hover:scale-110 z-50"
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200" style={{ maxHeight: 'min(500px, calc(100vh - 48px))' }}>
      <div className="bg-maroon-700 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <div>
            <span className="font-semibold text-sm">PickUrStay AI</span>
            <p className="text-xs text-warm-200">Telugu & English support</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="hover:bg-maroon-800 p-1 rounded"><X size={20} /></button>
      </div>

      <div className="flex-1 h-80 overflow-y-auto p-4 space-y-3 bg-warm-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 bg-maroon-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-maroon-700" />
              </div>
            )}
            <div className={`max-w-[75%] ${msg.role === 'user' ? '' : 'space-y-2'}`}>
              <div className={`px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-maroon-700 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>
                {msg.content}
              </div>
              {msg.showActions && (
                <div className="flex gap-2 mt-1">
                  <button onClick={handleCallSupport} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
                    <Phone size={12} /> Call
                  </button>
                  <button onClick={handleWhatsAppSupport} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition">
                    <MessageSquare size={12} /> WhatsApp
                  </button>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 bg-gold-400 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-maroon-900" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 bg-maroon-100 rounded-full flex items-center justify-center"><Bot size={14} className="text-maroon-700" /></div>
            <div className="bg-white px-3 py-2 rounded-xl border border-gray-200"><Loader2 size={14} className="animate-spin text-maroon-700" /></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask in Telugu or English..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none text-sm"
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="px-3 py-2 bg-maroon-700 text-white rounded-lg hover:bg-maroon-800 disabled:opacity-50">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

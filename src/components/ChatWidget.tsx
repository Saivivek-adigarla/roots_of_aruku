import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'assistant', content: 'Hello! I\'m here to help you with product questions, recommendations, and order support. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    const newMsgId = messages.length;
    setMessages(prev => [...prev, { id: newMsgId, role: 'user', content: userMessage }]);

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ message: userMessage }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setMessages(prev => [...prev, { id: newMsgId + 1, role: 'assistant', content: data.response || 'Sorry, I couldn\'t process that. Please try again.' }]);
    } catch {
      setMessages(prev => [...prev, { id: newMsgId + 1, role: 'assistant', content: 'Sorry, I\'m having trouble connecting. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200">
      <div className="bg-maroon-700 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <span className="font-semibold">AI Assistant</span>
        </div>
        <button onClick={() => setOpen(false)} className="hover:bg-maroon-800 p-1 rounded">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 h-80 overflow-y-auto p-4 space-y-3 bg-warm-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-maroon-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-maroon-700" />
              </div>
            )}
            <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-maroon-700 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-maroon-900" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-maroon-100 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-maroon-700" />
            </div>
            <div className="bg-white px-3 py-2 rounded-xl border border-gray-200">
              <Loader2 size={16} className="animate-spin text-maroon-700" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-maroon-700 text-white rounded-lg hover:bg-maroon-800 disabled:opacity-50 disabled:hover:bg-maroon-700"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

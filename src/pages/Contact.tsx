import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Instagram } from 'lucide-react';
import toast from 'react-hot-toast';
import { openWhatsApp } from '../utils/whatsapp';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Fill all required fields');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent! We will respond soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  const handleWhatsApp = () => {
    openWhatsApp(import.meta.env.VITE_WHATSAPP_NUMBER || '917036252018', 'Hi, I have a query about Roots of Araku');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Get in Touch</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions about our products or your order? We'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Subject</label>
              <input
                value={form.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                placeholder="Order inquiry, product question..."
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Message *</label>
              <textarea
                value={form.message}
                onChange={(e) => handleChange('message', e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none resize-none"
                placeholder="Your message..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-maroon-700 text-white py-3 rounded-lg font-semibold hover:bg-maroon-800 disabled:opacity-50 transition"
            >
              {loading ? 'Sending...' : <>Send Message <Send size={18} /></>}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-maroon-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="text-maroon-700" size={20} />
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <a href="tel:+917036252018" className="text-gray-600 hover:text-maroon-700">+91 7036252018</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-maroon-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="text-maroon-700" size={20} />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:pickurstay@gmail.com" className="text-gray-600 hover:text-maroon-700">pickurstay@gmail.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-maroon-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-maroon-700" size={20} />
                </div>
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">Araku Valley, Visakhapatnam<br />Andhra Pradesh, India</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-maroon-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="text-maroon-700" size={20} />
                </div>
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-gray-600">Mon - Sat: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Contact</h3>
            <div className="space-y-3">
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                <MessageCircle size={20} /> Chat on WhatsApp
              </button>
              <a
                href="https://instagram.com/rootsofaraku"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                <Instagram size={20} /> Follow on Instagram
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-maroon-700 rounded-2xl overflow-hidden">
        <div className="p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Visit Araku Valley</h3>
          <p className="text-warm-200">Experience the source of our products firsthand</p>
        </div>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15252.876285899887!2d82.8746!3d18.3107!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3a5d34d34e0c3d%3A0x7d3b3d3d3d3d3d3d!2sAraku%20Valley%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1234567890"
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
          title="Araku Valley Map"
        ></iframe>
      </div>
    </div>
  );
}

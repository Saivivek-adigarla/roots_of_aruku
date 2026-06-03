import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Truck, DollarSign, Users, Mail, Phone } from 'lucide-react';
import SEO from '../components/SEO';
import ContentPageLayout from '../layouts/ContentPageLayout';
import toast from 'react-hot-toast';

export default function Wholesale() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    quantity: '',
    product: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success('Inquiry received! We will contact you within 24 hours.');
      setFormData({ companyName: '', contactName: '', email: '', phone: '', quantity: '', product: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  const benefits = [
    {
      icon: DollarSign,
      title: 'Bulk Pricing',
      description: 'Special discounts for bulk orders starting from 50kg',
    },
    {
      icon: Truck,
      title: 'Logistics Support',
      description: 'We handle packaging and logistics for large orders',
    },
    {
      icon: Users,
      title: 'Dedicated Support',
      description: 'Assigned account manager for wholesale clients',
    },
    {
      icon: Briefcase,
      title: 'Flexible Terms',
      description: 'Customized payment and delivery terms available',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <ContentPageLayout
      title="Wholesale & Bulk Orders"
      subtitle="Partner with Roots of Araku for your business needs"
      heroImage="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?w=1200"
      heroHeight="md"
      seoProps={{
        title: 'Wholesale - Roots of Araku',
        description: 'Bulk ordering, wholesale pricing, and B2B partnerships for organic products',
        keywords: 'wholesale, bulk orders, B2B, organic products, pricing',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Benefits */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <benefit.icon className="w-12 h-12 text-maroon-700 mb-3" />
              <h3 className="font-bold text-gray-800 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Why Wholesale */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-maroon-50 to-warm-50 rounded-2xl p-8 md:p-12 mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Roots of Araku for Wholesale?</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-gold-400 font-bold">✓</span>
              <span>100% certified organic products directly from Araku Valley tribal farms</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-400 font-bold">✓</span>
              <span>Competitive wholesale pricing with volume discounts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-400 font-bold">✓</span>
              <span>Reliable supply chain with consistent quality standards</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-400 font-bold">✓</span>
              <span>Flexible MOQ (Minimum Order Quantity) options</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold-400 font-bold">✓</span>
              <span>Customized packaging and branding support available</span>
            </li>
          </ul>
        </motion.section>

        {/* Inquiry Form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
        >
          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us your inquiry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Contact Person</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Product</label>
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                >
                  <option>Select product</option>
                  <option>Coffee</option>
                  <option>Honey</option>
                  <option>Millets</option>
                  <option>Spices</option>
                  <option>Dry Fruits</option>
                  <option>Mixed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Quantity (in kg)</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                  placeholder="Desired quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                  placeholder="Tell us more about your needs"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-maroon-700 text-white py-3 rounded-lg font-bold hover:bg-maroon-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-maroon-700 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Email</p>
                    <a href="mailto:wholesale@rootsofaraku.com" className="text-maroon-700 hover:underline">
                      wholesale@rootsofaraku.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-maroon-700 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Phone</p>
                    <a href="tel:+917036252018" className="text-maroon-700 hover:underline">
                      +91 7036252018
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gold-100 to-warm-100 rounded-xl p-6">
              <h3 className="font-bold text-gray-800 mb-3">Bulk Order Benefits</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Wholesale pricing starting at 50kg</li>
                <li>• Free shipping on orders above 200kg</li>
                <li>• Custom branding & packaging options</li>
                <li>• Flexible payment terms for B2B partners</li>
                <li>• Dedicated account manager support</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </ContentPageLayout>
  );
}

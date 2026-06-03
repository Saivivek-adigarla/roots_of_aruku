import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import ContentPageLayout from '../layouts/ContentPageLayout';

const faqCategories = [
  {
    title: 'Orders & Shipping',
    faqs: [
      {
        q: 'How long does delivery take?',
        a: 'We deliver within 2-3 business days across India. Express delivery available for metro cities (1-2 days).',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, we ship to select countries. International orders take 7-14 days and include customs clearance.',
      },
      {
        q: 'What is your shipping cost?',
        a: 'Free shipping on orders above ₹499. Standard shipping below ₹499 is ₹99.',
      },
      {
        q: 'Can I track my order?',
        a: 'Yes, you will receive a tracking link via SMS and email once your order ships.',
      },
    ],
  },
  {
    title: 'Payments',
    faqs: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery.',
      },
      {
        q: 'Is my payment secure?',
        a: 'Yes, all payments are processed through encrypted SSL connections and PCI-compliant gateways.',
      },
      {
        q: 'Can I pay Cash on Delivery?',
        a: 'Yes, COD is available for all orders. No advance payment required.',
      },
      {
        q: 'Do you offer EMI options?',
        a: 'Yes, select cards offer 0% EMI on orders above ₹10,000. Terms apply.',
      },
    ],
  },
  {
    title: 'Products',
    faqs: [
      {
        q: 'Are all products 100% organic?',
        a: 'Yes, all Roots of Araku products are certified organic and chemical-free.',
      },
      {
        q: 'How are products packaged?',
        a: 'Products are packaged in eco-friendly, food-grade materials to maintain freshness and quality.',
      },
      {
        q: 'What is the shelf life?',
        a: 'Shelf life varies by product (6-24 months). Check individual product pages for details.',
      },
      {
        q: 'Do you have bulk order discounts?',
        a: 'Yes, bulk orders above 5kg get special discounts. Contact us at wholesale@rootsofaraku.com',
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    faqs: [
      {
        q: 'What is your return policy?',
        a: 'We offer 7-day returns for unopened products with original packaging and receipt.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'Contact us with your order ID and reason for return. We\'ll arrange pickup at no cost.',
      },
      {
        q: 'How long does refund take?',
        a: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item.',
      },
      {
        q: 'What if I receive a damaged product?',
        a: 'Contact us immediately with photos. We\'ll replace or refund the damaged product.',
      },
    ],
  },
  {
    title: 'About Products',
    faqs: [
      {
        q: 'Is your coffee fair trade?',
        a: 'Yes, we ensure fair prices directly to tribal farmers. No middlemen involved.',
      },
      {
        q: 'How is your honey different?',
        a: 'Our honey is raw, unfiltered, and collected from tribal forests. No processing or additives.',
      },
      {
        q: 'Are millets gluten-free?',
        a: 'Yes, all millets are naturally gluten-free and rich in nutrients.',
      },
      {
        q: 'Do you have organic certification?',
        a: 'Yes, all products carry official organic certifications from recognized agencies.',
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={false}
      className="border border-gray-200 rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-warm-50 transition-colors text-left"
      >
        <span className="font-semibold text-gray-800">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={20} className="text-maroon-700" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-warm-50 border-t border-gray-200"
          >
            <p className="px-6 py-4 text-gray-600 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <ContentPageLayout
      title="Frequently Asked Questions"
      subtitle="Find answers to common questions about our products and services"
      heroHeight="sm"
      seoProps={{
        title: 'FAQ - Roots of Araku',
        description: 'Get answers to your questions about orders, payments, products, and shipping',
      }}
    >
        <div className="max-w-5xl mx-auto px-4 py-16">
          {/* Category Tabs */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap gap-2 mb-12 justify-center"
          >
            {faqCategories.map((cat, i) => (
              <motion.button
                key={i}
                variants={itemVariants}
                onClick={() => setActiveCategory(i)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeCategory === i
                    ? 'bg-maroon-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.title}
              </motion.button>
            ))}
          </motion.div>

          {/* FAQs */}
          <motion.div
            key={activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {faqCategories[activeCategory].faqs.map((faq, i) => (
              <motion.div key={i} variants={itemVariants}>
                <FAQItem q={faq.q} a={faq.a} />
              </motion.div>
            ))}
          </motion.div>

          {/* Still Need Help */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-warm-50 to-warm-100 rounded-2xl p-8 mt-16 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Still Have Questions?</h2>
            <p className="text-gray-600 mb-6">Our team is here to help 24/7</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@rootsofaraku.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-maroon-700 text-white rounded-full font-semibold hover:bg-maroon-800"
              >
                Email Us
              </a>
              <a
                href="https://wa.me/917036252018"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600"
              >
                WhatsApp
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold-400 text-maroon-900 rounded-full font-semibold hover:bg-gold-500"
              >
                Contact Form
              </a>
            </div>
          </motion.section>
        </div>
      </ContentPageLayout>
    );
}

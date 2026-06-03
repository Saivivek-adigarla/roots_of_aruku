import { motion } from 'framer-motion';
import { CheckCircle, Clock, DollarSign } from 'lucide-react';
import ContentPageLayout from '../layouts/ContentPageLayout';

export default function ReturnsPolicy() {
  const steps = [
    { icon: CheckCircle, title: '30-Day Return Window', desc: 'Return items within 30 days of delivery' },
    { icon: Clock, title: 'Processing Time', desc: 'Refunds processed within 5-7 business days' },
    { icon: DollarSign, title: 'Full Refund', desc: 'Get 100% refund on eligible returns' },
  ];

  return (
    <ContentPageLayout
      title="Return & Refund Policy"
      subtitle="Your satisfaction is our priority"
      heroHeight="sm"
    >
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Quick Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-md text-center"
            >
              <step.icon className="w-12 h-12 text-maroon-700 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Detailed Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 md:p-12 space-y-8"
        >
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Return Window</h2>
            <p className="text-gray-600 leading-relaxed">
              We offer a 30-day return period for unopened, undamaged products in original packaging. Returns must be initiated within 30 days of delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Eligible Returns</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Unopened products with intact original packaging</li>
              <li>Products received damaged (with proof via photos)</li>
              <li>Products that don't match the description</li>
              <li>Wrong item received due to our error</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Non-Eligible Returns</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Opened or used products</li>
              <li>Items damaged due to customer mishandling</li>
              <li>Products without original packaging</li>
              <li>Items purchased more than 30 days ago</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Initiate a Return</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-600">
              <li>Email us at returns@rootsofaraku.com with your order number</li>
              <li>Include photos of the product and packaging (if damaged)</li>
              <li>Describe the reason for the return</li>
              <li>We'll provide a prepaid return shipping label</li>
              <li>Ship the item back to us</li>
              <li>Receive full refund within 5-7 business days of receipt</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping Costs</h2>
            <p className="text-gray-600 leading-relaxed">
              We cover return shipping costs for items damaged during delivery or items received that don't match the description. For other returns, customers may be responsible for return shipping.
            </p>
          </section>

          <div className="bg-warm-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Questions?</h3>
            <p className="text-gray-600">
              Contact our support team at{' '}
              <a href="mailto:support@rootsofaraku.com" className="text-maroon-700 font-semibold hover:underline">
                support@rootsofaraku.com
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </ContentPageLayout>
  );
}

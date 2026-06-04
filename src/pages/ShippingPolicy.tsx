import { motion } from 'framer-motion';
import { Truck, Clock } from 'lucide-react';
import ContentPageLayout from '../layouts/ContentPageLayout';

export default function ShippingPolicy() {
  const shippingOptions = [
    {
      icon: Truck,
      name: 'Standard Shipping',
      time: '5-7 Business Days',
      cost: '₹99',
      minOrder: 'All Orders',
    },
    {
      icon: Clock,
      name: 'Express Shipping',
      time: '2-3 Business Days',
      cost: '₹199',
      minOrder: 'Above ₹999',
    },
    {
      icon: Truck,
      name: 'Free Shipping',
      time: '5-7 Business Days',
      cost: 'FREE',
      minOrder: 'Above ₹499',
    },
  ];

  return (
    <ContentPageLayout
      title="Shipping Policy"
      subtitle="Fast, reliable delivery across India"
      heroHeight="sm"
    >
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Shipping Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {shippingOptions.map((option, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <option.icon className="w-12 h-12 text-maroon-700 mb-3" />
              <h3 className="font-bold text-gray-800 mb-2">{option.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Delivery:</span> {option.time}
                </p>
                <p>
                  <span className="font-semibold">Cost:</span> {option.cost}
                </p>
                <p>
                  <span className="font-semibold">Min Order:</span> {option.minOrder}
                </p>
              </div>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping Coverage</h2>
            <p className="text-gray-600 leading-relaxed">
              We ship to all cities and towns across India. Orders are typically dispatched within 1-2 business days of payment confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Processing Time</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Orders placed before 12 PM are dispatched the same day</li>
              <li>Weekend and holiday orders are processed the next business day</li>
              <li>During peak seasons, processing may take 1-2 additional days</li>
              <li>You'll receive tracking information via SMS and email</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tracking Your Order</h2>
            <p className="text-gray-600 leading-relaxed">
              Once your order ships, you'll receive a tracking number via email and SMS. You can track your package in real-time on our website or the carrier's website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping to Remote Areas</h2>
            <p className="text-gray-600 leading-relaxed">
              For remote areas, shipping may take 7-14 business days. Additional charges may apply. Contact us for a custom quote for your location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">International Shipping</h2>
            <p className="text-gray-600 leading-relaxed">
              We currently ship to select international destinations. International orders typically take 14-30 days and may include customs clearance delays.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Damaged or Lost Shipments</h2>
            <p className="text-gray-600 leading-relaxed">
              If your order arrives damaged or gets lost in transit, please contact us within 48 hours with photos. We'll arrange a replacement or refund immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Address Changes</h2>
            <p className="text-gray-600 leading-relaxed">
              Address changes can only be made before the order is dispatched. If your order has already shipped, please provide the new address to our support team for delivery instructions.
            </p>
          </section>

          <div className="bg-warm-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Need Help?</h3>
            <p className="text-gray-600">
              Contact our shipping support team at{' '}
              <a href="mailto:shipping@rootsofaraku.com" className="text-maroon-700 font-semibold hover:underline">
                shipping@rootsofaraku.com
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </ContentPageLayout>
  );
}

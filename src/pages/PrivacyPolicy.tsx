import { motion } from 'framer-motion';
import ContentPageLayout from '../layouts/ContentPageLayout';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: 'Information We Collect',
      content: 'We collect information you provide directly (name, email, address) and information automatically (cookies, IP address, browsing data).',
    },
    {
      title: 'How We Use Your Information',
      content: 'Your information is used to process orders, send communications, improve our services, and comply with legal obligations.',
    },
    {
      title: 'Data Security',
      content: 'We implement industry-standard security measures to protect your personal data. All payment information is encrypted.',
    },
    {
      title: 'Third-Party Sharing',
      content: 'We never sell your personal data. We may share information with payment processors and delivery partners as needed.',
    },
    {
      title: 'Your Rights',
      content: 'You have the right to access, correct, or delete your personal data. Contact us at privacy@rootsofaraku.com.',
    },
  ];

  return (
    <ContentPageLayout
      title="Privacy Policy"
      subtitle="How we protect your personal information"
      heroHeight="sm"
    >
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8 md:p-12 space-y-8"
        >
          <p className="text-gray-600 leading-relaxed">
            Last updated: December 2024. At Roots of Araku, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
          </p>

          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="border-l-4 border-gold-400 pl-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed">{section.content}</p>
            </motion.div>
          ))}

          <div className="bg-warm-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Contact Us</h3>
            <p className="text-gray-600">
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@rootsofaraku.com" className="text-maroon-700 font-semibold hover:underline">
                privacy@rootsofaraku.com
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </ContentPageLayout>
  );
}

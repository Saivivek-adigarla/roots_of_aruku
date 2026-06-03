import { motion } from 'framer-motion';
import ContentPageLayout from '../layouts/ContentPageLayout';

export default function TermsAndConditions() {
  const sections = [
    {
      title: 'Agreement to Terms',
      content: 'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.',
    },
    {
      title: 'Use License',
      content: 'Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only.',
    },
    {
      title: 'Disclaimer',
      content: 'The materials on our website are provided on an "as is" basis. We make no warranties regarding the completeness or accuracy of the information.',
    },
    {
      title: 'Limitations of Liability',
      content: 'In no event shall Roots of Araku or our suppliers be liable for any damages arising out of your use or inability to use the website.',
    },
    {
      title: 'Accuracy of Materials',
      content: 'The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant accuracy.',
    },
    {
      title: 'Links',
      content: 'We have not reviewed all of the sites linked to from our website and are not responsible for the contents of any such linked site.',
    },
    {
      title: 'Modifications',
      content: 'We may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the current version.',
    },
  ];

  return (
    <ContentPageLayout
      title="Terms & Conditions"
      subtitle="Please read these terms carefully"
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
            Last updated: December 2024. These terms and conditions outline the rules and regulations for the use of Roots of Araku's website.
          </p>

          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="border-l-4 border-maroon-700 pl-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed">{section.content}</p>
            </motion.div>
          ))}

          <div className="bg-warm-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Questions?</h3>
            <p className="text-gray-600">
              For any questions about these Terms and Conditions, please contact us at{' '}
              <a href="mailto:legal@rootsofaraku.com" className="text-maroon-700 font-semibold hover:underline">
                legal@rootsofaraku.com
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </ContentPageLayout>
  );
}

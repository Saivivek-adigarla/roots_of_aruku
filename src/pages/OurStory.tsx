import { motion } from 'framer-motion';
import { Leaf, MapPin, Users, Heart, TrendingUp, Award } from 'lucide-react';
import ContentPageLayout from '../layouts/ContentPageLayout';

const timeline = [
  { year: '1800s', title: 'Tribal Farming Begins', description: 'Tribal communities in Araku Valley start organic farming practices passed down through generations' },
  { year: '1950s', title: 'Independence Era', description: 'Post-independence, farming becomes integral to tribal identity and income' },
  { year: '2000s', title: 'Organic Certification', description: 'First organic certifications for Araku Valley coffee and honey' },
  { year: '2020', title: 'Roots of Araku', description: 'Founded to bring authentic tribal organic products directly to consumers' },
  { year: '2023', title: 'Global Recognition', description: 'Expanded to international markets while maintaining organic and fair-trade practices' },
  { year: '2024', title: 'Expanding Impact', description: 'Supporting 500+ tribal farmers with sustainable livelihoods' },
];

const farmers = [
  {
    name: 'Rama Nayak',
    specialty: 'Coffee',
    story: 'Growing organic coffee for 30 years, preserving traditional farming methods',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=400',
  },
  {
    name: 'Karthik Patro',
    specialty: 'Honey',
    story: 'Wild honey collection from tribal forests, pure and unfiltered since childhood',
    image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?w=400',
  },
  {
    name: 'Savitri Devi',
    specialty: 'Millets',
    story: 'Ancient millet farming preserving tribal agricultural heritage for future generations',
    image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?w=400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function OurStory() {
  return (
    <ContentPageLayout
      title="Our Story"
      subtitle="From Araku Valley to Your Table"
      heroImage="https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?w=1200"
      seoProps={{
        title: 'Our Story - Roots of Araku',
        description: 'Discover the heritage of Araku Valley and our commitment to tribal farmers',
        keywords: 'Araku Valley, tribal farmers, organic farming',
      }}
    >
        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Mission & Vision */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We believe in fair trade, sustainable farming, and the power of organic products. Roots of Araku connects tribal farmers in the Eastern Ghats directly to conscious consumers worldwide.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Every purchase supports fair prices for farmers, preserves tribal heritage, and promotes environmental sustainability.
              </p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-gold-400/20 to-maroon-700/20 rounded-3xl blur-3xl" />
              <img
                src="https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?w=600"
                alt="Araku Valley"
                className="relative rounded-2xl shadow-xl h-96 object-cover"
              />
            </motion.div>
          </motion.section>

          {/* Araku Valley */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-gradient-to-r from-warm-50 to-warm-100 rounded-3xl p-12 mb-20"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: MapPin,
                  title: 'The Location',
                  text: 'Nestled in the Eastern Ghats of Andhra Pradesh, Araku Valley is a pristine region blessed with rich soil and tribal heritage',
                },
                {
                  icon: Users,
                  title: 'The People',
                  text: 'Tribal communities have cultivated organic products for generations using traditional, sustainable methods',
                },
                {
                  icon: Leaf,
                  title: 'The Practices',
                  text: 'No chemical pesticides, no synthetic fertilizers, just pure organic farming that respects nature',
                },
              ].map((item, i) => (
                <motion.div key={i} variants={itemVariants} className="text-center">
                  <item.icon className="w-12 h-12 mx-auto text-maroon-700 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Timeline */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Our Journey</h2>
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="flex gap-6 items-start"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gold-400 text-maroon-900 font-bold">
                      {item.year.split('')[0]}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gold-400 font-semibold text-sm">{item.year}</p>
                    <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                    <p className="text-gray-600 mt-1">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Farmer Profiles */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Meet Our Farmers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {farmers.map((farmer, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <img src={farmer.image} alt={farmer.name} className="w-full h-64 object-cover" />
                  <div className="p-6">
                    <p className="text-gold-400 font-semibold text-sm mb-2">{farmer.specialty}</p>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{farmer.name}</h3>
                    <p className="text-gray-600">{farmer.story}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Values */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Leaf,
                  title: 'Sustainability',
                  description: 'We protect forests and biodiversity through responsible farming',
                },
                {
                  icon: Heart,
                  title: 'Fair Trade',
                  description: 'Every farmer receives fair compensation for their honest work',
                },
                {
                  icon: Users,
                  title: 'Community',
                  description: 'Supporting tribal communities and preserving cultural heritage',
                },
                {
                  icon: Award,
                  title: 'Quality',
                  description: '100% organic, chemical-free, and authentically produced',
                },
                {
                  icon: TrendingUp,
                  title: 'Growth',
                  description: 'Helping farmers improve livelihoods and adopt better practices',
                },
                {
                  icon: Leaf,
                  title: 'Transparency',
                  description: 'Complete traceability from farm to your table',
                },
              ].map((value, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-gradient-to-br from-warm-50 to-warm-100 rounded-xl p-6"
                >
                  <value.icon className="w-10 h-10 text-maroon-700 mb-3" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-maroon-700 to-maroon-900 rounded-3xl p-12 text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Be Part of the Change</h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Every purchase supports tribal farmers, preserves ancestral traditions, and promotes sustainable farming
            </p>
            <a
              href="/products"
              className="inline-flex items-center gap-2 bg-gold-400 text-maroon-900 px-8 py-3 rounded-full font-bold hover:bg-gold-500 transition-colors"
            >
              Shop Now
            </a>
          </motion.section>
        </div>
      </ContentPageLayout>
    );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Search, ChevronRight } from 'lucide-react';
import ContentPageLayout from '../layouts/ContentPageLayout';

const blogPosts = [
  {
    id: '1',
    slug: 'benefits-of-organic-coffee',
    title: '10 Health Benefits of Organic Coffee from Araku Valley',
    excerpt: 'Discover how organic coffee can boost your health and energy naturally',
    category: 'Health Tips',
    author: 'Dr. Priya Sharma',
    date: '2024-12-01',
    image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=600',
    readTime: 5,
  },
  {
    id: '2',
    slug: 'honey-face-mask-recipe',
    title: 'DIY Honey Face Mask: Natural Skincare with Araku Honey',
    excerpt: 'Learn how to create an effective face mask using raw, organic honey',
    category: 'Recipes',
    author: 'Anjali Patel',
    date: '2024-11-28',
    image: 'https://images.pexels.com/photos/3944619/pexels-photo-3944619.jpeg?w=600',
    readTime: 4,
  },
  {
    id: '3',
    slug: 'tribal-farming-practices',
    title: 'Ancient Tribal Farming: Lessons for Modern Sustainable Agriculture',
    excerpt: 'Explore how tribal communities have practiced sustainable farming for centuries',
    category: 'Tribal Culture',
    author: 'Rahul Verma',
    date: '2024-11-25',
    image: 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?w=600',
    readTime: 8,
  },
  {
    id: '4',
    slug: 'millet-recipes-gluten-free',
    title: 'Top 5 Gluten-Free Millet Recipes for Healthy Eating',
    excerpt: 'Delicious and nutritious recipes using organic millets from Araku Valley',
    category: 'Recipes',
    author: 'Chef Ravi Kumar',
    date: '2024-11-20',
    image: 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?w=600',
    readTime: 6,
  },
  {
    id: '5',
    slug: 'organic-living-guide',
    title: 'Your Complete Guide to Organic Living in 2024',
    excerpt: 'Tips and tricks for transitioning to a fully organic lifestyle',
    category: 'Health Tips',
    author: 'Wellness Expert',
    date: '2024-11-15',
    image: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?w=600',
    readTime: 7,
  },
  {
    id: '6',
    slug: 'fair-trade-coffee-impact',
    title: 'Fair Trade Coffee: How Your Purchase Supports Tribal Farmers',
    excerpt: 'Understand the positive impact of choosing fair trade organic products',
    category: 'Tribal Culture',
    author: 'Impact Officer',
    date: '2024-11-10',
    image: 'https://images.pexels.com/photos/733745/pexels-photo-733745.jpeg?w=600',
    readTime: 5,
  },
];

const categories = ['All', 'Health Tips', 'Recipes', 'Tribal Culture'];

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

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState(blogPosts);

  useEffect(() => {
    let filtered = blogPosts;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  }, [selectedCategory, searchQuery]);

  return (
    <ContentPageLayout
      title="Blog"
      subtitle="Tips, recipes, and stories from the Roots of Araku community"
      heroImage="https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?w=1200"
      heroHeight="md"
      seoProps={{
        title: 'Blog - Roots of Araku',
        description: 'Health tips, recipes, and tribal culture stories from our organic farming community',
        keywords: 'organic health, recipes, tribal culture, sustainable living',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Search & Filters */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-maroon-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <motion.article
                key={post.id}
                variants={itemVariants}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
              >
                <Link to={`/blog/${post.slug}`}>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-4 right-4 bg-gold-400 text-maroon-900 px-3 py-1 rounded-full text-xs font-semibold">
                      {post.category}
                    </span>
                  </div>
                </Link>

                <div className="p-6">
                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-maroon-700 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{post.readTime} min read</span>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-maroon-700 font-semibold group-hover:gap-2 transition-all"
                    >
                      Read More <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))
          ) : (
            <motion.div variants={itemVariants} className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No articles found. Try adjusting your filters.</p>
            </motion.div>
          )}
        </motion.div>

        {/* Newsletter CTA */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-maroon-700 to-maroon-900 rounded-2xl p-8 text-center text-white"
        >
          <h2 className="text-2xl font-bold mb-3">Stay Updated</h2>
          <p className="text-white/80 mb-6">Subscribe to get the latest articles delivered to your inbox</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 outline-none"
            />
            <button className="bg-gold-400 text-maroon-900 px-6 py-3 rounded-lg font-bold hover:bg-gold-500 transition-colors">
              Subscribe
            </button>
          </div>
        </motion.section>
      </div>
    </ContentPageLayout>
  );
}

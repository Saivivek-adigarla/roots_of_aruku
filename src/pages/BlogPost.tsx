import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, Share2, Heart, MessageCircle } from 'lucide-react';
import ContentPageLayout from '../layouts/ContentPageLayout';

const blogPostsData: Record<string, { title: string; author: string; date: string; readTime: string; content: string; image: string }> = {
  'benefits-of-organic-coffee': {
    title: '10 Health Benefits of Organic Coffee from Araku Valley',
    author: 'Dr. Priya Sharma',
    date: '2024-12-01',
    image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=1200',
    category: 'Health Tips',
    readTime: 5,
    content: `
      <p>Organic coffee from Araku Valley isn't just delicious—it's also packed with health benefits that can transform your daily routine. Unlike conventionally grown coffee, our organic beans are free from pesticides and synthetic chemicals, ensuring you get pure, natural coffee at its best.</p>

      <h3>1. Rich in Antioxidants</h3>
      <p>Organic coffee contains powerful antioxidants like chlorogenic acid that help fight free radicals and reduce oxidative stress in your body. This can slow down aging and reduce the risk of chronic diseases.</p>

      <h3>2. Boosts Metabolism</h3>
      <p>The natural caffeine in our Araku coffee naturally increases metabolic rate, helping your body burn more calories and manage weight effectively.</p>

      <h3>3. Improves Mental Clarity</h3>
      <p>Experience enhanced focus and concentration with every cup. The caffeine and other compounds in coffee improve cognitive function and memory retention.</p>

      <h3>4. Supports Heart Health</h3>
      <p>Moderate consumption of organic coffee has been linked to improved cardiovascular health, better blood flow, and reduced risk of heart disease.</p>

      <h3>5. Promotes Liver Health</h3>
      <p>Studies show that coffee drinkers have healthier livers with reduced risk of cirrhosis and liver disease. Our organic coffee provides maximum benefits without harmful additives.</p>

      <h3>6. Aids Digestion</h3>
      <p>Coffee stimulates the digestive system and increases stomach acid production, helping your body digest food more efficiently.</p>

      <h3>7. Reduces Risk of Type 2 Diabetes</h3>
      <p>Regular consumption of organic coffee has been associated with lower risk of developing type 2 diabetes due to its effect on insulin sensitivity.</p>

      <h3>8. Supports Brain Health</h3>
      <p>The compounds in coffee protect against neurodegenerative diseases like Alzheimer's and Parkinson's, keeping your brain young and healthy.</p>

      <h3>9. Mood Enhancement</h3>
      <p>Coffee releases dopamine and serotonin, naturally improving mood and reducing symptoms of depression.</p>

      <h3>10. Sustainable and Ethical</h3>
      <p>By choosing Roots of Araku organic coffee, you're supporting tribal farmers and sustainable farming practices that are good for both your health and the planet.</p>

      <p>Start your day right with Araku's premium organic coffee and experience these amazing benefits today!</p>
    `,
  },
  'honey-face-mask-recipe': {
    title: 'DIY Honey Face Mask: Natural Skincare with Araku Honey',
    author: 'Anjali Patel',
    date: '2024-11-28',
    image: 'https://images.pexels.com/photos/3944619/pexels-photo-3944619.jpeg?w=1200',
    category: 'Recipes',
    readTime: 4,
    content: `
      <p>Raw, unfiltered honey from Araku Valley is nature's best-kept secret for beautiful, glowing skin. This DIY face mask is simple, natural, and incredibly effective.</p>

      <h3>Why Honey is Perfect for Skincare</h3>
      <p>Honey is a natural humectant that locks in moisture, has antibacterial properties that fight acne, and contains enzymes that gently exfoliate dead skin cells.</p>

      <h3>Simple Honey Face Mask Recipe</h3>
      <h4>Ingredients:</h4>
      <ul>
        <li>2-3 tablespoons of raw Araku honey</li>
        <li>1 tablespoon of fresh lemon juice</li>
        <li>Optional: 1/4 teaspoon of turmeric powder</li>
      </ul>

      <h4>Instructions:</h4>
      <ol>
        <li>Mix honey with lemon juice in a clean bowl</li>
        <li>Add turmeric if desired (great for brightening)</li>
        <li>Apply evenly to clean face, avoiding eyes</li>
        <li>Leave on for 15-20 minutes</li>
        <li>Rinse with warm water and pat dry</li>
      </ol>

      <h3>Advanced Recipe: Honey + Oatmeal Mask</h3>
      <p>For sensitive or acne-prone skin, combine raw honey with finely ground oatmeal for gentle exfoliation without irritation.</p>

      <h3>Usage Tips</h3>
      <ul>
        <li>Use 1-2 times per week for best results</li>
        <li>Do a patch test first if you have very sensitive skin</li>
        <li>Always use raw, unfiltered honey for maximum benefits</li>
      </ul>

      <p>Experience the transformation with 100% natural skincare from Roots of Araku!</p>
    `,
  },
  'tribal-farming-practices': {
    title: 'Ancient Tribal Farming: Lessons for Modern Sustainable Agriculture',
    author: 'Rahul Verma',
    date: '2024-11-25',
    image: 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?w=1200',
    category: 'Tribal Culture',
    readTime: 8,
    content: `
      <p>For centuries, the tribal communities of Araku Valley have mastered the art of sustainable farming without modern technology or synthetic chemicals. Their wisdom offers valuable lessons for today's agriculture industry.</p>

      <h3>The Foundation: Understanding Local Ecosystems</h3>
      <p>Tribal farmers have an intimate knowledge of their local environment, understanding soil composition, weather patterns, and biodiversity. This deep connection guides all farming decisions.</p>

      <h3>Crop Rotation: Nature's Way</h3>
      <p>Rather than monoculture, tribal farmers practice crop rotation, planting different crops in succession to maintain soil fertility and prevent pest accumulation.</p>

      <h3>Organic Pest Management</h3>
      <p>Instead of chemical pesticides, tribal farmers use natural methods like companion planting, beneficial insects, and plant-based repellents.</p>

      <h3>Water Conservation</h3>
      <p>Traditional water harvesting techniques, terrace farming, and mulching practices minimize water waste and maintain soil moisture naturally.</p>

      <h3>The Role of Biodiversity</h3>
      <p>Tribal farms maintain diverse ecosystems where multiple crops and plants coexist, creating natural checks and balances that modern farms lack.</p>

      <h3>Lessons for Modern Agriculture</h3>
      <ul>
        <li>Sustainability beats short-term profit</li>
        <li>Working with nature is more efficient than fighting it</li>
        <li>Biodiversity is key to ecosystem health</li>
        <li>Local knowledge is invaluable</li>
        <li>Organic methods are not only possible but superior</li>
      </ul>

      <p>At Roots of Araku, we honor these ancient practices while bringing premium organic products to the modern world.</p>
    `,
  },
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogPostsData[slug] : null;

  if (!post) {
    return (
      <ContentPageLayout
        title="Post Not Found"
        heroHeight="sm"
        seoProps={{
          title: 'Blog Post - Roots of Araku',
          description: 'Read our latest articles on organic living, recipes, and tribal culture',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">This blog post could not be found.</p>
        </div>
      </ContentPageLayout>
    );
  }

  return (
    <ContentPageLayout
      title={post.title}
      heroImage={post.image}
      heroHeight="lg"
      seoProps={{
        title: `${post.title} - Roots of Araku`,
        description: post.excerpt || post.title,
        keywords: `${post.category}, organic, farming, tribal`,
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8 md:p-12"
        >
          {/* Meta Information */}
          <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2 text-gray-600">
              <User size={18} />
              <span className="text-sm font-medium">{post.author}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={18} />
              <span className="text-sm font-medium">{new Date(post.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={18} />
              <span className="text-sm font-medium">{post.readTime} min read</span>
            </div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share & Engagement */}
          <div className="flex flex-wrap gap-4 pt-8 border-t">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors">
              <Share2 size={18} /> Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 font-medium transition-colors">
              <Heart size={18} /> Like
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors">
              <MessageCircle size={18} /> Comment
            </button>
          </div>
        </motion.div>

        {/* Related Posts CTA */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Read More Articles</h2>
          <a
            href="/blog"
            className="inline-flex items-center gap-2 bg-maroon-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-maroon-800 transition-colors"
          >
            Back to Blog
          </a>
        </motion.section>
      </div>
    </ContentPageLayout>
  );
}

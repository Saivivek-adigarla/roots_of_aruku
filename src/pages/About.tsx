import { Link } from 'react-router-dom';
import { Mountain, Users, Leaf, Heart, Award, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Story</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          From the mist-covered hills of Araku Valley comes a story of sustainable farming, tribal heritage, and nature's finest gifts.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <img src="https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?w=800" alt="Araku Valley" className="rounded-2xl shadow-xl w-full h-80 object-cover" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-maroon-700 mb-4">The Heartland of Araku</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Nestled in the Eastern Ghats of Andhra Pradesh, Araku Valley is known for its lush coffee plantations, aromatic spices, and rich tribal culture. At an elevation of 900-1200 meters, the valley provides the perfect micro-climate for cultivating some of India's finest organic produce.
          </p>
          <p className="text-gray-600 leading-relaxed">
            The indigenous tribal communities of this region have been farming these lands for generations, using sustainable methods passed down through centuries. Their deep connection with nature ensures that every product is grown with care and harvested at peak quality.
          </p>
        </div>
      </section>

      <section className="bg-maroon-700 rounded-2xl p-8 md:p-12 text-white mb-16">
        <div className="text-center max-w-2xl mx-auto">
          <Leaf className="w-12 h-12 mx-auto mb-4 text-gold-400" />
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-warm-200 leading-relaxed">
            "To connect tribal farmers directly with conscious consumers, ensuring fair trade, sustainable practices, and the purest organic products from Araku Valley reach your home."
          </p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Why Choose Us</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Mountain, title: 'Single Origin', desc: 'Direct from Araku Valley farms' },
            { icon: Users, title: 'Tribal Sourced', desc: 'Supporting indigenous communities' },
            { icon: Award, title: '100% Organic', desc: 'No chemicals or pesticides' },
            { icon: Heart, title: 'Fair Trade', desc: 'Transparent and ethical pricing' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-maroon-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-maroon-700" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Products</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <img src="https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?w=500" alt="Coffee" className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Premium Coffee</h3>
              <p className="text-gray-600">Shade-grown Arabica coffee from the lush plantations, hand-picked and sun-dried for the perfect cup.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <img src="https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg?w=500" alt="Turmeric" className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Wild Turmeric</h3>
              <p className="text-gray-600">Forest-harvested turmeric with natural curcumin, known for its medicinal and culinary properties.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <img src="https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?w=500" alt="Honey" className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Golden Honey</h3>
              <p className="text-gray-600">Raw, unfiltered honey from wild beehives in the untouched forests of Eastern Ghats.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="text-center mb-16">
        <img src="https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?w=800" alt="Tribal Farmers" className="w-full max-w-3xl mx-auto rounded-2xl shadow-xl mb-8 h-72 object-cover" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Supporting Tribal Communities</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Every purchase directly benefits the tribal farmers of Araku Valley. We ensure fair prices, sustainable farming practices, and community development through education and healthcare initiatives.
        </p>
      </section>

      <div className="text-center">
        <Link to="/products" className="inline-flex items-center gap-2 bg-maroon-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-maroon-800 transition">
          Explore Our Products <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

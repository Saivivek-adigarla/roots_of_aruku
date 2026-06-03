import { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import SEO from '../components/SEO';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  image?: string;
}

interface ContentPageLayoutProps {
  title: string;
  subtitle?: string;
  heroImage?: string;
  heroVideo?: string;
  heroHeight?: 'sm' | 'md' | 'lg' | 'full';
  seoProps?: SEOProps;
  children: ReactNode;
}

export default function ContentPageLayout({
  title,
  subtitle,
  heroImage,
  heroVideo,
  heroHeight = 'lg',
  seoProps,
  children,
}: ContentPageLayoutProps) {
  const heightClass = {
    sm: 'h-48',
    md: 'h-96',
    lg: 'h-[32rem]',
    full: 'h-screen',
  }[heroHeight];

  return (
    <>
      {seoProps && <SEO {...seoProps} />}

      <Navbar />

      {(heroImage || heroVideo) && (
        <div className={`relative overflow-hidden ${heightClass} bg-warm-50`}>
          {heroVideo && (
            <>
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={heroVideo} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/30" />
            </>
          )}
          {heroImage && !heroVideo && (
            <>
              <img src={heroImage} alt={title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
            </>
          )}

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">{title}</h1>
            {subtitle && <p className="text-xl md:text-2xl text-white/80 max-w-2xl">{subtitle}</p>}
          </div>
        </div>
      )}

      <main className="min-h-screen bg-warm-50">
        {children}
      </main>

      <Footer />
      <ChatWidget />
    </>
  );
}

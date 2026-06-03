import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  image?: string;
}

export function useSEO(props: SEOProps) {
  useEffect(() => {
    document.title = props.title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', props.description);

    if (props.keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', props.keywords);
    }

    if (props.canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', props.canonical);
    }

    if (props.image) {
      let metaOG = document.querySelector('meta[property="og:image"]');
      if (!metaOG) {
        metaOG = document.createElement('meta');
        metaOG.setAttribute('property', 'og:image');
        document.head.appendChild(metaOG);
      }
      metaOG.setAttribute('content', props.image);
    }
  }, [props]);
}

export default function SEO({ title, description, keywords }: SEOProps) {
  useSEO({ title, description, keywords });
  return null;
}

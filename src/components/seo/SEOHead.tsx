import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  locale?: string;
  alternateLocales?: Array<{ code: string; href: string }>;
  schemas?: object[];
}

export const SEOHead: React.FC<SEOProps> = ({
  title = 'ChatSuite AI - Professional AI Chatbot & Customer Automation Platform',
  description = 'Transform your website conversion rates with ChatSuite AI. Deploy white-labeled virtual assistants, automated lead capture forms, and RAG knowledge bases in seconds.',
  canonicalUrl = 'https://chatsuite.ai',
  ogType = 'website',
  ogImage = 'https://chatsuite.ai/og-image.png',
  twitterCard = 'summary_large_image',
  locale = 'en_US',
  alternateLocales = [
    { code: 'en', href: 'https://chatsuite.ai' },
    { code: 'es', href: 'https://chatsuite.ai/es' },
    { code: 'fr', href: 'https://chatsuite.ai/fr' },
    { code: 'de', href: 'https://chatsuite.ai/de' },
    { code: 'ja', href: 'https://chatsuite.ai/ja' }
  ],
  schemas = []
}) => {
  useEffect(() => {
    // Dynamic document title
    document.title = title;

    // Helper to update or inject meta tag
    const setMetaTag = (selector: string, attrName: string, attrVal: string, contentVal: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentVal);
    };

    // Standard SEO Meta
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', 'AI Chatbot, Customer Support Automation, Lead Generation, SaaS, RAG Knowledge Base, White Label AI, ChatSuite');
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'ChatSuite AI');
    setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', locale);

    // Twitter / X Cards
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', twitterCard);
    setMetaTag('meta[name="twitter:site"]', 'name', 'twitter:site', '@ChatSuiteAI');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

    // hreflang alternate tags for International SEO
    // Remove old alternates first
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    alternateLocales.forEach(({ code, href }) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', code);
      link.setAttribute('href', href);
      document.head.appendChild(link);
    });

    // Default x-default hreflang
    const xDefault = document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.setAttribute('href', canonicalUrl);
    document.head.appendChild(xDefault);

    // Inject Schema.org JSON-LD structured data
    // Remove previous injected schemas
    document.querySelectorAll('script[data-schema-type="chatsuite-seo"]').forEach(el => el.remove());

    const defaultSchemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ChatSuite AI',
        url: 'https://chatsuite.ai',
        logo: 'https://chatsuite.ai/logo.png',
        sameAs: [
          'https://twitter.com/ChatSuiteAI',
          'https://linkedin.com/company/chatsuite-ai',
          'https://github.com/chatsuite-ai'
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-800-555-CHAT',
          contactType: 'customer support',
          availableLanguage: ['English', 'Spanish', 'French', 'German', 'Japanese']
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'ChatSuite AI',
        operatingSystem: 'All',
        applicationCategory: 'BusinessApplication',
        offers: {
          '@type': 'Offer',
          price: '29.00',
          priceCurrency: 'USD'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '1280'
        }
      }
    ];

    const allSchemas = [...defaultSchemas, ...schemas];

    allSchemas.forEach((s, idx) => {
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-schema-type', 'chatsuite-seo');
      script.textContent = JSON.stringify(s);
      document.head.appendChild(script);
    });

  }, [title, description, canonicalUrl, ogType, ogImage, twitterCard, locale, JSON.stringify(schemas)]);

  return null;
};

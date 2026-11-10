import React, { useState, useEffect } from 'react';
import {
  BookOpen, Search, Tag, Calendar, Clock, User, ArrowLeft, Share2,
  Sparkles, ChevronRight, MessageSquare, ArrowRight, CheckCircle2, Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SEOHead } from '../seo/SEOHead';
import { SocialShareButtons } from '../seo/SocialShareButtons';
import { NewsletterSignup } from '../leadgen/NewsletterSignup';
import { trackGrowthEvent } from '../seo/AnalyticsScript';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readTimeMinutes: number;
  featuredImage: string;
  featured?: boolean;
}

export const BlogView: React.FC = () => {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('post');
    }
    return null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [postsList, setPostsList] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch blog posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/blog/posts');
        if (res.ok) {
          const data = await res.json();
          setPostsList(data.posts || []);
        }
      } catch (err) {
        console.error('Error fetching blog posts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const categories = ['All', 'AI Strategy', 'Growth Marketing', 'Customer Support', 'Engineering', 'Case Studies'];

  const filteredPosts = postsList.filter((post) => {
    const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const activePost = postsList.find((p) => p.slug === selectedSlug);

  const handleSelectPost = (slug: string) => {
    setSelectedSlug(slug);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('post', slug);
      window.history.pushState({}, '', url.toString());
    }
    trackGrowthEvent('blog_article_viewed', { slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedSlug(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('post');
      window.history.pushState({}, '', url.toString());
    }
  };

  if (activePost) {
    const relatedPosts = postsList
      .filter((p) => p.slug !== activePost.slug && (p.category === activePost.category || p.tags.some(t => activePost.tags.includes(t))))
      .slice(0, 3);

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <SEOHead
          title={`${activePost.title} | ChatSuite AI Blog`}
          description={activePost.excerpt}
          canonicalUrl={`https://chatsuite.ai/blog/${activePost.slug}`}
          ogType="article"
          schemas={[
            {
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: activePost.title,
              description: activePost.excerpt,
              datePublished: activePost.publishedAt,
              author: {
                '@type': 'Person',
                name: activePost.author.name
              },
              publisher: {
                '@type': 'Organization',
                name: 'ChatSuite AI',
                logo: 'https://chatsuite.ai/logo.png'
              }
            }
          ]}
        />

        {/* Navigation Back */}
        <button
          onClick={handleBackToList}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Blog Articles
        </button>

        {/* Article Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase">
              {activePost.category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <Clock size={12} /> {activePost.readTimeMinutes} min read
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            {activePost.title}
          </h1>

          {/* Author info */}
          <div className="flex items-center justify-between border-y border-slate-100 dark:border-slate-800 py-4">
            <div className="flex items-center gap-3">
              <img
                src={activePost.author.avatar}
                alt={activePost.author.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{activePost.author.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{activePost.author.role} • {new Date(activePost.publishedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <SocialShareButtons
              compact
              title={activePost.title}
              summary={activePost.excerpt}
              url={`https://chatsuite.ai/blog/${activePost.slug}`}
            />
          </div>
        </div>

        {/* Featured Image */}
        <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg max-h-96">
          <img
            src={activePost.featuredImage}
            alt={activePost.title}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Body Content */}
        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-4">
          {activePost.content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={idx} className="font-display text-xl font-bold text-slate-900 dark:text-white pt-4 pb-1">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            return <p key={idx}>{paragraph}</p>;
          })}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Tag size={14} className="text-slate-400" />
          <div className="flex flex-wrap gap-1.5">
            {activePost.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Share Section */}
        <SocialShareButtons
          title={activePost.title}
          summary={activePost.excerpt}
          url={`https://chatsuite.ai/blog/${activePost.slug}`}
        />

        {/* Newsletter In-Feed Lead Capture */}
        <NewsletterSignup />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Related Industry Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => handleSelectPost(rel.slug)}
                  className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-blue-500 transition-all space-y-2"
                >
                  <span className="text-[9px] font-mono font-bold text-blue-500">{rel.category}</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">{rel.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{rel.readTimeMinutes} min read</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Articles List Overview View
  const featuredPost = postsList.find((p) => p.featured) || postsList[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <SEOHead
        title="AI Strategy, Automation & SEO Engineering Blog | ChatSuite AI"
        description="Insights, prompt engineering frameworks, and customer conversion case studies from ChatSuite AI strategy leaders."
        canonicalUrl="https://chatsuite.ai/blog"
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <BookOpen size={13} /> ChatSuite AI Knowledge Hub
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
          AI Engineering, Conversion Strategy & Automation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Actionable tactics, RAG architecture teardowns, and lead generation frameworks for modern digital businesses.
        </p>
      </div>

      {/* Featured Article Highlight */}
      {featuredPost && (
        <div
          onClick={() => handleSelectPost(featuredPost.slug)}
          className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl cursor-pointer hover:border-blue-500 transition-all relative overflow-hidden group"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider inline-flex items-center gap-1">
                <Sparkles size={11} /> Featured Read
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 font-mono">
                <span>By {featuredPost.author.name}</span>
                <span>•</span>
                <span>{featuredPost.readTimeMinutes} min read</span>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-700/80 max-h-64">
              <img
                src={featuredPost.featuredImage}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles & topics..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => handleSelectPost(post.slug)}
            className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="h-44 overflow-hidden border-b border-slate-100 dark:border-slate-800">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="font-bold text-blue-500 uppercase">{post.category}</span>
                  <span>{post.readTimeMinutes} min read</span>
                </div>

                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors leading-snug">
                  {post.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-300">{post.author.name}</span>
                <span className="text-blue-500 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Read Article <ChevronRight size={12} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter Signup Banner */}
      <NewsletterSignup />
    </div>
  );
};

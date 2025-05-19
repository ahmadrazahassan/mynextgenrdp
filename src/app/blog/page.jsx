'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, ArrowLongRightIcon, BookmarkIcon, ChevronRightIcon, StarIcon, ClockIcon, CalendarDaysIcon, TagIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { FireIcon } from '@heroicons/react/24/solid';
import { ChartBarIcon as TrendingUpIcon } from '@heroicons/react/24/solid';

// Add structured data for blog list page
const blogListSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "headline": "Windows Hosting Insights: RDP & VPS Tips",
  "description": "Expert tutorials, guides, and tips about Windows RDP and VPS hosting, server optimization, and cybersecurity.",
  "url": "https://nextgenrdp.com/blog",
  "publisher": {
    "@type": "Organization",
    "name": "NextGen RDP",
    "logo": {
      "@type": "ImageObject",
      "url": "https://nextgenrdp.com/images/logo.png"
    }
  }
};

const blogPosts = [
  {
    id: 'windows-rdp-vs-vps',
    title: 'Windows RDP vs VPS: Which is Right for Your Business?',
    excerpt: 'Compare the benefits and limitations of Windows Remote Desktop Protocol (RDP) and Virtual Private Servers (VPS) to determine the best solution for your needs.',
    category: 'Hosting Solutions',
    date: 'June 15, 2023',
    image: '/images/blog/rdp-vs-vps.jpg',
    author: 'Ahmed Khan',
    readTime: '7 min read',
    slug: '/blog/windows-rdp-vs-vps',
    featured: true,
    tags: ['RDP', 'VPS', 'Business', 'Comparison']
  },
  {
    id: 'optimize-windows-server',
    title: '10 Ways to Optimize Your Windows Server Performance',
    excerpt: 'Learn practical techniques to boost your Windows Server performance, reduce latency, and maximize resource efficiency in your hosting environment.',
    category: 'Performance',
    date: 'July 22, 2023',
    image: '/images/blog/optimize-server.jpg',
    author: 'Sarah Ahmed',
    readTime: '9 min read',
    slug: '/blog/optimize-windows-server',
    featured: true,
    tags: ['Windows Server', 'Performance', 'Optimization', 'Hosting']
  },
  {
    id: 'secure-rdp',
    title: 'Essential Security Practices for Windows RDP',
    excerpt: 'Protect your remote desktop environment with these critical security measures that prevent unauthorized access and data breaches.',
    category: 'Security',
    date: 'August 5, 2023',
    image: '/images/blog/secure-rdp.jpg',
    author: 'Michael Roberts',
    readTime: '6 min read',
    slug: '/blog/secure-rdp',
    featured: false,
    tags: ['Security', 'RDP', 'Protection', 'Best Practices']
  },
  {
    id: 'business-hosting',
    title: 'Why Businesses Are Switching to Cloud Hosting Solutions',
    excerpt: 'Discover the benefits of cloud hosting for businesses of all sizes and how it can improve scalability, reliability, and cost efficiency.',
    category: 'Business',
    date: 'September 10, 2023',
    image: '/images/blog/business-hosting.jpg',
    author: 'Aisha Malik',
    readTime: '5 min read',
    slug: '/blog/business-hosting',
    featured: false,
    tags: ['Cloud Hosting', 'Business', 'Scalability', 'Cost Efficiency']
  },
  {
    id: 'windows-server-2022',
    title: "What's New in Windows Server 2022: Features and Benefits",
    excerpt: 'Explore the latest features in Windows Server 2022 and how they can enhance your hosting environment with improved security and performance.',
    category: 'Technology',
    date: 'October 3, 2023',
    image: '/images/blog/windows-server-2022.jpg',
    author: 'David Chen',
    readTime: '8 min read',
    slug: '/blog/windows-server-2022',
    featured: false,
    tags: ['Windows Server', '2022', 'New Features', 'Technology']
  },
  {
    id: 'hosting-ecommerce',
    title: 'Choosing the Right Hosting for Your E-commerce Website',
    excerpt: 'Find the perfect hosting solution for your online store to ensure fast loading times, security, and reliability during high-traffic periods.',
    category: 'E-commerce',
    date: 'November 12, 2023',
    image: '/images/blog/ecommerce-hosting.jpg',
    author: 'Jennifer Lopez',
    readTime: '7 min read',
    slug: '/blog/hosting-ecommerce',
    featured: true,
    tags: ['E-commerce', 'Hosting', 'Website Performance', 'Online Store']
  },
  {
    id: 'rdp-for-remote-work',
    title: 'How RDP Solutions Are Transforming Remote Work',
    excerpt: 'Explore how Remote Desktop Protocol is enabling businesses to create secure, efficient remote work environments for their employees worldwide.',
    category: 'Remote Work',
    date: 'December 8, 2023',
    image: '/images/blog/remote-work-rdp.jpg',
    author: 'Elena Rodriguez',
    readTime: '6 min read',
    slug: '/blog/rdp-for-remote-work',
    featured: false,
    tags: ['Remote Work', 'RDP', 'Business Solutions', 'Productivity']
  },
  {
    id: 'windows-vs-linux-hosting',
    title: 'Windows vs Linux Hosting: A Comprehensive Comparison',
    excerpt: 'An in-depth analysis of the strengths, weaknesses, and ideal use cases for both Windows and Linux hosting environments.',
    category: 'Hosting Solutions',
    date: 'January 21, 2024',
    image: '/images/blog/windows-vs-linux.jpg',
    author: 'James Wilson',
    readTime: '10 min read',
    slug: '/blog/windows-vs-linux-hosting',
    featured: false,
    tags: ['Windows', 'Linux', 'Hosting Comparison', 'Server OS']
  },
];

// Featured posts for hero section
const featuredPosts = blogPosts.filter(post => post.featured);

// Get trending tags
const allTags = blogPosts.flatMap(post => post.tags);
const tagCounts = allTags.reduce((acc, tag) => {
  acc[tag] = (acc[tag] || 0) + 1;
  return acc;
}, {});

// Sort tags by count and get top 8
const trendingTags = Object.entries(tagCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8)
  .map(([tag]) => tag);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function BlogPage() {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Parallax effect for hero section
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  
  // Get unique categories
  const categories = ['All', ...new Set(blogPosts.map(post => post.category))];
  
  // Filter posts based on selected category and search query
  const filteredPosts = blogPosts
    .filter(post => filter === 'All' || post.category === filter)
    .filter(post => 
      searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section with Featured Posts Carousel */}
        <section ref={heroRef} className="relative overflow-hidden pt-24 bg-gradient-to-br from-indigo-900 via-blue-900 to-gray-900 text-white">
          <motion.div style={{ y }} className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-repeat opacity-10"></div>
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-800/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-900 to-transparent"></div>
          </motion.div>
          
          {/* Floating elements background */}
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-purple-700/10 blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-blue-700/10 blur-3xl"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto mb-12"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center mb-4 bg-indigo-800/40 rounded-full px-4 py-2 backdrop-blur-sm border border-indigo-700/30"
              >
                <SparklesIcon className="h-4 w-4 mr-2 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-200">NextGen Insights</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-indigo-200">
                Hosting & Tech <br /> Knowledge Center
              </h1>
              <p className="text-lg md:text-xl text-indigo-200/90 mb-8 max-w-3xl mx-auto">
                Expert insights, in-depth guides, and cutting-edge tutorials on Windows hosting, server management, and infrastructure optimization.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-md opacity-20"></div>
                  <div className="relative flex items-center bg-white/10 backdrop-blur-xl rounded-full px-4 border border-indigo-500/30 focus-within:border-indigo-400">
                    <MagnifyingGlassIcon className="h-5 w-5 text-indigo-300" />
                    <input
                      type="text"
                      placeholder="Search articles, topics, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className="w-full py-3 px-3 bg-transparent text-white placeholder:text-indigo-300/70 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Featured Posts Slider */}
            <div className="relative pb-16 px-4 md:px-0">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
              <div className="max-w-7xl mx-auto overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 pt-2 px-2 -mx-2"
                >
                  {featuredPosts.map((post) => (
                    <div 
                      key={post.id}
                      className="min-w-[360px] max-w-[360px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-2xl overflow-hidden flex-shrink-0 border border-gray-700/40 group"
                    >
                      <Link href={post.slug}>
                        <div className="relative h-40 w-full overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10 opacity-60"></div>
                          <div className="absolute inset-0 bg-indigo-600/20 group-hover:opacity-0 transition-opacity duration-300 z-[5]"></div>
                          <div className="w-full h-full bg-indigo-900/30"></div>
                          {/* Placeholder for actual image */}
                          <div className="absolute top-3 left-3 z-20 bg-indigo-600/90 px-2 py-1 rounded text-xs font-semibold backdrop-blur-sm">
                            Featured
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-indigo-300 bg-indigo-900/50 px-2 py-1 rounded-full border border-indigo-700/40">
                              {post.category}
                            </span>
                            <div className="flex items-center text-gray-400 text-xs">
                              <CalendarDaysIcon className="h-3.5 w-3.5 mr-1" />
                              {post.date}
                            </div>
                          </div>
                          <h2 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                            {post.title}
                          </h2>
                          <p className="text-gray-400 mb-4 text-sm line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white font-semibold text-sm mr-2">
                                {post.author.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-gray-300">{post.author}</span>
                            </div>
                            <div className="flex items-center text-gray-400 text-xs">
                              <ClockIcon className="h-3.5 w-3.5 mr-1" />
                              {post.readTime}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Bottom Curve */}
          <div className="w-full overflow-hidden h-16 -mb-16 relative">
            <svg className="absolute bottom-0 fill-white dark:fill-white w-full h-24" viewBox="0 0 1440 44" preserveAspectRatio="none">
              <path d="M1440 21.2101C1440 21.2101 1126.36 44 720 44C313.64 44 0 21.2101 0 21.2101V0H1440V21.2101Z"></path>
            </svg>
          </div>
        </section>
        
        {/* Main Content Area */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Column */}
            <div className="w-full lg:w-3/4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-10 pb-6 border-b border-gray-200">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      filter === category
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
                
              {/* Results Info */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900">
                  {searchQuery ? 'Search Results' : filter === 'All' ? 'All Articles' : `${filter} Articles`}
                  <span className="ml-2 text-sm font-normal text-gray-500 inline-flex items-center">
                    {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                  </span>
                </h2>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Clear Search
                  </button>
                )}
              </div>
                
              {/* Blog Posts Grid */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      variants={itemVariants}
                      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300 group"
                    >
                      <Link href={post.slug}>
                        <div className="relative h-48 w-full overflow-hidden">
                          <div className="absolute inset-0 bg-indigo-600/5 group-hover:bg-indigo-600/0 transition-colors duration-300"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-100/80 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="w-full h-full bg-indigo-50/70 flex items-center justify-center">
                            {/* Placeholder for actual image */}
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600">
                              <TagIcon className="h-8 w-8" />
                            </div>
                          </div>
                          {post.featured && (
                            <div className="absolute top-3 left-3 z-20 bg-yellow-500/90 px-2 py-1 rounded text-xs font-semibold text-white backdrop-blur-sm">
                              Featured
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                              {post.category}
                            </span>
                            <span className="text-xs text-gray-500">{post.date}</span>
                          </div>
                          <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {post.title}
                          </h2>
                          <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm mr-2">
                                {post.author.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-gray-700">{post.author}</span>
                            </div>
                            <div className="flex items-center text-gray-500 text-xs">
                              <ClockIcon className="h-3.5 w-3.5 mr-1" />
                              {post.readTime}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                      <MagnifyingGlassIcon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
                    <p className="text-gray-600 mb-4">
                      We couldn't find any articles matching your criteria. Try adjusting your filters or search term.
                    </p>
                    <button
                      onClick={() => {
                        setFilter('All');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      View all articles
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/4 space-y-8">
              {/* Trending Topics */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-gray-900">Trending Topics</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-md p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="h-5 w-5 text-indigo-300" />
                  <h3 className="text-lg font-bold">Stay Updated</h3>
                </div>
                <p className="text-indigo-100 text-sm mb-4">
                  Get the latest articles, tutorials and hosting tips delivered directly to your inbox.
                </p>
                <form className="space-y-3">
                  <div>
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 placeholder:text-indigo-200 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                  <button
                    type="button"
                    className="w-full px-4 py-2 rounded-lg bg-white text-indigo-600 font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                  >
                    Subscribe 
                    <ArrowLongRightIcon className="h-4 w-4" />
                  </button>
                </form>
              </div>
              
              {/* Popular Categories */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Categories</h3>
                <ul className="space-y-3">
                  {categories.filter(cat => cat !== 'All').slice(0, 5).map((category) => (
                    <li key={category}>
                      <button
                        onClick={() => setFilter(category)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors"
                      >
                        <span className="text-gray-700">{category}</span>
                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Newsletter Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Stay Connected with NextGen RDP</h2>
              <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
                Subscribe to receive the latest Windows hosting tips, tutorials, and special offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-indigo-200 w-full focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
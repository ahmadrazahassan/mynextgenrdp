'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  ArrowLongRightIcon, 
  ChevronRightIcon, 
  ClockIcon, 
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { 
  SparklesIcon, 
  FireIcon,
  ChartBarIcon as TrendingUpIcon 
} from '@heroicons/react/24/solid';

// Structured data for SEO
const blogListSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "headline": "NextGenRDP Blog: Windows RDP & VPS Insights",
  "description": "Expert tutorials, guides, and insights about Windows RDP and VPS hosting, server optimization, and free trial resources.",
  "url": "https://nextgenrdp.com/blog",
  "publisher": {
    "@type": "Organization",
    "name": "NextGenRDP",
    "logo": {
      "@type": "ImageObject",
      "url": "https://nextgenrdp.com/images/logo.png"
    }
  }
};

// Blog posts data - only keep the free RDP trial post
const blogPosts = [
  {
    id: 'free-rdp-trial-2025',
    title: 'How to Get Free RDP Trial in 2025 – No Credit Card Required',
    excerpt: 'Discover the best methods to obtain free RDP and VPS trials in 2025 without credit card requirements. Compare Azure RDP, AWS RDP, and other affordable options.',
    category: 'Cloud Computing',
    date: 'June 15, 2024',
    image: '/images/blog/free-rdp-trial-2025.jpg',
    author: 'Tech Expert',
    readTime: '12 min read',
    slug: '/blog/posts/free-rdp-trial-2025',
    featured: true,
    tags: ['Free RDP', 'Free VPS', 'Azure RDP', 'AWS RDP', 'Cheap RDP', 'Cheap VPS', 'RDP Trial', 'VPS Trial', 'Fastest RDP']
  }
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Parallax effects
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);

  // Filter posts based on search query
  const filteredPosts = blogPosts.filter(post => 
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
      
      {/* Main Container */}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section ref={heroRef} className="relative overflow-hidden h-[80vh] flex items-center">
          {/* Background with Parallax */}
          <motion.div 
            className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900"
            style={{ y }}
          >
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-repeat opacity-10"></div>
            
            {/* Floating Elements */}
            <motion.div 
              className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-indigo-600/20 blur-3xl"
              animate={{ 
                x: [0, 20, 0], 
                y: [0, -20, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            ></motion.div>
            
            <motion.div 
              className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl"
              animate={{ 
                x: [0, -30, 0], 
                y: [0, 20, 0]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            ></motion.div>
            
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-900/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-gray-900 to-transparent"></div>
          </motion.div>
          
          {/* Hero Content */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-[-50px]">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div 
                className="inline-flex items-center mb-6 bg-indigo-800/40 rounded-full px-4 py-2 backdrop-blur-sm border border-indigo-700/30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <SparklesIcon className="h-4 w-4 mr-2 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-200">NextGenRDP Blog</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-white">
                <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-indigo-200">
                  Windows RDP &
                </span>
                <br />
                <motion.span 
                  className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-200 to-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  VPS Solutions
                </motion.span>
              </h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-indigo-200/90 mb-12 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                Expert insights, in-depth guides, and cutting-edge solutions for your Windows hosting needs
              </motion.p>
              
              {/* Advanced Search Bar */}
              <motion.div 
                className="max-w-2xl mx-auto relative z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-md opacity-20"></div>
                  <div className="relative flex items-center bg-white/10 backdrop-blur-xl rounded-full px-4 border border-indigo-500/30 focus-within:border-indigo-400">
                    <MagnifyingGlassIcon className="h-5 w-5 text-indigo-300" />
                    <input
                      type="text"
                      placeholder="Search for RDP solutions, tutorials, and guides..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className="w-full py-4 px-3 bg-transparent text-white placeholder:text-indigo-300/70 focus:outline-none"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="p-1 rounded-full hover:bg-white/10"
                      >
                        <span className="sr-only">Clear search</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Trending Tags */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {blogPosts[0].tags.slice(0, 5).map((tag, index) => (
                    <motion.button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-indigo-200 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      #{tag}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Bottom Wave */}
          <div className="absolute bottom-0 w-full overflow-hidden h-16">
            <svg className="absolute bottom-0 fill-white w-full h-24" viewBox="0 0 1440 44" preserveAspectRatio="none">
              <path d="M1440 21.2101C1440 21.2101 1126.36 44 720 44C313.64 44 0 21.2101 0 21.2101V0H1440V21.2101Z"></path>
            </svg>
          </div>
        </section>
        
        {/* Blog Content Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="flex items-center justify-between mb-12"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <FireIcon className="h-8 w-8 mr-3 text-red-500" />
                <span>Featured Articles</span>
              </h2>
            </motion.div>
            
            {/* Blog Posts */}
            <motion.div 
              className="grid grid-cols-1 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    variants={fadeInUp}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-500 group"
                    whileHover={{ 
                      y: -5,
                      transition: { duration: 0.2 } 
                    }}
                  >
                    <Link href={post.slug}>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {/* Post Image */}
                        <div className="md:col-span-2 h-64 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">Free RDP Trial 2025</span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        
                        {/* Post Content */}
                        <div className="md:col-span-3 p-8">
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {post.category}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <FireIcon className="h-3 w-3 mr-1" />
                              Featured
                            </span>
                          </div>
                          
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                            {post.title}
                          </h3>
                          
                          <p className="text-gray-600 mb-6 line-clamp-3">
                            {post.excerpt}
                          </p>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm mr-2 group-hover:bg-indigo-200 transition-colors">
                                {post.author.charAt(0)}
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-700">{post.author}</span>
                                <div className="flex items-center text-gray-500 text-xs">
                                  <CalendarDaysIcon className="h-3.5 w-3.5 mr-1" />
                                  <span>{post.date}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center text-gray-500 text-sm">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              <span>{post.readTime}</span>
                            </div>
                          </div>
                          
                          <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                            <div className="flex flex-wrap gap-2">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span 
                                  key={tag} 
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  +{post.tags.length - 3} more
                                </span>
                              )}
                            </div>
                            
                            <div className="inline-flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                              Read article 
                              <ArrowLongRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="text-center py-16"
                  variants={fadeInUp}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                    <MagnifyingGlassIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    We couldn't find any articles matching your criteria. Try adjusting your search term.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    View all articles
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
        
        {/* Newsletter Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-white/5 blur-xl"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6 text-white">Stay Connected with NextGenRDP</h2>
              <p className="text-indigo-100 mb-8 text-lg">
                Subscribe to receive the latest Windows RDP hosting tips, tutorials, and exclusive offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 placeholder:text-indigo-200 text-white focus:outline-none focus:ring-2 focus:ring-white/30 flex-grow"
                />
                <motion.button 
                  className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors whitespace-nowrap"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe
                </motion.button>
              </div>
              <p className="text-indigo-200 text-sm">
                Join our community of RDP experts. No spam, unsubscribe anytime.
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="bg-indigo-50 rounded-2xl p-8 md:p-12 relative overflow-hidden"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-indigo-100 -mt-20 -mr-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-indigo-100 -mb-20 -ml-20"></div>
              
              <div className="relative z-10 max-w-4xl mx-auto text-center">
                <motion.div 
                  className="inline-flex items-center mb-4 bg-white rounded-full px-4 py-2 shadow-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <TrendingUpIcon className="h-4 w-4 mr-2 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">Premium RDP Solutions</span>
                </motion.div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Ready to Experience Lightning-Fast RDP Services?
                </h2>
                
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Explore our range of high-performance Windows RDP and VPS solutions designed for professionals and businesses.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/pricing">
                    <motion.div 
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View Pricing Plans
                    </motion.div>
                  </Link>
                  
                  <Link href="/contact">
                    <motion.div 
                      className="inline-flex items-center justify-center px-6 py-3 border border-indigo-600 text-lg font-medium rounded-lg text-indigo-600 bg-white hover:bg-indigo-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Contact Our Team
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
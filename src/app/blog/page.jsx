'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Add structured data for blog list page
const blogListSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "headline": "Windows Hosting Insights: RDP & VPS Tips",
  "description": "Expert tutorials, guides, and tips about Windows RDP and VPS hosting, server optimization, and cybersecurity.",
  "url": "https://nextgenweb.com/blog",
  "publisher": {
    "@type": "Organization",
    "name": "NextGen Web",
    "logo": {
      "@type": "ImageObject",
      "url": "https://nextgenweb.com/images/logo.png"
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
    slug: '/blog/windows-rdp-vs-vps'
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
    slug: '/blog/optimize-windows-server'
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
    slug: '/blog/secure-rdp'
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
    slug: '/blog/business-hosting'
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
    slug: '/blog/windows-server-2022'
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
    slug: '/blog/hosting-ecommerce'
  },
];

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

export default function BlogPage() {
  const [filter, setFilter] = useState('All');
  
  // Get unique categories
  const categories = ['All', ...new Set(blogPosts.map(post => post.category))];
  
  // Filter posts based on selected category
  const filteredPosts = filter === 'All'
    ? blogPosts
    : blogPosts.filter(post => post.category === filter);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4">
                Hosting <span className="text-blue-600">Knowledge Hub</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Expert insights, guides, and tutorials on Windows hosting, server management, and optimization.
              </p>
              
              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2 mb-12">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      filter === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Blog Posts Grid */}
        <section className="pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <Link href={post.slug}>
                    <div className="relative h-48 w-full">
                      <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                      {/* Placeholder for actual image */}
                      {/* <Image 
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      /> */}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {post.category}
                        </span>
                        <span className="text-xs text-gray-500">{post.date}</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
                          <span className="text-sm font-medium text-gray-700">{post.author}</span>
                        </div>
                        <span className="text-xs text-gray-500">{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
        {/* Newsletter Signup with SEO-friendly heading */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Stay Updated on Windows Hosting Tips</h2>
              <p className="text-blue-100 mb-8">
                Subscribe to our newsletter for the latest Windows hosting tips, RDP/VPS tutorials, and special offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-3 rounded-lg text-gray-900 w-full sm:w-auto sm:min-w-[300px]"
                  aria-label="Email address for newsletter subscription"
                />
                <button className="bg-white text-blue-600 font-bold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
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
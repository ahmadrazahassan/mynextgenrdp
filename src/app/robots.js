export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/*.json$',
          '/private/',
          '/checkout/success/*',
          '/checkout/error/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/images/',
          '/public/images/',
        ],
      },
    ],
    sitemap: 'https://nextgenweb.com/sitemap.xml',
    host: 'https://nextgenweb.com',
  };
} 
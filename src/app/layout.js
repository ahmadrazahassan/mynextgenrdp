export const metadata = {
  title: {
    default: 'NextGen Web | Premium Windows RDP & VPS Hosting Solutions',
    template: '%s | NextGen Web'
  },
  description: 'Professional Windows RDP and VPS hosting solutions with high performance, reliability, and 24/7 support. Affordable plans for businesses and individuals.',
  keywords: ['Windows RDP', 'VPS hosting', 'remote desktop', 'virtual private server', 'cloud hosting', 'Windows Server', 'web hosting'],
  authors: [{ name: 'NextGen Web Team' }],
  creator: 'NextGen Web',
  publisher: 'NextGen Web',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  metadataBase: new URL('https://nextgenweb.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NextGen Web | Premium Windows RDP & VPS Hosting Solutions',
    description: 'Professional Windows RDP and VPS hosting solutions with high performance, reliability, and 24/7 support. Affordable plans for businesses and individuals.',
    url: 'https://nextgenweb.com',
    siteName: 'NextGen Web',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NextGen Web | Premium Windows RDP & VPS Hosting Solutions',
    description: 'Professional Windows RDP and VPS hosting solutions with high performance, reliability, and 24/7 support.',
    images: ['/images/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'veJW09keqdvWPXN1pCEkQMzR6CWCarP9_eJoey1Mx2k',
  },
}; 
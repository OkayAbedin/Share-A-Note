import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shareanote.vercel.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/[a-zA-Z0-9]*$', // Disallow individual note URLs for privacy
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/[a-zA-Z0-9]*$',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

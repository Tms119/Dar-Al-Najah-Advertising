import { SITE_URL as base } from '@/data/site';

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/auth', '/studio'] },
    sitemap: `${base}/sitemap.xml`,
  };
}

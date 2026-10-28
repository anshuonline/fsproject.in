import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_BLOGS } from '../src/pages/Blog/data/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

const today = new Date().toISOString().split('T')[0];

const blogUrls = [
  { loc: 'https://freesong.in/blog', priority: '0.9', freq: 'daily' },
  ...ALL_BLOGS.map((b, i) => ({
    loc: `https://freesong.in/blog/${b.slug}`,
    priority: i < 10 ? '0.8' : '0.7',
    freq: 'weekly'
  }))
];

const blogXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blogUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(publicDir, 'blog-sitemap.xml'), blogXml);
console.log(`[SITEMAP] Generated public/blog-sitemap.xml with ${blogUrls.length} URLs`);

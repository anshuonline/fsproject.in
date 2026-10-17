import { blogsPart1 } from './blogsPart1.js';
import { blogsPart2 } from './blogsPart2.js';
import { blogsPart3 } from './blogsPart3.js';
import { blogsPart4 } from './blogsPart4.js';
import { blogsPart5 } from './blogsPart5.js';
import { blogsPart6 } from './blogsPart6.js';

export const ALL_BLOGS = [
  ...blogsPart1,
  ...blogsPart2,
  ...blogsPart3,
  ...blogsPart4,
  ...blogsPart5,
  ...blogsPart6
];

export const BLOG_CATEGORIES = [...new Set(ALL_BLOGS.map(b => b.category))];

export function getBlogBySlug(slug) {
  return ALL_BLOGS.find(b => b.slug === slug) || null;
}

export function getRelatedBlogs(blog, count = 4) {
  const sameCategory = ALL_BLOGS.filter(b => b.slug !== blog.slug && b.category === blog.category);
  const others = ALL_BLOGS.filter(b => b.slug !== blog.slug && b.category !== blog.category);
  return [...sameCategory, ...others].slice(0, count);
}

export function countBlogWords(blog) {
  let words = 0;
  blog.sections.forEach(section => {
    if (section.p) words += section.p.split(/\s+/).length;
    if (section.h2) words += section.h2.split(/\s+/).length;
    if (section.h3) words += section.h3.split(/\s+/).length;
    if (section.ul) words += section.ul.reduce((acc, item) => acc + item.split(/\s+/).length, 0);
  });
  return words;
}

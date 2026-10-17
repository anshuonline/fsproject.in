import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, BookOpenText, ArrowRight } from 'lucide-react';
import { ALL_BLOGS, BLOG_CATEGORIES } from './data';
import './Blog.css';

export function Blog() {
  const [activeCategory, setActiveCategory] = useState('All');

  const visibleBlogs = useMemo(() => {
    if (activeCategory === 'All') return ALL_BLOGS;
    return ALL_BLOGS.filter(b => b.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="fs-blog-page">
      <div className="fs-blog-hero">
        <span className="fs-blog-hero-badge">
          <BookOpenText size={14} />
          <span>FREESONG GUIDES</span>
        </span>
        <h1 className="fs-blog-hero-title">Music Discovery Guides</h1>
        <p className="fs-blog-hero-subtitle">
          Original FreeSong guides for discovering music, building playlists, exploring genres and planning better listening sessions.
        </p>
      </div>

      <div className="fs-blog-filter-row">
        <button
          className={`fs-blog-chip ${activeCategory === 'All' ? 'active' : ''}`}
          onClick={() => setActiveCategory('All')}
        >
          All Guides
          <span className="fs-blog-chip-count">{ALL_BLOGS.length}</span>
        </button>
        {BLOG_CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`fs-blog-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
            <span className="fs-blog-chip-count">
              {ALL_BLOGS.filter(b => b.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      <div className="fs-blog-list">
        {visibleBlogs.map(blog => (
          <Link
            key={blog.slug}
            to={`/blog/${blog.slug}`}
            className="fs-blog-card"
          >
            <div className="fs-blog-card-top">
              <span className="fs-blog-card-category">{blog.category}</span>
              <span className="fs-blog-card-dot">•</span>
              <span className="fs-blog-card-read">{blog.readTime}</span>
            </div>
            <h3 className="fs-blog-card-title">{blog.title}</h3>
            <p className="fs-blog-card-desc">{blog.description}</p>
            <span className="fs-blog-card-cta">
              Read guide <ArrowRight size={13} />
            </span>
          </Link>
        ))}
      </div>

      <div className="fs-blog-footer-cta">
        <p>
          Every guide is written for real listening habits — no fluff, no jargon.
          Ready to apply what you read?
        </p>
        <Link to="/explore" className="fs-blog-footer-link">
          Start exploring on FreeSong <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

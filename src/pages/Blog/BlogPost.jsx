import React, { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, ArrowRight, BookOpenText, Clock3 } from 'lucide-react';
import { getBlogBySlug, getRelatedBlogs } from './data';
import './Blog.css';

function BlogBlock({ block }) {
  if (block.h2) return <h2 className="fs-blog-article-h2">{block.h2}</h2>;
  if (block.h3) return <h3 className="fs-blog-article-h3">{block.h3}</h3>;
  if (block.p) return <p className="fs-blog-article-p">{block.p}</p>;
  if (block.ul) {
    return (
      <ul className="fs-blog-article-ul">
        {block.ul.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    );
  }
  return null;
}

export function BlogPost() {
  const { slug } = useParams();
  const blog = getBlogBySlug(slug);

  useEffect(() => {
    if (!blog) return;
    const previousTitle = document.title;
    document.title = `${blog.title} | FreeSong.in Blog`;

    const metaDesc = document.querySelector('meta[name="description"]');
    const previousDesc = metaDesc ? metaDesc.getAttribute('content') : null;
    if (metaDesc) metaDesc.setAttribute('content', blog.description);

    return () => {
      document.title = previousTitle;
      if (metaDesc && previousDesc) metaDesc.setAttribute('content', previousDesc);
    };
  }, [blog]);

  if (!blog) return <Navigate to="/blog" replace />;

  const related = getRelatedBlogs(blog, 4);

  return (
    <div className="fs-blog-page">
      <div className="fs-blog-breadcrumbs">
        <Link to="/">Home</Link>
        <ChevronRight size={13} />
        <Link to="/blog">Blog</Link>
        <ChevronRight size={13} />
        <span className="current">{blog.title}</span>
      </div>

      <article className="fs-blog-article">
        <header className="fs-blog-article-header">
          <div className="fs-blog-card-top">
            <span className="fs-blog-card-category">{blog.category}</span>
            <span className="fs-blog-card-dot">•</span>
            <span className="fs-blog-card-read">
              <Clock3 size={11} style={{ marginRight: 4, verticalAlign: '-1px' }} />
              {blog.readTime}
            </span>
          </div>
          <h1 className="fs-blog-article-title">{blog.title}</h1>
          <p className="fs-blog-article-lede">{blog.description}</p>
        </header>

        <div className="fs-blog-article-body">
          {blog.sections.map((block, i) => (
            <BlogBlock key={i} block={block} />
          ))}
        </div>

        <footer className="fs-blog-article-footer">
          <Link to="/blog" className="fs-blog-back-link">
            <ArrowLeft size={14} />
            All Music Guides
          </Link>
        </footer>
      </article>

      <section className="fs-blog-related">
        <h2 className="fs-blog-related-title">
          <BookOpenText size={16} />
          Keep Reading
        </h2>
        <div className="fs-blog-related-grid">
          {related.map(item => (
            <Link key={item.slug} to={`/blog/${item.slug}`} className="fs-blog-card fs-blog-card-compact">
              <div className="fs-blog-card-top">
                <span className="fs-blog-card-category">{item.category}</span>
                <span className="fs-blog-card-dot">•</span>
                <span className="fs-blog-card-read">{item.readTime}</span>
              </div>
              <h3 className="fs-blog-card-title">{item.title}</h3>
              <p className="fs-blog-card-desc">{item.description}</p>
              <span className="fs-blog-card-cta">
                Read guide <ArrowRight size={13} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

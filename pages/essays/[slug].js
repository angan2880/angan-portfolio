import React from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { getEssayBySlug, getAllEssays, markdownToHtml } from '../../lib/markdown';

export default function Essay({ essay }) {
  // Format date as "DD MMM YYYY"
  const formattedDate = (() => {
    const date = new Date(essay.date);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  })();

  return (
    <Layout title={essay.title} description={essay.summary || `Essay: ${essay.title}`}>
      <article className="essay-content">
        <p className="essay-date">{formattedDate}</p>
        
        <div className="essay-body" dangerouslySetInnerHTML={{ __html: essay.content }} />
      </article>
      
      <div className="back-link">
        <Link href="/essays">← Essays</Link>
      </div>
      
      <style jsx>{`
        .essay-content {
          max-width: 100%;
          margin: 0 auto;
        }
        
        h1 {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          line-height: 1.3;
          color: var(--text-primary);
        }
        
        .essay-date {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }
        
        .essay-body {
          line-height: 1.6;
          font-size: 1rem;
          color: var(--text-primary);
        }
        
        .essay-body :global(h1) {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          line-height: 1.3;
          color: var(--text-primary);
        }
        
        .essay-body :global(h2) {
          font-size: 1.4rem;
          font-weight: 600;
          margin: 2rem 0 1rem;
          color: var(--text-primary);
        }
        
        .essay-body :global(h3) {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 1.5rem 0 1rem;
          color: var(--text-primary);
        }
        
        .essay-body :global(p) {
          margin-bottom: 1.2rem;
          color: var(--text-primary);
        }
        
        .essay-body :global(ul), .essay-body :global(ol) {
          margin-bottom: 1.2rem;
          padding-left: 1.5rem;
          color: var(--text-primary);
        }
        
        .essay-body :global(li) {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }
        
        .essay-body :global(pre) {
          background-color: var(--code-bg);
          border-radius: 4px;
          padding: 1rem;
          overflow-x: auto;
          margin-bottom: 1.2rem;
        }
        
        .essay-body :global(code) {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          color: var(--code-text);
        }
        
        .essay-body :global(blockquote) {
          border-left: 3px solid var(--blockquote-border);
          margin-left: 0;
          padding-left: 1rem;
          font-style: italic;
          color: var(--text-primary);
          background-color: var(--blockquote-bg);
          padding: 0.5rem 1rem;
        }
        
        .back-link {
          margin-top: 3rem;
          margin-bottom: 2rem;
        }
        
        .back-link a {
          color: var(--link-color);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }
        
        .back-link a:hover {
          text-decoration: underline;
          color: var(--link-hover);
        }
      `}</style>
    </Layout>
  );
}

export async function getStaticPaths() {
  const essays = await getAllEssays(['slug']);
  
  return {
    paths: essays.map((essay) => {
      return {
        params: {
          slug: essay.slug,
        },
      };
    }),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const essay = await getEssayBySlug(params.slug);
  
  // Process markdown content to HTML
  const processedContent = await markdownToHtml(essay.content || '');
  
  return {
    props: {
      essay: {
        ...essay,
        content: processedContent
      },
    },
  };
} 
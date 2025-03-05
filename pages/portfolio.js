import React from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import Image from 'next/image';

export default function Portfolio() {
  return (
    <Layout title="Portfolio" description="Portfolio of Angan Sarker">
      <div className="page-header">
        <h1>Portfolio</h1>
      </div>
      
      <p className="intro">
        This is a sample portfolio page demonstrating how to use static files from the public directory.
        Below are examples of different file types that can be used on your website. All files are organized 
        into appropriate folders - images in the <code>/images</code> directory, documents like the resume in 
        the <code>/documents</code> directory, and portfolio materials in the <code>/portfolio</code> directory.
      </p>
      
      <h2>Images</h2>
      <div className="portfolio-grid">
        <div className="portfolio-item">
          <div className="image-container">
            <img src="/images/profile.svg" alt="Profile Image" />
          </div>
          <h3>Profile Image</h3>
          <p>Example of displaying a profile image from the public directory</p>
        </div>
        
        <div className="portfolio-item">
          <div className="image-container">
            <img src="/images/projects/project1.svg" alt="Project 1" />
          </div>
          <h3>Project 1</h3>
          <p>Example of displaying a project image</p>
        </div>
        
        <div className="portfolio-item">
          <div className="image-container">
            <img src="/images/projects/project2.svg" alt="Project 2" />
          </div>
          <h3>Project 2</h3>
          <p>Another example of a project image</p>
        </div>
      </div>
      
      <h2>Documents</h2>
      <div className="documents-list">
        <div className="document-item">
          <div className="document-icon">📄</div>
          <div className="document-info">
            <h3>Resume</h3>
            <p>PDF document example</p>
            <a href="/documents/Angan_Sarker_Resume.pdf" download className="download-link">
              Download Resume
            </a>
          </div>
        </div>
        
        <div className="document-item">
          <div className="document-icon">📝</div>
          <div className="document-info">
            <h3>Sample Report</h3>
            <p>Text document example</p>
            <a href="/documents/sample_report.txt" download className="download-link">
              Download Report
            </a>
          </div>
        </div>
        
        <div className="document-item">
          <div className="document-icon">📋</div>
          <div className="document-info">
            <h3>Case Study</h3>
            <p>Markdown document example</p>
            <a href="/portfolio/case_study.txt" download className="download-link">
              Download Case Study
            </a>
          </div>
        </div>
      </div>
      
      <div className="tip-box">
        <h3>How to Add More Files</h3>
        <p>
          To add more files to your website, simply place them in the appropriate 
          folders within the <code>public</code> directory:
        </p>
        <ul>
          <li><code>public/images/</code> - For images and photos</li>
          <li><code>public/documents/</code> - For PDFs, text files, etc.</li>
          <li><code>public/portfolio/</code> - For case studies and project files</li>
        </ul>
        <p>
          Then reference them in your pages using paths that start from the root:
          <code>{`<img src="/images/your-image.jpg" />`}</code>
        </p>
      </div>

      <style jsx>{`
        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }
        
        .intro {
          margin-bottom: 2rem;
          max-width: 100%;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        
        h2 {
          font-size: 1.3rem;
          font-weight: 600;
          margin: 2rem 0 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .portfolio-item {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .portfolio-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px var(--card-shadow);
        }
        
        .image-container {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: var(--code-bg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .image-container img {
          max-width: 100%;
          max-height: 100%;
        }
        
        .portfolio-item h3 {
          font-size: 1rem;
          font-weight: 500;
          margin: 0.75rem 0.75rem 0.25rem;
        }
        
        .portfolio-item p {
          font-size: 0.85rem;
          color: var(--text-secondary, var(--footer-text));
          margin: 0 0.75rem 0.75rem;
        }
        
        .documents-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .document-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        
        .document-item:hover {
          background-color: var(--hover-bg);
        }
        
        .document-icon {
          font-size: 2rem;
          margin-right: 1.5rem;
          color: var(--text-secondary, var(--footer-text));
        }
        
        .document-info {
          flex: 1;
        }
        
        .document-info h3 {
          font-size: 1rem;
          font-weight: 500;
          margin: 0 0 0.25rem;
        }
        
        .document-info p {
          font-size: 0.85rem;
          color: var(--text-secondary, var(--footer-text));
          margin: 0 0 0.5rem;
        }
        
        .download-link {
          display: inline-block;
          font-size: 0.85rem;
          background-color: var(--code-bg);
          color: var(--text-primary, var(--text-color));
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          text-decoration: none;
          transition: background-color 0.2s ease;
        }
        
        .download-link:hover {
          background-color: var(--hover-bg);
        }
        
        .tip-box {
          background-color: var(--blockquote-bg);
          border-left: 3px solid #6b8af7;
          padding: 1.5rem;
          margin-top: 2rem;
          border-radius: 4px;
        }
        
        .tip-box h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 1rem;
          color: var(--text-primary, var(--text-color));
        }
        
        .tip-box p {
          font-size: 0.9rem;
          margin: 0.75rem 0;
          line-height: 1.5;
        }
        
        .tip-box ul {
          margin: 0.5rem 0;
          padding-left: 1.25rem;
        }
        
        .tip-box li {
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        
        .tip-box code {
          background-color: var(--code-bg);
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.85rem;
        }
        
        @media (max-width: 640px) {
          .portfolio-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
} 
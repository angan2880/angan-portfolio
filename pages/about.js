import React from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

export default function About() {
  return (
    <Layout title="About" description="About Angan Sarker - Investment Analyst">
      <div className="page-header">
        <h1>About</h1>
      </div>
      
      <p className="intro">
        I'm an Investment Analyst at John Hancock Investment Management where I research and analyze
        mutual fund products, compile quarterly reports for the Board of Trustees, and collaborate with
        Research Analysts on fund performance reviews.
      </p>
      <p className="intro">
        With a background in finance and business analytics, I combine quantitative analysis with strategic
        thinking to support investment decisions and portfolio management.
      </p>
      <p className="intro">
        Reach me: <a href="mailto:sarker.angan@gmail.com">sarker.angan@gmail.com</a> | <a href="https://www.linkedin.com/in/your-linkedin">LinkedIn</a>
      </p>
      
      <div className="resume-download">
        <a href="/documents/Angan_Sarker_Resume.pdf" download className="download-button">
          <span className="button-icon">📄</span>
          Download Resume
        </a>
      </div>
      
      <div className="section-divider"></div>
      
      <h2>Work</h2>
      
      <div className="experience-item">
        <div className="experience-header">
          <h3>John Hancock Investment Management</h3>
          <span className="duration">2021-Present</span>
        </div>
        <p className="position">Investment Analyst</p>
        <ul>
          <li>Research and analyze the performance, attribution and expenses of 40 mutual fund products ($60B AUM)</li>
          <li>Compile fund reports and analysis on a quarterly basis for the Board of Trustees</li>
          <li>Collaborate on performance reviews with qualitative and quantitative fund commentary</li>
        </ul>
      </div>
      
      <div className="experience-item">
        <div className="experience-header">
          <h3>Babson College Fund</h3>
          <span className="duration">2020-2021</span>
        </div>
        <p className="position">Risk Analyst</p>
        <ul>
          <li>Received the Outstanding Analyst of the Year Award for exceptional research</li>
          <li>Conducted attribution, risk and factor analysis using investment analytics platforms</li>
          <li>Developed equity screens to help sector analysts generate investment ideas</li>
        </ul>
      </div>
      
      <div className="experience-item">
        <div className="experience-header">
          <h3>PACES</h3>
          <span className="duration">2022-Present</span>
        </div>
        <p className="position">Co-Chair, Pan-Asian Community for Employee Success</p>
        <ul>
          <li>Lead John Hancock's DEI focused employee resource group for Pan-Asian employees</li>
          <li>Arrange cultural and career development events and collaborate with other asset managers</li>
        </ul>
      </div>
      
      <div className="experience-item">
        <div className="experience-header">
          <h3>Asymmetry Group LLC</h3>
          <span className="duration">2019</span>
        </div>
        <p className="position">Healthcare Consulting Intern</p>
        <ul>
          <li>Collaborated with healthcare consultants and machine learning experts on predictive models</li>
          <li>Conducted thorough competitive landscape analysis for strategic planning</li>
        </ul>
      </div>
      
      <div className="section-divider"></div>
      
      <h2>Education</h2>
      
      <div className="experience-item">
        <div className="experience-header">
          <h3>Babson College</h3>
          <span className="duration">2018-2021</span>
        </div>
        <p className="position">Bachelor of Science, <em>magna cum laude</em></p>
        <p>Dual Concentration: Finance (GPA: 4.0/4) and Business Analytics (GPA: 3.7/4)</p>
      </div>
      
      <div className="experience-item">
        <div className="experience-header">
          <h3>CFA Program</h3>
          <span className="duration">2021-Present</span>
        </div>
        <p>Passed CFA Level I exam (November 2021); Registered CFA Level II Candidate</p>
      </div>
      
      <div className="section-divider"></div>
      
      <h2>Skills</h2>
      
      <div className="skills-section">
        <div className="skill-category">
          <h3>Technical</h3>
          <p>Python, R, Excel, Tableau, Bloomberg, Factset, Capital IQ, Morningstar Direct</p>
        </div>
        
        <div className="skill-category">
          <h3>Languages</h3>
          <p>Fluent in English, Bengali and Hindi</p>
        </div>
      </div>

      <style jsx>{`
        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }
        
        .resume-download {
          margin: 1.5rem 0;
        }
        
        .download-button {
          display: inline-flex;
          align-items: center;
          background-color: #f5f5f5;
          color: #333;
          padding: 10px 16px;
          border-radius: 4px;
          font-size: 0.95rem;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid #e0e0e0;
          transition: all 0.2s ease;
        }
        
        .download-button:hover {
          background-color: #e5e5e5;
          border-color: #ccc;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .button-icon {
          margin-right: 8px;
          font-size: 1.1rem;
        }
        
        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          margin-top: 1.5rem;
        }
        
        h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          display: inline;
        }
        
        .intro {
          margin-bottom: 1rem;
          max-width: 100%;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        
        .section-divider {
          border-top: 1px solid #eaeaea;
          margin: 2rem 0;
        }
        
        .experience-item {
          margin-bottom: 1.5rem;
        }
        
        .experience-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.25rem;
        }
        
        .duration {
          color: #666;
          font-size: 0.9rem;
        }
        
        .position {
          font-size: 0.9rem;
          margin: 0.15rem 0 0.5rem 0;
          color: #333;
        }
        
        ul {
          margin: 0.5rem 0 1rem 0;
          padding-left: 1.2rem;
        }
        
        li {
          margin-bottom: 0.35rem;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .skills-section {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
        }
        
        .skill-category {
          flex: 1;
          min-width: 250px;
          margin-bottom: 1rem;
        }
        
        .skill-category p {
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }
        
        a {
          color: inherit;
          text-decoration: underline;
        }
      `}</style>
    </Layout>
  );
} 
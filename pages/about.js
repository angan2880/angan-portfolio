import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getAboutContentFromNotion } from '../lib/notion';

// Hardcoded fallback data
const fallbackAbout = {
  bio: [
    "I'm an Investment Analyst at John Hancock Investment Management where I research and analyze mutual fund products, compile quarterly reports for the Board of Trustees, and collaborate with Research Analysts on fund performance reviews.",
    "With a background in finance and business analytics, I combine quantitative analysis with strategic thinking to support investment decisions and portfolio management."
  ],
  contact: { email: 'sarker.angan@gmail.com', linkedin: 'https://www.linkedin.com/in/angansarker' },
  resumeUrl: '/documents/Angan_Sarker_Resume.pdf',
  work: [
    { company: 'John Hancock Investment Management', position: 'Investment Analyst', duration: '2021-Present', bullets: ['Research and analyze the performance, attribution and expenses of 40 mutual fund products ($60B AUM)', 'Compile fund reports and analysis on a quarterly basis for the Board of Trustees', 'Collaborate on performance reviews with qualitative and quantitative fund commentary'] },
    { company: 'Babson College Fund', position: 'Risk Analyst', duration: '2020-2021', bullets: ['Received the Outstanding Analyst of the Year Award for exceptional research', 'Conducted attribution, risk and factor analysis using investment analytics platforms', 'Developed equity screens to help sector analysts generate investment ideas'] },
    { company: 'PACES', position: 'Co-Chair, Pan-Asian Community for Employee Success', duration: '2022-Present', bullets: ['Lead John Hancock\'s DEI focused employee resource group for Pan-Asian employees', 'Arrange cultural and career development events and collaborate with other asset managers'] },
    { company: 'Asymmetry Group LLC', position: 'Healthcare Consulting Intern', duration: '2019', bullets: ['Collaborated with healthcare consultants and machine learning experts on predictive models', 'Conducted thorough competitive landscape analysis for strategic planning'] },
  ],
  education: [
    { institution: 'Babson College', degree: 'Bachelor of Science, magna cum laude', duration: '2018-2021', details: ['Dual Concentration: Finance (GPA: 4.0/4) and Business Analytics (GPA: 3.7/4)'] },
    { institution: 'CFA Program', degree: '', duration: '2021-Present', details: ['Passed CFA Level I exam (November 2021); Registered CFA Level II Candidate'] },
  ],
  skills: [
    { category: 'Technical', items: 'Python, R, Excel, Tableau, Bloomberg, Factset, Capital IQ, Morningstar Direct' },
    { category: 'Languages', items: 'Fluent in English, Bengali and Hindi' },
  ],
};

export default function About({ about }) {
  const data = about || fallbackAbout;
  const [keyboardMode, setKeyboardMode] = useState(false);

  // Detect keyboard navigation mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setKeyboardMode(true);
      }
    };

    const handleMouseDown = () => {
      setKeyboardMode(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <Layout title="About" description="About Angan Sarker - Investment Analyst">
      <div className="page-header">
        <h1>About</h1>
      </div>

      {data.bio.map((paragraph, i) => (
        <p key={i} className="intro">{paragraph}</p>
      ))}

      <p className="intro">
        Reach me: <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a> | <a href={data.contact.linkedin}>LinkedIn</a>
      </p>

      <div className="resume-download">
        <a
          href={data.resumeUrl}
          download
          className={`download-button ${keyboardMode ? 'keyboard-accessible' : ''}`}
          aria-label="Download Resume PDF"
          onKeyDown={(e) => {
            if (e.key === ' ') {
              e.preventDefault();
              const link = document.createElement('a');
              link.href = data.resumeUrl;
              link.download = 'Angan_Sarker_Resume.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }}
        >
          <span className="button-icon">📄</span>
          Download Resume
        </a>
      </div>

      <div className="section-divider"></div>

      <h2>Work</h2>

      {data.work.map((item, i) => (
        <div key={i} className="experience-item">
          <div className="experience-header">
            <h3>{item.company}</h3>
            <span className="duration">{item.duration}</span>
          </div>
          <p className="position">{item.position}</p>
          {item.bullets.length > 0 && (
            <ul>
              {item.bullets.map((bullet, j) => (
                <li key={j}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <div className="section-divider"></div>

      <h2>Education</h2>

      {data.education.map((item, i) => (
        <div key={i} className="experience-item">
          <div className="experience-header">
            <h3>{item.institution}</h3>
            <span className="duration">{item.duration}</span>
          </div>
          {item.degree && <p className="position">{item.degree}</p>}
          {item.details.map((detail, j) => (
            <p key={j}>{detail}</p>
          ))}
        </div>
      ))}

      <div className="section-divider"></div>

      <h2>Skills</h2>

      <div className="skills-section">
        {data.skills.map((skill, i) => (
          <div key={i} className="skill-category">
            <h3>{skill.category}</h3>
            <p>{skill.items}</p>
          </div>
        ))}
      </div>

      <style jsx>{`
        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .resume-download {
          margin: 1.5rem 0;
        }

        .download-button {
          display: inline-flex;
          align-items: center;
          background-color: var(--card-bg);
          color: var(--text-color);
          padding: 10px 16px;
          border-radius: 20px;
          font-size: 0.95rem;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid var(--border-color);
          transition: all 0.15s ease;
        }

        @media (hover: hover) {
          .download-button:hover {
            background-color: var(--card-hover-bg);
            color: var(--accent-color);
            border-color: var(--accent-color);
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
        }

        /* Enhanced keyboard focus styles */
        .download-button.keyboard-accessible:focus {
          outline: 2px solid var(--link-color);
          outline-offset: 2px;
          background-color: var(--hover-bg);
          border-color: var(--link-color);
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transform: translateY(-1px);
        }

        .button-icon {
          margin-right: 8px;
          font-size: 1.1rem;
        }

        h2 {
          font-size: 1.5rem;
          font-weight: 700;
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
          color: var(--text-color);
        }

        .section-divider {
          border-top: 1px solid var(--border-color);
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
          color: var(--nav-text);
          font-size: 0.9rem;
        }

        .position {
          font-size: 0.9rem;
          margin: 0.15rem 0 0.5rem 0;
          color: var(--text-color);
        }

        ul {
          margin: 0.5rem 0 1rem 0;
          padding-left: 1.2rem;
        }

        li {
          margin-bottom: 0.35rem;
          font-size: 0.9rem;
          line-height: 1.4;
          color: var(--text-color);
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
          color: var(--text-color);
        }

        a {
          color: var(--link-color);
          text-decoration: underline;
        }

        @media (hover: hover) {
          a:hover {
            color: var(--link-hover-color);
          }
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 1.3rem;
          }

          h2 {
            font-size: 1.3rem;
          }

          .experience-header {
            flex-direction: column;
            gap: 0.15rem;
          }

          .duration {
            font-size: 0.8rem;
          }

          .skills-section {
            flex-direction: column;
            gap: 1rem;
          }

          .skill-category {
            min-width: unset;
          }

          .download-button {
            font-size: 0.9rem;
            padding: 8px 14px;
          }
        }
      `}</style>
    </Layout>
  );
}

export async function getStaticProps() {
  let about = null;
  try {
    about = await getAboutContentFromNotion();
  } catch (error) {
    console.error('Error fetching about content from Notion:', error);
  }

  return {
    props: {
      about: about || fallbackAbout,
    },
    revalidate: 60,
  };
}

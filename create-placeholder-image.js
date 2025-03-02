const fs = require('fs');
const path = require('path');

// Function to create a placeholder image
function createPlaceholderImage(filePath, label) {
  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
  <rect width="300" height="200" fill="#f5f5f5"/>
  <text x="150" y="100" font-family="Arial" font-size="16" text-anchor="middle" fill="#333">
    ${label}
  </text>
</svg>
  `.trim();
  
  fs.writeFileSync(filePath, svgContent);
}

// Create placeholder images for different purposes
createPlaceholderImage(path.join('public', 'images', 'profile.svg'), 'Profile Picture');
createPlaceholderImage(path.join('public', 'images', 'projects', 'project1.svg'), 'Project 1');
createPlaceholderImage(path.join('public', 'images', 'projects', 'project2.svg'), 'Project 2');

// Create a placeholder text file for the portfolio section
const sampleText = `
# Sample Case Study

This is a placeholder for a case study or project description.

## Overview
- Client: Example Corporation
- Timeframe: January - March 2023
- Objective: Analyze investment opportunities

## Results
The analysis identified several promising investment opportunities
with potential returns exceeding market averages.
`;

fs.writeFileSync(path.join('public', 'portfolio', 'case_study.txt'), sampleText);

// Create a placeholder document
const sampleDoc = `
SAMPLE REPORT
=============

Title: Quarterly Market Analysis
Author: Angan Sarker
Date: March 1, 2023

CONTENTS
--------
1. Executive Summary
2. Market Overview
3. Investment Recommendations
4. Risk Assessment

This is a placeholder document.
`;

fs.writeFileSync(path.join('public', 'documents', 'sample_report.txt'), sampleDoc);

console.log('Created placeholder files in the public directory structure'); 
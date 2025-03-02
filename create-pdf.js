const fs = require('fs');
const path = require('path');

// Create a simple PDF file structure
const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<< /Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<< /Type /Page
/Parent 2 0 R
/Resources << /Font << /F1 4 0 R >> >>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj
4 0 obj
<< /Type /Font
/Subtype /Type1
/Name /F1
/BaseFont /Helvetica
>>
endobj
5 0 obj
<< /Length 128 >>
stream
BT
/F1 24 Tf
50 700 Td
(Angan Sarker - Resume) Tj
/F1 12 Tf
0 -50 Td
(This is a placeholder. Please replace with your actual resume.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000059 00000 n
0000000118 00000 n
0000000240 00000 n
0000000317 00000 n
trailer
<< /Size 6
/Root 1 0 R
>>
startxref
496
%%EOF`;

// Ensure public directory exists
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Write the PDF file
fs.writeFileSync(path.join('public', 'Angan_Sarker_Resume.pdf'), pdfContent);

console.log('Created placeholder PDF in public/Angan_Sarker_Resume.pdf'); 
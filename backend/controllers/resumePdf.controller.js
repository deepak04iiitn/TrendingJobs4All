import puppeteer from 'puppeteer';
import Resume from '../models/Resume.js';

export const generateResumePdf = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumeId = req.params.id;
    const resume = await Resume.findOne({ _id: resumeId, userId });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Generate HTML for each field
    const renderField = (field, value) => {
      if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && !value)) {
        return '';
      }

      switch (field) {
        case 'Header':
          const headerValue = value || {};
          if (!headerValue.name && !headerValue.email && !headerValue.phone && !headerValue.location) {
            return '';
          }
          return `
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">${headerValue.name || ''}</h1>
              <div style="font-size: 12px; color: #666; line-height: 1.4;">
                ${headerValue.email ? `Email: ${headerValue.email} • ` : ''}
                ${headerValue.phone ? `Mobile: ${headerValue.phone} • ` : ''}
                ${headerValue.location ? `${headerValue.location}` : ''}
              </div>
            </div>
          `;

        case 'Objective':
          return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase;">Objective</h2>
              <p style="font-size: 12px; color: #333; margin: 0;">${value}</p>
            </div>
          `;

        case 'Education':
          return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase;">Education</h2>
              ${(value || []).map(edu => `
                <div style="margin-bottom: 10px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px;">
                    <h3 style="font-weight: bold; margin: 0;">${edu.degree}, ${edu.institution}</h3>
                    <span style="color: #666;">${edu.year}</span>
                  </div>
                  ${edu.gpa ? `<p style="font-size: 12px; color: #333; margin: 5px 0 0 0;">GPA: ${edu.gpa}</p>` : ''}
                  ${(edu.description || []).length > 0 ? `
                    <div style="font-size: 12px; color: #333; margin-top: 5px;">
                      ${(edu.description || []).map(desc => desc ? `<div style="margin-bottom: 2px;">• ${desc}</div>` : '').join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `;

        case 'Technical Skills':
          if (!Array.isArray(value)) return '';
          
          // Check if skills are categorized
          if (value.length > 0 && typeof value[0] === 'object' && 'category' in value[0]) {
            return `
              <div style="margin-bottom: 20px;">
                <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase;">Technical Skills</h2>
                ${value.map(category => `
                  <div style="font-size: 12px; color: #333; margin-bottom: 5px;">
                    <span style="font-weight: bold;">• ${category.category}:</span> ${category.skills.join(', ')}
                  </div>
                `).join('')}
              </div>
            `;
          }
          
          return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase;">Technical Skills</h2>
              ${value.map(skill => `
                <div style="font-size: 12px; color: #333; margin-bottom: 2px;">• ${typeof skill === 'string' ? skill : ''}</div>
              `).join('')}
            </div>
          `;

        case 'Projects':
          return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase;">Projects</h2>
              ${(value || []).map(project => `
                <div style="margin-bottom: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; font-size: 12px;">
                    <h3 style="font-weight: bold; margin: 0;">${project.title}</h3>
                    <div style="display: flex; gap: 10px;">
                      ${project.link ? `<a href="${project.link}" style="color: #0066cc; text-decoration: none;">Demo</a>` : ''}
                      ${project.sourceCode ? `<a href="${project.sourceCode}" style="color: #0066cc; text-decoration: none;">Source</a>` : ''}
                    </div>
                  </div>
                  ${Array.isArray(project.technologies) && project.technologies.length > 0 ? 
                    `<p style="font-size: 12px; color: #333; margin: 5px 0;"><strong>Tech:</strong> ${project.technologies.join(', ')}</p>` : ''}
                  ${(project.description || []).length > 0 ? `
                    <div style="font-size: 12px; color: #333; margin-top: 5px;">
                      ${(project.description || []).map(desc => desc ? `<div style="margin-bottom: 2px;">• ${desc}</div>` : '').join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `;

        case 'Work Experience':
          return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase;">Work Experience</h2>
              ${(value || []).map(exp => `
                <div style="margin-bottom: 10px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px;">
                    <h3 style="font-weight: bold; margin: 0;">${exp.position}, ${exp.company}</h3>
                    <span style="color: #666;">${exp.duration}</span>
                  </div>
                  ${(exp.description || []).length > 0 ? `
                    <div style="font-size: 12px; color: #333; margin-top: 5px;">
                      ${(exp.description || []).map(desc => desc ? `<div style="margin-bottom: 2px;">• ${desc}</div>` : '').join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `;

        case 'Positions of Responsibility':
          return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase;">Positions of Responsibility</h2>
              ${(value || []).map(pos => `
                <div style="margin-bottom: 10px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px;">
                    <h3 style="font-weight: bold; margin: 0;">${pos.title}, ${pos.organization}</h3>
                    <span style="color: #666;">${pos.duration}</span>
                  </div>
                  ${(pos.description || []).length > 0 ? `
                    <div style="font-size: 12px; color: #333; margin-top: 5px;">
                      ${(pos.description || []).map(desc => desc ? `<div style="margin-bottom: 2px;">• ${desc}</div>` : '').join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `;

        case 'Certifications':
          return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase;">Certifications</h2>
              ${(value || []).map(cert => `
                <div style="margin-bottom: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; font-size: 12px;">
                    <h3 style="font-weight: bold; margin: 0;">${cert.name}</h3>
                    ${cert.date ? `<span style="color: #666;">${cert.date}</span>` : ''}
                  </div>
                  ${cert.issuer ? `<p style="font-size: 12px; color: #333; margin: 5px 0;">Issuer: ${cert.issuer}</p>` : ''}
                  ${cert.link ? `<a href="${cert.link}" style="color: #0066cc; text-decoration: none; font-size: 12px;">Verify</a>` : ''}
                </div>
              `).join('')}
            </div>
          `;

        case 'Achievements':
          if (Array.isArray(value) && value.length === 0) return '';
          return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase;">Achievements</h2>
              ${(value || []).map(item => item ? `<div style="font-size: 12px; color: #333; margin-bottom: 2px;">• ${item}</div>` : '').join('')}
            </div>
          `;

        case 'Research/Publications':
          return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase;">Research & Publications</h2>
              ${(value || []).map(pub => `
                <div style="margin-bottom: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; font-size: 12px;">
                    <div>
                      <h3 style="font-weight: bold; margin: 0;">${pub.title}</h3>
                      ${pub.authors ? `<p style="font-size: 12px; color: #333; margin: 5px 0;">Authors: ${pub.authors}</p>` : ''}
                      ${pub.publication ? `<p style="font-size: 12px; color: #333; margin: 5px 0;">Publication: ${pub.publication}</p>` : ''}
                      ${pub.date ? `<p style="font-size: 12px; color: #666; margin: 5px 0;">Date: ${pub.date}</p>` : ''}
                    </div>
                    ${pub.link ? `<a href="${pub.link}" style="color: #0066cc; text-decoration: none;">View</a>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `;

        case 'Languages':
          if (Array.isArray(value) && value.length === 0) return '';
          return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase;">Languages</h2>
              ${(value || []).map(item => 
                (item.language || item.proficiency) ? 
                `<div style="font-size: 12px; color: #333; margin-bottom: 2px;">• ${item.language}${item.language && item.proficiency ? ' ' : ''}${item.proficiency ? `(${item.proficiency})` : ''}</div>` : ''
              ).join('')}
            </div>
          `;

        case 'Hobbies':
          if (Array.isArray(value) && value.length === 0) return '';
          return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase;">Hobbies</h2>
              ${(value || []).map(item => item ? `<div style="font-size: 12px; color: #333; margin-bottom: 2px;">• ${item}</div>` : '').join('')}
            </div>
          `;

        default:
          return '';
      }
    };

    // Generate the complete HTML
    const html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            font-size: 12px; 
            line-height: 1.4;
            color: #333;
          }
          h1, h2, h3 { margin: 0; }
          a { color: #0066cc; text-decoration: none; }
          .resume-container {
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
            padding: 0.5in;
            min-height: 11in;
          }
        </style>
      </head>
      <body>
        <div class="resume-container">
          ${resume.selectedFields.map(field => renderField(field, resume.resumeData[field])).join('')}
        </div>
      </body>
      </html>
    `;

    // Launch browser with specific options for better compatibility
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
      preferCSSPageSize: true
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="resume.pdf"',
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ message: 'Failed to generate PDF', details: err.message });
  }
}; 
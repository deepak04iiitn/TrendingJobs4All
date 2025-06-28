import React, { useRef } from 'react';
import { FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';

const ResumePreview = ({ selectedFields = [], resumeData = {} }) => {
    const resumeRef = useRef(null);

    const handleDownload = async () => {
        try {
            // Create PDF with proper dimensions
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter'
            });

            // Set font and size
            pdf.setFont('helvetica');
            pdf.setFontSize(10);

            let yPosition = 0.5; // Start position from top
            const leftMargin = 0.5;
            const rightMargin = 8.0;
            const lineHeight = 0.15;
            const sectionSpacing = 0.2;

            // Helper function to add text with word wrapping
            const addWrappedText = (text, x, y, maxWidth) => {
                const words = text.split(' ');
                let line = '';
                let currentY = y;

                for (let i = 0; i < words.length; i++) {
                    const testLine = line + words[i] + ' ';
                    const testWidth = pdf.getTextWidth(testLine);
                    
                    if (testWidth > maxWidth && i > 0) {
                        pdf.text(line, x, currentY);
                        line = words[i] + ' ';
                        currentY += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                pdf.text(line, x, currentY);
                return currentY + lineHeight;
            };

            // Helper function to add section header
            const addSectionHeader = (title) => {
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(12);
                pdf.text(title.toUpperCase(), leftMargin, yPosition);
                yPosition += 0.08;
                
                // Add thin underline
                pdf.setLineWidth(0.01); // Make the line thin
                pdf.line(leftMargin, yPosition, rightMargin, yPosition);
                yPosition += 0.15;
                
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(10);
            };

            // Process each selected field
            for (const field of selectedFields) {
                const value = resumeData[field] || (Array.isArray(resumeData[field]) ? [] : '');

                // Skip empty sections
                if (Array.isArray(value) && value.length === 0 && field !== 'Header' && field !== 'Objective') {
                    continue;
                }
                if (typeof value === 'string' && !value && field !== 'Header' && field !== 'Objective') {
                    continue;
                }

                switch (field) {
                    case 'Header':
                        const headerValue = value || {};
                        if (!headerValue.name && !headerValue.email && !headerValue.phone && !headerValue.location) {
                            continue;
                        }

                        // Center the name
                        pdf.setFont('helvetica', 'bold');
                        pdf.setFontSize(16);
                        const nameWidth = pdf.getTextWidth(headerValue.name || '');
                        const nameX = (8.5 - nameWidth) / 2;
                        pdf.text(headerValue.name || '', nameX, yPosition);
                        yPosition += 0.3;

                        // Contact information
                        pdf.setFont('helvetica', 'normal');
                        pdf.setFontSize(10);
                        const contactInfo = [];
                        if (headerValue.email) contactInfo.push(`Email: ${headerValue.email}`);
                        if (headerValue.phone) contactInfo.push(`Phone: ${headerValue.phone}`);
                        if (headerValue.location) contactInfo.push(headerValue.location);
                        if (headerValue.linkedin) contactInfo.push(`LinkedIn: ${headerValue.linkedin}`);
                        if (headerValue.github) contactInfo.push(`GitHub: ${headerValue.github}`);
                        if (headerValue.portfolio) contactInfo.push(`Portfolio: ${headerValue.portfolio}`);

                        const contactText = contactInfo.join(' • ');
                        const contactWidth = pdf.getTextWidth(contactText);
                        const contactX = (8.5 - contactWidth) / 2;
                        pdf.text(contactText, contactX, yPosition);
                        yPosition += 0.4;
                        break;

                    case 'Objective':
                        if (!value) continue;
                        addSectionHeader('Objective');
                        yPosition = addWrappedText(value, leftMargin, yPosition, rightMargin - leftMargin);
                        yPosition += sectionSpacing;
                        break;

                    case 'Education':
                        if (!Array.isArray(value) || value.length === 0) continue;
                        addSectionHeader('Education');
                        
                        for (const edu of value) {
                            pdf.setFont('helvetica', 'bold');
                            pdf.text(`${edu.degree}, ${edu.institution}`, leftMargin, yPosition);
                            pdf.setFont('helvetica', 'normal');
                            pdf.text(edu.year || '', rightMargin - 1, yPosition, { align: 'right' });
                            yPosition += lineHeight;
                            
                            if (edu.gpa) {
                                pdf.text(`GPA: ${edu.gpa}`, leftMargin, yPosition);
                                yPosition += lineHeight;
                            }
                            
                            if (Array.isArray(edu.description)) {
                                for (const desc of edu.description) {
                                    if (desc) {
                                        yPosition = addWrappedText(`• ${desc}`, leftMargin + 0.1, yPosition, rightMargin - leftMargin - 0.1);
                                    }
                                }
                            }
                            yPosition += 0.1;
                        }
                        yPosition += sectionSpacing;
                        break;

                    case 'Technical Skills':
                        if (!Array.isArray(value) || value.length === 0) continue;
                        addSectionHeader('Technical Skills');
                        
                        if (value.length > 0 && typeof value[0] === 'object' && 'category' in value[0]) {
                            // Categorized skills
                            for (const category of value) {
                                const skillText = `${category.category}: ${category.skills.join(', ')}`;
                                yPosition = addWrappedText(`• ${skillText}`, leftMargin, yPosition, rightMargin - leftMargin);
                            }
                        } else {
                            // Simple skills list
                            for (const skill of value) {
                                if (typeof skill === 'string') {
                                    yPosition = addWrappedText(`• ${skill}`, leftMargin, yPosition, rightMargin - leftMargin);
                                }
                            }
                        }
                        yPosition += sectionSpacing;
                        break;

                    case 'Projects':
                        if (!Array.isArray(value) || value.length === 0) continue;
                        addSectionHeader('Projects');
                        
                        for (const project of value) {
                            pdf.setFont('helvetica', 'bold');
                            pdf.text(project.title || '', leftMargin, yPosition);
                            yPosition += lineHeight;
                            
                            pdf.setFont('helvetica', 'normal');
                            if (Array.isArray(project.technologies) && project.technologies.length > 0) {
                                pdf.text(`Technologies: ${project.technologies.join(', ')}`, leftMargin, yPosition);
                                yPosition += lineHeight;
                            }
                            
                            if (Array.isArray(project.description)) {
                                for (const desc of project.description) {
                                    if (desc) {
                                        yPosition = addWrappedText(`• ${desc}`, leftMargin + 0.1, yPosition, rightMargin - leftMargin - 0.1);
                                    }
                                }
                            }
                            yPosition += 0.1;
                        }
                        yPosition += sectionSpacing;
                        break;

                    case 'Work Experience':
                        if (!Array.isArray(value) || value.length === 0) continue;
                        addSectionHeader('Work Experience');
                        
                        for (const exp of value) {
                            pdf.setFont('helvetica', 'bold');
                            pdf.text(`${exp.position}, ${exp.company}`, leftMargin, yPosition);
                            pdf.setFont('helvetica', 'normal');
                            pdf.text(exp.duration || '', rightMargin - 1, yPosition, { align: 'right' });
                            yPosition += lineHeight;
                            
                            if (Array.isArray(exp.description)) {
                                for (const desc of exp.description) {
                                    if (desc) {
                                        yPosition = addWrappedText(`• ${desc}`, leftMargin + 0.1, yPosition, rightMargin - leftMargin - 0.1);
                                    }
                                }
                            }
                            yPosition += 0.1;
                        }
                        yPosition += sectionSpacing;
                        break;

                    case 'Positions of Responsibility':
                        if (!Array.isArray(value) || value.length === 0) continue;
                        addSectionHeader('Positions of Responsibility');
                        
                        for (const pos of value) {
                            pdf.setFont('helvetica', 'bold');
                            pdf.text(`${pos.title}, ${pos.organization}`, leftMargin, yPosition);
                            pdf.setFont('helvetica', 'normal');
                            pdf.text(pos.duration || '', rightMargin - 1, yPosition, { align: 'right' });
                            yPosition += lineHeight;
                            
                            if (Array.isArray(pos.description)) {
                                for (const desc of pos.description) {
                                    if (desc) {
                                        yPosition = addWrappedText(`• ${desc}`, leftMargin + 0.1, yPosition, rightMargin - leftMargin - 0.1);
                                    }
                                }
                            }
                            yPosition += 0.1;
                        }
                        yPosition += sectionSpacing;
                        break;

                    case 'Certifications':
                        if (!Array.isArray(value) || value.length === 0) continue;
                        addSectionHeader('Certifications');
                        
                        for (const cert of value) {
                            pdf.setFont('helvetica', 'bold');
                            pdf.text(cert.name || '', leftMargin, yPosition);
                            pdf.setFont('helvetica', 'normal');
                            if (cert.date) {
                                pdf.text(cert.date, rightMargin - 1, yPosition, { align: 'right' });
                            }
                            yPosition += lineHeight;
                            
                            if (cert.issuer) {
                                pdf.text(`Issuer: ${cert.issuer}`, leftMargin, yPosition);
                                yPosition += lineHeight;
                            }
                            yPosition += 0.1;
                        }
                        yPosition += sectionSpacing;
                        break;

                    case 'Achievements':
                        if (!Array.isArray(value) || value.length === 0) continue;
                        addSectionHeader('Achievements');
                        
                        for (const achievement of value) {
                            if (achievement) {
                                yPosition = addWrappedText(`• ${achievement}`, leftMargin, yPosition, rightMargin - leftMargin);
                            }
                        }
                        yPosition += sectionSpacing;
                        break;

                    case 'Research/Publications':
                        if (!Array.isArray(value) || value.length === 0) continue;
                        addSectionHeader('Research & Publications');
                        
                        for (const pub of value) {
                            pdf.setFont('helvetica', 'bold');
                            pdf.text(pub.title || '', leftMargin, yPosition);
                            yPosition += lineHeight;
                            
                            pdf.setFont('helvetica', 'normal');
                            if (pub.authors) {
                                pdf.text(`Authors: ${pub.authors}`, leftMargin, yPosition);
                                yPosition += lineHeight;
                            }
                            if (pub.publication) {
                                pdf.text(`Publication: ${pub.publication}`, leftMargin, yPosition);
                                yPosition += lineHeight;
                            }
                            if (pub.date) {
                                pdf.text(`Date: ${pub.date}`, leftMargin, yPosition);
                                yPosition += lineHeight;
                            }
                            yPosition += 0.1;
                        }
                        yPosition += sectionSpacing;
                        break;

                    case 'Languages':
                        if (!Array.isArray(value) || value.length === 0) continue;
                        addSectionHeader('Languages');
                        
                        for (const lang of value) {
                            if (lang.language || lang.proficiency) {
                                const langText = lang.language && lang.proficiency 
                                    ? `${lang.language} (${lang.proficiency})`
                                    : lang.language || lang.proficiency;
                                yPosition = addWrappedText(`• ${langText}`, leftMargin, yPosition, rightMargin - leftMargin);
                            }
                        }
                        yPosition += sectionSpacing;
                        break;

                    case 'Hobbies':
                        if (!Array.isArray(value) || value.length === 0) continue;
                        addSectionHeader('Hobbies');
                        
                        for (const hobby of value) {
                            if (hobby) {
                                yPosition = addWrappedText(`• ${hobby}`, leftMargin, yPosition, rightMargin - leftMargin);
                            }
                        }
                        yPosition += sectionSpacing;
                        break;
                }

                // Check if we need a new page
                if (yPosition > 10) {
                    pdf.addPage();
                    yPosition = 0.5;
                }
            }

            // Save the PDF
            pdf.save('resume.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    // Separate header from other fields
    const headerField = selectedFields.find(field => field === 'Header');
    const otherFields = selectedFields.filter(field => field !== 'Header');

    const renderField = (field) => {
        const value = resumeData[field] || (Array.isArray(resumeData[field]) ? [] : '');

        if (Array.isArray(value) && value.length === 0 && field !== 'Header' && field !== 'Objective') {
            return null; // Don't render section if it's an array and empty
        }
        if (typeof value === 'string' && !value && field !== 'Header' && field !== 'Objective') {
             return null; // Don't render section if it's a string and empty
        }
         if (field === 'Header' && (!value || (!value.name && !value.email && !value.phone && !value.location && !value.linkedin && !value.github && !value.portfolio && !value.geeksforgeeks && !value.leetcode && !value.codechef && !value.codeforces))) {
            return null; // Don't render header if all fields are empty
        }
         if (field === 'Objective' && !value) {
            return null; // Don't render objective if empty
        }

        switch (field) {
            case 'Header':
                const headerValue = value || {
                    name: '',
                    email: '',
                    phone: '',
                    location: '',
                    linkedin: '',
                    github: '',
                    portfolio: '',
                    geeksforgeeks: '',
                    leetcode: '',
                    codechef: '',
                    codeforces: ''
                };
                 if (!headerValue.name && !headerValue.email && !headerValue.phone && !headerValue.location && !headerValue.linkedin && !headerValue.github && !headerValue.portfolio && !headerValue.geeksforgeeks && !headerValue.leetcode && !headerValue.codechef && !headerValue.codeforces) return null;

                return (
                    <div className="text-center mb-2">
                        <h1 className="text-xl font-bold mb-0">{headerValue.name}</h1>
                        <div className="text-gray-700 text-[0.65rem] flex flex-wrap gap-x-2 justify-center">
                            {headerValue.portfolio && <span>Portfolio: <a href={headerValue.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                            {headerValue.email && <span>• Email: {headerValue.email}</span>}
                            {headerValue.phone && <span>• Mobile: {headerValue.phone}</span>}
                            {headerValue.location && <span>• {headerValue.location}</span>}
                            {headerValue.linkedin && <span>• LinkedIn: <a href={headerValue.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                            {headerValue.github && <span>• GitHub: <a href={headerValue.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                            {headerValue.geeksforgeeks && <span>• GeeksForGeeks: <a href={headerValue.geeksforgeeks} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                            {headerValue.leetcode && <span>• LeetCode: <a href={headerValue.leetcode} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                            {headerValue.codechef && <span>• CodeChef: <a href={headerValue.codechef} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                            {headerValue.codeforces && <span>• Codeforces: <a href={headerValue.codeforces} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                        </div>
                    </div>
                );

            case 'Objective':
                return (
                    <div className="mb-2">
                        <h2 className="text-base font-bold border-b border-gray-400 pb-2 mb-1 uppercase">Objective</h2>
                        <p className="text-gray-700 text-xs mt-0.5">{value}</p>
                    </div>
                );

            case 'Education':
                return (
                    <div className="mb-2">
                        <h2 className="text-base font-bold border-b border-gray-400 pb-2 mb-1 uppercase">Education</h2>
                        {(value || []).map((edu, index) => (
                            <div key={index} className="mb-1 last:mb-0">
                                <div className="flex justify-between text-xs">
                                    <h3 className="font-semibold">{edu.degree}, {edu.institution}</h3>
                                    <span className="text-gray-600">{edu.year}</span>
                                </div>
                                {edu.gpa && <p className="text-gray-700 text-xs">GPA: {edu.gpa}</p>}
                                {(edu.description || []).length > 0 && (
                                    <div className="text-gray-700 text-xs mt-0.5">
                                        {(edu.description || []).map((desc, descIndex) => (
                                            desc && <div key={descIndex}><span style={{fontWeight: 'bold', marginRight: 4}}>•</span>{desc}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );

            case 'Technical Skills':
                if (!Array.isArray(value)) return null;
                
                // Check if skills are categorized
                if (value.length > 0 && typeof value[0] === 'object' && 'category' in value[0]) {
                    return (
                        <div className="mb-2">
                            <h2 className="text-base font-bold border-b border-gray-400 pb-2 mb-1 uppercase">Technical Skills</h2>
                            {value.map((category, index) => (
                                <div key={index} className="text-gray-700 text-xs mt-0.5">
                                    <span style={{fontWeight: 'bold', marginRight: 4}}>•</span>
                                    <span className="font-semibold">{category.category}:</span> {category.skills.join(', ')}
                                </div>
                            ))}
                        </div>
                    );
                }
                
                // Fallback for uncategorized skills
                return (
                    <div className="mb-2">
                        <h2 className="text-base font-bold border-b border-gray-400 pb-2 mb-1 uppercase">Technical Skills</h2>
                        {value.map((skill, index) => (
                            <div key={index} className="text-gray-700 text-xs mt-0.5">
                                <span style={{fontWeight: 'bold', marginRight: 4}}>•</span>{typeof skill === 'string' ? skill : ''}
                            </div>
                        ))}
                    </div>
                );

            case 'Projects':
                return (
                    <div className="mb-2">
                        <h2 className="text-base font-bold border-b border-gray-400 pb-2 mb-1 uppercase">Projects</h2>
                        {(value || []).map((project, index) => (
                            <div key={index} className="mb-1 last:mb-0">
                                <div className="flex justify-between items-start text-xs">
                                    <h3 className="font-semibold">{project.title}</h3>
                                    <div className="flex gap-0.5">
                                        {project.link && (
                                            <a
                                                href={project.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 text-xs"
                                            >
                                                Demo
                                            </a>
                                        )}
                                        {project.sourceCode && (
                                            <a
                                                href={project.sourceCode}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 text-xs"
                                            >
                                                Source
                                            </a>
                                        )}
                                    </div>
                                </div>
                                {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                                    <p className="text-gray-700 text-xs mt-0.5"><strong>Tech:</strong> {project.technologies.join(', ')}</p>
                                )}
                                {(project.description || []).length > 0 && (
                                    <div className="text-gray-700 text-xs mt-0.5">
                                        {(project.description || []).map((desc, descIndex) => (
                                            desc && <div key={descIndex}><span style={{fontWeight: 'bold', marginRight: 4}}>•</span>{desc}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );

            case 'Work Experience':
                return (
                    <div className="mb-2">
                        <h2 className="text-base font-bold border-b border-gray-400 pb-2 mb-1 uppercase">Work Experience</h2>
                        {(value || []).map((exp, index) => (
                            <div key={index} className="mb-1 last:mb-0">
                                <div className="flex justify-between text-xs">
                                    <h3 className="font-semibold">{exp.position}, {exp.company}</h3>
                                    <span className="text-gray-600">{exp.duration}</span>
                                </div>
                                {(exp.description || []).length > 0 && (
                                    <div className="text-gray-700 text-xs mt-0.5">
                                        {(exp.description || []).map((desc, descIndex) => (
                                            desc && <div key={descIndex}><span style={{fontWeight: 'bold', marginRight: 4}}>•</span>{desc}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );

            case 'Positions of Responsibility':
                return (
                    <div className="mb-2">
                        <h2 className="text-base font-bold border-b border-gray-400 pb-2 mb-1 uppercase">Positions of Responsibility</h2>
                        {(value || []).map((pos, index) => (
                            <div key={index} className="mb-1 last:mb-0">
                                <div className="flex justify-between text-xs">
                                    <h3 className="font-semibold">{pos.title}, {pos.organization}</h3>
                                    <span className="text-gray-600">{pos.duration}</span>
                                </div>
                                {(pos.description || []).length > 0 && (
                                    <div className="text-gray-700 text-xs mt-0.5">
                                        {(pos.description || []).map((desc, descIndex) => (
                                            desc && <div key={descIndex}><span style={{fontWeight: 'bold', marginRight: 4}}>•</span>{desc}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );

            case 'Certifications':
                return (
                    <div className="mb-2">
                        <h2 className="text-base font-bold border-b border-gray-400 pb-2 mb-1 uppercase">Certifications</h2>
                        {(value || []).map((cert, index) => (
                            <div key={index} className="mb-1 last:mb-0">
                                <div className="flex justify-between items-start text-xs">
                                    <h3 className="font-semibold">{cert.name}</h3>
                                    {cert.date && <span className="text-gray-600">{cert.date}</span>}
                                </div>
                                {cert.issuer && <p className="text-gray-700 text-xs">Issuer: {cert.issuer}</p>}
                                {cert.link && (
                                    <a
                                        href={cert.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 text-xs mt-0.5"
                                    >
                                        Verify
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                );

            case 'Achievements':
                if (Array.isArray(value) && value.length === 0) return null;
                return (
                    <div className="mb-2">
                        <h2 className="text-base font-bold border-b border-gray-400 pb-2 mb-1 uppercase">Achievements</h2>
                        <div className="text-gray-700 text-xs space-y-0" style={{ listStyleType: 'disc', listStylePosition: 'inside' }}>
                            {(value || []).map((item, index) => (
                                item && <div key={index}><span style={{fontWeight: 'bold', marginRight: 4}}>•</span>{item}</div>
                            ))}
                        </div>
                    </div>
                );

            case 'Research/Publications':
                return (
                    <div className="mb-2">
                        <h2 className="text-base font-bold border-b border-gray-400 pb-2 mb-1 uppercase">
                            Research & Publications
                        </h2>
                        {(value || []).map((pub, index) => (
                            <div key={index} className="mb-1 last:mb-0">
                                <div className="flex justify-between items-start text-xs">
                                    <div>
                                        <h3 className="font-semibold">{pub.title}</h3>
                                        {pub.authors && <p className="text-gray-700 text-xs">Authors: {pub.authors}</p>}
                                        {pub.publication && <p className="text-gray-700 text-xs">Publication: {pub.publication}</p>}
                                        {pub.date && <p className="text-gray-600 text-xs">Date: {pub.date}</p>}
                                    </div>
                                    {pub.link && (
                                        <a
                                            href={pub.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 text-xs ml-1"
                                        >
                                            View
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'Languages':
                if (Array.isArray(value) && value.length === 0) return null;
                return (
                    <div className="mb-2">
                        <h2 className="text-base font-bold border-b border-gray-400 pb-2 mb-1 uppercase">Languages</h2>
                        <div className="text-gray-700 text-xs space-y-0" style={{ listStyleType: 'disc', listStylePosition: 'inside' }}>
                            {(value || []).map((item, index) => (
                                (item.language || item.proficiency) && <div key={index}><span style={{fontWeight: 'bold', marginRight: 4}}>•</span>{item.language}{item.language && item.proficiency && ' '}({item.proficiency})</div>
                            ))}
                        </div>
                    </div>
                );

            case 'Hobbies':
                if (Array.isArray(value) && value.length === 0) return null;
                return (
                    <div className="mb-2">
                        <h2 className="text-base font-bold border-b border-gray-400 pb-2 mb-1 uppercase">Hobbies</h2>
                        <div className="text-gray-700 text-xs space-y-0" style={{ listStyleType: 'disc', listStylePosition: 'inside' }}>
                            {(value || []).map((item, index) => (
                                item && <div key={index}><span style={{fontWeight: 'bold', marginRight: 4}}>•</span>{item}</div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleDownload}
                className="absolute top-0 right-0 p-1 text-blue-600 hover:text-blue-800 z-10"
                title="Download PDF"
            >
                <FaDownload size={20} />
            </button>

            <div className="relative w-full overflow-x-auto">
                <div
                    ref={resumeRef}
                    className="bg-white shadow-lg mx-auto text-gray-900 leading-tight"
                    style={{ 
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '0.7rem',
                        width: '8.5in',
                        minHeight: '11in',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        position: 'relative',
                        backgroundColor: 'white',
                        padding: '0.2in',
                        overflowWrap: 'break-word',
                        wordWrap: 'break-word',
                        overflow: 'hidden'
                    }}
                >
                    {/* Render all selected fields in order */}
                    {selectedFields.map((field) => (
                        <div key={field} className="mb-2">{renderField(field)}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResumePreview; 
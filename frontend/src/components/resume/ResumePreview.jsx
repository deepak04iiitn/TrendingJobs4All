import React, { useRef } from 'react';
import { FaDownload } from 'react-icons/fa';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

const ResumePreview = ({ selectedFields = [], resumeData = {} }) => {
    const resumeRef = useRef(null);

    const handleDownload = async () => {
        const element = resumeRef.current;

        if (!element) {
            console.error("Resume element not found for PDF generation.");
            return;
        }

        try {
            // Create a clone of the element to avoid modifying the original
            const clone = element.cloneNode(true);
            document.body.appendChild(clone);
            clone.style.position = 'absolute';
            clone.style.left = '-9999px';
            clone.style.top = '0';
            clone.style.width = '8.5in'; // Letter width
            clone.style.height = 'auto';
            clone.style.padding = '0.5in';
            clone.style.backgroundColor = 'white';

            // Use html2canvas with better settings
            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            // Remove the clone
            document.body.removeChild(clone);

            // Calculate dimensions
            const imgWidth = 8.5; // Letter width in inches
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const margin = 0.5; // 0.5 inch margins

            // Create PDF
            const pdf = new jsPDF({
                unit: 'in',
                format: 'letter',
                orientation: imgHeight > 11 ? 'portrait' : 'portrait'
            });

            // Add the image to the PDF
            pdf.addImage(
                canvas.toDataURL('image/jpeg', 1.0),
                'JPEG',
                margin,
                margin,
                imgWidth - (2 * margin),
                imgHeight - (2 * margin)
            );

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
                        <div className="text-gray-700 text-xs flex flex-wrap justify-center gap-x-2">
                            {headerValue.portfolio && <span className="whitespace-nowrap">Portfolio: <a href={headerValue.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                            {headerValue.email && <span className="whitespace-nowrap">• Email: {headerValue.email}</span>}
                            {headerValue.phone && <span className="whitespace-nowrap">• Mobile: {headerValue.phone}</span>}
                            {headerValue.location && <span className="whitespace-nowrap">• {headerValue.location}</span>}
                            {headerValue.linkedin && <span className="whitespace-nowrap">• LinkedIn: <a href={headerValue.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                            {headerValue.github && <span className="whitespace-nowrap">• GitHub: <a href={headerValue.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                            {headerValue.geeksforgeeks && <span className="whitespace-nowrap">• GeeksForGeeks: <a href={headerValue.geeksforgeeks} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                            {headerValue.leetcode && <span className="whitespace-nowrap">• LeetCode: <a href={headerValue.leetcode} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                            {headerValue.codechef && <span className="whitespace-nowrap">• CodeChef: <a href={headerValue.codechef} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
                            {headerValue.codeforces && <span className="whitespace-nowrap">• Codeforces: <a href={headerValue.codeforces} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></span>}
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
                                     <ul className="list-disc list-inside text-gray-700 text-xs mt-0.5 space-y-0" style={{ listStyleType: 'disc' }}>
                                        {(edu.description || []).map((desc, descIndex) => (
                                            desc && <li key={descIndex}>{desc}</li>
                                        ))}
                                     </ul>
                                )}
                            </div>
                        ))}
                    </div>
                );

            case 'Technical Skills':
                if (Array.isArray(value) && value.length === 0) return null;
                return (
                    <div className="mb-2">
                        <h2 className="text-base font-bold border-b border-gray-400 pb-2 mb-1 uppercase">Technical Skills</h2>
                        <ul className="list-disc list-inside text-gray-700 text-xs space-y-0" style={{ listStyleType: 'disc' }}>
                            {(value || []).map((item, index) => (
                                item && <li key={index}>{item}</li>
                            ))}
                        </ul>
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
                                    <ul className="list-disc list-inside text-gray-700 text-xs mt-0.5 space-y-0" style={{ listStyleType: 'disc' }}>
                                        {(project.description || []).map((desc, descIndex) => (
                                            desc && <li key={descIndex}>{desc}</li>
                                        ))}
                                    </ul>
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
                                    <ul className="list-disc list-inside text-gray-700 text-xs mt-0.5 space-y-0" style={{ listStyleType: 'disc' }}>
                                        {(exp.description || []).map((desc, descIndex) => (
                                            desc && <li key={descIndex}>{desc}</li>
                                        ))}
                                    </ul>
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
                                    <ul className="list-disc list-inside text-gray-700 text-xs mt-0.5 space-y-0" style={{ listStyleType: 'disc' }}>
                                        {(pos.description || []).map((desc, descIndex) => (
                                            desc && <li key={descIndex}>{desc}</li>
                                        ))}
                                    </ul>
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
                        <ul className="list-disc list-inside text-gray-700 text-xs space-y-0" style={{ listStyleType: 'disc' }}>
                            {(value || []).map((item, index) => (
                                item && <li key={index}>{item}</li>
                            ))}
                        </ul>
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
                        <ul className="list-disc list-inside text-gray-700 text-xs space-y-0" style={{ listStyleType: 'disc' }}>
                            {(value || []).map((item, index) => (
                                (item.language || item.proficiency) && <li key={index}>{item.language}{item.language && item.proficiency && ' '}({item.proficiency})</li>
                            ))}
                        </ul>
                    </div>
                );

            case 'Hobbies':
                if (Array.isArray(value) && value.length === 0) return null;
                return (
                    <div className="mb-2">
                        <h2 className="text-base font-bold border-b border-gray-400 pb-2 mb-1 uppercase">Hobbies</h2>
                        <ul className="list-disc list-inside text-gray-700 text-xs space-y-0" style={{ listStyleType: 'disc' }}>
                            {(value || []).map((item, index) => (
                                item && <li key={index}>{item}</li>
                            ))}
                        </ul>
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

            <div
                ref={resumeRef}
                className="bg-white p-2 shadow-lg max-w-[8.5in] mx-auto text-gray-900 leading-tight"
                style={{ 
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '0.7rem'
                }}
            >
                {/* Render all selected fields in order */}
                {selectedFields.map((field) => (
                    <div key={field} className="mb-2">{renderField(field)}</div>
                ))}
            </div>
        </div>
    );
};

export default ResumePreview; 
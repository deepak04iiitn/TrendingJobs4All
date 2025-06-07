import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';

const ResumeForm = ({ selectedFields = [], resumeData = {}, onChange, onReset }) => {
    const renderFieldInput = (field) => {
        const value = resumeData[field] || (Array.isArray(resumeData[field]) ? [] : '');

        // Helper functions for managing array items and descriptions
        const handleArrayItemChange = (sectionField, itemIndex, key, newValue) => {
            const newItems = [...value];
            newItems[itemIndex] = { ...newItems[itemIndex], [key]: newValue };
            onChange(sectionField, newItems);
        };

        const addArrayItem = (sectionField, newItemStructure) => {
            onChange(sectionField, [...value, newItemStructure]);
        };

        const removeArrayItem = (sectionField, itemIndex) => {
            const newItems = value.filter((_, i) => i !== itemIndex);
            onChange(sectionField, newItems);
        };

        const handleDescriptionChange = (sectionField, itemIndex, descriptionIndex, newValue) => {
            const newItems = [...value];
            const descriptions = Array.isArray(newItems[itemIndex].description) ? [...newItems[itemIndex].description] : [];
            descriptions[descriptionIndex] = newValue;
            newItems[itemIndex] = { ...newItems[itemIndex], description: descriptions };
            onChange(sectionField, newItems);
        };

        const addDescription = (sectionField, itemIndex) => {
            const newItems = [...value];
            const descriptions = Array.isArray(newItems[itemIndex].description) ? [...newItems[itemIndex].description] : [];
            descriptions.push('');
            newItems[itemIndex] = { ...newItems[itemIndex], description: descriptions };
            onChange(sectionField, newItems);
        };

        const removeDescription = (sectionField, itemIndex, descriptionIndex) => {
            const newItems = [...value];
            const descriptions = Array.isArray(newItems[itemIndex].description) ? [...newItems[itemIndex].description] : [];
            const filteredDescriptions = descriptions.filter((_, i) => i !== descriptionIndex);
            newItems[itemIndex] = { ...newItems[itemIndex], description: filteredDescriptions };
            onChange(sectionField, newItems);
        };

        const handleSkillItemChange = (sectionField, itemIndex, newValue) => {
            const newItems = [...value];
            newItems[itemIndex] = newValue;
            onChange(sectionField, newItems);
        };

        const addSkillItem = (sectionField, newItemValue = '') => {
            onChange(sectionField, [...value, newItemValue]);
        };

        const removeSkillItem = (sectionField, itemIndex) => {
            const newItems = value.filter((_, i) => i !== itemIndex);
            onChange(sectionField, newItems);
        };

        const inputClasses = "w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200";
        const buttonClasses = "w-full p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white rounded-xl hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-200 flex items-center justify-center space-x-2";
        const removeButtonClasses = "p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-200";

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
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={headerValue.name || ''}
                            onChange={(e) => onChange(field, { ...headerValue, name: e.target.value })}
                            className={inputClasses}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={headerValue.email || ''}
                            onChange={(e) => onChange(field, { ...headerValue, email: e.target.value })}
                            className={inputClasses}
                        />
                        <input
                            type="tel"
                            placeholder="Phone"
                            value={headerValue.phone || ''}
                            onChange={(e) => onChange(field, { ...headerValue, phone: e.target.value })}
                            className={inputClasses}
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            value={headerValue.location || ''}
                            onChange={(e) => onChange(field, { ...headerValue, location: e.target.value })}
                            className={inputClasses}
                        />
                        <input
                            type="url"
                            placeholder="LinkedIn URL (optional)"
                            value={headerValue.linkedin || ''}
                            onChange={(e) => onChange(field, { ...headerValue, linkedin: e.target.value })}
                            className={inputClasses}
                        />
                        <input
                            type="url"
                            placeholder="GitHub URL (optional)"
                            value={headerValue.github || ''}
                            onChange={(e) => onChange(field, { ...headerValue, github: e.target.value })}
                            className={inputClasses}
                        />
                        <input
                            type="url"
                            placeholder="Portfolio URL (optional)"
                            value={headerValue.portfolio || ''}
                            onChange={(e) => onChange(field, { ...headerValue, portfolio: e.target.value })}
                            className={inputClasses}
                        />
                        <input
                            type="url"
                            placeholder="GeeksForGeeks URL (optional)"
                            value={headerValue.geeksforgeeks || ''}
                            onChange={(e) => onChange(field, { ...headerValue, geeksforgeeks: e.target.value })}
                            className={inputClasses}
                        />
                        <input
                            type="url"
                            placeholder="LeetCode URL (optional)"
                            value={headerValue.leetcode || ''}
                            onChange={(e) => onChange(field, { ...headerValue, leetcode: e.target.value })}
                            className={inputClasses}
                        />
                        <input
                            type="url"
                            placeholder="CodeChef URL (optional)"
                            value={headerValue.codechef || ''}
                            onChange={(e) => onChange(field, { ...headerValue, codechef: e.target.value })}
                            className={inputClasses}
                        />
                        <input
                            type="url"
                            placeholder="Codeforces URL (optional)"
                            value={headerValue.codeforces || ''}
                            onChange={(e) => onChange(field, { ...headerValue, codeforces: e.target.value })}
                            className={inputClasses}
                        />
                    </motion.div>
                );

            case 'Objective':
                return (
                    <motion.textarea
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        value={value || ''}
                        onChange={(e) => onChange(field, e.target.value)}
                        placeholder="Write a brief objective statement..."
                        className={`${inputClasses} h-32 resize-none`}
                    />
                );

            case 'Education':
            case 'Projects':
            case 'Work Experience':
            case 'Positions of Responsibility':
            case 'Research/Publications':
            case 'Certifications':
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {(value || []).map((item, itemIndex) => (
                            <motion.div
                                key={itemIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4"
                            >
                                {/* Field-specific inputs */}
                                {field === 'Education' && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Degree"
                                            value={item.degree || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'degree', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Institution"
                                            value={item.institution || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'institution', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Year"
                                                value={item.year || ''}
                                                onChange={(e) => handleArrayItemChange(field, itemIndex, 'year', e.target.value)}
                                                className={inputClasses}
                                            />
                                            <input
                                                type="text"
                                                placeholder="GPA/Score"
                                                value={item.gpa || ''}
                                                onChange={(e) => handleArrayItemChange(field, itemIndex, 'gpa', e.target.value)}
                                                className={inputClasses}
                                            />
                                        </div>
                                    </>
                                )}
                                {field === 'Projects' && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Project Title"
                                            value={item.title || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'title', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <input
                                            type="url"
                                            placeholder="Project Demo Link (optional)"
                                            value={item.link || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'link', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <input
                                            type="url"
                                            placeholder="Source Code Link (optional)"
                                            value={item.sourceCode || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'sourceCode', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-300">
                                                Technologies
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {Array.isArray(item.technologies) && item.technologies.map((tech, techIndex) => (
                                                    <div key={techIndex} className="flex items-center bg-white/10 rounded-xl px-3 py-1">
                                                        <span className="text-sm text-white">{tech}</span>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                const newTechs = [...item.technologies];
                                                                newTechs.splice(techIndex, 1);
                                                                handleArrayItemChange(field, itemIndex, 'technologies', newTechs);
                                                            }}
                                                            className="ml-2 text-gray-400 hover:text-white"
                                                        >
                                                            ×
                                                        </motion.button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Add technology"
                                                    className={inputClasses}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ',') {
                                                            e.preventDefault();
                                                            const input = e.target.value.trim();
                                                            if (input) {
                                                                const newTechs = [...(item.technologies || []), input];
                                                                handleArrayItemChange(field, itemIndex, 'technologies', newTechs);
                                                                e.target.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                {field === 'Work Experience' && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Company"
                                            value={item.company || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'company', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Position"
                                            value={item.position || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'position', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Duration (e.g., Jan 2020 - Dec 2021)"
                                            value={item.duration || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'duration', e.target.value)}
                                            className={inputClasses}
                                        />
                                    </>
                                )}
                                {field === 'Positions of Responsibility' && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            value={item.title || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'title', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Organization"
                                            value={item.organization || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'organization', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Duration"
                                            value={item.duration || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'duration', e.target.value)}
                                            className={inputClasses}
                                        />
                                    </>
                                )}
                                {field === 'Research/Publications' && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            value={item.title || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'title', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Authors"
                                            value={item.authors || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'authors', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Publication"
                                            value={item.publication || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'publication', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Date"
                                            value={item.date || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'date', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <input
                                            type="url"
                                            placeholder="Link (optional)"
                                            value={item.link || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'link', e.target.value)}
                                            className={inputClasses}
                                        />
                                    </>
                                )}
                                {field === 'Certifications' && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Certification Name"
                                            value={item.name || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'name', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Issuer"
                                            value={item.issuer || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'issuer', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Date"
                                            value={item.date || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'date', e.target.value)}
                                            className={inputClasses}
                                        />
                                        <input
                                            type="url"
                                            placeholder="Link (optional)"
                                            value={item.link || ''}
                                            onChange={(e) => handleArrayItemChange(field, itemIndex, 'link', e.target.value)}
                                            className={inputClasses}
                                        />
                                    </>
                                )}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-300">Description (Bullet Points)</label>
                                    {(item.description || []).map((desc, descIndex) => (
                                        <div key={descIndex} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder={`Bullet Point ${descIndex + 1}`}
                                                value={desc || ''}
                                                onChange={(e) => handleDescriptionChange(field, itemIndex, descIndex, e.target.value)}
                                                className={inputClasses}
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => removeDescription(field, itemIndex, descIndex)}
                                                className={removeButtonClasses}
                                            >
                                                Remove
                                            </motion.button>
                                        </div>
                                    ))}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => addDescription(field, itemIndex)}
                                        className={buttonClasses}
                                    >
                                        Add Description Bullet
                                    </motion.button>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => removeArrayItem(field, itemIndex)}
                                    className="w-full p-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-200"
                                >
                                    Remove {field.replace(/([A-Z])/g, ' $1').trim()} Entry
                                </motion.button>
                            </motion.div>
                        ))}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                let newItemStructure = {};
                                switch (field) {
                                    case 'Education':
                                        newItemStructure = { degree: '', institution: '', year: '', gpa: '', description: [] };
                                        break;
                                    case 'Projects':
                                        newItemStructure = { title: '', description: [], technologies: [], link: '', sourceCode: '' };
                                        break;
                                    case 'Work Experience':
                                        newItemStructure = { company: '', position: '', duration: '', description: [] };
                                        break;
                                    case 'Positions of Responsibility':
                                        newItemStructure = { title: '', organization: '', duration: '', description: [] };
                                        break;
                                    case 'Research/Publications':
                                        newItemStructure = { title: '', authors: '', publication: '', date: '', link: '' };
                                        break;
                                    case 'Certifications':
                                        newItemStructure = { name: '', issuer: '', date: '', link: '' };
                                        break;
                                }
                                addArrayItem(field, newItemStructure);
                            }}
                            className={buttonClasses}
                        >
                            Add {field.replace(/([A-Z])/g, ' $1').trim()} Entry
                        </motion.button>
                    </motion.div>
                );

            case 'Technical Skills':
            case 'Achievements':
            case 'Hobbies':
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {(value || []).map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    placeholder={field === 'Technical Skills' ? 'Skill' : field === 'Achievements' ? 'Achievement' : 'Hobby'}
                                    value={item || ''}
                                    onChange={(e) => handleSkillItemChange(field, index, e.target.value)}
                                    className={inputClasses}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => removeSkillItem(field, index)}
                                    className={removeButtonClasses}
                                >
                                    Remove
                                </motion.button>
                            </motion.div>
                        ))}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addSkillItem(field)}
                            className={buttonClasses}
                        >
                            Add {field === 'Technical Skills' ? 'Skill' : field === 'Achievements' ? 'Achievement' : 'Hobby'}
                        </motion.button>
                    </motion.div>
                );

            case 'Languages':
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {(value || []).map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    placeholder="Language"
                                    value={item.language || ''}
                                    onChange={(e) => {
                                        const newItems = [...value];
                                        newItems[index] = { ...newItems[index], language: e.target.value };
                                        onChange(field, newItems);
                                    }}
                                    className={inputClasses}
                                />
                                <select
                                    value={item.proficiency || ''}
                                    onChange={(e) => {
                                        const newItems = [...value];
                                        newItems[index] = { ...newItems[index], proficiency: e.target.value };
                                        onChange(field, newItems);
                                    }}
                                    className={inputClasses}
                                >
                                    <option value="">Select Proficiency</option>
                                    <option value="Native">Native</option>
                                    <option value="Fluent">Fluent</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Basic">Basic</option>
                                </select>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => removeSkillItem(field, index)}
                                    className={removeButtonClasses}
                                >
                                    Remove
                                </motion.button>
                            </motion.div>
                        ))}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addSkillItem(field, { language: '', proficiency: '' })}
                            className={buttonClasses}
                        >
                            Add Language
                        </motion.button>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-bold text-white flex items-center"
                >
                    <div className="relative mr-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-75"></div>
                        <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-xl">
                            <Save className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    Edit Resume
                </motion.h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onReset}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Change Fields</span>
                </motion.button>
            </div>

            <div className="space-y-8">
                {(selectedFields || []).map((field, index) => (
                    <motion.div
                        key={field}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-4"
                    >
                        <h3 className="text-xl font-semibold text-white">{field}</h3>
                        {renderFieldInput(field)}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ResumeForm; 
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import ResumeForm from '../components/resume/ResumeForm';
import ResumePreview from '../components/resume/ResumePreview';
import FieldSelection from '../components/resume/FieldSelection';
import Breadcrumb from '../components/Breadcrumb';
import RelatedLinks from '../components/RelatedLinks';
import { FileText, Edit2, Trash2, Plus, Briefcase, FileEdit, Crown, FileSignature, LayoutTemplate, Eye, Download, Rocket, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { FaDownload } from 'react-icons/fa';

const AVAILABLE_FIELDS = [
    'Header',
    'Objective',
    'Education',
    'Technical Skills',
    'Projects',
    'Work Experience',
    'Positions of Responsibility',
    'Certifications',
    'Achievements',
    'Research/Publications',
    'Languages',
    'Hobbies'
];

const ResumeBuilder = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [selectedFields, setSelectedFields] = useState([]);
    const [resumeData, setResumeData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showFieldSelection, setShowFieldSelection] = useState(true);
    const [savedResumes, setSavedResumes] = useState([]);
    const [activeResumeId, setActiveResumeId] = useState(null);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/backend/resume', {
                    withCredentials: true
                });
                console.log('Fetched resumes:', res.data);
                setSavedResumes(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error('Error fetching resumes:', error);
                setSavedResumes([]);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchResumes();
        }
    }, [currentUser]);

    const handleFieldSelection = async (fields) => {
        if (fields.length === 0) {
            toast.error('Please select fields for your resume');
            return;
        }

        if (!fields.includes('Header')) {
            toast.error('Header section is compulsory');
            return;
        }

        if (fields.length > 7) {
            toast.error('You can select a maximum of 7 fields');
            return;
        }

        setSelectedFields(fields);
        setShowFieldSelection(false);
        
        const initialData = {};
        fields.forEach(field => {
            switch (field) {
                case 'Header':
                    initialData[field] = {
                        name: '',
                        email: '',
                        phone: '',
                        location: '',
                        linkedin: '',
                        github: ''
                    };
                    break;
                case 'Education':
                case 'Projects':
                case 'Work Experience':
                case 'Positions of Responsibility':
                case 'Certifications':
                case 'Research/Publications':
                    initialData[field] = [];
                    break;
                case 'Technical Skills':
                case 'Achievements':
                case 'Hobbies':
                    initialData[field] = [];
                    break;
                case 'Languages':
                    initialData[field] = [];
                    break;
                default:
                    initialData[field] = '';
            }
        });

        setResumeData(initialData);

        try {
            const response = await axios.post('/backend/resume', {
                selectedFields: fields,
                resumeData: initialData
            }, {
                withCredentials: true
            });
            setActiveResumeId(response.data._id);
            setSavedResumes(prev => [...prev, response.data]);
        } catch (error) {
            console.error('Error saving initial resume data:', error);
            toast.error('Failed to save resume data');
        }
    };

    const handleFormChange = async (field, value) => {
        const newData = { ...resumeData, [field]: value };
        setResumeData(newData);

        try {
            await axios.put(`/backend/resume/${activeResumeId}`, {
                selectedFields,
                resumeData: newData
            }, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Error saving resume:', error);
            toast.error('Failed to save resume changes');
        }
    };

    const handleEditResume = async (resumeId) => {
        try {
            const res = await axios.get(`/backend/resume/${resumeId}`, {
                withCredentials: true
            });
            if (res.data) {
                setSelectedFields(res.data.selectedFields);
                setResumeData(res.data.resumeData);
                setActiveResumeId(resumeId);
                setShowFieldSelection(false);
            }
        } catch (error) {
            console.error('Error fetching resume:', error);
            toast.error('Failed to load resume');
        }
    };

    const handleDeleteResume = async (resumeId) => {
        try {
            await axios.delete(`/backend/resume/${resumeId}`, {
                withCredentials: true
            });
            setSavedResumes(prev => prev.filter(resume => resume._id !== resumeId));
            if (activeResumeId === resumeId) {
                setShowFieldSelection(true);
                setSelectedFields([]);
                setResumeData({});
                setActiveResumeId(null);
            }
            toast.success('Resume deleted successfully');
        } catch (error) {
            console.error('Error deleting resume:', error);
            toast.error('Failed to delete resume');
        }
    };

    // Server-side PDF download handler
    const handleServerPdfDownload = async () => {
        if (!activeResumeId) return;
        try {
            const response = await fetch(`/backend/resume/pdf/${activeResumeId}`, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'resume.pdf';
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                // handle error
                alert('Failed to download PDF.');
            }
        } catch (err) {
            alert('Error downloading PDF.');
        }
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex justify-center items-center relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
                </div>
                
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 text-center p-12 bg-white/90 backdrop-blur-xl rounded-3xl border-2 border-purple-200/50 shadow-2xl max-w-lg mx-4"
                >
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-lg opacity-20"></div>
                        <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-2xl shadow-lg">
                            <Crown className="w-12 h-12 text-white mx-auto" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Premium Resume Builder
                    </h1>
                    <p className="text-xl text-slate-600 mb-8">Please sign in to access your professional resume builder</p>
                    <div className="flex items-center justify-center space-x-2 text-purple-600">
                        <FileEdit className="w-5 h-5 animate-pulse" />
                        <span className="text-sm font-medium">Craft Your Perfect Resume</span>
                        <Award className="w-5 h-5 animate-pulse" />
                    </div>
                </motion.div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex justify-center items-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mt-6 text-lg text-purple-600 font-medium"
                    >
                        Loading your workspace...
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            {/* ✅ Helmet for SEO */}
            <Helmet>
                <title>Resume Builder | QA, SDET & Test Automation Professionals - Route2Hire</title>
                <meta
                    name="description"
                    content="Create professional resumes for QA, SDET, Test Automation, and Software Testing roles with Route2Hire's free resume builder. Download ATS-friendly templates and get expert tips for QA professionals."
                />
                <meta
                    name="keywords"
                    content="Resume builder, QA resume, SDET resume, Test Automation resume, Software Testing resume, Professional resume builder, ATS-friendly resume, QA career resume"
                />
                <meta property="og:title" content="Resume Builder | QA, SDET & Test Automation Professionals - Route2Hire" />
                <meta
                    property="og:description"
                    content="Build professional resumes for QA, SDET, and Test Automation roles. Free resume builder with ATS-friendly templates for software testing professionals."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://route2hire.com/resume-builder" />
                <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
                <link rel="canonical" href="https://route2hire.com/resume-builder" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
            {/* Modern Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
                <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full" style={{
                        backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}></div>
                </div>
            </div>

            <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumb Navigation */}
                    <div className="mb-6 mt-20">
                        <Breadcrumb 
                            items={[
                                { label: 'Resume Builder' }
                            ]}
                        />
                    </div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-purple-200 shadow-lg shadow-purple-100/50 mb-6 mt-20">
                            <Crown className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-semibold text-purple-700">Professional Resume Builder</span>
                        </div>
                        <div className="flex items-center justify-center space-x-4 mb-8">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-40 transition-opacity"></div>
                                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                                    <Crown className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
                                Resume Builder
                            </h1>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-40 transition-opacity"></div>
                                <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl shadow-lg">
                                    <FileSignature className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
                            Create professional resumes that stand out. Choose your sections, 
                            customize with precision, and generate documents that command attention.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <div className="flex items-center space-x-2 text-slate-700 group">
                                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors border border-blue-200">
                                    <LayoutTemplate className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium">Professional Templates</span>
                            </div>
                            <div className="w-px h-6 bg-slate-300"></div>
                            <div className="flex items-center space-x-2 text-slate-700 group">
                                <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors border border-purple-200">
                                    <Eye className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="text-sm font-medium">Live Preview</span>
                            </div>
                            <div className="w-px h-6 bg-slate-300"></div>
                            <div className="flex items-center space-x-2 text-slate-700 group">
                                <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors border border-emerald-200">
                                    <Download className="w-4 h-4 text-emerald-600" />
                                </div>
                                <span className="text-sm font-medium">Instant Download</span>
                            </div>
                        </div>
                    </motion.div>

                    {showFieldSelection ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            {/* Saved Resumes Section */}
                            <div className="order-1 lg:order-2">
                                {Array.isArray(savedResumes) && savedResumes.length > 0 ? (
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-slate-200 shadow-xl p-6 hover:shadow-2xl hover:border-blue-200 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                                <div className="relative mr-3">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-lg opacity-30"></div>
                                                    <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
                                                        <Briefcase className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                                Your Resumes
                                            </h2>
                                            <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium">
                                                {savedResumes.length} Resume{savedResumes.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {savedResumes.map((resume, index) => (
                                                <motion.div
                                                    key={resume._id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    whileHover={{ scale: 1.01, x: 2 }}
                                                    className="group bg-slate-50 rounded-xl p-4 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="font-semibold text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                                            {resume.resumeData.Header?.name || 'Untitled Resume'}
                                                        </h3>
                                                        <div className="flex space-x-1">
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleEditResume(resume._id)}
                                                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                                                            >
                                                                <FileEdit size={16} />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleDeleteResume(resume._id)}
                                                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                                                            >
                                                                <Trash2 size={16} />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center text-slate-600">
                                                            <FileText className="w-3 h-3 mr-2" />
                                                            {resume.selectedFields.length} sections
                                                        </div>
                                                        <div className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-full text-blue-700 text-xs font-medium">
                                                            Premium
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-slate-200 shadow-xl p-8 text-center"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.3, type: "spring" }}
                                            className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6 border-2 border-blue-200"
                                        >
                                            <FileText className="w-8 h-8 text-blue-600" />
                                        </motion.div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Your Portfolio</h2>
                                        <p className="text-slate-600 mb-6">No resumes created yet. Start building your first professional resume.</p>
                                        <div className="flex items-center justify-center space-x-2 text-blue-600">
                                            <Rocket className="w-4 h-4 animate-pulse" />
                                            <span className="text-sm font-medium">Ready to get started?</span>
                                            <Rocket className="w-4 h-4 animate-pulse" />
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Field Selection Section */}
                            <div className="order-2 lg:order-1">
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-slate-200 shadow-xl p-6 hover:shadow-2xl hover:border-purple-200 transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                            <div className="relative mr-3">
                                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl blur-lg opacity-30"></div>
                                                <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-xl shadow-lg">
                                                    <Plus className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                            Create New Resume
                                        </h2>
                                    </div>
                                    <FieldSelection
                                        availableFields={AVAILABLE_FIELDS}
                                        onSelect={handleFieldSelection}
                                    />
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            <motion.div
                                whileHover={{ y: -1 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-slate-200 shadow-xl p-6 hover:shadow-2xl hover:border-purple-200 transition-all duration-300"
                            >
                                <ResumeForm
                                    selectedFields={selectedFields}
                                    resumeData={resumeData}
                                    onChange={handleFormChange}
                                    onReset={() => setShowFieldSelection(true)}
                                />
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -1 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-slate-200 shadow-xl p-6 hover:shadow-2xl hover:border-blue-200 transition-all duration-300"
                            >
                                <ResumePreview
                                    selectedFields={selectedFields}
                                    resumeData={resumeData}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                    
                    {/* Related Links Section */}
                    <div className="mt-12">
                        <RelatedLinks type="general" />
                    </div>
                </div>
            </div>
            </div>
        </>
    );
};

export default ResumeBuilder;
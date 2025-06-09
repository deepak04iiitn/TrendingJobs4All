import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import ResumeForm from '../components/resume/ResumeForm';
import ResumePreview from '../components/resume/ResumePreview';
import FieldSelection from '../components/resume/FieldSelection';
import { FileText, Edit2, Trash2, Plus, Briefcase, FileEdit, Sparkles, Crown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

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

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex justify-center items-center relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>
                
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 text-center p-12 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl max-w-lg mx-4"
                >
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-75"></div>
                        <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-2xl">
                            <Crown className="w-12 h-12 text-white mx-auto" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                        Premium Resume Builder
                    </h1>
                    <p className="text-xl text-gray-300 mb-8">Please sign in to access your professional resume builder</p>
                    <div className="flex items-center justify-center space-x-2 text-purple-300">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        <span className="text-sm">Craft Your Perfect Resume</span>
                        <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                </motion.div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex justify-center items-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-purple-500/30 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mt-6 text-lg text-purple-300 font-medium"
                    >
                        Loading your workspace...
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
            {/* Premium Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/3 to-blue-500/3 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 mt-16">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center mb-16"
                    >
                        <div className="flex items-center justify-center space-x-3 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-75"></div>
                                <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-xl">
                                    <Crown className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-6xl font-black bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                                Resume Builder
                            </h1>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-75"></div>
                                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
                                    <Zap className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Craft exceptional resumes with our premium builder. Choose your sections, 
                            customize with precision, and create documents that command attention.
                        </p>
                        <div className="flex items-center justify-center space-x-4 mt-6">
                            <div className="flex items-center space-x-2 text-purple-300">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-medium">Professional Templates</span>
                            </div>
                            <div className="w-px h-4 bg-gray-600"></div>
                            <div className="flex items-center space-x-2 text-blue-300">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-medium">Real-time Preview</span>
                            </div>
                            <div className="w-px h-4 bg-gray-600"></div>
                            <div className="flex items-center space-x-2 text-purple-300">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-medium">Instant Download</span>
                            </div>
                        </div>
                    </motion.div>

                    {showFieldSelection ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            {/* Saved Resumes Section */}
                            <div className="order-1 lg:order-2">
                                {Array.isArray(savedResumes) && savedResumes.length > 0 ? (
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 hover:shadow-purple-500/10"
                                    >
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-3xl font-bold text-white flex items-center">
                                                <div className="relative mr-4">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-75"></div>
                                                    <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-xl">
                                                        <Briefcase className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                                Your Resumes
                                            </h2>
                                            <div className="text-purple-300 font-medium">
                                                {savedResumes.length} Resume{savedResumes.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {savedResumes.map((resume, index) => (
                                                <motion.div
                                                    key={resume._id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    whileHover={{ scale: 1.02, x: 5 }}
                                                    className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors truncate">
                                                            {resume.resumeData.Header?.name || 'Untitled Resume'}
                                                        </h3>
                                                        <div className="flex space-x-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleEditResume(resume._id)}
                                                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-xl transition-all duration-200"
                                                            >
                                                                <FileEdit size={20} />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleDeleteResume(resume._id)}
                                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-200"
                                                            >
                                                                <Trash2 size={20} />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center text-gray-400">
                                                            <FileText className="w-4 h-4 mr-2" />
                                                            {resume.selectedFields.length} sections
                                                        </div>
                                                        <div className="text-purple-300 font-medium">
                                                            Premium
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-12 text-center"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.3, type: "spring" }}
                                            className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                                        >
                                            <FileText className="w-10 h-10 text-purple-300" />
                                        </motion.div>
                                        <h2 className="text-3xl font-bold text-white mb-4">Your Portfolio</h2>
                                        <p className="text-gray-300 mb-8 text-lg">No resumes created yet. Start building your first professional resume.</p>
                                        <div className="flex items-center justify-center space-x-2 text-purple-300">
                                            <Sparkles className="w-5 h-5 animate-pulse" />
                                            <span className="font-medium">Ready to get started?</span>
                                            <Sparkles className="w-5 h-5 animate-pulse" />
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Field Selection Section */}
                            <div className="order-2 lg:order-1">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 hover:shadow-blue-500/10"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-3xl font-bold text-white flex items-center">
                                            <div className="relative mr-4">
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-75"></div>
                                                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl">
                                                    <Plus className="w-6 h-6 text-white" />
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
                            transition={{ duration: 0.8 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            <motion.div
                                whileHover={{ y: -3 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 hover:shadow-purple-500/10"
                            >
                                <ResumeForm
                                    selectedFields={selectedFields}
                                    resumeData={resumeData}
                                    onChange={handleFormChange}
                                    onReset={() => setShowFieldSelection(true)}
                                />
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -3 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 hover:shadow-blue-500/10"
                            >
                                <ResumePreview
                                    selectedFields={selectedFields}
                                    resumeData={resumeData}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;
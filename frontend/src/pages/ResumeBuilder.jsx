import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import ResumeForm from '../components/resume/ResumeForm';
import ResumePreview from '../components/resume/ResumePreview';
import FieldSelection from '../components/resume/FieldSelection';

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

    useEffect(() => {
        const fetchResume = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/resume', {
                    withCredentials: true
                });
                if (res.data) {
                    setSelectedFields(res.data.selectedFields || []);
                    setResumeData(res.data.resumeData || {});
                    setShowFieldSelection(false);
                }
            } catch (error) {
                console.error('Error fetching resume:', error);
                // If there's an error or no resume exists, show field selection
                setShowFieldSelection(true);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchResume();
        }
    }, [currentUser]);

    const handleFieldSelection = async (fields) => {
        if (fields.length === 0) {
            toast.error('Please select fields for your resume');
            return;
        }

        // Ensure Header is always included
        if (!fields.includes('Header')) {
            toast.error('Header section is compulsory');
            return;
        }

        // Allow selecting up to 7 fields
        if (fields.length > 7) {
            toast.error('You can select a maximum of 7 fields');
            return;
        }

        setSelectedFields(fields);
        setShowFieldSelection(false);
        
        // Initialize empty data structure for selected fields
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
            await axios.post('/api/resume', {
                selectedFields: fields,
                resumeData: initialData
            }, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Error saving initial resume data:', error);
            toast.error('Failed to save resume data');
        }
    };

    const handleFormChange = async (field, value) => {
        const newData = { ...resumeData, [field]: value };
        setResumeData(newData);

        try {
            await axios.post('/api/resume', {
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

    if (!currentUser) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-xl">Please sign in to access the Resume Builder</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Resume Builder
                </h1>

                {showFieldSelection ? (
                    <FieldSelection
                        availableFields={AVAILABLE_FIELDS}
                        onSelect={handleFieldSelection}
                    />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <ResumeForm
                                selectedFields={selectedFields}
                                resumeData={resumeData}
                                onChange={handleFormChange}
                                onReset={() => setShowFieldSelection(true)}
                            />
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <ResumePreview
                                selectedFields={selectedFields}
                                resumeData={resumeData}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeBuilder;

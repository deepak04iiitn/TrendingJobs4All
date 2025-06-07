import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, 
    Circle, 
    User, 
    Target, 
    GraduationCap, 
    Code, 
    FolderOpen, 
    Briefcase, 
    Award, 
    Trophy, 
    BookOpen, 
    Globe, 
    Heart, 
    Crown,
    Sparkles,
    ArrowRight
} from 'lucide-react';

const FIELD_ICONS = {
    'Header': User,
    'Objective': Target,
    'Education': GraduationCap,
    'Technical Skills': Code,
    'Projects': FolderOpen,
    'Work Experience': Briefcase,
    'Positions of Responsibility': Award,
    'Certifications': Trophy,
    'Achievements': Trophy,
    'Research/Publications': BookOpen,
    'Languages': Globe,
    'Hobbies': Heart
};

const FieldSelection = ({ availableFields, onSelect }) => {
    const [selectedFields, setSelectedFields] = useState([]);

    const handleFieldToggle = (field) => {
        if (field === 'Header' && selectedFields.includes('Header') && selectedFields.length === 1) {
            return;
        }

        setSelectedFields(prev => {
            if (prev.includes(field)) {
                return prev.filter(f => f !== field);
            }
            if (prev.length < 7) {
                return [...prev, field];
            }
            return prev;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedFields.includes('Header') && selectedFields.length >= 1 && selectedFields.length <= 7) {
            onSelect(selectedFields);
        } else if (!selectedFields.includes('Header')) {
            // Using a more elegant notification instead of alert
            console.warn('Header section is compulsory.');
        } else if (selectedFields.length === 0) {
            console.warn('Please select fields for your resume.');
        } else if (selectedFields.length > 7) {
            console.warn('You can select a maximum of 7 fields.');
        }
    };

    const isSubmitDisabled = !selectedFields.includes('Header') || selectedFields.length === 0 || selectedFields.length > 7;

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
            >
                
                <p className="text-gray-300 leading-relaxed">
                    Select up to 7 sections to include in your professional resume. 
                    The Header section is mandatory and contains your contact information.
                </p>
                
                <div className="flex items-center justify-between mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full ${selectedFields.length > 0 ? 'bg-purple-500' : 'bg-gray-600'} transition-colors`}></div>
                            <span className="text-white font-medium">
                                {selectedFields.length}/7 sections selected
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-purple-300">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Premium Builder</span>
                    </div>
                </div>
            </motion.div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {availableFields.map((field, index) => {
                        const Icon = FIELD_ICONS[field] || Circle;
                        const isSelected = selectedFields.includes(field);
                        const isMandatory = field === 'Header';
                        const isDisabled = !isSelected && selectedFields.length >= 7;
                        
                        return (
                            <motion.div
                                key={field}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.4 }}
                                whileHover={{ scale: isDisabled ? 1 : 1.02, y: isDisabled ? 0 : -2 }}
                                whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                                onClick={() => !isDisabled && handleFieldToggle(field)}
                                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${
                                    isSelected
                                        ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/20 to-blue-500/10 shadow-lg shadow-purple-500/20'
                                        : isDisabled
                                        ? 'border-gray-600/30 bg-gray-800/20 cursor-not-allowed opacity-50'
                                        : 'border-white/20 bg-white/5 hover:border-purple-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-purple-500/10'
                                }`}
                            >
                                {/* Gradient border effect for selected items */}
                                {isSelected && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-sm"></div>
                                )}
                                
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-2 rounded-xl transition-all duration-300 ${
                                            isSelected 
                                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg' 
                                                : isDisabled
                                                ? 'bg-gray-700'
                                                : 'bg-white/10 group-hover:bg-white/20'
                                        }`}>
                                            <Icon className={`w-5 h-5 ${
                                                isSelected || isDisabled ? 'text-white' : 'text-purple-300 group-hover:text-white'
                                            } transition-colors`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`font-semibold ${
                                                    isSelected ? 'text-white' : 'text-gray-300'
                                                } transition-colors`}>
                                                    {field}
                                                </span>
                                                {isMandatory && (
                                                    <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full">
                                                        Required
                                                    </span>
                                                )}
                                            </div>
                                            {isMandatory && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Contains your contact information
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        {isSelected ? (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            >
                                                <CheckCircle2 className="w-6 h-6 text-purple-400" />
                                            </motion.div>
                                        ) : (
                                            <Circle className={`w-6 h-6 ${
                                                isDisabled ? 'text-gray-600' : 'text-gray-400 group-hover:text-purple-400'
                                            } transition-colors`} />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="flex items-center justify-between"
                >
                    <div className="text-gray-400">
                        {!selectedFields.includes('Header') && (
                            <p className="text-red-400 font-medium flex items-center">
                                <Circle className="w-4 h-4 mr-2" />
                                Header section is required
                            </p>
                        )}
                        {selectedFields.length > 7 && (
                            <p className="text-red-400 font-medium flex items-center">
                                <Circle className="w-4 h-4 mr-2" />
                                Maximum 7 sections allowed
                            </p>
                        )}
                        {selectedFields.includes('Header') && selectedFields.length <= 7 && selectedFields.length > 0 && (
                            <p className="text-green-400 font-medium flex items-center">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Ready to build your resume
                            </p>
                        )}
                    </div>
                    
                    <motion.button
                        type="submit"
                        disabled={isSubmitDisabled}
                        whileHover={!isSubmitDisabled ? { scale: 1.05, y: -2 } : {}}
                        whileTap={!isSubmitDisabled ? { scale: 0.95 } : {}}
                        className={`relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center space-x-3 ${
                            !isSubmitDisabled
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {!isSubmitDisabled && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-50"></div>
                        )}
                        <span className="relative">Start Building</span>
                        <ArrowRight className="w-5 h-5 relative" />
                    </motion.button>
                </motion.div>
            </form>

            {/* Progress indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-300">Selection Progress</span>
                    <span className="text-sm font-bold text-purple-300">{selectedFields.length}/7</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(selectedFields.length / 7) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    ></motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default FieldSelection;
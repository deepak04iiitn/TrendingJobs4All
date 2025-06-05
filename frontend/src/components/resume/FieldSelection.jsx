import React, { useState } from 'react';

const FieldSelection = ({ availableFields, onSelect }) => {
    const [selectedFields, setSelectedFields] = useState([]);

    const handleFieldToggle = (field) => {
        if (field === 'Header' && selectedFields.includes('Header') && selectedFields.length === 1) {
            return;
        }
        if (field === 'Header' && selectedFields.includes('Header') && selectedFields.length > 1 && selectedFields.length <= 7) {
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
            alert('Header section is compulsory.');
        } else if (selectedFields.length === 0) {
            alert('Please select fields for your resume.');
        } else if (selectedFields.length > 7) {
            alert('You can select a maximum of 7 fields.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Select Fields for Your Resume (Up to 7)
                </h2>
                <p className="text-gray-600 mb-6">
                    Choose the fields you want to include in your resume (maximum 7).
                     The Header section is compulsory.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {availableFields.map((field) => (
                            <div
                                key={field}
                                onClick={() => handleFieldToggle(field)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors
                                    ${selectedFields.includes(field)
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedFields.includes(field)}
                                        onChange={() => {}}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-3 block text-sm font-medium text-gray-700">
                                        {field} {field === 'Header' && '(Mandatory)'}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Selected: {selectedFields.length}/7 fields
                        </p>
                        <button
                            type="submit"
                            disabled={!selectedFields.includes('Header') || selectedFields.length === 0 || selectedFields.length > 7}
                            className={`px-4 py-2 rounded-md text-white font-medium
                                ${selectedFields.includes('Header') && selectedFields.length >= 1 && selectedFields.length <= 7
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Continue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FieldSelection; 
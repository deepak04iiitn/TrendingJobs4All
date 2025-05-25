import React, { useState } from 'react';
import { X, Plus, Minus, Sparkles, Vote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreatePollModal = ({ onClose }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const navigate = useNavigate();

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    try {
      // Simulate API call since we can't use axios in this environment
      await axios.post('/backend/polls', { question, options });
      
      onClose();
      navigate('/publicpolls');
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg relative">
        {/* Floating orbs for visual enhancement */}
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-pink-400/20 to-violet-600/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 pointer-events-none"></div>
          
          {/* Header */}
          <div className="relative p-8 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Vote className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Create Poll
                  </h2>
                  <p className="text-gray-300 text-sm">Gather opinions from your community</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 group"
              >
                <X className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="relative px-8 pb-8 space-y-6">
            {/* Question Input */}
            <div className="space-y-3">
              <label className="text-gray-200 text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Poll Question
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="What would you like to ask your audience?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full h-14 px-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl 
                           focus:border-blue-400/50 focus:bg-white/15 focus:outline-none 
                           transition-all duration-300 text-white placeholder-gray-400
                           hover:bg-white/12 group-hover:border-white/30"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="text-gray-200 text-sm font-medium">
                Poll Options
              </label>
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 group animate-in slide-in-from-left duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="w-full h-12 px-4 pl-10 bg-white/8 backdrop-blur-sm border border-white/15 rounded-xl 
                                 focus:border-blue-400/50 focus:bg-white/12 focus:outline-none 
                                 transition-all duration-300 text-white placeholder-gray-400
                                 hover:bg-white/10"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-60"></div>
                    </div>
                    {index > 1 && (
                      <button
                        onClick={() => handleRemoveOption(index)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 
                                 text-red-300 hover:text-red-200 rounded-xl transition-all duration-300 flex-shrink-0"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Option Button */}
              <button
                onClick={handleAddOption}
                className="w-full h-12 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 hover:border-white/40 
                         text-gray-300 hover:text-white rounded-xl transition-all duration-300 
                         flex items-center justify-center gap-2 group"
              >
                <div className="p-1 bg-white/10 group-hover:bg-white/20 rounded-lg transition-colors duration-300">
                  <Plus className="w-4 h-4" />
                </div>
                Add Another Option
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="relative p-8 pt-4">
            <button
              onClick={handleSubmit}
              disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2}
              className="w-full h-14 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 
                       hover:from-blue-600 hover:via-purple-700 hover:to-pink-600
                       disabled:from-gray-600 disabled:via-gray-700 disabled:to-gray-800
                       disabled:cursor-not-allowed disabled:opacity-50
                       text-white rounded-2xl shadow-xl 
                       transition-all duration-300 font-semibold text-lg
                       hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]
                       relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-2">
                <Vote className="w-5 h-5" />
                Create Poll
              </div>
            </button>
            <p className="text-gray-400 text-xs text-center mt-3">
              Your poll will be visible to all community members
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: animate-in 0.3s ease-out forwards;
        }
        
        .slide-in-from-left {
          animation: slide-in-from-left 0.3s ease-out forwards;
        }
        
        @keyframes slide-in-from-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CreatePollModal;
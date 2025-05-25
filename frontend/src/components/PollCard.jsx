import React, { useState, useMemo } from 'react';

const PollCard = ({ poll, onDelete }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState(null);
  const [votedPoll, setVotedPoll] = useState(poll);

  if (!votedPoll || !votedPoll.question || !Array.isArray(votedPoll.options) || votedPoll.options.length === 0) {
    return null;
  }

  const handleVote = async () => {
    if (selectedOption === null) return;
    setIsVoting(true);
    setError(null);
    try {
      const response = await fetch(`/backend/polls/${votedPoll._id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ option: selectedOption }),
      });
      const data = await response.json();
      setVotedPoll(data);
    } catch (error) {
      console.error('Error voting:', error);
      setError('Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const calculateVoteStats = () => {
    const totalVotes = votedPoll.votes.length;
    return votedPoll.options.map((option, index) => {
      const optionVotes = votedPoll.votes.filter(vote => vote.option === index).length;
      const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
      return {
        votes: optionVotes,
        percentage: percentage.toFixed(1)
      };
    });
  };

  const voteStats = calculateVoteStats();
  
  const optionCount = votedPoll.options.length;
  const isCompactMode = optionCount > 4;
  const maxHeight = useMemo(() => {
    // Calculate height to show at least 2 options before scrolling
    const baseOptionHeight = isCompactMode ? 140 : 160; // Approximate height per option
    const minHeight = baseOptionHeight * 2; // Height for 2 options
    
    if (optionCount <= 2) return 'none'; // No max height needed
    if (optionCount <= 3) return `${minHeight + 80}px`; // Show 2.5 options
    if (optionCount <= 4) return `${minHeight + 120}px`; // Show 2.8 options
    if (optionCount <= 6) return `${minHeight + 60}px`; // Show 2.4 options
    return `${minHeight + 100}px`; // Show 2.6 options for many options
  }, [optionCount, isCompactMode]);

  return (
    <div className="w-full h-full animate-fade-in">
      <div className="group relative bg-gradient-to-br from-white via-slate-50/80 to-white backdrop-blur-xl rounded-[2rem] p-10 shadow-[0_8px_60px_-12px_rgba(0,0,0,0.12)] hover:shadow-[0_25px_80px_-12px_rgba(0,0,0,0.25)] transition-all duration-700 border border-white/80 h-full flex flex-col overflow-hidden hover:scale-[1.01] hover:-translate-y-1">
        
        {/* Premium gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5 rounded-[2rem]" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-violet-400/15 via-indigo-400/10 to-purple-400/15 rounded-full blur-3xl opacity-70 group-hover:opacity-90 transition-all duration-700 animate-pulse-slow" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-rose-400/12 via-orange-400/8 to-pink-400/12 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-all duration-700" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-r from-emerald-400/8 to-teal-400/8 rounded-full blur-2xl opacity-50 animate-float" />
        
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/10 rounded-[2rem] opacity-60" />
        
        <div className="relative h-full flex flex-col z-10">
          {/* Premium Question Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <h5 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent leading-tight pr-4 animate-slide-up">
                {votedPoll.question}
              </h5>
              {optionCount > 4 && (
                <div className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100/80 to-indigo-100/80 rounded-full border border-violet-200/50 animate-fade-in-delay">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent">
                    {optionCount} choices
                  </span>
                </div>
              )}
            </div>
            
            <div className="relative">
              <div className="w-16 h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 rounded-full animate-expand-width" />
              <div className="absolute top-0 left-0 w-16 h-1.5 bg-gradient-to-r from-white/60 to-transparent rounded-full animate-shimmer" />
            </div>
          </div>
          
          {/* Premium Options Container */}
          <div className="flex-1 flex flex-col min-h-0">
            <div 
              className={`space-y-${isCompactMode ? '3' : '4'} flex-1 premium-scrollbar overflow-y-auto pr-3`}
              style={{ maxHeight: maxHeight === 'none' ? undefined : maxHeight }}
            >
              {votedPoll.options.map((option, index) => (
                <div
                  key={index}
                  className="relative animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <label 
                    className="block cursor-pointer group/option"
                    htmlFor={`option-${votedPoll._id}-${index}`}
                  >
                    <div className={`relative ${isCompactMode ? 'p-5' : 'p-6'} rounded-2xl border-2 transition-all duration-500 backdrop-blur-sm overflow-hidden group-hover/option:scale-[1.02] ${
                      selectedOption === index 
                        ? 'border-violet-300/70 bg-gradient-to-br from-violet-50/90 via-indigo-50/80 to-purple-50/90 shadow-lg shadow-violet-200/40 scale-[1.02]' 
                        : 'border-slate-200/60 bg-gradient-to-br from-white/60 to-slate-50/40 hover:border-violet-200/70 hover:bg-gradient-to-br hover:from-violet-50/60 hover:to-indigo-50/60 hover:shadow-md hover:shadow-violet-100/30'
                    }`}>
                      
                      {/* Premium glow effect */}
                      {selectedOption === index && (
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-400/10 via-indigo-400/10 to-purple-400/10 rounded-2xl animate-pulse" />
                      )}
                      
                      {/* Selection indicator and option text */}
                      <div className={`flex items-start ${isCompactMode ? 'mb-4' : 'mb-5'} relative z-10`}>
                        <div className={`relative ${isCompactMode ? 'w-5 h-5 mt-0.5' : 'w-6 h-6'} rounded-full border-3 ${isCompactMode ? 'mr-4' : 'mr-5'} flex-shrink-0 flex items-center justify-center transition-all duration-500 shadow-sm ${
                          selectedOption === index 
                            ? 'border-violet-500 bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-violet-300/40' 
                            : 'border-slate-300 bg-white/80 group-hover/option:border-violet-400 group-hover/option:shadow-md group-hover/option:shadow-violet-200/30'
                        }`}>
                          {selectedOption === index && (
                            <div className={`${isCompactMode ? 'w-2 h-2' : 'w-2.5 h-2.5'} bg-white rounded-full animate-scale-in shadow-sm`} />
                          )}
                        </div>
                        <span className={`text-slate-800 font-bold ${isCompactMode ? 'text-base' : 'text-lg'} leading-tight flex-1 break-words`}>
                          {option}
                        </span>
                      </div>
                      
                      {/* Premium vote statistics */}
                      <div className={`space-y-${isCompactMode ? '3' : '4'} ${isCompactMode ? 'ml-9' : 'ml-11'} relative z-10`}>
                        <div className="relative">
                          <div className={`${isCompactMode ? 'h-2.5' : 'h-3'} w-full bg-slate-200/70 rounded-full overflow-hidden shadow-inner`}>
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 rounded-full relative overflow-hidden shadow-sm animate-expand-bar"
                              style={{ 
                                width: `${voteStats[index].percentage}%`,
                                animationDelay: `${500 + index * 100}ms`
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-bar" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className={`${isCompactMode ? 'text-sm' : 'text-base'} font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-fade-in`}>
                            {voteStats[index].percentage}%
                          </span>
                          <span className={`${isCompactMode ? 'text-sm' : 'text-base'} text-slate-600 font-semibold animate-fade-in`}>
                            {voteStats[index].votes} {voteStats[index].votes === 1 ? 'vote' : 'votes'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      id={`option-${votedPoll._id}-${index}`}
                      name={`poll-${votedPoll._id}`}
                      value={index}
                      checked={selectedOption === index}
                      onChange={() => setSelectedOption(index)}
                      className="hidden"
                    />
                  </label>
                </div>
              ))}
            </div>
            
            {/* Premium scroll indicator */}
            {optionCount > 6 && (
              <div className="mt-4 flex justify-center animate-fade-in">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-slate-100/80 to-slate-200/60 rounded-full border border-slate-200/50 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
          
          {/* Premium Action Buttons */}
          <div className={`${optionCount > 4 ? 'mt-6' : 'mt-8'} space-y-4 animate-slide-up`}>
            <div className="flex gap-4">
              <button
                onClick={handleVote}
                disabled={isVoting || selectedOption === null}
                className={`flex-1 px-8 ${isCompactMode ? 'py-4' : 'py-5'} rounded-2xl font-bold text-white transition-all duration-500 relative overflow-hidden group/btn shadow-lg ${
                  isVoting || selectedOption === null
                    ? 'bg-gradient-to-r from-slate-300 to-slate-400 cursor-not-allowed shadow-slate-200/30'
                    : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 shadow-violet-400/40 hover:shadow-xl hover:shadow-violet-500/50 transform hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <span className="relative z-10 text-lg">
                  {isVoting ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting Vote...
                    </span>
                  ) : (
                    'Submit Vote'
                  )}
                </span>
                {!isVoting && selectedOption !== null && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-purple-400/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  </>
                )}
              </button>
              
              {onDelete && (
                <button
                  onClick={onDelete}
                  className={`px-6 ${isCompactMode ? 'py-4' : 'py-5'} rounded-2xl font-bold text-rose-600 border-2 border-rose-300/60 bg-gradient-to-br from-white/80 to-rose-50/60 hover:border-rose-400/70 hover:bg-gradient-to-br hover:from-rose-50/80 hover:to-rose-100/80 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.05] hover:shadow-lg hover:shadow-rose-300/40 group/del relative overflow-hidden active:scale-[0.95]`}
                >
                  <span className="relative z-10 text-base">Delete</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-50/0 via-rose-100/60 to-rose-50/0 -translate-x-full group-hover/del:translate-x-full transition-transform duration-700" />
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 bg-gradient-to-r from-rose-50/90 to-red-50/90 border-2 border-rose-200/60 rounded-2xl shadow-sm animate-scale-in">
                <p className="text-rose-700 font-semibold">{error}</p>
              </div>
            )}
            
            <div className="flex items-center justify-center pt-2 animate-fade-in">
              <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-100/80 via-white/60 to-slate-100/80 rounded-full backdrop-blur-sm border border-slate-200/50 shadow-sm">
                <div className="w-2.5 h-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-pulse" />
                <span className="text-slate-700 font-bold">
                  {votedPoll.votes.length} total {votedPoll.votes.length === 1 ? 'vote' : 'votes'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes expand-width {
          from { width: 0; }
          to { width: 4rem; }
        }
        
        @keyframes expand-bar {
          from { width: 0; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes shimmer-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.9; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-fade-in-delay { animation: fade-in 0.6s ease-out 0.3s both; }
        .animate-slide-up { animation: slide-up 0.8s ease-out; }
        .animate-scale-in { animation: scale-in 0.4s ease-out; }
        .animate-expand-width { animation: expand-width 0.8s ease-out 0.2s both; }
        .animate-expand-bar { animation: expand-bar 1.2s ease-out; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-shimmer-bar { animation: shimmer-bar 2s ease-in-out infinite 0.5s; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-float { animation: float 4s ease-in-out infinite 1s; }
        
        .border-3 { border-width: 3px; }
        
        .premium-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .premium-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, rgba(148, 163, 184, 0.1), rgba(148, 163, 184, 0.05));
          border-radius: 4px;
        }
        .premium-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #6366f1, #8b5cf6);
          border-radius: 4px;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
        }
        .premium-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #4f46e5, #7c3aed);
        }
        .premium-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #8b5cf6 rgba(148, 163, 184, 0.1);
        }
      `}</style>
    </div>
  );
};

export default PollCard;
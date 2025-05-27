import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building, BookOpen, Calendar, MapPin, Clock, Users, Star, Quote, Award, Target, CheckCircle, ExternalLink, User, Briefcase, TrendingUp, Code, Brain, MessageCircle, Trophy, Zap, Globe, Layers } from 'lucide-react';
import { useParams } from 'react-router-dom';
import InterviewCommentSection from '../components/InterviewCommentSection';


// Floating Background Elements Component
function FloatingElements() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient orbs - responsive for mobile */}
      <div className="absolute -top-40 -right-40 w-80 h-80 max-w-[80vw] max-h-[80vw] sm:w-80 sm:h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 max-w-[70vw] max-h-[70vw] sm:w-64 sm:h-64 bg-gradient-to-br from-purple-400/15 to-pink-500/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}} />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 max-w-[60vw] max-h-[60vw] sm:w-48 sm:h-48 bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}} />
      {/* Hide some orbs on mobile for less overflow */}
      <div className="hidden sm:absolute sm:top-1/6 sm:left-1/12 sm:block animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}}>
        <Code className="w-8 h-8 text-blue-300/40" />
      </div>
      <div className="hidden sm:absolute sm:top-1/3 sm:right-1/6 sm:block animate-bounce" style={{animationDelay: '2s', animationDuration: '4s'}}>
        <Brain className="w-6 h-6 text-indigo-300/40" />
      </div>
      <div className="hidden sm:absolute sm:bottom-1/3 sm:left-1/4 sm:block animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}>
        <Trophy className="w-7 h-7 text-purple-300/40" />
      </div>
      <div className="hidden sm:absolute sm:bottom-1/4 sm:right-1/12 sm:block animate-bounce" style={{animationDelay: '3s', animationDuration: '2.5s'}}>
        <Zap className="w-6 h-6 text-yellow-300/40" />
      </div>
      <div className="hidden sm:absolute sm:top-1/2 sm:left-1/8 sm:block animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4s'}}>
        <Globe className="w-8 h-8 text-cyan-300/40" />
      </div>
      <div className="hidden sm:absolute sm:top-3/4 sm:right-1/3 sm:block animate-bounce" style={{animationDelay: '2.5s', animationDuration: '3s'}}>
        <Layers className="w-6 h-6 text-emerald-300/40" />
      </div>
      {/* Geometric shapes - clamp on mobile */}
      <div className="absolute top-1/5 right-1/5 w-4 h-4 max-w-[5vw] max-h-[5vw] bg-blue-200/30 rotate-45 animate-spin" style={{animationDuration: '8s'}}></div>
      <div className="absolute bottom-1/5 left-1/6 w-6 h-6 max-w-[8vw] max-h-[8vw] bg-purple-200/30 rotate-45 animate-spin" style={{animationDuration: '12s', animationDirection: 'reverse'}}></div>
      <div className="absolute top-2/3 left-1/5 w-3 h-3 max-w-[4vw] max-h-[4vw] bg-indigo-200/40 rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
    </div>
  );
}

// Enhanced Background Pattern Component
function BackgroundPattern() {
  return (
    <div className="fixed inset-0 z-0 max-w-full overflow-x-hidden">
      {/* Primary gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 max-w-full" />
      {/* Secondary overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-tl from-purple-50/50 via-transparent to-cyan-50/30 max-w-full" />
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-white/40 via-transparent to-transparent max-w-full" />
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-30 max-w-full" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
    </div>
  );
}

// Responsive Open Book Component
function ResponsiveBookExperience({ experience }) {
  if (!experience) return null;

  return (
    <div className="relative z-10 w-full min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Book Container with enhanced styling */}
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50">
          
          {/* Enhanced Book Binding with gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 z-10 shadow-lg">
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <BookOpen size={20} className="text-slate-100 drop-shadow-sm" />
              {/* Binding details */}
              <div className="w-6 h-0.5 bg-slate-400 rounded"></div>
              <div className="w-4 h-0.5 bg-slate-500 rounded"></div>
              <div className="w-6 h-0.5 bg-slate-400 rounded"></div>
            </div>
          </div>

          {/* Pages Container */}
          <div className="flex flex-col ml-8">
            {/* First Spread - Experience Content */}
            <div className="flex flex-col lg:flex-row">
              {/* Left Page - Experience Content */}
              <div className="flex-1 p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-white/90 to-blue-50/40 border-b lg:border-b-0 lg:border-r border-slate-200/30 backdrop-blur-sm">
                
                {/* Page Header with enhanced styling */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 text-slate-700 mb-3">
                    <div className="p-2 bg-blue-100/80 rounded-lg backdrop-blur-sm">
                      <Building size={24} className="flex-shrink-0 text-blue-600" />
                    </div>
                    <span className="font-serif text-xl sm:text-2xl font-bold truncate bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      {experience.company}
                    </span>
                  </div>
                  
                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-4">
                    Interview Experience
                  </h1>
                  
                  {/* Enhanced decorative divider */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-20 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-8 h-0.5 bg-gradient-to-r from-purple-400 to-transparent rounded-full"></div>
                  </div>
                </div>

                {/* Enhanced Raw Experience Content */}
                <div className="prose prose-lg max-w-none">
                  <div className="relative mb-6 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/40 shadow-sm">
                    <Quote size={40} className="absolute -top-3 -left-3 text-blue-400/30" />
                    <div className="pl-8">
                      <div className="font-serif text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {experience.experience || "This interview experience provided valuable insights into the company's culture, technical expectations, and overall hiring process. The journey was both challenging and enlightening, offering a deep dive into what it takes to succeed in today's competitive tech landscape."}
                      </div>
                    </div>
                    {/* Content shadow effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-100/20 to-transparent rounded-b-xl"></div>
                  </div>
                </div>

                {/* Enhanced Page Number */}
                <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">01</span>
                    </div>
                    <span className="text-slate-600 text-sm font-serif">Page</span>
                  </div>
                  <div className="text-slate-600 text-sm font-serif italic bg-slate-100/50 px-3 py-1 rounded-full">
                    {experience.fullName || 'Anonymous Contributor'}
                  </div>
                </div>
              </div>

              {/* Right Page - Details & Metadata */}
              <div className="flex-1 p-6 sm:p-8 lg:p-12 bg-gradient-to-bl from-white/90 to-slate-50/40 backdrop-blur-sm">
                
                {/* Experience Metadata */}
                <div className="space-y-6">
                  
                  {/* Enhanced Interview Details Card */}
                  <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="font-serif text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <div className="p-1 bg-blue-500 rounded-lg">
                        <Star className="text-white" size={20} />
                      </div>
                      Interview Details
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                      <div className="flex items-start gap-4 p-3 bg-white/60 rounded-lg backdrop-blur-sm hover:bg-white/80 transition-colors">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Briefcase size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <label className="text-slate-600 text-sm font-medium block mb-1">Position</label>
                          <p className="font-semibold text-slate-900">{experience.position || 'Software Engineer'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-3 bg-white/60 rounded-lg backdrop-blur-sm hover:bg-white/80 transition-colors">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TrendingUp size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <label className="text-slate-600 text-sm font-medium block mb-1">Years of Experience</label>
                          <p className="font-semibold text-slate-900">{experience.yoe || 0} years</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-3 bg-white/60 rounded-lg backdrop-blur-sm hover:bg-white/80 transition-colors">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Award size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <label className="text-slate-600 text-sm font-medium block mb-1">Result</label>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm ${
                              experience.verdict === 'selected' 
                                ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200' 
                                : 'bg-red-100/80 text-red-800 border border-red-200'
                            }`}>
                              {experience.verdict === 'selected' ? '✓ Selected' : '✗ Not Selected'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-3 bg-white/60 rounded-lg backdrop-blur-sm hover:bg-white/80 transition-colors">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ExternalLink size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <label className="text-slate-600 text-sm font-medium block mb-1">LinkedIn Profile</label>
                          {experience.linkedin && experience.linkedin !== 'Not Provided' ? (
                            <a 
                              href={experience.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors hover:underline"
                            >
                              View Profile <ExternalLink size={14} />
                            </a>
                          ) : (
                            <p className="font-semibold text-slate-500">Not Provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Difficulty Rating */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h4 className="font-serif text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="p-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                        <Target size={16} className="text-white" />
                      </div>
                      Difficulty Level
                    </h4>
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          className={`transition-all duration-300 ${i < (experience.rating || 3) 
                            ? 'text-blue-400 fill-blue-400 drop-shadow-sm' 
                            : 'text-slate-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-slate-600 font-medium bg-slate-100/60 px-2 py-1 rounded-full">
                        {experience.rating || 3}/5
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Author Info */}
                  <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl p-6 border border-indigo-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h4 className="font-serif text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                        <User className="text-white" size={16} />
                      </div>
                      Contributor
                    </h4>
                    <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <User size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{experience.fullName || 'Anonymous'}</p>
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <TrendingUp size={12} />
                          {experience.yoe || 0} years experience
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Page Number */}
                <div className="flex justify-center mt-12 pt-6 border-t border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">02</span>
                    </div>
                    <span className="text-slate-600 text-sm font-serif">Page</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Spread - Comments Section */}
            <div className="flex flex-col lg:flex-row border-t border-slate-200/30">
              {/* Left Page - Comments */}
              <div className="flex-1 p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-white/90 to-blue-50/40 backdrop-blur-sm">
                <div className="mb-8">
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                      <MessageCircle className="text-white" size={24} />
                    </div>
                    Community Discussion
                  </h2>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-20 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-8 h-0.5 bg-gradient-to-r from-purple-400 to-transparent rounded-full"></div>
                  </div>
                </div>
                <InterviewCommentSection expId={experience._id} />
              </div>

              {/* Right Page - Discussion Info */}
              <div className="flex-1 p-6 sm:p-8 lg:p-12 bg-gradient-to-bl from-white/90 to-slate-50/40 backdrop-blur-sm border-l border-slate-200/30">
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl mb-6">
                    <MessageCircle size={48} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">Join the Conversation</h3>
                  <p className="text-slate-600 max-w-md">
                    Share your thoughts, ask questions, or provide additional insights about this interview experience. Your contribution helps build a stronger community.
                  </p>
                </div>
                {/* Page Number */}
                <div className="flex justify-center mt-12 pt-6 border-t border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">03</span>
                    </div>
                    <span className="text-slate-600 text-sm font-serif">Page</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Book Corner Fold Effect */}
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-slate-300/40 via-slate-200/30 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-tl from-slate-400/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewDetailPage() {
  const [experience, setExperience] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get ID from URL params
  const {id} = useParams();
  const navigate = () => {};

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/backend/interviews/getInterviewExp/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Interview experience not found');
          } else {
            throw new Error('Failed to fetch experience');
          }
          return;
        }
        
        const experienceData = await response.json();
        setExperience(experienceData);
        
      } catch (error) {
        console.error('Error fetching experience:', error);
        setError('Failed to load interview experience');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchExperience();
    }
  }, [id]);

  const handleBackClick = () => {
    navigate('/interview-experiences');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <BackgroundPattern />
        <FloatingElements />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="text-center bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-slate-200/50">
            <div className="relative mb-6">
              <BookOpen size={64} className="text-blue-600 mx-auto animate-pulse drop-shadow-lg" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Loading Experience</h2>
            <p className="text-slate-700">Please wait while we prepare your interview experience...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen relative">
        <BackgroundPattern />
        <FloatingElements />
        <div className="relative z-10 min-h-screen p-4">
          <div className="max-w-4xl mx-auto">
            {/* Error Content */}
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-slate-200/50">
                <Building size={80} className="mx-auto text-slate-400 mb-6 drop-shadow-sm" />
                <h1 className="text-3xl font-serif font-bold text-slate-900 mb-4">
                  Experience Not Found
                </h1>
                <p className="text-slate-700 mb-8 leading-relaxed">
                  {error || 'The interview experience you\'re looking for could not be found in our library.'}
                </p>
                <button
                  onClick={handleBackClick}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Return to Library
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 min-h-screen relative w-full overflow-x-hidden">
      <BackgroundPattern />
      <FloatingElements />
      {/* Main Book Content */}
      <ResponsiveBookExperience experience={experience} />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Sparkles, Target, Zap, Shield, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const [activeSection, setActiveSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const timelineItems = [
    {
      icon: Target,
      time: "Our Mission",
      title: "Who Are We?",
      gradient: "from-purple-600 to-pink-600",
      body: [
        "Discover top career opportunities with TrendingJobs4All! Our dedicated team connects talented professionals with the perfect job opportunities to help them thrive in their careers.",
        "Discover job roles and internships that perfectly match your skills, ambitions, and values on TrendingJobs4All, your ultimate platform for career opportunities.",
        "At TrendingJobs4All, we empower individuals by connecting them with the right job opportunities, ensuring every career step is meaningful and fulfilling.",
        "Experience innovation and seamless job searching with TrendingJobs4All—the ultimate platform for professionals and students to discover their next big career opportunity."
      ]
    },
    {
      icon: Zap,
      time: "Our Approach",
      title: "What Makes Us Different from Others?",
      gradient: "from-blue-600 to-cyan-600",
      body: [
        "Discover a revolutionary job search experience with TrendingJobs4All, where personalized career recommendations help you find opportunities tailored just for you.",
        "At TrendingJobs4All, advanced algorithms match your unique skills, experiences, and aspirations with the best job and internship opportunities for your career growth.",
        "Enhance your career with TrendingJobs4All, offering tailored resources to help you upskill, build your network, and stay ahead of industry trends.",
        "At TrendingJobs4All, we prioritize community building, providing access to forums, mentorship, and expert career advice to support your professional growth.",
        "At TrendingJobs4All, it's not just about finding a job—it's about discovering the right career path that aligns with your goals and aspirations."
      ]
    },
    {
      icon: Shield,
      time: "Our Promise",
      title: "Why Choose Us?",
      gradient: "from-emerald-600 to-teal-600",
      body: [
        "Choosing TrendingJobs4All means selecting a platform that truly understands your career goals. Enjoy a seamless, intuitive experience to explore and apply for job opportunities that align with your passion, skills, and aspirations.",
        "With TrendingJobs4All, you're not just a job seeker; you're part of a supportive community dedicated to your continuous growth, success, and career advancement.",
        "Our commitment to providing curated job opportunities, personalized insights, and professional development resources makes TrendingJobs4All the ultimate platform to advance your career. Join us today and take the first step toward a brighter, more fulfilling professional future!"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animation: 'float 6s ease-in-out infinite'
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-slide-up {
          animation: slideInUp 0.8s ease-out forwards;
        }
        
        .animate-fade-scale {
          animation: fadeInScale 0.6s ease-out forwards;
        }
      `}</style>

      {/* Hero Section */}
      <div className="relative z-10 h-screen flex flex-col items-center justify-center text-white p-8">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'animate-fade-scale' : 'opacity-0'}`}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-7xl font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Discover Your Path
            </h1>
            <div className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl shadow-2xl">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <p className="text-2xl max-w-4xl mx-auto text-gray-300 leading-relaxed mb-12">
            Empowering careers, connecting dreams, and building futures together at{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
              TrendingJobs4All
            </span>
          </p>
          
          {/* Scroll Indicator */}
          <div className="flex flex-col items-center animate-bounce">
            <span className="text-gray-400 mb-2">Explore Our Story</span>
            <ChevronDown className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative z-10 container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {timelineItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === activeSection;
            
            return (
              <div
                key={index}
                className={`relative flex items-start mb-20 group transition-all duration-700 ${
                  isVisible ? 'animate-slide-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
                onMouseEnter={() => setActiveSection(index)}
              >
                {/* Timeline Line */}
                <div className="absolute left-8 top-24 w-0.5 h-full bg-gradient-to-b from-purple-500 to-transparent opacity-30"></div>
                
                {/* Icon Container */}
                <div className={`relative z-10 mr-8 p-4 rounded-2xl shadow-2xl transition-all duration-500 transform group-hover:scale-110 bg-gradient-to-r ${item.gradient}`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content Container */}
                <div className={`flex-1 transition-all duration-500 transform ${isActive ? 'scale-105' : ''}`}>
                  {/* Glassmorphism Card */}
                  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 group-hover:bg-white/15">
                    {/* Time Badge */}
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 bg-gradient-to-r ${item.gradient} text-white shadow-lg`}>
                      {item.time}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-3xl font-bold text-white mb-6 group-hover:text-purple-200 transition-colors duration-300">
                      {item.title}
                    </h3>
                    
                    {/* Content Grid */}
                    <div className="grid gap-4">
                      {item.body.map((point, i) => (
                        <div
                          key={i}
                          className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group/item"
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 bg-gradient-to-r ${item.gradient} flex-shrink-0 group-hover/item:scale-125 transition-transform duration-300`}></div>
                          <p className="text-gray-300 leading-relaxed group-hover/item:text-white transition-colors duration-300">
                            {point.replace(/\*\*(.*?)\*\*/g, '$1')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-20">
          <div className="inline-block p-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-gray-300 text-xl mb-8">Join thousands of professionals who found their dream careers with us</p>
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-semibold text-lg shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300"
            onClick={() => navigate('/jobs')}>
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
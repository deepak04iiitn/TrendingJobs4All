import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import RelatedLinks from '../components/RelatedLinks';
import { Target, Zap, Shield, ArrowRight, Sparkles, Star, Briefcase, Users, Code, MessageCircle, TrendingUp, FileEdit, Puzzle, Trophy, BookOpen, Map } from 'lucide-react';

export default function About() {

  const features = [
    {
      icon: Briefcase,
      title: "Curated Job Listings",
      description: "Access 2500+ handpicked QA, SDET, Test Automation, and Software Testing roles from top companies. Every job is verified and tailored for quality assurance professionals.",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100"
    },
    {
      icon: MessageCircle,
      title: "Interview Experiences",
      description: "Learn from real interview experiences shared by QA/SDET professionals. Company-wise insights help you prepare effectively for your next interview.",
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100"
    },
    {
      icon: Puzzle,
      title: "Interview Questions",
      description: "Master topic-wise interview questions specifically curated for QA and SDET roles. Practice with real questions asked by top tech companies.",
      gradient: "from-indigo-500 to-indigo-600",
      bgGradient: "from-indigo-50 to-indigo-100"
    },
    {
      icon: Code,
      title: "QA/SDET DSA Sheet",
      description: "Track your progress with our comprehensive DSA sheet designed for QA/SDET interviews. Compete on the leaderboard and master data structures & algorithms.",
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-100"
    },
    {
      icon: Users,
      title: "Employee Referrals",
      description: "Get referred by peers in the QA/SDET community. Connect with professionals who can help you land your dream role through verified referrals.",
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100"
    },
    {
      icon: TrendingUp,
      title: "Salary Insights",
      description: "Access real compensation data for QA/SDET roles across different companies, locations, and experience levels. Make informed career decisions.",
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100"
    },
    {
      icon: FileEdit,
      title: "Resume Templates & Builder",
      description: "Create professional resumes with our QA/SDET-focused templates and resume builder. Get your resume reviewed by the community.",
      gradient: "from-pink-500 to-pink-600",
      bgGradient: "from-pink-50 to-pink-100"
    },
    {
      icon: BookOpen,
      title: "Blogs & Roadmaps",
      description: "Read and create articles about QA/SDET careers. Follow skill-based roadmaps tailored for different QA and SDET roles.",
      gradient: "from-violet-500 to-violet-600",
      bgGradient: "from-violet-50 to-violet-100"
    },
  ];

  const timelineItems = [
    {
      icon: Target,
      time: "Our Mission",
      title: "Empowering QA/SDET Professionals",
      color: "text-purple-600",
      nodeBg: "bg-purple-500",
      cardBorder: "border-purple-100",
      iconBg: "bg-purple-50",
      body: [
        "Route2Hire is the fastest-growing platform dedicated exclusively to QA, SDET, Test Automation, and Software Testing professionals. We understand the unique challenges and opportunities in quality assurance careers.",
        "Our mission is to provide a comprehensive ecosystem where QA/SDET professionals can discover curated job opportunities, prepare for interviews, track their DSA progress, and connect with a thriving community of peers.",
        "We curate 2500+ fresh job listings daily, ensuring every opportunity is relevant to quality assurance roles. From entry-level QA positions to senior SDET roles, we've got you covered.",
        "Join 1000+ active users who trust Route2Hire for their career growth. We're building the largest QA/SDET community where professionals share knowledge, experiences, and opportunities."
      ]
    },
    {
      icon: Zap,
      time: "Our Approach",
      title: "What Makes Us Different?",
      color: "text-blue-600",
      nodeBg: "bg-blue-500",
      cardBorder: "border-blue-100",
      iconBg: "bg-blue-50",
      body: [
        "QA/SDET-Focused: Unlike generic job platforms, every feature is designed specifically for Quality Assurance and Software Development Engineer in Test roles.",
        "Comprehensive Preparation: Access interview experiences, topic-wise questions, and a dedicated DSA sheet with leaderboard to track your progress and compete with peers.",
        "Community-Driven: Join our active Telegram and WhatsApp communities (3.5K+ members) for instant job alerts, networking, and peer support.",
        "Real Insights: Get real salary data, employee referrals, and interview experiences from actual QA/SDET professionals working at top companies.",
        "All-in-One Platform: From job search to interview prep, from resume building to community engagement—everything you need for your QA/SDET career in one place."
      ]
    },
    {
      icon: Shield,
      time: "Our Promise",
      title: "Why Choose Route2Hire?",
      color: "text-emerald-600",
      nodeBg: "bg-emerald-500",
      cardBorder: "border-emerald-100",
      iconBg: "bg-emerald-50",
      body: [
        "We promise to deliver the most relevant QA/SDET opportunities. Every job listing is handpicked and verified to ensure it matches quality assurance roles.",
        "Our platform grows with you—from your first QA role to becoming a senior SDET. Access resources, community support, and opportunities at every career stage.",
        "Join the fastest-growing QA/SDET community and accelerate your career journey. With Route2Hire, you're not just finding a job—you're building a career in quality assurance."
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Us | Route2Hire - The Ultimate QA/SDET Career Platform</title>
        <meta
          name="description"
          content="Route2Hire is the fastest-growing platform for QA, SDET, and Test Automation professionals. Discover curated jobs, interview prep, DSA tracking, and join 1000+ quality assurance professionals."
        />
        <meta
          name="keywords"
          content="QA jobs, SDET careers, Test Automation, Software Testing, Quality Assurance platform, QA community, SDET interview prep, QA DSA sheet, Route2Hire about"
        />
        <meta property="og:title" content="About Us | Route2Hire - QA/SDET Career Platform" />
        <meta
          property="og:description"
          content="Join the fastest-growing QA/SDET community. Discover curated jobs, master interview prep, track DSA progress, and connect with quality assurance professionals."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/about" />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href="https://route2hire.com/about" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4">
        <Breadcrumb 
          items={[
            { label: 'About Us' }
          ]}
        />
      </div>
      
      <style>{`
        @keyframes fadeUp { 
          from { opacity: 0; transform: translateY(24px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        @keyframes scaleIn { 
          from { opacity: 0; transform: scale(0.95); } 
          to { opacity: 1; transform: scale(1); } 
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-fade-up { animation: fadeUp 0.6s ease-out both; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out both; }
        .animate-scale-in { animation: scaleIn 0.5s ease-out both; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gradient-border {
          position: relative;
          background: white;
          border-radius: 1.5rem;
        }
        
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1.5rem;
          padding: 2px;
          background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-purple-200 shadow-lg shadow-purple-100/50 mb-6">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">About Route2Hire</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6">
              The Ultimate Platform for<br />
              <span className="gradient-text">QA/SDET Professionals</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
              Join the fastest-growing QA/SDET community. Discover curated jobs, master interview prep, track DSA progress, and connect with 1000+ quality assurance professionals.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/jobs" className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-200 flex items-center gap-2">
                Explore Jobs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/contactUs" className="px-8 py-4 bg-white border-2 border-purple-200 text-purple-700 rounded-xl font-medium hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 shadow-sm">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 animate-fade-in" style={{animationDelay: '200ms'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { label: 'Fresh Jobs', value: '2500+', gradient: 'from-purple-500 to-purple-600', icon: Briefcase },
              { label: 'Active Users', value: '1000+', gradient: 'from-blue-500 to-blue-600', icon: Users },
              { label: 'Interview Resources', value: '100+', gradient: 'from-emerald-500 to-emerald-600', icon: MessageCircle },
              { label: 'Community Members', value: '3.5K+', gradient: 'from-orange-500 to-orange-600', icon: Trophy }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center p-6 sm:p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-center mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} bg-opacity-10`}>
                      <Icon className={`w-6 h-6 text-slate-700`} />
                    </div>
                  </div>
                  <div className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>{stat.value}</div>
                  <div className="text-xs sm:text-sm font-medium text-slate-600 uppercase tracking-wide">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 animate-fade-in" style={{animationDelay: '300ms'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200 shadow-lg shadow-blue-100/50 mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Platform Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Everything You Need for Your QA/SDET Career</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              A comprehensive platform designed specifically for Quality Assurance and Software Development Engineer in Test professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white/90 backdrop-blur-sm border-2 border-slate-200 rounded-2xl p-6 sm:p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-scale-in"
                  style={{animationDelay: `${400 + index * 100}ms`}}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-up" style={{animationDelay: '100ms'}}>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Story & Promise</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              What we do, how we do it, and why it matters to your career journey.
            </p>
          </div>

          <div className="space-y-12">
            {timelineItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index} 
                  className="group animate-scale-in" 
                  style={{animationDelay: `${200 + index * 150}ms`}}
                >
                  <div className={`relative bg-white/90 backdrop-blur-sm border-2 ${item.cardBorder} rounded-3xl p-8 lg:p-10 hover:shadow-2xl hover:shadow-${item.color.split('-')[1]}-200/30 transition-all duration-300 hover:-translate-y-1`}>
                    {/* Icon Circle */}
                    <div className="absolute -left-6 top-8">
                      <div className={`relative w-16 h-16 ${item.nodeBg} rounded-2xl flex items-center justify-center shadow-lg shadow-${item.color.split('-')[1]}-500/30 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <div className="ml-16">
                      {/* Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`inline-block px-4 py-1.5 ${item.iconBg} ${item.color} text-xs font-semibold rounded-full uppercase tracking-wider`}>
                          {item.time}
                        </span>
                      </div>

                      <h3 className="text-3xl font-bold text-slate-900 mb-6">
                        {item.title}
                      </h3>

                      {/* Content */}
                      <div className="space-y-4">
                        {item.body.map((point, i) => (
                          <div key={i} className="flex gap-4 items-start">
                            <div className={`mt-2 w-2 h-2 rounded-full ${item.nodeBg} flex-shrink-0`}></div>
                            <p className="text-slate-700 leading-relaxed text-lg">
                              {point}
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
        </div>
      </section>

      {/* Related Links Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RelatedLinks type="general" />
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-16"></div>
    </div>
    </>
  );
}
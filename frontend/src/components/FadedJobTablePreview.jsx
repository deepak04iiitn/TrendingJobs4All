import React from 'react';
import { useNavigate } from 'react-router-dom';

const FadedJobTablePreview = () => {
  // Mock job data for the preview
  const mockJobs = [
    { id: 1, title: "Senior Frontend Developer", company: "Tech Corp", location: "Remote", salary: "$120k - $150k", type: "Full-time" },
    { id: 2, title: "Product Manager", company: "StartupXYZ", location: "San Francisco, CA", salary: "$130k - $160k", type: "Full-time" },
    { id: 3, title: "UX/UI Designer", company: "Design Studio", location: "New York, NY", salary: "$90k - $120k", type: "Full-time" },
    { id: 4, title: "Data Scientist", company: "AI Solutions", location: "Seattle, WA", salary: "$140k - $170k", type: "Full-time" },
    { id: 5, title: "DevOps Engineer", company: "Cloud Systems", location: "Austin, TX", salary: "$110k - $140k", type: "Full-time" },
    { id: 6, title: "Backend Developer", company: "Enterprise Co", location: "Boston, MA", salary: "$100k - $130k", type: "Full-time" },
    { id: 7, title: "Marketing Director", company: "Growth Inc", location: "Los Angeles, CA", salary: "$120k - $150k", type: "Full-time" },
    { id: 8, title: "Sales Manager", company: "SalesForce Pro", location: "Chicago, IL", salary: "$80k - $110k", type: "Full-time" },
    { id: 9, title: "Full Stack Developer", company: "WebDev Agency", location: "Miami, FL", salary: "$95k - $125k", type: "Full-time" },
    { id: 10, title: "Cybersecurity Analyst", company: "SecureNet", location: "Washington, DC", salary: "$105k - $135k", type: "Full-time" },
  ];

  // Duplicate the jobs array to create seamless infinite scroll
  const infiniteJobs = [...mockJobs, ...mockJobs, ...mockJobs];

  const navigate = useNavigate();

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-3xl border border-white/10">
      {/* Container with perspective for 3D tilt effect */}
      <div className="relative w-full h-full" style={{ perspective: '1000px' }}>
        
        {/* Tilted table container with infinite scroll */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{
            transform: 'rotateX(15deg) rotateY(-5deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Scrolling job rows */}
          <div className="animate-infinite-scroll">
            {infiniteJobs.map((job, index) => (
              <div
                key={`${job.id}-${index}`}
                className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">{job.title}</h3>
                  <p className="text-white/70 text-xs">{job.company}</p>
                </div>
                <div className="flex-1 min-w-0 px-4">
                  <p className="text-white/80 text-xs truncate">{job.location}</p>
                </div>
                <div className="flex-1 min-w-0 px-4">
                  <p className="text-green-400 font-medium text-xs">{job.salary}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                    {job.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gradient fade overlay - stronger at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900 pointer-events-none z-10"></div>
        
        {/* Additional fade from sides */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-transparent to-slate-900/60 pointer-events-none z-10"></div>
        
        {/* Bottom heavy fade for the tilted effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none z-20"></div>
        
        {/* Top light fade */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-900/80 to-transparent pointer-events-none z-20"></div>
      </div>

      {/* Call-to-action overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/20">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Discover Premium Jobs</h3>
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
            onClick={() => navigate('/jobs')}>
            View All Opportunities
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes infinite-scroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        .animate-infinite-scroll {
          animation: infinite-scroll 20s linear infinite;
        }

        /* Ensure smooth scrolling even on slower devices */
        .animate-infinite-scroll {
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default FadedJobTablePreview;
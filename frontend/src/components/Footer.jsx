import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter, FaGithub, FaDribbble, FaArrowRight, FaEnvelope } from 'react-icons/fa';

const FooterLink = ({ href, children }) => (
  <a
    href={href}
    className="group relative text-slate-300 hover:text-white transition-all duration-300 text-sm font-medium"
  >
    <span className="relative z-10">{children}</span>
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
  </a>
);

const SocialIcon = ({ href, icon: Icon }) => (
  <a
    href={href}
    className="group relative w-10 h-10 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 flex items-center justify-center hover:bg-gradient-to-br hover:from-cyan-500/20 hover:to-blue-600/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/25"
  >
    <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors duration-300" />
  </a>
);

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
      
      {/* Floating Orbs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6">
            <a href="/" className="inline-flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src="/assets/Route2Hire.png"
                  alt="Route2Hire Logo"
                  className="h-12 w-auto transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Route2Hire
                </span>
                <div className="text-xs text-cyan-400 font-medium tracking-wider uppercase">Premium Careers</div>
              </div>
            </a>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Connecting ambitious professionals to extraordinary career opportunities in the digital age.
            </p>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Trusted by 50K+ professionals</span>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 text-white relative">
              Quick Links
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              <li><FooterLink href="/about">About Us</FooterLink></li>
              <li><FooterLink href="/jobs">Job Listings</FooterLink></li>
              <li><FooterLink href="/resources">Career Resources</FooterLink></li>
              <li><FooterLink href="/contactUs">Contact Us</FooterLink></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 text-white relative">
              Legal
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              <li><FooterLink href="/privacyPolicy">Privacy Policy</FooterLink></li>
              <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
              <li><FooterLink href="/cookies">Cookie Policy</FooterLink></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="lg:col-span-4">
            <h3 className="text-lg font-semibold mb-6 text-white relative">
              Stay Connected
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
            </h3>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Get exclusive career insights and premium job opportunities delivered to your inbox.
            </p>
            <div className="space-y-4">
              <div className="relative group">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-cyan-400 transition-colors duration-300" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white placeholder-slate-500 px-12 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 transition-all duration-300"
                />
              </div>
              <button
                type="button"
                className="group w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3.5 rounded-xl font-medium hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
              >
                <span>Subscribe Now</span>
                <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-slate-800/50">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-6 sm:space-y-0">
            <div className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Route2Hire. Crafted with 
              <span className="text-red-400 mx-1">♥</span>
              for ambitious careers.
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-600 text-sm hidden sm:block">Follow us:</span>
              <div className="flex space-x-3">
                <SocialIcon href="#" icon={FaFacebookF} />
                <SocialIcon href="#" icon={FaInstagram} />
                <SocialIcon href="#" icon={FaTwitter} />
                <SocialIcon href="https://github.com/deepak04iiitn" icon={FaGithub} />
                <SocialIcon href="#" icon={FaDribbble} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient Bar */}
      <div className="w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-600 via-purple-600 to-pink-500"></div>
    </footer>
  );
}
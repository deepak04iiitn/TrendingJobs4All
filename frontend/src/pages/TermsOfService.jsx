import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Scale, 
  Shield, 
  AlertTriangle, 
  Users, 
  Mail,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import RelatedLinks from '../components/RelatedLinks';

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    document.title = "Terms of Service - Route2Hire";
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "Acceptance of Terms",
      content: "By accessing and using Route2Hire, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
      icon: CheckCircle
    },
    {
      title: "Description of Service",
      content: "Route2Hire is a career platform that connects job seekers with employment opportunities. We provide job listings, interview experiences, salary insights, a resume builder, and career resources to help professionals advance their careers.",
      icon: FileText
    },
    {
      title: "User Accounts",
      content: "To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating your account.",
      icon: Users
    },
    {
      title: "User Conduct",
      content: "You agree to use Route2Hire only for lawful purposes and in accordance with these Terms. You may not use the service to transmit, distribute, store, or destroy material that is illegal, harmful, threatening, abusive, or otherwise objectionable.",
      icon: Shield
    },
    {
      title: "Content and Intellectual Property",
      content: "All content on Route2Hire, including text, graphics, logos, and software, is the property of Route2Hire or its content suppliers and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without permission.",
      icon: FileText
    },
    {
      title: "Privacy and Data Protection",
      content: "Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service. By using Route2Hire, you agree to the collection and use of information in accordance with our Privacy Policy.",
      icon: Shield
    },
    {
      title: "Prohibited Activities",
      content: "You may not: (1) Use the service for any unlawful purpose or to solicit others to perform unlawful acts; (2) Violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances; (3) Transmit or procure the sending of any advertising or promotional material without our prior written consent.",
      icon: XCircle
    },
    {
      title: "Termination",
      content: "We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.",
      icon: AlertTriangle
    },
    {
      title: "Disclaimers",
      content: "The information on this service is provided on an 'as is' basis. To the fullest extent permitted by law, Route2Hire excludes all representations, warranties, conditions and terms relating to our service and the use of this service.",
      icon: AlertTriangle
    },
    {
      title: "Limitation of Liability",
      content: "In no event shall Route2Hire, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.",
      icon: Scale
    },
    {
      title: "Governing Law",
      content: "These Terms shall be interpreted and governed by the laws of the jurisdiction in which Route2Hire operates, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.",
      icon: Scale
    },
    {
      title: "Changes to Terms",
      content: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.",
      icon: FileText
    }
  ];

  return (
    <>
      {/* ✅ Helmet for SEO */}
      <Helmet>
        <title>Terms of Service | Route2Hire QA & SDET Platform</title>
        <meta
          name="description"
          content="Read Route2Hire's Terms of Service to understand the terms and conditions for using our QA, SDET, Test Automation, and Software Testing career platform and services."
        />
        <meta
          name="keywords"
          content="Terms of service, Route2Hire terms, User agreement, Terms and conditions, QA platform terms, SDET platform terms, Software Testing platform terms, Legal terms"
        />
        <meta property="og:title" content="Terms of Service | Route2Hire QA & SDET Platform" />
        <meta
          property="og:description"
          content="Review the terms and conditions for using Route2Hire's QA, SDET, and Test Automation career platform and services."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/terms-of-service" />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href="https://route2hire.com/terms-of-service" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <div className="max-w-4xl mx-auto mb-6 pt-20">
        <Breadcrumb 
          items={[
            { label: 'Terms of Service' }
          ]}
        />
      </div>
      
      <div className="w-full bg-white shadow-2xl rounded-2xl overflow-hidden mt-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 px-6 text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-4 text-blue-100">
            Your Rights and Responsibilities on Route2Hire
          </p>
          <p className="mt-2 text-sm text-blue-200">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        {/* Sections */}
        <div className="p-6 sm:p-12">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="mb-8 group"
            >
              <div 
                onClick={() => setActiveSection(activeSection === index ? null : index)}
                className="flex items-center cursor-pointer hover:bg-blue-50 p-4 rounded-lg transition-all duration-300"
              >
                <section.icon 
                  className="h-10 w-10 text-blue-500 mr-4 group-hover:text-blue-600 transition-colors"
                  strokeWidth={1.5}
                />
                <h2 className="text-2xl font-semibold text-blue-700 group-hover:text-blue-800">
                  {section.title}
                </h2>
              </div>
              <AnimatePresence>
                {activeSection === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-gray-600 text-lg leading-relaxed mt-4 px-4 overflow-hidden"
                  >
                    {section.content}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center"
        >
          <div className="flex justify-center items-center mb-4">
            <Mail 
              className="h-10 w-10 text-blue-500 mr-4" 
              strokeWidth={1.5}
            />
            <h3 className="text-2xl font-semibold text-blue-700">
              Questions About Our Terms?
            </h3>
          </div>
          <p className="text-gray-600 mb-6">
            If you have any questions about these Terms of Service, please contact us.
          </p>
          <a 
            href="/contactUs" 
            className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors inline-block"
          >
            Contact Support
          </a>
        </motion.div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 text-center">
          <p>&copy; {new Date().getFullYear()} Route2Hire. All Rights Reserved.</p>
        </div>
      </div>
      
      {/* Related Links Section */}
      <div className="max-w-4xl mx-auto mt-8 pb-8">
        <RelatedLinks type="general" />
      </div>
      </div>
    </>
  );
}

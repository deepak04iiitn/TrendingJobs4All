import React from 'react';
import { motion } from 'framer-motion';
import {
  FaTelegram,
  FaWhatsapp,
  FaEnvelope,
  FaLinkedin,
} from 'react-icons/fa';

export default function ContactUs() {
  const socialLinks = [
    {
      name: 'Sandeep Yadav', 
      role: 'Founder', 
      image: '/assets/Profile.jpg', 
      link: 'https://www.linkedin.com/in/sandeep-yadav-sdet/', 
      color: 'text-blue-800 bg-blue-200'
    },
    {
      name: 'Deepak Yadav', 
      role: 'Co-Founder', 
      image: '/assets/MyProfile.png', 
      link: 'https://www.linkedin.com/in/deepak-kumar-yadav-a0653b248/', 
      color: 'text-blue-700 bg-blue-200'
    },
    { name: 'QA Jobs', icon: <FaTelegram />, link: 'https://t.me/route2hire_qa', color: 'text-purple-500 bg-sky-100' },
    { name: 'Developer Jobs', icon: <FaTelegram />, link: 'https://t.me/route2hire_Dev', color: 'text-purple-500 bg-indigo-100' },
    { name: 'DevOps Jobs', icon: <FaTelegram />, link: 'https://t.me/route2hire_devops', color: 'text-purple-500 bg-purple-100' },
    { name: 'Internships', icon: <FaTelegram />, link: 'https://t.me/route2hire_intern', color: 'text-purple-500 bg-teal-100' },
    { name: 'Email', icon: <FaEnvelope />, link: 'mailto:support@route2hire.com', color: 'text-red-600 bg-red-100' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-16 px-4 flex items-center justify-center">
      <motion.div 
        className="container max-w-6xl mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-center mb-12"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
            Connect With Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover multiple ways to reach our team. Whether you're a potential collaborator, job seeker, or just curious, we're always happy to connect!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialLinks.map((social, index) => (
            social.icon ? (
              <motion.a
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  p-6 rounded-2xl shadow-lg 
                  ${social.color} 
                  transform transition-all duration-300 
                  flex items-center space-x-4
                  bg-opacity-50 backdrop-blur-sm
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1 
                }}
                whileHover={{ 
                  scale: 1.05, 
                  rotate: [0, -5, 5, 0],
                  transition: { 
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 10
                  }
                }}
              >
                <div className={`text-4xl ${social.color.split(' ')[0]} p-3 rounded-full`}>
                  {social.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{social.name}</h2>
                </div>
              </motion.a>
            ) : (
              <motion.a
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  p-6 rounded-2xl shadow-lg 
                  ${social.color} 
                  transform transition-all duration-300 
                  flex items-center space-x-4
                  bg-opacity-50 backdrop-blur-sm
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1 
                }}
                whileHover={{ 
                  scale: 1.05, 
                  rotate: [0, -5, 5, 0],
                  transition: { 
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 10
                  }
                }}
              >
                <img 
                  src={social.image} 
                  alt={social.name} 
                  className="w-24 h-24 rounded-full object-cover mr-4"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{social.name}</h2>
                  <p className="text-sm text-gray-600">{social.role}</p>
                </div>
              </motion.a>
            )
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <p className="text-sm text-gray-500">
            We value your privacy and promise to use your contact information responsibly.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
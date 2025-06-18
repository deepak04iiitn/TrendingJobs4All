import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NewsletterBanner = () => {

  const [isSubscribed, setIsSubscribed] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate('/newsletter');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        type: "spring", 
        stiffness: 100 
      }}
      className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white py-8 px-4 rounded-xl shadow-2xl mx-auto w-full mb-16"
    >
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-pattern"></div>
      
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.05, 0.95, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 5,
          ease: "easeInOut"
        }}
        className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full"
      />
      
      <div className="relative z-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight"
        >
          🚀 Tired of Endless Job Hunting?
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg md:text-xl mb-6 max-w-2xl mx-auto"
        >
          Subscribe to our Premium Newsletter and start receiving hand-picked, personalized job opportunities delivered directly to your mailbox from <strong>TOMORROW</strong>!
        </motion.p>
        
        {!isSubscribed ? (
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            onClick={handleSubscribe}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold 
              px-4 sm:px-8 py-3 sm:py-4 
              text-sm sm:text-xl 
              rounded-full shadow-lg 
              transform hover:scale-105 
              transition-all duration-300 
              max-w-full 
              whitespace-normal 
              break-words 
              inline-block"
          >
            Subscribe Now - Only ₹99/Month!
          </motion.button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold text-yellow-200"
          >
            🎉 Thank You for Subscribing! Get Ready for Amazing Opportunities!
          </motion.div>
        )}
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm mt-4 text-white/70"
        >
          *Personalized job matching | Instant Updates | Cancel Anytime
        </motion.p>
      </div>
    </motion.div>
  );
};

export default NewsletterBanner;
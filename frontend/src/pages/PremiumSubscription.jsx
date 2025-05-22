import React, { useState, useEffect } from 'react';
import { Coffee, Gift, Heart, CreditCard, Send } from 'lucide-react';

const BuyMeCoffee = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (showPaymentModal) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/payment-button.js";
      script.async = true;
      script.setAttribute("data-payment_button_id", import.meta.env.VITE_RAZORPAY);

      const form = document.getElementById("razorpay-form");
      form?.appendChild(script);

      return () => {
        if (form) form.innerHTML = "";
      };
    }
  }, [showPaymentModal]);

  const supportTypes = [
    { 
      label: 'Spark a Conversation', 
      description: 'Help me create engaging content',
      icon: '💡' 
    },
    { 
      label: 'Fuel the Journey', 
      description: 'Support continuous learning',
      icon: '🚀' 
    },
    { 
      label: 'Ignite Creativity', 
      description: 'Empower innovative ideas',
      icon: '🌟' 
    },
    { 
      label: 'Sustain the Mission', 
      description: 'Keep passion projects alive',
      icon: '🌈' 
    }
  ];

  const openPaymentModal = () => {
    setShowPaymentModal(true);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-white to-amber-100 relative overflow-hidden"
    >
      {/* Subtle Coffee Bean Background Animations */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-amber-300 rounded-full opacity-20 animate-float"
            style={{
              width: `${Math.random() * 50 + 20}px`,
              height: `${Math.random() * 50 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl max-w-2xl w-full p-8 transform transition-all hover:scale-[1.01]">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <Coffee className="w-12 h-12 text-amber-600 animate-bounce" />
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-700">
              Support Us
            </h1>
          </div>
          <p className="text-gray-600 max-w-xl mx-auto">
            Your contribution helps me continue creating amazing content.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
          {supportTypes.map((support) => (
            <div
              key={support.label}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-amber-100 text-amber-800"
            >
              <span className="text-4xl mb-2">{support.icon}</span>
              <span className="font-bold text-sm">{support.label}</span>
              <span className="text-xs opacity-70 text-center">{support.description}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4 mb-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-4 sm:w-5 h-4 sm:h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs sm:text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              I understand and agree to the payment terms
            </span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            disabled={!acceptedTerms}
            onClick={openPaymentModal}
            className={`
              w-full flex items-center justify-center gap-3 py-3 rounded-xl transition-all duration-300
              ${(acceptedTerms) 
                ? 'bg-gradient-to-r from-amber-600 to-orange-700 text-white hover:from-amber-700 hover:to-orange-800 transform hover:-translate-y-1' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
          >
            <Heart className="w-5 h-5" />
            Support Now
          </button>
        </div>

        <div className="text-center text-xs text-gray-500 mt-4 flex justify-center items-center gap-2">
          <Gift className="w-4 h-4" />
          <p>Your support helps create more amazing content</p>
        </div>

        {/* Payment Modal with Razorpay Integration */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all relative">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 mb-6">
                  Support Us
                </p>
                <form id="razorpay-form" className="text-center mt-4"></form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyMeCoffee;
import React, { useState, useEffect } from 'react';
import { 
  FileText,
  DollarSign,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import RelatedLinks from '../components/RelatedLinks';
import { useSelector } from 'react-redux';
import MyInterviews from '../components/MyInterviews';
import MySalary from '../components/MySalary';

export default function MyCorner() {
  const { currentUser } = useSelector((state) => state.user);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('interview');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'interview', icon: FileText, label: 'Interview Exp.' },
    { id: 'salary', icon: DollarSign, label: 'Salary Structures' },
  ];

  const handleMenuItemClick = (itemId) => {
    setActiveItem(itemId);
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const getActiveComponent = () => {
    switch (activeItem) {
      case 'interview':
        return <MyInterviews />;
      case 'salary':
        return <MySalary />;
      default:
        return <div className="p-8">Select a menu item</div>;
    }
  };

  return (
    <>
      <Helmet>
        <title>My Corner | Personal Dashboard - Route2Hire QA & SDET Platform</title>
        <meta
          name="description"
          content="Access your personal dashboard on Route2Hire. Manage your QA, SDET and Test Automation interview experiences and salary data in one place for software testing professionals."
        />
        <meta
          name="keywords"
          content="Personal dashboard, My corner, QA dashboard, SDET dashboard, Test Automation dashboard, User dashboard, Personal workspace, QA career management"
        />
        <meta property="og:title" content="My Corner | Personal Dashboard - Route2Hire QA & SDET Platform" />
        <meta
          property="og:description"
          content="Access your personal dashboard for QA, SDET, and Test Automation career management. Manage interviews and career resources."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/mycorner" />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href="https://route2hire.com/mycorner" />
      </Helmet>

      <div className="flex h-screen overflow-hidden">

      <div className="absolute top-16 left-0 right-0 h-16 bg-white shadow-md z-40 md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center justify-center h-full">
          <span className="font-semibold text-lg text-gray-800">MyCorner</span>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div 
        className={`fixed md:relative h-screen bg-white shadow-xl transition-all duration-300 ease-in-out z-50
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex-shrink-0 pt-16 md:pt-0`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-blue-600 p-1.5 rounded-full text-white hover:bg-blue-700 transition-colors hidden md:block"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <X size={16} />}
        </button>

        <div className="p-4 items-center space-x-4 hidden md:flex">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Menu className="text-white" size={24} />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg text-gray-800">MyCorner</span>
          )}
        </div>

        <nav className="mt-8 px-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item.id)}
              className={`w-full flex items-center py-3 px-4 rounded-lg mb-2 transition-all duration-200
                ${activeItem === item.id 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <item.icon size={20} />
              {!isCollapsed && (
                <span className="ml-4 font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'}`}>
            <div className="relative w-10 h-10">
              <img 
                src={currentUser.profilePicture}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-800">{currentUser.username}</h4>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 w-full pt-16 md:pt-0 h-[calc(100vh-64px)] md:h-full relative">
        <div className="absolute top-4 left-4 z-10 hidden md:block">
          <Breadcrumb 
            items={[
              { label: 'My Corner' }
            ]}
          />
        </div>
        {getActiveComponent()}
        
        <div className="px-4 pb-8 mt-8">
          <RelatedLinks type="general" />
        </div>
      </div>
      </div>
    </>
  );
}

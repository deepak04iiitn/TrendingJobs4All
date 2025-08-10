import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Users, 
  MessageCircle, 
  Briefcase, 
  FileSpreadsheet, 
  DollarSign, 
  Award 
} from 'lucide-react';

const PlatformStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [previousStatistics, setPreviousStatistics] = useState(null); // For storing previous statistics
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // Fetch current statistics
        const statisticsResponse = await fetch('/backend/admin/statistics');
        const statisticsData = await statisticsResponse.json();
        console.log(statisticsData);  // Check the structure of data

        // Save the previous statistics data to calculate percentage changes
        setPreviousStatistics(statistics); 

        // Transform the data into a suitable format for the chart
        if (statisticsData) {
          const chartData = [
            {
              name: 'Current', // You can customize this label, e.g., 'Current' or '2024'
              Users: statisticsData.usersLength,
              Comments: statisticsData.commentsLength,
              Experiences: statisticsData.interviewExperiencesLength,
              Referrals: statisticsData.referralsLength,
              resumeTemplatesLength: statisticsData.resumeTemplatesLength, // Check if these fields exist
            salariesLength: statisticsData.salariesLength
            }
          ];
          setStatistics(chartData);
        } else {
          setStatistics([]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching platform statistics:', error);
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Function to calculate percentage change
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? '∞' : '0%'; // Handle division by zero
    return ((current - previous) / previous * 100).toFixed(2) + '%';
  };

  const StatCard = ({ icon, title, count, previousCount, color, animation }) => {
    const percentageChange = previousCount !== undefined ? calculatePercentageChange(count, previousCount) : 'N/A';
    const isPositive = parseFloat(percentageChange) > 0;

    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transform transition-all duration-500 hover:scale-105 hover:shadow-xl ${color} ${animation}`}>
        <div className="flex items-center justify-between mb-4">
          {React.createElement(icon, { 
            className: `w-12 h-12 text-${color.split('-')[1]}-600 dark:text-${color.split('-')[1]}-400 transition-all duration-300 hover:scale-125` 
          })}
          <div className="text-right">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {title}
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {loading ? '...' : count}
            </p>
            {previousCount !== undefined && (
              <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'} mt-1`}>
                {isPositive ? '+' : ''}{percentageChange} {isPositive ? '↑' : '↓'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 mt-12">
      {/* Statistics Cards */}
      <StatCard 
        icon={Users} 
        title="Total Users" 
        count={statistics?.[0]?.Users} 
        previousCount={previousStatistics?.[0]?.Users} 
        color="border-l-4 border-blue-500"
        animation="transition-transform duration-700 transform hover:scale-105"
      />
      <StatCard 
        icon={MessageCircle} 
        title="Comments" 
        count={statistics?.[0]?.Comments} 
        previousCount={previousStatistics?.[0]?.Comments} 
        color="border-l-4 border-green-500"
        animation="transition-transform duration-700 transform hover:scale-105"
      />
      <StatCard 
        icon={Briefcase} 
        title="Interview Experiences" 
        count={statistics?.[0]?.Experiences} 
        previousCount={previousStatistics?.[0]?.Experiences} 
        color="border-l-4 border-purple-500"
        animation="transition-transform duration-700 transform hover:scale-105"
      />
      <StatCard 
        icon={FileSpreadsheet} 
        title="Resume Templates" 
        count={statistics?.[0]?.resumeTemplatesLength} 
        previousCount={previousStatistics?.[0]?.resumeTemplatesLength} 
        color="border-l-4 border-yellow-500"
        animation="transition-transform duration-700 transform hover:scale-105"
      />
      <StatCard 
        icon={DollarSign} 
        title="Salary Insights" 
        count={statistics?.[0]?.salariesLength} 
        previousCount={previousStatistics?.[0]?.salariesLength} 
        color="border-l-4 border-indigo-500"
        animation="transition-transform duration-700 transform hover:scale-105"
      />
      <StatCard 
        icon={Award} 
        title="Referrals" 
        count={statistics?.[0]?.Referrals} 
        previousCount={previousStatistics?.[0]?.Referrals} 
        color="border-l-4 border-red-500"
        animation="transition-transform duration-700 transform hover:scale-105"
      />

      {/* Trend Visualization (BarChart) */}
      {statistics && statistics.length > 0 && (
        <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-500 hover:scale-105 hover:shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Platform Growth Trends
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statistics}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.9)', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }} 
              />
              <Bar dataKey="Users" fill="#3B82F6" />
              <Bar dataKey="Comments" fill="#10B981" />
              <Bar dataKey="Experiences" fill="#8B5CF6" />
              <Bar dataKey="Referrals" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default PlatformStatistics;

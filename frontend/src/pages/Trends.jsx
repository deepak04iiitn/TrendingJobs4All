import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine,
  ComposedChart,
  Area
} from 'recharts';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp, BarChart3, PieChart } from 'lucide-react';

const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  // const year = d.getFullYear();
  return `${day}/${month}`;
};

const getLastTenDays = () => {
  const dates = [];
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(formatDate(date));
  }
  return dates; // No need to reverse here, we'll reverse later
};

export default function TrendsVisualization() {
  const [jobsData, setJobsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const jobsResponse = await axios.get("/backend/naukri");

        const lastTenDays = getLastTenDays();

        const completeData = lastTenDays.map(day => {
          const jobsOnDay = jobsResponse.data.filter(
            job => formatDate(new Date(job.time)) === day
          ).length;

          return {
            date: day,
            jobsCount: jobsOnDay,
            movingAverage: calculateMovingAverage(jobsOnDay, jobsData)
          };
        }).reverse(); // Reverse to show latest dates first

        setJobsData(completeData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateMovingAverage = (currentValue, previousData) => {
    if (previousData.length < 3) return currentValue;
    const lastThreeValues = previousData.slice(-3).map(d => d.jobsCount);
    return (currentValue + lastThreeValues.reduce((a, b) => a + b, 0)) / 4;
  };

  const LoadingSpinner = () => (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Loader2 
          className="text-purple-600" 
          size={84} 
          strokeWidth={1.5}
        />
      </motion.div>
      <p className="mt-6 text-2xl text-gray-700 font-light tracking-wide">
        Analyzing Job Market Trends...
      </p>
    </motion.div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-white to-gray-100 p-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header with Descriptive Insights */}
        <motion.div 
          className="text-center mb-16 p-8 bg-white rounded-2xl shadow-xl border border-gray-100"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-5xl font-extralight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            Job Market Pulse
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Discover the ever-changing job market with our interactive dashboards!  
          Get real-time insights into the latest trends, showing how job opportunities have shifted over the past 10 days.  
          Stay informed and make smarter career decisions with clear, data-driven visuals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Bar Chart */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white shadow-2xl rounded-2xl p-6 border border-gray-100"
          >
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="text-purple-600 mr-2" />
              <h2 className="text-2xl font-light text-gray-700">
                Daily Job Postings
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={jobsData}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6a11cb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2575fc" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  stroke="#f3f3f3" 
                  strokeDasharray="3 3" 
                />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  label={{ 
                    value: 'Number of Job Postings', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle' } 
                  }}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    borderRadius: '12px',
                    color: 'white' 
                  }} 
                />
                <Bar 
                  dataKey="jobsCount" 
                  fill="url(#colorUv)" 
                  barSize={30}
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Line Chart */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white shadow-2xl rounded-2xl p-6 border border-gray-100"
          >
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="text-pink-600 mr-2" />
              <h2 className="text-2xl font-light text-gray-700">
                Job Market Trend
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={jobsData}>
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6a88" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#ff99ac" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  stroke="#f3f3f3" 
                  strokeDasharray="3 3" 
                />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  label={{ 
                    value: 'Jobs Volume', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle' } 
                  }}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    borderRadius: '12px',
                    color: 'white' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="jobsCount" 
                  fillOpacity={0.3} 
                  stroke="#ff6a88" 
                  fill="url(#colorPv)"
                />
                <Line 
                  type="monotone" 
                  dataKey="movingAverage" 
                  stroke="#ff99ac" 
                  strokeWidth={3}
                  dot={false}
                />
                <ReferenceLine 
                  y={jobsData.reduce((a, b) => a + b.jobsCount, 0) / jobsData.length} 
                  stroke="#8884d8" 
                  strokeDasharray="3 3" 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
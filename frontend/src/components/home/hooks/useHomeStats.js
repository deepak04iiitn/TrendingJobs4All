import { useEffect, useState } from 'react';

export default function useHomeStats() {
  const [jobsCount, setJobsCount] = useState('2500+');
  const [usersCount, setUsersCount] = useState('1000+');

  useEffect(() => {
    const formatCount = (count) =>
      count >= 1000 ? `${(count / 1000).toFixed(1)}K+` : `${count}+`;

    const fetchStatistics = async () => {
      try {
        const [llmsRes, usersRes] = await Promise.all([
          fetch('/llms-stats'),
          fetch('/llms/users-count'),
        ]);

        if (llmsRes.ok) {
          const llmsData = await llmsRes.json();
          if (llmsData?.stats?.dynamicItems?.jobs) {
            setJobsCount(formatCount(llmsData.stats.dynamicItems.jobs));
          }
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData?.usersCount !== undefined) {
            setUsersCount(formatCount(usersData.usersCount));
          }
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, []);

  return { jobsCount, usersCount };
}

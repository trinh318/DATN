// src/pages/ReportPage.js

import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ReportPage = () => {
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reports/summary');
        setReportData(response.data);
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
    };

    fetchReportData();
  }, []);

  if (!reportData) {
    return <div>Loading...</div>;
  }

  // Dữ liệu cho biểu đồ User Activity
  const userActivityData = {
    labels: reportData.userActivityReports.map(report => report._id),
    datasets: [
      {
        label: 'Total Actions',
        data: reportData.userActivityReports.map(report => report.totalActions),
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  // Dữ liệu cho biểu đồ Job Activity
  const jobActivityData = {
    labels: reportData.jobActivityReports.map(report => report._id),
    datasets: [
      {
        label: 'Total Views',
        data: reportData.jobActivityReports.map(report => report.totalViews),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Applications',
        data: reportData.jobActivityReports.map(report => report.totalApplications),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Dữ liệu cho biểu đồ Company Activity
  const companyActivityData = {
    labels: reportData.companyActivityReports.map(report => report._id),
    datasets: [
      {
        label: 'Total Followers',
        data: reportData.companyActivityReports.map(report => report.totalFollowers),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Jobs Posted',
        data: reportData.companyActivityReports.map(report => report.totalJobsPosted),
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2>User Activity Report</h2>
      <Line data={userActivityData} />

      <h2>Job Activity Report</h2>
      <Bar data={jobActivityData} options={{ responsive: true }} />

      <h2>Company Activity Report</h2>
      <Bar data={companyActivityData} options={{ responsive: true }} />
    </div>
  );
};

export default ReportPage;

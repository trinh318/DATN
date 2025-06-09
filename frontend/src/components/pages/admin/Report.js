import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement } from 'chart.js';
import '../../../styles/report.css';

// Đăng ký các thành phần cần thiết
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement // Đăng ký ArcElement cho Pie chart
);

const Report = () => {
    const [userStats, setUserStats] = useState({});
    const [jobStats, setJobStats] = useState({});
    const [companyStats, setCompanyStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(''); // State cho năm
    const [stats, setStats] = useState({});
    const [year, setYear] = useState('all');
    const [companyId, setCompanyId] = useState('');
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/reports/report-statistics/alls', {
                    params: { year: selectedYear }, // Truyền năm vào query params
                });
                const { users, jobs, companies } = response.data;

                setUserStats(users);
                setJobStats(jobs);
                setCompanyStats(companies);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, [selectedYear]); // Gọi lại API khi selectedYear thay đổi

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/reports/report-statistics/application/all', {
                    params: { year, companyId },
                });
                setStats(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [year, companyId]);

    useEffect(() => {
        // Fetch danh sách công ty từ API
        const fetchCompanies = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/companies/companies/id-name');
                const data = await response.json();
                setCompanies(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };

        fetchCompanies();
    }, []);

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value); // Cập nhật state khi chọn năm
    };


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="admin-report-container">
            <div className="admin-report-header">
                <h1>Dashboard Thống Kê</h1>
            </div>

            <div className="admin-report-charts">
                <div className="admin-report-chart-card admin-report-pie-chart">
                    <h2>Thống kê người dùng theo vai trò</h2>
                    <Pie
                        data={{
                            labels: ['Ứng viên', 'Nhà tuyển dụng', 'Admin'],
                            datasets: [
                                {
                                    label: 'Số lượng người dùng',
                                    data: [userStats.applicant, userStats.recruiter, userStats.admin],
                                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                                },
                            ],
                        }}
                    />
                </div>

                <div className="admin-report-chart-card">
                    <h2>Thống kê công việc theo loại</h2>
                    <Bar
                        data={{
                            labels: ['Full-time', 'Part-time', 'Thực tập'],
                            datasets: [
                                {
                                    label: 'Số lượng công việc',
                                    data: [jobStats.full_time, jobStats.part_time, jobStats.internship],
                                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                                },
                            ],
                        }}
                    />
                </div>

                <div className="admin-report-chart-card">
                    <h2>Số lượng công ty mới theo thời gian</h2>
                    <div className="admin-report-filter">
                        <label htmlFor="year-filter">Chọn Năm:</label>
                        <select id="year-filter" value={selectedYear} onChange={handleYearChange}>
                            <option value="">Tất cả</option>
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                    <Line
                        data={{
                            labels: companyStats.months,
                            datasets: [
                                {
                                    label: 'Số công ty mới',
                                    data: companyStats.count,
                                    borderColor: '#36A2EB',
                                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                },
                            ],
                        }}
                    />
                </div>
            </div>
            {/* Bộ lọc */}
            <div className="filter-section">
                <label>
                    Chọn năm:
                    <select value={year} onChange={(e) => setYear(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                    </select>
                </label>

                <label>
                    Chọn công ty:
                    <select
                        value={companyId}
                        onChange={(e) => setCompanyId(e.target.value)}
                    >
                        <option value="">Tất cả công ty</option>
                        {companies.map((company) => (
                            <option key={company._id} value={company._id}>
                                {company.company_name}
                            </option>
                        ))}
                    </select>
                </label>

            </div>

            {/* Tổng số liệu */}
            <div className="admin-report-summary">
                <div className="summary-card">
                    <h3>Số công việc đã đăng</h3>
                    <p>{stats.jobsPosted?.reduce((acc, item) => acc + (item.yearTotal || 0), 0) || 0}</p>
                </div>
                <div className="summary-card">
                    <h3>Số công việc được ứng tuyển</h3>
                    <p>{stats.jobsApplied?.reduce((acc, item) => acc + (item.yearTotal || 0), 0) || 0}</p>
                </div>
                <div className="summary-card">
                    <h3>Tổng số người dùng</h3>
                    <p>{stats.totalApplicants || 0}</p>
                </div>
            </div>

            {/* Biểu đồ */}
            <div className="admin-report-charts">
                {/* Biểu đồ ứng tuyển theo tháng và năm */}
                <div className="chart-container">
                    <h2>Số lượng ứng tuyển theo tháng và năm</h2>
                    <Line
                        data={{
                            labels: stats.jobsApplied
                                ?.flatMap((item) =>
                                    item.months.map(
                                        (monthData) => `Tháng ${monthData.month} - ${item._id}`
                                    )
                                ) || [],
                            datasets: [
                                {
                                    label: 'Số ứng tuyển',
                                    data: stats.jobsApplied
                                        ?.flatMap((item) => item.months.map((monthData) => monthData.count)) || [],
                                    borderColor: '#36A2EB',
                                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                },
                            ],
                        }}
                    />
                </div>

                {/* Biểu đồ công việc đã đăng theo tháng và năm */}
                <div className="chart-container">
                    <h2>Số lượng công việc đã đăng</h2>
                    <Line
                        data={{
                            labels: stats.jobsPosted
                                ?.flatMap((item) =>
                                    item.months.map(
                                        (monthData) => `Tháng ${monthData.month} - ${item._id}`
                                    )
                                ) || [],
                            datasets: [
                                {
                                    label: 'Công việc đã đăng',
                                    data: stats.jobsPosted
                                        ?.flatMap((item) => item.months.map((monthData) => monthData.count)) || [],
                                    borderColor: '#FF6384',
                                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                },
                            ],
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Report;

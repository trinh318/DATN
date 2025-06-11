import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement } from 'chart.js';
import '../../../styles/report.css';
import { Combobox } from '@headlessui/react';
import { ChevronsUpDown, Check, Building2, Calendar } from 'lucide-react';
import { useMemo } from 'react';

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

    const years = ['', '2023', '2024', '2025'];
    const [query, setQuery] = useState('');

    const filteredYears = years.filter((year) =>
        year === '' || year.includes(query)
    );

    const displayYear = (year) => (year === '' ? 'Tất cả' : year);

    const years2 = [
        { label: 'Tất cả', value: '' },
        { label: '2023', value: '2023' },
        { label: '2024', value: '2024' },
        { label: '2025', value: '2025' }
    ];

    const [year2, setYear2] = useState('');

    const selectedItem = years2.find((y) => y.value === year2);
    const [yearQuery, setYearQuery] = useState('');

    const filteredYears2 = years2.filter((y) =>
        y.label.toLowerCase().includes((yearQuery || '').toLowerCase())
    );

    const [companyQuery, setCompanyQuery] = useState('');

    const selectedCompany =
        companies.find((c) => c._id === companyId) || { _id: '', company_name: 'All companies' };

    const filteredCompanies = useMemo(() => {
        if (!companyQuery) return [{ _id: '', company_name: 'All companies' }, ...companies];
        return companies
            .filter((c) =>
                c.company_name.toLowerCase().includes((companyQuery || '').toLowerCase())
            )
            .map((c) => ({ _id: c._id, company_name: c.company_name }));
    }, [companyQuery, companies]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                <div className="bg-white rounded-xl shadow-md p-5 text-center">
                    <h2 className="text-base font-semibold text-gray-800 mb-5">Roles</h2>
                    <Pie
                        data={{
                            labels: ['Ứng viên', 'Nhà tuyển dụng', 'Admin'],
                            datasets: [{
                                label: 'Số lượng người dùng',
                                data: [userStats.applicant, userStats.recruiter, userStats.admin],
                                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                            }],
                        }}
                    />
                </div>

                <div className="bg-white rounded-xl shadow-md p-5 text-center">
                    <h2 className="text-base font-semibold text-gray-800 mb-5">Job type</h2>
                    <Bar
                        data={{
                            labels: ['Full-time', 'Part-time', 'Thực tập'],
                            datasets: [{
                                label: 'Số lượng công việc',
                                data: [jobStats.full_time, jobStats.part_time, jobStats.internship],
                                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                            }],
                        }}
                    />
                </div>

                <div className="bg-white rounded-xl shadow-md p-5 text-center">
                    <h2 className="text-base font-semibold text-gray-800 mb-5">Companies</h2>
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <label className="font-light flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            Year:
                        </label>
                        <Combobox value={selectedYear} onChange={setSelectedYear}>
                            <div className="relative w-32">
                                <Combobox.Input
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    displayValue={displayYear}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Chọn năm..."
                                />
                                <Combobox.Button className="absolute inset-y-0 right-2 flex items-center">
                                    <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                                </Combobox.Button>
                                {filteredYears.length > 0 && (
                                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white border border-gray-200 shadow-lg text-sm">
                                        {filteredYears.map((year) => (
                                            <Combobox.Option
                                                key={year || 'all'}
                                                value={year}
                                                className={({ active }) =>
                                                    `cursor-pointer px-4 py-2 ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-800'}`
                                                }
                                            >
                                                {displayYear(year)}
                                            </Combobox.Option>
                                        ))}
                                    </Combobox.Options>
                                )}
                            </div>
                        </Combobox>
                    </div>
                    <Line
                        data={{
                            labels: companyStats.months,
                            datasets: [{
                                label: 'Số công ty mới',
                                data: companyStats.count,
                                borderColor: '#36A2EB',
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            }],
                        }}
                    />
                </div>
            </div>

            <div className="flex flex-wrap justify-between items-center bg-white rounded-lg shadow-md p-4 mb-10">
                <div className="flex items-center gap-2 text-base mr-4">
                    <label className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        Year:
                    </label>
                    <Combobox value={selectedItem} onChange={(item) => setYear(item.value)}>
                        <div className="relative w-36">
                            <Combobox.Input
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                displayValue={(item) => item?.label || ''}
                                onChange={(e) => setYearQuery(e.target.value)}
                            />
                            <Combobox.Button className="absolute inset-y-0 right-2 flex items-center">
                                <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                            </Combobox.Button>
                            {filteredYears2.length > 0 && (
                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white border border-gray-200 shadow-lg text-sm">
                                    {filteredYears2.map((item) => (
                                        <Combobox.Option
                                            key={item.value}
                                            value={item}
                                            className={({ active }) =>
                                                `cursor-pointer px-4 py-2 ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-800'
                                                }`
                                            }
                                        >
                                            {item.label}
                                        </Combobox.Option>
                                    ))}
                                </Combobox.Options>
                            )}
                        </div>
                    </Combobox>
                </div>

                <div className="flex items-center gap-2 text-base">
                    <label className="flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        Company:
                    </label>
                    <Combobox
                        value={selectedCompany}
                        onChange={(company) => setCompanyId(company._id)}
                    >
                        <div className="relative w-60">
                            <Combobox.Input
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                displayValue={(company) => company?.company_name || ''}
                                onChange={(e) => setCompanyQuery(e.target.value)}
                                placeholder="Chọn công ty..."
                            />
                            <Combobox.Button className="absolute inset-y-0 right-2 flex items-center">
                                <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                            </Combobox.Button>
                            {filteredCompanies.length > 0 && (
                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white border border-gray-200 shadow-lg text-sm">
                                    {filteredCompanies.map((company) => (
                                        <Combobox.Option
                                            key={company._id || 'all'}
                                            value={company}
                                            className={({ active }) =>
                                                `cursor-pointer px-4 py-2 ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-800'
                                                }`
                                            }
                                        >
                                            {company.company_name}
                                        </Combobox.Option>
                                    ))}
                                </Combobox.Options>
                            )}
                        </div>
                    </Combobox>
                </div>

            </div>

            <div className="flex flex-wrap justify-between mb-10">
                <div className="bg-white p-5 rounded-lg shadow-md text-center w-full md:w-[30%] mb-5 md:mb-0">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Jobs</h3>
                    <p className="text-2xl font-bold text-blue-400">
                        {stats.jobsPosted?.reduce((acc, item) => acc + (item.yearTotal || 0), 0) || 0}
                    </p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md text-center w-full md:w-[30%] mb-5 md:mb-0">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Applicants</h3>
                    <p className="text-2xl font-bold text-blue-400">
                        {stats.jobsApplied?.reduce((acc, item) => acc + (item.yearTotal || 0), 0) || 0}
                    </p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md text-center w-full md:w-[30%]">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Users</h3>
                    <p className="text-2xl font-bold text-blue-400">
                        {stats.totalApplicants || 0}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap justify-between gap-4">
                <div className="bg-white p-5 rounded-lg shadow-md w-full md:w-[48%]">
                    <h2 className="text-xl font-semibold text-center text-gray-800 mb-5">Applicants</h2>
                    <Line
                        data={{
                            labels: stats.jobsApplied?.flatMap((item) => item.months.map((monthData) => `Tháng ${monthData.month} - ${item._id}`)) || [],
                            datasets: [{
                                label: 'Số ứng tuyển',
                                data: stats.jobsApplied?.flatMap((item) => item.months.map((monthData) => monthData.count)) || [],
                                borderColor: '#36A2EB',
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            }],
                        }}
                    />
                </div>

                <div className="bg-white p-5 rounded-lg shadow-md w-full md:w-[48%]">
                    <h2 className="text-base font-semibold text-center text-gray-800 mb-5">Jobs</h2>
                    <Line
                        data={{
                            labels: stats.jobsPosted?.flatMap((item) => item.months.map((monthData) => `Tháng ${monthData.month} - ${item._id}`)) || [],
                            datasets: [{
                                label: 'Công việc đã đăng',
                                data: stats.jobsPosted?.flatMap((item) => item.months.map((monthData) => monthData.count)) || [],
                                borderColor: '#FF6384',
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            }],
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Report;

import '../../../styles/reportreview.css';
import '../../../styles/reportrecruiter.css';
import React, { useState } from "react";
import { CartesianGrid } from 'recharts';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import '../../../styles/companyprofile.css';
import { getId } from '../../../libs/isAuth';
import axios from "axios";
import { useEffect } from "react";
import { FaStream } from 'react-icons/fa';
import { FaEye, FaUsers, FaChartLine, FaBriefcase, FaCogs, FaBalanceScale, FaStar, FaChartBar } from 'react-icons/fa';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Cell, Legend,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import { MdViewList, MdGridView } from "react-icons/md";
import {
    faChartLine,
    faBriefcase,
    faUsers,
    faCogs,
    faBalanceScale,
    faStar,
    faChartBar
} from '@fortawesome/free-solid-svg-icons';
import {
    UserPlus,
    Loader2,
    CheckCircle2,
    XCircle,
    Briefcase,
    Hourglass,
    Star,
    Eye,
    Megaphone,
    MailOpen,
    Bookmark,
    Percent,

} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/control/ui/dropdown-menu";

const detailStats = {
    salary_benefits: 4,
    training: 3,
    management: 4,
    culture: 3,
    workspace: 4,
};

const recommendStats = [
    { name: "Giới thiệu", value: 8 },
    { name: "Không giới thiệu", value: 2 },
];

const COLORS = ["#5483b3", "#5dbcc2"];
const COLORS1 = ["#7abab4", "#09d1c7"]
const comments = [
    {
        user: "Ẩn danh",
        comment: "Công ty tốt, môi trường làm việc chuyên nghiệp.",
        suggestion: "Nên cải thiện về chế độ lương thưởng và minh bạch KPI.",
    },
    {
        user: "Nguyễn Văn A",
        comment: "Không hài lòng về việc làm thêm mà không có phụ cấp.",
        suggestion: "Cần minh bạch trong việc phân bổ KPI.",
    },
];

const Report = () => {
    const [view, setView] = useState('grid');
    const [activeTab, setActiveTab] = useState('overview');
    const handleTabClick = (tab) => setActiveTab(tab);

    const userId = getId();

    const [selectedRange, setSelectedRange] = useState('month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [reportAply, setReportAply] = useState('');
    const [positionData, setPositionData] = useState([]);
    const [sourceData, setSourceData] = useState({ sourceStats: [], timeStats: [] });
    const [processData, setProcessData] = useState({
        stageTimeStats: [],
        conversionStats: [],
        interviewerStats: []
    });
    const [diversityData, setDiversityData] = useState({
        genderStats: [],
        ageStats: [],
        educationStats: [],
        experienceStats: []
    });
    const [qualityData, setQualityData] = useState({
        skillStats: [],
        interviewStats: [],
        feedbackStats: [],
        retentionStats: []
    });
    const [trendData, setTrendData] = useState({
        applicationTrends: [],
        interviewTrends: [],
        hiringTrends: [],
        sourceTrends: []
    });

    const getDateRangeFromSelectedRange = () => {
        const today = new Date();
        let startDate, endDate;

        if (selectedRange === 'today') {
            startDate = endDate = today;
        } else if (selectedRange === 'week') {
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            endDate = today;
        } else if (selectedRange === 'month') {
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 1);
            endDate = today;
        } else if (selectedRange === 'custom') {
            startDate = new Date(customStartDate);
            endDate = new Date(customEndDate);
        }

        // Format YYYY-MM-DD
        const format = (d) => d.toISOString().split('T')[0];
        return { startDate: format(startDate), endDate: format(endDate) };
    };

    const fetchData = async () => {
        try {
            const { startDate, endDate } = getDateRangeFromSelectedRange();
            const query = `?range=${selectedRange}&startDate=${startDate}&endDate=${endDate}`;

            const response = await axios.get(`http://localhost:5000/api/reports/reports/overview/${userId}${query}`);
            setReportAply(response.data);
            console.log("Report data:", response);
            // setState hoặc xử lý data ở đây
        } catch (error) {
            console.error("Lỗi khi lấy báo cáo:", error);
        }
    };

    const fetchPositionData = async () => {
        try {
            const { startDate, endDate } = getDateRangeFromSelectedRange();
            const query = `?range=${selectedRange}&startDate=${startDate}&endDate=${endDate}`;
            const response = await axios.get(`http://localhost:5000/api/reports/position/${userId}${query}`);
            setPositionData(response.data.positions);
            console.log("thong tin bao cao la", response.data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu position:", error);
        }
    };

    const fetchSourceData = async () => {
        try {
            const { startDate, endDate } = getDateRangeFromSelectedRange();
            const query = `?range=${selectedRange}&startDate=${startDate}&endDate=${endDate}`;
            const response = await axios.get(`http://localhost:5000/api/reports/source/${userId}${query}`);
            setSourceData(response.data);
            console.log("Source data:", response.data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu nguồn:", error);
        }
    };

    const fetchProcessData = async () => {
        try {
            const { startDate, endDate } = getDateRangeFromSelectedRange();
            const query = `?range=${selectedRange}&startDate=${startDate}&endDate=${endDate}`;
            const response = await axios.get(`http://localhost:5000/api/reports/process/${userId}${query}`);
            setProcessData(response.data);
            console.log("Process data:", response.data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu quy trình:", error);
        }
    };

    const fetchDiversityData = async () => {
        try {
            const { startDate, endDate } = getDateRangeFromSelectedRange();
            const query = `?range=${selectedRange}&startDate=${startDate}&endDate=${endDate}`;
            const response = await axios.get(`http://localhost:5000/api/reports/diversity/${userId}${query}`);
            setDiversityData(response.data);
            console.log("Diversity data:", response.data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu đa dạng:", error);
        }
    };

    const fetchQualityData = async () => {
        try {
            const { startDate, endDate } = getDateRangeFromSelectedRange();
            const query = `?range=${selectedRange}&startDate=${startDate}&endDate=${endDate}`;
            const response = await axios.get(`http://localhost:5000/api/reports/quality/${userId}${query}`);
            setQualityData(response.data);
            console.log("Quality data:", response.data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu chất lượng:", error);
        }
    };

    const fetchTrendData = async () => {
        try {
            const { startDate, endDate } = getDateRangeFromSelectedRange();
            const query = `?range=${selectedRange}&startDate=${startDate}&endDate=${endDate}`;
            const response = await axios.get(`http://localhost:5000/api/reports/trend/${userId}${query}`);
            setTrendData(response.data);
            console.log("Trend data:", response.data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu xu hướng:", error);
        }
    };

    useEffect(() => {
        if (selectedRange === 'custom' && (!customStartDate || !customEndDate)) return;
        fetchData();
        fetchPositionData();
        fetchSourceData();
        fetchProcessData();
        fetchDiversityData();
        fetchQualityData();
        fetchTrendData();
    }, [selectedRange, customStartDate, customEndDate]);

    function generateCoolSoftColors(count) {
        const colors = new Set();
        while (colors.size < count) {
            // Hue tông lạnh: xanh dương (~180–260), tím (~260–300), xanh lá dịu (~140–170)
            const hue = Math.floor(Math.random() * 100) + 160; // 160–260
            const color = `hsl(${hue}, 65%, 60%)`; // dịu: vừa phải độ bão hòa, sáng cao
            colors.add(color);
        }
        return Array.from(colors);
    }

    const COLORS = generateCoolSoftColors(diversityData.educationStats.length);

    return (
        <>
            <div className="flex flex-col gap-5 w-full">
                <div className='flex gap-5 pb-3'>
                    <FaStream className="w-3 text-gray-700" />
                    <p className="font-semibold text-sm text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Reports</p>
                </div>
                <div className="w-full relative flex flex-col gap-2 items-start rounded-2xl">
                    <div className="w-full flex flex-wrap gap-2 justify-start items-center text-sm">
                        <button
                            className={`text-xs px-1 pb-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'overview' ? 'text-[#0077b6] border-b-2 border-[#0077b6]' : 'text-gray-700'
                                }`}
                            onClick={() => handleTabClick('overview')}
                        >
                            <FaChartLine /> Tổng quan
                        </button>
                        <span className="px-1 pb-3 text-gray-400">|</span>

                        <button
                            className={`text-xs px-1 pb-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'position' ? 'text-[#0077b6] border-b-2 border-[#0077b6]' : 'text-gray-700'
                                }`}
                            onClick={() => handleTabClick('position')}
                        >
                            <FaBriefcase /> Công việc
                        </button>
                        <span className="px-1 pb-3 text-gray-400">|</span>

                        {/**<button
                            className={`text-xs px-1 pb-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'source' ? 'text-[#0077b6] border-b-2 border-[#0077b6]' : 'text-gray-700'
                                }`}
                            onClick={() => handleTabClick('source')}
                        >
                            <FaUsers /> Nguồn tuyển
                        </button>
                        <span className="px-1 pb-3 text-gray-400">|</span> */}

                        <button
                            className={`text-xs px-1 pb-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'process' ? 'text-[#0077b6] border-b-2 border-[#0077b6]' : 'text-gray-700'
                                }`}
                            onClick={() => handleTabClick('process')}
                        >
                            <FaCogs /> Quy trình
                        </button>
                        <span className="px-1 pb-3 text-gray-400">|</span>

                        <button
                            className={`text-xs px-1 pb-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'diversity' ? 'text-[#0077b6] border-b-2 border-[#0077b6]' : 'text-gray-700'
                                }`}
                            onClick={() => handleTabClick('diversity')}
                        >
                            <FaBalanceScale /> Đa dạng
                        </button>
                        <span className="px-1 pb-3 text-gray-400">|</span>

                        <button
                            className={`text-xs px-1 pb-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'quality' ? 'text-[#0077b6] border-b-2 border-[#0077b6]' : 'text-gray-700'
                                }`}
                            onClick={() => handleTabClick('quality')}
                        >
                            <FaStar /> Chất lượng
                        </button>
                        <span className="px-1 pb-3 text-gray-400">|</span>

                        <button
                            className={`text-xs px-1 pb-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'trend' ? 'text-[#0077b6] border-b-2 border-[#0077b6]' : 'text-gray-700'
                                }`}
                            onClick={() => handleTabClick('trend')}
                        >
                            <FaChartBar /> Xu hướng
                        </button>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <div className='flex gap-10 items-center'>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Lọc theo thời gian:</label>
                                <select
                                    className="text-sm px-3 py-2 rounded-md border border-gray-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:border-transparent transition"
                                    value={selectedRange}
                                    onChange={(e) => setSelectedRange(e.target.value)}
                                >
                                    <option value="today">Hôm nay</option>
                                    <option value="week">1 Tuần qua</option>
                                    <option value="month">1 Tháng qua</option>
                                    <option value="custom">Tùy chọn</option>
                                </select>
                            </div>

                            {selectedRange === 'custom' && (
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-gray-700">Từ:</label>
                                        <input
                                            type="date"
                                            className="text-sm px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:border-transparent transition"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-gray-700">Đến:</label>
                                        <input
                                            type="date"
                                            className="text-sm px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:border-transparent transition"
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        {activeTab === 'overview' && (
                            <div className="flex items-center space-x-4">
                                {/* List View Button */}
                                <button
                                    onClick={() => setView("list")}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full border ${view === "list"
                                        ? "bg-blue-700 text-white"
                                        : "border-blue-300 text-blue-600 hover:bg-blue-100"
                                        }`}
                                >
                                    <MdViewList className="text-xl" />
                                </button>

                                {/* Grid View Button */}
                                <button
                                    onClick={() => setView("grid")}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full ${view === "grid"
                                        ? "bg-blue-700 text-white"
                                        : "border border-blue-300 text-blue-600 hover:bg-blue-100"
                                        }`}
                                >
                                    <MdGridView className="text-xl" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-white p-5 -mt-5 border-t border-t-gray-300 rounded-b-lg">
                    {/* Nội dung tab mẫu cứng */}
                    {activeTab === 'overview' && (
                        <>
                            {view === 'grid' && (
                                <div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                                            <div className="bg-blue-100 p-3 rounded-full text-lg text-blue-600">
                                                <UserPlus />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Ứng tuyển</p>
                                                <p className="text-xl font-bold">{reportAply.applied ?? '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                                            <div className="bg-yellow-100 p-3 rounded-full text-lg text-yellow-600">
                                                <Loader2 />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Đang xử lý</p>
                                                <p className="text-xl font-bold">{reportAply.processing ?? '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                                            <div className="bg-green-100 p-3 rounded-full text-lg text-green-600">
                                                <CheckCircle2 />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Đã tuyển</p>
                                                <p className="text-xl font-bold">{reportAply.hired ?? '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                                            <div className="bg-red-100 p-3 rounded-full text-lg text-red-600">
                                                <XCircle />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Bị từ chối</p>
                                                <p className="text-xl font-bold">{reportAply.rejected ?? '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                                            <div className="bg-blue-100 p-3 rounded-full text-lg text-blue-600">
                                                <FaBriefcase />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Đã phỏng vấn</p>
                                                <p className="text-xl font-bold">{reportAply.internship ?? '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nhóm 2: Thông tin vị trí */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                                            <div className="bg-cyan-100 p-3 rounded-full text-lg text-cyan-600">
                                                <Briefcase />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Số vị trí đang mở</p>
                                                <p className="text-xl font-bold">{reportAply.openCount ?? '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                                            <div className="bg-orange-100 p-3 rounded-full text-lg text-orange-600">
                                                <Hourglass />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Vị trí tuyển lâu nhất</p>
                                                <p className="text-xl font-bold">{reportAply.longestOpenJob ?? '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                                            <div className="bg-emerald-100 p-3 rounded-full text-lg text-emerald-600">
                                                <Star />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Vị trí hiệu quả nhất</p>
                                                <p className="text-xl font-bold">{reportAply.effectiveJob ?? '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nhóm 3: Tương tác */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                                            <div className="bg-indigo-100 p-3 rounded-full text-lg text-indigo-600">
                                                <Eye />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Lượt theo dõi</p>
                                                <p className="text-xl font-bold">{reportAply.followers ?? '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                                            <div className="bg-pink-100 p-3 rounded-full text-lg text-pink-600">
                                                <Megaphone />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Số lượt xem tin</p>
                                                <p className="text-xl font-bold">{reportAply.viewCount ?? '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                                            <div className="bg-lime-100 p-3 rounded-full text-lg text-lime-600">
                                                <MailOpen />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Lượt gửi lời mời</p>
                                                <p className="text-xl font-bold">{reportAply.inviteCount ?? '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                                            <div className="bg-amber-100 p-3 rounded-full text-lg text-amber-600">
                                                <Bookmark />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Đã lưu</p>
                                                <p className="text-xl font-bold">{reportAply.saveCount ?? '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nhóm 4: Tỷ lệ */}
                                    <div class="space-y-4">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div class="bg-white p-6 rounded-xl shadow">
                                                <div class="text-center">
                                                    <div class="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">{reportAply.savedToApplied ?? '-'}</div>
                                                    <p class="mt-2 text-sm text-gray-500">Tỷ lệ lưu → ứng tuyển (%)</p>
                                                </div>
                                            </div>
                                            <div class="bg-white p-6 rounded-xl shadow">
                                                <div class="text-center">
                                                    <div class="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-2xl">{reportAply.viewedToApplied ?? '-'}</div>
                                                    <p class="mt-2 text-sm text-gray-500">Tỷ lệ xem → ứng tuyển (%)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {view === 'list' && (
                                <div>
                                    <table className="w-full text-sm text-left text-gray-700">
                                        <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                                            <tr>
                                                <th className="w-1/4 px-4 py-3">Danh mục</th>
                                                <th className="w-1/4 px-4 py-3">Giá trị</th>
                                                <th className="w-1/4 px-4 py-3">Danh mục</th>
                                                <th className="w-1/4 px-4 py-3">Giá trị</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="w-1/4 px-4 py-3">Ứng tuyển</td>
                                                <td className="w-1/4 px-4 py-3">{reportAply.applied ?? '-'}</td>
                                                <td className="w-1/4 px-4 py-3">Lượt theo dõi</td>
                                                <td className="w-1/4 px-4 py-3">{reportAply.followers ?? '-'}</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="w-1/4 px-4 py-3">Đang xử lý</td>
                                                <td className="w-1/4 px-4 py-3">{reportAply.processing ?? '-'}</td>
                                                <td className="w-1/4 px-4 py-3">Số lượt xem tin</td>
                                                <td className="w-1/4 px-4 py-3">{reportAply.viewCount ?? '-'}</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="w-1/4 px-4 py-3">Đã tuyển</td>
                                                <td className="w-1/4 px-4 py-3">{reportAply.hired ?? '-'}</td>
                                                <td className="w-1/4 px-4 py-3">Lượt gửi lời mời</td>
                                                <td className="w-1/4 px-4 py-3">{reportAply.inviteCount ?? '-'}</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="w-1/4 px-4 py-3">Bị từ chối</td>
                                                <td className="w-1/4 px-4 py-3">{reportAply.rejected ?? '-'}</td>
                                                <td className="w-1/4 px-4 py-3">Đã lưu</td>
                                                <td className="w-1/4 px-4 py-3">{reportAply.saveCount ?? '-'}</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="w-1/4 px-4 py-3">Đã phỏng vấn</td>
                                                <td className="w-1/4 px-4 py-3">{reportAply.internship ?? '-'}</td>
                                                <td className="w-1/4 px-4 py-3">Tỷ lệ lưu → ứng tuyển</td>
                                                <td className="w-1/4 px-4 py-3">{reportAply.savedToApplied ?? '-'}</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="w-1/4 px-4 py-3">Số vị trí đang mở</td>
                                                <td className="w-1/4 px-4 py-3">{reportAply.openCount ?? '-'}</td>
                                                <td className="w-1/4 px-4 py-3">Tỷ lệ xem → ứng tuyển</td>
                                                <td className="w-1/4 px-4 py-3">{reportAply.viewedToApplied ?? '-'}</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="w-1/4 px-4 py-3">Vị trí tuyển lâu nhất</td>
                                                <td className="w-1/4 px-4 py-3">{reportAply.longestOpenJob ?? '-'}</td>
                                                <td className="w-1/4 px-4 py-3"></td>
                                                <td className="w-1/4 px-4 py-3"></td>
                                            </tr>
                                            <tr>
                                                <td className="w-1/4 px-4 py-3">Vị trí hiệu quả nhất</td>
                                                <td className="w-1/4 px-4 py-3">{reportAply.effectiveJob ?? '-'}</td>
                                                <td className="w-1/4 px-4 py-3"></td>
                                                <td className="w-1/4 px-4 py-3"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'position' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-[2000px] table-auto">
                                <thead>
                                    <tr className="bg-gray-100 text-sm text-gray-700 sticky top-0 z-10">
                                        <th className="px-4 py-2 text-center border border-gray-300 sticky left-0 bg-gray-100 z-20">Vị trí</th>
                                        <th className="px-4 py-2 text-center border border-gray-300">Số ứng viên</th>
                                        <th className="px-4 py-2 text-center border border-gray-300">Đang xử lý</th>
                                        <th className="px-4 py-2 text-center border border-gray-300">Đã phỏng vấn</th>
                                        <th className="px-4 py-2 text-center border border-gray-300">Đã tuyển</th>
                                        <th className="px-4 py-2 text-center border border-gray-300">Đã từ chối</th>
                                        <th className="px-4 py-2 text-center border border-gray-300">Đã gửi lời mời</th>
                                        <th className="px-4 py-2 text-center border border-gray-300">Trung bình thời gian ứng tuyển</th>
                                        <th className="px-4 py-2 text-center border border-gray-300">Số lượt xem</th>
                                        <th className="px-4 py-2 text-center border border-gray-300">Lượt lưu</th>
                                        <th className="px-4 py-2 text-center border border-gray-300">Tỉ lệ ứng tuyển</th>
                                        <th className="px-4 py-2 text-center border border-gray-300">Trạng thái</th>
                                        <th className="px-4 py-2 text-center border border-gray-300">Ngày hết hạn</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {positionData.map((pos, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border border-gray-300 sticky left-0 bg-white z-10 font-medium">{pos.title}</td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">{pos.total}</td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">{pos.processing}</td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">{pos.interviewed}</td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">{pos.hired}</td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">{pos.rejected}</td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">{pos.invited}</td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">{pos.avgTime}</td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">{pos.viewCount}</td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">{pos.saveCount}</td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">{pos.applyRate}</td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">
                                                <span
                                                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${pos.status === "Đang mở"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-200 text-gray-700"
                                                        }`}
                                                >
                                                    {pos.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 border border-gray-300 text-center">{pos.application_deadline}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'source' && (
                        <div className="report-section">
                            <h3>Thống kê theo nguồn tuyển</h3>

                            {/* Bảng thống kê nguồn */}
                            <div className="source-stats-table">
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>Nguồn</th>
                                            <th>Tổng số</th>
                                            <th>Đã phỏng vấn</th>
                                            <th>Đã tuyển</th>
                                            <th>Tỷ lệ phỏng vấn</th>
                                            <th>Tỷ lệ tuyển</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sourceData.sourceStats.map((stat, index) => (
                                            <tr key={index}>
                                                <td>{stat.source || 'HirePoint'}</td>
                                                <td>{stat.total}</td>
                                                <td>{stat.interviewed}</td>
                                                <td>{stat.hired}</td>
                                                <td>{stat.interviewRate}</td>
                                                <td>{stat.hireRate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Biểu đồ thống kê theo thời gian */}
                            <div className="source-time-chart">
                                <h4>Xu hướng theo thời gian</h4>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart
                                        data={sourceData.timeStats.map(stat => ({
                                            name: `${stat._id.month}/${stat._id.year}`,
                                            [stat._id.source || 'HirePoint']: stat.count
                                        }))}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        {sourceData.sourceStats.map((stat, index) => (
                                            <Line
                                                key={index}
                                                type="monotone"
                                                dataKey={stat.source || 'HirePoint'}
                                                stroke={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Biểu đồ tròn tỷ lệ nguồn */}
                            <div className="source-pie-chart">
                                <h4>Phân bố nguồn tuyển</h4>
                                <ResponsiveContainer width="100%" height={400}>
                                    <PieChart>
                                        <Pie
                                            data={sourceData.sourceStats}
                                            dataKey="total"
                                            nameKey="source"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={150}
                                            label
                                        >
                                            {sourceData.sourceStats.map((entry, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {activeTab === 'process' && (
                        <>
                            <div className="report-section space-y-12">
                                {/* Phần 1: Thời gian xử lý trung bình */}
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                    {/* Table 1 – 40% */}
                                    <div className="lg:col-span-2 bg-white rounded-xl shadow p-4">
                                        <h4 className="text-base font-semibold mb-4">Thời gian xử lý trung bình</h4>
                                        <div className="overflow-auto">
                                            <table className="min-w-full table-auto border text-sm border-gray-300">
                                                <thead className="bg-gray-100 text-gray-700">
                                                    <tr>
                                                        <th className="border border-gray-300 px-4 py-2">Giai đoạn</th>
                                                        <th className="border border-gray-300 px-4 py-2">Số lượng</th>
                                                        <th className="border border-gray-300 px-4 py-2">Thời gian trung bình</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {processData.stageTimeStats.map((stat, index) => (
                                                        <tr
                                                            key={index}
                                                            className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                                        >
                                                            <td className="border border-gray-300 px-4 py-2">{stat._id}</td>
                                                            <td className="border border-gray-300 px-4 py-2 text-center">{stat.count}</td>
                                                            <td className="border border-gray-300 px-4 py-2 text-center">{stat.avgTime}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Chart 1 – 60% */}
                                    <div className="lg:col-span-3 bg-white rounded-xl shadow p-4">
                                        <h4 className="text-base font-semibold mb-4">Tỷ lệ chuyển đổi</h4>
                                        <div className="w-full h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={processData.conversionStats}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="_id" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="count" fill="#5483b3" name="Số lượng" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Phần 2: Hiệu suất người phỏng vấn */}
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                    {/* Table 2 – 40% */}
                                    <div className="lg:col-span-2 bg-white rounded-xl shadow p-4">
                                        <h4 className="text-base font-semibold mb-4">Hiệu suất người phỏng vấn</h4>
                                        <div className="overflow-auto">
                                            <table className="min-w-full table-auto border text-sm border-gray-300">
                                                <thead className="bg-gray-100 text-gray-700">
                                                    <tr>
                                                        <th className="border border-gray-300 px-4 py-2">Người phỏng vấn</th>
                                                        <th className="border border-gray-300 px-4 py-2">Tổng số</th>
                                                        <th className="border border-gray-300 px-4 py-2">Đã hoàn thành</th>
                                                        <th className="border border-gray-300 px-4 py-2">Tỷ lệ</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {processData.interviewerStats.map((stat, index) => (
                                                        <tr
                                                            key={index}
                                                            className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                                        >
                                                            <td className="border border-gray-300 px-4 py-2">{stat.interviewerName}</td>
                                                            <td className="border border-gray-300 px-4 py-2 text-center">{stat.totalInterviews}</td>
                                                            <td className="border border-gray-300 px-4 py-2 text-center">{stat.completedInterviews}</td>
                                                            <td className="border border-gray-300 px-4 py-2 text-center">{stat.completionRate}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Chart 2 – 60% */}
                                    <div className="lg:col-span-3 bg-white rounded-xl shadow p-4">
                                        <h4 className="text-base font-semibold mb-4">Phân tích hiệu suất</h4>
                                        <div className="w-full h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart data={processData.stageTimeStats}>
                                                    <PolarGrid />
                                                    <PolarAngleAxis dataKey="_id" />
                                                    <PolarRadiusAxis />
                                                    <Radar
                                                        name="Hiệu suất"
                                                        dataKey="count"
                                                        stroke="#5483b3"
                                                        fill="#5483b3"
                                                        fillOpacity={0.6}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </>
                    )}

                    {activeTab === 'diversity' && (
                        <>
                            <div className="space-y-12">
                                {/* Hàng 1: Giới tính và Độ tuổi */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Giới tính */}
                                    <div className="bg-white rounded-xl shadow p-4">
                                        <h4 className="text-base font-semibold mb-4">Phân bố giới tính</h4>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <PieChart>
                                                <Pie
                                                    data={diversityData.genderStats}
                                                    dataKey="count"
                                                    nameKey="_id"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={150}
                                                    label
                                                >
                                                    {diversityData.genderStats.map((entry, index) => (
                                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Độ tuổi */}
                                    <div className="bg-white rounded-xl shadow p-4">
                                        <h4 className="text-base font-semibold mb-4">Phân bố độ tuổi</h4>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart
                                                data={diversityData.ageStats}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="_id" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="count" fill="#5483b3" name="Số lượng" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Hàng 2: Học vấn và Kinh nghiệm */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Học vấn */}
                                    <div className="bg-white rounded-xl shadow p-4">
                                        <h4 className="text-base font-semibold mb-4">Phân bố học vấn</h4>
                                        <div className="w-full h-96">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={diversityData.educationStats}
                                                        dataKey="count"
                                                        nameKey="_id"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={120}
                                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                                                    >
                                                        {diversityData.educationStats.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={COLORS[index]} // không dùng % COLORS.length để tránh trùng
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    {/* Legend bị loại bỏ */}
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Kinh nghiệm */}
                                    <div className="bg-white rounded-xl shadow p-4">
                                        <h4 className="text-base font-semibold mb-4">Phân bố kinh nghiệm</h4>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart
                                                data={diversityData.experienceStats}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="_id" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="count" fill="#5483b3" name="Số lượng" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'quality' && (
                        <div className="report-section grid grid-cols-1 gap-6">
                            {/* Thống kê kỹ năng */}
                            <div className="bg-white rounded-xl shadow p-4">
                                <h4 className="text-base font-semibold mb-4">Phân bố kỹ năng</h4>
                                <div className="w-full h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={qualityData.skillStats}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="_id" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" fill="#5483b3" name="Số lượng" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Biểu đồ phản hồi + giữ chân nhân viên */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Phân tích phản hồi */}
                                <div className="bg-white rounded-xl shadow p-4">
                                    <h4 className="text-base font-semibold mb-4">Phân tích phản hồi</h4>
                                    <div className="w-full h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={qualityData.feedbackStats}
                                                    dataKey="count"
                                                    nameKey="_id"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={120}
                                                    label
                                                >
                                                    {qualityData.feedbackStats.map((entry, index) => (
                                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Tỷ lệ giữ chân */}
                                <div className="bg-white rounded-xl shadow p-4">
                                    <h4 className="text-base font-semibold mb-4">Tỷ lệ giữ chân nhân viên</h4>
                                    <div className="w-full h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={qualityData.retentionStats}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="period" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="rate" stroke="#5483b3" name="Tỷ lệ giữ chân" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>

                    )}

                    {activeTab === 'trend' && (
                        <div className="report-section grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                            {/* Cột trái */}
                            <div className="flex flex-col gap-6">
                                {/* Xu hướng ứng tuyển */}
                                <div className="bg-white rounded-xl shadow p-4">
                                    <h4 className="font-semibold mb-4">Xu hướng ứng tuyển</h4>
                                    <div className="w-full h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={trendData.applicationTrends.map(item => ({
                                                    ...item,
                                                    period: `${item._id.day}/${item._id.month}/${item._id.year}`,
                                                }))}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="period" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="count" stroke="#5483b3" name="Số lượng ứng tuyển" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Xu hướng tuyển dụng */}
                                <div className="bg-white rounded-xl shadow p-4">
                                    <h4 className="font-semibold mb-4">Xu hướng tuyển dụng</h4>
                                    <div className="w-full h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={trendData.hiringTrends.map(item => ({
                                                    ...item,
                                                    period: `${item._id.day}/${item._id.month}/${item._id.year}`,
                                                }))}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="period" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="hired" stroke="#5483b3" name="Đã tuyển" />
                                                <Line type="monotone" dataKey="rejected" stroke="#5dbcc2" name="Đã từ chối" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Cột phải */}
                            <div className="flex flex-col gap-6">
                                {/* Xu hướng phỏng vấn */}
                                <div className="bg-white rounded-xl shadow p-4">
                                    <h4 className="font-semibold mb-4">Xu hướng phỏng vấn</h4>
                                    <div className="w-full h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={trendData.interviewTrends.map(item => ({
                                                    ...item,
                                                    period: `${item._id.day}/${item._id.month}/${item._id.year}`,
                                                }))}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="period" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="scheduled" stroke="#5483b3" name="Đã lên lịch" />
                                                <Line type="monotone" dataKey="completed" stroke="#5dbcc2" name="Đã hoàn thành" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Xu hướng nguồn tuyển */}
                                <div className="bg-white rounded-xl shadow p-4">
                                    <h4 className="font-semibold mb-4">Xu hướng nguồn tuyển</h4>
                                    <div className="w-full h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={trendData.sourceTrends.map(item => ({
                                                    ...item,
                                                    period: `${item._id.day}/${item._id.month}/${item._id.year}`,
                                                }))}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="period" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                {trendData.sourceTrends.length > 0 &&
                                                    Object.keys(trendData.sourceTrends[0])
                                                        .filter(key => key !== 'period' && key !== '_id')
                                                        .map((source, index) => (
                                                            <Line
                                                                key={index}
                                                                type="monotone"
                                                                dataKey={source}
                                                                stroke={COLORS[index % COLORS.length]}
                                                                name={source}
                                                            />
                                                        ))}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>

                    )}
                </div>
            </div>

        </>
    );
};

export default Report;

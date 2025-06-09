import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getId } from '../../../libs/isAuth';
import axios from "axios";
import { useEffect } from "react";
import { faStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import {
    PieChart, Pie, Cell, Legend,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";


const COLORS = ["#5483b3", "#5dbcc2"];
const COLORS1 = ["#7abab4", "#09d1c7"]

const OverviewReview = () => {
    const [reportData, setReportData] = useState(null);
    const [monthlyViews, setMonthlyViews] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlyApplications, setMonthlyApplications] = useState([]);
    const [monthlyFollowers, setMonthlyFollowers] = useState([]);
    const [monthlyInterviews, setMonthlyInterviews] = useState([]);

    const userId = getId();
    const fetchMonthlyApplications = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/reviewschema/monthly-applications?userId=${userId}`);
            const data = response.data;

            const defaultMonths = Array.from({ length: 12 }, (_, i) => ({
                month: `${i + 1}/${selectedYear}`,
                applications: 0
            }));

            const updated = defaultMonths.map(item => {
                const found = data.find(d => d.month === item.month);
                return found ? { ...item, applications: found.applications } : item;
            });

            setMonthlyApplications(updated);
        } catch (err) {
            console.error("Lỗi khi lấy ứng tuyển hàng tháng:", err);
        }
    };
    const fetchMonthlyFollowers = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/reviewschema/monthly-followers?userId=${userId}`);
            const data = response.data;

            const defaultMonths = Array.from({ length: 12 }, (_, i) => ({
                month: `${i + 1}/${selectedYear}`,
                followers: 0
            }));

            const updated = defaultMonths.map(item => {
                const found = data.find(d => d.month === item.month);
                return found ? { ...item, followers: found.followers } : item;
            });

            setMonthlyFollowers(updated);
        } catch (err) {
            console.error("Lỗi khi lấy lượt theo dõi hàng tháng:", err);
        }
    };
    const fetchMonthlyInterviews = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/reviewschema/monthly-interviews?userId=${userId}`);
            const data = response.data;
            console.log("da laf", data);
            const defaultMonths = Array.from({ length: 12 }, (_, i) => ({
                month: `${String(i + 1).padStart(2, '0')}/${selectedYear}`,
                interviews: 0
            }));
            const updated = defaultMonths.map(item => {
                const found = data.find(d => d.month === item.month);
                return found ? { ...item, interviews: found.interviews } : item;
            });

            setMonthlyInterviews(updated);
            console.log("update laf", updated);
        } catch (err) {
            console.error("Lỗi khi lấy lượt phỏng vấn hàng tháng:", err);
        }
    };

    const combinedMonthlyData = monthlyViews.map((viewItem, index) => ({
        month: viewItem.month,
        views: viewItem.views,
        applications: monthlyApplications[index]?.applications || 0,
        followers: monthlyFollowers[index]?.followers || 0,
        interviews: monthlyInterviews[index]?.interviews || 0,

    }));

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/reviewschema/company-review-report?userId=${userId}`);
                setReportData(response.data);
            } catch (err) {
                console.error("Lỗi khi lấy báo cáo đánh giá:", err);
            }
        };

        const fetchMonthlyViews = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/reviewschema/monthly-views?userId=${userId}`);
                const data = response.data;

                // Tạo 12 tháng mặc định
                const defaultMonths = Array.from({ length: 12 }, (_, i) => ({
                    month: `${i + 1}/${selectedYear}`,
                    views: 0
                }));

                // Gộp dữ liệu thực tế vào mặc định
                const updated = defaultMonths.map(item => {
                    const found = data.find(d => d.month === item.month);
                    return found ? { ...item, views: found.views } : item;
                });

                setMonthlyViews(updated);
            } catch (err) {
                console.error("Lỗi khi lấy lượt xem hàng tháng:", err);
            }
        };
        console.log("combinedMonthlyData", combinedMonthlyData);
        fetchMonthlyApplications();
        fetchMonthlyFollowers();
        fetchMonthlyInterviews();
        fetchReport();
        fetchMonthlyViews();
    }, [selectedYear]);

    const years = [2023, 2024, 2025, 2026, 2027];

    const radarData = reportData ? [
        { subject: "Lương thưởng", A: reportData.detailStats.salary_benefits },
        { subject: "Đào tạo", A: reportData.detailStats.training },
        { subject: "Quản lý", A: reportData.detailStats.management },
        { subject: "Văn hóa", A: reportData.detailStats.culture },
        { subject: "Không gian", A: reportData.detailStats.workspace },
    ] : [];

    const barData = radarData.map(item => ({
        name: item.subject,
        Điểm: item.A
    }));
    const recommendStats = reportData ? [
        { name: "Giới thiệu", value: reportData.recommendStats.true },
        { name: "Không giới thiệu", value: reportData.recommendStats.false },
    ] : [];
    const overtimeStats = reportData ? [
        { name: "Hài lòng", value: reportData.overtimeStats.satisfied },
        { name: "Không hài lòng", value: reportData.overtimeStats.unsatisfied },
    ] : [];

    return (
        <div className="bg-white w-full">
            {/* Hiển thị đánh giá trung bình bằng ngôi sao */}
            {reportData?.avgRating && (
                <div className="flex flex-row items-center gap-2 pb-3">
                    <span className="text-sm font-bold text-gray-800">
                        Đánh giá trung bình:
                    </span>
                    <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, index) => {
                            const full = index + 1 <= Math.floor(reportData.avgRating);
                            const half = reportData.avgRating - index > 0 && reportData.avgRating - index < 1;
                            return (
                                <FontAwesomeIcon
                                    key={index}
                                    icon={full ? faStar : half ? faStarHalfAlt : farStar}
                                    className="text-yellow-400 mr-1 text-sm"
                                />
                            );
                        })}
                        <span className="text-sm text-gray-600 font-medium">
                            ({reportData.avgRating.toFixed(1)}/5)
                        </span>
                    </div>
                </div>
            )}

            <div className="flex flex-col overflow-x-auto pb-6">
                {/* Dòng 1: Biểu đồ */}
                <div className="flex flex-col gap-5 whitespace-nowrap">
                    <div className="flex-1 bg-white rounded-xl p-5 pt-0 shadow-md">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Chi tiết điểm đánh giá
                        </h4>
                        <ResponsiveContainer height={300}>
                            <BarChart data={barData}>
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip />
                                <Bar dataKey="Điểm" fill="#266694" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-row gap-5 whitespace-nowrap">
                        <div className="flex-1 bg-white rounded-xl p-5 shadow-md">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                Tỷ lệ giới thiệu
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={recommendStats}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label
                                    >
                                        {recommendStats.map((entry, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="flex-1 bg-white rounded-xl p-5 shadow-md">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                Tăng ca
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={overtimeStats}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label
                                    >
                                        {overtimeStats.map((entry, index) => (
                                            <Cell key={index} fill={COLORS1[index % COLORS1.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chọn năm */}
            <div className="flex flex-row items-center gap-2 pb-3">
                <label htmlFor="year-select" className="text-sm text-gray-800 font-bold">
                    Chọn năm:
                </label>
                <select
                    id="year-select"
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                    {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {/* Dòng 2: Biểu đồ đường */}
            <div className="flex flex-col gap-5 whitespace-nowrap">
                <div className="flex-1 bg-white rounded-xl p-5 pt-0 shadow-md">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Báo cáo Công ty theo tháng
                    </h4>
                    <ResponsiveContainer height={300}>
                        <LineChart data={combinedMonthlyData}>
                            <XAxis dataKey="month" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="views"
                                name="Lượt xem"
                                stroke="#266694"
                                strokeWidth={3}
                                dot={{ r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="applications"
                                name="Lượt ứng tuyển"
                                stroke="#f59e0b"
                                strokeWidth={3}
                                dot={{ r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="followers"
                                name="Lượt theo dõi"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="interviews"
                                name="Lượt phỏng vấn"
                                stroke="#ec4899"
                                strokeWidth={3}
                                dot={{ r: 5 }}
                                strokeDasharray="5 5"
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default OverviewReview;

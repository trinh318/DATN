import '../../../styles/reportreview.css';
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faComments } from "@fortawesome/free-solid-svg-icons";
import '../../../styles/companyprofile.css';
import { getId } from '../../../libs/isAuth';
import axios from "axios";
import { useEffect } from "react";
import { faStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import { FaFilePen } from "react-icons/fa6";
import {
    PieChart, Pie, Cell, Legend,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts"; 


const COLORS = ["#5483b3", "#5dbcc2"];
const COLORS1 = ["#7abab4", "#09d1c7"]

const ReportReviewCopy = () => {
    const [tab, setTab] = useState('overview');
    const [reportData, setReportData] = useState(null);
    const [monthlyViews, setMonthlyViews] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlyApplications, setMonthlyApplications] = useState([]);
    const [monthlyFollowers, setMonthlyFollowers] = useState([]);
    const [selectedReview, setSelectedAccount] = useState(null);
    const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
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
            console.log("da laf",data);
            const defaultMonths = Array.from({ length: 12 }, (_, i) => ({
                month: `${String(i + 1).padStart(2, '0')}/${selectedYear}`,
                interviews: 0
            }));            
            const updated = defaultMonths.map(item => {
                const found = data.find(d => d.month === item.month);
                return found ? { ...item, interviews: found.interviews } : item;
            });
    
            setMonthlyInterviews(updated);
            console.log("update laf",updated);
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

    const comments = reportData ? reportData.comments : [];
    const handleAccountClick = (cmt) => {
        setSelectedAccount(cmt); // Lưu trữ dữ liệu account vào state
        console.log("cmt dduwojc chon", cmt)
        setIsEditAccountOpen(true);
    };
    const handleCloseAccountEdit = () => {
        setIsEditAccountOpen(false);
    };

    return (
        <div className="company-detail-review-report-container">

            <div className="company-detail-review-report-container-header">
                <h2>Công việc đang tuyển dụng</h2>
            </div>


            {/* Thanh tab ngang */}
            <div className="company-profile-tabs">
                <button
                    className={`company-profile-tab ${tab === 'overview' ? 'active' : ''}`}
                    onClick={() => setTab('overview')}
                >
                    <FontAwesomeIcon icon={faChartLine} /> Tổng quát
                </button>
                <button
                    className={`company-profile-tab ${tab === 'comments' ? 'active' : ''}`}
                    onClick={() => setTab('comments')}
                >
                    <FontAwesomeIcon icon={faComments} /> Đánh giá & bình luận
                </button>
            </div>
            {/* Hiển thị đánh giá trung bình bằng ngôi sao */}
            {reportData?.avgRating && (
                <div className="avg-rating-container">
                    <span className="avg-rating-label">Đánh giá trung bình:</span>
                    <div className="avg-rating-stars">
                        {Array.from({ length: 5 }).map((_, index) => {
                            const full = index + 1 <= Math.floor(reportData.avgRating);
                            const half = reportData.avgRating - index > 0 && reportData.avgRating - index < 1;

                            return (
                                <FontAwesomeIcon
                                    key={index}
                                    icon={full ? faStar : half ? faStarHalfAlt : farStar}
                                    className="avg-rating-star"
                                />
                            );
                        })}
                        <span className="avg-rating-value">({reportData.avgRating.toFixed(1)}/5)</span>
                    </div>
                </div>
            )}

            <div className="company-detail-review-report-content">
                {tab === 'overview' ? (
                    <div className="company-detail-review-report-charts">
                        {/* Dòng 1: Biểu đồ */}
                        <div className="chart-row">
                            <div className="company-detail-review-report-chart-box">
                                <h4 className="company-detail-review-report-chart-title">Chi tiết điểm đánh giá</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={barData}>
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 5]} />
                                        <Tooltip />
                                        <Bar dataKey="Điểm" fill="#266694" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="company-detail-review-report-chart-box">
                                <h4 className="company-detail-review-report-chart-title">Tỷ lệ giới thiệu</h4>
                                <PieChart width={300} height={300}>
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
                            </div>

                            <div className="company-detail-review-report-chart-box">
                                <h4 className="company-detail-review-report-chart-title">Tăng ca</h4>
                                <PieChart width={300} height={300}>
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
                            </div>
                        </div>

                        <div style={{ margin: '0px 0' }}>
                            <label htmlFor="year-select" style={{ marginRight: 10 }}>Chọn năm:</label>
                            <select
                                id="year-select"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            >
                                {years.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        {/* Dòng 2: nội dung khác */}
                        <div className="chart-row">

                            <div className="company-detail-review-report-chart-box-2">
                                <h4 className="company-detail-review-report-chart-title-2">
                                    Báo cáo Công ty theo tháng
                                </h4>
                                <ResponsiveContainer width="100%" height={300}>
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

                ) : (
                    <div>
                        <table className="comment-table">
                            <thead>
                                <tr>
                                    <th>Nhận xét</th>
                                    <th>Yêu thích</th>
                                    <th>Gợi ý</th>
                                    <th>Option</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comments.map((cmt, idx) => (
                                    <tr key={idx}>
                                        <td>{cmt.what_i_love}</td>
                                        <td>{cmt.comment}</td>
                                        <td>{cmt.suggestion}</td>
                                        <td>
                                            <div className="user-management-dropdown">
                                                <FaFilePen onClick={() => handleAccountClick(cmt)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>
                )}
            </div>
            {isEditAccountOpen && (
                <>
                    <div className="user-info-edit-overlay">
                        <div className="user-info-edit-container">
                            {/* Header */}
                            <div className="user-info-edit-header-form">
                                <div className="user-info-edit-header">
                                    <h2>Chi tiết đánh giá </h2>
                                    <button className="user-info-edit-close-btn" onClick={handleCloseAccountEdit}>
                                        &times;
                                    </button>
                                </div>
                            </div>
                            {/* Nội dung Form */}
                            <form className="user-info-edit-form">
                                <div className="user-info-edit-row">
                                    <label htmlFor="id" className="user-info-edit-label">
                                        Tóm tắt
                                    </label>
                                    <input
                                        type="text"
                                        id="id"
                                        name="id"
                                        className="user-info-edit-input"
                                        value={selectedReview?.comment || ""}
                                        readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                    />
                                </div>
                                <div className="user-info-edit-col">
                                    <div className="user-info-edit-row">
                                        <label htmlFor="full_name" className="user-info-edit-label">
                                            Hài lòng với chích sách tăng ca không.
                                        </label>
                                        <input
                                            type="text"
                                            id="full_name"
                                            name="full_name"
                                            className="user-info-edit-input"
                                            value={
                                                selectedReview?.overtime_feeling === "unsatisfied"
                                                    ? "Không hài lòng"
                                                    : "Hài lòng" || "Không có dữ liệuliệu"
                                            }
                                            readOnly // Chỉ hiển thị, không cho chỉnh sửa    
                                        />

                                    </div>
                                    <div className="user-info-edit-row">
                                        <label htmlFor="full_name" className="user-info-edit-label">
                                            Lý do
                                        </label>
                                        <input
                                            type="text"
                                            id="email"
                                            name="email"
                                            className="user-info-edit-input"
                                            value={`${selectedReview?.overtime_reason || ""}`}
                                            readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                        />
                                    </div>
                                </div>
                                <div className="user-info-edit-col">
                                    <div className="user-info-edit-row">
                                        <label htmlFor="full_name" className="user-info-edit-label">
                                            Điều thích ở công này.
                                        </label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            className="user-info-edit-input"
                                            value={`${selectedReview?.what_i_love || ""}`}
                                            readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                        />
                                    </div>
                                    <div className="user-info-edit-row">
                                        <label htmlFor="full_name" className="user-info-edit-label">
                                            Đề xuất để công ty tốt hơn.
                                        </label>
                                        <input
                                            type=""
                                            id=""
                                            name=""
                                            className="user-info-edit-input"
                                            value={`${selectedReview?.suggestion || ""}`}
                                            readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                        />
                                    </div>
                                </div>
                                <div className="user-info-edit-col">
                                    <div className="user-info-edit-row">
                                        <label htmlFor="role" className="user-info-edit-label">
                                            Lương
                                        </label>
                                        <div id="full_name" name="full_name" className="user-info-edit-input" style={{ display: "flex", alignItems: "center", gap: "0px" }}>
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    style={{
                                                        color: i < (selectedReview?.salary_benefits || 0) ? "#ffc107" : "#e4e5e9",
                                                    }}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="user-info-edit-row">
                                        <label htmlFor="created_at" className="user-info-edit-label">
                                            Đào tạo
                                        </label>
                                        <div id="full_name" name="full_name" className="user-info-edit-input" style={{ display: "flex", alignItems: "center", gap: "0px" }}>
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    style={{
                                                        color: i < (selectedReview?.training || 0) ? "#ffc107" : "#e4e5e9",
                                                    }}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                                <div className="user-info-edit-col">
                                    <div className="user-info-edit-row">
                                        <label htmlFor="role" className="user-info-edit-label">
                                            Quản lý
                                        </label>
                                        <div id="full_name" name="full_name" className="user-info-edit-input" style={{ display: "flex", alignItems: "center", gap: "0px" }}>
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    style={{
                                                        color: i < (selectedReview?.management || 0) ? "#ffc107" : "#e4e5e9",
                                                    }}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="user-info-edit-row">
                                        <label htmlFor="created_at" className="user-info-edit-label">
                                            Văn hóa
                                        </label>
                                        <div id="full_name" name="full_name" className="user-info-edit-input" style={{ display: "flex", alignItems: "center", gap: "0px" }}>
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    style={{
                                                        color: i < (selectedReview?.culture || 0) ? "#ffc107" : "#e4e5e9",
                                                    }}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                                <div className="user-info-edit-col">
                                    <div className="user-info-edit-row">
                                        <label htmlFor="role" className="user-info-edit-label">
                                            Không gian
                                        </label>
                                        <div id="full_name" name="full_name" className="user-info-edit-input" style={{ display: "flex", alignItems: "center", gap: "0px" }}>
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    style={{
                                                        color: i < (selectedReview?.workspace || 0) ? "#ffc107" : "#e4e5e9",
                                                    }}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </div>


                                </div>


                            </form>
                            {/* Footer (Save/Cancel)
                                <div className="user-info-edit-button-row">
                                    <button onClick={() => handleSave(selectedReview._id)} className="user-info-edit-save-btn" type="submit">
                                        Lưu
                                    </button>
                                    <button className="user-info-edit-cancel-btn" type="button" onClick={handleCloseAccountEdit}>
                                        Hủy
                                    </button>
                                </div> */}
                        </div>
                    </div>
                </>
            )}
        </div>

    );
};

export default ReportReviewCopy;

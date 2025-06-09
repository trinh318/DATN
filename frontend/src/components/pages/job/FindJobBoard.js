import React, { useState, useMemo } from 'react';
import { Link } from "react-router-dom";
import Dropdown from '../../UI/DropDown';
import ApplyJob from '../applicant/ApplyJob';
import '../../../styles/findjobboard.css';

const industryData = [
    { id: 1, name: 'Bán Lẻ/Tiêu Dùng', count: 83 },
    { id: 2, name: 'Bảo Hiểm', count: 26 },
    { id: 3, name: 'Bất Động Sản', count: 92 },
    { id: 4, name: 'CEO & General Management', count: 73 },
    { id: 5, name: 'Chính Phủ/Phi Lợi Nhuận', count: 19 },
    { id: 6, name: 'Công Nghệ Thông Tin/Viễn Thông', count: 648 },
];

const fieldData = [
    { id: 1, name: 'Kinh doanh', count: 120 },
    { id: 2, name: 'Marketing', count: 85 },
    { id: 3, name: 'Giáo dục', count: 60 },
    { id: 4, name: 'Y tế', count: 45 },
    { id: 5, name: 'Công nghệ', count: 100 },
    { id: 6, name: 'Nông nghiệp', count: 30 },
];

const salaryData = [
    { id: 1, name: 'Dưới 10 triệu', count: 50 },
    { id: 2, name: '10 - 20 triệu', count: 80 },
    { id: 3, name: '20 - 30 triệu', count: 60 },
    { id: 4, name: '30 - 40 triệu', count: 40 },
    { id: 5, name: 'Trên 40 triệu', count: 20 },
];

const experienceData = [
    { id: 1, name: 'Mới tốt nghiệp', count: 30 },
    { id: 2, name: '1-2 năm', count: 70 },
    { id: 3, name: '3-5 năm', count: 50 },
    { id: 4, name: 'Trên 5 năm', count: 20 },
];

function FindJobBoard() {
    const jobData = [
        {
            id: 1,
            logo: 'logo1.png',
            title: 'Giáo Viên Văn Từ 1 Năm Kinh Nghi...',
            company: 'Công ty TNHH Tư vấn giải pháp Giáo dục Minh Hoàng',
            salary: 'Trên 10 triệu',
            location: 'Hà Nội',
            updateTime: '2 giờ',
            remainingDays: 10
        },
        {
            id: 2,
            logo: 'logo2.png',
            title: 'Chuyên Viên Đào Tạo Ngành F&B',
            company: 'Công ty Cổ phần Tầm Nhìn Quốc Tế Aladdin',
            salary: '15 - 20 triệu',
            location: 'Hà Nội',
            updateTime: '1 ngày',
            remainingDays: 5
        },
        {
            id: 3,
            logo: 'logo3.png',
            title: 'Trưởng Phòng QA Làm Việc Tại Hà Nội',
            company: 'Công ty CP Xây dựng Kết cấu thép IPC',
            salary: 'Tới 35 triệu',
            location: 'Hà Nội & 2 nơi khác',
            updateTime: '3 ngày',
            remainingDays: 7
        },
        {
            id: 4,
            logo: 'logo4.png',
            title: 'Nhân Viên Kinh Doanh Bất Động Sản',
            company: 'Công ty Bất Động Sản ABC',
            salary: '10 - 15 triệu',
            location: 'Hà Nội',
            updateTime: '5 ngày',
            remainingDays: 12
        },
        {
            id: 5,
            logo: 'logo5.png',
            title: 'Chuyên Viên Marketing Online',
            company: 'Công ty TNHH Digital Marketing',
            salary: '12 - 18 triệu',
            location: 'Hồ Chí Minh',
            updateTime: '1 tuần',
            remainingDays: 8
        },
        {
            id: 6,
            logo: 'logo6.png',
            title: 'Kỹ Sư Xây Dựng Dân Dụng',
            company: 'Công ty Xây Dựng XYZ',
            salary: '15 - 25 triệu',
            location: 'Đà Nẵng',
            updateTime: '2 tuần',
            remainingDays: 15
        },
        {
            id: 7,
            logo: 'logo7.png',
            title: 'Nhân Viên Hỗ Trợ Khách Hàng',
            company: 'Công ty TNHH Dịch Vụ Khách Hàng',
            salary: '8 - 12 triệu',
            location: 'Hà Nội',
            updateTime: '3 ngày',
            remainingDays: 9
        },
        {
            id: 8,
            logo: 'logo8.png',
            title: 'Nhà Phát Triển Phần Mềm',
            company: 'Công ty Công Nghệ ABC',
            salary: '20 - 30 triệu',
            location: 'Hồ Chí Minh',
            updateTime: '6 ngày',
            remainingDays: 14
        },
        {
            id: 9,
            logo: 'logo9.png',
            title: 'Quản Lý Dự Án IT',
            company: 'Công ty TNHH Công Nghệ Thông Tin',
            salary: '25 - 35 triệu',
            location: 'Hà Nội',
            updateTime: '2 ngày',
            remainingDays: 4
        },
        {
            id: 10,
            logo: 'logo10.png',
            title: 'Giáo Viên Tiếng Anh',
            company: 'Trường Quốc Tế XYZ',
            salary: '10 - 15 triệu',
            location: 'Hà Nội',
            updateTime: '1 ngày',
            remainingDays: 6
        },
        {
            id: 11,
            logo: 'logo11.png',
            title: 'Nhân Viên Telesales',
            company: 'Công ty TNHH Bán Hàng Trực Tuyến',
            salary: '8 - 12 triệu',
            location: 'Hồ Chí Minh',
            updateTime: '4 ngày',
            remainingDays: 10
        },
        {
            id: 12,
            logo: 'logo12.png',
            title: 'Kỹ Sư Điện',
            company: 'Công ty CP Kỹ Thuật Điện',
            salary: '15 - 20 triệu',
            location: 'Đà Nẵng',
            updateTime: '2 tuần',
            remainingDays: 20
        },
        {
            id: 13,
            logo: 'logo13.png',
            title: 'Chuyên Viên Phân Tích Dữ Liệu',
            company: 'Công ty TNHH Phân Tích Dữ Liệu',
            salary: '20 - 30 triệu',
            location: 'Hà Nội',
            updateTime: '1 tuần',
            remainingDays: 12
        },
        {
            id: 14,
            logo: 'logo14.png',
            title: 'Thiết Kế Đồ Họa',
            company: 'Công ty Thiết Kế ABC',
            salary: '12 - 18 triệu',
            location: 'Hồ Chí Minh',
            updateTime: '5 ngày',
            remainingDays: 9
        },
        {
            id: 15,
            logo: 'logo15.png',
            title: 'Nhân Viên Nhập Liệu',
            company: 'Công ty TNHH Dịch Vụ Văn Phòng',
            salary: '7 - 10 triệu',
            location: 'Hà Nội',
            updateTime: '3 ngày',
            remainingDays: 10
        },
        {
            id: 16,
            logo: 'logo16.png',
            title: 'Lập Trình Viên Web',
            company: 'Công ty Công Nghệ XYZ',
            salary: '15 - 25 triệu',
            location: 'Đà Nẵng',
            updateTime: '2 tuần',
            remainingDays: 18
        },
        {
            id: 17,
            logo: 'logo17.png',
            title: 'Chuyên Viên Tư Vấn Tài Chính',
            company: 'Công ty Tài Chính ABC',
            salary: '20 - 30 triệu',
            location: 'Hà Nội',
            updateTime: '4 ngày',
            remainingDays: 11
        },
        {
            id: 18,
            logo: 'logo18.png',
            title: 'Nhân Viên Kho Vận',
            company: 'Công ty Giao Nhận Vận Tải',
            salary: '10 - 15 triệu',
            location: 'Hồ Chí Minh',
            updateTime: '6 ngày',
            remainingDays: 15
        },
        {
            id: 19,
            logo: 'logo19.png',
            title: 'Quản Trị Hệ Thống',
            company: 'Công ty TNHH Công Nghệ',
            salary: '25 - 35 triệu',
            location: 'Hà Nội',
            updateTime: '1 tuần',
            remainingDays: 10
        },
        {
            id: 20,
            logo: 'logo20.png',
            title: 'Giáo Viên Mầm Non',
            company: 'Trường Mầm Non ABC',
            salary: '8 - 12 triệu',
            location: 'Đà Nẵng',
            updateTime: '5 ngày',
            remainingDays: 8
        },
        {
            id: 21,
            logo: 'logo21.png',
            title: 'Kỹ Sư Cơ Điện',
            company: 'Công ty CP Cơ Điện',
            salary: '20 - 30 triệu',
            location: 'Hà Nội',
            updateTime: '3 ngày',
            remainingDays: 5
        },
        {
            id: 22,
            logo: 'logo22.png',
            title: 'Nhân Viên Kế Toán',
            company: 'Công ty Kế Toán ABC',
            salary: '10 - 15 triệu',
            location: 'Hồ Chí Minh',
            updateTime: '4 ngày',
            remainingDays: 7
        },
        {
            id: 23,
            logo: 'logo23.png',
            title: 'Chuyên Viên Phát Triển Kinh Doanh',
            company: 'Công ty TNHH Phát Triển Kinh Doanh',
            salary: '15 - 25 triệu',
            location: 'Hà Nội',
            updateTime: '2 tuần',
            remainingDays: 14
        },
        {
            id: 24,
            logo: 'logo24.png',
            title: 'Chuyên Viên Quan Hệ Khách Hàng',
            company: 'Công ty TNHH Dịch Vụ Khách Hàng',
            salary: '10 - 15 triệu',
            location: 'Đà Nẵng',
            updateTime: '3 ngày',
            remainingDays: 6
        },
        {
            id: 25,
            logo: 'logo25.png',
            title: 'Trợ Lý Giám Đốc',
            company: 'Công ty Cổ phần Đầu tư ABC',
            salary: '15 - 20 triệu',
            location: 'Hà Nội',
            updateTime: '2 ngày',
            remainingDays: 9
        },
        {
            id: 26,
            logo: 'logo26.png',
            title: 'Nhân Viên Bán Hàng',
            company: 'Công ty TNHH Bán Lẻ',
            salary: '8 - 12 triệu',
            location: 'Hồ Chí Minh',
            updateTime: '5 ngày',
            remainingDays: 11
        },
        {
            id: 27,
            logo: 'logo27.png',
            title: 'Kỹ Sư Thương Mại',
            company: 'Công ty CP Kỹ Sư Thương Mại',
            salary: '20 - 30 triệu',
            location: 'Hà Nội',
            updateTime: '6 ngày',
            remainingDays: 13
        },
        {
            id: 28,
            logo: 'logo28.png',
            title: 'Nhân Viên Hành Chính Nhân Sự',
            company: 'Công ty TNHH Hành Chính',
            salary: '10 - 15 triệu',
            location: 'Hà Nội',
            updateTime: '4 ngày',
            remainingDays: 8
        },
        {
            id: 29,
            logo: 'logo29.png',
            title: 'Chuyên Viên SEO',
            company: 'Công ty TNHH SEO ABC',
            salary: '12 - 18 triệu',
            location: 'Hồ Chí Minh',
            updateTime: '1 tuần',
            remainingDays: 10
        },
        {
            id: 30,
            logo: 'logo30.png',
            title: 'Nhân Viên IT Helpdesk',
            company: 'Công ty TNHH Dịch Vụ IT',
            salary: '10 - 15 triệu',
            location: 'Hà Nội',
            updateTime: '5 ngày',
            remainingDays: 7
        },
        {
            id: 31,
            logo: 'logo31.png',
            title: 'Kỹ Sư Phần Mềm',
            company: 'Công ty Công Nghệ XYZ',
            salary: '20 - 30 triệu',
            location: 'Đà Nẵng',
            updateTime: '3 ngày',
            remainingDays: 9
        },
        {
            id: 32,
            logo: 'logo32.png',
            title: 'Nhân Viên Quản Lý Chất Lượng',
            company: 'Công ty TNHH Quản Lý Chất Lượng',
            salary: '15 - 25 triệu',
            location: 'Hồ Chí Minh',
            updateTime: '4 ngày',
            remainingDays: 8
        },
        {
            id: 33,
            logo: 'logo33.png',
            title: 'Chuyên Viên Nghiên Cứu Thị Trường',
            company: 'Công ty TNHH Nghiên Cứu Thị Trường',
            salary: '10 - 15 triệu',
            location: 'Hà Nội',
            updateTime: '2 tuần',
            remainingDays: 13
        },
        {
            id: 34,
            logo: 'logo34.png',
            title: 'Nhân Viên Thiết Kế Web',
            company: 'Công ty Thiết Kế ABC',
            salary: '15 - 20 triệu',
            location: 'Đà Nẵng',
            updateTime: '5 ngày',
            remainingDays: 9
        },
        {
            id: 35,
            logo: 'logo35.png',
            title: 'Quản Lý Nhân Sự',
            company: 'Công ty TNHH Quản Lý Nhân Sự',
            salary: '25 - 35 triệu',
            location: 'Hồ Chí Minh',
            updateTime: '2 ngày',
            remainingDays: 6
        }
    ];

    const highJobData = useMemo(() => [
        { title: "Kinh doanh - Bán hàng", jobs: "9,599 việc làm", icon: "/path-to-icon1.png", bgColor: "#e0f7e9" },
        { title: "Tài chính - Ngân hàng - Bảo hiểm", jobs: "966 việc làm", icon: "/path-to-icon2.png", bgColor: "#f2f6ff" },
        { title: "Công nghệ thông tin", jobs: "12,478 việc làm", icon: "/path-to-icon3.png", bgColor: "#ffe9e6" },
        { title: "Marketing - Truyền thông", jobs: "7,321 việc làm", icon: "/path-to-icon4.png", bgColor: "#e6f5ff" },
        { title: "Y tế - Chăm sóc sức khỏe", jobs: "3,745 việc làm", icon: "/path-to-icon5.png", bgColor: "#f3e5f5" },
        { title: "Giáo dục - Đào tạo", jobs: "2,390 việc làm", icon: "/path-to-icon6.png", bgColor: "#fff3e0" },
        { title: "Xây dựng - Kiến trúc", jobs: "1,872 việc làm", icon: "/path-to-icon7.png", bgColor: "#e1f5fe" },
        { title: "Nhân sự - Tuyển dụng", jobs: "5,103 việc làm", icon: "/path-to-icon8.png", bgColor: "#fce4ec" },
        { title: "Kế toán - Kiểm toán", jobs: "4,412 việc làm", icon: "/path-to-icon9.png", bgColor: "#f1f8e9" },
        { title: "Sản xuất - Vận hành", jobs: "6,899 việc làm", icon: "/path-to-icon10.png", bgColor: "#fffde7" },
        { title: "Pháp lý - Luật sư", jobs: "982 việc làm", icon: "/path-to-icon11.png", bgColor: "#e8f5e9" },
        { title: "Khách sạn - Nhà hàng", jobs: "2,345 việc làm", icon: "/path-to-icon12.png", bgColor: "#ede7f6" },
        { title: "Nông nghiệp - Lâm nghiệp", jobs: "876 việc làm", icon: "/path-to-icon13.png", bgColor: "#fbe9e7" },
        { title: "Logistics - Xuất nhập khẩu", jobs: "3,213 việc làm", icon: "/path-to-icon14.png", bgColor: "#e0f2f1" },
        { title: "Bán lẻ - Bán sỉ", jobs: "8,457 việc làm", icon: "/path-to-icon15.png", bgColor: "#e3f2fd" },
    ], []);

    const [currentPage, setCurrentPage] = useState(0);
    const jobsPerPage = 8;

    const currentJobs = jobData.slice(currentPage * jobsPerPage, (currentPage + 1) * jobsPerPage);
    const totalPages = Math.ceil(jobData.length / jobsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const [favorites, setFavorites] = useState([]);

    const toggleFavorite = (jobTitle) => {
        setFavorites((prevFavorites) => {
            if (prevFavorites.includes(jobTitle)) {
                return prevFavorites.filter((title) => title !== jobTitle);
            } else {
                return [...prevFavorites, jobTitle];
            }
        });
    };

    ///apply job
    const [jobList, setJobList] = useState(jobData); // Dữ liệu danh sách công việc
    const [favoriteJobs, setFavoriteJobs] = useState([]); // Danh sách công việc yêu thích
    const [jobToApply, setJobToApply] = useState(null); // Công việc được chọn để ứng tuyển

    const handleFavoriteToggle = (jobTitle) => {
        setFavoriteJobs((prevFavorites) =>
            prevFavorites.includes(jobTitle)
                ? prevFavorites.filter((title) => title !== jobTitle)
                : [...prevFavorites, jobTitle]
        );
    };

    const openApplyForm = (job) => {
        setJobToApply(job); // Gán công việc được chọn
    };

    const closeApplyForm = () => {
        setJobToApply(null); // Đóng form ứng tuyển
    };


    return (
        <div className='find-jobs-board'>
            <div className="find-jobs-header">
                <h1>Tìm kiếm việc làm</h1>
                <p>Bắt đầu tìm kiếm công việc mới cho bản thân</p>
                <div className="find-jobs-tags">
                    <span className="find-jobs-tag">IT</span>
                    <span className="find-jobs-tag">Kinh tế</span>
                    <span className="find-jobs-tag">Xây dựng</span>
                    <span className="find-jobs-tag">Giáo dục</span>
                    <span className="find-jobs-tag">CEO & General Management</span>
                </div>
            </div>
            <div className="find-jobs-banner">

                <div className="find-jobs-filters">
                    <input type="text" placeholder="Tên công việc, vị trí bạn muốn ứng tuyển" className="find-jobs-input" />
                    <Dropdown label="Ngành nghề" options={industryData} onSelect={(selected) => console.log(selected)} />
                    <Dropdown label="Lĩnh vực" options={fieldData} onSelect={(selected) => console.log(selected)} />
                    <Dropdown label="Lương" options={salaryData} onSelect={(selected) => console.log(selected)} />
                    <Dropdown label="Kinh nghiệm" options={experienceData} onSelect={(selected) => console.log(selected)} />
                    <button className="find-jobs-button">Tìm kiếm</button>
                </div>

                <div className="find-jobs-skills">
                    <span className="find-jobs-skill">IT <span className="find-jobs-skill-count">200</span></span>
                    <span className="find-jobs-skill">Kinh doanh <span className="find-jobs-skill-count">181</span></span>
                    <span className="find-jobs-skill">Xây dựng <span className="find-jobs-skill-count">137</span></span>
                    <span className="find-jobs-skill">Giao dục <span className="find-jobs-skill-count">125</span></span>
                    <span className="find-jobs-skill">Photoshop <span className="find-jobs-skill-count">122</span></span>
                    <span className="find-jobs-skill">Khác <span className="find-jobs-skill-count">3155</span></span>
                </div>

                <p className="find-jobs-result">Tìm thấy <span className="find-jobs-result-count">3,752</span> việc làm phù hợp với yêu cầu của bạn.</p>

                <div className="find-jobs-preferences">
                    <span>Ưu tiên hiển thị:</span>
                    <label><input type="radio" name="preference" /> Tất cả</label>
                    <label><input type="radio" name="preference" /> Tin mới nhất</label>
                    <label><input type="radio" name="preference" /> Cần tuyển gấp</label>
                    <label><input type="radio" name="preference" /> Lương (cao - thấp)</label>
                    <label><input type="radio" name="preference" /> Ngày đăng (mới nhất)</label>
                    <label><input type="radio" name="preference" /> Ngày đăng (cũ nhất)</label>
                </div>
            </div>

            <div className='job-board-list'>
                <div className='job-board-list-left'>
                    <div className='job-list'>
                        <div className="job-board-list-container">
                            {currentJobs.map((job, index) => (
                                <div key={index} className="job-info-item-card">
                                    <div className="job-board-company-logo">
                                        <img src={job.logo} alt="Company Logo" />
                                    </div>
                                    <div className="job-info-sections">
                                        <Link to={`/jobs/jobdetail/${job.id}`} className="job-info-position-title">
                                            <h2>{job.title}</h2>
                                        </Link>
                                        <p className="job-info-company-name">{job.company}</p>
                                        <span className="salary-job-info">{job.salary}</span>
                                        <div className="job-info-details">
                                            <span className="location-job-info">📍 {job.location}</span>
                                            <span className="remaining-days">⏳ Còn {job.remainingDays} ngày để ứng tuyển</span>
                                        </div>
                                        <p className="job-update">Cập nhật {job.updateTime} trước</p>
                                    </div>
                                    <div className="job-salary-apply">
                                        <button className="apply-button" onClick={() => openApplyForm(job)}>Ứng tuyển</button>
                                        <div className="job-info-favorite-icon" onClick={() => toggleFavorite(job.title)}>
                                            <span>{favorites.includes(job.title) ? '❤️' : '🤍'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Form ApplyJob (hiển thị nếu có công việc được chọn) */}
                        {jobToApply && (
                            <ApplyJob job={jobToApply} onClose={closeApplyForm} />

                        )}
                        <div className="pagination-indicator">
                            <div className="nav-buttons">
                                <button className="nav-button" onClick={prevPage} disabled={currentPage === 0}>&#8249;</button>
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index}
                                        className={`pagination-dot ${index === currentPage ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(index)}
                                    />
                                ))}
                                <button className="nav-button" onClick={nextPage} disabled={currentPage === totalPages - 1}>&#8250;</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="highlight-jobs">
                    <div className="highlight-jobs-container">
                        <h2>Top ngành nghề nổi bật</h2>
                        <div className="croll-high-job-card">
                            <div className="scroll-content">
                                {[...highJobData, ...highJobData].map((job, index) => ( // Nhân đôi danh sách để tạo vòng lặp
                                    <div
                                        className="high-job-card"
                                        key={index}
                                        style={{ backgroundColor: job.bgColor }}
                                    >
                                        <div className="high-job-icon">
                                            <img src={job.icon} alt={`Icon ${job.title}`} />
                                        </div>
                                        <h3>{job.title}</h3>
                                        <p>{job.jobs}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FindJobBoard;

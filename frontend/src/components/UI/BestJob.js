import React, { useState, useRef, useEffect } from 'react';
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import '../../styles/bestjob.css';
import axios from 'axios';
import { getId, isAuth } from '../../libs/isAuth';

export default function BestJob() {
    const [jobs, setJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const userId = getId();

    // Fetch danh sách công việc khi component được render
    useEffect(() => {
        const fetchJobs = async () => {
            if (!isAuth()) {
                try {
                    const response = await axios.get('http://localhost:5000/api/jobs');
                    setJobs(response.data);
                    setLoading(false);
                    console.log(response.data);
                } catch (err) {
                    setError('Không thể tải công việc. Vui lòng thử lại.');
                    setLoading(false);
                }
            }
        };

        const fetchData = async () => {
            if (isAuth()) {
                try {
                    setLoading(true);

                    // Tải đồng thời danh sách công việc đã lưu và tất cả công việc
                    const [savedJobsResponse, allJobsResponse] = await Promise.all([
                        axios.get(`http://localhost:5000/api/savedjobs/mysavedjobs/${userId}`),
                        axios.get('http://localhost:5000/api/jobs')
                    ]);

                    const savedJobs = savedJobsResponse.data;
                    const jobs = allJobsResponse.data;

                    // Đánh dấu các công việc đã lưu
                    const updatedJobs = jobs.map((job) => ({
                        ...job,
                        saved: savedJobs.some((savedJob) => savedJob.job_id && savedJob.job_id._id === job._id),
                    }));


                    setSavedJobs(savedJobs);
                    setJobs(updatedJobs);
                } catch (error) {
                    console.error('Error fetching data:', error);
                    setError('Lỗi khi tải dữ liệu.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
        fetchJobs();
    }, [userId]);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Địa điểm');
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const selectFilter = (filter) => {
        setSelectedFilter(filter);
        setIsDropdownOpen(false);
    };

    const handleOutsideClick = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const filterJobs = (filter) => {
        switch (filter) {
            case 'Địa điểm':
                return jobs.filter((job) => job.location.includes('Hà Nội'));
            case 'Mức lương':
                return jobs.filter((job) => parseInt(job.salary.split(' ')[1]) > 15);
            default:
                return jobs;
        }
    };

    //phân trang 
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const jobsPerPage = 18; // Số lượng job mỗi trang

    // Tính toán các job hiển thị
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob); // Các job hiện tại
    const totalPages = Math.ceil(jobs.length / jobsPerPage); // Tổng số trang

    // Điều hướng tới trang trước
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Điều hướng tới trang tiếp theo
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleSaveJob = async (jobId) => {
        try {
            // Lấy token từ localStorage
            const token = localStorage.getItem('token');

            if (token == null) {
                alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }
            // Gửi yêu cầu POST để lưu công việc
            const response = await axios.post(
                'http://localhost:5000/api/savedjobs/save-job',
                { job_id: jobId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Kiểm tra nếu lưu thành công
            if (response.status === 201) {
                alert('Lưu tin ứng tuyển thành công!');
                setTimeout(() => setSuccessMessage(null), 3000); // Ẩn thông báo thành công sau 3 giây

                // Cập nhật danh sách công việc đã lưu
                setSavedJobs((prevSavedJobs) => [...prevSavedJobs, response.data.savedJob]);

                // Cập nhật trạng thái saved trong allJobData
                setJobs((prevJobs) =>
                    prevJobs.map((job) =>
                        job._id === jobId ? { ...job, saved: true } : job
                    )
                );
            }

        } catch (err) {
            if (err.response) {
                // Xử lý các mã trạng thái cụ thể
                if (err.response.status === 409) {
                    alert('Bạn đã lưu công việc này trước đó.');
                } else {
                    setError(err.response.data.message || 'Không thể lưu công việc. Vui lòng thử lại.');
                }
                if (err.response.status === 401) {
                    alert('Bạn cần đăng nhập để ứng tuyển');
                }
            } else {
                console.error('Error saving job:', err.message);
                setError('Có lỗi xảy ra. Vui lòng thử lại.');
            }
        }
    };

    const handleUnsaveJob = async (jobId) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }

            // Tìm ID của công việc đã lưu trong `savedJobs`
            const savedJob = savedJobs.find((savedJob) => savedJob.job_id._id === jobId);
            if (!savedJob) {
                alert('Không tìm thấy công việc đã lưu để xóa.');
                return;
            }

            // Gửi yêu cầu DELETE để xóa công việc đã lưu
            const response = await axios.delete(`http://localhost:5000/api/savedjobs/${savedJob._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                alert('Công việc đã được xóa khỏi danh sách yêu thích.');

                // Cập nhật danh sách `savedJobs`
                setSavedJobs((prevSavedJobs) =>
                    prevSavedJobs.filter((job) => job._id !== savedJob._id)
                );

                // Cập nhật trạng thái `allJobData`
                setJobs((prevJobs) =>
                    prevJobs.map((job) =>
                        job._id === jobId ? { ...job, saved: false } : job
                    )
                );
            }
        } catch (err) {
            console.error('Error unsaving job:', err.message);
            alert('Có lỗi xảy ra khi xóa công việc đã lưu.');
        }
    };

    const toggleFavorite = async (jobId) => {
        try {
            if (!isAuth()) {
                alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }

            // Kiểm tra nếu công việc đã được lưu
            const job = jobs.find((job) => job._id === jobId);

            if (job.saved) {
                // Nếu đã lưu, xóa công việc
                await handleUnsaveJob(jobId);
            } else {
                // Nếu chưa lưu, lưu công việc
                await handleSaveJob(jobId);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setError('Có lỗi xảy ra khi thay đổi trạng thái yêu thích.');
        }
    };

    return (
        <div className="job-listing-container">
            <header className="job-list-header">
                <h1 className="header-title">Việc làm tốt nhất</h1>
            </header>

            <div className="job-filters">
                {/**<div className="filters-left">
                    <div className="filter-dropdown" ref={dropdownRef}>
                        <button className="filter-dropdown-toggle" onClick={toggleDropdown}>
                            Lọc theo: <span className="selected-filter">{selectedFilter}</span>
                            <span className="dropdown-arrow-2">▼</span>
                        </button>
                        {isDropdownOpen && (
                            <div className="filter-dropdown-menu">
                                {['Địa điểm', 'Mức lương', 'Kinh nghiệm', 'Ngành nghề'].map((filter) => (
                                    <div
                                        key={filter}
                                        className={`filter-option ${selectedFilter === filter ? 'selected' : ''}`}
                                        onClick={() => selectFilter(filter)}
                                    >
                                        {filter}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="location-dropdown-2">
                        <span className="location-icon-2">📍</span>
                        <span className="location-text-2">Tất cả tỉnh/thành phố</span>
                    </div>
                </div>
                <div className="navigation-component">
                    <a href="#view-all" className="view-all">Xem tất cả</a>
                    <div className="nav-buttons">
                        <button className="nav-button" onClick={goToPreviousPage} disabled={currentPage === 0}>&#8249;</button>
                        <button className="nav-button" onClick={goToNextPage} disabled={currentPage === totalPages - 1}>&#8250;</button>
                    </div>
                </div> */}
            </div>

            <div className='job-list'>
                <div className="job-container">
                    {jobs.length > 0 ? (
                        currentJobs.map((job, index) => (
                            <div key={index} className="job-item-card">
                                <div className="company-logo">
                                    <img src={job.company_id ? job.company_id.logo : 'N/A'} alt="Company Logo" />
                                </div>
                                <div className="job-info-section">
                                    <Link to={`/jobs/jobdetail/${job._id}`} className="position-title"  title={job.title} >
                                        <h2 className="position-title">
                                            {job.highlighted && new Date(job.highlighted_until) >= new Date() && (
                                                <span className="highlighted-badge">✨ NỔI BẬT</span>
                                            )}
                                            {job.title} 
                                        </h2>
                                    </Link>
                                    <p className="company-name">{job.company_id ? job.company_id.company_name : 'N/A'}</p>
                                    <div className="job-info">
                                        <span className="salary-info">{job.salary}</span>
                                        <span className="location-info">{job.location}</span>
                                    </div>
                                </div>
                                <div className="favorite-icon" onClick={() => toggleFavorite(job._id)}>
                                    <span>{job.saved ? '❤️' : '🤍'}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Không có công việc nào.</p>
                    )}
                </div>
                {/* Pagination */}
                <div className="custom-pagination">
                    <button
                        className="pagination-button"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <span className="pagination-info">
                        {currentPage}/{totalPages}
                    </span>
                    <button
                        className="pagination-button"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </div>
        </div>
    );
}

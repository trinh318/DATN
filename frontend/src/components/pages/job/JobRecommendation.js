import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import SearchBar from '../../UI/SearchBar';
import ApplyJob from '../applicant/ApplyJob';
import '../../../styles/jobrecommendation.css';
import { isAuth, getId } from '../../../libs/isAuth';
import axios from 'axios';

export default function JobRecommendation() {
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [jobToApply, setJobToApply] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const jobsPerPage = 8;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const userId = getId();

    const currentJobs = recommendedJobs.slice(currentPage * jobsPerPage, (currentPage + 1) * jobsPerPage);
    const totalPages = Math.ceil(recommendedJobs.length / jobsPerPage);

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

    const toggleFavorite = (jobTitle) => {
        setFavorites((prevFavorites) => {
            if (prevFavorites.includes(jobTitle)) {
                return prevFavorites.filter((title) => title !== jobTitle);
            } else {
                return [...prevFavorites, jobTitle];
            }
        });
    };

    const openApplyForm = (job) => {
        if (isAuth()) {
            setJobToApply(job);
        } else {
            alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
        }
    };

    const closeApplyForm = () => {
        setJobToApply(null);
    };

    useEffect(() => {
        const fetchRecommendedJobs = async () => {
            setLoading(true);
            try {
                if (!userId) {
                    setError('Vui lòng đăng nhập để xem gợi ý việc làm');
                    setLoading(false);
                    return;
                }
                
                const response = await axios.post('http://localhost:5000/api/jobrecomend/recommend-jobs', { userId });
                
                if (response.status === 503) {
                    // System is initializing
                    setIsInitializing(true);
                    setTimeout(fetchRecommendedJobs, 5000); // Try again after 5 seconds
                    return;
                }
                
                if (response.data && response.data.recommendedJobs) {
                    // Filter to only include jobs with a valid application_deadline
                    const validJobs = response.data.recommendedJobs.filter(job => 
                        job && job.application_deadline && new Date(job.application_deadline) > new Date()
                    );
                    
                    // Sort by similarity score (highest first)
                    const sortedJobs = validJobs.sort((a, b) => b.similarity - a.similarity);
                    
                    setRecommendedJobs(sortedJobs);
                    setIsInitializing(false);
                } else {
                    setRecommendedJobs([]);
                }
            } catch (err) {
                console.error('Error fetching recommended jobs:', err);
                if (err.response?.status === 503) {
                    // System is initializing
                    setIsInitializing(true);
                    setTimeout(fetchRecommendedJobs, 5000); // Try again after 5 seconds
                } else if (err.response?.status === 404) {
                    setError('Không tìm thấy hồ sơ của bạn. Vui lòng cập nhật hồ sơ để nhận gợi ý việc làm.');
                } else {
                    setError('Không thể tải gợi ý việc làm. Vui lòng thử lại sau.');
                }
            } finally {
                if (!isInitializing) {
                    setLoading(false);
                }
            }
        };

        fetchRecommendedJobs();
    }, [userId]);

    const calculateRemainingDays = (deadline) => {
        if (!deadline) return 0;
        
        const today = new Date();
        const deadlineDate = new Date(deadline);
        
        // Calculate the difference in milliseconds
        const diffInMs = deadlineDate - today;
        
        // Convert the difference to days
        const diffInDays = Math.ceil(diffInMs / (1000 * 3600 * 24));
        
        return diffInDays >= 0 ? diffInDays : 0;
    };

    if (isInitializing) {
        return (
            <div className="job-recommend-loading">
                <h2>Hệ thống đang khởi tạo...</h2>
                <p>Chúng tôi đang chuẩn bị gợi ý việc làm phù hợp nhất cho bạn. Vui lòng đợi trong giây lát.</p>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="job-recommend-loading">
                <h2>Đang tải gợi ý việc làm...</h2>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="job-recommend-error">
                <h2>Không thể tải gợi ý việc làm</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
        );
    }

    if (recommendedJobs.length === 0) {
        return (
            <div className="job-recommend-empty">
                <h2>Chưa có gợi ý việc làm</h2>
                <p>Hiện tại chúng tôi chưa tìm thấy việc làm phù hợp với hồ sơ của bạn. Vui lòng cập nhật hồ sơ hoặc quay lại sau.</p>
                <Link to="/applicants/update-profile" className="update-profile-button">
                    Cập nhật hồ sơ
                </Link>
            </div>
        );
    }

    return (
        <div className='job-recommend-board'>
            <div className="job-recommend-header">
                <SearchBar />
                <h1>Việc làm phù hợp</h1>
                <p>Khám phá cơ hội việc làm được gợi ý dựa trên mong muốn, kinh nghiệm và kỹ năng của bạn. Đón lấy sự nghiệp thành công với công việc phù hợp nhất dành cho bạn!</p>
            </div>
            <div className="job-recommend-banner">
                <p className="job-recommend-result">Tìm thấy <span className="job-recommend-result-count">{recommendedJobs.length}</span> việc làm phù hợp với bạn.</p>
            </div>
            <div className='job-recommend-board-list'>
                <div className='job-recommend-board-list-left'>
                    <div className='job-list'>
                        <div className="job-recommend-board-list-container">
                            {currentJobs.map((job, index) => (
                                <div key={index} className="job-recommend-info-item-card">
                                    <div className="job-recommend-board-company-logo">
                                        <img src={job.companyLogo || 'https://via.placeholder.com/100'} alt={`${job.companyName} logo`} />
                                    </div>
                                    <div className="job-recommend-info-sections">
                                        <Link to={`/jobs/jobdetail/${job.jobId}`} className="job-recommend-info-position-title">
                                            <h2>{job.jobTitle}</h2>
                                        </Link>
                                        <p className="job-recommend-info-company-name">{job.companyName}</p>
                                        <span className="job-recommend-salary-job-info">{job.salary}</span>
                                        <div className="job-recommend-info-details">
                                            <span className="job-recommend-location-job-info">📍 {job.location}</span>
                                            <span className="job-recommend-remaining-days">⏳Còn {calculateRemainingDays(job.application_deadline)} ngày để ứng tuyển</span>
                                        </div>
                                    </div>
                                    <div className="job-recommend-salary-apply">
                                        <button className="job-recommend-apply-button" onClick={() => openApplyForm(job)}>Ứng tuyển</button>
                                        <div className="job-recommend-info-favorite-icon" onClick={() => toggleFavorite(job.jobTitle)}>
                                            <span>{favorites.includes(job.jobTitle) ? '❤️' : '🤍'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {totalPages > 1 && (
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
                        )}
                    </div>
                </div>
            </div>

            {jobToApply && (
                <ApplyJob job={jobToApply} onClose={closeApplyForm} />
            )}
        </div>
    );
}

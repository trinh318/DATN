import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import SearchBar from '../../UI/SearchBar';
import { isAuth, getId } from '../../../libs/isAuth';
import axios from 'axios';
import { MapPin, HeartOff } from 'lucide-react';
import { Heart, Clock } from 'lucide-react';

export default function JobRecommendation() {
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [favorites, setFavorites] = useState([]);
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

    if (isInitializing) {
        return (
            <div className="flex flex-col items-center text-center bg-white p-8">
                <h2 className="text-xl font-semibold">Hệ thống đang khởi tạo...</h2>
                <p className="mt-2 text-gray-600">Chúng tôi đang chuẩn bị gợi ý việc làm phù hợp nhất cho bạn. Vui lòng đợi trong giây lát.</p>
                <div className="mt-4 w-8 h-8 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center text-center bg-white p-8">
                <h2 className="text-xl font-semibold">Đang tải gợi ý việc làm...</h2>
                <div className="mt-4 w-8 h-8 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center text-center bg-red-50 p-6 border border-red-200 rounded">
                <h2 className="text-lg font-semibold text-red-700">Không thể tải gợi ý việc làm</h2>
                <p className="mt-2 text-red-500">{error}</p>
                <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => window.location.reload()}>Thử lại</button>
            </div>
        );
    }

    if (recommendedJobs.length === 0) {
        return (
            <div className="flex flex-col items-center text-center bg-white p-6">
                <h2 className="text-xl font-semibold text-gray-700">Chưa có gợi ý việc làm</h2>
                <p className="mt-2 text-gray-500">Hiện tại chúng tôi chưa tìm thấy việc làm phù hợp với hồ sơ của bạn. Vui lòng cập nhật hồ sơ hoặc quay lại sau.</p>
                <Link to="/applicants/update-profile" className="mt-4 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Cập nhật hồ sơ
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col items-center font-sans bg-[#edf5ec] w-full">
                <div className="px-20 bg-gradient-to-r from-[#2c3e50] via-[#147882] to-[#2cd6cd] text-white w-full shadow-lg p-5">
                    <SearchBar />
                    <h1 className="text-2xl font-bold">Việc làm phù hợp</h1>
                    <p className="mt-2 text-white">
                        Khám phá cơ hội việc làm được gợi ý dựa trên mong muốn, kinh nghiệm và kỹ năng của bạn. Đón lấy sự nghiệp thành công với công việc phù hợp nhất dành cho bạn!
                    </p>
                </div>

                <div className="bg-white p-3 px-20 text-[#00a5b8] w-full">
                    <p className="text-base">
                        Tìm thấy <span className="font-bold text-[#096b76]">{recommendedJobs.length}</span> việc làm phù hợp với bạn.
                    </p>
                </div>

                <div className="px-20 flex w-full bg-white justify-between">
                    <div className="w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {currentJobs.map((job, index) => (
                                <>
                                    <div
                                        key={index}
                                        className="flex h-36 gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div className="aspect-square flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={job.companyLogo || '/default-logo.png'}
                                                alt="Company Logo"
                                                className="object-contain w-full h-full"
                                            />
                                        </div>

                                        <div className="flex flex-col justify-between flex-grow">
                                            <div>
                                                <Link
                                                    to={`/jobs/jobdetail/${job.jobId}`}
                                                    className="text-lg font-semibold text-blue-600 hover:no-underline"
                                                >
                                                    {job.highlighted && new Date(job.highlighted_until) >= new Date() && (
                                                        <span className="inline-block bg-gradient-to-r from-[#f96c4b] to-[#fba63c] text-white text-[12px] font-bold px-2 py-[2px] rounded-full mr-2 align-middle">
                                                            ✨ NỔI BẬT
                                                        </span>
                                                    )}
                                                    {job.jobTitle}
                                                </Link>
                                                <p className="text-sm text-gray-600 mt-1">{job.field} - {job.companyName}</p>
                                                <p className="text-sm text-green-600 mt-1 font-medium">{job.salary}$/tháng</p>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{job.location}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4 text-yellow-600" />
                                                    <span className="text-yellow-700">
                                                        Còn {Math.floor((new Date(job.application_deadline) - new Date()) / (1000 * 3600 * 24))} ngày
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-between items-end gap-2 -ml-4">
                                            <Link
                                                to={`/jobs/jobdetail/${job.jobId}`}
                                                className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-blue-700 hover:no-underline"
                                            >
                                                Apply
                                            </Link>
                                            <button onClick={() => toggleFavorite(job.jobTitle)}>
                                                {job.saved ? (
                                                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                                                ) : (
                                                    <HeartOff className="w-5 h-5 text-gray-400 hover:text-red-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6 gap-2">
                                <button className="text-lg" onClick={prevPage} disabled={currentPage === 0}>
                                    &#8249;
                                </button>
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index}
                                        className={`w-3 h-3 rounded-full ${index === currentPage ? 'bg-blue-700' : 'bg-gray-300'}`}
                                        onClick={() => setCurrentPage(index)}
                                    />
                                ))}
                                <button className="text-lg" onClick={nextPage} disabled={currentPage === totalPages - 1}>
                                    &#8250;
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

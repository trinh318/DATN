import React, { useState, useRef, useEffect } from 'react';
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import axios from 'axios';
import { getId, isAuth } from '../../libs/isAuth';
import {
    CircleDot,
    CircleSlash,
    Clock
} from "lucide-react";
import { MapPin, HeartOff } from 'lucide-react';
import { Heart } from 'lucide-react';

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
                    const response = await axios.get('http://localhost:5000/api/jobs?best=true');
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
                        axios.get('http://localhost:5000/api/jobs?best=true')
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
    const jobsPerPage = 8; // Số lượng job mỗi trang

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
        <>
            <div className="w-[90%] mx-auto py-5">
                <header className="flex justify-between items-center mt-2 border-t border-r border-gray-300">
                    <h1 className="text-[#005780] text-xl mt-2">Việc làm tốt nhất</h1>
                </header>

                <div className="flex flex-col gap-5 mt-4">
                    <div className={`grid gap-5 w-full sm:grid-cols-1 md:grid-cols-2`}>
                        {jobs.length > 0 ? (
                            currentJobs.map((job, index) => (
                                <div
                                    key={index}
                                    className="flex h-36 gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="aspect-square flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                            src={job.company_id?.logo || '/default-logo.png'}
                                            alt="Company Logo"
                                            className="object-contain w-full h-full"
                                        />
                                    </div>

                                    <div className="flex flex-col justify-between flex-grow min-w-0">
                                        <div>
                                            <div className="flex items-center gap-2 max-w-full overflow-hidden">
                                                {job.highlighted && new Date(job.highlighted_until) >= new Date() && (
                                                    <span className="inline-block bg-gradient-to-r from-[#f96c4b] to-[#fba63c] text-white text-[12px] font-bold px-2 py-[2px] rounded-full whitespace-nowrap">
                                                        ✨ NỔI BẬT
                                                    </span>
                                                )}
                                                <Link
                                                    to={`/jobs/jobdetail/${job._id}`}
                                                    className="text-lg font-semibold text-blue-600 hover:no-underline truncate block"
                                                    title={job.title} // Tooltip để hiển thị đầy đủ tiêu đề khi hover
                                                >
                                                    {job.title}
                                                </Link>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{job.field} - {job.company_id?.company_name}</p>
                                            <p className="text-sm text-green-600 mt-1 font-medium">{job.salary}$/tháng</p>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{job.company_id?.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4 text-yellow-600" />
                                                <span className="text-yellow-700">
                                                    Còn {Math.floor((new Date(job.application_deadline) - new Date()) / (1000 * 3600 * 24))} ngày
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between items-end gap-2 shrink-0">
                                        <Link
                                            to={`/jobs/jobdetail/${job._id}`}
                                            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-blue-700 hover:no-underline"
                                        >
                                            Apply
                                        </Link>
                                        <button onClick={() => toggleFavorite(job.title)}>
                                            {job.saved ? (
                                                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                                            ) : (
                                                <HeartOff className="w-5 h-5 text-gray-400 hover:text-red-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">Không có công việc liên quan.</p>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <button
                            className="w-8 h-8 rounded-full border border-gray-500 bg-white text-blue-700 flex items-center justify-center disabled:opacity-40"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <span className="text-base font-semibold text-gray-800">
                            {currentPage}/{totalPages}
                        </span>
                        <button
                            className="w-8 h-8 rounded-full border border-gray-500 bg-white text-blue-700 flex items-center justify-center disabled:opacity-40"
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

import React, { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import SearchBar from '../../UI/SearchBar';
import ApplyJob from '../applicant/ApplyJob';
import '../../../styles/jobdetail.css'; // Create this CSS file to style the component
import axios from 'axios';
import { isAuth, getId } from '../../../libs/isAuth';
import { format } from 'date-fns';
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BriefcaseBusiness, Briefcase, BadgePercent, Wallet, Calendar, Share2, Heart } from 'lucide-react';
import {
    FaBuilding,
    FaMapMarkerAlt,
    FaGlobe,
    FaInfoCircle,
} from 'react-icons/fa';
import { AlertTriangle } from 'lucide-react'
import { MapPin, Clock, HeartOff } from 'lucide-react';

function JobDetail() {
    const { id } = useParams();  // Get the job ID from URL
    const [job, setJob] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [jobSame, setJobSame] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [savedJobs, setSavedJobs] = useState([]);

    const handleViewJob = async (jobId) => {
        if (isAuth()) {
            const userId = getId();
            try {
                const response = await axios.post('http://localhost:5000/api/viewedjobs/view-job', {
                    user_id: userId,
                    job_id: jobId,
                });
                setMessage(response.data.message);
            } catch (error) {
                setMessage(error.response?.data?.message || 'Error occurred');
            }
        }
    };

    const fetchJobDetail = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
            console.log('Fetched job detail:', response.data);
            setJob(response.data);
        } catch (err) {
            console.error('Error fetching job detail:', err);
            setError('Không thể tải chi tiết công việc. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/jobs');
            console.log('Fetched all jobs:', response.data);
            setJobs(response.data);
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError('Không thể tải công việc. Vui lòng thử lại.');
        }
    };

    const fetchSameJobs = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/jobs/jobs/same-company/${id}`);
            console.log('Fetched same company jobs:', response.data);
            setJobSame(response.data);
        } catch (err) {
            console.error('Error fetching same company jobs:', err);
            setError('Không thể tải công việc. Vui lòng thử lại.');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                await Promise.all([fetchJobDetail(), fetchJobs(), fetchSameJobs()]);
                // Only view the job after detail is fetched
                if (isAuth()) {
                    await handleViewJob(id);
                }
            } catch (e) {
                console.error("Error during fetchData:", e);
            }
        };

        fetchData();
    }, [id]);


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

    const [message, setMessage] = useState('');



    /////apply job
    const [jobList, setJobList] = useState(jobs); // Dữ liệu danh sách công việc
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
        console.log("job", job)
        if (isAuth()) {
            setJobToApply(job); // Gán công việc được chọn
        } else (
            alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.')
        )
    };

    const closeApplyForm = () => {
        setJobToApply(null); // Đóng form ứng tuyển
    };

    const handleSave = async (jobId) => {
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

    const handleApply = async (jobId) => {
        try {
            const token = localStorage.getItem('token');

            if (token == null) {
                alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }
            const response = await axios.post(
                'http://localhost:5000/api/applications',
                { job_id: jobId }, // Chỉ gửi job_id
                { headers: { Authorization: `Bearer ${token}` } } // Authorization header với token
            );

            if (response.status === 201) {
                alert('Đã nộp đơn ứng tuyển thành công!');
            }
            if (response.status === 401) {
                alert('Bạn cần đăng nhập để ứng tuyển');
            }

        } catch (err) {
            console.error('Error applying for job:', err); // Log error details

            // Nếu có lỗi từ phản hồi, lấy message từ response và hiển thị thông báo
            if (err.response && err.response.data && err.response.data.message) {
                alert(err.response.data.message); // Hiển thị thông báo lỗi từ response
            } else {
                alert('Đã có lỗi xảy ra, vui lòng thử lại.'); // Lỗi không xác định
            }
        }
    };

    const formatUpdateTime = (updateTime) => {
        if (!updateTime) return 'không rõ';
        const now = new Date();
        const updatedDate = new Date(updateTime);
        const diffTime = now - updatedDate;
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        return diffDays > 0
            ? `${diffDays} ngày`
            : diffHours > 0
                ? `${diffHours} giờ`
                : '0 giây';
    };
    const [showForm, setShowForm] = useState(false);
    const [customReason, setCustomReason] = useState("");
    const [selectedReason, setSelectedReason] = useState("");

    const reasons = [
        { value: "false_info", label: "Thông tin sai sự thật", description: "Công việc không tồn tại, mô tả không chính xác." },
        { value: "scam", label: "Lừa đảo, yêu cầu đóng phí", description: "Nhà tuyển dụng yêu cầu nộp tiền để ứng tuyển." },
        { value: "multi_level", label: "Công việc đa cấp", description: "Công việc có dấu hiệu đa cấp hoặc tín dụng đen." },
        { value: "illegal", label: "Công việc vi phạm pháp luật", description: "Liên quan đến cờ bạc, cá độ, mại dâm, ma túy, v.v." },
        { value: "offensive", label: "Ngôn từ phản cảm", description: "Nội dung xúc phạm, phân biệt đối xử, thiếu tôn trọng." },
        { value: "spam", label: "Spam / Quảng cáo không phù hợp", description: "Nội dung quảng cáo không liên quan đến tuyển dụng." },
        { value: "no_response", label: "Nhà tuyển dụng không phản hồi", description: "Không trả lời ứng viên sau khi nộp hồ sơ." },
        { value: "personal_info", label: "Yêu cầu thông tin nhạy cảm", description: "Yêu cầu CCCD, số tài khoản, mật khẩu, v.v." },
        { value: "salary_issue", label: "Lương và phúc lợi không rõ ràng", description: "Không minh bạch về chế độ đãi ngộ." },
        { value: "other", label: "Khác...", description: "Nhập lý do báo cáo nếu không có trong danh sách." },
    ];

    const handleSubmitReport = async (jobId, e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        console.log('job id', jobId);
        // Kiểm tra nếu chưa đăng nhập
        if (!token) {
            alert('Bạn chưa đăng nhập. Vui lòng đăng nhập để thực hiện báo cáo.');
            return;
        }

        const userId = getId(); // Lấy userId từ hàm getId()
        const selectedLabel = selectedReason === "other" ? customReason :
            reasons.find(r => r.value === selectedReason)?.label || "Không xác định";

        try {
            const response = await axios.put(
                `http://localhost:5000/api/moderations/${jobId}/report`, // Sử dụng jobId
                { user_id: userId, reason: selectedLabel }, // Gửi user_id và lý do
                { headers: { Authorization: `Bearer ${token}` } } // Thêm token xác thực
            );

            if (response.status === 200) {
                alert('Báo cáo của bạn đã được gửi thành công.');
            }

        } catch (err) {
            console.error('Lỗi khi báo cáo công việc:', err);

            if (err.response && err.response.data && err.response.data.message) {
                alert(err.response.data.message);
            } else {
                alert('Đã có lỗi xảy ra, vui lòng thử lại.');
            }
        }

        // Đóng form và reset dữ liệu
        setShowForm(false);
        setSelectedReason("");
        setCustomReason("");
    };

    return (
        <>
            <div className='flex flex-col w-full gap-6'>
                <div
                    className="w-full shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                    style={{
                        backgroundColor: '#2c3e50',
                        backgroundImage: `repeating-linear-gradient(
                        45deg,
                        rgba(44, 62, 80, 1),
                        rgba(44, 62, 80, 1) 130px,
                        rgba(20, 120, 130, 0.9) 230px,
                        rgba(20, 120, 130, 0.9) 360px,
                        rgba(44, 140, 150, 0.6) 460px,
                        rgba(44, 140, 150, 0.6) 590px,
                        rgba(70, 140, 150, 0.4) 690px,
                        rgba(70, 140, 150, 0.4) 720px
                        )`}}>
                    <SearchBar />
                </div>
                <div className='flex flex-row gap-6 py-6 px-20'>
                    {job && (
                        <>
                            <div className='flex flex-col w-full sm:w-[65%] gap-6'>
                                <div className="rounded-2xl px-8 py-4 bg-white shadow-md mx-auto">
                                    <div className="flex justify-between items-start py-2">
                                        <div className="flex items-start gap-4">
                                            <div>
                                                <h2 className="text-2xl font-semibold text-gray-800">{job.title}</h2>
                                                <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
                                                    <span className="text-indigo-600 font-medium cursor-pointer">{job.field}</span>
                                                </div>
                                                {job.careers?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-4">
                                                        {job.careers.map((career, idx) => (
                                                            <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                                                                {career}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => openApplyForm(job)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                                APPLY JOB
                                            </button>
                                            <button onClick={() => handleSave(job._id)} className="w-9 h-9 border rounded-full flex items-center justify-center text-gray-500 hover:text-indigo-600">
                                                <Heart className="w-4 h-4" />
                                            </button>
                                            <button className="w-9 h-9 border rounded-full flex items-center justify-center text-gray-500 hover:text-indigo-600">
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="w-full flex justify-around gap-4 text-sm text-gray-700 py-6 my-6 border-y border-y-slate-400 border-dashed">
                                        <div className="flex items-center gap-1 space-x-2">
                                            <BadgePercent className="text-indigo-600 w-6 h-6" />
                                            <div>
                                                <div className="font-medium">Work Level</div>
                                                <div className="text-gray-500">{job.interview_location}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 space-x-2">
                                            <Calendar className="text-indigo-600 w-6 h-6" />
                                            <div>
                                                <div className="font-medium">Employee Type</div>
                                                <div className="text-gray-500">{job.job_type}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 space-x-2">
                                            <Briefcase className="text-indigo-600 w-6 h-6" />
                                            <div>
                                                <div className="font-medium">Vacancy</div>
                                                <div className="text-gray-500">{job.vacancy}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 space-x-2">
                                            <Wallet className="text-indigo-600 w-6 h-6" />
                                            <div>
                                                <div className="font-medium">Salary</div>
                                                <div className="text-gray-500">${job.salary}/month</div>
                                            </div>
                                        </div>
                                    </div>


                                    {/* Details Sections */}
                                    <div className="mt-8 space-y-6 text-sm text-gray-700">
                                        {/* Description */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Mô tả công việc</h3>
                                            {job.description ? (
                                                <p>{job.description}</p>
                                            ) : (
                                                <p>Chưa có mô tả công việc.</p>)}
                                        </div>

                                        {/* Skills */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Yêu cầu ứng viên</h3>
                                            {job.requirements && (
                                                <p className='pb-2'>{job.requirements}</p>
                                            )}
                                            <ul className="list-disc pl-6">
                                                {job.skills?.length > 0 ? (
                                                    job.skills.map((skill, idx) => <li key={idx}>{skill}</li>)
                                                ) : (
                                                    <li>Không có yêu cầu ứng viên.</li>
                                                )}
                                            </ul>
                                            {job.qualifications && (
                                                <p className='pt-2'>{job.qualifications?.join(', ')}</p>
                                            )}
                                        </div>

                                        {/* Benefits */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Quyền lợi</h3>
                                            <ul className="list-disc pl-6">
                                                {job.benefits?.length > 0 ? (
                                                    job.benefits.map((benefit, idx) => <li key={idx}>{benefit}</li>)
                                                ) : (
                                                    <li>Chưa có quyền lợi được cung cấp.</li>
                                                )}
                                            </ul>
                                        </div>

                                        {/* Location */}
                                        <div className='flex gap-2 items-baseline '>
                                            <h3 className="text-lg font-semibold text-gray-800">Địa điểm làm việc: </h3>
                                            <span>{job.location || 'Chưa có thông tin'}</span>
                                        </div>
                                    </div>

                                    {/* Bottom Actions */}
                                    <div className="mt-8 flex justify-between items-center">
                                        <p className="text-sm text-gray-500">
                                            Hạn nộp hồ sơ: {job.application_deadline ? format(new Date(job.application_deadline), 'dd-MM-yyyy') : 'Không có thời hạn'}
                                        </p>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => openApplyForm(job)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-semibold"
                                            >
                                                Ứng tuyển ngay
                                            </button>
                                            <button
                                                onClick={() => handleSave(job._id)}
                                                className="bg-white border border-gray-300 hover:border-indigo-600 text-gray-700 px-4 py-2 rounded-full text-sm font-medium"
                                            >
                                                Lưu tin
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start p-2 bg-white rounded-lg border border-gray-200">
                                    <AlertTriangle className="text-green-600 mt-1 w-5 h-5" />
                                    <p className="text-gray-700 ml-3">
                                        <strong>Báo cáo tin tuyển dụng:</strong> Nếu bạn thấy rằng tin tuyển dụng này không đúng hoặc có dấu hiệu lừa đảo,
                                        <a
                                            href="#"
                                            className="text-green-600 font-semibold hover:underline"
                                            onClick={() => setShowForm(true)}
                                        >
                                            {' '}hãy phản ánh với chúng tôi.
                                        </a>
                                    </p>
                                </div>
                                <div className="w-full">
                                    <div className='flex items-center pl-6 py-2 border-l-8 border-blue-500 mb-4'>
                                        <h2 className="text-xl font-semibold text-gray-800">Việc làm liên quan</h2>
                                    </div>
                                    <div className="grid gap-4">
                                        {currentJobs.length > 0 ? (
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

                                                    <div className="flex flex-col justify-between flex-grow">
                                                        <div>
                                                            <Link
                                                                to={`/jobs/jobdetail/${job?._id}`}
                                                                className="text-lg font-semibold text-blue-600 hover:underline"
                                                            >
                                                                {job.title}
                                                            </Link>
                                                            <p className="text-sm text-gray-600 mt-1">{job?.field} - {job.company_id?.company_name}</p>
                                                            <p className="text-sm text-green-600 mt-1 font-medium">{job.salary}$/tháng</p>
                                                        </div>

                                                        <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                <span>{job.location}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4" />
                                                                <span>Cập nhật {formatUpdateTime(job.updated_at)} trước</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4 text-yellow-600" />
                                                                <span className="text-yellow-700">
                                                                    Còn {Math.floor((new Date(job.application_deadline) - new Date()) / (1000 * 3600 * 24))} ngày
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col justify-between items-end gap-2">
                                                        <button
                                                            onClick={() => openApplyForm(job)}
                                                            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-green-700"
                                                        >
                                                            Ứng tuyển
                                                        </button>
                                                        <button onClick={() => toggleFavorite(job.title)}>
                                                            {favorites.includes(job.title) ? (
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
                                    <div className="flex justify-center items-center mt-6 gap-3">
                                        <button
                                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                            onClick={goToPreviousPage}
                                            disabled={currentPage === 1}
                                        >
                                            <FontAwesomeIcon icon={faChevronLeft} />
                                        </button>
                                        <span className="text-sm font-medium">
                                            Trang {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                            onClick={goToNextPage}
                                            disabled={currentPage === totalPages}
                                        >
                                            <FontAwesomeIcon icon={faChevronRight} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col w-full sm:w-[35%] gap-6">
                                <div className="bg-white rounded-2xl overflow-hidden shadow-md">
                                    {/* Banner */}
                                    {job.company_id?.banner && (
                                        <div className="h-48 w-full overflow-hidden">
                                            <img
                                                src={job.company_id?.banner}
                                                alt="Company Banner"
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-6 relative">
                                        {/* Logo + Name */}
                                        <div className="flex items-end space-x-4 -mt-16">
                                            {job.company_id?.logo && (
                                                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                                                    <img
                                                        src={job.company_id?.logo}
                                                        alt="Company Logo"
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2 group relative">
                                                    <h2 className="text-lg font-semibold text-gray-900">{job.company_id?.company_name}</h2>
                                                </div>
                                                <p className="text-xs text-gray-500">{job.company_id?.industry}</p>
                                            </div>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="mt-6 flex flex-col gap-6 text-gray-700 text-[15px]">
                                            {/* Left Column: Address, Size, Website */}
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-2">
                                                    <FaMapMarkerAlt className="mt-1 text-blue-600" />
                                                    <div>
                                                        <p className="font-medium">Địa chỉ:</p>
                                                        <p>{job.company_id?.location}</p>
                                                        <p className="text-sm text-gray-500">{job.company_id?.specific_address}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2">
                                                    <FaBuilding className="mt-1 text-green-600" />
                                                    <div>
                                                        <p className="font-medium">Quy mô:</p>
                                                        <p>{job.company_id?.quymo || 'Không rõ'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2">
                                                    <FaGlobe className="mt-1 text-purple-600" />
                                                    <div>
                                                        <p className="font-medium">Website:</p>
                                                        <a
                                                            href={job.company_id?.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 hover:underline break-all"
                                                        >
                                                            {job.company_id?.website}
                                                        </a>
                                                    </div>
                                                </div>

                                                <div className="flex items-start">
                                                    <FaInfoCircle className="mt-1 text-gray-700" />
                                                    <div>
                                                        <p className="font-medium">Giới thiệu:</p>
                                                        <p>{job.company_id?.description || 'Chưa có mô tả.'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full">
                                    <div className='flex items-center pl-6 py-2 border-l-8 border-blue-500 mb-4'>
                                        <h2 className="text-xl font-semibold text-gray-800">Việc làm cùng công ty</h2>
                                    </div>
                                    <div className="grid gap-4">
                                        {jobSame.length > 0 ? (
                                            jobSame.map((job, index) => (
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

                                                    <div className="flex flex-col justify-between flex-grow">
                                                        <div>
                                                            <Link
                                                                to={`/jobs/jobdetail/${job?._id}`}
                                                                className="text-lg font-semibold text-blue-600 hover:underline"
                                                            >
                                                                {job.title}
                                                            </Link>
                                                            <p className="text-sm text-gray-600 mt-1">{job?.field} - {job.company_id?.company_name}</p>
                                                            <p className="text-sm text-green-600 mt-1 font-medium">{job.salary}$/tháng</p>
                                                        </div>

                                                        <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                <span>{job.location}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4" />
                                                                <span>Cập nhật {formatUpdateTime(job.updated_at)} trước</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4 text-yellow-600" />
                                                                <span className="text-yellow-700">
                                                                    Còn {Math.floor((new Date(job.application_deadline) - new Date()) / (1000 * 3600 * 24))} ngày
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col justify-between items-end gap-2">
                                                        <button
                                                            onClick={() => openApplyForm(job)}
                                                            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-green-700"
                                                        >
                                                            Ứng tuyển
                                                        </button>
                                                        <button onClick={() => toggleFavorite(job.title)}>
                                                            {favorites.includes(job.title) ? (
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
                                    <div className="flex justify-center items-center mt-6 gap-3">
                                        <button
                                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                            onClick={goToPreviousPage}
                                            disabled={currentPage === 1}
                                        >
                                            <FontAwesomeIcon icon={faChevronLeft} />
                                        </button>
                                        <span className="text-sm font-medium">
                                            Trang {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                            onClick={goToNextPage}
                                            disabled={currentPage === totalPages}
                                        >
                                            <FontAwesomeIcon icon={faChevronRight} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {jobToApply && (
                <ApplyJob job={jobToApply} onClose={closeApplyForm} />
            )}

            {showForm && (
                <div className="job-report-overlay">
                    <div className="job-report-form">
                        <h3>Phản ánh tin tuyển dụng không chính xác</h3>
                        <form onSubmit={handleSubmitReport}>
                            <label className="job-report-label">Chọn lý do:</label>
                            <div className="job-report-select-container">
                                <select
                                    className="job-report-select"
                                    value={selectedReason}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    required
                                >
                                    <option value="">-- Chọn lý do --</option>
                                    {reasons.map((reason) => (
                                        <option key={reason.value} value={reason.value}>
                                            {reason.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Nếu chọn "Khác...", hiển thị ô nhập lý do */}
                            {selectedReason === "other" && (
                                <textarea
                                    className="job-report-textarea"
                                    placeholder="Nhập lý do báo cáo..."
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    required
                                />
                            )}

                            <div className="job-report-buttons">
                                <button onClick={(e) => handleSubmitReport(job._id, e)} className="job-report-button submit">
                                    Gửi Báo Cáo
                                </button>
                                <button type="button" className="job-report-button cancel" onClick={() => setShowForm(false)}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default JobDetail;

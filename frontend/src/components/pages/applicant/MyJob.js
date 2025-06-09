import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faClock } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import '../../../styles/myjob.css';
import { FaClipboardCheck, FaBookmark, FaEye, FaTimes, FaEnvelopeOpenText, FaStream, FaRegSave } from 'react-icons/fa';
import ApplyJob from './ApplyJob';
import axios from 'axios';
import { getId } from '../../../libs/isAuth';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/control/ui/dropdown-menu";
import { MoreVertical, Trash2, PencilLine, Eye, Plus } from "lucide-react";
import { MapPin, HeartOff } from 'lucide-react';
import { BadgePercent, Wallet, Calendar, Share2, Heart } from 'lucide-react';
import {
    ArrowDownNarrowWide,
    ArrowUpNarrowWide
} from "lucide-react";
import {
    FolderKanban,
    FilePlus2,
    FileDown,
    ListChecks,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import {
    CircleDot,
    CircleSlash,
    Clock
} from "lucide-react";
import {
    Timer,
    GraduationCap,
    MousePointerClick
} from "lucide-react";
import {
    Briefcase,
    User,
    DollarSign,
    Layers2,
    Shapes,
    BriefcaseBusiness
} from "lucide-react";

const MyJob = () => {
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

    //phân trang 
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const jobsPerPage = 3; // Số lượng job mỗi trang

    // Tính toán các job hiển thị
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;

    const totalPages = Math.ceil(favoriteJobs.length / jobsPerPage); // Tổng số trang

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

    const [activeTab, setActiveTab] = useState('appliedJobs');
    // Chuyển đổi tab
    const handleTabClick = (tab) => setActiveTab(tab);

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

    /// menu xóa của dấu ba chấm
    const [menuIndex, setMenuIndex] = useState(null); // Track which menu is open

    const toggleMenu = (index) => {
        if (menuIndex === index) {
            setMenuIndex(null); // Close menu if already open
        } else {
            setMenuIndex(index); // Open menu for the clicked card
        }
    };

    // Fetching job data when component mounts
    const [applications, setApplications] = useState([]); // State lưu danh sách đơn ứng tuyển
    const [error, setError] = useState(null); // State lưu lỗi nếu có
    const [loading, setLoading] = useState(true); // State lưu trạng thái tải dữ liệu
    const [savedJobs, setSavedJobs] = useState([]);
    const [allViewedJobs, setAllViewedJobs] = useState([]);

    useEffect(() => {
        const userId = getId(); // Gọi hàm getId() để lấy userId từ frontend

        const fetchApplications = async () => {
            try {
                setLoading(true); // Bắt đầu tải dữ liệu
                const response = await axios.get(`http://localhost:5000/api/applications/myapplicantion/${userId}`);
                setApplications(response.data); // Lưu danh sách ứng tuyển
            } catch (err) {
                setError('Có lỗi xảy ra khi tải danh sách ứng tuyển.');
                console.error(err);
            } finally {
                setLoading(false); // Kết thúc trạng thái tải
            }
        };

        const fetchSavedJobs = async () => {
            try {
                setLoading(true); // Bắt đầu tải dữ liệu
                const response = await axios.get(`http://localhost:5000/api/savedjobs/mysavedjobs/${userId}`);
                setSavedJobs(response.data); // Lưu danh sách công việc đã lưu
            } catch (err) {
                setError('Có lỗi xảy ra khi tải danh sách công việc đã lưu.');
                console.error(err);
            } finally {
                setLoading(false); // Kết thúc trạng thái tải
            }
        };

        const fetchViewedJob = async () => {
            try {
                setLoading(true); // Bắt đầu tải dữ liệu
                const response = await axios.get(`http://localhost:5000/api/viewedjobs/viewed-jobs/${userId}`);
                // Kiểm tra dữ liệu nhận về và chuyển thành mảng nếu không phải mảng
                setAllViewedJobs(response.data.viewedJobs); // Lưu danh sách job đã xem
            } catch (err) {
                setError('Có lỗi xảy ra khi tải danh sách các công việc đã xem.');
                console.error(err);
            } finally {
                setLoading(false); // Kết thúc trạng thái tải
            }
        };

        if (userId) {
            fetchApplications(); // Gọi hàm lấy danh sách ứng tuyển
            fetchSavedJobs();    // Gọi hàm lấy danh sách công việc đã lưu
            fetchViewedJob();
        }
    }, []);

    const handleDelete = (jobId) => {
        handleUnsaveJob(jobId);
        console.log("job id", jobId);
    };
    // cong việc đang ứng tuyển 
    // Change based on tab selection
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
            }
        } catch (err) {
            console.error('Error unsaving job:', err.message);
            alert('Có lỗi xảy ra khi xóa công việc đã lưu.');
        }
    };
    // thư mời ứng tuyển
    const [jobInvitationsData, setJobInvitationsData] = useState([]);
    const userId = getId(); // Hàm lấy ID người dùng từ đâu đó
    const fetchInvitations = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/invitation/invitations-by-candidate/${userId}`);
            if (response.data.invitations) {
                setJobInvitationsData(response.data.invitations);
                console.log("Thông tin việc làm: ", response.data.invitations);
            } else {
                console.log("Không có thư mời nào được trả về");
            }
        } catch (error) {
            console.error("Lỗi khi tải thư mời:", error);
        }
    };
    useEffect(() => {
        if (userId) {
            console.log("thu moi", userId)
            setLoading(true);
            // Gọi API để lấy thư mời của ứng viên
            axios.get(`http://localhost:5000/api/invitation/invitations-by-candidate/${userId}`)
                .then(response => {
                    if (response.data.invitations) {
                        setJobInvitationsData(response.data.invitations); // Lưu dữ liệu thư mời vào state
                        console.log("thong tin viec ", response.data.invitations);
                    } else {
                        console.log("Không có thư mời nào được trả về");
                    }
                })
                .catch(error => {
                    console.error("Lỗi khi tải thư mời:", error);
                })
                .finally(() => {
                    setLoading(false); // Đảm bảo loading tắt sau khi dữ liệu được tải
                });
        }
    }, [userId]);

    const handleAccept = (invitationId) => {
        setLoading(true); // Bắt đầu quá trình tải

        if (!invitationId) {
            console.error('Invitation ID is undefined!');
            setLoading(false); // Tắt loading ngay nếu không có invitationId
            return;
        }

        axios.post(`http://localhost:5000/api/invitation/accept/${invitationId}`)
            .then(response => {
                console.log(response.data.message);
                alert('Bạn đã chấp nhận lời mời và đang chờ nhà tuyển dụng xác nhận lịch phỏng vấn!');
            })
            .catch(error => {
                console.error('Lỗi khi chấp nhận lời mời:', error.response?.data?.message || error.message);
                alert('Đã xảy ra lỗi khi chấp nhận lời mời. Vui lòng thử lại!');
            })
            .finally(() => {
                fetchInvitations(userId); // Đảm bảo loading tắt sau khi dữ liệu được tải
            });
    };

    const handleReject = (invitationId) => {
        setLoading(true);
        if (!invitationId) {
            console.error('Invitation ID is undefined!');
            return;
        }

        axios.post(`http://localhost:5000/api/invitation/reject/${invitationId}`)
            .then(response => {
                console.log(response.data.message);
                alert('Bạn đã từ chối thư mời và nhà tuyển dụng đã được thông báo!');
                // Cập nhật lại dữ liệu nếu cần (ví dụ, xóa thư mời đã từ chối)
            })
            .catch(error => {
                console.error('Lỗi khi từ chối thư mời:', error.response?.data?.message || error.message);
                alert('Đã xảy ra lỗi khi từ chối thư mời. Vui lòng thử lại!');
            })
            .finally(() => {
                fetchInvitations(userId); // Tắt trạng thái loading sau khi thực thi
            });
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

    return (
        <>
            <div className="flex flex-col gap-5 w-full">
                <div className='flex gap-5 pb-3'>
                    <FaStream className="w-3 text-gray-700" />
                    <p className="font-semibold text-sm text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Job Recruitment</p>
                </div>

                <div className="w-full relative flex flex-col gap-2 items-start rounded-2xl">
                    <div className="w-full flex justify-start">
                        <button
                            className={`text-xs px-1 pb-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'appliedJobs'
                                ? 'text-[#0077b6] border-b-2 border-[#0077b6]'
                                : ''
                                }`}
                            onClick={() => handleTabClick('appliedJobs')}
                        >
                            <BriefcaseBusiness className='w-4 h-4' /> Việc làm đã ứng tuyển
                        </button>
                        <span className="px-1 pb-3 flex items-center text-center text-sm text-gray-400">|</span>
                        <button
                            className={`text-xs px-1 pb-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'savedJobs'
                                ? 'text-[#0077b6] border-b-2 border-[#0077b6]'
                                : ''
                                }`}
                            onClick={() => handleTabClick('savedJobs')}
                        >
                            <FaRegSave className='w-4 h-4' /> Việc làm đã lưu
                        </button>
                        <span className="px-1 pb-3 flex items-center text-center text-sm text-gray-400">|</span>
                        <button
                            className={`text-xs px-1 pb-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'viewedJobs'
                                ? 'text-[#0077b6] border-b-2 border-[#0077b6]'
                                : ''
                                }`}
                            onClick={() => handleTabClick('viewedJobs')}
                        >
                            <FaEye className='w-4 h-4' /> Việc làm đã xem
                        </button>
                        <span className="px-1 pb-3 flex items-center text-center text-sm text-gray-400">|</span>
                        <button
                            className={`text-xs px-1 pb-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'invited'
                                ? 'text-[#0077b6] border-b-2 border-[#0077b6]'
                                : ''
                                }`}
                            onClick={() => handleTabClick('invited')}
                        >
                            <FaEnvelopeOpenText className='w-4 h-4' /> Thư mời ứng tuyển
                        </button>
                    </div>
                </div>

                {/* Nội dung tab "DS công việc đã ứng tuyển */}
                {activeTab === 'appliedJobs' && (
                    <div className="bg-gray-50">
                        {loading ? (
                            <p>Đang tải danh sách công việc...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : (
                            <div className='flex flex-col sm:flex-row'>
                                <div className="w-full bg-gray-50">
                                    {/* Header */}
                                    <div className="p-6 bg-white rounded-t-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-base font-semibold text-gray-900">Danh sách công việc đã ứng tuyển</h2>
                                                <p className="text-sm text-gray-500">Tổng cộng {applications.length} công việc</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {applications.length > 0 ? (
                                            applications.map((job, index) => (
                                                <div
                                                    key={index}
                                                    className="flex h-36 gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
                                                >
                                                    <div className="aspect-square flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                        <img
                                                            src={job.job_id?.company_id?.logo || '/default-logo.png'}
                                                            alt="Company Logo"
                                                            className="object-contain w-full h-full"
                                                        />
                                                    </div>

                                                    <div className="flex flex-col justify-between flex-grow">
                                                        <div>
                                                            <Link
                                                                to={`/jobs/jobdetail/${job.job_id?._id}`}
                                                                className="text-lg font-semibold text-blue-600 hover:underline"
                                                            >
                                                                {job.job_id?.title}
                                                            </Link>
                                                            <p className="text-sm text-gray-600 mt-1">{job.job_id?.field} - {job.job_id?.company_id?.company_name}</p>
                                                            <p className="text-sm text-green-600 mt-1 font-medium">{job.job_id?.salary}$/tháng</p>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                <span>{job.job_id?.company_id?.location}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4 text-yellow-600" />
                                                                <span className="text-yellow-700">
                                                                    Còn {Math.floor((new Date(job.job_id?.application_deadline) - new Date()) / (1000 * 3600 * 24))} ngày
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col justify-between items-end gap-2 -ml-4">
                                                        <button onClick={() => toggleFavorite(job.job_id?.title)}>
                                                            {favorites.includes(job.job_id?.title) ? (
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

                                    {/* Pagination 
                                                                        <div className="bg-white px-3 py-6 flex items-center justify-between rounded-br-lg border-t border-gray-200">
                                        <div className="text-sm text-gray-700">
                                            Hiển thị {paginatedJobs.length} trong tổng {pagination.total} công việc
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={handlePrevPage}
                                                disabled={pagination.currentPage === 1}
                                                className={`px-3 py-2 text-sm ${pagination.currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                ← Trước
                                            </button>

                                            {[...Array(pagination.totalPages)].map((_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => setCurrentTestPage(i + 1)}
                                                    className={`px-3 py-2 text-sm rounded ${pagination.currentPage === i + 1
                                                        ? 'bg-[#2a726e] text-white'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}

                                            <button
                                                onClick={handleNextPage}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                                className={`px-3 py-2 text-sm ${pagination.currentPage === pagination.totalPages
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                Tiếp →
                                            </button>
                                        </div>
                                    </div>*/}

                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Nội dung tab "DS công việc đã lưu */}
                {activeTab === 'savedJobs' && (
                    <div className="bg-gray-50">
                        {loading ? (
                            <p>Đang tải danh sách công việc...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : (
                            <div className='flex flex-col sm:flex-row'>
                                <div className="w-full bg-gray-50">
                                    {/* Header */}
                                    <div className="p-6 bg-white rounded-t-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-base font-semibold text-gray-900">Danh sách công việc đã lưu</h2>
                                                <p className="text-sm text-gray-500">Tổng cộng {savedJobs.length} công việc</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {savedJobs.length > 0 ? (
                                            savedJobs.map((job, index) => (
                                                <div
                                                    key={index}
                                                    className="flex h-36 gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
                                                >
                                                    <div className="aspect-square flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                        <img
                                                            src={job.job_id?.company_id?.logo || '/default-logo.png'}
                                                            alt="Company Logo"
                                                            className="object-contain w-full h-full"
                                                        />
                                                    </div>

                                                    <div className="flex flex-col justify-between flex-grow">
                                                        <div>
                                                            <Link
                                                                to={`/jobs/jobdetail/${job.job_id?._id}`}
                                                                className="text-lg font-semibold text-blue-600 hover:underline"
                                                            >
                                                                {job.job_id?.title}
                                                            </Link>
                                                            <p className="text-sm text-gray-600 mt-1">{job.job_id?.field} - {job.job_id?.company_id?.company_name}</p>
                                                            <p className="text-sm text-green-600 mt-1 font-medium">{job.job_id?.salary}$/tháng</p>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                <span>{job.job_id?.company_id?.location}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4 text-yellow-600" />
                                                                <span className="text-yellow-700">
                                                                    Còn {Math.floor((new Date(job.job_id?.application_deadline) - new Date()) / (1000 * 3600 * 24))} ngày
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col justify-between items-end gap-2 -ml-4">
                                                        <button
                                                            onClick={() => openApplyForm(job.job_id)}
                                                            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-green-700"
                                                        >
                                                            Apply
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">Không có công việc liên quan.</p>
                                        )}
                                    </div>

                                    {/* Pagination 
                                                                        <div className="bg-white px-3 py-6 flex items-center justify-between rounded-br-lg border-t border-gray-200">
                                        <div className="text-sm text-gray-700">
                                            Hiển thị {paginatedJobs.length} trong tổng {pagination.total} công việc
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={handlePrevPage}
                                                disabled={pagination.currentPage === 1}
                                                className={`px-3 py-2 text-sm ${pagination.currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                ← Trước
                                            </button>

                                            {[...Array(pagination.totalPages)].map((_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => setCurrentTestPage(i + 1)}
                                                    className={`px-3 py-2 text-sm rounded ${pagination.currentPage === i + 1
                                                        ? 'bg-[#2a726e] text-white'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}

                                            <button
                                                onClick={handleNextPage}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                                className={`px-3 py-2 text-sm ${pagination.currentPage === pagination.totalPages
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                Tiếp →
                                            </button>
                                        </div>
                                    </div>*/}

                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Nội dung tab "DS công việc đã xem */}
                {activeTab === 'viewedJobs' && (
                    <div className="bg-gray-50">
                        {loading ? (
                            <p>Đang tải danh sách công việc...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : (
                            <div className='flex flex-col sm:flex-row'>
                                <div className="w-full bg-gray-50">
                                    {/* Header */}
                                    <div className="p-6 bg-white rounded-t-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-base font-semibold text-gray-900">Danh sách công việc đã xem</h2>
                                                <p className="text-sm text-gray-500">Tổng cộng {allViewedJobs.length} công việc</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {allViewedJobs.length > 0 ? (
                                            allViewedJobs.map((job, index) => (
                                                <div
                                                    key={index}
                                                    className="flex h-36 gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
                                                >
                                                    <div className="aspect-square flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                        <img
                                                            src={job.job_id?.company_id?.logo || '/default-logo.png'}
                                                            alt="Company Logo"
                                                            className="object-contain w-full h-full"
                                                        />
                                                    </div>

                                                    <div className="flex flex-col justify-between flex-grow">
                                                        <div>
                                                            <Link
                                                                to={`/jobs/jobdetail/${job.job_id?._id}`}
                                                                className="text-lg font-semibold text-blue-600 hover:underline"
                                                            >
                                                                {job.job_id?.title}
                                                            </Link>
                                                            <p className="text-sm text-gray-600 mt-1">{job.job_id?.field} - {job.job_id?.company_id?.company_name}</p>
                                                            <p className="text-sm text-green-600 mt-1 font-medium">{job.job_id?.salary}$/tháng</p>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                <span>{job.job_id?.company_id?.location}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4 text-yellow-600" />
                                                                <span className="text-yellow-700">
                                                                    Còn {Math.floor((new Date(job.job_id?.application_deadline) - new Date()) / (1000 * 3600 * 24))} ngày
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col justify-between items-end gap-2 -ml-4">
                                                        <button
                                                            onClick={() => openApplyForm(job.job_id)}
                                                            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-green-700"
                                                        >
                                                            Apply
                                                        </button>
                                                        <button onClick={() => toggleFavorite(job.job_id?.title)}>
                                                            {favorites.includes(job.job_id?.title) ? (
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

                                    {/* Pagination 
                                                                        <div className="bg-white px-3 py-6 flex items-center justify-between rounded-br-lg border-t border-gray-200">
                                        <div className="text-sm text-gray-700">
                                            Hiển thị {paginatedJobs.length} trong tổng {pagination.total} công việc
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={handlePrevPage}
                                                disabled={pagination.currentPage === 1}
                                                className={`px-3 py-2 text-sm ${pagination.currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                ← Trước
                                            </button>

                                            {[...Array(pagination.totalPages)].map((_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => setCurrentTestPage(i + 1)}
                                                    className={`px-3 py-2 text-sm rounded ${pagination.currentPage === i + 1
                                                        ? 'bg-[#2a726e] text-white'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}

                                            <button
                                                onClick={handleNextPage}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                                className={`px-3 py-2 text-sm ${pagination.currentPage === pagination.totalPages
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                Tiếp →
                                            </button>
                                        </div>
                                    </div>*/}

                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Nội dung tab "DS công việc đã xem */}
                {activeTab === 'invited' && (
                    <div className="bg-gray-50">
                        {loading ? (
                            <p>Đang tải danh sách công việc...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : (
                            <div className='flex flex-col sm:flex-row'>
                                <div className="w-full bg-gray-50">
                                    {/* Header */}
                                    <div className="p-6 bg-white rounded-t-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-base font-semibold text-gray-900">Lời mời ứng tuyển công việc từ nhà tuyển dụng</h2>
                                                <p className="text-sm text-gray-500">Tổng cộng {jobInvitationsData.length} lời mời ứng tuyển</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {jobInvitationsData.length > 0 ? (
                                            jobInvitationsData.map((job, index) => (
                                                <div className='flex flex-col gap-4  p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all'>
                                                    <div key={index} className="flex h-28 gap-4">
                                                        <div className="aspect-square flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                            <img
                                                                src={job.job.company_id?.logo || '/default-logo.png'}
                                                                alt="Company Logo"
                                                                className="object-contain w-full h-full"
                                                            />
                                                        </div>

                                                        <div className="flex flex-col justify-between flex-grow">
                                                            <div>
                                                                <Link
                                                                    to={`/jobs/jobdetail/${job.job?._id}`}
                                                                    className="text-lg font-semibold text-blue-600 hover:underline"
                                                                >
                                                                    {job.job?.title}
                                                                </Link>
                                                                <p className="text-sm text-gray-600 mt-1">{job.job?.field} - {job.job?.company_id?.company_name}</p>
                                                                <p className="text-sm text-green-600 mt-1 font-medium">{job.job?.salary}$/tháng</p>
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                                                                <div className="flex items-center gap-1">
                                                                    <MapPin className="w-4 h-4" />
                                                                    <span>{job.job?.company_id?.location}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-4 h-4 text-yellow-600" />
                                                                    <span className="text-yellow-700">
                                                                        Còn {Math.floor((new Date(job.job?.application_deadline) - new Date()) / (1000 * 3600 * 24))} ngày
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col justify-between items-end gap-2 -ml-4">
                                                            <button onClick={() => toggleFavorite(job.job?.title)}>
                                                                {favorites.includes(job.job_id?.title) ? (
                                                                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                                                                ) : (
                                                                    <HeartOff className="w-5 h-5 text-gray-400 hover:text-red-400" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="bg-[#f9f9f9] mt-2.5 p-2.5 border-l-4 border-[#007bff] rounded text-[14px] text-[#333]">
                                                        <p className="m-0 leading-[1.5]">
                                                            <strong className="text-[#007bff]">Lời nhắn:</strong> {job.message}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={() => handleAccept(job.invitationId)}
                                                            className="flex items-center gap-2 px-4 py-1 bg-blue-500 text-sm text-white rounded-full hover:bg-blue-600 transition"
                                                        >
                                                            <FaTimes /> Chấp nhận
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(job.invitationId)}
                                                            className="flex items-center gap-2 px-4 py-1 bg-red-500 text-sm text-white rounded-full hover:bg-red-600 transition"
                                                        >
                                                            <FaTimes /> Từ chối
                                                        </button>
                                                    </div>

                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">Không có công việc liên quan.</p>
                                        )}
                                    </div>

                                    {/* Pagination 
                                                                        <div className="bg-white px-3 py-6 flex items-center justify-between rounded-br-lg border-t border-gray-200">
                                        <div className="text-sm text-gray-700">
                                            Hiển thị {paginatedJobs.length} trong tổng {pagination.total} công việc
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={handlePrevPage}
                                                disabled={pagination.currentPage === 1}
                                                className={`px-3 py-2 text-sm ${pagination.currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                ← Trước
                                            </button>

                                            {[...Array(pagination.totalPages)].map((_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => setCurrentTestPage(i + 1)}
                                                    className={`px-3 py-2 text-sm rounded ${pagination.currentPage === i + 1
                                                        ? 'bg-[#2a726e] text-white'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}

                                            <button
                                                onClick={handleNextPage}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                                className={`px-3 py-2 text-sm ${pagination.currentPage === pagination.totalPages
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                Tiếp →
                                            </button>
                                        </div>
                                    </div>*/}

                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {jobToApply && (
                <ApplyJob job={jobToApply} onClose={closeApplyForm} />
            )}
        </>
    );
};

export default MyJob;

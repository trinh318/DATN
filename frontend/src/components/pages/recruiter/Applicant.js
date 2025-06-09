import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { FaEdit } from 'react-icons/fa';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/control/ui/dropdown-menu";
import { MdViewTimeline } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import {
    Mail,
    Phone,
    Building2,
    BadgeInfo,
} from 'lucide-react';
import {
    CalendarPlus,
    User,
    Briefcase,
    ClipboardList,
    MapPin,
    StickyNote,
    UserRoundX,
    CalendarOff
} from "lucide-react";
import {
    ArrowDownNarrowWide,
    ArrowUpNarrowWide,
    ChevronDown
} from "lucide-react";
import {
    CircleDot,
    CircleSlash,
    Clock,
    CheckCircle,
    XCircle
} from "lucide-react";
import { getId } from '../../../libs/isAuth';
import axios from 'axios';
import { toast } from 'sonner';

const statusOptions = [
    { value: "All", label: "Tất cả" },
    { value: "Đã gửi lịch phỏng vấn", label: "Đã gửi lịch phỏng vấn", icon: <CircleDot className="w-4 h-4 text-green-500" /> },
    { value: "Hủy", label: "Đã từ chối", icon: <XCircle className="w-4 h-4 text-gray-500" /> },
    { value: "Chờ phê duyệt", label: "Chờ phê duyệt", icon: <Clock className="w-4 h-4 text-yellow-500" /> },
    { value: "Đang đợi phỏng vấn", label: "Đang đợi phỏng vấn", icon: <Clock className="w-4 h-4 text-blue-500" /> },
    { value: "Đã phỏng vấn", label: "Đã phỏng vấn", icon: <CheckCircle className="w-4 h-4 text-green-600" /> }
];

const Application = ({ jobId }) => {  // Destructure jobId từ props 
    const [appliedProfiles, setAppliedProfile] = useState([]);
    const [job, setJob] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const interviewer_id = getId(); 

    const fetchJobData = async () => {
        console.log('jobId is valid:', jobId)
        console.log('interview', interviewer_id)
        if (!jobId) {
            console.log('jobId is not valid:', jobId); // Khi jobId không hợp lệ
            return;
        }

        try {
            setLoading(true);

            // Thực hiện đồng thời cả hai yêu cầu
            const [jobResponse, appliedProfileResponse] = await Promise.all([
                axios.get(`http://localhost:5000/api/jobs/${jobId}`),
                axios.get(`http://localhost:5000/api/profiles/applications/applied-profiles/${jobId}`, {
                    params: {
                        interviewer_id: interviewer_id
                    }
                })
            ]);

            // Cập nhật dữ liệu
            setJob(jobResponse.data);
            console.log('thong tin cong viec', jobResponse.data);

            setAppliedProfile(appliedProfileResponse.data); // Chỉnh đúng key theo dữ liệu trả về từ API
            console.log('thong tin CV', appliedProfileResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            console.error('Lỗi khi lấy dữ liệu:', error.response ? error.response.data : error.message);
            setError('Chưa có ứng viên nào ứng tuyển công việc này.'); // Thông báo lỗi
        } finally {
            setLoading(false); // Dừng trạng thái loading
        }
    };

    useEffect(() => {
        if (!jobId) return;
        setAppliedProfile([]);     // reset trước
        setError(null);            // reset lỗi
        fetchJobData();            // chỉ gọi hàm async, không cần .then
    }, [jobId]);

    const getDisplayStatus = (profile) => {
        const interview = Array.isArray(profile.interviews) && profile.interviews.length > 0 ? profile.interviews[0] : null;
        const application = profile.application;

        if (application?.status === "rejected") return "Hủy";
        if (interview?.status === "available") return "Đã gửi lịch phỏng vấn";
        if (interview?.status === "Đang đợi phỏng vấn") return "Đang đợi phỏng vấn";
        if (interview?.status === "cancle") return "Hủy";
        if (interview?.status === "Chờ phê duyệt") return "Chờ phê duyệt";
        if (interview?.status === "Đã phỏng vấn") return "Đã phỏng vấn";

        return "Khác"; // fallback
    };

    const [selectedStatus, setSelectedStatus] = useState("All");

    const filterAndSortProfiles = (profiles, statusFilter) => {
        let filtered = [...profiles];

        if (statusFilter !== "All") {
            filtered = filtered.filter(profile => getDisplayStatus(profile) === statusFilter);
        }

        return filtered;
    };

    const [pagination, setPagination] = useState({
        pageSize: 3,
        total: appliedProfiles.length,
        totalPages: Math.ceil(appliedProfiles.length / 3),
        currentPage: 1,
    });

    const handlePrevPage = () => {
        setPagination((prev) => ({
            ...prev,
            currentPage: Math.max(prev.currentPage - 1, 1),
        }));
    };

    const handleNextPage = () => {
        setPagination((prev) => ({
            ...prev,
            currentPage: Math.min(prev.currentPage + 1, prev.totalPages),
        }));
    };

    const setCurrentPage = (page) => {
        setPagination((prev) => ({
            ...prev,
            currentPage: page,
        }));
    };

    const processedProfiles = filterAndSortProfiles(appliedProfiles, selectedStatus);

    const currentProfiles = processedProfiles.slice(
        (pagination.currentPage - 1) * pagination.pageSize,
        pagination.currentPage * pagination.pageSize
    );

    useEffect(() => {
        const updatedProfiles = filterAndSortProfiles(appliedProfiles, selectedStatus);
        setPagination((prev) => ({
            ...prev,
            total: updatedProfiles.length,
            totalPages: Math.ceil(updatedProfiles.length / prev.pageSize),
            currentPage: 1,
        }));
    }, [appliedProfiles, selectedStatus]);

    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            total: processedProfiles.length,
            totalPages: Math.ceil(processedProfiles.length / prev.pageSize),
            currentPage: 1,
        }));
    }, [appliedProfiles, selectedStatus]);

    const [isOpenForm, setIsOpenForm] = useState(false);
    const [timeSlots, setTimeSlots] = useState([]);
    const [startTime, setStartTime] = useState("");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [profile, setProfile] = useState(null);

    const fetchSchedules = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/interviewschedule/applied-job/schedules`, {
                params: {
                    candidateId: userId,
                    jobId: jobId
                }
            });

            const converted = res.data.data.map(item => ({
                _id: item._id,
                startTime: item.start_time,
                status: item.status || "available",
                location: item.location,
                notes: item.notes
            }));

            setTimeSlots(converted);
        } catch (err) {
            console.error('Failed to fetch schedules:', err);
        }
    };

    const handleAddTimeSlot = () => {
        if (startTime && location) {
            setTimeSlots([
                ...timeSlots,
                {
                    _id: '',
                    jobId: jobId,
                    startTime,
                    location,
                    notes,
                    status: "available"
                }
            ]);
            setStartTime("");
            setLocation("");
            setNotes("");
        } else {
            alert("Vui lòng nhập đầy đủ thời gian và địa điểm.");
        }
    };

    useEffect(() => {
        if (selectedUserId) {
            fetchSchedules(selectedUserId);
        }
    }, [selectedUserId]);

    const handleOpenForm = (userId, current_profile) => {
        console.log('Posting schedule with jobId:', jobId);
        console.log('Posting schedule with ủeidđ:', userId);

        setIsOpenForm(true);
        setSelectedUserId(userId);
        setProfile(current_profile);
    }

    const handleConfirm = async () => {
        console.log('confirm Posting schedule with jobId:', jobId);

        for (const timeSlot of timeSlots) {
            if (!timeSlot._id) {
                console.log('confirm Posting schedule with jobId:', timeSlot);
                console.log('confirm Posting schedule with userid:', selectedUserId);
                try {
                    await axios.post('http://localhost:5000/api/interviewschedule', {
                        job_id: timeSlot.jobId,
                        candidate_id: selectedUserId,
                        start_time: timeSlot.startTime,
                        status: timeSlot.status,
                        location: timeSlot.location,
                        notes: timeSlot.notes
                    });
                } catch (error) {
                    console.error(`Error posting time ${timeSlot.startTime}:`, error.response?.data || error.message);
                    alert('Có lỗi xảy ra khi thêm lịch hẹn. Vui lòng thử lại!');
                    return;
                }
            }
        }

        alert('Lịch hẹn đã được thêm thành công!');
        setIsOpenForm(false);
        fetchJobData();
    };

    const handleRejected = async (applicationId) => {
        if (!jobId || !applicationId) {
            alert('Thiếu jobId hoặc applicationId');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5000/api/applications/reject/${jobId}/${applicationId}`);
            alert('Ứng viên đã bị từ chối thành công.');
            console.log('Rejected application:', response.data);

            // Gọi lại hàm fetch để cập nhật UI
            fetchJobData();
        } catch (error) {
            console.error('Lỗi khi từ chối ứng viên:', error.response?.data || error.message);
            alert('Có lỗi xảy ra khi từ chối ứng viên. Vui lòng thử lại!');
        }
    };

    const handleCancle = () => {
        setIsOpenForm(false);
    }

    const handleCancelInterviews = async (candidateId) => {
        if (!jobId || !candidateId) {
            toast('Thiếu jobId hoặc candidateId.');
            return;
        }

        const confirm = window.confirm('Bạn có chắc muốn hủy toàn bộ lịch phỏng vấn của ứng viên này?');
        if (!confirm) return;

        try {
            const res = await axios.put(`http://localhost:5000/api/interviewschedule/interviews/cancel`, {
                job_id: jobId,
                candidate_id: candidateId,
            });

            if (res.status === 200) {
                toast(res.data.message || 'Đã hủy toàn bộ lịch phỏng vấn.');

                // Gọi lại API để cập nhật danh sách lịch phỏng vấn mới
                fetchJobData();
            } else {
                toast(res.data.message || 'Không có lịch phỏng vấn nào để hủy.');
            }
        } catch (err) {
            console.error('Lỗi khi hủy lịch phỏng vấn:', err);
            toast(err.response?.data?.message || 'Đã xảy ra lỗi khi hủy lịch.');
        }
    };

    const handleConfirmInterviews = async (candidateId) => {
        try {
            const res = await axios.put('http://localhost:5000/api/interviewschedule/interviews/confirm', {
                job_id: jobId,
                candidate_id: candidateId,
            });

            if (res.status === 200) {
                toast("Đã xác nhận lịch phỏng vấn của ứng viên này."); // hoặc dùng toast
                fetchJobData();
            }
        } catch (err) {
            console.error('Lỗi khi xác nhận lịch phỏng vấn:', err);
            toast('Đã xảy ra lỗi khi xác nhận lịch phỏng vấn.');
        }
    };

    const renderEmptyApplicantsUI = () => (
        <div className="w-full bg-white rounded-lg">
            {/* Header */}
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            Chưa có ứng viên nào ứng tuyển công việc
                        </h2>
                        <p className="text-sm text-gray-500"></p>
                    </div>

                    {/* Bộ lọc trạng thái công việc */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex flex-row gap-2 items-center">
                            <label className="text-sm text-gray-600">Status</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="w-[218px] inline-flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-1">
                                        {statusOptions.find(opt => opt.value === selectedStatus)?.icon}
                                        <span>{statusOptions.find(opt => opt.value === selectedStatus)?.label}</span>
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="bg-white shadow-md rounded-md border w-60">
                                    {statusOptions.map((option) => (
                                        <DropdownMenuItem
                                            key={option.value}
                                            className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm text-gray-700"
                                        >
                                            {option.icon}
                                            <span>{option.label}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="h-[300px] w-full">
                    <div className="h-full bg-white flex items-center justify-center font-semibold text-gray-500 text-base">
                        <p>Chưa có ứng viên nào ứng tuyển.</p>
                    </div>
                </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-3 py-6 flex items-center justify-between rounded-b-lg border-t border-gray-200">
                <div className="text-sm text-gray-700">
                    Hiển thị 0 trong tổng 0 ứng viên
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handlePrevPage}
                        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Trước
                    </button>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-2 text-sm rounded ${pagination.currentPage === i + 1
                                ? "bg-[#2a726e] text-white"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={handleNextPage}
                        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                        Tiếp →
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading || error || !(appliedProfiles.length > 0)) {
        console.log("...", loading, error, !(appliedProfiles.length > 0))
        return renderEmptyApplicantsUI();
    }

    return (
        <div className="w-full bg-white rounded-lg">
            {/* Header */}
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Danh sách ứng viên ứng tuyển công việc</h2>
                        <p className="text-sm text-gray-500">Tổng cộng {appliedProfiles.length} ứng viên</p>
                    </div>
                    {/* Bộ lọc trạng thái công việc */}
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Bộ lọc trạng thái công việc */}
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex flex-row gap-2 items-center">
                                <label className="text-sm text-gray-600">Status</label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="w-[218px] inline-flex items-center justify-between gap-2 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-1">
                                            <div className='flex items-center justify-center gap-2'>
                                                {statusOptions.find(opt => opt.value === selectedStatus)?.icon}
                                                <span>{statusOptions.find(opt => opt.value === selectedStatus)?.label}</span>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent className="bg-white shadow-md rounded-md border w-60">
                                        {statusOptions.map((option) => (
                                            <DropdownMenuItem
                                                key={option.value}
                                                onClick={() => setSelectedStatus(option.value)}
                                                className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm text-gray-700"
                                            >
                                                {option.icon}
                                                <span>{option.label}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-auto relative">
                <table className="w-[1000px]">
                    <thead className="bg-gray-50 sticky top-0" style={{ zIndex: 2 }}>
                        <tr>
                            <th className="sticky top-0 left-0 px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ zIndex: 2 }}>Applicants</th>
                            <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Interview Time</th>
                            <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                            <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentProfiles.map((follower_profile, index) => {
                            const { profile, interviews = [], availableTimes = [] } = follower_profile;
                            const interviewList = interviews.length > 0 ? interviews : [{ isPlaceholder: true }];
                            return interviewList.map((interview, i) => (
                                <tr key={`${profile?._id}-${i}`} className="hover:bg-gray-50">
                                    {i === 0 && (
                                        <td rowSpan={interviewList.length} style={{ width: '35%', zIndex: 2 }} className="sticky left-0 bg-white">
                                            <div className="w-full rounded-xl">
                                                <div
                                                    className="w-full flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition duration-300 border border-gray-100"
                                                >
                                                    {/* Avatar + Actions */}
                                                    <div className='flex flex-col items-center justify-center gap-3'>
                                                        <div className="flex-shrink-0 w-16 h-16 relative mx-auto sm:mx-0">
                                                            <img
                                                                src={profile?.user_id?.avatar || 'user.png'}
                                                                alt="avatar"
                                                                className="w-full h-full rounded-full object-cover border-2 border-blue-200 shadow-sm"
                                                            />
                                                            <span className="absolute bottom-0 right-0 block w-4 h-4 bg-green-400 border-2 border-white rounded-full"></span>
                                                        </div>
                                                        {follower_profile?.application?.status === "rejected" ? (
                                                            <div className='flex flex-row gap-5'>
                                                                <Link
                                                                    to={`/applicants/applicant-profile/viewed/${profile?._id}?jobId=${jobId}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="bg-white border border-blue-500 text-blue-500 hover:border-blue-700 hover:text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1 shadow-sm"
                                                                >
                                                                    <MdViewTimeline className="w-3 h-3" />
                                                                    View
                                                                </Link>
                                                            </div>
                                                        ) : (
                                                            <div className='flex flex-row gap-5'>
                                                                <Link
                                                                    to={`/applicants/applicant-profile/${profile?._id}?jobId=${jobId}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="bg-white border border-blue-500 text-blue-500 hover:border-blue-700 hover:text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1 shadow-sm"
                                                                >
                                                                    <MdViewTimeline className="w-3 h-3" />
                                                                    View
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex flex-col justify-between flex-1 gap-2">
                                                        {follower_profile?.application?.status === "rejected" ? (
                                                            <div className="space-y-1">
                                                                <Link to={`/applicants/applicant-profile/viewed/${profile?._id}?jobId=${jobId}`} target="_blank" rel="noopener noreferrer">
                                                                    <h4 className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition">
                                                                        {`${profile?.first_name} ${profile?.last_name}`}
                                                                    </h4>
                                                                </Link>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-1">
                                                                <Link to={`/applicants/applicant-profile/${profile?._id}?jobId=${jobId}`} target="_blank" rel="noopener noreferrer">
                                                                    <h4 className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition">
                                                                        {`${profile?.first_name} ${profile?.last_name}`}
                                                                    </h4>
                                                                </Link>
                                                            </div>
                                                        )}

                                                        <div className="flex flex-col gap-2 text-xs text-gray-600">
                                                            <p className="flex items-center gap-2 truncate whitespace-nowrap">
                                                                <BadgeInfo className="w-3 h-3 text-gray-400" />
                                                                {`${profile?.job_title} - ${profile?.job_level}` || ''}
                                                            </p>
                                                            <p className="flex items-center gap-2 truncate whitespace-nowrap">
                                                                <Building2 className="w-3 h-3 text-indigo-500" />
                                                                {`${profile?.current_industry} - ${profile?.current_field}` || ''}
                                                            </p>
                                                            <p className="flex items-center gap-2 truncate whitespace-nowrap">
                                                                <Mail className="w-3 h-3 text-blue-500" />
                                                                {profile?.email}
                                                            </p>
                                                            <p className="flex items-center gap-2 truncate whitespace-nowrap">
                                                                <Phone className="w-3 h-3 text-green-500" />
                                                                {profile?.phone || 'Chưa cập nhật'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    )}

                                    {/* Lịch hẹn hoặc placeholder */}
                                    {interview?.isPlaceholder ? (
                                        <>
                                            <td className="px-2 py-4 text-[13px] text-gray-600" style={{ width: '20%' }}>
                                                {follower_profile?.application?.status === "rejected" ? null : (
                                                    Array.isArray(availableTimes) && availableTimes.length > 0 ? (
                                                        availableTimes.map((time, idx) => (
                                                            <div key={idx} className="my-appointment-row-calender" style={{ gridTemplateColumns: '100%' }}>
                                                                {new Date(time.time).toLocaleString()}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="w-full flex flex-col gap-2 items-center justify-center">
                                                            <button onClick={() => handleOpenForm(follower_profile.profile?.user_id?._id, follower_profile.profile)} className="inline-flex justify-center items-center gap-1 border border-indigo-600 hover:border-indigo-700 text-indigo-600 px-4 py-2 rounded-full text-xs font-semibold">
                                                                <FaPlus className="w-3 h-3" /> SCHEDULE
                                                            </button>
                                                            <button onClick={() => handleRejected(follower_profile.profile?.user_id?._id)} className="inline-flex justify-center items-center gap-1 border border-red-600 hover:border-red-700 text-red-600 px-4 py-2 rounded-full text-xs font-semibold">
                                                                <UserRoundX className="w-3 h-3" /> DECLINE
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </td>
                                            <td className="px-2 py-4 text-[13px] text-gray-600" style={{ width: '20%' }} />
                                            <td className="px-2 py-4 text-[13px] text-gray-600" style={{ width: '15%' }}>
                                                {follower_profile?.application?.status === "rejected" ? (
                                                    <div className="w-full flex flex-col gap-2 items-center justify-center font-semibold text-red-700">
                                                        <p>Đã từ chối</p>
                                                    </div>
                                                ) : (
                                                    <p>Chưa hẹn lịch phỏng vấn</p>
                                                )}
                                            </td>
                                            <td className="px-2 py-4 text-[13px] text-gray-600" style={{ width: '10%' }} />
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-2 py-4 text-[13px] text-gray-600" style={{ width: '20%' }}>
                                                <div className="my-appointment-row-calender" style={{ gridTemplateColumns: '100%' }}>
                                                    {new Date(interview.time).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 text-[13px] text-gray-600" style={{ width: '20%' }}>
                                                {interview.location || ""}
                                            </td>
                                            <td className="px-2 py-4 text-[13px] text-gray-600" style={{ width: '15%' }}>
                                                {follower_profile?.application?.status === "rejected" ? (
                                                    <div className="w-full flex flex-col gap-2 items-center justify-center font-semibold text-red-700">
                                                        <p>Đã từ chối</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {interview?.status === "available" && (
                                                            <p className="text-green-600 font-semibold">Đã gửi lịch phỏng vấn</p>
                                                        )}
                                                        {interview?.status !== "available" && interview?.status !== "Chờ phê duyệt" && (
                                                            <p className="text-gray-800 font-semibold">{interview?.status}</p>
                                                        )}
                                                        {interview?.status === "Chờ phê duyệt" && (
                                                            <>
                                                                <p className="text-yellow-600 font-semibold">Chờ phê duyệt</p>
                                                                <button
                                                                    onClick={() =>
                                                                        handleConfirmInterviews(follower_profile.profile?.user_id?._id)
                                                                    }
                                                                    className="mt-2 inline-flex justify-center items-center gap-1 border border-cyan-700 hover:border-cyan-900 text-cyan-900 px-4 py-2 rounded-full text-xs font-semibold"
                                                                >
                                                                    Xác nhận
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                            <td className="px-2 py-4 text-[13px] text-gray-600" style={{ width: '10%' }}>
                                                {interview.note || ""}
                                            </td>

                                        </>
                                    )}
                                    {i === 0 && follower_profile.application?.status !== "rejected" && (
                                        <td rowSpan={interviewList.length} className="px-2 py-4 text-[13px] text-gray-600">
                                            <div className='w-full h-full flex flex-col justify-center items-center gap-2'>
                                                <button
                                                    title="Thêm lịch phỏng vấn"
                                                    className="text-slate-700 w-5 h-5"
                                                    onClick={() => handleOpenForm(follower_profile.profile?.user_id?._id, follower_profile.profile)}
                                                >
                                                    <CalendarPlus className='w-5 h-5' />
                                                </button>
                                                <button
                                                    title="Hủy lịch phỏng vấn"
                                                    className="text-red-700 w-5 h-5"
                                                    onClick={() => handleCancelInterviews(follower_profile.profile?.user_id?._id)}
                                                >
                                                    <CalendarOff className='w-5 h-5' />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ));
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-3 py-6 flex items-center justify-between rounded-b-lg border-t border-gray-200">
                <div className="text-sm text-gray-700">
                    Hiển thị {currentProfiles.length} trong tổng {pagination.total} ứng viên
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrevPage} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">← Trước</button>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-2 text-sm rounded ${pagination.currentPage === i + 1 ? 'bg-[#2a726e] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button onClick={handleNextPage} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Tiếp →</button>
                </div>
            </div>

            {isOpenForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white w-full h-full max-w-3xl max-h-[432px] rounded-3xl p-6 shadow-2xl flex gap-6">
                        {/* Cột trái - Form tạo lịch */}
                        <div className="w-1/2 space-y-2 border-r pr-6">
                            <div className='pb-1'>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <CalendarPlus className="w-6 h-6 text-purple-600" />
                                    Tạo Lịch Hẹn
                                </h2>
                                <p className="text-xs text-gray-500 italic mt-1">
                                    Vui lòng chọn thời gian phù hợp để tạo lịch hẹn phỏng vấn với ứng viên.
                                </p>
                                <p className="text-xs text-gray-600 font-semibold mt-1">
                                    Mẫu: 01/30/2025 01:30 PM
                                </p>
                            </div>

                            {/* Input thời gian */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Thời gian bắt đầu
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-4 py-2 border border-purple-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                                />
                            </div>
                            {/* Input location */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    Địa điểm
                                </label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full px-4 py-2 border border-purple-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                                    placeholder="Nhập địa điểm phỏng vấn"
                                />
                            </div>

                            {/* Input notes */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                    <StickyNote className="w-4 h-4" />
                                    Ghi chú
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-2 border border-purple-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                                    placeholder="Nhập ghi chú (nếu có)"
                                />
                            </div>

                            <button
                                onClick={handleAddTimeSlot}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm transition flex items-center gap-1 w-full justify-center"
                            >
                                <CalendarPlus className="w-4 h-4" />
                                Thêm lịch
                            </button>
                        </div>

                        {/* Cột phải - Danh sách lịch đã thêm */}
                        <div className="w-1/2 flex flex-col justify-between space-y-4 max-h-[500px] pr-2">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-gray-700" />
                                Các lịch đã thêm
                            </h3>
                            <div className='overflow-y-auto h-full'>
                                {timeSlots.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">
                                        Chưa có lịch nào được thêm.
                                    </p>
                                ) : (
                                    timeSlots.map((slot, index) => (
                                        <div
                                            key={index}
                                            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-gray-50 space-y-1 mt-2"
                                        >
                                            <p className="text-sm text-gray-700 flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                <strong>Người phỏng vấn:</strong> {profile?.first_name} {profile?.last_name}
                                            </p>
                                            <p className="text-sm text-gray-700 flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <strong>Thời gian:</strong>{" "}
                                                {new Date(slot.startTime).toLocaleString()}
                                            </p>
                                            <p className="text-sm text-gray-700 flex items-start gap-1">
                                                <MapPin className="w-4 h-4 mt-0.5" />
                                                <span><strong>Địa điểm:</strong> {slot.location || "Không có"}</span>
                                            </p>
                                            <p className="text-sm text-gray-700 flex items-start gap-1">
                                                <StickyNote className="w-4 h-4 mt-0.5" />
                                                <span><strong>Ghi chú:</strong> {slot.notes || "Không có"}</span>
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                            {/* Nút hành động */}
                            <div className="flex justify-end space-x-1">
                                <button
                                    onClick={handleCancle}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl transition flex items-center gap-1 text-sm"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Hủy
                                </button>
                                <button
                                    onClick={() => handleConfirm()}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition flex items-center gap-1 text-sm"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}

export default Application;
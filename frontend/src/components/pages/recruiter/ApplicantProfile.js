import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { useLocation, useParams } from "react-router-dom";
import axios from 'axios';
import { BadgePercent, Wallet, Calendar, Share2, Heart } from 'lucide-react';
import { GiCheckMark } from "react-icons/gi";
import { Building2, CalendarDays } from "lucide-react";
import { GraduationCap, BookMarked } from "lucide-react";
import {
    CalendarPlus,
    Clock,
    User,
    Briefcase,
    CheckCircle,
    XCircle,
    ClipboardList,
    MapPin,
    StickyNote
} from "lucide-react";
import Header from '@/components/UI/Header';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs';

const ApplicantProfile = () => {
    const locations = useLocation();
    const { applicantId } = useParams();
    const [profile, setProfile] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [files, setFiles] = useState([]);
    const queryParams = new URLSearchParams(locations.search);
    const jobId = queryParams.get("jobId");
    const [userId, setUserId] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const [startTime, setStartTime] = useState("");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");
    console.log("Job ID:", jobId);
    const source = queryParams.get('source');
    console.log('Nguồn truy cập là:', source);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/profiles/applicant/profile/${applicantId}`, {
                    params: {
                        source: source,   // hoặc 'resume-db', tùy bạn muốn gửi gì
                        jobId: jobId      // nhớ khai báo biến job ở đâu đó rồi nhé
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    }
                });

                setProfile(response.data);
                setUserId(response.data.profile.user_id._id);
                setLoading(false);
            } catch (error) {
                console.error('Full error object:', error);

                let errorMessage = 'Đã xảy ra lỗi khi lấy dữ liệu ứng viên.';

                if (error.response) {
                    console.log('Status code:', error.response.status);
                    console.log('Response data:', error.response.data);
                    errorMessage = error.response.data.message || errorMessage;
                } else if (error.message) {
                    errorMessage = error.message;
                }

                alert(errorMessage);
                setError(errorMessage);
                setLoading(false);
            }

        };

        const fetchFiles = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/cvfile/files/by-profile/${applicantId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                setFiles(response.data.files);
            } catch (error) {
                setError('Failed to fetch files');
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
        fetchProfile();
        console.log("file", files)

    }, [applicantId]);

    useEffect(() => {
        const fetchSchedules = async () => {
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

        if (userId && jobId) {
            fetchSchedules();
        }
    }, [userId, jobId]); // chạy lại khi userId hoặc jobId thay đổi

    const [numPages, setNumPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Called when the document is loaded successfully
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setCurrentPage(1); // Reset to the first page
    };

    // Handle navigation to the previous page
    const goToPrevPage = () =>
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));

    // Handle navigation to the next page
    const goToNextPage = () =>
        setCurrentPage((prevPage) => Math.min(prevPage + 1, numPages));

    const renderFileViewer = (file) => {
        if (!file || !file.fileName) return <p>No file available</p>;

        if (file.mimeType === 'application/pdf') {
            return (
                <div className="pdf-viewer-container">
                    <div className="pdf-controls">
                        <button onClick={goToPrevPage} disabled={currentPage === 1}>
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {numPages}
                        </span>
                        <button onClick={goToNextPage} disabled={currentPage === numPages}>
                            Next
                        </button>
                    </div>
                    <div className="pdf-document">
                        <Document
                            file={file.fileName} // Đảm bảo URL của file PDF hợp lệ
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="pdf-document-container"
                        >
                            <Page pageNumber={currentPage} />
                        </Document>
                    </div>
                </div>
            );
        } else if (file.mimeType === 'application/msword' || file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return (
                <div className="word-viewer-container">
                    <span style={{ fontWeight: 'bold', color: '#333', marginRight: '10px', display: 'block' }}>
                        {file.originalName}
                    </span>                    <a
                        href={`https://docs.google.com/gview?url=${file.fileName}&embedded=true`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Xem file Word
                    </a>
                </div>
            );
        } else {
            return (
                <div className="generic-file-container">
                    <a href={file.fileName} target="_blank" rel="noopener noreferrer">
                        Xem file
                    </a>
                </div>
            );
        }
    };

    ///////////tạo lịch hẹn
    const [isOpenForm, setIsOpenForm] = useState(false);

    const handleAddTimeSlot = () => {
        if (startTime && location) {
            setTimeSlots([
                ...timeSlots,
                {
                    _id: '',
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

    const handleOpenForm = () => {
        setIsOpenForm(true);
    }

    const handleConfirm = async () => {
        for (const timeSlot of timeSlots) {
            if (!timeSlot._id) {
                try {
                    await axios.post('http://localhost:5000/api/interviewschedule', {
                        job_id: jobId,
                        candidate_id: userId,
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
    };

    const handleCancle = () => {
        setIsOpenForm(false);
    }

    const handleRejected = async (applicationId) => {
        if (!jobId || !applicationId) {
            alert('Thiếu jobId hoặc applicationId');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5000/api/applications/reject/${jobId}/${applicationId}`);
            alert('Ứng viên đã bị từ chối thành công.');
            console.log('Rejected application:', response.data);
        } catch (error) {
            console.error('Lỗi khi từ chối ứng viên:', error.response?.data || error.message);
            alert('Có lỗi xảy ra khi từ chối ứng viên. Vui lòng thử lại!');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <>
            <Header />
            <div className="flex gap-5 w-full py-4 px-8 bg-gray-50">
                <div className="rounded-2xl p-8 bg-white shadow-md max-w-[60%] w-full">
                    <div className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-16 h-16 relative mx-auto sm:mx-0">
                                <img
                                    src={profile?.profile?.user_id?.avatar || "user.png"}
                                    alt="avatar"
                                    className="w-full h-full rounded-full object-cover border-2 border-blue-200 shadow-sm"
                                />
                                <span className="absolute bottom-0 right-0 block w-4 h-4 bg-green-400 border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">{profile?.profile?.first_name} {profile?.profile?.last_name}</h2>
                                <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
                                    <span className="text-indigo-600 font-medium cursor-pointer">{profile?.profile?.current_industry}</span>
                                    <span>•</span>
                                    <span>{profile?.profile?.current_field}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button onClick={() => handleRejected(profile.profile?.user_id?._id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                DECLINE
                            </button>
                            {timeSlots > 0 ? (
                                <button onClick={handleOpenForm} className="border border-indigo-600 hover:border-indigo-700 text-indigo-600 px-4 py-2 rounded-full text-sm font-semibold">
                                    New Appointment
                                </button>) : (
                                <button onClick={handleOpenForm} className="border border-indigo-600 hover:border-indigo-700 text-indigo-600 px-4 py-2 rounded-full text-sm font-semibold">
                                    SCHEDULE
                                </button>
                            )}
                            <button className="w-9 h-9 border rounded-full flex items-center justify-center text-gray-500 hover:text-indigo-600">
                                <Heart className="w-4 h-4" />
                            </button>
                            <button className="w-9 h-9 border rounded-full flex items-center justify-center text-gray-500 hover:text-indigo-600">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Job Details */}
                    <div className="w-full flex justify-around gap-4 text-sm text-gray-700 py-6 my-6 border-y border-y-slate-400 border-dashed">
                        <div className="flex items-center gap-1 space-x-2">
                            <BadgePercent className="text-indigo-600 w-6 h-6" />
                            <div>
                                <div className="font-medium">Work Level</div>
                                <div className="text-gray-500">{profile?.profile?.job_level}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 space-x-2">
                            <Calendar className="text-indigo-600 w-6 h-6" />
                            <div>
                                <div className="font-medium">Min. Experience</div>
                                <div className="text-gray-500">{profile?.profile?.years_of_experience} Years</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 space-x-2">
                            <Briefcase className="text-indigo-600 w-6 h-6" />
                            <div>
                                <div className="font-medium">Work Location</div>
                                <div className="text-gray-500">{profile?.profile?.desired_work_location}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 space-x-2">
                            <Wallet className="text-indigo-600 w-6 h-6" />
                            <div>
                                <div className="font-medium">Salary</div>
                                <div className="text-gray-500">${profile?.profile?.desired_salary}/month</div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold mb-4">Thông tin chung</h2>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
                            {[
                                { label: "Vị trí hiện tại", value: profile?.profile?.job_title },
                                { label: "Cấp bậc hiện tại", value: profile?.profile?.job_level },
                                { label: "Ngành nghề", value: profile?.profile?.current_industry },
                                { label: "Lĩnh Vực", value: profile?.profile?.current_field },
                                { label: "Cấp bậc mong muốn", value: profile?.profile?.job_level },
                                { label: "Mức lương mong muốn", value: `${profile?.profile?.desired_salary} USD` },
                                { label: "Ngày sinh", value: new Date(profile?.profile?.date_of_birth).toLocaleDateString() },
                                { label: "Giới tính", value: profile?.profile?.gender },
                                { label: "Địa chỉ", value: profile?.profile?.specific_address },
                                { label: "Nơi làm việc mong muốn", value: profile?.profile?.desired_work_location }
                            ].map(({ label, value }, i) => (
                                <div key={i} className="flex justify-between">
                                    <span className="text-gray-600 font-medium">{label}:</span>
                                    <span className="text-gray-800">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="font-semibold text-md mb-2">Uploaded Files:</h3>
                        {files.length > 0 ? (
                            files.map((file, index) => (
                                <div key={index}>{renderFileViewer(file)}</div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No files available</p>
                        )}
                    </div>
                </div>

                <div className="flex-1 space-y-5">
                    <div className="bg-white p-4 rounded-2xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin học vấn</h3>
                        {profile?.academic?.length > 0 ? (
                            profile.academic.map((academic, id) => (
                                <div
                                    key={id}
                                    className="pb-4 mb-4 border-b border-gray-200 last:border-none"
                                >
                                    <h4 className="text-sm font-medium text-gray-900">
                                        {academic?.school_name}
                                    </h4>
                                    <p className="text-sm text-gray-600 italic">{academic?.industry}</p>
                                    <ul className="text-sm text-gray-700 mt-2 space-y-1">
                                        <li className="flex items-center">
                                            <GraduationCap className="w-4 h-4 mr-2 text-cyan-900" />
                                            {academic?.start_date} - {academic?.end_date}
                                        </li>
                                        <li className="flex items-start">
                                            <BookMarked className="w-4 h-4 mr-2 text-cyan-900 mt-0.5" />
                                            <span>{academic?.achievements}</span>
                                        </li>
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 italic">Không có thông tin học vấn.</p>
                        )}
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Kinh nghiệm làm việc</h3>
                        {profile?.experience?.length > 0 ? (
                            profile.experience.map((exp, index) => (
                                <div
                                    key={exp._id}
                                    className="pb-3 mb-3 border-b border-gray-200 last:border-none"
                                >
                                    <div className="mb-1">
                                        <h4 className="text-sm font-medium text-gray-900 mb-1">{exp.position}</h4>
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                                            {exp.company}
                                        </p>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700 mt-1">
                                        <CalendarDays className="w-4 h-4 mr-2 text-gray-500" />
                                        Từ Tháng {exp.startMonth} đến Tháng {exp.endMonth}
                                    </div>
                                    <p className="text-sm text-gray-800 mt-2 whitespace-pre-line">
                                        {exp.describe}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 italic">Chưa có kinh nghiệm làm việc nào.</p>
                        )}
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Kỹ năng</h3>
                        {profile?.profile?.skills?.length > 0 ? (
                            <ul className="grid grid-cols-2 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                {profile.profile.skills.map((skill, index) => (
                                    <li key={index} className="flex items-center text-gray-700">
                                        <GiCheckMark className="w-4 h-4 text-green-500 mr-2" />
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm italic">Không có kỹ năng nào được thêm vào.</p>
                        )}
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
                                                        <strong>Người phỏng vấn:</strong> {profile?.profile?.first_name} {profile?.profile?.last_name}
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
                                            onClick={handleConfirm}
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
                </div>
            </div>
        </>
    );
};

export default ApplicantProfile;
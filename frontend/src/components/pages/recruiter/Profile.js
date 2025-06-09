import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { useLocation, useParams } from "react-router-dom";
import axios from 'axios';
import { getId } from '@/libs/isAuth';
import { BriefcaseBusiness, Briefcase, BadgePercent, Wallet, Calendar, Share2, Heart } from 'lucide-react';
import { MailPlus, MessageSquare, XCircle, Send } from 'lucide-react'
import { GiCheckMark } from "react-icons/gi";
import { Building2, CalendarDays } from "lucide-react";
import { GraduationCap, BookMarked } from "lucide-react";
import { Check, ChevronsUpDown } from 'lucide-react';
import { Combobox } from '@headlessui/react';
import Header from '@/components/UI/Header';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs';

const Profile = () => {
    const locations = useLocation();
    const { applicantId } = useParams();
    const [profile, setProfile] = useState();
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [files, setFiles] = useState([]);
    const queryParams = new URLSearchParams(locations.search);
    const jobId = queryParams.get("jobId");
    const [applicantUserId, setApplicantUserId] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState("");
    const [message, setMessage] = useState("");
    const [query, setQuery] = useState('');
    const source = queryParams.get('source');
    const recruiterUserId = getId();

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
                setApplicantUserId(response.data.profile.user_id._id);
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

    useEffect(() => {
        // Kiểm tra xem recruiterId có tồn tại và modal có hiển thị không
        if (showModal && recruiterUserId) {
            setLoading(true);  // Đặt trạng thái loading là true khi bắt đầu gọi API

            // Gọi API lấy công việc của người tuyển dụng
            axios
                .get(`http://localhost:5000/api/invitation/by-recruiter/${recruiterUserId}`)
                .then((response) => {
                    setJobs(response.data.jobs);  // Lưu các công việc vào state jobs
                })
                .catch((error) => {
                    console.error("Error fetching jobs", error);
                })
                .finally(() => {
                    setLoading(false);  // Set lại trạng thái loading sau khi nhận kết quả
                });
        }
    }, [showModal, recruiterUserId]);

    const filteredJobs =
        query === ''
            ? jobs
            : jobs.filter((job) =>
                job.title.toLowerCase().includes(query.toLowerCase())
            );

    const handleInvite = () => {
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const currentToken = localStorage.getItem('token');
        console.log("Current token:", currentToken);
        if (!currentToken) {
            alert("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!");
            // Có thể chuyển hướng người dùng đến trang đăng nhập
            return;
        }
        try {
            // Gửi yêu cầu tạo thư mời
            const response = await axios.post(`http://localhost:5000/api/invitation`, {
                jobId: selectedJob,
                recruiterId: recruiterUserId,
                candidateId: applicantUserId,
                message,
            },
                {
                    headers: {
                        'Authorization': `Bearer ${currentToken}`,
                        'Content-Type': 'application/json'
                    },
                }
            );

            // Kiểm tra phản hồi và hiển thị thông báo thành công
            if (response.status === 201) {
                alert("Gửi lời mời thành công!");
                setShowModal(false); // Đóng modal sau khi gửi mời
            } else {
                alert("Lỗi khi gửi lời mời. Vui lòng thử lại.");
            }
        } catch (error) {
            // Kiểm tra lỗi và hiển thị thông báo lỗi chi tiết
            if (error.response && error.response.data && error.response.data.message) {
                alert(`${error.response.data.message}`);
            } else {
                alert("Đã xảy ra lỗi khi gửi lời mời. Vui lòng thử lại sau.");
            }
        }
    };

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
                            file={file.fileName}
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
                            <button onClick={handleInvite} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                INVITE TO APPLY
                            </button>
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
                </div>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-4">

                        {/* Tiêu đề với icon */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <MailPlus className="w-6 h-6 text-blue-600" />
                            Thêm Thư Mời Ứng Tuyển
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Select công việc có search */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <BriefcaseBusiness className="w-4 h-4 text-blue-600" />
                                    Chọn công việc:
                                </label>
                                <Combobox value={selectedJob} onChange={setSelectedJob}>
                                    <div className="relative">
                                        <Combobox.Input
                                            className="w-full border border-blue-400 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                            displayValue={(job) => job?.title || ''}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Tìm kiếm công việc..."
                                        />
                                        <Combobox.Button className="absolute inset-y-0 right-2 flex items-center">
                                            <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                                        </Combobox.Button>
                                        {filteredJobs.length > 0 && (
                                            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white border border-gray-200 shadow-lg text-sm">
                                                {filteredJobs.map((job) => (
                                                    <Combobox.Option
                                                        key={job._id}
                                                        value={job}
                                                        className={({ active }) =>
                                                            `cursor-pointer px-4 py-2 ${active ? 'bg-purple-100 text-blue-700' : 'text-gray-800'}`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <div className="flex justify-between items-center">
                                                                {job.title}
                                                                {selected && <Check className="w-4 h-4 text-blue-700" />}
                                                            </div>
                                                        )}
                                                    </Combobox.Option>
                                                ))} 
                                            </Combobox.Options>
                                        )}
                                    </div>
                                </Combobox>
                            </div>

                            {/* Lời nhắn có icon */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                    Lời nhắn:
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Nhập lời nhắn"
                                    className="w-full border border-blue-400 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                />
                            </div>

                            {/* Nút hành động với icon & đổi màu */}
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedJob(null);
                                        setMessage('');
                                    }}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl text-sm flex items-center gap-1"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-1"
                                >
                                    <Send className="w-4 h-4" />
                                    Gửi Thư Mời
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;
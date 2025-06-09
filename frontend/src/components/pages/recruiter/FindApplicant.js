import * as pdfjsLib from "pdfjs-dist";
import React, { useEffect, useState, useMemo } from 'react';
import { FaEye, FaUsers, FaStream } from 'react-icons/fa';
import { FaCoins } from "react-icons/fa";
import { getId } from '../../../libs/isAuth';
import axios from 'axios';
import { Link } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/control/ui/dropdown-menu";
import {
    ChevronDown,
} from 'lucide-react';
import {
    Layers2,
    Shapes,
    BriefcaseBusiness
} from "lucide-react";
import { MdViewTimeline } from "react-icons/md";
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
import { Button } from '@/components/control/ui/button'
import { LoaderCircle } from 'lucide-react'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs';

const FindApplicant = () => {
    const idnd = getId();
    const [resumeIds, setResumeIds] = useState([]);
    const [allCVFiles, setALLCVFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingBatch, setLoadingBatch] = useState(null);
    const [error, setError] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [allJobData, setAllJobData] = useState([]);
    const [companyId, setCompanyId] = useState(null);
    const [batchMatchResults, setBatchMatchResults] = useState([]);
    const [suitedProfiles, setSuitedProfiles] = useState([]);
    const [activeTab, setActiveTab] = useState('listJobs');
    const handleTabClick = (tab) => setActiveTab(tab);

    useEffect(() => {
        const fetchCompanyId = async () => {
            try {
                console.log('Fetching data for user_id:', idnd);  // Kiểm tra giá trị của idnd
                const responseCompany = await axios.get(`http://localhost:5000/api/companies/${idnd}`);
                setCompanyId(responseCompany.data._id);
            } catch (error) {
                setError('Failed to load company data.');
            } finally {
                setLoading(false);
            }
        };

        const fetchAllCVFiles = async () => {
            try {
                setLoading(true);
                const responseAllCVFile = await axios.get("http://localhost:5000/api/cvfile/files");
                setALLCVFiles(responseAllCVFile.data); // Dữ liệu đã có trường applicationCount
            } catch (error) {
                console.error('Error fetching jobs:', error);
                setError('Lỗi khi tải danh sách công việc.');
            } finally {
                setLoading(false); // Dừng trạng thái loading
            }
        };

        if (idnd) {
            fetchCompanyId();
            fetchAllCVFiles();
        } else {
            console.log('idnd is not valid:', idnd);
        }
    }, [idnd]);

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                setLoading(true);
                console.log("company id: ", companyId);
                const responseAllJob = await axios.get(`http://localhost:5000/api/jobs/recruiter/jobs-by-company/${companyId}`);
                setAllJobData(responseAllJob.data); // Dữ liệu đã có trường applicationCount
                console.log("cac cong viec la", allJobData);
            } catch (error) {
                console.error('Error fetching jobs:', error);
                setError('Lỗi khi tải danh sách công việc.');
            } finally {
                setLoading(false); // Dừng trạng thái loading
            }
        };

        if (companyId) {
            fetchAllJobs();
            console.log("jobs", allJobData);
        } else {
            console.log('Company id is not valid:', companyId); // Khi companyId không hợp lệ
        }
    }, [companyId]);

    useEffect(() => {
        const fetchAllSuitedProfiles = async () => {
            setLoading(true);
            try {
                const response = await axios.post("http://localhost:5000/api/profiles/batch", { cvFileIds: resumeIds });
                setSuitedProfiles(response.data);
            } catch (error) {
                setError('Failed to load profile data.');
                console.error('Error fetching profiles:', error);
            } finally {
                setLoading(false);
                setLoadingBatch(false);
            }
        };

        if (resumeIds && resumeIds.length > 0) {
            console.log("resumeId", resumeIds);
            fetchAllSuitedProfiles();
        }
    }, [resumeIds]);

    function extractExperience(text) {
        const matches = [...text.matchAll(/(\d+)\s*(năm|tháng)/gi)];

        let years = 0;
        let months = 0;

        matches.forEach(([_, value, unit]) => {
            const num = parseInt(value, 10);
            if (unit.toLowerCase() === 'năm') {
                years += num;
            } else if (unit.toLowerCase() === 'tháng') {
                months += num;
            }
        });

        // Gộp tháng thành năm nếu > 12
        if (months >= 12) {
            years += Math.floor(months / 12);
            months = months % 12;
        }

        // Tạo chuỗi mô tả
        const parts = [];
        if (years > 0) parts.push(`${years} năm`);
        if (months > 0) parts.push(`${months} tháng`);

        return parts.length > 0 ? parts.join(' ') : 'Không yêu cầu';
    }

    // Hàm đọc text từ URL file PDF
    const extractTextFromPDFUrl = async (pdfUrl) => {
        const response = await fetch(pdfUrl);
        const arrayBuffer = await response.arrayBuffer();
        const typedArray = new Uint8Array(arrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;

        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item) => item.str).join(" ");
            text += pageText + "\n";
        }

        return text;
    };

    const buildJobInformation = (job) => {
        if (!job) return "";

        return `
            Tiêu đề: ${job.title || ""}
            Mô tả công việc: ${job.description || ""}
            Yêu cầu công việc: ${job.requirements || ""}
            Kỹ năng: ${(job.skills || []).join(", ")}
            Bằng cấp: ${(job.qualifications || []).join(", ")}
            Quyền lợi: ${(job.benefits || []).join(", ")}
            Địa điểm: ${job.location || ""}
            Lĩnh vực: ${job.field || ""}
            Ngành nghề: ${(job.careers || []).join(", ")}
            Ghi chú: ${job.note || ""}
            `.trim();
    };

    const matchMultipleCVsWithJD = async () => {
        if (!selectedJob || allCVFiles.length === 0) return [];

        const jobInfo = buildJobInformation(selectedJob);

        console.log("jobInfo", jobInfo)
        const resumeTexts = await Promise.all(
            allCVFiles.files.map(async (file) => {
                const text = await extractTextFromPDFUrl(file.fileName);
                return {
                    _id: file._id,
                    originalName: file.originalName,
                    content: text,
                };
            })
        );

        console.log("resume", resumeTexts)
        try {
            const response = await axios.post("http://localhost:5001/api/match-resumes", {
                job_description: jobInfo,
                cvs: resumeTexts, // mỗi CV có: _id, originalName, content
            });

            return response.data.results; // [{ _id, score, recommendation }]
        } catch (err) {
            console.error("Error matching multiple CVs:", err);
            return [];
        }
    };

    const handleBatchResumeMatch = async () => {
        if (!selectedJob) {
            alert("Vui lòng chọn một công việc trước!");
            return;
        }
        setLoadingBatch(true);

        const results = await matchMultipleCVsWithJD();

        console.log("Batch matching results:", results);
        setBatchMatchResults(results);
        setResumeIds(
            results
                .filter(res => res.score >= 45)
                .map(res => res._id)
        );
        console.log("resumeId", resumeIds)
    };

    const [pagination, setPagination] = useState({
        pageSize: 3,
        total: suitedProfiles.length,
        totalPages: Math.ceil(suitedProfiles.length / 3),
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

    const currentProfiles = suitedProfiles.slice(
        (pagination.currentPage - 1) * pagination.pageSize,
        pagination.currentPage * pagination.pageSize
    );

    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            total: suitedProfiles.length,
            totalPages: Math.ceil(suitedProfiles.length / prev.pageSize),
            currentPage: 1,
        }));
    }, [suitedProfiles]);


    const renderEmptyApplicantsUI = () => (
        <div className="w-full bg-white rounded-lg">
            {/* Header */}
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            Chưa có ứng viên nào phù hợp
                        </h2>
                        <p className="text-sm text-gray-500"></p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="h-[300px] w-full">
                    <div className="h-full bg-white flex items-center justify-center font-semibold text-gray-500 text-base">
                        <p>Chưa có ứng viên nào phù hợp</p>
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

    return (

        <div className="flex flex-col gap-5 w-full">
            <div className='flex gap-5 pb-3'>
                <FaStream className="w-3 text-gray-700" />
                <p className="font-semibold text-sm text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Job Recruitment</p>
            </div>

            <div className="w-full relative flex flex-col gap-2 items-start rounded-2xl">
                <div className="w-full flex justify-start">
                    <button
                        className={`text-xs px-1 pb-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'listJobs'
                            ? 'text-[#0077b6] border-b-2 border-[#0077b6]'
                            : ''
                            }`}
                        onClick={() => handleTabClick('listJobs')}
                    >
                        <FaEye /> Tìm kiếm ứng viên
                    </button>
                    <span className="px-1 pb-3 flex items-center text-center text-sm text-gray-400">|</span>
                    <button
                        className={`text-xs px-1 pb-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'applicants'
                            ? 'text-[#0077b6] border-b-2 border-[#0077b6]'
                            : ''
                            }`}
                        onClick={() => handleTabClick('invited')}
                    >
                        <FaUsers /> Thư mời ứng tuyển
                    </button>
                </div>
            </div>
            {/* Nội dung tab "DS công việc đã đăng" */}
            {activeTab === 'invited' && (
                <div className="bg-[#f9f9f9] followed-companies">

                </div>
            )}

            {/* Nội dung tab "Nhà tuyển dụng xem ds ứng tuyển" */}
            {activeTab === 'listJobs' && (
                <div className="bg-[#f9f9f9] followed-companies">
                    {loading ? (
                        <p>Đang tải danh sách ứng viên...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        <div className='flex flex-col sm:flex-row gap-6'>
                            <div className="w-full sm:w-[30%] flex flex-col gap-6 mx-auto">
                                <div className="w-full flex flex-col gap-2 p-3 bg-white rounded-2xl">
                                    <label className="text-sm text-gray-600">Select Job:</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="w-full inline-flex items-center justify-between pb-1 gap-2 border-b-2 border-b-slate-400 text-sm font-semibold text-gray-700 bg-white hover:border-gray-400">
                                                <span className='truncate whitespace-nowrap'>{selectedJob ? `${selectedJob.title} - ${selectedJob.interview_location}` : "Job Selected: None"}</span>
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </DropdownMenuTrigger>

                                        {/* Match width with trigger */}
                                        <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width] max-h-52 bg-white shadow-md rounded-md border border-slate-300 overflow-y-auto whitespace-nowrap">
                                            {allJobData.map((option) => (
                                                <DropdownMenuItem
                                                    key={option._id}
                                                    onClick={() => {
                                                        setSelectedJob(option);
                                                        setSelectedJobId(option._id);
                                                    }}
                                                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-300"
                                                >
                                                    <span className="truncate whitespace-nowrap">{`${option.title} - ${option.interview_location}`}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Button className="bg-blue-600 hover:bg-blue-900 text-white py-5 rounded-full mt-3" disabled={loadingBatch} onClick={handleBatchResumeMatch}>
                                        {loadingBatch ? <LoaderCircle className='animate-spin' /> : 'Tìm kiếm'}
                                    </Button>
                                </div>
                                <div className="w-full bg-white rounded-2xl p-3 flex flex-col gap-4">
                                    {selectedJob ? (
                                        <>
                                            {/* Title */}
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-800 leading-tight py-2">
                                                    {selectedJob.title}
                                                    <br></br>
                                                    <span className="text-sm font-normal text-gray-500">{selectedJob.field}</span>
                                                </h2>
                                                <hr className="my-2 border-gray-200" />
                                            </div>

                                            {/* Info Items */}
                                            <div className="flex flex-col gap-4 text-sm">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <Layers2 className="w-4 h-4 text-purple-600" />
                                                        <span>Work Level</span>
                                                    </div>
                                                    <span className="font-medium text-gray-800">{selectedJob.interview_location}</span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <Shapes className="w-4 h-4 text-purple-600" />
                                                        <span>Min. Experience</span>
                                                    </div>
                                                    <span className="font-medium text-gray-800">{extractExperience(selectedJob.requirements)}</span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <BriefcaseBusiness className="w-4 h-4 text-purple-600" />
                                                        <span>Employee Type</span>
                                                    </div>
                                                    <span className="font-medium text-gray-800">{selectedJob.job_type}</span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <FaCoins className="w-4 h-4 text-purple-600" />
                                                        <span>Salary</span>
                                                    </div>
                                                    <span className="font-medium text-gray-800">${selectedJob.salary}</span>
                                                </div>
                                            </div>

                                            {/* Overview */}
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-700">Job Overview</h3>
                                                <p className="text-sm text-gray-500 leading-snug">
                                                    {selectedJob.description}
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-700">Job Requirements</h3>
                                                <p className="text-sm text-gray-500 leading-snug">
                                                    {selectedJob.requirements}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className='h-[300px] bg-white'>
                                                <h2 className="text-lg font-semibold text-gray-800 leading-tight py-2">
                                                    Please select a job!
                                                </h2>
                                                <hr className="my-2 border-gray-200" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="w-full sm:w-[70%] max-w-[70%]">
                                {(loading || error || !(suitedProfiles.length > 0)) ? (
                                    renderEmptyApplicantsUI()
                                ) : (
                                    <div className="w-full bg-white rounded-lg">
                                        {/* Header */}
                                        <div className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-base font-semibold text-gray-900">Danh sách ứng viên phù hợp với công việc</h2>
                                                    <p className="text-sm text-gray-500">Tổng cộng {suitedProfiles.length} ứng viên</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Table */}
                                        <div className="overflow-auto relative">
                                            {currentProfiles.map((profile, index) => {
                                                const cvFileId = profile.cv_files?.[0]?._id; // lấy _id của cv file đầu tiên
                                                const matchResult = batchMatchResults.find(result => result._id === cvFileId); // tìm kết quả tương ứng
                                                const interviews = profile.interviews?.length > 0 ? profile.interviews : [{ isPlaceholder: true }];

                                                return interviews.map((interview, i) => (
                                                    <tr key={`${profile?._id}-${i}`} className="hover:bg-gray-50">
                                                        {i === 0 && (
                                                            <td rowSpan={interviews.length} style={{ width: '35%', zIndex: 2 }} className="sticky left-0 bg-white">
                                                                <div className="w-full rounded-xl">
                                                                    <div className="w-full flex flex-col sm:flex-row gap-8 py-3 px-6 bg-white rounded-xl shadow-sm hover:shadow-md transition duration-300 border border-gray-100">
                                                                        {/* Avatar + Actions */}
                                                                        <div className='flex flex-col items-center justify-center gap-1'>
                                                                            <div className="flex-shrink-0 w-16 h-16 relative mx-auto sm:mx-0">
                                                                                <img
                                                                                    src={profile?.user_id?.avatar || 'user.png'}
                                                                                    alt="avatar"
                                                                                    className="w-full h-full rounded-full object-cover border-2 border-blue-200 shadow-sm"
                                                                                />
                                                                                <span className="absolute bottom-0 right-0 block w-4 h-4 bg-green-400 border-2 border-white rounded-full"></span>
                                                                            </div>
                                                                            <div className='flex flex-row gap-5'>
                                                                                <Link
                                                                                    to={`/applicants/applicant-profile/${profile?._id}?selectedJobId=${selectedJobId}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="bg-white border border-blue-500 text-blue-500 hover:border-blue-700 hover:text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1 shadow-sm"
                                                                                >
                                                                                    <MdViewTimeline className="w-3 h-3" />
                                                                                    View
                                                                                </Link>
                                                                            </div>
                                                                        </div>

                                                                        {/* Info */}
                                                                        <div className="flex flex-col flex-1 gap-2 justify-between">
                                                                            <div className="space-y-1">
                                                                                <Link to={`/applicants/applicant-profile/${profile?._id}?selectedJobId=${selectedJobId}`} target="_blank" rel="noopener noreferrer">
                                                                                    <h4 className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition">
                                                                                        {`${profile?.first_name} ${profile?.last_name}`}
                                                                                    </h4>
                                                                                </Link>
                                                                            </div>

                                                                            <div className="grid grid-cols-2 md:grid-cols-2">
                                                                                <div className="flex flex-col gap-2 text-xs text-gray-600">
                                                                                    <p className="flex items-center gap-2 truncate whitespace-nowrap">
                                                                                        <BadgeInfo className="w-3 h-3 text-gray-400" />
                                                                                        {`${profile?.job_title || 'Chưa cập nhật'} - ${profile?.job_level || 'Chưa cập nhật'}`}
                                                                                    </p>
                                                                                    <p className="flex items-center gap-2 truncate whitespace-nowrap">
                                                                                        <Building2 className="w-3 h-3 text-indigo-500" />
                                                                                        {`${profile?.current_industry || ''} - ${profile?.current_field || ''}`}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="flex flex-col gap-2 text-xs text-gray-600">
                                                                                    <p className="flex items-center gap-2 truncate whitespace-nowrap">
                                                                                        <Mail className="w-3 h-3 text-blue-500" />
                                                                                        {profile?.email || 'Chưa cập nhật'}
                                                                                    </p>
                                                                                    <p className="flex items-center gap-2 truncate whitespace-nowrap">
                                                                                        <Phone className="w-3 h-3 text-green-500" />
                                                                                        {profile?.phone || 'Chưa cập nhật'}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                                <div className="col-span-2 flex flex-row gap-2 text-xs text-gray-600">
                                                                                    <p className="font-bold text-red-600">{matchResult ? `${matchResult.score.toFixed(2)}%` : 'Không có'}</p>
                                                                                    - {matchResult ? matchResult.recommendation : 'Không có nhận xét'}
                                                                                </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ));
                                            })}
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
                                    </div >
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default FindApplicant;
import React, { useEffect, useState, useMemo } from 'react';
import { FaEye, FaUsers, FaStream } from 'react-icons/fa';
import { FaCoins, FaTrash } from "react-icons/fa";
import { ChevronsUpDown, Check } from 'lucide-react';
import { Captions, CircleHelp, CopyPlus, List, NotebookPen, PenLine, Rows4, UploadCloud, X } from "lucide-react";
import '../../../styles/companyprofile.css';
import '../../../styles/jobrecruiment.css';
import { getId } from '../../../libs/isAuth';
import { Textarea } from '@/components/control/ui/textarea';
import axios from 'axios';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/control/ui/dropdown-menu";
import { MoreVertical, Trash2, PencilLine, Eye, Plus } from "lucide-react";
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
import Application from './Applicant';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/control/ui/button';
import { Combobox } from '@headlessui/react';

const token = localStorage.getItem('token');

const sortOptions = [
    {
        value: "newest",
        label: "Newest",
        icon: <ArrowDownNarrowWide className="w-4 h-4 text-gray-500" />
    },
    {
        value: "oldest",
        label: "Oldest",
        icon: <ArrowUpNarrowWide className="w-4 h-4 text-gray-500" />
    }
];

const typeOptions = [
    { value: "All", label: "All" },
    { value: "full_time", label: "Full-time", icon: <Briefcase className="w-4 h-4 text-blue-600" /> },
    { value: "part_time", label: "Part-time", icon: <Timer className="w-4 h-4 text-purple-600" /> },
    { value: "internship", label: "Internship", icon: <GraduationCap className="w-4 h-4 text-orange-500" /> },
    { value: "freelance", label: "Freelance", icon: <MousePointerClick className="w-4 h-4 text-pink-500" /> }
];

const statusOptions = [
    { value: "All", label: "All" },
    { value: "open", label: "Open", icon: <CircleDot className="w-4 h-4 text-green-500" /> },
    { value: "closed", label: "Closed", icon: <CircleSlash className="w-4 h-4 text-red-500" /> },
    { value: "pending", label: "Pending", icon: <Clock className="w-4 h-4 text-yellow-500" /> }
];

const JobRecruitment = () => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const removeFile = () => {
        setSelectedFile(null);
    };

    const idnd = getId();
    const [companyId, setCompanyId] = useState(null); // Lưu companyId trong state
    const [companyName, setCompanyName] = useState(null); // Lưu companyId trong state
    const [loading, setLoading] = useState(true); // State để kiểm tra trạng thái loading
    const [error, setError] = useState(null); // State để lưu lỗi (nếu có)  
    const [tests, setTests] = useState([]);
    const [allJobData, setAllJobData] = useState([]); // Lưu danh sách công việc
    const [loadingJobs, setLoadingJobs] = useState(true); // Trạng thái loading
    const [errorJobs, setErrorJobs] = useState(null); // Lưu lỗi nếu có
    const [isEditMode, setIsEditMode] = useState(false); // false = create, true = update
    const [jobIdEdit, setJobIdEdit] = useState(null); // false = create, true = update
    const [company, setCompany] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [sortOption, setSortOption] = useState('newest');
    const navigate = useNavigate();

    const [jobData, setJobData] = useState({
        employer_id: '',
        company_id: '',
        title: '',
        description: '',
        requirements: '',
        skills: [],
        qualifications: [],
        salary: '',
        job_type: 'full_time',
        vacancy: '',
        location: '',
        interview_location: '',
        note: '',
        application_deadline: '',
        benefits: [],
        test: '',
        field: '',
        careers: [],
    });

    useEffect(() => {
        const fetchCompanyId = async () => {
            try {
                console.log('Fetching data for user_id:', idnd);  // Kiểm tra giá trị của idnd
                const responseCompany = await axios.get(`http://localhost:5000/api/companies/${idnd}`);
                setCompanyId(responseCompany.data._id);
                setCompanyName(responseCompany.data.company_name);
            } catch (error) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        const fetchCompany = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/companies/company/${companyId}`);
                setCompany(response.data);
                console.log('Company ID:', companyId);
                setLoading(false);
            } catch (error) {
                setError('Error fetching company data');
                setLoading(false);
            }
        };

        if (idnd) {
            fetchCompanyId();
            fetchCompany();
        } else {
            console.log('idnd is not valid:', idnd); // Khi idnd không hợp lệ
        }
    }, [idnd]);

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                setLoadingJobs(true);
                console.log("company id: ", companyId);
                const responseAllJob = await axios.get(`http://localhost:5000/api/jobs/recruiter/jobs-by-company/${companyId}`);
                setAllJobData(responseAllJob.data); // Dữ liệu đã có trường applicationCount
                console.log("cac cong viec la", allJobData);
            } catch (error) {
                console.error('Error fetching jobs:', error);
                setErrorJobs('Lỗi khi tải danh sách công việc.');
            } finally {
                setLoadingJobs(false); // Dừng trạng thái loading
            }
        };

        if (companyId) {
            fetchAllJobs();
            console.log("jobs", allJobData);
        } else {
            console.log('Company id is not valid:', companyId); // Khi companyId không hợp lệ
        }
    }, [companyId]);

    // Chuyển đổi tab
    const [activeTab, setActiveTab] = useState('listJobs');
    const handleTabClick = (tab) => setActiveTab(tab);

    // Hàm xử lý thay đổi input chung cho tất cả các trường
    const handleInputJobChange = (e) => {
        const { name, value } = e.target;
        setJobData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // Hàm xử lý thay đổi cho kỹ năng (skills)
    const handleSkillsChange = (e) => {
        const { value } = e.target;
        const skillsArray = value.split(',').map((skill) => skill.trim()); // Chuyển chuỗi thành mảng
        setJobData((prevData) => ({
            ...prevData,
            skills: skillsArray
        }));
    };

    // Hàm xử lý thay đổi cho bằng cấp (qualifications)
    const handleQualificationsChange = (e) => {
        const { value } = e.target;
        const qualificationsArray = value.split(',').map((qualification) => qualification.trim());
        setJobData((prevData) => ({
            ...prevData,
            qualifications: qualificationsArray
        }));
    };

    // Hàm xử lý thay đổi cho quyền lợi (benefits)
    const handleBenefitsChange = (e) => {
        const { value } = e.target;
        const benefitsArray = value.split(',').map((benefit) => benefit.trim());
        setJobData((prevData) => ({
            ...prevData,
            benefits: benefitsArray
        }));
    };

    const calculateRemainingDays = (deadline) => {
        if (!deadline) return 'Không xác định';
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) return `Còn ${diffDays} ngày`;
        if (diffDays === 0) return 'Hết hạn hôm nay';
        return 'Đã hết hạn';
    };

    const handleDeleteJob = async (jobId) => {
        try {
            // Xác nhận trước khi xóa
            if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
                // Gửi yêu cầu DELETE tới API
                await axios.delete(`http://localhost:5000/api/jobs/${jobId}`);

                // Cập nhật lại danh sách công việc sau khi xóa
                setAllJobData(allJobData.filter(job => job._id !== jobId));
                alert('Công việc đã được xóa!');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Có lỗi xảy ra khi xóa công việc!');
        }
    };

    const handleUpdateJob = async (jobId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
            const date = new Date(response.data.application_deadline); // Chuyển đổi chuỗi thành đối tượng Date
            const formattedDate = date.toISOString().split('T')[0]; // Lấy phần ngày (yyyy-mm-dd)
            setJobData(response.data);
            setJobData((prevData) => ({
                ...prevData,
                application_deadline: formattedDate
            }));
            const matchedField = fields.find(f => f.name === response.data.field);
            setSelectedField(matchedField || null);
            setCareers(matchedField?.careers || []);
            setSelectedCareers(response.data.careers || []);
            setIsEditMode(true);
            setJobIdEdit(jobId);
            setIsAddJobOpen(true);
        } catch (error) {
            console.error('Error loading job:', error);
            alert('Có lỗi xảy ra khi cập nhật công việc!');
        }
    };

    // Hàm xử lý khi nhấn nút "Lưu"
    const handleSubmitJob = (e) => {
        if (isEditMode) {
            updateJob(e);
        } else {
            createJob(e);
        }
    };

    const isDeadlineValid = (deadline) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        return deadlineDate > now;
    };

    const isSalaryValid = (salary) => {
        const salaryPattern = /^\d+-\d+$/; // Định dạng: số-số
        return salaryPattern.test(salary.trim());
    };

    // Hàm cập nhật công việc
    const updateJob = async (e) => {
        e.preventDefault(); // Ngừng sự kiện mặc định của form

        if (loading) {
            console.log('Data is still loading...');
            return; // Ngừng gửi yêu cầu nếu dữ liệu vẫn đang được tải
        }

        if (!companyId) {
            console.log('Company ID is not available');
            alert('Chưa có thông tin công ty. Vui lòng thử lại sau.');
            return; // Kiểm tra nếu companyId chưa có
        }

        // Thực hiện kiểm tra hợp lệ nếu cần, ví dụ: kiểm tra trường yêu cầu đã điền đầy đủ hay chưa
        if (!jobData.title || !jobData.skills.length || !jobData.qualifications.length || !jobData.benefits.length) {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }
        if (!isSalaryValid(jobData.salary)) {
            alert("Lương phải tuân theo định dạng: số-số (ví dụ: 1000-2000).");
            return;
        }
        if (!isDeadlineValid(jobData.application_deadline)) {
            alert("Hạn nộp đơn phải là một ngày trong tương lai.");
            return;
        }
        const updatedJobData = { ...jobData, careers: selectedCareers };

        try {
            // Gửi yêu cầu POST đến server để tạo công việc mới
            const response = await axios.put(`http://localhost:5000/api/jobs/${jobIdEdit}`, updatedJobData);

            // Xử lý phản hồi từ server (thành công)
            console.log('Công việc đã được cập nhật thành công:', response.data);
            alert('Công việc đã được cập nhật thành công!');
            // Có thể reset form hoặc điều hướng người dùng về một trang khác
            setJobData({
                employer_id: '',
                company_id: '',
                title: '',
                description: '',
                requirements: '',
                skills: [],
                qualifications: [],
                salary: '',
                job_type: 'full_time',
                vacancy: '',
                location: '',
                interview_location: '',
                note: '',
                application_deadline: '',
                benefits: [],
                test: '',
                field: '',
                careers: []
            });
            setSelectedField(null);
            setSelectedCareers([]);
            setIsAddJobOpen(false);
        } catch (error) {
            console.error('Lỗi khi cập nhật công việc:', error);
            alert('Có lỗi xảy ra khi cập nhật công việc. Vui lòng thử lại!');
        }
    };

    const createJob = async (e) => {
        e.preventDefault(); // Ngừng sự kiện mặc định của form

        if (loading) {
            console.log('Data is still loading...');
            return; // Ngừng gửi yêu cầu nếu dữ liệu vẫn đang được tải
        }

        if (!companyId) {
            console.log('Company ID is not available');
            alert('Chưa có thông tin công ty. Vui lòng thử lại sau.');
            return; // Kiểm tra nếu companyId chưa có
        }

        // Thực hiện kiểm tra hợp lệ nếu cần, ví dụ: kiểm tra trường yêu cầu đã điền đầy đủ hay chưa
        if (!jobData.title || !jobData.skills.length || !jobData.qualifications.length || !jobData.benefits.length) {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }
        if (!isSalaryValid(jobData.salary)) {
            alert("Lương phải tuân theo định dạng: số-số (ví dụ: 1000-2000).");
            return;
        }
        if (!isDeadlineValid(jobData.application_deadline)) {
            alert("Hạn nộp đơn phải là một ngày trong tương lai.");
            return;
        }

        try {
            // Gán companyId vào jobData
            const jobDataToSend = {
                ...jobData,
                company_id: companyId,  // Gán companyId đã có vào jobData
                employer_id: idnd,
                field: selectedField?.name || '',                  // 👈 tên lĩnh vực
                careers: selectedCareers || []

            };
            console.log("Dữ liệu gửi đi:", jobDataToSend);

            // Gửi yêu cầu POST đến server để tạo công việc mới
            const response = await axios.post(
                'http://localhost:5000/api/jobs',
                jobDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // 👈 gửi đúng theo định dạng "Bearer <token>"
                    },
                }
            );

            // Xử lý phản hồi từ server (thành công)
            console.log('Công việc đã được tạo thành công:', response.data);
            alert('Công việc đã được đăng tuyển thành công và đang chờ xử lý!');
            // Có thể reset form hoặc điều hướng người dùng về một trang khác

            setJobData({
                employer_id: '',
                company_id: '',
                title: '',
                description: '',
                requirements: '',
                skills: [],
                qualifications: [],
                salary: '',
                job_type: 'full_time',
                vacancy: '',
                location: '',
                interview_location: '',
                note: '',
                application_deadline: '',
                benefits: [],
                test: null,
                field: '',
                careers: [],
            });
            setSelectedField(null);
            setSelectedCareers([]);
            setIsAddJobOpen(false);
        } catch (error) {
            console.error('Lỗi khi tạo công việc:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi đăng công việc. Vui lòng thử lại!');
        }
    };

    const [activeView, setActiveView] = useState('jobList'); // Trạng thái hiển thị nội dung
    const [selectedJobId, setSelectedJobId] = useState(null); // Lưu jobId của công việc
    const [selectedJob, setSelectedJob] = useState(null); // Lưu jobId của công việc

    const handleViewApplications = (jobId, job) => {
        handleTabClick('applicants'); // Chuyển sang view ứng tuyển
        // Nếu cần, bạn có thể truyền thêm thông tin như jobId để dùng trong Application
        setSelectedJobId(jobId);
        setSelectedJob(job);
    };

    const handleApplicantsTabClick = () => {
        handleTabClick('applicants');
        setSelectedJobId(null);
        setSelectedJob(null);
    };

    const handleViewJob = (jobId) => {
        navigate(`/jobs/jobdetail/${jobId}`);
    }

    const fetchTests = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/tests/user/${idnd}`);

            setTests(response.data); // Lưu dữ liệu bài kiểm tra vào state
        } catch (error) {
            console.error("Error fetching tests:", error);
        } finally {
            setLoading(false);
        }
    };

    // Lấy dữ liệu các bài kiểm tra từ API
    useEffect(() => {
        fetchTests();
    }, []);

    const [query, setQuery] = useState('');

    const filteredTests =
        query === ''
            ? tests
            : tests.filter((test) =>
                test.title.toLowerCase().includes(query.toLowerCase())
            );

    const selectedTest = tests?.find((t) => t._id === jobData.test) || null;

    const handleTestChange = (test) => {
        setJobData((prev) => ({
            ...prev,
            test: test?._id || ''
        }));
    };

    // lĩnh vực 
    const [fields, setFields] = useState([]); // Danh sách lĩnh vực lấy từ DB
    const [selectedField, setSelectedField] = useState(null); // Lĩnh vực được chọn
    const [careers, setCareers] = useState([]); // Danh sách công việc liên quan
    const [selectedCareers, setSelectedCareers] = useState([]); // ⬅️ nhiều công việc

    useEffect(() => {
        // Giả sử bạn có API /api/fields để lấy danh sách lĩnh vực
        axios.get('http://localhost:5000/api/categoryschema')
            .then(res => setFields(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (jobData && fields.length > 0) {
            const matchedField = fields.find(f => {
                const jobFieldName = typeof jobData.field === 'string' ? jobData.field : jobData.field?.name || '';
                return jobFieldName.trim() === f.name.trim();
            });
            // Set selectedField và careers
            setSelectedField(matchedField || null);
            setCareers(matchedField ? matchedField.careers : []);
            setSelectedCareers(jobData.careers || []);
        }
    }, [jobData, fields, careers]);

    const [queryField, setQueryField] = useState('');

    const filteredFields =
        queryField === ''
            ? fields
            : fields.filter((field) =>
                field.name.toLowerCase().includes(queryField.toLowerCase())
            );

    const handleFieldChange = (field) => {
        setSelectedField(field);
        setCareers(field?.careers || []);
        setSelectedCareers([]);
        setJobData({
            ...jobData,
            field: field?.name || '',
            careers: []
        });
    };

    const handleSelectedCareersChange = (newSelectedCareers) => {
        setSelectedCareers(newSelectedCareers);
        setJobData(prevData => ({
            ...prevData,
            careers: newSelectedCareers
        }));
    };

    const [pagination, setPagination] = useState({
        pageSize: 5,
        total: allJobData.length,
        totalPages: Math.ceil(allJobData.length / 5),
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

    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            total: allJobData.length,
            totalPages: Math.ceil(allJobData.length / prev.pageSize),
        }));
    }, [allJobData]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'open':
                return 'bg-green-100 text-green-800';
            case 'closed':
                return 'bg-red-100 text-red-600';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const getJobTypeClass = (type) => {
        switch (type) {
            case 'full_time':
                return 'bg-blue-100 text-blue-800';
            case 'part_time':
                return 'bg-purple-100 text-purple-800';
            case 'internship':
                return 'bg-orange-100 text-orange-700';
            case 'freelance':
                return 'bg-pink-100 text-pink-700';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const filterAndSortJobs = (jobs, statusFilter, typeFilter, sortOption) => {
        let filtered = [...jobs];

        // Lọc theo trạng thái
        if (statusFilter !== 'All') {
            filtered = filtered.filter(job => job.status === statusFilter);
        }

        // Lọc theo loại công việc
        if (typeFilter !== 'All') {
            filtered = filtered.filter(job => job.job_type === typeFilter);
        }

        // Sắp xếp theo thời gian tạo
        if (sortOption === 'newest') {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sortOption === 'oldest') {
            filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        return filtered;
    };

    const filteredJobs = filterAndSortJobs(allJobData, statusFilter, typeFilter, sortOption);
    const paginatedJobs = filteredJobs.slice(
        (pagination.currentPage - 1) * pagination.pageSize,
        pagination.currentPage * pagination.pageSize
    );

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

    const [openSection, setOpenSection] = useState('jobs');

    const toggleSection = (id) => {
        setOpenSection((prev) => (prev === id ? '' : id));
    };

    const sections = [
        {
            id: 'jobs',
            title: 'Jobs List',
            icon: <FolderKanban size={18} />,
        },
        {
            id: 'tests',
            title: 'Tests List',
            icon: <ListChecks size={18} />,
        },
    ];

    const [isAddJobOpen, setIsAddJobOpen] = useState(false);

    const handleCloseAddJob = () => {
        setIsEditMode(false);
        setIsAddJobOpen(false);
        setJobData({
            employer_id: '',
            company_id: '',
            title: '',
            description: '',
            requirements: '',
            skills: [],
            qualifications: [],
            salary: '',
            job_type: 'full_time',
            vacancy: '',
            location: '',
            interview_location: '',
            note: '',
            application_deadline: '',
            benefits: [],
            test: '',
            field: '',
            careers: [],
        });
    };

    const handleOpenAddJob = () => {
        setIsEditMode(false);
        setIsAddJobOpen(true);
    };

    const [isAddTestOpen, setIsAddTestOpen] = useState(false);

    const handleCloseAddTest = () => {
        setIsAddTestOpen(false);
        setIsEditTestMode(false);
        setSelectedTestId(null);
        setTestDetails({ title: "", description: "", duration: "" });
        setQuestions([]);
        setNewQuestion({ question: "", options: ["", ""], correctIndex: null, points: 1 });
    };

    const handleOpenAddTest = () => {
        setIsAddTestOpen(true);
    };

    // State test chung (title, description, duration)
    const [testDetails, setTestDetails] = useState({
        title: "",
        description: "",
        duration: "",
    });

    // Danh sách câu hỏi đã thêm vào test
    const [questions, setQuestions] = useState([]);

    // Câu hỏi mới đang nhập trong form bên trái
    const [newQuestion, setNewQuestion] = useState({
        question: "",
        options: ["", ""],
        correctIndex: null,
        points: 1,
    });

    // Chế độ sửa test và test đang chọn
    const [isEditTestMode, setIsEditTestMode] = useState(false);
    const [selectedTestId, setSelectedTestId] = useState(null);

    // Lấy dữ liệu test khi chọn test để sửa
    useEffect(() => {
        if (selectedTestId) {
            setIsEditTestMode(true);

            const fetchTest = async () => {
                try {
                    const res = await fetch(`http://localhost:5000/api/tests/edit/${selectedTestId}`);
                    const data = await res.json();

                    setTestDetails({
                        title: data.title,
                        description: data.description,
                        duration: data.duration,
                    });
                    setQuestions(data.questions || []);
                    console.log("data", data)
                } catch (err) {
                    console.error("Fetch test failed:", err);
                }
            };

            fetchTest();
            console.log("que", questions)
        }
    }, [selectedTestId]);

    const handleUpdateTest = async (testId) => {
        setSelectedTestId(testId);
        setIsEditTestMode(true);
        setIsAddTestOpen(true);
    }

    // Xử lý thay đổi thông tin test (title, description, duration)
    const handleTestDetailChange = (e) => {
        const { name, value } = e.target;
        setTestDetails((prev) => ({ ...prev, [name]: value }));
    };

    // Xử lý thay đổi form câu hỏi mới
    const handleNewQuestionChange = (field, value) => {
        setNewQuestion((prev) => ({ ...prev, [field]: value }));
    };

    // Xử lý thay đổi text cho từng option câu hỏi mới
    const handleOptionTextChange = (index, value) => {
        setNewQuestion((prev) => {
            if (prev.options[index] === value) return prev;

            const updatedOptions = [...prev.options];
            updatedOptions[index] = value;

            return { ...prev, options: updatedOptions };
        });
    };

    // Chọn đáp án đúng cho câu hỏi mới
    const handleCorrectIndexChange = (index) => {
        setNewQuestion((prev) => ({ ...prev, correctIndex: index }));
    };

    // Thêm câu hỏi mới vào danh sách câu hỏi
    const addNewQuestion = () => {
        const { question, options, correctIndex, points } = newQuestion;

        const newQ = {
            question: question.trim(),
            options: options.map((opt) => opt.trim()),
            correct_answer: options[correctIndex].trim(),
            points: Number(points),
        };

        setQuestions((prev) => [...prev, newQ]);

        // Reset form câu hỏi mới
        setNewQuestion({
            question: "",
            options: ["", ""],
            correctIndex: null,
            points: 1,
        });

        console.log("que", questions)
    };

    // Xóa câu hỏi khỏi danh sách
    const handleRemoveQuestion = (index) => {
        const updated = questions.filter((_, i) => i !== index);
        setQuestions(updated);
    };

    // Xóa test theo testId
    const handleDeleteTestById = async (testId) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này?");
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(`http://localhost:5000/api/tests/${testId}`);
            console.log(response.data);
            // Giả sử bạn có setTests ở ngoài component này hoặc truyền qua props

            alert("Xóa bài kiểm tra thành công!");
            fetchTests();
        } catch (error) {
            console.error("Error deleting test:", error);
            alert("Xóa bài kiểm tra thất bại, vui lòng thử lại.");
        }
    };

    // Gửi dữ liệu tạo hoặc sửa test
    const handleTestSubmit = async (e) => {
        e.preventDefault();

        if (!testDetails.title.trim() || questions.length === 0) {
            alert("Vui lòng nhập tiêu đề và thêm ít nhất 1 câu hỏi.");
            return;
        }

        const payload = {
            ...testDetails,
            questions,
            userId: getId(),
        };

        try {
            const endpoint = isEditTestMode
                ? `http://localhost:5000/api/tests/edit/${selectedTestId}`
                : "http://localhost:5000/api/tests/create-test";

            const method = isEditTestMode ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                alert(isEditTestMode ? "Cập nhật bài kiểm tra thành công!" : "Tạo bài kiểm tra thành công!");
                setIsAddTestOpen(false);
                fetchTests();
                // Reset state sau khi đóng
                setTestDetails({ title: "", description: "", duration: "" });
                setQuestions([]);
                setNewQuestion({ question: "", options: ["", ""], correctIndex: null, points: 1 });
                setIsEditTestMode(false);
                setSelectedTestId(null);
            } else {
                alert("Lỗi: " + data.message);
            }
        } catch (err) {
            console.error("Submit failed:", err);
            alert("Lỗi khi gửi dữ liệu, vui lòng thử lại.");
        }
    };

    ////phân trang test
    const [currentTestPage, setCurrentTestPage] = useState(1);
    const [pageSize] = useState(5); // mỗi trang hiển thị 5 item

    const sortedTests = useMemo(() => {
        const sorted = [...tests].sort((a, b) => {
            if (sortOption === "newest") {
                return new Date(b.created_at) - new Date(a.created_at);
            } else {
                return new Date(a.created_at) - new Date(b.created_at);
            }
        });
        return sorted;
    }, [tests, sortOption]);

    const paginatedTests = useMemo(() => {
        const startIndex = (currentTestPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return sortedTests.slice(startIndex, endIndex);
    }, [sortedTests, currentTestPage, pageSize]);

    const totalTestPages = Math.ceil(sortedTests.length / pageSize);

    const handlePrevTestPage = () => {
        if (currentTestPage > 1) setCurrentTestPage((prev) => prev - 1);
    };

    const handleNextTestPage = () => {
        if (currentTestPage < totalTestPages) setCurrentTestPage((prev) => prev + 1);
    };

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
                        <FaEye /> Danh sách công việc
                    </button>
                    <span className="px-1 pb-3 flex items-center text-center text-sm text-gray-400">|</span>
                    <button
                        className={`text-xs px-1 pb-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'applicants'
                            ? 'text-[#0077b6] border-b-2 border-[#0077b6]'
                            : ''
                            }`}
                        onClick={() => handleApplicantsTabClick()}
                    >
                        <FaUsers /> Danh sách ứng tuyển
                    </button>
                </div>
            </div>
            {/* Nội dung tab "DS công việc đã đăng" */}
            {activeTab === 'listJobs' && (
                <div className="bg-[#f9f9f9] followed-companies">
                    {loadingJobs ? (
                        <p>Đang tải danh sách công việc...</p>
                    ) : errorJobs ? (
                        <p>{errorJobs}</p>
                    ) : (
                        <div className='flex flex-col sm:flex-row'>
                            <div className="w-full sm:w-[15%] bg-white rounded-l-lg border-r border-slate-200 py-6 text-sm">
                                <div className="space-y-2">
                                    {sections.map((section) => (
                                        <div key={section.id}>
                                            <button
                                                onClick={() => toggleSection(section.id)}
                                                className={`w-full flex items-center justify-between  px-4 py-4 rounded hover:bg-gray-100 text-left font-medium ${openSection === section.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                    }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {section.icon}
                                                    {section.title}
                                                </span>
                                                {openSection === section.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            </button>

                                            {/* Sub-actions */}
                                            {openSection === section.id && (
                                                <div className="mt-2 ml-6 flex flex-col gap-4 animate-slide-down">
                                                    <button
                                                        className="py-1 flex items-center gap-2 text-green-700 hover:bg-gray-50 hover:text-green-800 transition-all"
                                                        onClick={() => {
                                                            if (section.id === 'tests') {
                                                                handleOpenAddTest(); // gọi hàm mở form test
                                                            } else if (section.id === 'jobs') {
                                                                handleOpenAddJob(); // ví dụ thêm cho job
                                                            }
                                                        }}
                                                    >
                                                        <FilePlus2 size={16} />
                                                        Add
                                                    </button>

                                                    {/**<button
                                                        className="py-1 flex items-center gap-2 text-blue-700 hover:bg-gray-50 hover:text-blue-800 transition-all"
                                                        onClick={() => {
                                                            if (section.id === 'tests') {

                                                            } else if (section.id === 'jobs') {

                                                            }
                                                        }}
                                                    >
                                                        <FileDown size={16} />
                                                        Import
                                                    </button> */}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-full sm:w-[85%] max-w-[85%] bg-gray-50 pl-2 ">
                                {openSection === 'jobs' && (
                                    <>
                                        {/* Header */}
                                        <div className="p-6 bg-white rounded-tr-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-base font-semibold text-gray-900">Danh sách công việc đã đăng</h2>
                                                    <p className="text-sm text-gray-500">Tổng cộng {filteredJobs.length} công việc</p>
                                                </div>
                                                {/* Bộ lọc trạng thái công việc */}
                                                <div className="flex flex-wrap gap-4 items-center">
                                                    {/* Status Filter Dropdown */}
                                                    <div className="flex flex-row gap-2 items-center">
                                                        <label className="text-sm text-gray-600">Status</label>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-1">
                                                                    <span>Status: {statusOptions.find((o) => o.value === statusFilter)?.label}</span>
                                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="bg-white mt-2 shadow-md rounded-md border w-48">
                                                                {statusOptions.map((option) => (
                                                                    <DropdownMenuItem
                                                                        key={option.value}
                                                                        onClick={() => setStatusFilter(option.value)}
                                                                        className="flex items-center gap-2 text-sm cursor-pointer"
                                                                    >
                                                                        {option.icon && option.icon}
                                                                        <span>{option.label}</span>
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    {/* Job Type Filter Dropdown */}
                                                    <div className="flex flex-row gap-2 items-center">
                                                        <label className="text-sm text-gray-600">Job Type</label>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-1">
                                                                    <span>Job Type: {typeOptions.find((o) => o.value === typeFilter)?.label}</span>
                                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="bg-white mt-2 shadow-md rounded-md border w-52">
                                                                {typeOptions.map((option) => (
                                                                    <DropdownMenuItem
                                                                        key={option.value}
                                                                        onClick={() => setTypeFilter(option.value)}
                                                                        className="flex items-center gap-2 text-sm cursor-pointer"
                                                                    >
                                                                        {option.icon && option.icon}
                                                                        <span>{option.label}</span>
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    {/* Sort Dropdown */}
                                                    <div className="flex flex-row gap-2 items-center">
                                                        <label className="text-sm text-gray-600">Sort</label>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="w-32 inline-flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-1">
                                                                    <ArrowDownNarrowWide className="w-4 h-4 text-gray-500" />
                                                                    <span>
                                                                        {sortOptions.find((o) => o.value === sortOption)?.label || "Sort"}
                                                                    </span>
                                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                                </button>
                                                            </DropdownMenuTrigger>

                                                            <DropdownMenuContent className="bg-white shadow-md rounded-md border w-48">
                                                                {sortOptions.map((option) => (
                                                                    <DropdownMenuItem
                                                                        key={option.value}
                                                                        onClick={() => setSortOption(option.value)}
                                                                        className="flex items-center gap-2 text-sm cursor-pointer"
                                                                    >
                                                                        {option.icon && option.icon}
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
                                            <table className="w-full cursor-default">
                                                <thead className="bg-gray-50 sticky top-0" style={{ zIndex: 2 }}>
                                                    <tr>
                                                        <th className="px-6 py-3 text-center">
                                                            <input type="checkbox" className="rounded border-gray-300" />
                                                        </th>
                                                        <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                                                        <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                                        <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                        <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vacancies</th>
                                                        <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                                                        <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Applicants</th>
                                                        <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {paginatedJobs.map((job, index) => (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <input type="checkbox" className="rounded border-gray-300" />
                                                            </td>
                                                            <td onClick={() => handleViewApplications(job._id, job)} className="px-2 py-4 text-[13px] font-medium text-blue-600 cursor-pointer">
                                                                {job.title}
                                                            </td>
                                                            <td className="px-2 py-4 text-[13px] text-gray-600">{job.interview_location}</td>
                                                            <td className="px-2 py-4 text-[13px] text-center">
                                                                <span className={`inline-flex px-3 py-1 text-[13px] font-medium rounded-full ${getJobTypeClass(job.job_type)}`}>
                                                                    {job.job_type}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-4 text-[13px] text-gray-600 text-center">{job.vacancy}</td>
                                                            <td className="px-2 py-4 text-[13px] text-gray-600">{calculateRemainingDays(job.application_deadline)}</td>
                                                            <td className="px-2 py-4 text-[13px] text-center">
                                                                <span className={`inline-flex px-3 py-1 text-[13px] font-medium rounded-full ${getStatusClass(job.status)}`}>
                                                                    {job.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-4 text-[13px] text-gray-600 text-center">{job.applicationCount || 0}</td>
                                                            <td className="px-2 py-4 text-[13px] text-right relative">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger className="text-gray-400 hover:text-gray-600">
                                                                        <MoreVertical className="h-4 w-4 cursor-pointer" />
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent className="bg-white">
                                                                        <DropdownMenuItem onClick={() => handleDeleteJob(job._id)}>
                                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                                            <span>Delete</span>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleUpdateJob(job._id)}>
                                                                            <PencilLine className="w-4 h-4 text-gray-600" />
                                                                            <span>Update</span>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleViewJob(job._id)}>
                                                                            <Eye className="w-4 h-4 text-blue-600" />
                                                                            <span>View as Guest</span>
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
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
                                        </div>
                                    </>
                                )}
                                {openSection === 'tests' && (
                                    <>
                                        {/* Header */}
                                        <div className="p-6 bg-white rounded-tr-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-base font-semibold text-gray-900">Danh sách bài test</h2>
                                                    <p className="text-sm text-gray-500">Tổng cộng {sortedTests.length} bài test</p>
                                                </div>
                                                {/* Bộ lọc trạng thái công việc */}
                                                <div className="flex flex-wrap gap-4 items-center">
                                                    {/* Sort Dropdown */}
                                                    <div className="flex flex-row gap-2 items-center">
                                                        <label className="text-sm text-gray-600">Sort</label>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="w-32 inline-flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-1">
                                                                    <ArrowDownNarrowWide className="w-4 h-4 text-gray-500" />
                                                                    <span>
                                                                        {sortOptions.find((o) => o.value === sortOption)?.label || "Sort"}
                                                                    </span>
                                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                                </button>
                                                            </DropdownMenuTrigger>

                                                            <DropdownMenuContent className="bg-white shadow-md rounded-md border w-48">
                                                                {sortOptions.map((option) => (
                                                                    <DropdownMenuItem
                                                                        key={option.value}
                                                                        onClick={() => setSortOption(option.value)}
                                                                        className="flex items-center gap-2 text-sm cursor-pointer"
                                                                    >
                                                                        {option.icon && option.icon}
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
                                        <div className="overflow-x-auto min-h-64">
                                            <table className="w-full cursor-default">
                                                <thead className="bg-gray-50 sticky top-0" style={{ zIndex: 2 }}>
                                                    <tr>
                                                        <th className="px-6 py-3 text-center w-20">
                                                            <input type="checkbox" className="rounded border-gray-300" />
                                                        </th>
                                                        <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">No.</th>
                                                        <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                                        <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                        <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                                        <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Create Date</th>
                                                        <th className="px-2 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {paginatedTests.map((test, index) => (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                <input type="checkbox" className="rounded border-gray-300" />
                                                            </td>
                                                            <td className="px-2 py-4 text-[13px] text-gray-600 text-center">{index + 1}</td>
                                                            <td className="px-2 py-4 text-[13px] font-medium text-blue-600">{test.title}</td>
                                                            <td className="px-2 py-4 text-[13px] text-gray-600">{test.description}</td>
                                                            <td className="px-2 py-4 text-[13px] font-medium text-blue-400 text-center">{test.duration}</td>
                                                            <td className="px-2 py-4 text-[13px] text-gray-600 text-center">{new Date(test.created_at).toLocaleDateString()}</td>
                                                            <td className="px-2 py-4 text-[13px] text-center relative">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger className="text-gray-400 hover:text-gray-600">
                                                                        <MoreVertical className="h-4 w-4 cursor-pointer" />
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent className="bg-white">
                                                                        <DropdownMenuItem onClick={() => handleDeleteTestById(test._id)}>
                                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                                            <span>Delete</span>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleUpdateTest(test._id)}>
                                                                            <PencilLine className="w-4 h-4 text-gray-600" />
                                                                            <span>Update</span>
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="bg-white px-3 py-6 flex items-center justify-between rounded-br-lg border-t border-gray-200">
                                            <div className="text-sm text-gray-700">
                                                Hiển thị {paginatedTests.length} trong tổng {sortedTests.length} bài test
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={handlePrevTestPage}
                                                    disabled={currentTestPage === 1}
                                                    className={`px-3 py-2 text-sm ${currentTestPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    ← Trước
                                                </button>

                                                {[...Array(totalTestPages)].map((_, i) => (
                                                    <button
                                                        key={i + 1}
                                                        onClick={() => setCurrentTestPage(i + 1)}
                                                        className={`px-3 py-2 text-sm rounded ${currentTestPage === i + 1
                                                            ? 'bg-[#2a726e] text-white'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}

                                                <button
                                                    onClick={handleNextTestPage}
                                                    disabled={currentTestPage === totalTestPages}
                                                    className={`px-3 py-2 text-sm ${currentTestPage === totalTestPages
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                        }`}
                                                >
                                                    Tiếp →
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Nội dung tab "Nhà tuyển dụng xem ds ứng tuyển" */}
            {activeTab === 'applicants' && (
                <div className="bg-[#f9f9f9] followed-companies">
                    {loadingJobs ? (
                        <p>Đang tải danh sách ứng viên...</p>
                    ) : errorJobs ? (
                        <p>{errorJobs}</p>
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
                                <Application jobId={selectedJobId} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Nội dung tab "Thêm công việc" */}
            {isAddJobOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg w-[800px] max-w-[800px] min-w-[400px] shadow-lg flex flex-col h-[80%] overflow-hidden">
                        <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-0 border-b border-gray-300">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-lg font-semibold">
                                    {isEditMode ? "Update Job" : "Add New Job"}
                                </h2>
                                <button className="text-2xl leading-none cursor-pointer" onClick={handleCloseAddJob}>
                                    &times;
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-5 border-b border-gray-300 text-[#555]">
                            <div className="flex flex-col">
                                <div className="flex flex-col mb-4">
                                    <label htmlFor="title" className="font-bold mb-2">
                                        Tiêu đề công việc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={jobData?.title}
                                        onChange={handleInputJobChange}
                                        className="w-full p-2 border border-[#ccc] rounded text-sm"
                                        placeholder="Nhập tiêu đề công việc"
                                    />
                                </div>
                                <div className="flex flex-col mb-4">
                                    <label htmlFor="description" className="font-bold mb-2">
                                        Mô tả công việc
                                    </label>
                                    <Textarea
                                        name="description"
                                        id="description"
                                        value={jobData?.description}
                                        onChange={handleInputJobChange}
                                        className="w-full h-24 p-2 text-sm text-[#333] border rounded border-[#ddd] resize-y focus:outline-none focus:border-[#007bff] focus:shadow"
                                        placeholder="Nhập mô tả công việc"
                                    ></Textarea>
                                </div>

                                <div className="flex flex-col mb-4">
                                    <label htmlFor="requirements" className="font-bold mb-2">
                                        Yêu cầu công việc
                                    </label>
                                    <textarea
                                        name="requirements"
                                        id="requirements"
                                        value={jobData?.requirements}
                                        onChange={handleInputJobChange}
                                        className="w-full p-2 border border-[#ccc] rounded text-sm"
                                        placeholder="Nhập yêu cầu công việc"
                                    ></textarea>
                                </div>
                                <div className="flex flex-col mb-4">
                                    <label className="flex font-bold mb-2">
                                        Lĩnh vực <span className="text-red-500">*</span>
                                    </label>
                                    <Combobox value={selectedField} onChange={handleFieldChange}>
                                        <div className="relative">
                                            <Combobox.Input
                                                className="w-full p-2 text-sm border border-[#ccc] rounded"
                                                displayValue={(field) => field?.name || ''}
                                                onChange={(e) => setQueryField(e.target.value)}
                                                placeholder="Chọn lĩnh vực..."
                                            />
                                            <Combobox.Button className="absolute inset-y-0 right-2 flex items-center pr-2">
                                                <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                                            </Combobox.Button>
                                            {filteredFields.length > 0 && (
                                                <Combobox.Options className="absolute z-10 mt-1 max-h-36 w-full overflow-auto rounded-xl bg-white border border-gray-200 shadow-lg text-sm">
                                                    {filteredFields.map((field) => (
                                                        <Combobox.Option
                                                            key={field._id}
                                                            value={field}
                                                            className={({ active }) =>
                                                                `cursor-pointer px-4 py-2 ${active ? 'bg-purple-100 text-blue-700' : 'text-gray-800'
                                                                }`
                                                            }
                                                        >
                                                            {({ selected }) => (
                                                                <div className="flex justify-between items-center">
                                                                    {field.name}
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
                                {careers.length > 0 && (
                                    <div className="flex flex-col mb-4">
                                        <label className="flex font-bold mb-2">
                                            Công việc liên quan (chọn nhiều)
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {careers.map((career, index) => {
                                                const careerTitle = career.title || career;
                                                const isSelected = selectedCareers.includes(careerTitle);
                                                const tagClass = `career-tag ${isSelected ? 'selected' : ''}`;
                                                return (
                                                    <div
                                                        key={index}
                                                        className={tagClass}
                                                        onClick={() => {
                                                            const newSelectedCareers = isSelected
                                                                ? selectedCareers.filter(c => c !== careerTitle)
                                                                : [...selectedCareers, careerTitle];
                                                            setSelectedCareers(newSelectedCareers);
                                                            handleSelectedCareersChange(newSelectedCareers);
                                                        }}
                                                    >
                                                        {careerTitle}
                                                        {isSelected && (
                                                            <span
                                                                className="ml-2 text-[#888] font-bold cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedCareers(selectedCareers.filter(c => c !== careerTitle));
                                                                }}
                                                            >
                                                                &times;
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="flex flex-col -mb-1">
                                        <label htmlFor="skills" className="flex font-bold mb-2">
                                            Kỹ năng cần thiết <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="skills"
                                            name="skills"
                                            value={jobData?.skills.join(', ')} // Hiển thị danh sách kỹ năng dưới dạng chuỗi
                                            onChange={(e) => handleSkillsChange(e)}
                                            className="w-full p-2 border border-[#ccc] rounded text-sm"
                                            placeholder="Nhập các kỹ năng cần thiết, cách nhau bằng dấu phẩy"
                                        />
                                    </div>

                                    <div className="flex flex-col -mb-1">
                                        <label htmlFor="qualifications" className="flex font-bold mb-2">
                                            Bằng cấp yêu cầu <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="qualifications"
                                            name="qualifications"
                                            value={jobData?.qualifications.join(', ')} // Hiển thị danh sách bằng cấp dưới dạng chuỗi
                                            onChange={(e) => handleQualificationsChange(e)}
                                            className="w-full p-2 border border-[#ccc] rounded text-sm"
                                            placeholder="Nhập các bằng cấp yêu cầu, cách nhau bằng dấu phẩy"
                                        />
                                    </div>
                                    <div className="flex flex-col -mb-1">
                                        <div className="flex flex-col flex-wrap mb-4">
                                            <label htmlFor="interview_location" className="flex font-bold mb-2">
                                                Vị trí phỏng vấn
                                            </label>
                                            <input
                                                type="text"
                                                id="interview_location"
                                                name="interview_location"
                                                value={jobData?.interview_location}
                                                onChange={handleInputJobChange}
                                                className="w-full p-2 border border-[#ccc] rounded text-sm"
                                                placeholder="Nhập vị trí phỏng vấn"
                                            />
                                        </div>
                                        <div className="flex flex-col flex-wrap mb-4">
                                            <label htmlFor="job_type" className="flex font-bold mb-2">
                                                Loại công việc <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="job_type"
                                                name="job_type"
                                                value={jobData?.job_type}
                                                onChange={handleInputJobChange}
                                                className="w-full px-3 py-2 text-sm text-gray-800 bg-white border border-gray-300 rounded cursor-pointer appearance-none"
                                            >
                                                <option value="full_time">Toàn thời gian</option>
                                                <option value="part_time">Bán thời gian</option>
                                                <option value="internship">Thực tập</option>
                                                <option value="freelance">Freelance</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex flex-col -mb-1">
                                        <div className="flex flex-col flex-wrap mb-4">
                                            <label htmlFor="salary" className="flex font-bold mb-2">
                                                Mức lương
                                            </label>
                                            <input
                                                type="text"
                                                id="salary"
                                                name="salary"
                                                value={jobData?.salary}
                                                onChange={handleInputJobChange}
                                                className="w-full p-2 border border-[#ccc] rounded text-sm"
                                                placeholder="Nhập mức lương"
                                            />
                                        </div>
                                        <div className="flex flex-col flex-wrap mb-4">
                                            <label htmlFor="vacancy" className="flex font-bold mb-2">
                                                Số lượng tuyển dụng
                                            </label>
                                            <input
                                                type="number"
                                                id="vacancy"
                                                name="vacancy"
                                                value={jobData?.vacancy}
                                                onChange={handleInputJobChange}
                                                className="w-full p-2 border border-[#ccc] rounded text-sm"
                                                placeholder="Nhập số lượng tuyển dụng"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col flex-wrap mb-4">
                                    <label htmlFor="location" className="flex font-bold mb-2">
                                        Địa điểm công việc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={jobData?.location}
                                        onChange={handleInputJobChange}
                                        className="w-full p-2 border border-[#ccc] rounded text-sm"
                                        placeholder="Nhập địa điểm công việc"
                                    />
                                </div>
                                <div className="flex flex-col flex-wrap mb-4">
                                    <label htmlFor="benefits" className="flex font-bold mb-2">
                                        Các quyền lợi công việc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="benefits"
                                        name="benefits"
                                        value={jobData?.benefits.join(', ')}
                                        onChange={(e) => handleBenefitsChange(e)}
                                        className="w-full p-2 border border-[#ccc] rounded text-sm"
                                        placeholder="Nhập các quyền lợi công việc, cách nhau bằng dấu phẩy"
                                    />
                                </div>
                                <div className="flex flex-col flex-wrap mb-4">
                                    <label htmlFor="note" className="flex font-bold mb-2">
                                        Ghi chú thêm
                                    </label>
                                    <textarea
                                        name="note"
                                        id="note"
                                        value={jobData?.note}
                                        onChange={handleInputJobChange}
                                        className="company-profile-des-textarea"
                                        placeholder="Nhập ghi chú thêm"
                                    ></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-5">

                                    <div className="flex flex-col flex-wrap mb-4">
                                        <label htmlFor="application_deadline" className="flex font-bold mb-2">
                                            Hạn nộp đơn
                                        </label>
                                        <input
                                            type="date"
                                            id="application_deadline"
                                            name="application_deadline"
                                            value={jobData?.application_deadline}
                                            onChange={handleInputJobChange}
                                            className="w-full p-2 border border-[#ccc] rounded text-sm"
                                        />
                                    </div>

                                    <div className="flex flex-col flex-wrap mb-4">
                                        <label htmlFor="test" className="flex font-bold mb-2">
                                            Chọn bài kiểm tra cho công việc (nếu có) <span className="text-red-500">*</span>
                                        </label>
                                        <Combobox value={selectedTest} onChange={handleTestChange}>
                                            <div className="relative">
                                                <Combobox.Input
                                                    className="w-full p-2 text-sm border border-[#ccc] rounded"
                                                    displayValue={(test) => test?.title || ''}
                                                    onChange={(e) => setQuery(e.target.value)}
                                                    placeholder="Chọn bài kiểm tra..."
                                                />
                                                <Combobox.Button className="absolute inset-y-0 right-2 flex items-center pr-2">
                                                    <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                                                </Combobox.Button>
                                                {filteredTests.length > 0 && (
                                                    <Combobox.Options className="absolute z-10 mt-1 max-h-28 w-full overflow-auto rounded bg-white border border-gray-200 shadow-lg text-sm">
                                                        {filteredTests.map((test) => (
                                                            <Combobox.Option
                                                                key={test._id}
                                                                value={test}
                                                                className={({ active }) =>
                                                                    `cursor-pointer px-4 py-2 ${active ? 'bg-purple-100 text-blue-700' : 'text-gray-800'
                                                                    }`
                                                                }
                                                            >
                                                                {({ selected }) => (
                                                                    <div className="flex justify-between items-center">
                                                                        {test.title}
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
                                </div>


                                <div className="flex flex-col flex-wrap mb-4">
                                    <label htmlFor="status" className="flex font-bold mb-2">
                                        Trạng thái công việc
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={jobData?.status}
                                        onChange={handleInputJobChange}
                                        className="w-full px-3 py-2 text-sm text-gray-800 bg-white border border-gray-300 rounded cursor-pointer appearance-none"
                                    >
                                        <option value="open">Mở</option>
                                        <option value="closed">Đóng</option>
                                        <option value="pending">Chờ xử lý</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-end items-center p-3 pr-[35px]'>

                            <Button className="w-28 bg-[#213A57] text-white px-6 py-2 rounded hover:bg-[#2a486b] transition"
                                type="submit" onClick={(e) => handleSubmitJob(e)}>
                                Lưu
                            </Button>
                        </div>
                    </div>

                </div>
            )}

            {isAddTestOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white w-full h-full max-w-5xl max-h-[90vh] rounded-3xl p-6 shadow-2xl flex gap-6">
                        {/* Cột trái - Thêm test + câu hỏi mới */}
                        <div className="w-1/2 space-y-4 border-r pr-6 overflow-y-auto">
                            <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-0 border-b border-gray-300">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <NotebookPen className="w-6 h-6 text-gray-600" />
                                    {isEditTestMode ? "Chỉnh sửa bài kiểm tra" : "Tạo bài kiểm tra"}
                                </h2>
                            </div>

                            {/* Test Info */}
                            <div className="flex-1 overflow-y-auto border-b border-gray-300 text-[#555] pb-4">
                                <div className="space-y-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                            <Captions className="w-4 h-4" />
                                            Tiêu đề
                                        </label>
                                        <input
                                            name="title"
                                            value={testDetails.title}
                                            onChange={handleTestDetailChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                                            placeholder="Nhập tiêu đề bài kiểm tra"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                            <Rows4 className="w-4 h-4" />
                                            Mô tả
                                        </label>
                                        <input
                                            name="description"
                                            value={testDetails.description}
                                            onChange={handleTestDetailChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                                            placeholder="Nhập mô tả bài kiểm tra"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            Thời lượng (phút)
                                        </label>
                                        <input
                                            name="duration"
                                            type="number"
                                            value={testDetails.duration}
                                            onChange={handleTestDetailChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                                            placeholder="VD: 30"
                                            min={1}
                                        />
                                    </div>
                                </div>

                                {/* Thêm câu hỏi mới */}
                                <div className="pt-3 border-t border-t-gray-300 space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <CopyPlus className="w-4 h-4 text-gray-500" />
                                        Thêm câu hỏi mới
                                    </h3>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                            <CircleHelp className="w-4 h-4" />
                                            Câu hỏi
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                                            value={newQuestion.question}
                                            onChange={(e) => handleNewQuestionChange("question", e.target.value)}
                                            placeholder="Nhập câu hỏi"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                            <List className="w-4 h-4" />
                                            Các lựa chọn (đánh dấu đáp án đúng)
                                        </label>

                                        {newQuestion.options.map((option, i) => (
                                            <div key={i} className="flex items-center gap-2 mt-1">
                                                <input
                                                    type="radio"
                                                    name="correctAnswer"
                                                    className="w-5 h-5"
                                                    checked={newQuestion.correctIndex === i}
                                                    onChange={() => handleCorrectIndexChange(i)}
                                                />
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                                                    value={option}
                                                    onChange={(e) => handleOptionTextChange(i, e.target.value)}
                                                    placeholder={`Lựa chọn ${i + 1}`}
                                                />
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                                            onClick={() =>
                                                setNewQuestion((prev) => ({
                                                    ...prev,
                                                    options: [...prev.options, ""],
                                                }))
                                            }
                                        >
                                            <Plus className="w-4 h-4" /> Thêm lựa chọn
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                            <PenLine className="w-4 h-4" />
                                            Điểm
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                                            value={newQuestion.points}
                                            onChange={(e) => handleNewQuestionChange("points", e.target.value)}
                                            min={1}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='w-full flex justify-end items-center'>
                                <Button
                                    className="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                                    onClick={addNewQuestion}
                                >
                                    + Thêm câu hỏi
                                </Button>
                            </div>
                        </div>

                        {/* Cột phải - Danh sách câu hỏi */}
                        <div className="w-1/2 flex flex-col">
                            <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-0 border-b border-gray-300">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <NotebookPen className="w-6 h-6 text-gray-600" />
                                    Danh sách câu hỏi ({questions.length})
                                </h2>
                            </div>
                            <div className="overflow-y-auto py-4 flex-1 border-b border-gray-300 text-[#555]">
                                {questions.length === 0 && (
                                    <p className="text-gray-500 italic">Chưa có câu hỏi nào được thêm.</p>
                                )}

                                {questions.map((q, index) => (
                                    <div
                                        key={index}
                                        className="mb-4 p-4 bg-white rounded-2xl shadow-lg border border-gray-200 transition hover:shadow-xl"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-semibold text-base text-gray-800">
                                                    {index + 1}. {q.question}
                                                </h4>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveQuestion(index)}
                                                title="Xóa câu hỏi"
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTrash className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <ul className="space-y-2 list-none">
                                            {q.options.map((opt, i) => (
                                                <li
                                                    key={i}
                                                    className={`px-3 py-2 rounded-lg border text-sm ${opt === q.correct_answer
                                                        ? "bg-green-50 border-green-500 text-green-700 font-semibold"
                                                        : "bg-gray-50 border-gray-200 text-gray-700"
                                                        }`}
                                                >
                                                    {String.fromCharCode(65 + i)}. {opt}
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="mt-3 text-sm text-gray-600">Điểm: {q.points}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Nút lưu test */}
                            <div className='flex flex-row gap-2 w-full'>
                                <button
                                    onClick={handleTestSubmit}
                                    className="w-full mt-2 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                                >
                                    {isEditTestMode ? "Lưu thay đổi" : "Tạo bài kiểm tra"}
                                </button>
                                <button
                                    onClick={handleCloseAddTest}
                                    className="w-full mt-2 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}

export default JobRecruitment;
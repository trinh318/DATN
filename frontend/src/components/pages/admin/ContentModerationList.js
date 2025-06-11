import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { FaBuilding, FaEye, FaUsers, FaTimes } from 'react-icons/fa';
import { FaCaretUp, FaCaretDown } from "react-icons/fa"; // Import thêm biểu tượng
import { FaFileLines, FaFilePen, FaFileCircleXmark } from "react-icons/fa6";
import '../../../styles/companyprofile.css';
import '../../../styles/jobrecruiment.css';
import '../../../styles/usermanagement.css';
import { getId } from '../../../libs/isAuth';
import axios from 'axios';

const ContentModerationList = () => {
    // Chuyển đổi tab
    const [activeTab, setActiveTab] = useState('account');
    const handleTabClick = (tab) => setActiveTab(tab);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const handleCloseReport = () => setIsReportOpen(false);
    const handleOpenReport = async (jobId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`http://localhost:5000/api/moderations/${jobId}`);
            setSelectedReport(response.data);
            console.log("database cua job la", response.data);
            setIsReportOpen(true);
        } catch (err) {
            setError(err.response ? err.response.data.message : "Lỗi khi lấy dữ liệu");
        } finally {
            setLoading(false);
        }
    };
    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("http://localhost:5000/api/moderations/reports");
            setReports(response.data);
            console.log("data :", response.data);
        } catch (err) {
            setError(err.response ? err.response.data.message : "Lỗi khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports(); // Gọi hàm khi component mount
    }, []);
    const [isReViewOpen, setIsReViewOpen] = useState(false);
    const [selectedReView, setSelectedReview] = useState(null);
    const handleCloseReView = () => setIsReViewOpen(false);
    const handleOpenReView = async (reviewId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`http://localhost:5000/api/reviewschema/${reviewId}`);
            setSelectedReview(response.data);
            console.log("database cua review la", response.data);
            setIsReViewOpen(true);
        } catch (err) {
            setError(err.response ? err.response.data.message : "Lỗi khi lấy dữ liệu");
        } finally {
            await fetchReports();
            setLoading(false);
        }
    };

    const handleSaveReView = async (reviewId) => {
        setLoading(true); // Bắt đầu loading trước khi gọi API
        try {
            const response = await axios.put(`http://localhost:5000/api/reviewschema/${reviewId}`, {
                status: userStatus,
            });

            alert("Cập nhật trạng thái thành công!");
            setIsReViewOpen(false); // Đóng modal hoặc popup
            await fetchReports();
            // Có thể gọi lại danh sách đánh giá tại đây nếu cần (refetch)
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            alert("Cập nhật thất bại!");
        } finally {
            setLoading(false); // Tắt loading dù thành công hay thất bại
        }
    };
    ////////////Action của table
    // Sample data for users
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Hàm chuyển đổi chuỗi thành không dấu và không có khoảng trắng
    const removeAccentsAndSpaces = (str) => {
        return str
            .normalize("NFD") // Chuyển các ký tự có dấu thành các ký tự không dấu
            .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
            .replace(/\s+/g, '') // Loại bỏ khoảng trắng
            .replace(/,/g, ''); // Loại bỏ dấu phẩy
    };

    const handleSelectRow = (id) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    };

    ///format dd/mm/yyyy
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = new Intl.DateTimeFormat('en-GB').format(date); // 'en-GB' sẽ trả về định dạng dd/mm/yyyy
        return formattedDate;
    };
    //////////end action table

    ///////////load tab tài khoản
    const [account, setAccount] = useState([]); // Lưu trữ dữ liệu người dùng
    const [applicant, setAplicant] = useState([]); // Lưu trữ dữ liệu người dùng
    const [recruiter, setRecruiter] = useState([]); // Lưu trữ dữ liệu người dùng
    const [company, setCompany] = useState([]);
    const [error, setError] = useState(null); // Lưu trữ lỗi (nếu có)
    const [loading, setLoading] = useState(true);
    const [job, setJob] = useState([]); // Lưu trữ dữ liệu công việc 

    const userId = getId();

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const token = localStorage.getItem('token'); // Lấy token từ localStorage

                if (!token) {
                    setError('Token is missing, please login again.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/users/account/all-accounts', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("Response data:", response.data); // Log để kiểm tra cấu trúc dữ liệu

                if (Array.isArray(response.data)) {
                    const updatedData = response.data.map((user) => ({
                        ...user,
                        profile: user.profile
                            ? user.profile
                            : { first_name: "Chưa cập nhật", last_name: "", phone: "N/A", job_title: "N/A" },
                    }));
                    setAccount(updatedData);
                    console.log("updated data:", updatedData); // Log để kiểm tra cấu trúc dữ liệu

                } else {
                    setError('Unexpected data format.');
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to fetch user data.');
                setLoading(false);

            }
        };

        fetchAccount();
    }, []);

    //////////////////////// sort và select all account
    const [sortAccountConfig, setSortAccountConfig] = useState({ key: "_id", direction: "asc" });

    const sortedAccount = [...account].sort((a, b) => {
        // Kiểm tra nếu đang sắp xếp theo tên (first_name) hoặc số điện thoại (phone)
        if (sortAccountConfig.key === "name" || sortAccountConfig.key === "phone") {
            // Kiểm tra nếu first_name hoặc phone có phải là "Chưa cập nhật" không
            const isFirstNameUpdatedA = a.profile?.first_name !== "Chưa cập nhật";
            const isFirstNameUpdatedB = b.profile?.first_name !== "Chưa cập nhật";
            const isPhoneUpdatedA = a.profile?.phone !== "N/A";
            const isPhoneUpdatedB = b.profile?.phone !== "N/A";

            // Sắp xếp theo first_name hoặc phone đã cập nhật hay chưa
            if (sortAccountConfig.key === "name") {
                // So sánh name đã loại bỏ dấu và khoảng trắng
                const nameA = removeAccentsAndSpaces(a.profile?.first_name + a.profile?.last_name || "");
                const nameB = removeAccentsAndSpaces(b.profile?.first_name + b.profile?.last_name || "");

                if (isFirstNameUpdatedA && !isFirstNameUpdatedB) return -1;
                if (!isFirstNameUpdatedA && isFirstNameUpdatedB) return 1;

                if (nameA < nameB) return sortAccountConfig.direction === "asc" ? -1 : 1;
                if (nameA > nameB) return sortAccountConfig.direction === "asc" ? 1 : -1;
                return 0;
            } else if (sortAccountConfig.key === "phone") {
                // So sánh phone
                if (isPhoneUpdatedA && !isPhoneUpdatedB) return -1;
                if (!isPhoneUpdatedA && isPhoneUpdatedB) return 1;

                if (a.profile?.phone < b.profile?.phone) return sortAccountConfig.direction === "asc" ? -1 : 1;
                if (a.profile?.phone > b.profile?.phone) return sortAccountConfig.direction === "asc" ? 1 : -1;
                return 0;
            }

            // Nếu cả hai đều đã hoặc chưa cập nhật, sắp xếp ngẫu nhiên cho các tài khoản chưa cập nhật
            if (!isFirstNameUpdatedA && !isFirstNameUpdatedB) {
                return Math.random() - 0.5; // Sắp xếp ngẫu nhiên cho các tài khoản chưa cập nhật
            }
        }

        // Nếu không phải là sắp xếp theo "name" hoặc "phone", sắp xếp bình thường
        if (a[sortAccountConfig.key] < b[sortAccountConfig.key]) {
            return sortAccountConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortAccountConfig.key] > b[sortAccountConfig.key]) {
            return sortAccountConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
    });

    const handleSortAccount = (column) => {
        let direction = "asc";
        if (sortAccountConfig.key === column && sortAccountConfig.direction === "asc") {
            direction = "desc";
        }
        setSortAccountConfig({ key: column, direction });
    };

    /// select all account
    const handleSelectAllJob = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            setSelectedRows(account.map((job) => job._id));
        } else {
            setSelectedRows([]);
        }
    };

    const getSortAccountIcon = (column) => {
        if (sortAccountConfig.key === column) {
            return sortAccountConfig.direction === "asc" ? (
                <FaCaretUp className="sort-icon" />
            ) : (
                <FaCaretDown className="sort-icon" />
            );
        }
        return null; // Không hiển thị biểu tượng khi không sắp xếp
    };
    ////////////////////////end sort và select all account

    useEffect(() => {
        const fetchApplicant = async () => {
            try {
                const token = localStorage.getItem('token'); // Lấy token từ localStorage

                if (!token) {
                    setError('Token is missing, please login again.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/users/account/all-accounts/applicants', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("Response data:", response.data); // Log để kiểm tra cấu trúc dữ liệu

                if (Array.isArray(response.data)) {
                    const updatedData = response.data.map((user) => ({
                        ...user,
                        profile: user.profile
                            ? user.profile
                            : { first_name: "Chưa cập nhật", last_name: "", phone: "N/A", job_title: "N/A" },
                    }));
                    setAplicant(updatedData);
                    console.log("updated data:", updatedData); // Log để kiểm tra cấu trúc dữ liệu

                } else {
                    setError('Unexpected data format.');
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to fetch user data.');
                setLoading(false);
            }
        };

        fetchApplicant();
    }, []);

    //////////////////////// sort và select all applicant
    const [sortApplicantConfig, setSortApplicantConfig] = useState({ key: "_id", direction: "asc" });

    const sortedApplicant = [...applicant].sort((a, b) => {
        // Kiểm tra nếu đang sắp xếp theo tên (first_name) hoặc số điện thoại (phone)
        if (sortApplicantConfig.key === "name" || sortApplicantConfig.key === "phone" || sortApplicantConfig.key === "jobtitle") {
            // Kiểm tra nếu first_name hoặc phone có phải là "Chưa cập nhật" không
            const isFirstNameUpdatedA = a.profile?.first_name !== "Chưa cập nhật";
            const isFirstNameUpdatedB = b.profile?.first_name !== "Chưa cập nhật";
            const isPhoneUpdatedA = a.profile?.phone !== "N/A";
            const isPhoneUpdatedB = b.profile?.phone !== "N/A";
            const isJobTitleUpdatedA = a.profile?.job_title !== "N/A";
            const isJobTitleUpdatedB = a.profile?.job_title !== "N/A";


            // Sắp xếp theo first_name hoặc phone đã cập nhật hay chưa
            if (sortApplicantConfig.key === "name") {
                // So sánh name đã loại bỏ dấu và khoảng trắng
                const nameA = removeAccentsAndSpaces(a.profile?.first_name + a.profile?.last_name || "");
                const nameB = removeAccentsAndSpaces(b.profile?.first_name + b.profile?.last_name || "");

                if (isFirstNameUpdatedA && !isFirstNameUpdatedB) return -1;
                if (!isFirstNameUpdatedA && isFirstNameUpdatedB) return 1;

                if (nameA < nameB) return sortApplicantConfig.direction === "asc" ? -1 : 1;
                if (nameA > nameB) return sortApplicantConfig.direction === "asc" ? 1 : -1;
                return 0;
            } else if (sortApplicantConfig.key === "phone") {
                // So sánh phone
                if (isPhoneUpdatedA && !isPhoneUpdatedB) return -1;
                if (!isPhoneUpdatedA && isPhoneUpdatedB) return 1;

                if (a.profile?.phone < b.profile?.phone) return sortApplicantConfig.direction === "asc" ? -1 : 1;
                if (a.profile?.phone > b.profile?.phone) return sortApplicantConfig.direction === "asc" ? 1 : -1;
                return 0;
            } else if (sortApplicantConfig.key === "jobtitle") {
                const jobA = a.profile?.job_title || "";
                const jobB = b.profile?.job_title || "";

                // Kiểm tra nếu jobtitle là "N/A" và sắp xếp "N/A" xuống dưới cùng
                const isJobTitleUpdatedA = jobA !== "N/A";
                const isJobTitleUpdatedB = jobB !== "N/A";

                // Nếu một trong hai jobtitle là "N/A", đưa "N/A" xuống dưới cùng
                if (isJobTitleUpdatedA && !isJobTitleUpdatedB) return -1;
                if (!isJobTitleUpdatedA && isJobTitleUpdatedB) return 1;

                // So sánh các giá trị job title đã loại bỏ dấu và khoảng trắng
                const jobTitleA = removeAccentsAndSpaces(jobA);
                const jobTitleB = removeAccentsAndSpaces(jobB);

                if (jobTitleA < jobTitleB) return sortApplicantConfig.direction === "asc" ? -1 : 1;
                if (jobTitleA > jobTitleB) return sortApplicantConfig.direction === "asc" ? 1 : -1;
                return 0;
            }

            // Nếu cả hai đều đã hoặc chưa cập nhật, sắp xếp ngẫu nhiên cho các tài khoản chưa cập nhật
            if (!isFirstNameUpdatedA && !isFirstNameUpdatedB) {
                return Math.random() - 0.5; // Sắp xếp ngẫu nhiên cho các tài khoản chưa cập nhật
            } else if (!isJobTitleUpdatedA && !isJobTitleUpdatedB) {
                return Math.random() - 0.5; // Sắp xếp ngẫu nhiên cho các tài khoản chưa cập nhật
            }
        }

        // Nếu không phải là sắp xếp theo "name" hoặc "phone", sắp xếp bình thường
        if (a[sortApplicantConfig.key] < b[sortApplicantConfig.key]) {
            return sortApplicantConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortApplicantConfig.key] > b[sortApplicantConfig.key]) {
            return sortApplicantConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
    });

    const handleSortApplicant = (column) => {
        let direction = "asc";
        if (sortApplicantConfig.key === column && sortApplicantConfig.direction === "asc") {
            direction = "desc";
        }
        setSortApplicantConfig({ key: column, direction });
    };

    /// select all account
    const handleSelectAllApplicant = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            setSelectedRows(applicant.map((user) => user._id));
        } else {
            setSelectedRows([]);
        }
    };

    const getSortApplicantIcon = (column) => {
        if (sortApplicantConfig.key === column) {
            return sortApplicantConfig.direction === "asc" ? (
                <FaCaretUp className="sort-icon" />
            ) : (
                <FaCaretDown className="sort-icon" />
            );
        }
        return null; // Không hiển thị biểu tượng khi không sắp xếp
    };
    ////////////////////////end sort và select all applicant

    useEffect(() => {
        const fetchRecruiter = async () => {
            try {
                const token = localStorage.getItem('token'); // Lấy token từ localStorage

                if (!token) {
                    setError('Token is missing, please login again.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/users/account/all-accounts/recruiters', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("Response data:", response.data); // Log để kiểm tra cấu trúc dữ liệu

                if (Array.isArray(response.data)) {
                    const updatedData = response.data.map((user) => ({
                        ...user,
                        profile: user.profile
                            ? user.profile
                            : { first_name: "Chưa cập nhật", last_name: "", phone: "N/A", job_title: "N/A" },
                    }));
                    setRecruiter(updatedData);
                    console.log("updated data:", updatedData); // Log để kiểm tra cấu trúc dữ liệu

                } else {
                    setError('Unexpected data format.');
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to fetch user data.');
                setLoading(false);
            }
        };

        fetchRecruiter();
    }, []);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const token = localStorage.getItem('token'); // Lấy token từ localStorage

                if (!token) {
                    setError('Token is missing, please login again.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/jobs/all', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },

                });

                console.log("Response data:", response.data); // Log để kiểm tra cấu trúc dữ liệu

                if (Array.isArray(response.data)) {
                    const updatedData = response.data.map((job) => ({
                        ...job
                    })).reverse();
                    setJob(updatedData);
                    console.log("updated job data:", updatedData); // Log để kiểm tra cấu trúc dữ liệu

                } else {
                    setError('Unexpected data format.');
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to fetch user data.');
                setLoading(false);
            }
        };

        fetchJob();
    }, []);
    // danh sách người dùng báo cáo 
    const [reports, setReports] = useState([]);
   
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        // Gọi API để lấy tất cả đánh giá
        const fetchReviews = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/reviewschema");
                setReviews(res.data); // Cập nhật state
            } catch (error) {
                console.error("Lỗi khi lấy đánh giá:", error);
            }
        };

        fetchReviews(); // gọi hàm ngay khi component mount
    }, []);
    //////////////////////// sort và select all recruiter
    const [sortRecruiterConfig, setSortRecruiterConfig] = useState({ key: "_id", direction: "asc" });
    const [sortReviewConfig, setSortReviewConfig] = useState({ key: "createdAt", direction: "desc" });
    const sortedRecruiter = [...recruiter].sort((a, b) => {
        // Kiểm tra nếu đang sắp xếp theo tên (first_name) hoặc số điện thoại (phone)
        if (sortRecruiterConfig.key === "name" || sortRecruiterConfig.key === "phone" || sortRecruiterConfig.key === "jobtitle") {
            // Kiểm tra nếu first_name hoặc phone có phải là "Chưa cập nhật" không
            const isFirstNameUpdatedA = a.profile?.first_name !== "Chưa cập nhật";
            const isFirstNameUpdatedB = b.profile?.first_name !== "Chưa cập nhật";
            const isPhoneUpdatedA = a.profile?.phone !== "N/A";
            const isPhoneUpdatedB = b.profile?.phone !== "N/A";

            // Sắp xếp theo first_name hoặc phone đã cập nhật hay chưa
            if (sortRecruiterConfig.key === "name") {
                const nameA = removeAccentsAndSpaces(a.profile?.first_name + a.profile?.last_name || "");
                const nameB = removeAccentsAndSpaces(b.profile?.first_name + b.profile?.last_name || "");

                if (isFirstNameUpdatedA && !isFirstNameUpdatedB) return -1;
                if (!isFirstNameUpdatedA && isFirstNameUpdatedB) return 1;

                if (nameA < nameB) return sortRecruiterConfig.direction === "asc" ? -1 : 1;
                if (nameA > nameB) return sortRecruiterConfig.direction === "asc" ? 1 : -1;
                return 0;
            } else if (sortRecruiterConfig.key === "phone") {
                if (isPhoneUpdatedA && !isPhoneUpdatedB) return -1;
                if (!isPhoneUpdatedA && isPhoneUpdatedB) return 1;

                if (a.profile?.phone < b.profile?.phone) return sortRecruiterConfig.direction === "asc" ? -1 : 1;
                if (a.profile?.phone > b.profile?.phone) return sortRecruiterConfig.direction === "asc" ? 1 : -1;
                return 0;
            }

            if (!isFirstNameUpdatedA && !isFirstNameUpdatedB) {
                return Math.random() - 0.5;
            }
        }

        if (a[sortRecruiterConfig.key] < b[sortRecruiterConfig.key]) {
            return sortRecruiterConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortRecruiterConfig.key] > b[sortRecruiterConfig.key]) {
            return sortRecruiterConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
    });
    const sortedReviews = [...reviews].sort((a, b) => {
        const key = sortReviewConfig.key;
        const direction = sortReviewConfig.direction;

        let valueA = a[key];
        let valueB = b[key];

        // Nếu là string thì chuẩn hóa chữ thường để so sánh
        if (typeof valueA === "string" && typeof valueB === "string") {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) return direction === "asc" ? -1 : 1;
        if (valueA > valueB) return direction === "asc" ? 1 : -1;
        return 0;
    });


    const handleSortRecruiter = (column) => {
        let direction = "asc";
        if (sortRecruiterConfig.key === column && sortRecruiterConfig.direction === "asc") {
            direction = "desc";
        }
        setSortRecruiterConfig({ key: column, direction });
    };

    /// select all recruiter
    const handleSelectAllRecruiter = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            setSelectedRows(recruiter.map((user) => user._id));
        } else {
            setSelectedRows([]);
        }
    };

    const getSortRecruiterIcon = (column) => {
        if (sortRecruiterConfig.key === column) {
            return sortRecruiterConfig.direction === "asc" ? (
                <FaCaretUp className="sort-icon" />
            ) : (
                <FaCaretDown className="sort-icon" />
            );
        }
        return null;
    };
    ///////////////////////end sort và select all recruiter

    useEffect(() => {
        // Lấy tất cả các công ty
        const fetchAllCompanies = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/companies');
                setCompany(response.data);
            } catch (error) {
                console.error('Error fetching all companies:', error);
                setError('Không thể tải danh sách công ty.');
            }
        };
        fetchAllCompanies();
    }, []);

    //////////////////////// sort và select all recruiter
    const [sortCompanyConfig, setSortCompanyConfig] = useState({ key: "_id", direction: "asc" });

    const sortedCompany = [...company].sort((a, b) => {
        // Kiểm tra nếu đang sắp xếp theo tên (first_name) hoặc số điện thoại (phone)
        if (sortCompanyConfig.key === "name" || sortCompanyConfig.key === "industry" || sortCompanyConfig.key === "location") {
            // Kiểm tra nếu first_name hoặc phone có phải là "Chưa cập nhật" không
            const isFirstNameUpdatedA = a?.company_name !== "Chưa cập nhật";
            const isFirstNameUpdatedB = b?.company_name !== "Chưa cập nhật";
            const isIndustryUpdatedA = a?.industry !== "N/A";
            const isIndustryUpdatedB = b?.industry !== "N/A";
            const isLocationUpdatedA = a?.location !== "N/A";
            const isLocationUpdatedB = b?.location !== "N/A";

            // Sắp xếp theo first_name hoặc phone đã cập nhật hay chưa
            if (sortCompanyConfig.key === "name") {
                const nameA = removeAccentsAndSpaces(a?.company_name || "");
                const nameB = removeAccentsAndSpaces(b?.company_name || "");

                if (isFirstNameUpdatedA && !isFirstNameUpdatedB) return -1;
                if (!isFirstNameUpdatedA && isFirstNameUpdatedB) return 1;

                if (nameA < nameB) return sortCompanyConfig.direction === "asc" ? -1 : 1;
                if (nameA > nameB) return sortCompanyConfig.direction === "asc" ? 1 : -1;
                return 0;
            } else if (sortCompanyConfig.key === "industry") {
                const industryA = removeAccentsAndSpaces(a?.industry || "");
                const industryB = removeAccentsAndSpaces(b?.industry || "");

                if (isIndustryUpdatedA && !isIndustryUpdatedB) return -1;
                if (!isIndustryUpdatedA && isIndustryUpdatedB) return 1;

                if (industryA < industryB) return sortCompanyConfig.direction === "asc" ? -1 : 1;
                if (industryA > industryB) return sortCompanyConfig.direction === "asc" ? 1 : -1;
                return 0;
            } else if (sortCompanyConfig.key === "location") {
                const locationA = removeAccentsAndSpaces(a?.location || "");
                const locationB = removeAccentsAndSpaces(b?.location || "");

                if (isLocationUpdatedA && !isLocationUpdatedB) return -1;
                if (!isLocationUpdatedA && isLocationUpdatedB) return 1;

                if (locationA < locationB) return sortCompanyConfig.direction === "asc" ? -1 : 1;
                if (locationA > locationB) return sortCompanyConfig.direction === "asc" ? 1 : -1;
                return 0;
            }

            if (!isFirstNameUpdatedA && !isFirstNameUpdatedB) {
                return Math.random() - 0.5;
            } else if (!isIndustryUpdatedA && !isIndustryUpdatedB) {
                return Math.random() - 0.5;
            } else if (!isLocationUpdatedA && !isLocationUpdatedB) {
                return Math.random() - 0.5;
            }
        }

        if (a[sortCompanyConfig.key] < b[sortCompanyConfig.key]) {
            return sortCompanyConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortCompanyConfig.key] > b[sortCompanyConfig.key]) {
            return sortCompanyConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
    });

    const handleSortCompany = (column) => {
        let direction = "asc";
        if (sortCompanyConfig.key === column && sortCompanyConfig.direction === "asc") {
            direction = "desc";
        }
        setSortCompanyConfig({ key: column, direction });
    };

    /// select all recruiter
    const handleSelectAllCompany = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            setSelectedRows(company.map((user) => user._id));
        } else {
            setSelectedRows([]);
        }
    };

    const getSortCompanyIcon = (column) => {
        if (sortCompanyConfig.key === column) {
            return sortCompanyConfig.direction === "asc" ? (
                <FaCaretUp className="sort-icon" />
            ) : (
                <FaCaretDown className="sort-icon" />
            );
        }
        return null;
    };
    ///////////////////////end sort và select all recruiter

    ////////////////chi tiết account
    // Trạng thái mở/đóng form
    const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);

    // Hàm mở form
    const handleAccountClick = (account) => {
        setSelectedAccount(account); // Lưu trữ dữ liệu account vào state
        setIsEditAccountOpen(true); // Mở form edit
    };

    // Hàm đóng form và reset trạng thái
    const handleCloseAccountEdit = () => {
        setIsEditAccountOpen(false);
    };

    const [selectedAccount, setSelectedAccount] = useState(null);

    //////////////////end chi tiết account
    // chỉnh sửa 
    const [userStatus, setUserStatus] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [tempRejectionReason, setTempRejectionReason] = useState("");
    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setUserStatus(newStatus);

        if (newStatus === "rejected") {
            setRejectionReason(tempRejectionReason); // Khi quay lại "rejected", khôi phục lý do
        } else {
            setTempRejectionReason(rejectionReason); // Lưu tạm lý do trước khi xóa
            setRejectionReason(""); // Xóa lý do khi chọn trạng thái khác "rejected"
        }

    };
    useEffect(() => {
        if (selectedAccount?.moderation?.status) {
            setUserStatus(selectedAccount.moderation.status);
        }
        if (selectedAccount?.moderation?.reason) {
            setRejectionReason(selectedAccount.moderation.reason);
            setTempRejectionReason(selectedAccount.moderation.reason); // Lưu vào biến tạm
        }
    }, [selectedAccount]);

    const handleSave = async (jobId) => {
        const userId = getId();

        if (userStatus === "rejected" && !rejectionReason.trim()) {
            alert("Vui lòng nhập lý do từ chối!");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/moderations/${jobId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: userStatus, reason: rejectionReason, admin_id: userId }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Cập nhật trạng thái thành công');
                setLoading(true);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Lỗi cập nhật trạng thái:', error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    return (
        <div className='company-profile'>
            <div className="company-profile-container">
                {/* Thanh điều hướng tab */}
                <div className="company-profile-tabs">
                    <button
                        className={`company-profile-tab ${activeTab === 'account' ? 'active' : ''}`}
                        onClick={() => handleTabClick('account')}
                    >
                        <FaEye /> Tin đăng tuyển
                    </button>

                    <button
                        className={`company-profile-tab ${activeTab === 'recruiter' ? 'active' : ''}`}
                        onClick={() => handleTabClick('recruiter')}
                    >
                        <FaUsers /> Đánh giá & bình luận
                    </button>
                    <button
                        className={`company-profile-tab ${activeTab === 'company' ? 'active' : ''}`}
                        onClick={() => handleTabClick('company')}
                    >
                        <FaUsers /> Báo cáo vi phạm
                    </button>
                </div>

                {/* Nội dung tab "Nhà tuyển dụng xem hồ sơ" */}
                {activeTab === 'account' && (
                    <div className="company-profile-content followed-companies">
                        <div className="user-management-table-container">
                            <table className="user-management-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAllJob}
                                                className="user-management-select-all"
                                            />
                                        </th>
                                        <th onClick={() => handleSortAccount("_id")}>
                                            ID {getSortAccountIcon("_id")}
                                        </th>
                                        <th onClick={() => handleSortAccount("name")}>
                                            Title {getSortAccountIcon("name")}
                                        </th>
                                        <th onClick={() => handleSortAccount("email")}>
                                            Salary {getSortAccountIcon("email")}
                                        </th>
                                        <th onClick={() => handleSortAccount("phone")}>
                                            Job Type {getSortAccountIcon("phone")}
                                        </th>
                                        <th onClick={() => handleSortAccount("role")}>
                                            Location {getSortAccountIcon("role")}
                                        </th>
                                        <th onClick={() => handleSortAccount("created_at")}>
                                            Deadline Time {getSortAccountIcon("created_at")}
                                        </th>
                                        <th onClick={() => handleSortAccount("created_at")}>
                                            Status {getSortAccountIcon("created_at")}
                                        </th>
                                        <th>Options</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {job.map((job) => (
                                        <tr key={job._id} className={`user-management-row 
                                            ${job?.moderation?.status === "pending" ? "user-management-row-red" : ""} 
                                            ${job?.moderation?.status === "reported" ? "user-management-row-orange" : ""}`}>                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(job._id)}
                                                    onChange={() => handleSelectRow(job._id)}
                                                    className="user-management-row-checkbox"
                                                />
                                            </td>
                                            <td>{job?._id}</td>
                                            <td>{job?.title}</td>
                                            <td>{job?.salary}</td>
                                            <td>{job?.job_type}</td>
                                            <td>{job?.location}</td>
                                            <td>{formatDate(job?.application_deadline)}</td>
                                            <td>{job?.moderation?.status}</td>
                                            <td>
                                                <div className="user-management-dropdown">
                                                    <FaFileLines onClick={() => handleAccountClick(job)} />
                                                    <FaFilePen onClick={() => handleAccountClick(job)} />
                                                    <FaFileCircleXmark />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Nội dung tab "Thêm công việc" */}
                {activeTab === 'applicant' && (
                    <div className="company-profile-content profile-view">
                        <div className="user-management-table-container">
                            <table className="user-management-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAllApplicant}
                                                className="user-management-select-all"
                                            />
                                        </th>
                                        <th onClick={() => handleSortApplicant("_id")}>
                                            ID {getSortApplicantIcon("_id")}
                                        </th>
                                        <th onClick={() => handleSortApplicant("name")}>
                                            Name {getSortApplicantIcon("name")}
                                        </th>
                                        <th onClick={() => handleSortApplicant("email")}>
                                            Email {getSortApplicantIcon("email")}
                                        </th>
                                        <th onClick={() => handleSortApplicant("phone")}>
                                            Phone {getSortApplicantIcon("phone")}
                                        </th>
                                        <th onClick={() => handleSortApplicant("role")}>
                                            Location {getSortApplicantIcon("role")}
                                        </th>
                                        <th onClick={() => handleSortApplicant("jobtitle")}>
                                            Job Title {getSortApplicantIcon("jobtitle")}
                                        </th>
                                        <th>Options</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedApplicant.map((user) => (
                                        <tr key={user._id} className="user-management-row">
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(user._id)}
                                                    onChange={() => handleSelectRow(user._id)}
                                                    className="user-management-row-checkbox"
                                                />
                                            </td>
                                            <td>{user._id}</td>
                                            <td>{user.profile?.first_name} {user.profile?.last_name}</td>
                                            <td>{user.profile?.email}</td>
                                            <td>{user.profile?.phone}</td>
                                            <td>{user.profile?.location}</td>
                                            <td>{user.profile?.job_title}</td>
                                            <td>
                                                <div className="user-management-dropdown">
                                                    <Link to={`/admin/applicant-profile/${user._id}`}>
                                                        <FaFileLines />
                                                    </Link>
                                                    <FaFilePen />
                                                    <FaFileCircleXmark />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {/* Nội dung tab "Đánh giá và báo cáo" */}
                {activeTab === 'recruiter' && (
                    <div className="company-profile-content profile-view">
                        <div className="user-management-table-container">
                            <table className="user-management-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAllRecruiter}
                                                className="user-management-select-all"
                                            />
                                        </th>
                                        <th onClick={() => handleSortRecruiter("_id")}>
                                            ID {getSortRecruiterIcon("_id")}
                                        </th>
                                        <th onClick={() => handleSortRecruiter("name")}>
                                            Summary {getSortRecruiterIcon("name")}
                                        </th>
                                        <th onClick={() => handleSortRecruiter("email")}>
                                            Rating {getSortRecruiterIcon("email")}
                                        </th>
                                        <th onClick={() => handleSortRecruiter("phone")}>
                                            Review {getSortRecruiterIcon("phone")}
                                        </th>
                                        <th onClick={() => handleSortRecruiter("phone")}>
                                            Status {getSortRecruiterIcon("phone")}
                                        </th>
                                        <th>Options</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedReviews.map((review) => (
                                        <tr key={review._id} className="user-management-row">
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(review._id)}
                                                    onChange={() => handleSelectRow(review._id)}
                                                    className="user-management-row-checkbox"
                                                />
                                            </td>
                                            <td>{review._id}</td>
                                            <td><div className="ellipsis-cell" title={review.comment}>{review.comment}</div></td>
                                            <td>
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} style={{ color: i < review.rating ? "#ffc107" : "#e4e5e9" }}>
                                                        ★
                                                    </span>
                                                ))}
                                            </td>
                                            <td><div className="ellipsis-cell" title={review.what_i_love}>{review.what_i_love}</div></td>
                                            <td>{review.status}</td>
                                            <td>
                                                <div className="user-management-dropdown">
                                                    <Link to={`/companies/companydetail/${review.company_id}`}>
                                                        <FaFileLines />
                                                    </Link>
                                                    <FaFilePen
                                                        title="Xem chi tiết đánh giá"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => handleOpenReView(review._id)}
                                                    />
                                                    <FaFileCircleXmark />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'company' && (
                    <div className="company-profile-content profile-view">
                        <div className="user-management-table-container">
                            <table className="user-management-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAllCompany}
                                                className="user-management-select-all"
                                            />
                                        </th>
                                        <th onClick={() => handleSortCompany("_id")}>
                                            Công ty {getSortCompanyIcon("_id")}
                                        </th>
                                        <th onClick={() => handleSortCompany("name")}>
                                            Đối tượng bị báo cáo {getSortCompanyIcon("name")}
                                        </th>
                                        <th onClick={() => handleSortCompany("industry")}>
                                            Loại vi phạm {getSortCompanyIcon("industry")}
                                        </th>
                                        <th onClick={() => handleSortCompany("website")}>
                                            Trạng thái {getSortCompanyIcon("website")}
                                        </th>
                                        <th onClick={() => handleSortCompany("location")}>
                                            Số lượng báo cáo {getSortCompanyIcon("location")}
                                        </th>
                                        <th>Options</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report) => (
                                        <tr key={report._id} className="user-management-row">
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(report._id)}
                                                    onChange={() => handleSelectRow(report._id)}
                                                    className="user-management-row-checkbox"
                                                />
                                            </td>
                                            <td>{report.company_name}</td>
                                            <td>
                                                {report?.job_title || "Chưa xác định"}
                                                {report?.company_name ? ` (${report.company_name})` : ""}
                                            </td>
                                            <td>
                                                {report?.reports?.length > 0 ? (
                                                    <ul>
                                                        {report.reports.map((r, index) => (
                                                            <li key={index}>- {r.reason}</li>
                                                        ))}
                                                    </ul>
                                                ) : "N/A"}
                                            </td>
                                            <td>
                                                <span className={`status-label ${report.status === "reported" ? "reported" : ""}`}>
                                                    {report?.status || "Chưa cập nhật"}
                                                </span>
                                            </td>
                                            <td>{report?.total_reports ?? 0}</td>
                                            <td>
                                                <div className="user-management-dropdown">
                                                        <FaFileLines
                                                            title="Xem chi tiết báo cáo"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => handleOpenReport(report.job_id)}
                                                        />
                                                    <FaFilePen title="Chỉnh sửa báo cáo" />
                                                    <FaFileCircleXmark title="Xóa báo cáo" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    </div>
                )}

                {isEditAccountOpen && (
                    <>
                        <div className="user-info-edit-overlay">
                            <div className="user-info-edit-container">
                                {/* Header */}
                                <div className="user-info-edit-header-form">
                                    <div className="user-info-edit-header">
                                        <h2>Tin Tuyển Dụng </h2>
                                        <button className="user-info-edit-close-btn" onClick={handleCloseAccountEdit}>
                                            &times;
                                        </button>
                                    </div>
                                </div>
                                {/* Nội dung Form */}
                                <form className="user-info-edit-form">
                                    <div className="user-info-edit-row">
                                        <label htmlFor="id" className="user-info-edit-label">
                                            ID Tin
                                        </label>
                                        <input
                                            type="text"
                                            id="id"
                                            name="id"
                                            className="user-info-edit-input"
                                            value={selectedAccount?._id || ""}
                                            readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                        />
                                    </div>
                                    <div className="user-info-edit-col">
                                        <div className="user-info-edit-row">
                                            <label htmlFor="full_name" className="user-info-edit-label">
                                                Tiêu đề công việc
                                            </label>
                                            <input
                                                type="text"
                                                id="full_name"
                                                name="full_name"
                                                className="user-info-edit-input"
                                                value={`${selectedAccount?.title || ""}`}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa    
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="full_name" className="user-info-edit-label">
                                                Mô tả công việc
                                            </label>
                                            <input
                                                type="text"
                                                id="email"
                                                name="email"
                                                className="user-info-edit-input"
                                                value={`${selectedAccount?.description || ""}`}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    <div className="user-info-edit-col">
                                        <div className="user-info-edit-row">
                                            <label htmlFor="full_name" className="user-info-edit-label">
                                                Yêu cầu công việc
                                            </label>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                className="user-info-edit-input"
                                                value={`${selectedAccount?.requirements || ""}`}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="full_name" className="user-info-edit-label">
                                                Kỹ năng cần thiết
                                            </label>
                                            <input
                                                type=""
                                                id=""
                                                name=""
                                                className="user-info-edit-input"
                                                value={`${selectedAccount?.skills || ""}`}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    <div className="user-info-edit-col">
                                        <div className="user-info-edit-row">
                                            <label htmlFor="role" className="user-info-edit-label">
                                                Bằng cấp yêu cầu
                                            </label>
                                            <input
                                                type="text"
                                                id="role"
                                                name="role"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.qualifications || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="created_at" className="user-info-edit-label">
                                                Mức lương
                                            </label>
                                            <input
                                                type="text"
                                                id="created_at"
                                                name="created_at"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.salary || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="created_at" className="user-info-edit-label">
                                                Vị trí phỏng vấn
                                            </label>
                                            <input
                                                type="text"
                                                id="created_at"
                                                name="created_at"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.interview_location || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="created_at" className="user-info-edit-label">
                                                Địa điểm công việc
                                            </label>
                                            <input
                                                type="text"
                                                id="created_at"
                                                name="created_at"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.location || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="created_at" className="user-info-edit-label">
                                                Ghi chú thêm
                                            </label>
                                            <input
                                                type="text"
                                                id="created_at"
                                                name="created_at"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.note || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="created_at" className="user-info-edit-label">
                                                Hạn nộp đơn
                                            </label>
                                            <input
                                                type="text"
                                                id="created_at"
                                                name="created_at"
                                                className="user-info-edit-input"
                                                value={formatDate(selectedAccount?.application_deadline) || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="created_at" className="user-info-edit-label">
                                                Các quyền lợi công việc
                                            </label>
                                            <input
                                                type="text"
                                                id="created_at"
                                                name="created_at"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.benefits || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>

                                        <div className="user-info-edit-row">
                                            <label htmlFor="created_at" className="user-info-edit-label">
                                                Trạng thái công việc
                                            </label>
                                            <input
                                                type="text"
                                                id="created_at"
                                                name="created_at"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.status || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    {/* Các radio button */}
                                    <div className="user-info-edit-radio-group">
                                        <div className="user-info-edit-radio-row">
                                            <input type="radio" id="option4" name="user_status" value="pending"
                                                checked={userStatus === "pending"}
                                                onChange={handleStatusChange} />
                                            <label htmlFor="option4">Pending</label>
                                        </div>
                                        <div className="user-info-edit-radio-row">
                                            <input type="radio" id="option1" name="user_status" value="approved"
                                                checked={userStatus === "approved"}
                                                onChange={handleStatusChange} />
                                            <label htmlFor="option1">Approved</label>
                                        </div>
                                        <div className="user-info-edit-radio-row">
                                            <input
                                                type="radio"
                                                id="option2"
                                                name="user_status"
                                                value="rejected"
                                                checked={userStatus === "rejected"}
                                                onChange={handleStatusChange}
                                            />
                                            <label htmlFor="option2">Rejected</label>
                                        </div>


                                        <div className="user-info-edit-radio-row">
                                            <input type="radio" id="option3" name="user_status" value="reported"
                                                checked={userStatus === "reported"}
                                                onChange={handleStatusChange} />
                                            <label htmlFor="option3">Reported</label>
                                        </div>
                                    </div>
                                    {/* Hiển thị textarea khi chọn Rejected */}
                                    {userStatus === "rejected" && (
                                        <div className="view-report-job-detail-rejection-reason">
                                            <label htmlFor="view-report-job-detail-reason">Lý do từ chối:</label>
                                            <textarea
                                                id="view-report-job-detail-reason"
                                                placeholder="Nhập lý do từ chối..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </form>
                                {/* Footer (Save/Cancel) */}
                                <div className="user-info-edit-button-row">
                                    <button onClick={() => handleSave(selectedAccount._id)} className="user-info-edit-save-btn bg-[#5a8cb5]" type="submit">
                                        Lưu
                                    </button>
                                    <button className="user-info-edit-cancel-btn bg-gray-100" type="button" onClick={handleCloseAccountEdit}>
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {isReViewOpen && (
                    <>
                        <div className="user-info-edit-overlay">
                            <div className="user-info-edit-container">
                                {/* Header */}
                                <div className="user-info-edit-header-form">
                                    <div className="user-info-edit-header">
                                        <h2>Đánh giá & Bình luận</h2>
                                        <button className="user-info-edit-close-btn" onClick={handleCloseReView}>
                                            &times;
                                        </button>
                                    </div>
                                </div>
                                {/* Nội dung Form */}
                                <form className="user-info-edit-form">
                                    <div className="user-info-edit-row">
                                        <label htmlFor="id" className="user-info-edit-label">
                                            ID Tin
                                        </label>
                                        <input
                                            type="text"
                                            id="id"
                                            name="id"
                                            className="user-info-edit-input"
                                            value={selectedReView?._id || ""}
                                            readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                        />
                                    </div>
                                    <div className="user-info-edit-row">
                                        <label htmlFor="id" className="user-info-edit-label">
                                            Tên Công ty
                                        </label>
                                        <input
                                            type="text"
                                            id="id"
                                            name="id"
                                            className="user-info-edit-input"
                                            value={selectedReView?.company_id.company_name || ""}
                                            readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                        />
                                    </div>
                                    <div className="user-info-edit-col">
                                        <div className="user-info-edit-row">
                                            <label htmlFor="full_name" className="user-info-edit-label">
                                                Rating
                                            </label>
                                            <div id="full_name" name="full_name" className="user-info-edit-input" style={{ display: "flex", alignItems: "center", gap: "0px" }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <span
                                                        key={i}
                                                        style={{
                                                            color: i < (selectedReView?.rating || 0) ? "#ffc107" : "#e4e5e9",
                                                        }}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>

                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="full_name" className="user-info-edit-label">
                                                Tóm tắt 
                                            </label>
                                            <input
                                                type="text"
                                                id="email"
                                                name="email"
                                                className="user-info-edit-input"
                                                value={`${selectedReView?.comment || ""}`}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="user-info-edit-col">
                                        <div className="user-info-edit-row">
                                            <label htmlFor="full_name" className="user-info-edit-label">
                                                Lý do 
                                            </label>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                className="user-info-edit-input"
                                                value={`${selectedReView?.overtime_reason || ""}`}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="full_name" className="user-info-edit-label">
                                                Hài Lòng về chế độ tăng ca không?
                                            </label>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                className="user-info-edit-input"
                                                value={
                                                    selectedReView?.overtime_feeling === "satisfied"
                                                        ? "Hài lòng"
                                                        : selectedReView?.overtime_feeling === "unsatisfied"
                                                            ? "Không hài lòng"
                                                            : ""
                                                }
                                                readOnly
/>

                                        </div>
                                        
                                    </div>
                                    <div className="user-info-edit-col">
                                    <div className="user-info-edit-row">
                                            <label htmlFor="full_name" className="user-info-edit-label">
                                               Yêu thích 
                                            </label>
                                            <input
                                                type=""
                                                id=""
                                                name=""
                                                className="user-info-edit-input"
                                                value={`${selectedReView?.what_i_love || ""}`}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="role" className="user-info-edit-label">
                                                Đề xuất 
                                            </label>
                                            <input
                                                type="text"
                                                id="role"
                                                name="role"
                                                className="user-info-edit-input"
                                                value={selectedReView?.suggestion || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        
                                    </div>
                                    <div className="user-info-edit-col">
                                    <div className="user-info-edit-row">
                                            <label htmlFor="created_at" className="user-info-edit-label">
                                                Trạng thái
                                            </label>
                                            <input
                                                type="text"
                                                id="created_at"
                                                name="created_at"
                                                className="user-info-edit-input"
                                                value={selectedReView?.status || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="full_name" className="user-info-edit-label">
                                            Salary & benefits
                                            </label>
                                            <div id="full_name" name="full_name" className="user-info-edit-input" style={{ display: "flex", alignItems: "center", gap: "0px" }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <span
                                                        key={i}
                                                        style={{
                                                            color: i < (selectedReView?.details.salary_benefits || 0) ? "#ffc107" : "#e4e5e9",
                                                        }}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>

                                        </div>
                                        
                                    </div>
                                    <div className="user-info-edit-col">
                                    <div className="user-info-edit-row">
                                            <label htmlFor="full_name" className="user-info-edit-label">
                                            Training & learning 
                                            </label>
                                            <div id="full_name" name="full_name" className="user-info-edit-input" style={{ display: "flex", alignItems: "center", gap: "0px" }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <span
                                                        key={i}
                                                        style={{
                                                            color: i < (selectedReView?.details.training || 0) ? "#ffc107" : "#e4e5e9",
                                                        }}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="full_name" className="user-info-edit-label">
                                            Management cares about me
                                            </label>
                                            <div id="full_name" name="full_name" className="user-info-edit-input" style={{ display: "flex", alignItems: "center", gap: "0px" }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <span
                                                        key={i}
                                                        style={{
                                                            color: i < (selectedReView?.details.management || 0) ? "#ffc107" : "#e4e5e9",
                                                        }}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>

                                        </div>
                                        
                                    </div>
                                    <div className="user-info-edit-col">
                                    <div className="user-info-edit-row">
                                            <label htmlFor="full_name" className="user-info-edit-label">
                                            Culture & fun
                                            </label>
                                            <div id="full_name" name="full_name" className="user-info-edit-input" style={{ display: "flex", alignItems: "center", gap: "0px" }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <span
                                                        key={i}
                                                        style={{
                                                            color: i < (selectedReView?.details.culture || 0) ? "#ffc107" : "#e4e5e9",
                                                        }}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="full_name" className="user-info-edit-label">
                                            Office & workspace
                                            </label>
                                            <div id="full_name" name="full_name" className="user-info-edit-input" style={{ display: "flex", alignItems: "center", gap: "0px" }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <span
                                                        key={i}
                                                        style={{
                                                            color: i < (selectedReView?.details.workspace || 0) ? "#ffc107" : "#e4e5e9",
                                                        }}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>

                                        </div>
                                        
                                    </div>
                                    {/* Các radio button */}
                                    <div className="user-info-edit-radio-group">
                                        <div className="user-info-edit-radio-row">
                                            <input type="radio" id="option4" name="user_status" value="pending"
                                                checked={userStatus === "pending"}
                                                onChange={handleStatusChange} />
                                            <label htmlFor="option4">Pending</label>
                                        </div>
                                        <div className="user-info-edit-radio-row">
                                            <input type="radio" id="option1" name="user_status" value="approved"
                                                checked={userStatus === "approved"}
                                                onChange={handleStatusChange} />
                                            <label htmlFor="option1">Approved</label>
                                        </div>
                                        <div className="user-info-edit-radio-row">
                                            <input
                                                type="radio"
                                                id="option2"
                                                name="user_status"
                                                value="rejected"
                                                checked={userStatus === "rejected"}
                                                onChange={handleStatusChange}
                                            />
                                            <label htmlFor="option2">Rejected</label>
                                        </div>


                                        <div className="user-info-edit-radio-row">
                                            <input type="radio" id="option3" name="user_status" value="reported"
                                                checked={userStatus === "reported"}
                                                onChange={handleStatusChange} />
                                            <label htmlFor="option3">Reported</label>
                                        </div>
                                    </div>
                                    
                                </form>
                                {/* Footer (Save/Cancel) */}
                                <div className="user-info-edit-button-row">
                                    <button onClick={() => handleSaveReView(selectedReView._id)} className="user-info-edit-save-btn bg-[#5a8cb5]" type="submit">
                                        Lưu
                                    </button>
                                    <button className="user-info-edit-cancel-btn bg-gray-100" type="button" onClick={handleCloseReView}>
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {isReportOpen && (
                    <>
                        <div className="view-report-job-detail-overlay"></div>

                        <div className="view-report-job-detail-container">
                            <div className="view-report-job-detail-header">
                                <h2>Chi tiết báo cáo vi phạm</h2>
                                <button className="view-report-job-detail-close-btn" onClick={() => setIsReportOpen(false)}>
                                    &times;
                                </button>
                            </div>

                            <div className="view-report-job-detail-content">
                                {loading ? (
                                    <p>Đang tải...</p>
                                ) : error ? (
                                    <p style={{ color: "red" }}>{error}</p>
                                ) : selectedReport ? (
                                    <>
                                        {/* Thông tin công việc và công ty */}
                                        <div className="view-report-job-detail-info">
                                            <h2>Thông tin công việc bị báo cáo</h2>

                                            <div className="view-report-job-detail-row">
                                                <p><strong>Công việc:</strong> {selectedReport.job_title}</p>
                                                <a
                                                    href={`http://localhost:3000/jobs/jobdetail/${selectedReport.job_id}`}
                                                    className="view-report-job-detail-btn"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Xem chi tiết công việc
                                                </a>
                                            </div>

                                            <div className="view-report-job-detail-row">
                                                <p><strong>Công ty:</strong> {selectedReport.company_name}</p>
                                                <a
                                                    href={`http://localhost:3000/companies/companydetail/${selectedReport.company_id}`}
                                                    className="view-report-job-detail-btn"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Xem chi tiết công ty
                                                </a>
                                            </div>

                                            <p><strong>Số lượng báo cáo:</strong> {selectedReport.total_reports}</p>
                                            <p><strong>Trạng thái:</strong> {selectedReport.status}</p>
                                        </div>


                                        {/* Bảng danh sách báo cáo */}
                                        <h3>Danh sách báo cáo:</h3>
                                        <table className="view-report-job-detail-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Người báo cáo</th>
                                                    <th>Email</th>
                                                    <th>Lý do</th>
                                                    <th>Ngày báo cáo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedReport.reports.map((r, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{r.user_name}</td>
                                                        <td>{r.user_email}</td>
                                                        <td>{r.reason}</td>
                                                        <td>{new Date(r.reported_at).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                ) : (
                                    <p>Không có dữ liệu</p>
                                )}
                                <div className="user-info-edit-radio-group">
                                    <div className="user-info-edit-radio-row">
                                        <input type="radio" id="option1" name="user_status" value="approved"
                                            checked={userStatus === "approved"}
                                            onChange={handleStatusChange} />
                                        <label htmlFor="option1">Approved</label>
                                    </div>
                                    <div className="user-info-edit-radio-row">
                                        <input type="radio" id="option2" name="user_status" value="rejected"
                                            checked={userStatus === "rejected"}
                                            onChange={handleStatusChange} />
                                        <label htmlFor="option2">Rejected</label>
                                    </div>
                                </div>
                                {userStatus === "rejected" && (
                                    <div className="view-report-job-detail-rejection-reason">
                                        <label htmlFor="view-report-job-detail-reason">Lý do từ chối:</label>
                                        <textarea
                                            id="view-report-job-detail-reason"
                                            placeholder="Nhập lý do từ chối..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="view-report-job-detail-edit-button-row">
                                <button onClick={() => handleSave(selectedReport.job_id)} className="view-report-job-detail-edit-save-btn bg-[#5a8cb5]" type="submit">
                                    Lưu
                                </button>
                                <button className="view-report-job-detail-edit-cancel-btn bg-gray-100" type="button" onClick={handleCloseAccountEdit}>
                                    Hủy
                                </button>
                            </div>
                        </div>

                    </>

                )}

            </div>
        </div >
    )
}

export default ContentModerationList;
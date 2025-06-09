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

const UserManagement = () => {
    // Chuyển đổi tab
    const [activeTab, setActiveTab] = useState('account');
    const handleTabClick = (tab) => setActiveTab(tab);

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
    const handleSelectAllAccount = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            setSelectedRows(account.map((user) => user._id));
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

    //////////////////////// sort và select all recruiter
    const [sortRecruiterConfig, setSortRecruiterConfig] = useState({ key: "_id", direction: "asc" });

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
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    // Hàm mở form
    const handleAccountClick = (account) => {
        setSelectedAccount(account); // Lưu trữ dữ liệu account vào state
        setIsEditAccountOpen(true); // Mở form edit
    };
    const handleProfileClick = (account) => {
        setSelectedAccount(account); // Lưu trữ dữ liệu account vào state
        setIsEditProfileOpen(true); // Mở form edit
    };
    // Hàm đóng form và reset trạng thái
    const handleCloseAccountEdit = () => {
        setIsEditAccountOpen(false);
    };
    const handleCloseProfileEdit = () => {
        setIsEditProfileOpen(false);
    };

    const [selectedAccount, setSelectedAccount] = useState(null);

    //////////////////end chi tiết account
    // chỉnh sửa 
    const [userStatus, setUserStatus] = useState(null);
    const [accountStatus, setAccountStatus] = useState(null);
    const handleStatusChange = (e) => {
        setUserStatus(e.target.value);
        setAccountStatus(e.target.value);
    };
    const handleStatusProfileChange = (e) => {
        setUserStatus(e.target.value);
    
    // Nếu chọn trạng thái khác "rejected", xóa lý do từ chối
    if (e.target.value !== "rejected") {
        setRejectionReason("");
    }
    };

    const handleSave = async (userId) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/users/admin/edit/${userId}`, {
                state: accountStatus,  // Truyền trạng thái mới của người dùng
            });

            if (response.status === 200) {
                alert("Trạng thái tài khoản đã được cập nhật!");
                setIsEditAccountOpen(false);
                setLoading(false);

            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái tài khoản:", error);
        }
    };
    const [rejectionReason, setRejectionReason] = useState("");
    const [tempRejectionReason, setTempRejectionReason] = useState("");
    const handleSaveProfile = async (userId) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/profiles/admin/edit/${userId}`, {
                state: userStatus,
                reason: userStatus === "rejected" ? rejectionReason : "", // Chỉ gửi lý do nếu bị từ chối
            });
    
            if (response.status === 200) {
                alert("Trạng thái hồ sơ đã được cập nhật!");
                setIsEditProfileOpen(false);
                setLoading(false);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái hồ sơ:", error);
        }
    };
    
    useEffect(() => {
        console.log("Selected Account:", selectedAccount); // Debug giá trị
        setAccountStatus(selectedAccount?.state);
        if (selectedAccount?.profile?.state) {
            setUserStatus(selectedAccount?.profile?.state);
        }
        if (selectedAccount?.moderation?.reason) {
            setRejectionReason(selectedAccount?.moderation?.reason);
            setTempRejectionReason(selectedAccount?.moderation?.reason);
        }
    }, [selectedAccount]);    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className='company-profile'>
            <div className="company-profile-header">
                <h2>Công việc đang tuyển dụng</h2>
            </div>
            <div className="company-profile-container">
                {/* Thanh điều hướng tab */}
                <div className="company-profile-tabs">
                    <button
                        className={`company-profile-tab ${activeTab === 'account' ? 'active' : ''}`}
                        onClick={() => handleTabClick('account')}
                    >
                        <FaEye /> Tài khoản
                    </button>
                    <button
                        className={`company-profile-tab ${activeTab === 'applicant' ? 'active' : ''}`}
                        onClick={() => handleTabClick('applicant')}
                    >
                        <FaUsers /> Ứng viên
                    </button>
                    <button
                        className={`company-profile-tab ${activeTab === 'recruiter' ? 'active' : ''}`}
                        onClick={() => handleTabClick('recruiter')}
                    >
                        <FaUsers /> Nhà tuyển dụng
                    </button>
                    <button
                        className={`company-profile-tab ${activeTab === 'company' ? 'active' : ''}`}
                        onClick={() => handleTabClick('company')}
                    >
                        <FaUsers /> Công ty
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
                                                onChange={handleSelectAllAccount}
                                                className="user-management-select-all"
                                            />
                                        </th>
                                        <th onClick={() => handleSortAccount("_id")}>
                                            ID {getSortAccountIcon("_id")}
                                        </th>
                                        <th onClick={() => handleSortAccount("name")}>
                                            Name {getSortAccountIcon("name")}
                                        </th>
                                        <th onClick={() => handleSortAccount("email")}>
                                            Account {getSortAccountIcon("email")}
                                        </th>
                                        <th onClick={() => handleSortAccount("phone")}>
                                            Phone {getSortAccountIcon("phone")}
                                        </th>
                                        <th onClick={() => handleSortAccount("role")}>
                                            Role {getSortAccountIcon("role")}
                                        </th>
                                        <th onClick={() => handleSortAccount("created_at")}>
                                            Created Time {getSortAccountIcon("created_at")}
                                        </th>
                                        <th>Options</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedAccount.map((user) => (
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
                                            <td>{user?.email}</td>
                                            <td>{user?.profile?.phone}</td>
                                            <td>{user?.role}</td>
                                            <td>{formatDate(user?.created_at)}</td>
                                            <td>
                                                <div className="user-management-dropdown">
                                                    <FaFileLines onClick={() => handleAccountClick(user)} />
                                                    <FaFilePen onClick={() => handleAccountClick(user)} />
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
                                        <th onClick={() => handleSortApplicant("state")}>
                                            State {getSortApplicantIcon("state")}
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
                                            <td>{user.profile?.state}</td>
                                            <td>
                                                <div className="user-management-dropdown">
                                                    <Link to={`/admin/applicant-profile/${user._id}`}>
                                                        <FaFileLines />
                                                    </Link>
                                                    <FaFilePen onClick={() => handleProfileClick(user)} />
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
                                            Name {getSortRecruiterIcon("name")}
                                        </th>
                                        <th onClick={() => handleSortRecruiter("email")}>
                                            Email {getSortRecruiterIcon("email")}
                                        </th>
                                        <th onClick={() => handleSortRecruiter("phone")}>
                                            Phone {getSortRecruiterIcon("phone")}
                                        </th>
                                        <th>Options</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedRecruiter.map((user) => (
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
                                            <td>
                                                <div className="user-management-dropdown">
                                                    <FaFileLines /><FaFilePen /><FaFileCircleXmark />
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
                                            ID {getSortCompanyIcon("_id")}
                                        </th>
                                        <th onClick={() => handleSortCompany("name")}>
                                            Name {getSortCompanyIcon("name")}
                                        </th>
                                        <th onClick={() => handleSortCompany("industry")}>
                                            Industry {getSortCompanyIcon("industry")}
                                        </th>
                                        <th onClick={() => handleSortCompany("website")}>
                                            Website {getSortCompanyIcon("website")}
                                        </th>
                                        <th onClick={() => handleSortCompany("location")}>
                                            Location {getSortCompanyIcon("location")}
                                        </th>
                                        <th>Options</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedCompany.map((user) => (
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
                                            <td>{user?.company_name}</td>
                                            <td>{user?.industry}</td>
                                            <td>{user?.website}</td>
                                            <td>{user?.location}</td>
                                            <td>
                                                <div className="user-management-dropdown">
                                                    <Link to={`/companies/companydetail/${user._id}`}>
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
                {isEditAccountOpen && (
                    <>
                        <div className="user-info-edit-overlay">
                            <div className="user-info-edit-container">
                                {/* Header */}
                                <div className="user-info-edit-header-form">
                                    <div className="user-info-edit-header">
                                        <h2>Account</h2>
                                        <button className="user-info-edit-close-btn" onClick={handleCloseAccountEdit}>
                                            &times;
                                        </button>
                                    </div>
                                </div>
                                {/* Nội dung Form */}
                                <form className="user-info-edit-form">
                                    <div className="user-info-edit-row">
                                        <label htmlFor="id" className="user-info-edit-label">
                                            ID Account
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
                                                Tên Account
                                            </label>
                                            <input
                                                type="text"
                                                id="full_name"
                                                name="full_name"
                                                className="user-info-edit-input"
                                                value={`${selectedAccount?.profile?.first_name || ""} ${selectedAccount?.profile?.last_name || ""}`}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa    
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="email" className="user-info-edit-label">
                                                Email
                                            </label>
                                            <input
                                                type="text"
                                                id="email"
                                                name="email"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.email || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    <div className="user-info-edit-col">
                                        <div className="user-info-edit-row">
                                            <label htmlFor="username" className="user-info-edit-label">
                                                Username
                                            </label>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.username || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="password" className="user-info-edit-label">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                className="user-info-edit-input"
                                                value="Notallowedtoview"
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    <div className="user-info-edit-col">                                     
                                        <div className="user-info-edit-row">
                                            <label htmlFor="role" className="user-info-edit-label">
                                                Role
                                            </label>
                                            <input
                                                type="text"
                                                id="role"
                                                name="role"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.role || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="created_at" className="user-info-edit-label">
                                                Created_at
                                            </label>
                                            <input
                                                type="text"
                                                id="created_at"
                                                name="created_at"
                                                className="user-info-edit-input"
                                                value={formatDate(selectedAccount?.created_at) || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                   
                                        
                                    {/* Các radio button */}
                                    <div className="user-info-edit-radio-group">
                                        <div className="user-info-edit-radio-row">
                                            <input type="radio" id="option1" name="user_status" value="pending"
                                                checked={accountStatus === "pending"}
                                                onChange={handleStatusChange} />
                                            <label htmlFor="option1">Pending</label>
                                        </div>
                                        <div className="user-info-edit-radio-row">
                                            <input type="radio" id="option2" name="user_status" value="approved"
                                                checked={accountStatus === "approved"}
                                                onChange={handleStatusChange} />
                                            <label htmlFor="option2">Approved</label>
                                        </div>
                                        <div className="user-info-edit-radio-row">
                                            <input type="radio" id="option3" name="user_status" value="rejected"
                                                checked={accountStatus === "rejected"}
                                                onChange={handleStatusChange} />
                                            <label htmlFor="option3">Rejected</label>
                                        </div>
                                    </div>                           
                                </form>
                                {/* Footer (Save/Cancel) */}
                                <div className="user-info-edit-button-row">
                                    <button onClick={() => handleSave(selectedAccount._id)} className="user-info-edit-save-btn" type="submit">
                                        Lưu
                                    </button>
                                    <button className="user-info-edit-cancel-btn" type="button" onClick={handleCloseAccountEdit}>
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {isEditProfileOpen && (
                    <>
                        <div className="user-info-edit-overlay">
                            <div className="user-info-edit-container">
                                {/* Header */}
                                <div className="user-info-edit-header-form">
                                    <div className="user-info-edit-header">
                                        <h2>Account</h2>
                                        <button className="user-info-edit-close-btn" onClick={handleCloseProfileEdit}>
                                            &times;
                                        </button>
                                    </div>
                                </div>
                                {/* Nội dung Form */}
                                <form className="user-info-edit-form">
                                    <div className="user-info-edit-row">
                                        <label htmlFor="id" className="user-info-edit-label">
                                            ID Account
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
                                                Tên Account
                                            </label>
                                            <input
                                                type="text"
                                                id="full_name"
                                                name="full_name"
                                                className="user-info-edit-input"
                                                value={`${selectedAccount?.profile?.first_name || ""} ${selectedAccount?.profile?.last_name || ""}`}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa    
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="email" className="user-info-edit-label">
                                                Email
                                            </label>
                                            <input
                                                type="text"
                                                id="email"
                                                name="email"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.email || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    <div className="user-info-edit-col">
                                        <div className="user-info-edit-row">
                                            <label htmlFor="username" className="user-info-edit-label">
                                                Username
                                            </label>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.username || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="password" className="user-info-edit-label">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                className="user-info-edit-input"
                                                value="Notallowedtoview"
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    <div className="user-info-edit-col">
                                        <div className="user-info-edit-row">
                                            <label htmlFor="date_of_birth" className="user-info-edit-label">
                                                Date of birth
                                            </label>
                                            <input
                                                type="text"
                                                id="date_of_birth "
                                                name="date_of_birth"
                                                className="user-info-edit-input"
                                                value={formatDate(selectedAccount?.profile.date_of_birth) || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="role" className="user-info-edit-label">
                                                Role
                                            </label>
                                            <input
                                                type="text"
                                                id="role"
                                                name="role"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.role || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    <div className="user-info-edit-col">
                                        <div className="user-info-edit-row">
                                            <label htmlFor="nationality" className="user-info-edit-label">
                                                Nationality
                                            </label>
                                            <input
                                                type="text"
                                                id="nationality"
                                                name="nationality"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.profile.nationality || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="location" className="user-info-edit-label">
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                id="location "
                                                name="location"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.profile.location || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    <div className="user-info-edit-col">
                                        <div className="user-info-edit-row">
                                            <label htmlFor="education" className="user-info-edit-label">
                                                Education
                                            </label>
                                            <input
                                                type="text"
                                                id="education"
                                                name="education"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.profile.education || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="experience" className="user-info-edit-label">
                                                Experience
                                            </label>
                                            <input
                                                type="text"
                                                id="experience"
                                                name="experience"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.profile.experience || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    <div className="user-info-edit-col">
                                        <div className="user-info-edit-row">
                                            <label htmlFor="skills" className="user-info-edit-label">
                                                Skills
                                            </label>
                                            <input
                                                type="text"
                                                id="skills"
                                                name="skills"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.profile.skills || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="specific_address" className="user-info-edit-label">
                                                Specific Address
                                            </label>
                                            <input
                                                type="text"
                                                id="specific_address"
                                                name="specific_address"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.profile.specific_address || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    <div className="user-info-edit-col">
                                        <div className="user-info-edit-row">
                                            <label htmlFor="job_title" className="user-info-edit-label">
                                                Job title
                                            </label>
                                            <input
                                                type="text"
                                                id="job_title"
                                                name="job_title"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.profile.job_title || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="job_level" className="user-info-edit-label">
                                                Job level
                                            </label>
                                            <input
                                                type="text"
                                                id="job_level"
                                                name="job_level"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.profile.job_level || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    <div className="user-info-edit-col">
                                        <div className="user-info-edit-row">
                                            <label htmlFor="current_industry" className="user-info-edit-label">
                                                Current industry
                                            </label>
                                            <input
                                                type="text"
                                                id="current_industry"
                                                name="current_industry"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.profile.current_industry || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="current_field" className="user-info-edit-label">
                                                Current field
                                            </label>
                                            <input
                                                type="text"
                                                id="current_field"
                                                name="current_field"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.profile.current_field || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    <div className="user-info-edit-col">
                                        <div className="user-info-edit-row">
                                            <label htmlFor="years_of_experience" className="user-info-edit-label">
                                                Years of experience
                                            </label>
                                            <input
                                                type="text"
                                                id="years_of_experience"
                                                name="years_of_experience"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.profile.years_of_experience || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="current_salary" className="user-info-edit-label">
                                                Current salary
                                            </label>
                                            <input
                                                type="text"
                                                id="current_salary"
                                                name="current_salary"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.profile.current_salary || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    <div className="user-info-edit-col">
                                        <div className="user-info-edit-row">
                                            <label htmlFor="desired_work_location" className="user-info-edit-label">
                                                Desired work location
                                            </label>
                                            <input
                                                type="text"
                                                id="desired_work_location"
                                                name="desired_work_location"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.profile.desired_work_location || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                        <div className="user-info-edit-row">
                                            <label htmlFor="desired_salary" className="user-info-edit-label">
                                                Desired salary
                                            </label>
                                            <input
                                                type="text"
                                                id="desired_salary"
                                                name="desired_salary"
                                                className="user-info-edit-input"
                                                value={selectedAccount?.profile.desired_salary || ""}
                                                readOnly // Chỉ hiển thị, không cho chỉnh sửa
                                            />
                                        </div>
                                    </div>
                                    {/* Các radio button */}
                                    <div className="user-info-edit-radio-group">
                                        <div className="user-info-edit-radio-row">
                                            <input type="radio" id="option1" name="user_status" value="pending"
                                                checked={userStatus === "pending"}
                                                onChange={handleStatusProfileChange} />
                                            <label htmlFor="option1">Pending</label>
                                        </div>
                                        <div className="user-info-edit-radio-row">
                                            <input type="radio" id="option2" name="user_status" value="approved"
                                                checked={userStatus === "approved"}
                                                onChange={handleStatusProfileChange} />
                                            <label htmlFor="option2">Approved</label>
                                        </div>
                                        <div className="user-info-edit-radio-row">
                                            <input type="radio" id="option3" name="user_status" value="rejected"
                                                checked={userStatus === "rejected"}
                                                onChange={handleStatusProfileChange} />
                                            <label htmlFor="option3">Rejected</label>
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
                                </form>
                                {/* Footer (Save/Cancel) */}
                                <div className="user-info-edit-button-row">
                                    <button onClick={() => handleSaveProfile(selectedAccount._id)} className="user-info-edit-save-btn" type="submit">
                                        Lưu
                                    </button>
                                    <button className="user-info-edit-cancel-btn" type="button" onClick={handleCloseProfileEdit}>
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div >
    )
}

export default UserManagement;
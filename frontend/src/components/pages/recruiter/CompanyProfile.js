import React, { useEffect, useState } from 'react';
import { Eye, LoaderCircle } from 'lucide-react';
import {
    User2,
    Mail,
    Phone,
    Building2,
    BadgeInfo,
    XCircle
} from 'lucide-react';
import { FaBuilding, FaEye, FaUsers, FaTimes, FaStream } from 'react-icons/fa';
import {
    FaMapMarkerAlt,
    FaGlobe,
    FaInfoCircle,
} from 'react-icons/fa';
import { RiEdit2Fill } from "react-icons/ri";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faComments } from "@fortawesome/free-solid-svg-icons";
import { getId } from '../../../libs/isAuth';
import axios from 'axios';
import { Button } from '@/components/control/ui/button';
import { Textarea } from '@/components/control/ui/textarea';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import OverviewReview from './OverviewReview';
import CommentsReview from './CommentsReview';

const countryData = [
    {
        name: "Việt Nam",
        code: "+84",
        flag: "https://flagcdn.com/w40/vn.png"
    },
    {
        name: "United States",
        code: "+1",
        flag: "https://flagcdn.com/w40/us.png"
    },
    {
        name: "United Kingdom",
        code: "+44",
        flag: "https://flagcdn.com/w40/gb.png"
    },
    {
        name: "France",
        code: "+33",
        flag: "https://flagcdn.com/w40/fr.png"
    },
    {
        name: "Germany",
        code: "+49",
        flag: "https://flagcdn.com/w40/de.png"
    },
    {
        name: "Japan",
        code: "+81",
        flag: "https://flagcdn.com/w40/jp.png"
    },
    {
        name: "Australia",
        code: "+61",
        flag: "https://flagcdn.com/w40/au.png"
    },
    {
        name: "India",
        code: "+91",
        flag: "https://flagcdn.com/w40/in.png"
    },
    {
        name: "Canada",
        code: "+1",
        flag: "https://flagcdn.com/w40/ca.png"
    },
    {
        name: "Brazil",
        code: "+55",
        flag: "https://flagcdn.com/w40/br.png"
    }
];

const locations = {
    "Việt Nam": {
        "Hà Nội": ["Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Đống Đa", "Quận Cầu Giấy", "Quận Tây Hồ"],
        "Hồ Chí Minh": [
            "Huyện Bình Chánh",
            "Huyện Cần Giờ",
            "Huyện Củ Chi",
            "Huyện Hóc Môn",
            "Huyện Nhà Bè",
            "Quận 1",
            "Quận 2",
            "Quận 3",
            "Quận 7",
            "Quận 9"
        ],
        "Đà Nẵng": ["Quận Hải Châu", "Quận Cẩm Lệ", "Quận Liên Chiểu", "Quận Ngũ Hành Sơn", "Quận Sơn Trà"],
        "Cần Thơ": ["Quận Ninh Kiều", "Quận Bình Thủy", "Quận Cái Răng", "Huyện Phong Điền"]
    },
    "Afghanistan": {
        "Kabul": ["District 1", "District 2", "District 3", "District 4"],
        "Herat": ["Guzara", "Kohsan", "Obeh"],
        "Kandahar": ["Daman", "Panjwai", "Spin Boldak"]
    },
    "Albania": {
        "Tirana": ["Kashar", "Farkë", "Peza", "Zall-Herr"],
        "Durrës": ["Ishëm", "Rrashbull", "Sukth"]
    },
    "Algeria": {
        "Algiers": ["Bab El Oued", "El Madania", "Hussein Dey"],
        "Oran": ["El Kerma", "Es Senia", "Bir El Djir"],
        "Constantine": ["Beni Hamidane", "Didouche Mourad", "Hamma Bouziane"]
    },
    "American Samoa": {
        "Tutuila": ["Pago Pago", "Tafuna", "Nu'uuli"],
        "Manu'a Islands": ["Ta'u", "Ofu", "Olosega"]
    }
};

const options = [
    { value: "", label: "Vui lòng chọn" },
    { value: "less-than-10", label: "Ít hơn 10" },
    { value: "10-24", label: "10-24" },
    { value: "25-99", label: "25-99" },
    { value: "100-499", label: "100-499" },
];

const CompanyProfile = () => {
    const [loading, setLoading] = useState(true); // State để kiểm tra trạng thái loading
    const [error, setError] = useState(null); // State để lưu lỗi (nếu có)  
    const [companyId, setCompanyId] = useState(null); // Lưu companyId trong state
    const [follwerIds, setFollwerIds] = useState([]);  // State để lưu danh sách userId
    const [isEditOpen, setIsEditOpen] = useState(false);
    const idnd = getId();

    const [companyData, setCompanyData] = useState({
        user_id: "", // Mặc định rỗng hoặc lấy từ thông tin người dùng đã đăng nhập
        company_name: "",
        description: "",
        industry: "",
        location: "",
        specific_address: "",
        website: "",
        logo: null, // Base64 hoặc URL hình ảnh logo
        banner: null, // Base64 hoặc URL hình ảnh banner
        quymo: "",
    });

    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        gender: '',
        email: '',
        phone: '',
        nationality: '',
        date_of_birth: '',
        location: '',
        specific_address: '',
        job_title: '',
        job_level: '',
        current_industry: '',
        current_field: '',
        years_of_experience: '',
        current_salary: '',
        desired_work_location: '',
        desired_salary: '',
        education: '',
        experience: [],
        skills: [],
        cv_files: []
    });
    const handleLogoChange = (e) => {
        setCompanyData({ ...companyData, logo: e.target.files[0] });
    };
    const handleBannerChange = (e) => {
        setCompanyData({ ...companyData, banner: e.target.files[0] });
    };
    const handleUploadToCloudinary = async (file) => {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('upload_preset', 'unsigned_upload_preset'); // Đảm bảo rằng preset này đã được thiết lập trong Cloudinary

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/dxwoaywlz/image/upload`,
                uploadData
            );
            console.log('Cloudinary response:', response.data); // In ra toàn bộ dữ liệu trả về từ Cloudinary

            const logoUrl = response.data.secure_url;  // Lấy URL của logo từ phản hồi

            if (logoUrl) {
                console.log('Logo URL:', logoUrl); // In ra URL của logo
                return logoUrl;
            } else {
                console.error('Error: No secure_url found in the response');
                return null;
            }
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            return null;
        }
    };

    const [followerProfile, setFollowerProfile] = useState([]);


    const handleInputCompanyChange = (e) => {
        const { name, value } = e.target;
        setCompanyData({ ...companyData, [name]: value });
    };
    const handleInputProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    //////////////////////////////////////////////////////////
    // Trạng thái cho ô địa chỉ 1
    const [currentLevel1, setCurrentLevel1] = useState(locations); // Cấp hiện tại
    const [breadcrumbs1, setBreadcrumbs1] = useState([]); // Lưu đường dẫn đã chọn
    const [selectedValue1, setSelectedValue1] = useState(""); // Giá trị đã chọn
    const [isMenuOpen1, setIsMenuOpen1] = useState(false); // Trạng thái mở menu

    const handleSelect1 = (key) => {
        if (typeof currentLevel1[key] === "object") {
            setBreadcrumbs1([...breadcrumbs1, key]); // Cập nhật breadcrumbs
            setCurrentLevel1(currentLevel1[key]); // Chuyển xuống cấp tiếp theo
        } else {
            const locationValue = [...breadcrumbs1, key].join(", "); // Tính giá trị trực tiếp
            setSelectedValue1(locationValue); // Cập nhật giá trị vào state
            setIsMenuOpen1(false); // Đóng menu
            setCompanyData((prevData) => ({
                ...prevData,
                location: locationValue, // Cập nhật vào companyData
            }));
        }
    };

    const handleBack1 = () => {
        if (breadcrumbs1.length > 0) {
            const newBreadcrumbs = breadcrumbs1.slice(0, -1); // Loại bỏ cấp cuối
            const newLevel = newBreadcrumbs.reduce((acc, key) => acc[key], locations); // Lấy lại dữ liệu cấp trước
            setBreadcrumbs1(newBreadcrumbs);
            setCurrentLevel1(newLevel);
        }
    };

    const toggleMenu1 = () => {
        setIsMenuOpen1(!isMenuOpen1);
    };

    const [selectedCountry, setSelectedCountry] = useState(countryData[0]); // Quốc gia mặc định
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Trạng thái dropdown

    // Xử lý khi chọn quốc gia
    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setIsDropdownOpen(false); // Đóng dropdown sau khi chọn
    };


    //////////////////////////////////////////////////////////////////////////////

    const [activeTab, setActiveTab] = useState('overview');

    // Chuyển đổi tab
    const handleTabClick = (tab) => setActiveTab(tab);

    const [imageLogo, setImageLogo] = useState(null);
    const [imageBanner, setImageBanner] = useState(null);

    const handleImageLogoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => setImageLogo(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleImageBannerChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => setImageBanner(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleFileLogoChange = (e) => {
        handleLogoChange(e);
        handleImageLogoChange(e);
    }

    const handleFileBannerChange = (e) => {
        handleBannerChange(e);
        handleImageBannerChange(e);
    }

    const handleDeleteLogoImage = () => {
        setImageLogo(null);
    };

    const handleDeleteBannerImage = () => {
        setImageBanner(null);
    };

    const handleDropLogo = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => setImageLogo(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDropBanner = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => setImageBanner(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };
    const validateCompanyData = () => {
        const requiredFields = [
            { name: 'company_name', label: 'Tên công ty' },
            { name: 'industry', label: 'Lĩnh vực' },
            { name: 'quymo', label: 'Quy mô công ty' },
            { name: 'location', label: 'Địa chỉ' },
            { name: 'specific_address', label: 'Địa chỉ cụ thể' },
            { name: 'website', label: 'Website' },
        ];

        // Check for missing required fields
        for (const field of requiredFields) {
            if (!companyData[field.name]) {
                alert(`Vui lòng điền ${field.label}`);
                return false;
            }
        }

        // Validate phone number (10-15 digits)
        if (!isValidPhone(profile.phone)) {
            alert('Vui lòng điền số điện thoại hợp lệ!');
            return false;
        }

        // Validate website URL
        if (companyData.website && !isValidWebsite(companyData.website)) {
            alert('Vui lòng cung cấp một URL website hợp lệ.');
            return false;
        }

        return true;
    };

    // Helper function to validate phone
    const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

    // Helper function to validate website
    const isValidWebsite = (website) => {
        const websitePattern = /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6})|localhost)(:\d+)?(\/.*)?$/;
        return websitePattern.test(website);
    };


    const handleSave = async () => {
        setLoading(true);
        const logoUrl = await handleUploadToCloudinary(companyData.logo);
        const bannerUrl = await handleUploadToCloudinary(companyData.banner);

        console.log('Data before sending to backend:', {
            ...companyData,
            logo: logoUrl,
            banner: bannerUrl,
        });
        const updatedCompanyData = {
            ...companyData,  // Lấy tất cả dữ liệu cũ
            logo: logoUrl,   // Cập nhật logo mới
            banner: bannerUrl,
        };

        if (!validateCompanyData()) {
            return; // Nếu dữ liệu không hợp lệ, dừng việc lưu
            setLoading(false);
        }

        console.log('Logo URL trước khi gửi lên server:', companyData.logo);
        try {
            const response = await axios.put(`http://localhost:5000/api/companies/${companyId}`,
                updatedCompanyData,
                {
                });
            // Kiểm tra phản hồi từ server
            if (response.data && response.data.message) {
                // Nếu có message trong response, hiển thị thông báo
                toast(response.data.message);
            } else {
                alert('Failed to save profile: Unknown error');
            }
        } catch (error) {
            if (error.response) {
                // Lỗi từ server
                console.error('Error response from server:', error.response.data);
                alert(`An error occurred: ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
                // Không có phản hồi từ server
                console.error('Error request:', error.request);
                alert('No response from server. Please check your connection or server status.');
            } else {
                // Lỗi khác
                console.error('Error message:', error.message);
                alert(`An error occurred: ${error.message}`);
            }
        } finally {
            setLoading(false);
            setIsEditOpen(false);
        }
    }

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                console.log('Fetching data for user_id:', idnd);  // Kiểm tra giá trị của idnd

                const responseCompany = await axios.get(`http://localhost:5000/api/companies/${idnd}`);

                setCompanyData(responseCompany.data); // Gán dữ liệu công ty vào state
                setCompanyId(responseCompany.data._id);
                setImageLogo(responseCompany.data.logo);
                setImageBanner(responseCompany.data.banner);
            } catch (error) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/profiles/${idnd}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Gửi token xác thực
                    },
                });
                setProfile(response.data); // Gán dữ liệu profile vào state
            } catch (error) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false); // Dừng trạng thái loading
            }
        };

        if (idnd) {
            fetchCompany();
            fetchProfile();
        } else {
            console.log('idnd is not valid:', idnd); // Khi idnd không hợp lệ
        }
    }, [idnd]);

    useEffect(() => {
        const fetchFollowerIds = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/followedcompanies/company/${companyId}/followers`);
                setFollwerIds(response.data.userIds);  // Cập nhật state với danh sách userId
                setLoading(false);  // Đổi trạng thái loading khi nhận được dữ liệu
                console.log(response.data);
            } catch (err) {
                setError("Error fetching followers");
                setLoading(false);
            }
        };

        fetchFollowerIds();
    }, [companyId]);  // Chạy lại khi companyId thay đổi

    const handleFollowerList = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/api/profiles/follower-profiles',
                { userIds: follwerIds }
            );

            setFollowerProfile(response.data); // Gán danh sách profile vào state
        } catch (err) {
            console.error('Error fetching profiles:', err);
            setError('Failed to load profile data.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (follwerIds.length > 0) {
            handleFollowerList();
            console.log("followers", followerProfile);
        }
    }, [follwerIds]);

    const fullName = [profile.first_name || 'User', profile.last_name || 'Profile'].join(' ').trim();

    const {
        banner,
        logo,
        company_name,
        industry,
        location,
        specific_address,
        quymo,
        website,
        description
    } = companyData || {};

    const handleEditClick = () => {
        setIsEditOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditOpen(false);
    };

    return (
        <div className="flex flex-col gap-5 w-full">
            <div className='flex gap-5 pb-3'>
                <FaStream className="w-3 text-gray-700" />
                <p className="font-semibold text-sm text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Company Profile</p>
            </div>


            <div class="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-[35%] mx-auto bg-white rounded-2xl overflow-hidden">
                    {/* Banner */}
                    {banner && (
                        <div className="h-48 w-full overflow-hidden">
                            <img
                                src={banner}
                                alt="Company Banner"
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6 relative">
                        {/* Logo + Name */}
                        <div className="flex items-end space-x-4 -mt-16">
                            {logo && (
                                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                                    <img
                                        src={logo}
                                        alt="Company Logo"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-2 group relative">
                                    <h2 className="text-lg font-semibold text-gray-900">{company_name}</h2>
                                    <RiEdit2Fill
                                        className="text-gray-500 cursor-pointer opacity-0 group-hover:opacity-100 transition"
                                        onClick={() => handleEditClick()}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">{industry}</p>
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
                                        <p>{location}</p>
                                        <p className="text-sm text-gray-500">{specific_address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <FaBuilding className="mt-1 text-green-600" />
                                    <div>
                                        <p className="font-medium">Quy mô:</p>
                                        <p>{quymo || 'Không rõ'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <FaGlobe className="mt-1 text-purple-600" />
                                    <div>
                                        <p className="font-medium">Website:</p>
                                        <a
                                            href={website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline break-all"
                                        >
                                            {website}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <FaInfoCircle className="mt-1 text-gray-700" />
                                    <div>
                                        <p className="font-medium">Giới thiệu:</p>
                                        <p>{description || 'Chưa có mô tả.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full sm:w-[65%] max-w-[65%] relative flex flex-col gap-5 items-start bg-white p-5 rounded-2xl">
                    <div className="w-full flex justify-start border-b-2 border-[#e0e0e0]">
                        <button
                            className={`text-sm px-5 py-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'overview'
                                ? 'text-[#0077b6] border-b-2 border-[#0077b6]'
                                : ''
                                }`}
                            onClick={() => handleTabClick('overview')}
                        >
                            <FontAwesomeIcon icon={faChartLine} /> Tổng quát
                        </button>
                        <button
                            className={`text-sm px-5 py-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'comments'
                                ? 'text-[#0077b6] border-b-2 border-[#0077b6]'
                                : ''
                                }`}
                            onClick={() => handleTabClick('comments')}
                        >
                            <FontAwesomeIcon icon={faComments} /> Đánh giá & bình luận
                        </button>
                        <button
                            className={`text-sm px-5 py-3 font-semibold flex items-center gap-2 bg-transparent border-none outline-none transition-colors duration-300 hover:text-[#0077b6] relative ${activeTab === 'followCompany'
                                ? 'text-[#0077b6] border-b-2 border-[#0077b6]'
                                : ''
                                }`}
                            onClick={() => handleTabClick('followCompany')}
                        >
                            <FaUsers /> Theo dõi công ty
                        </button>
                    </div>

                    {/* Tab Theo dõi công ty */}
                    {activeTab === 'followCompany' && (
                        <div className="bg-white w-full">
                            {followerProfile.map((follower_profile) => (

                                <div
                                    key={follower_profile._id}
                                    className="w-full flex flex-col sm:flex-row gap-6 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition duration-300 border border-gray-100"
                                >
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 w-20 h-20 relative mx-auto sm:mx-0">
                                        <img
                                            src={follower_profile.user_id?.avatar || 'user.png'}
                                            alt="avatar"
                                            className="w-full h-full rounded-full object-cover border-2 border-blue-200 shadow-sm"
                                        />
                                        <span className="absolute bottom-0 right-0 block w-4 h-4 bg-green-400 border-2 border-white rounded-full"></span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex flex-col justify-between flex-1 gap-3">
                                        <div className="space-y-1">
                                            <Link to={`/applicants/applicant-profile/viewed/${follower_profile._id}`}>
                                                <h4 className="text-base font-semibold text-gray-800 hover:text-blue-600 transition">
                                                    {`${follower_profile.first_name} ${follower_profile.last_name}`}
                                                </h4>
                                            </Link>
                                        </div>

                                        {/* Thông tin liên hệ */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <BadgeInfo className="w-4 h-4 text-gray-400" />
                                                {`${follower_profile.job_title} - ${follower_profile.job_level}` || ''}
                                            </p>

                                            <p className="flex items-center gap-2 col-span-full sm:col-span-1">
                                                <Building2 className="w-4 h-4 text-indigo-500" />
                                                {`${follower_profile.current_industry} - ${follower_profile.current_field}` || ''}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-blue-500" />
                                                {follower_profile.email}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-green-500" />
                                                {follower_profile.phone || 'Chưa cập nhật'}
                                            </p>
                                        </div>

                                        {/* Nút hủy theo dõi */}
                                        <div className='flex flex-row gap-5'>
                                            <Link to={`/applicants/applicant-profile/viewed/${follower_profile._id}`} className="bg-white border border-red-500 text-red-500 hover:border-red-700 hover:text-red-700 px-4 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm">
                                                <Eye className="w-4 h-4" />
                                                Xem hồ sơ
                                            </Link>
                                            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm">
                                                <XCircle className="w-4 h-4" />
                                                Huỷ theo dõi
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tab Tổng quan */}
                    {activeTab === 'overview' && (
                        <OverviewReview />
                    )}

                    {/* Tab Đánh giá & bình luận */}
                    {activeTab === 'comments' && (
                        <CommentsReview />
                    )}
                </div>
            </div>

            {/* Profile View */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg w-[800px] max-w-[800px] min-w-[400px] shadow-lg flex flex-col h-[80%] overflow-hidden">
                        <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-0 border-b border-gray-300">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-lg font-semibold">Edit Company Profile</h2>
                                <button className="text-2xl leading-none cursor-pointer" onClick={handleCloseEdit}>
                                    &times;
                                </button>
                            </div>
                        </div>

                        <div className='flex-1 overflow-y-auto px-5 pb-5 pt-5 border-b border-gray-300 text-[#555]'>
                            <div className="flex flex-col">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="flex flex-col -mb-1">
                                        <label htmlFor="companyName" className="font-bold mb-2">
                                            Tên công ty <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="companyName"
                                            name='company_name'
                                            value={companyData?.company_name}
                                            onChange={handleInputCompanyChange}
                                            className="w-full p-2 border border-[#ccc] rounded text-sm"
                                            placeholder="Nhập tên công ty"
                                        />
                                    </div>
                                    <div className="flex flex-col -mb-1">
                                        <label htmlFor="industry" className="font-bold mb-2">
                                            Lĩnh vực <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="industry"
                                            name='industry'
                                            value={companyData?.industry}
                                            onChange={handleInputCompanyChange}
                                            className="w-full p-2 border border-[#ccc] rounded text-sm"
                                            placeholder="Nhập lĩnh vực"
                                        />
                                    </div>
                                    <div className="flex flex-col mb-4">
                                        <label htmlFor="quymo" className="font-bold mb-2">
                                            Quy mô <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="quymo"
                                            name="quymo"
                                            value={companyData.quymo || ''}
                                            onChange={handleInputCompanyChange}
                                            className="w-full p-2 border border-[#ddd] rounded text-sm focus:outline-none focus:border-[#007bff] focus:shadow"
                                        >
                                            {options.map((option) => (
                                                <option key={option.value} value={option.label}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col mb-4 relative">
                                        <label htmlFor="address" className="font-bold mb-2">
                                            Địa chỉ <span className="text-red-500">*</span>
                                        </label>
                                        <div
                                            className="border border-[#ccc] rounded px-3 py-2 bg-white text-sm cursor-pointer hover:border-[#007bff]"
                                            onClick={toggleMenu1}
                                        >
                                            {companyData.location || "Chọn địa điểm"}
                                        </div>
                                        {isMenuOpen1 && (
                                            <div className="absolute top-full left-0 w-full border border-[#ccc] rounded bg-white z-50 max-h-[300px] overflow-y-auto shadow-lg">
                                                <div className="flex items-center px-3 py-2 border-b border-[#f0f0f0] bg-white">
                                                    {breadcrumbs1.length > 0 && (
                                                        <button onClick={handleBack1} className="text-[#007bff] mr-2">&lt;</button>
                                                    )}
                                                    <span className="text-sm text-[#555]">{breadcrumbs1.join(", ") || "Chọn địa điểm"}</span>
                                                </div>
                                                <ul className="list-none m-0 p-0">
                                                    {Object.keys(currentLevel1).map((key) => (
                                                        <li
                                                            key={key}
                                                            onClick={() => handleSelect1(key)}
                                                            className="px-3 py-2 cursor-pointer border-b border-[#f0f0f0] hover:bg-[#f0f8ff] text-[#555]"
                                                        >
                                                            {key}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col mb-4">
                                    <label htmlFor="specific_address" className="font-bold mb-2">
                                        Địa chỉ cụ thể <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="specific_address"
                                        name='specific_address'
                                        value={companyData?.specific_address}
                                        onChange={handleInputCompanyChange}
                                        className="w-full p-2 border border-[#ccc] rounded text-sm"
                                        placeholder="Nhập địa chỉ cụ thể"
                                    />
                                </div>

                                <div className="flex flex-col mb-4 relative">
                                    <label className="font-bold mb-2">
                                        Điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center border border-[#ccc] rounded-lg p-2 bg-white">
                                        <div
                                            className="flex items-center cursor-pointer mr-2"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        >
                                            <img src={selectedCountry.flag} alt={selectedCountry.name} className="w-6 h-4 mr-1" />
                                            <span className="text-sm text-[#333]">{selectedCountry.code}</span>
                                            <span className="ml-1 text-xs text-[#888]">▼</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Nhập số điện thoại"
                                            value={profile.phone}
                                            name="phone"
                                            onChange={handleInputProfileChange}
                                            className="flex-1 border-none outline-none text-sm text-[#333]"
                                        />
                                    </div>
                                    {isDropdownOpen && (
                                        <ul className="absolute top-full left-0 w-full max-h-52 overflow-y-auto bg-white border border-[#ccc] rounded-lg z-50 shadow-lg mt-1">
                                            {countryData.map((country) => (
                                                <li
                                                    key={country.code}
                                                    onClick={() => handleCountrySelect(country)}
                                                    className="flex items-center px-3 py-2 cursor-pointer border-b border-[#f0f0f0] hover:bg-white"
                                                >
                                                    <img src={country.flag} alt={country.name} className="w-6 h-4 mr-2" />
                                                    <span className="text-sm text-[#555]">{country.name}</span>
                                                    <span className="ml-auto text-sm text-[#555]">{country.code}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="flex flex-col mb-4">
                                    <label htmlFor="website" className="font-bold mb-2">
                                        Website <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="website"
                                        name="website"
                                        value={companyData.website}
                                        onChange={handleInputCompanyChange}
                                        className="w-full p-2 border border-[#ccc] rounded text-sm"
                                        placeholder="Nhập website"
                                    />
                                </div>

                                <div className="flex flex-col mb-4">
                                    <label htmlFor="description" className="font-bold mb-2">
                                        Sơ lược về công ty
                                    </label>
                                    <Textarea
                                        name="description"
                                        id="description"
                                        value={companyData.description}
                                        onChange={handleInputCompanyChange}
                                        className="w-full h-24 p-2 text-sm text-[#333] border rounded border-[#ddd] resize-y focus:outline-none focus:border-[#007bff] focus:shadow"
                                        placeholder="Nhập mô tả"
                                    ></Textarea>
                                </div>
                                <div className="flex flex-row gap-5">
                                    {/* Logo company */}
                                    <div className="flex flex-col mb-4 w-1/3">
                                        <label htmlFor="company-logo" className="font-bold mb-2">
                                            Logo công ty
                                        </label>
                                        <div
                                            className={`w-full h-36 border-2 border-dashed border-[#ddd] rounded bg-white flex items-center justify-center relative cursor-pointer overflow-hidden ${imageLogo ? "border-none bg-transparent" : ""}`}
                                            onDrop={handleDropLogo}
                                            onDragOver={handleDragOver}
                                        >
                                            {!imageLogo ? (
                                                <>
                                                    <p className="text-center text-[#888] text-sm">
                                                        <span className="mr-1">📤</span> Kéo Và Thả Hình Ảnh Ở Đây <span className="text-[#007bff] underline cursor-pointer">Hoặc Chọn File</span>
                                                    </p>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                                        onChange={handleFileLogoChange}
                                                    />
                                                </>
                                            ) : (
                                                <div className="relative w-full h-full flex items-center justify-center">
                                                    <img src={imageLogo} alt="Uploaded" className="w-full max-w-[580px] h-auto rounded shadow-sm transition-transform duration-300 hover:scale-105" />
                                                    <div className="absolute bottom-2 right-2 hidden group-hover:flex gap-2">
                                                        <button
                                                            className="bg-black/60 text-white px-2 py-1 text-xs rounded hover:bg-black/80"
                                                            onClick={handleDeleteLogoImage}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#888] mt-1">
                                            (Tập tin với phần mở rộng .jpg, .jpeg, .png, .gif và kích thước &lt;1MB)
                                        </p>
                                    </div>

                                    {/* Banner company */}
                                    <div className="flex-1 flex flex-col mb-4">
                                        <label htmlFor="company-banner" className="font-bold mb-2">
                                            Banner công ty
                                        </label>
                                        <div
                                            className={`w-full h-36 border-2 border-dashed border-[#ddd] rounded bg-white flex items-center justify-center relative cursor-pointer overflow-hidden ${imageBanner ? "border-none bg-transparent" : ""}`}
                                            onDrop={handleDropBanner}
                                            onDragOver={handleDragOver}
                                        >
                                            {!imageBanner ? (
                                                <>
                                                    <p className="text-center text-[#888] text-sm">
                                                        <span className="mr-1">📤</span> Kéo Và Thả Hình Ảnh Ở Đây <span className="text-[#007bff] underline cursor-pointer">Hoặc Chọn File</span>
                                                    </p>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                                        onChange={handleFileBannerChange}
                                                    />
                                                </>
                                            ) : (
                                                <div className="relative w-full h-full flex items-center justify-center">
                                                    <img src={imageBanner} alt="Uploaded" className="w-full max-w-[580px] h-auto rounded shadow-sm transition-transform duration-300 hover:scale-105" />
                                                    <div className="absolute bottom-2 right-2 hidden group-hover:flex gap-2">
                                                        <button
                                                            className="bg-black/60 text-white px-2 py-1 text-xs rounded hover:bg-black/80"
                                                            onClick={handleDeleteBannerImage}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#888] mt-1">
                                            (Tập tin với phần mở rộng .jpg, .jpeg, .png, .gif và kích thước &lt;1MB)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-end items-center p-3 pr-[35px]'>
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                type="submit"
                                className="w-28 bg-[#213A57] text-white px-6 py-2 rounded hover:bg-[#2a486b] transition"
                            >
                                {loading && (
                                    <LoaderCircle className="animate-spin mr-2" size={16} />
                                )}
                                {loading ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div >

    )
}

export default CompanyProfile;
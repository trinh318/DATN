import React, { useState, useRef, useEffect } from "react";
import UploadCV from "./UploadCV";
import axios from 'axios';
import { getId } from '../../../libs/isAuth';
import '../../../styles/applyjob.css'
import { Button, Card, CardContent, Typography, List, ListItemButton, LinearProgress } from '@mui/material';
import { useLocation, Link } from "react-router-dom";
import { FaMars, FaVenus, FaGenderless } from 'react-icons/fa';

const countryList = [
    { name: "Việt Nam", flag: "🇻🇳" },
    { name: "United States", flag: "🇺🇸" },
    { name: "Japan", flag: "🇯🇵" },
    { name: "France", flag: "🇫🇷" },
    { name: "India", flag: "🇮🇳" },
    { name: "Germany", flag: "🇩🇪" },
    { name: "Canada", flag: "🇨🇦" },
    { name: "Australia", flag: "🇦🇺" },
    { name: "South Korea", flag: "🇰🇷" },
    { name: "Brazil", flag: "🇧🇷" },
];

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


const ApplyJob = ({ job, onClose }) => {
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
        cv_files: [],
        avatar: null,
    });

    const [loading, setLoading] = useState(true); // State để kiểm tra trạng thái loading
    const [error, setError] = useState(null);
    ///////////////////////////////FORM THÔNG TIN CƠ BẢN////////////////////////
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [selectedAddress, setSelectedAddress] = useState("");
    const [currentJobTitle, setCurrentJobTitle] = useState("");
    const [isEditBasicInfoOpen, setIsEditBasicInfoOpen] = useState(false);
    const [isNotify, setIsNotify] = useState(false);  // Trạng thái hiển thị form chỉnh sửa kỹ năng
    const [isTest, setIsTest] = useState(false);  // Trạng thái hiển thị form test
    const [testCompleted, setTestCompleted] = useState(false);
    const [status, setStatus] = useState(null);

    const checkApplication = async () => {
        setLoading(true);
        setError(null);


        try {
            const response = await axios.get('http://localhost:5000/api/applications/check-application', {
                params: {
                    job_id: job._id,
                    candidate_id: getId(),
                },
            });

            setStatus(response.data);
        } catch (err) {
            console.error(err);
            setError('Không thể kiểm tra trạng thái. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkApplication();
    }, [job._id])

    // Hàm để mở form chỉnh sửa thông tin cơ bản
    const handleEditBasicInfoClick = () => {
        setIsEditBasicInfoOpen(true);
    };

    // Hàm để đóng form chỉnh sửa thông tin cơ bản
    const handleCloseBasicInfoEdit = () => {
        resetForm(); // Reset trạng thái
        setIsEditBasicInfoOpen(false); // Đóng form
    };

    const resetForm = () => {
        setLastName("");
        setFirstName("");
        setSelectedGender("");
        setEmail("");
        setPhoneNumber("");
        setSelectedCountry(countryData[0]); // Quốc gia mặc định
        setSelectedNationality(null);
        setSelectedDate("");
        setSelectedAddress("");
        setCurrentJobTitle("");
        setBreadcrumbs1([]);
        setCurrentLevel1(locations);
        setSelectedValue1("");
        setBreadcrumbs2([]);
        setCurrentLevel2(locations);
        setSelectedValue2("");
    };



    const [selectedCountry, setSelectedCountry] = useState(countryData[0]); // Quốc gia mặc định
    const [phoneNumber, setPhoneNumber] = useState(""); // Số điện thoại
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Trạng thái dropdown

    // Xử lý khi chọn quốc gia
    //const handleCountrySelect = (country) => {
    //    setSelectedCountry(country);
    //   setIsDropdownOpen(false); // Đóng dropdown sau khi chọn
    //};

    const [selectedDate, setSelectedDate] = useState(""); // Ngày được chọn
    const [isCalendarOpen, setIsCalendarOpen] = useState(false); // Trạng thái mở/đóng lịch
    const [currentMonth, setCurrentMonth] = useState(new Date()); // Tháng hiện tại

    // Lấy danh sách ngày trong tháng
    const getDaysInMonth = (month, year) => {
        const days = [];
        const date = new Date(year, month, 1);
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    // Chuyển đổi tháng
    const changeMonth = (direction) => {
        const newMonth = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + direction,
            1
        );
        setCurrentMonth(newMonth);
    };

    const handleMonthChange = (month) => {
        const newMonth = new Date(currentMonth.getFullYear(), month, 1);
        setCurrentMonth(newMonth);
    };

    const handleYearChange = (year) => {
        const newYear = new Date(year, currentMonth.getMonth(), 1);
        setCurrentMonth(newYear);
    };

    // Xử lý khi chọn ngày
    const handleDateSelect = (date) => {
        const formattedDate = date.toISOString().split("T")[0]; // Định dạng YYYY-MM-DD
        setSelectedDate(formattedDate);
        setIsCalendarOpen(false); // Đóng lịch
    };

    const [selectedGender, setSelectedGender] = useState(""); // Giới tính được chọn

    // Danh sách các lựa chọn giới tính
    const genderOptions = [
        { value: 'male', label: 'Nam', icon: <FaMars /> },
        { value: 'female', label: 'Nữ', icon: <FaVenus /> },
        { value: 'other', label: 'Khác', icon: <FaGenderless /> },
    ];

    // Xử lý khi chọn giới tính
    const handleGenderSelect = (value) => {
        setSelectedGender(value);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };
    const [selectedNationality, setSelectedNationality] = useState(null); // Quốc tịch được chọn
    const [dropdownVisible, setDropdownVisible] = useState(false); // Trạng thái mở/đóng dropdown
    const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm

    // Lọc danh sách quốc gia theo từ khóa
    //const filteredCountries = countryList.filter((country) =>
    //    country.name.toLowerCase().includes(searchTerm.toLowerCase())
    // );
    ///////////////////////////////END FORM THÔNG TIN CƠ BẢN////////////////////////
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userId = getId(); // Lấy userId từ frontend
                if (!userId) {
                    throw new Error('User ID không tồn tại');
                }

                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Token không hợp lệ hoặc đã hết hạn');
                }

                const response = await axios.get(`http://localhost:5000/api/profiles/profile/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Gửi token xác thực
                    },
                });

                setProfile(response.data); // Gán dữ liệu profile vào state

            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Failed to load profile data.');
            } finally {
                setLoading(false); // Dừng trạng thái loading
            }
        };
        checkApplication();
        fetchProfile();
    }, []);
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token'); // Lấy token từ localStorage

                // Kiểm tra nếu không có token
                if (!token) {
                    setError('Token is missing, please login again.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/users/me', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Gửi token trong header
                    },
                });

                setUser(response.data); // Lưu dữ liệu người dùng
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to fetch user data.');
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setIsDropdownOpen(false);
        setProfile((prevProfile) => ({
            ...prevProfile,
            nationality: country.countryName, // Lưu quốc gia vào profile
        }));
        setDropdownVisible(false);
    };
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axios.get(
                    `http://api.geonames.org/countryInfoJSON?formatted=true&username=ngoc141&style=full`
                );
                const countries = response.data.geonames;
                if (response.data && response.data.geonames) {
                    setCurrentLevel1(response.data.geonames); // Lưu danh sách quốc gia
                    setCurrentLevel2(response.data.geonames); // Lưu danh sách quốc gia
                    setFilteredCountries(response.data.geonames); // Lưu danh sách quốc gia đã lọc
                    console.log('Fetched countries:', response.data.geonames);
                } else {
                    console.error("No 'geonames' data in the response");
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách quốc gia", error);
            }
        };
        fetchCountries()
    }, []);

    // Trạng thái cho ô địa chỉ 1
    const [currentLevel1, setCurrentLevel1] = useState(locations); // Cấp hiện tại
    const [breadcrumbs1, setBreadcrumbs1] = useState([]); // Lưu đường dẫn đã chọn
    const [selectedValue1, setSelectedValue1] = useState(""); // Giá trị đã chọn
    const [isMenuOpen1, setIsMenuOpen1] = useState(false); // Trạng thái mở menu

    // Trạng thái cho ô địa chỉ 2
    const [currentLevel2, setCurrentLevel2] = useState(locations); // Cấp hiện tại
    const [breadcrumbs2, setBreadcrumbs2] = useState([]); // Lưu đường dẫn đã chọn
    const [selectedValue2, setSelectedValue2] = useState(""); // Giá trị đã chọn
    const [isMenuOpen2, setIsMenuOpen2] = useState(false); // Trạng thái mở menu
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [currentLevel3, setCurrentLevel3] = useState([]); // Danh sách quận/huyện
    const [selectedValue3, setSelectedValue3] = useState(""); // Quận/huyện đã chọn
    const [sampleQuestions, setSampleQuestions] = useState([]); // Danh sách câu hỏi

    const fetchCountries = async () => {
        try {
            const response = await axios.get(
                `http://api.geonames.org/countryInfoJSON?formatted=true&username=ngoc141&style=full`
            );
            const countries = response.data.geonames;
            if (response.data && response.data.geonames) {
                setCurrentLevel1(response.data.geonames); // Lưu danh sách quốc gia
                setCurrentLevel2(response.data.geonames); // Lưu danh sách quốc gia
                setFilteredCountries(response.data.geonames); // Lưu danh sách quốc gia đã lọc
                console.log('Fetched countries:', response.data.geonames);
            } else {
                console.error("No 'geonames' data in the response");
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách quốc gia", error);
        }
    };


    // Hàm lấy danh sách tỉnh/thành phố
    const fetchProvinces = async (countryId) => {
        try {
            const response = await axios.get(
                `http://api.geonames.org/childrenJSON?geonameId=${countryId}&username=ngoc141`
            );
            setCurrentLevel2(response.data.geonames); // Lưu danh sách tỉnh/thành phố
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tỉnh/thành phố", error);
        }
    };

    // Hàm lấy danh sách quận/huyện
    const fetchCities = async (provinceId) => {
        try {
            const response = await axios.get(
                `http://api.geonames.org/childrenJSON?geonameId=${provinceId}&username=ngoc141`
            );
            setCurrentLevel3(response.data.geonames); // Lưu danh sách quận/huyện
        } catch (error) {
            console.error("Lỗi khi lấy danh sách quận/huyện", error);
        }
    };

    const handleSelect1 = async (key) => {
        const selectedItem = currentLevel1.find((item) => item.geonameId === key); // Find the selected location

        if (selectedItem) {
            if (breadcrumbs1.length === 0) {
                // Selecting at the country level
                try {
                    const response = await axios.get(
                        `http://api.geonames.org/childrenJSON?geonameId=${key}&username=ngoc141`
                    );
                    setCurrentLevel1(response.data.geonames); // Get list of provinces/cities
                    setBreadcrumbs1([...breadcrumbs1, selectedItem.countryName]); // Update breadcrumbs
                } catch (error) {
                    console.error("Error fetching provinces/cities", error);
                }
            } else if (breadcrumbs1.length === 1) {
                // Selecting at the province/city level
                try {
                    const response = await axios.get(
                        `http://api.geonames.org/childrenJSON?geonameId=${key}&username=ngoc141`
                    );
                    setCurrentLevel1(response.data.geonames); // Get list of districts
                    setBreadcrumbs1([...breadcrumbs1, selectedItem.name]); // Update breadcrumbs
                } catch (error) {
                    console.error("Error fetching districts", error);
                }
            } else {
                // Selecting the final level
                const selectedLocation = [...breadcrumbs1, selectedItem.name].join(", ");
                setSelectedValue1(selectedLocation); // Save the selected value
                setProfile((prevProfile) => ({
                    ...prevProfile,
                    location: selectedLocation, // Update profile with selected location
                }));
                setIsMenuOpen1(false); // Close menu
            }
        }
    };

    const handleBack1 = async () => {
        if (breadcrumbs1.length === 2) {
            // Đang ở cấp quận/huyện, quay lại cấp tỉnh/thành phố
            const countryId = Array.isArray(currentLevel1) && currentLevel1.length > 0 ? currentLevel1[0].countryId : null; // Kiểm tra currentLevel1 là mảng
            if (countryId) {
                await fetchProvinces(countryId); // Lấy lại danh sách tỉnh/thành phố
            }
        } else if (breadcrumbs1.length === 1) {
            // Đang ở cấp tỉnh/thành phố, quay lại cấp quốc gia
            await fetchCountries(); // Lấy lại danh sách quốc gia
        }
        setBreadcrumbs1(breadcrumbs1.slice(0, -1)); // Xóa cấp cuối khỏi breadcrumbs
    };


    const toggleMenu1 = () => {
        setIsMenuOpen1(!isMenuOpen1);
    };

    const handleSelect2 = async (key) => {
        const selectedItem = currentLevel2.find((item) => item.geonameId === key); // Find the selected location for button 2

        if (selectedItem) {
            if (breadcrumbs2.length === 0) {
                // Selecting at the country level
                try {
                    const response = await axios.get(
                        `http://api.geonames.org/childrenJSON?geonameId=${key}&username=ngoc141`
                    );
                    setCurrentLevel2(response.data.geonames || []); // Ensure it's an array
                    setBreadcrumbs2([...breadcrumbs2, selectedItem.countryName]); // Update breadcrumbs
                } catch (error) {
                    console.error("Error fetching provinces/cities for button 2", error);
                }
            } else if (breadcrumbs2.length === 1) {
                // Selecting at the province/city level
                try {
                    const response = await axios.get(
                        `http://api.geonames.org/childrenJSON?geonameId=${key}&username=ngoc141`
                    );
                    setCurrentLevel2(response.data.geonames || []); // Ensure it's an array
                    setBreadcrumbs2([...breadcrumbs2, selectedItem.name]); // Update breadcrumbs
                } catch (error) {
                    console.error("Error fetching districts for button 2", error);
                }
            } else {
                // Selecting the final level
                const selectedLocation = [...breadcrumbs2, selectedItem.name].join(", ");
                setSelectedValue2(selectedLocation); // Save the selected value for button 2
                setProfile((prevProfile) => ({
                    ...prevProfile,
                    desired_work_location: selectedLocation, // Update profile with selected location for button 2
                }));
                setIsMenuOpen2(false); // Close menu for button 2
            }
        }
    };


    const handleBack2 = async () => {
        if (breadcrumbs2.length === 2) {
            // Đang ở cấp quận/huyện, quay lại cấp tỉnh/thành phố
            const countryId = Array.isArray(currentLevel2) && currentLevel2.length > 0 ? currentLevel2[0].countryId : null; // Kiểm tra currentLevel1 là mảng
            if (countryId) {
                await fetchProvinces(countryId); // Lấy lại danh sách tỉnh/thành phố
            }
        } else if (breadcrumbs2.length === 1) {
            // Đang ở cấp tỉnh/thành phố, quay lại cấp quốc gia
            await fetchCountries(); // Lấy lại danh sách quốc gia
        }
        setBreadcrumbs2(breadcrumbs2.slice(0, -1)); // Xóa cấp cuối khỏi breadcrumbs
    };

    const toggleMenu2 = () => {
        setIsMenuOpen2(!isMenuOpen2);
    };

    const fetchTestDetails = async (testId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/tests/edit/${testId}`);
            const testDetails = response.data;
            console.log('Thông tin bài kiểm tra:', testDetails);
            return testDetails; // Trả về để xử lý tiếp
        } catch (error) {
            console.error('Lỗi khi lấy thông tin bài kiểm tra:', error);
            alert('Không thể lấy thông tin bài kiểm tra');
            return null; // Trả về null nếu có lỗi
        }
    };
    const [testDetails, setTestDetails] = useState(null);
    const [testId, setTestId] = useState(null);
    const handleSave = async () => {
        try {

            const idnd = getId(); // Lấy user ID từ hàm getId
            const data = { ...profile, user_id: idnd }; // Gắn user ID vào profile
            const response = await axios.post('http://localhost:5000/api/profiles/profile', data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Gửi token xác thực
                },
            });

            if (response.data.success) {
                console.log('Profile saved successfully!');
                try {
                    // Lấy thông tin công việc từ API
                    const jobResponse = await axios.get(`http://localhost:5000/api/jobs/${job._id}`);
                    const jobdata = jobResponse.data;
                    console.log('Thông tin công việc:', jobdata);

                    if (jobdata.test) {
                        const testDetail = await fetchTestDetails(jobdata.test);
                        const id = testDetail.test_id;
                        setTestDetails(testDetail);
                        setTestId(id)
                        console.log("thong tin bai ktra", testDetail);
                        // Nếu công việc có bài kiểm tra, mở thông báo
                        handleOpenNotify();
                    } else {
                        console.log('Không có bài test');
                        handleApply(); // Nếu không có bài kiểm tra, thực hiện apply
                    }
                } catch (jobError) {
                    console.error('Thông báo:', jobError);
                    alert('Không thể tìm thấy thông tin công việc!.');
                }
            } else {
                alert(`Failed to save profile: ${response.data.message}`);
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
        }
    };

    const handleApply = async () => {
        try {
            const token = localStorage.getItem('token');

            if (token == null) {
                alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }

            if (!job || !job._id) {  // Ensure job and job_id are available
                alert('Thông tin công việc không hợp lệ.');
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/api/applications',
                { job_id: job._id }, // Only send job_id
                {
                    headers: { Authorization: `Bearer ${token}` } // Authorization header with token
                }
            );

            if (response.status === 201) {
                alert('Đã nộp đơn ứng tuyển thành công!');
                onClose(); // Close the modal or trigger any other necessary action after successful application
            } else if (response.status === 401) {
                alert('Bạn cần đăng nhập để ứng tuyển');
            }

        } catch (err) {
            console.error('Error applying for job:', err);

            if (err.response && err.response.data && err.response.data.message) {
                alert(err.response.data.message); // Display error message from response
            } else {
                alert('Đã có lỗi xảy ra, vui lòng thử lại.'); // Generic error message
            }
        }
    };

    // Hàm để mở form thông báo có test
    const handleOpenNotify = () => {
        setIsNotify(true);
    };

    // Hàm để đóng form thông báo có test
    const handleCloseNotify = () => {
        setIsNotify(false);  // Đóng form
    };

    const handleStartTest = () => {
        setIsNotify(false); // Ẩn notify
        onClose(); // Gọi closeApplyForm để đóng ApplyJob

        // Mở tab mới với URL test
        const url = `/applicants/apply-job/doing-test?testId=${testDetails.test_id}&jobId=${job._id}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            {status?.applied ? (
                <form className="w-full max-w-[500px] bg-white p-4 rounded shadow">
                    <div className="mb-4">
                        <div className="flex items-start justify-between">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Bạn đã ứng tuyển công việc này.
                            </h2>
                            <button
                                type="button"
                                onClick={() => {
                                    handleCloseBasicInfoEdit();
                                    onClose();
                                }}
                                className="text-gray-500 hover:text-red-600 text-2xl leading-none"
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                </form>

            ) : (
                <>
                    <div class="bg-white rounded-lg w-[780px] max-w-[780px] min-w-[400px] shadow-md flex flex-col h-[80%] overflow-hidden">
                        {/* Header */}
                        <div className="sticky top-0 z-20 bg-white px-5 pt-5 border-b border-gray-300">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-semibold text-gray-800">Kiểm tra lại thông tin cá nhân</h2>
                                <button
                                    className="text-2xl text-gray-600 hover:text-black cursor-pointer"
                                    onClick={() => { handleCloseBasicInfoEdit(); onClose(); }}>
                                    &times;
                                </button>
                            </div>
                        </div>

                        {/* Nội dung Form */}
                        <form className="flex-1 overflow-y-auto p-5 border-b border-gray-200 mb-5 space-y-4">
                            {profile && (
                                <div className='flex'>
                                    <div className="w-[150px] h-[150px] rounded-full border-2 bg-gray-200 flex justify-center items-center cursor-pointer overflow-hidden transition-colors border-dashed border-gray-300 duration-300 hover:border-blue-500 active:border-blue-700"> {<img src={user?.avatar} className="object-cover" alt="Avatar" />}</div>
                                    <div className='flex-1 ml-8 flex flex-col gap-6'>
                                        <UploadCV />
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-5" >
                                <div className="flex flex-col">
                                    <label htmlFor="lastName" className="font-bold mb-2">
                                        Họ <span className="user-info-edit-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="first_name"
                                        placeholder="Nhập họ"
                                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        value={profile.first_name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="firstName" className="font-bold mb-2">
                                        Tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="last_name"
                                        placeholder="Nhập tên"
                                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        value={profile.last_name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="flex flex-col">
                                    <label className="font-bold mb-2">
                                        Giới tính <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-3">
                                        {genderOptions.map((option) => (
                                            <div
                                                key={option.value}
                                                onClick={() => handleGenderSelect(option.value)}
                                                className={`flex flex-row items-center flex-1 p-2 rounded border ${profile.gender === option.value
                                                    ? 'border-blue-500 bg-blue-100 text-blue-600'
                                                    : 'border-gray-300 bg-gray-100'
                                                    } cursor-pointer hover:border-blue-400 transition`}
                                            >
                                                <span className="text-sm">{option.icon}</span>
                                                <span className="text-sm">{option.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="email" className="font-bold mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Nhập email"
                                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        value={profile.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="user-info-edit-col">
                                <div className="phone-input-container">
                                    <label htmlFor="phone" className="user-info-edit-label">
                                        Điện thoại <span className="user-info-edit-required">*</span>
                                    </label>
                                    {/* Ô nhập điện thoại */}
                                    <div className="phone-input">
                                        {/* Selectbox đầu số quốc gia */}
                                        <div
                                            className="country-select"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        >
                                            <img src={selectedCountry.flag} alt={selectedCountry.name} />
                                            <span>{selectedCountry.code}</span>
                                            <span className="dropdown-arrow">&#9662;</span>
                                        </div>

                                        {/* Input số điện thoại */}
                                        <input
                                            type="text"
                                            placeholder="Nhập số điện thoại"
                                            value={profile.phone}
                                            id="phone"
                                            name="phone"
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    {/* Dropdown danh sách quốc gia */}
                                    {isDropdownOpen && (
                                        <ul className="country-dropdown">
                                            {countryData.map((country) => (
                                                <li
                                                    key={country.code}
                                                    onClick={() => handleCountrySelect(country)}
                                                    className="country-item"
                                                >
                                                    <img src={country.flag} alt={country.name} />
                                                    <span>{country.name}</span>
                                                    <span>{country.code}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="nationality-select-container">
                                    <label htmlFor="nationality" className="user-info-edit-label">
                                        Quốc tịch <span className="user-info-edit-required">*</span>
                                    </label>
                                    {/* Ô hiển thị quốc tịch */}
                                    <div className="nationality-select-input" onClick={() => setDropdownVisible(!dropdownVisible)}>
                                        {selectedCountry ? (
                                            <div className="selected-country">
                                                <span className="country-name">
                                                    {selectedCountry.countryName === profile.nationality ? selectedCountry.countryName : profile.nationality}
                                                </span> {/* Hiển thị tên quốc gia */}
                                            </div>
                                        ) : (
                                            "Chọn quốc tịch" // Nếu chưa chọn quốc gia, hiển thị text mặc định
                                        )}
                                    </div>

                                    {/* Dropdown quốc tịch */}
                                    {dropdownVisible && (
                                        <div className="nationality-dropdown">
                                            {/* Thanh tìm kiếm */}
                                            <input
                                                type="text"
                                                placeholder="Tìm quốc gia..."
                                                className="search-nationality-input"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />

                                            {/* Danh sách quốc gia */}
                                            <div className="country-list">
                                                {filteredCountries.map((country) => (
                                                    <div
                                                        key={country.countryCode} // Mã quốc gia hoặc mã của quốc gia
                                                        className="country-item"
                                                        onClick={() => handleCountrySelect(country)} // Gọi hàm khi chọn quốc gia
                                                    >
                                                        <span className="country-flag">{country.flag}</span>
                                                        <span className="country-name">{country.countryName}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5 mb-6">
                                {/* Date Picker */}
                                <div className="flex flex-col relative">
                                    <label htmlFor="date_of_birth" className="font-bold mb-2">
                                        Ngày sinh <span className="text-red-500">*</span>
                                    </label>
                                    <div
                                        className="border border-gray-300 rounded-md px-4 py-2 bg-white text-sm cursor-pointer hover:border-blue-500"
                                        name="date_of_birth"
                                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                    >
                                        {selectedDate ||
                                            (profile.date_of_birth && !isNaN(new Date(profile.date_of_birth).getTime()))
                                            ? new Date(profile.date_of_birth).toLocaleDateString()
                                            : "Chọn ngày sinh"}
                                    </div>

                                    {isCalendarOpen && (
                                        <div className="absolute z-50 top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-2 p-3">
                                            {/* Calendar Header */}
                                            <div className="flex justify-between items-center mb-2">
                                                <button
                                                    type="button"
                                                    onClick={() => changeMonth(-1)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    &lt;
                                                </button>

                                                <span className="flex gap-2">
                                                    {/* Month Select */}
                                                    <select
                                                        value={currentMonth.getMonth()}
                                                        onChange={(e) => handleMonthChange(Number(e.target.value))}
                                                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                    >
                                                        {Array.from({ length: 12 }).map((_, index) => (
                                                            <option key={index} value={index}>
                                                                {new Date(0, index).toLocaleString("default", { month: "long" })}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {/* Year Select */}
                                                    <select
                                                        value={currentMonth.getFullYear()}
                                                        onChange={(e) => handleYearChange(Number(e.target.value))}
                                                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                    >
                                                        {Array.from({ length: 1001 }).map((_, index) => {
                                                            const year = currentMonth.getFullYear() - 500 + index;
                                                            return (
                                                                <option key={year} value={year}>
                                                                    {year}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => changeMonth(1)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    &gt;
                                                </button>
                                            </div>

                                            {/* Calendar Days */}
                                            <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600 mb-1">
                                                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                                                    <div key={day}>{day}</div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                                {getDaysInMonth(currentMonth.getMonth(), currentMonth.getFullYear()).map((date) => (
                                                    <div
                                                        key={date}
                                                        className="w-9 h-9 flex items-center justify-center cursor-pointer rounded hover:bg-blue-500 hover:text-white transition"
                                                        onClick={() => handleDateSelect(date)}
                                                    >
                                                        {date.getDate()}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Address Select */}
                                <div className="flex flex-col relative">
                                    <label htmlFor="specific_address" className="font-bold mb-2">
                                        Địa chỉ <span className="text-red-500">*</span>
                                    </label>
                                    <div
                                        id="specific_address"
                                        name="specific_address"
                                        onClick={toggleMenu1}
                                        className="border border-gray-300 rounded-md px-4 py-2 text-sm bg-white cursor-pointer hover:border-blue-500"
                                    >
                                        {profile.location || "Chọn địa điểm"}
                                    </div>

                                    {isMenuOpen1 && (
                                        <div className="absolute z-50 top-full left-0 w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg">
                                            <div className="flex items-center gap-2 px-4 py-2 border-b bg-gray-100 text-sm font-medium">
                                                {breadcrumbs1.length > 0 && (
                                                    <button
                                                        className="text-blue-500 hover:text-blue-700"
                                                        onClick={handleBack1}
                                                    >
                                                        &lt;
                                                    </button>
                                                )}
                                                <span className="truncate">
                                                    {breadcrumbs1.join(", ") || "Chọn địa điểm"}
                                                </span>
                                            </div>
                                            <ul className="max-h-60 overflow-y-auto text-sm">
                                                {Array.isArray(currentLevel1) && currentLevel1.length > 0 ? (
                                                    currentLevel1.map((item) => (
                                                        <li
                                                            key={item.geonameId}
                                                            onClick={() => handleSelect1(item.geonameId)}
                                                            className="px-4 py-2 cursor-pointer hover:bg-blue-50 border-b last:border-none"
                                                        >
                                                            {item.name || item.countryName}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="px-4 py-2 text-gray-500">No locations available</li>
                                                )}
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
                                    name="specific_address"
                                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Nhập địa chỉ cụ thể"
                                    value={profile.specific_address}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex flex-col mb-4">
                                <label htmlFor="job_title" className="font-bold mb-2">
                                    Chức danh <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="job_title"
                                    name="job_title"
                                    placeholder="Nhập chức danh"
                                    value={profile.job_title}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <div className="flex flex-col mb-4">
                                <label htmlFor="level" className="font-bold mb-2">
                                    Cấp bậc hiện tại <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="level"
                                    name="job_level"
                                    value={profile.job_level || ''}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option>Chọn cấp bậc</option>
                                    <option value="Trưởng phòng">Trưởng phòng</option>
                                    <option value="Nhân viên">Nhân viên</option>
                                    <option value="Thực tập sinh">Thực tập sinh</option>
                                </select>
                            </div>

                            {/* Ngành nghề & Lĩnh vực */}
                            <div className="grid grid-cols-2 gap-5 mb-6">
                                <div className="flex flex-col">
                                    <label htmlFor="industry" className="font-bold mb-2">
                                        Ngành nghề hiện tại <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="industry"
                                        name="current_industry"
                                        value={profile.current_industry || ''}
                                        onChange={handleInputChange}
                                        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        <option>Chọn ngành nghề</option>
                                        <option value="IT">IT</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Giáo dục">Giáo dục</option>
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label htmlFor="field" className="font-bold mb-2">
                                        Lĩnh vực hiện tại <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="field"
                                        name="current_field"
                                        value={profile.current_field || ''}
                                        onChange={handleInputChange}
                                        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        <option>Chọn lĩnh vực công ty</option>
                                        <option value="Công nghệ">Công nghệ</option>
                                        <option value="Giáo dục">Giáo dục</option>
                                        <option value="Kinh doanh">Kinh doanh</option>
                                    </select>
                                </div>
                            </div>

                            {/* Kinh nghiệm & Lương hiện tại */}
                            <div className="grid grid-cols-2 gap-5 mb-6">
                                <div className="flex flex-col mb-4">
                                    <label htmlFor="experience" className="font-bold mb-2">
                                        Số Năm Kinh Nghiệm <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center border border-gray-300 rounded px-3 py-2">
                                        <input
                                            type="number"
                                            id="experience"
                                            name="years_of_experience"
                                            placeholder="Nhập số năm kinh nghiệm"
                                            value={profile.years_of_experience}
                                            onChange={handleInputChange}
                                            className="flex-1 outline-none text-sm"
                                        />
                                        <span className="text-sm text-gray-600 ml-2 whitespace-nowrap">Năm</span>
                                    </div>
                                </div>

                                <div className="flex flex-col mb-4">
                                    <label htmlFor="current_salary" className="font-bold mb-2">
                                        Mức lương hiện tại
                                    </label>
                                    <div className="flex items-center border border-gray-300 rounded px-3 py-2">
                                        <input
                                            type="text"
                                            id="current_salary"
                                            name="current_salary"
                                            value={profile.current_salary}
                                            onChange={handleInputChange}
                                            className="flex-1 outline-none text-sm"
                                            placeholder=""
                                        />
                                        <span className="text-sm text-gray-600 ml-2 whitespace-nowrap">USD/tháng</span>
                                    </div>
                                </div>
                            </div>

                            {/* Nơi làm việc mong muốn & Lương mong muốn */}
                            <div className="grid grid-cols-2 gap-5">
                                <div className="flex flex-col relative">
                                    <label htmlFor="desired_work_location" className="font-bold mb-2">
                                        Nơi làm việc mong muốn
                                    </label>
                                    <div
                                        id="desired_work_location"
                                        name="desired_work_location"
                                        onClick={toggleMenu2}
                                        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white cursor-pointer hover:border-blue-500"
                                    >
                                        {profile.desired_work_location || "Chọn địa điểm"}
                                    </div>

                                    {isMenuOpen2 && (
                                        <div className="absolute z-50 top-full left-0 mt-2 w-full bg-white border border-gray-300 rounded shadow-lg">
                                            <div className="flex items-center gap-2 px-4 py-2 border-b bg-gray-100 text-sm font-medium">
                                                {breadcrumbs2.length > 0 && (
                                                    <button
                                                        className="text-blue-500 hover:text-blue-700"
                                                        onClick={handleBack2}
                                                    >
                                                        &lt;
                                                    </button>
                                                )}
                                                <span>{breadcrumbs2.join(", ") || "Chọn địa điểm"}</span>
                                            </div>
                                            <ul className="max-h-60 overflow-y-auto text-sm">
                                                {currentLevel2.map((item) => (
                                                    <li
                                                        key={item.geonameId}
                                                        onClick={() => handleSelect2(item.geonameId)}
                                                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 border-b last:border-none"
                                                    >
                                                        {item.name || item.countryName}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col mb-4">
                                    <label htmlFor="desired_salary" className="font-bold mb-2">
                                        Mức lương mong muốn
                                    </label>
                                    <div className="flex items-center border border-gray-300 rounded px-3 py-2">
                                        <input
                                            type="text"
                                            id="desired_salary"
                                            name="desired_salary"
                                            value={profile.desired_salary}
                                            onChange={handleInputChange}
                                            className="flex-1 outline-none text-sm"
                                            placeholder=""
                                        />
                                        <span className="text-sm text-gray-600 ml-2 whitespace-nowrap">USD/tháng</span>
                                    </div>
                                </div>
                            </div>

                        </form>

                        {/* Footer (Save/Cancel) */}
                        <div className="flex justify-end px-5 pb-5">
                            <button onClick={() => { handleSave(); handleCloseBasicInfoEdit(); }} className="bg-[#5a8cb5] text-white px-5 py-2 rounded mr-2 hover:bg-blue-700 transition" type="submit">
                                Ứng tuyển
                            </button>
                            <button className="bg-gray-300 text-black px-5 py-2 rounded w-[100px] hover:bg-gray-400 transition" type="button" onClick={() => { handleCloseBasicInfoEdit(); onClose(); }}>
                                Hủy
                            </button>
                        </div>

                        {isNotify && (
                            <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                                    <form>
                                        <label className="block text-gray-800 text-base font-medium mb-4">
                                            Công việc này yêu cầu làm bài test trước khi ứng tuyển
                                        </label>
                                        <div className="flex justify-end gap-4">
                                            <button
                                                type="button"
                                                onClick={handleCloseNotify}
                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleStartTest}
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                            >
                                                Bắt đầu ngay
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div >
    )
}
export default ApplyJob;

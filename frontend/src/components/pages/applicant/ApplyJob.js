import React, { useState, useRef, useEffect } from "react";
import UploadCV from "./UploadCV";
import axios from 'axios';
import { getId } from '../../../libs/isAuth';
import '../../../styles/applyjob.css'
import { Button, Card, CardContent, Typography, List, ListItemButton, LinearProgress } from '@mui/material';
import { useLocation, Link } from "react-router-dom";

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

    // Xử lý khi chọn ngày
    const handleDateSelect = (date) => {
        const formattedDate = date.toISOString().split("T")[0]; // Định dạng YYYY-MM-DD
        setSelectedDate(formattedDate);
        setIsCalendarOpen(false); // Đóng lịch
    };

    const [selectedGender, setSelectedGender] = useState(""); // Giới tính được chọn

    // Danh sách các lựa chọn giới tính
    const genderOptions = [
        { label: "Nam", value: "male", icon: "👨" },
        { label: "Nữ", value: "female", icon: "👩" },
        { label: "Khác", value: "other", icon: "🌈" },
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
    const startTest = (testDetails) => {
        setSampleQuestions(testDetails.questions); // Gắn danh sách câu hỏi
        setQnIndex(0); // Bắt đầu từ câu hỏi đầu tiên
        setIsTest(true); // Hiển thị giao diện bài kiểm tra
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

    /////////////////form test
    const [qnIndex, setQnIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(testDetails?.duration * 60); // Thời gian còn lại tính bằng giây
    const [isTestOver, setIsTestOver] = useState(false);
    const [isTestStarted, setIsTestStarted] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const handleStartTest = () => {
        setStartTime(new Date());
        setIsNotify(false);  // Đóng form
        setSampleQuestions(testDetails.questions); // Gán danh sách câu hỏi từ bài kiểm tra
        setQnIndex(0); // Bắt đầu từ câu hỏi đầu tiên
        setIsTest(true);
        setIsTestStarted(true);
        setIsTestOver(false);
        console.log({ isTest, isNotify });
        console.log(" thoi gian", testDetails?.duration)
    }

    useEffect(() => {
        // Nếu bài kiểm tra chưa bắt đầu hoặc thời gian còn lại <= 0, không làm gì cả
        if (!isTestStarted || timeLeft <= 0) return;

        // Khởi tạo interval để đếm ngược mỗi giây
        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer); // Dừng bộ đếm khi hết thời gian
                    setIsTestOver(true); // Đánh dấu bài kiểm tra đã kết thúc
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000); // Cập nhật mỗi giây

        // Dọn dẹp khi component unmount hoặc khi bài kiểm tra kết thúc
        return () => clearInterval(timer);
    }, [isTestStarted, timeLeft]); // Chạy lại khi test bắt đầu hoặc timeLeft thay đổi

    // Chuyển đổi thời gian còn lại sang phút và giây
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    /*const sampleQuestions = [
        {
            qnInWords: "What is the capital of France?",
            options: ["Paris", "Berlin", "Rome", "Madrid"],
        },
        {
            qnInWords: "Which is the largest planet in the solar system?",
            options: ["Earth", "Jupiter", "Mars", "Saturn"],
        },
        {
            qnInWords: "What is the chemical symbol for water?",
            options: ["H2O", "O2", "NaCl", "CO2"],
        },
        {
            qnInWords: "Who wrote 'To Kill a Mockingbird'?",
            options: ["Harper Lee", "J.K. Rowling", "Mark Twain", "Ernest Hemingway"],
        },
        {
            qnInWords: "What is the square root of 64?",
            options: ["6", "7", "8", "9"],
        },
   // ];*/

    const handleNextQuestion = () => {
        if (qnIndex < sampleQuestions.length - 1) {
            setQnIndex(qnIndex + 1); // Chuyển sang câu hỏi tiếp theo
        } else {
            alert('Bạn đã hoàn thành bài kiểm tra!');
            setIsTest(false); // Kết thúc bài kiểm tra

        }
    };

    const [answers, setAnswers] = useState([]);  // Mảng lưu câu trả lời
    const [finalScore, setFinalScore] = useState(0); // State lưu điểm số cuối cùng
    const handleOptionSelect = (selectedAnswer) => {
        setAnswers(prevAnswers => {
            const updatedAnswers = [...prevAnswers];
            updatedAnswers[qnIndex] = selectedAnswer;  // Lưu giá trị đáp án thay vì chỉ số
            return updatedAnswers;
        });

        // In ra câu trả lời được chọn trong console
        console.log(`Selected Answer for Question ${qnIndex + 1}: ${selectedAnswer}`);
    };

    const calculateScore = () => {
        let score = 0;

        // Loop through each question and compare the selected answer with the correct answer
        answers.forEach((selectedAnswer, index) => {
            const question = sampleQuestions[index];  // Get the question object
            if (question.correct_answer === selectedAnswer) {
                score += question.points;  // Add points if the answer is correct
            }
        });

        return score;
    };
    const [score, setScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const handleFinishTest = async () => {
        const userId = getId();
        const finalScore = calculateScore();
        const questionScores = testDetails.questions.map(question => question.points);  // mảng chứa điểm của từng câu hỏi
        const totalScores = questionScores.reduce((total, score) => total + score, 0);  // Tính tổng điểm từ mảng questionScores
        setTotalScore(totalScores);


        try {
            const response = await axios.post('http://localhost:5000/api/testattempt', {
                test_id: testDetails.test_id,
                user_id: userId,
                answers: answers,
                score: finalScore,  // Assuming you have a function to calculate the score
                start_time: startTime,
                end_time: new Date(),
            });
            console.log('Test Attempt saved:', response.data);
            setIsTest(false);
            setScore(finalScore);
            setTestCompleted(true);
        } catch (error) {
            console.error('Error saving test attempt:', error);
        }
    };
    const handleCancel = () => {

        setTestCompleted(false);
    };
    ///////end form test

    return (
        <div className="user-info-edit-overlay">
            {status?.applied ? (
                <form className="user-info-edit-form" style={{ "max-width": "500px" }}>
                    <div className="user-info-edit-header-form">
                        <div className="user-info-edit-header">
                            <h2>Bạn đã ứng tuyển công việc này.</h2>
                            <button className="user-info-edit-close-btn" onClick={() => { handleCloseBasicInfoEdit(); onClose(); }}>
                                &times;
                            </button>
                        </div>
                    </div>
                </form>

            ) : (
                <>
                    <div className="user-info-edit-container">
                        {/* Header */}
                        <div className="user-info-edit-header-form">
                            <div className="user-info-edit-header">
                                <h2>Thông Tin Cơ Bản</h2>
                                <button className="user-info-edit-close-btn" onClick={() => { handleCloseBasicInfoEdit(); onClose(); }}>
                                    &times;
                                </button>
                            </div>
                        </div>

                        {/* Nội dung Form */}
                        <form className="user-info-edit-form">
                            {profile && (
                                <div className='user-info-edit-basic-info'>
                                    <div className="user-info-avatar"> {<img src={user?.avatar} alt="Avatar" />}</div>
                                    <div className='user-info-edit-right'>
                                        <UploadCV />
                                        <div className="user-info-edit-row" style={{ margin: "16px 0px 16px;" }} >
                                            <div className="user-info-edit-col">
                                                <div className="user-info-edit-row">
                                                    <label htmlFor="lastName" className="user-info-edit-label">
                                                        Họ <span className="user-info-edit-required">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="lastName"
                                                        name="first_name"
                                                        className="user-info-edit-input"
                                                        placeholder="Nhập họ"
                                                        value={profile.first_name}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="user-info-edit-row">
                                                    <label htmlFor="firstName" className="user-info-edit-label">
                                                        Tên <span className="user-info-edit-required">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="firstName"
                                                        name="last_name"
                                                        className="user-info-edit-input"
                                                        placeholder="Nhập tên"
                                                        value={profile.last_name}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="user-info-edit-col">
                                            <div className="gender-select-container">
                                                <label htmlFor="gender" className="user-info-edit-label">
                                                    Giới tính <span className="user-info-edit-required">*</span>
                                                </label>
                                                <div className="gender-options">
                                                    {genderOptions.map((option) => (
                                                        <div
                                                            key={option.value}
                                                            className={`gender-option  ${profile.gender === option.value ? "selected" : ""}
                                            }`}
                                                            onClick={() => handleGenderSelect(option.value)}
                                                        >
                                                            <div>
                                                                <span className="gender-icon">{option.icon}</span>
                                                                <span className="gender-label">{option.label}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="user-info-edit-row">
                                                <label htmlFor="email" className="user-info-edit-label">
                                                    Email <span className="user-info-edit-required">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    className="user-info-edit-input"
                                                    placeholder="Nhập email"
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
                                    </div>
                                </div>
                            )}
                            <div className="user-info-edit-col-bigger">
                                <div className="date-picker-container">
                                    <label htmlFor="email" className="user-info-edit-label">
                                        Ngày sinh <span className="user-info-edit-required">*</span>
                                    </label>
                                    {/* Ô nhập ngày sinh */}
                                    <div
                                        className="date-picker-input"
                                        name="date_of_birth"
                                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                    >
                                        {selectedDate || (profile.date_of_birth && !isNaN(new Date(profile.date_of_birth).getTime()))
                                            ? new Date(profile.date_of_birth).toLocaleDateString()
                                            : "Chọn ngày sinh"}
                                    </div>

                                    {/* Lịch chọn ngày */}
                                    {isCalendarOpen && (
                                        <div className="calendar-dropdown">
                                            {/* Header lịch */}
                                            <div className="calendar-header">
                                                <button onClick={() => changeMonth(-1)}>&lt;</button>
                                                <span>
                                                    {currentMonth.toLocaleString("default", {
                                                        month: "long",
                                                        year: "numeric"
                                                    })}
                                                </span>
                                                <button onClick={() => changeMonth(1)}>&gt;</button>
                                            </div>

                                            {/* Danh sách ngày */}
                                            <div className="calendar-grid">
                                                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                                                    <div key={day} className="calendar-day-name">
                                                        {day}
                                                    </div>
                                                ))}
                                                {getDaysInMonth(
                                                    currentMonth.getMonth(),
                                                    currentMonth.getFullYear()
                                                ).map((date) => (
                                                    <div
                                                        key={date}
                                                        className="calendar-day"
                                                        onClick={() => handleDateSelect(date)}
                                                    >
                                                        {date.getDate()}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="user-info-edit-selectbox">
                                    <label htmlFor="address-selected" className="user-info-edit-label">
                                        Địa chỉ <span className="user-info-edit-required">*</span>
                                    </label>
                                    <div className="user-info-edit-select-display" onClick={toggleMenu1}>
                                        {profile.location || "Chọn địa điểm"}
                                    </div>
                                    {isMenuOpen1 && (
                                        <div className="user-info-edit-menu">
                                            <div className="user-info-edit-breadcrumbs">
                                                {breadcrumbs1.length > 0 && (
                                                    <button onClick={handleBack1}>&lt;</button>
                                                )}
                                                <span>{breadcrumbs1.join(", ") || "Chọn địa điểm"}</span>
                                            </div>
                                            <ul className="user-info-edit-options">
                                                {Array.isArray(currentLevel1) && currentLevel1.length > 0 ? (
                                                    currentLevel1.map((item) => (
                                                        <li
                                                            key={item.geonameId}
                                                            onClick={() => handleSelect1(item.geonameId)}
                                                            className="user-info-edit-option"
                                                        >
                                                            {item.name || item.countryName}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="user-info-edit-option">No locations available</li>
                                                )}
                                            </ul>

                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="user-info-edit-row">
                                <label htmlFor="address" className="user-info-edit-label">
                                    Địa chỉ cụ thể <span className="user-info-edit-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="specific_address"
                                    name="specific_address"
                                    className="user-info-edit-input"
                                    placeholder="Nhập chức danh"
                                    value={profile.specific_address}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="user-info-edit-row">
                                <label htmlFor="title" className="user-info-edit-label">
                                    Chức danh <span className="user-info-edit-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="job_title"
                                    name="job_title"
                                    className="user-info-edit-input"
                                    placeholder="Nhập chức danh"
                                    value={profile.job_title}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="user-info-edit-row">
                                <label htmlFor="level" className="user-info-edit-label">
                                    Cấp bậc hiện tại <span className="user-info-edit-required">*</span>
                                </label>
                                <select id="level"
                                    name="job_level"
                                    value={profile.job_level || ''}
                                    onChange={handleInputChange}
                                    className="user-info-edit-select">
                                    <option value="">Chọn cấp bậc</option>
                                    <option value="Trưởng phòng">Trưởng phòng</option>
                                    <option value="Nhân viên">Nhân viên</option>
                                    <option value="Thực tập sinh">Thực tập sinh</option>
                                </select>
                            </div>

                            <div className="user-info-edit-col">
                                <div className="user-info-edit-row">
                                    <label htmlFor="industry" className="user-info-edit-label">
                                        Ngành nghề hiện tại <span className="user-info-edit-required">*</span>
                                    </label>
                                    <select select id="industry"
                                        name="current_industry"
                                        value={profile.current_industry || ''}
                                        onChange={handleInputChange}
                                        className="user-info-edit-select">
                                        <option value="">Chọn ngành nghề</option>
                                        <option value="IT">IT</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Giáo dục">Giáo dục</option>
                                    </select>
                                </div>
                                <div className="user-info-edit-row">
                                    <label htmlFor="field" className="user-info-edit-label">
                                        Lĩnh vực hiện tại <span className="user-info-edit-required">*</span>
                                    </label>
                                    <select select id="field"
                                        value={profile.current_field || ''}
                                        name="current_field"
                                        onChange={handleInputChange}
                                        className="user-info-edit-select">
                                        <option value="">Chọn lĩnh vực công ty</option>
                                        <option value="Công nghệ">Công nghệ</option>
                                        <option value="Giáo dục">Giáo dục</option>
                                        <option value="Kinh doanh">Kinh doanh</option>
                                    </select>
                                </div>
                            </div>

                            <div className="user-info-edit-col">
                                <div className="user-info-edit-row">
                                    <label htmlFor="experience" className="user-info-edit-label">
                                        Số Năm Kinh Nghiệm <span className="user-info-edit-required">*</span>
                                    </label>
                                    <div className="user-info-edit-input-group">
                                        <input
                                            ttype="number"
                                            id="experience"
                                            name="years_of_experience"
                                            className="user-info-edit-inputt"
                                            placeholder="Nhập số năm kinh nghiệm"
                                            value={profile.years_of_experience}
                                            onChange={handleInputChange}
                                        />
                                        <span className="user-info-edit-unit">Năm</span>
                                    </div>
                                </div>

                                <div className="user-info-edit-row">
                                    <label htmlFor="salary" className="user-info-edit-label">
                                        Mức lương hiện tại
                                    </label>
                                    <div className="user-info-edit-input-group">
                                        <input
                                            type="text"
                                            id="current_salary"
                                            name="current_salary"
                                            className="user-info-edit-inputt"
                                            placeholder=""
                                            value={profile.current_salary}
                                            onChange={handleInputChange}
                                        />
                                        <span className="user-info-edit-unit">USD/tháng</span>
                                    </div>
                                </div>
                            </div>

                            <div className="user-info-edit-col">
                                <div className="user-info-edit-selectbox">
                                    <label htmlFor="workaddress" className="user-info-edit-label">
                                        Nơi làm việc mong muốn
                                    </label>
                                    <div
                                        className="user-info-edit-select-display"
                                        id="desired_work_location"
                                        name="desired_work_location"
                                        onClick={toggleMenu2}
                                    >
                                        {profile.desired_work_location || "Chọn địa điểm"}
                                    </div>
                                    {isMenuOpen2 && (
                                        <div className="user-info-edit-menu">
                                            <div className="user-info-edit-breadcrumbs">
                                                {breadcrumbs2.length > 0 && (
                                                    <button onClick={handleBack2}>&lt;</button>
                                                )}
                                                <span>{breadcrumbs2.join(", ") || "Chọn địa điểm"}</span>
                                            </div>
                                            <ul className="user-info-edit-options">
                                                {currentLevel2.map((item) => (
                                                    <li
                                                        key={item.geonameId}
                                                        onClick={() => handleSelect2(item.geonameId)}
                                                        className="user-info-edit-option"
                                                    >
                                                        {item.name || item.countryName}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="user-info-edit-row">
                                    <label htmlFor="salary-expect" className="user-info-edit-label">
                                        Mức lương mong muốn
                                    </label>
                                    <div className="user-info-edit-input-group">
                                        <input
                                            type="text"
                                            id="desired_salary"
                                            name="desired_salary"
                                            className="user-info-edit-inputt"
                                            placeholder=""
                                            value={profile.desired_salary}
                                            onChange={handleInputChange}
                                        />
                                        <span className="user-info-edit-unit">USD/tháng</span>
                                    </div>
                                </div>
                            </div>

                        </form>

                        {/* Footer (Save/Cancel) */}
                        <div className="user-info-edit-button-row">
                            <button onClick={() => { handleSave(); handleCloseBasicInfoEdit(); }} className="user-info-edit-save-btn" type="submit">
                                Lưu
                            </button>
                            <button className="user-info-edit-cancel-btn" type="button" onClick={() => { handleCloseBasicInfoEdit(); onClose(); }}>
                                Hủy
                            </button>
                        </div>

                        {/* Form chỉnh sửa kỹ năng *********************************************/}
                        {isNotify && (
                            <>
                                <div className="notify-overlay">
                                    <div className="notify-container">

                                        {/* Nội dung Form */}
                                        <form className="notify-form">
                                            <label className="notify-label">
                                                Công việc này yêu cầu làm bài test trước khi ứng tuyển
                                            </label>
                                            <div className="notify-col-add">
                                                <button className="notify-save-btn" type="button" onClick={handleCloseNotify}>
                                                    Hủy
                                                </button>
                                                {!isTestStarted && (
                                                    <Link to={`/applicants/apply-job/doing-test?testId=${testDetails.test_id}&jobId=${job._id}`} className="notify-save-btn" type="button">                                                        Bắt đầu ngay
                                                    </Link>
                                                )}
                                            </div>

                                        </form>
                                    </div>
                                </div>

                            </>
                        )}
                        {isTest && (
                            <div className="notify-overlay">
                                <div className="do-test-form-container">
                                    <Card className="do-test-form-card">
                                        <div className="do-test-form-header">
                                            <Typography variant="h5">
                                                Question {qnIndex + 1} of {sampleQuestions.length}
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(qnIndex + 1) * 100 / sampleQuestions.length}
                                                className="do-test-form-progress"
                                            />
                                        </div>
                                        <CardContent>
                                            <Typography variant="h6" className="do-test-form-question">
                                                {sampleQuestions[qnIndex]?.question || "Question not found"}
                                            </Typography>
                                            <List>
                                                {sampleQuestions[qnIndex]?.options.map((option, idx) => (
                                                    <ListItemButton
                                                        key={idx}
                                                        className="do-test-form-option"
                                                        onClick={() => handleOptionSelect(option)} // Hàm xử lý chọn đáp án
                                                    >
                                                        <b>{String.fromCharCode(65 + idx)}. </b>
                                                        {option}
                                                    </ListItemButton>
                                                ))}
                                            </List>
                                        </CardContent>
                                        <div className="do-test-form-footer">
                                            {qnIndex === sampleQuestions.length - 1 ? (
                                                <Button
                                                    variant="contained"
                                                    onClick={handleFinishTest}
                                                    className="do-test-form-finish-btn"
                                                >
                                                    Finish
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    onClick={handleNextQuestion}
                                                    disabled={qnIndex === sampleQuestions.length - 1}
                                                    className="do-test-form-next-btn"
                                                >
                                                    Next
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}
                        {testCompleted && (
                            <div className="notify-overlay">
                                <div className="do-test-form-container">
                                    <Card className="do-test-form-card">
                                        <div className="do-test-form-header">
                                            <Typography variant="h5">
                                                Bài test hoàn thành
                                            </Typography>
                                        </div>
                                        <CardContent>
                                            <Typography variant="h6" className="do-test-form-question">
                                                Số điểm của bạn: {score} / {totalScore}
                                            </Typography>
                                            <Typography variant="body1" className="do-test-form-description">
                                                {score >= totalScore / 2 ? "Chúc mừng bạn đã vượt qua bài test!" : "Rất tiếc bạn chưa vượt qua bài test!"}
                                            </Typography>
                                        </CardContent>
                                        <div className="do-test-form-footer">
                                            {score >= totalScore / 2 ? (
                                                <Button
                                                    variant="contained"
                                                    onClick={handleApply}
                                                    className="do-test-form-finish-btn"
                                                >
                                                    Apply
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    onClick={handleCancel}
                                                    className="do-test-form-retake-btn"
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

        </div>

    )
}
export default ApplyJob;

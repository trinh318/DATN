import React, { useState, useRef, useEffect } from "react";
import '../../../styles/profile.css';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaEdit, FaMedal, FaUniversity, FaBook, FaAward, FaBriefcase, FaCalendarAlt, FaBuilding, FaCheckCircle, FaStream } from 'react-icons/fa';
import UploadCV from './UploadCV';
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { GraduationCap, BookMarked } from "lucide-react";
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import axios from 'axios';
import { getId } from '../../../libs/isAuth';

const countryList = [//quốc tịch
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

const countryData = [ //số đt
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

const Profile = () => {

  ///////////////////////////////FORM THÔNG TIN CƠ BẢN////////////////////////
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [isEditBasicInfoOpen, setIsEditBasicInfoOpen] = useState(false);

  const userId = getId();

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


  const [selectedCountry, setSelectedCountry] = useState(countryData[0]); // Quốc gia mặc định
  const [phoneNumber, setPhoneNumber] = useState(""); // Số điện thoại
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Trạng thái dropdown

  // Xử lý khi chọn quốc gia
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setProfile((prevProfile) => ({
      ...prevProfile,
      nationality: country.countryName, // Lưu quốc gia vào profile
    }));
    setDropdownVisible(false);
  };


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

  const [selectedGender, setSelectedGender] = useState(""); // Giới tính được chọn

  // Danh sách các lựa chọn giới tính
  const genderOptions = [
    { label: "Nam", value: "Male", icon: "👨" },
    { label: "Nữ", value: "Female", icon: "👩" },
    { label: "Khác", value: "Other", icon: "🌈" },
  ];

  // Xử lý khi chọn giới tính
  const handleGenderSelect = (value) => {
    setSelectedGender(value);
    setProfile((prevProfile) => ({
      ...prevProfile,
      gender: selectedGender, // Cập nhật giá trị gender
    }));
  };

  const [selectedNationality, setSelectedNationality] = useState(null); // Quốc tịch được chọn
  const [dropdownVisible, setDropdownVisible] = useState(false); // Trạng thái mở/đóng dropdown
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm

  // Lọc danh sách quốc gia theo từ khóa
  //const filteredCountries = countryList.filter((country) =>
  // country.name.toLowerCase().includes(searchTerm.toLowerCase())
  //);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

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
  const [error, setError] = useState(null); // State để lưu lỗi (nếu có)
  const [user, setUser] = useState(null);
  const handleUploadToCloudinary = async (file) => {
    // Tạo FormData và thêm dữ liệu cần thiết
    if (!file) {
      console.error('Error: No file provided');
      return null;
    }
    console.log('Uploading file:', file.name, file.type, file.size);
    const uploadData = new FormData();
    uploadData.append('file', file); // Tệp cần tải lên
    uploadData.append('upload_preset', 'ngocquynh'); // Tên upload preset đã cấu hình trong Cloudinary

    try {
      // Gửi yêu cầu POST tới API của Cloudinary
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dxwoaywlz/image/upload', // URL chứa cloud_name của bạn
        uploadData
      );

      console.log('Cloudinary response:', response.data); // Ghi log phản hồi từ Cloudinary

      // Kiểm tra và lấy URL tệp từ phản hồi
      const avatarUrl = response.data.secure_url;
      if (avatarUrl) {
        console.log('Uploaded file URL:', avatarUrl); // URL của tệp tải lên thành công
        return avatarUrl; // Trả về URL để sử dụng
      } else {
        console.error('Error: secure_url not found in the response');
        return null;
      }
    } catch (error) {
      // Xử lý lỗi
      console.error('Error uploading to Cloudinary:', error.response?.data || error.message);
      return null;
    }
  };

  const [image, setImage] = useState(null); // Lưu ảnh đã chọn
  const inputRef = useRef(null); // Tạo ref cho input file

  const handleImageChange = async (e) => {
    const file = e.target.files[0]; // Lấy tệp ảnh đầu tiên

    if (file) {
      // Gọi hàm upload và lưu URL ảnh vào state
      const avatarUrl = await handleUploadToCloudinary(file);
      if (avatarUrl) {
        setImage(avatarUrl); // Cập nhật URL của ảnh vào state
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleAvatarClick = () => {
    if (inputRef.current) {
      inputRef.current.click(); // Sử dụng ref để click input file
    }
  };

  const handleSave = async () => {
    try {
      const avatarUrl = image; // Lấy URL ảnh từ state
      const idnd = getId(); // Lấy user ID từ hàm getId
      const data = { ...profile, user_id: idnd, avatar: avatarUrl }; // Gắn user ID vào profile
      const response = await axios.post('http://localhost:5000/api/profiles/profile', data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Gửi token xác thực
        },
      });

      // Kiểm tra phản hồi từ server
      if (response.data.success) {
        alert('Profile saved successfully!');
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

  ///////////////////////////////END FORM THÔNG TIN CƠ BẢN////////////////////////




  ///////////////////////////////FORM THÔNG TIN HỌC VẤN////////////////////////
  // Trạng thái mở/đóng form
  const [isEditEduInfoOpen, setIsEditEduInfoOpen] = useState(false);

  // Trạng thái cho các trường dữ liệu trong form
  const [major, setMajor] = useState("");
  const [school, setSchool] = useState("");
  const [degree, setDegree] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");

  // Hàm mở form
  const handleEduInfoClick = () => {
    setIsEditEduInfoOpen(true);
  };

  // Hàm đóng form và reset trạng thái
  const handleCloseEduInfoEdit = () => {
    setIsEditEduInfoOpen(false);
    setMajor(""); // Reset chuyên ngành
    setSchool(""); // Reset trường
    setDegree(""); // Reset bằng cấp
    setStartMonth(""); // Reset "Từ tháng"
    setEndMonth(""); // Reset "Đến tháng"
    setEditorState(EditorState.createEmpty()); // Reset trình chỉnh sửa thành tựu
  };
  const [academic, setAcademic] = useState({
    user_id: '',
    industry: '',
    school_name: '',
    degree: '',
    start_date: '',
    end_date: '',
    achievements: '', // Đây là trường sẽ nhập thành tựu từ Editor
  });
  const handleInputChangeAcademic = (e) => {
    const { name, value } = e.target;
    setAcademic({ ...academic, [name]: value });
  };
  /*const getAchievementsText = () => {
    const currentContent = editorState.getCurrentContent();
    return draftToHtml(convertToRaw(currentContent)); // Chuyển đổi EditorState thành HTML
  };
  */
  const handleSaveAcademic = async () => {
    try {
      const userId = getId(); // Lấy user ID từ hàm getId
      const data = { ...academic, user_id: userId }; // Gắn user ID vào academic data

      const response = await axios.post('http://localhost:5000/api/academic/add', data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Gửi token xác thực
        },
      });

      // Log phản hồi để kiểm tra
      console.log('Server response:', response.data);

      if (response.data.success) {
        alert('Thông tin học vấn đã được lưu!');
      } else {
        // Nếu success là false, hiển thị thông báo lỗi
        alert(`Lỗi khi lưu thông tin học vấn: ${response.data.message || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      // Xử lý lỗi từ phía server
      if (error.response) {
        console.error('Error response from server:', error.response.data);
        alert(`Có lỗi xảy ra: ${error.response.data.message || 'Lỗi không xác định'}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        alert('Không có phản hồi từ server. Vui lòng kiểm tra kết nối hoặc trạng thái server.');
      } else {
        // Lỗi khác
        console.error('Error message:', error.message);
        alert(`Có lỗi xảy ra: ${error.message}`);
      }
    }
  };



  ///////////////////////////////END FORM THÔNG TIN HỌC VẤN////////////////////////



  ///////////////////////////////FORM MỤC TIÊU NGHỀ NGHIỆP////////////////////////
  //const [isEditJobGoalOpen, setIsEditJobGoalOpen] = useState(false);

  // Hàm mở form
  //const handleJobGoalClick = () => {
  //   setIsEditJobGoalOpen(true);
  // };

  // Hàm đóng form và reset trạng thái
  // const handleCloseJobGoalEdit = () => {
  //   setIsEditJobGoalOpen(false);
  //   setEditorState(EditorState.createEmpty()); // Reset nội dung editor
  // };


  ///////////////////////////////END FORM MỤC TIÊU NGHỀ NGHIỆP////////////////////////



  ///////////////////////////////FORM KỸ NĂNG////////////////////////
  const [skill, setSkill] = useState("");  // Lưu trữ kỹ năng nhập vào
  const [skillsListDB, setSkillsListDB] = useState([]);
  const [skillsList, setSkillsList] = useState([]);  // Lưu trữ danh sách kỹ năng đã thêm
  const [isEditSkillOpen, setIsEditSkillOpen] = useState(false);  // Trạng thái hiển thị form chỉnh sửa kỹ năng

  // Hàm để mở form chỉnh sửa kỹ năng
  const handleSkillClick = () => {
    setIsEditSkillOpen(true);
  };

  // Hàm để đóng form chỉnh sửa kỹ năng và reset lại trạng thái
  const handleCloseSkillEdit = () => {
    setIsEditSkillOpen(false);  // Đóng form
    setSkill("");  // Reset ô nhập liệu về rỗng
    setSkillsList([]);  // Xóa danh sách kỹ năng đã thêm (hoặc có thể giữ lại nếu muốn)
  };

  // Hàm để xử lý thay đổi giá trị trong ô nhập liệu
  const handleInputSkillChange = (e) => {
    setSkill(e.target.value);
  };

  // Hàm để xử lý khi nhấn "Thêm"
  const handleSubmit = (e) => {
    e.preventDefault();
    if (skill.trim()) {
      setSkillsList([...skillsList, skill]);  // Thêm kỹ năng vào danh sách
      setSkill("");  // Reset ô nhập liệu
    }
  };

  const handleSubmitSkill = async (e) => {
    e.preventDefault();

    const userId = getId();  // Lấy userId từ session hoặc context

    if (Array.isArray(skillsList) && skillsList.every(skill => typeof skill === 'string' && skill.trim() !== '')) {
      try {
        const isSubset = skillsList.every(skill => skillsListDB.includes(skill));
        if (!isSubset) {

          // Gửi yêu cầu API để cập nhật kỹ năng vào profile người dùng
          await axios.put('http://localhost:5000/api/profiles/update-skills', {
            userId: userId,
            skills: skillsList,
          });
          //  window.location.reload();
        } else {
          console.log("Không có kỹ năng mới để thêm");
        }
      } catch (error) {
        console.error("Error updating skills:", error);
      }
    } else {
      console.log("Kỹ năng trống hoặc đã có trong danh sách");
    }
  };

  ///////////////////////////////END FORM KỸ NĂNG////////////////////////




  ///////////////////////////////FORM KINH NGHIỆM////////////////////////
  const [isEditExpOpen, setIsEditExpOpen] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty()); // Mô tả công việc
  const [isChecked, setIsChecked] = useState(false); // Trạng thái checkbox


  const [formData, setFormData] = useState({
    position: "", // Chức danh
    company: "", // Công ty
    startMonth: "", // Từ tháng
    endMonth: "", // Đến tháng
  });
  const [academicData, setAcademicData] = useState([]);

  // Hàm mở form
  const handleExpClick = () => {
    setIsEditExpOpen(true);
  };

  // Hàm đóng form và reset trạng thái
  const handleCloseExpEdit = () => {
    setIsEditExpOpen(false);
    setEditorState(EditorState.createEmpty()); // Reset mô tả công việc
    setIsChecked(false); // Bỏ chọn checkbox
    setFormData({
      position: "",
      company: "",
      startMonth: "",
      endMonth: "",
    }); // Reset các trường input
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Cập nhật ngày sinh trong profile
    setProfile({ ...profile, date_of_birth: date.toISOString() }); // Lưu ngày sinh dưới dạng ISO
  };


  // Hàm xử lý thay đổi input
  const handleInputExpChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const [experienceList, setExperienceList] = useState([]); // Danh sách kinh nghiệm
  const [formDataexperience, setFormDataexperience] = useState({
    position: "",
    company: "",
    describe: "",
    startMonth: "",
    endMonth: "",
  });

  const handleSaveExperience = async () => {
    try {
      const userId = getId(); // Lấy ID người dùng
      const data = { ...formDataexperience, userId };

      const response = await axios.post('http://localhost:5000/api/experience/add', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        alert('Kinh nghiệm làm việc đã được lưu!');
        //   window.location.reload();
        handleCloseExperienceForm();

      } else {
        alert(`Thông báo : ${response.data.message || "Không xác định"}`);
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi khi lưu kinh nghiệm. Vui lòng thử lại.');
    }
  };

  const handleCloseExperienceForm = () => {
    setIsEditExpOpen(false);
  };
  const handleInputChangeExperience = (e) => {
    const { name, value } = e.target;
    setFormDataexperience((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    setFormDataexperience((prev) => ({
      ...prev,
      endMonth: !isChecked ? null : "",
    }));
  };

  ///////////////////////////////END FORM KINH NGHIỆM////////////////////////
  /**  useEffect(() => {
      const fetchProfile = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/profiles/${userId}`, {
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
  
      fetchProfile();
    }, [userId]); */

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

  useEffect(() => {
    const fetchAcademicData = async () => {
      try {
        if (!userId) {
          throw new Error('User ID không tồn tại');
        }

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token không hợp lệ hoặc đã hết hạn');
        }

        const response = await axios.get(`http://localhost:5000/api/academic/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Token xác thực
          },
        });

        if (response.data.length === 0) {
          throw new Error('Không có thông tin học vấn cho người dùng này');
        } else {
          setAcademicData(response.data); // Lưu dữ liệu học vấn vào state
        }
      } catch (err) {
        setError(err.message); // Ghi nhận lỗi nếu có
        console.error('Error fetching academic data:', err);
      } finally {
        setLoading(false); // Xong, không còn loading nữa
      }
    };

    fetchAcademicData();
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/profiles/skills/${userId}`);
        setSkillsList(response.data.skills || []);
        setSkillsListDB(response.data.skills || []);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    fetchSkills();
  }, []);

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
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/experience/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setExperienceList(response.data.experiences || []);
      } catch (error) {
        console.log('chưa có king nghiệm nào!')
      }
    };

    fetchExperiences();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-5 w-full">
        <div className='flex gap-5 pb-3'>
          <FaStream className="w-3 text-gray-700" />
          <p className="font-semibold text-sm text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Company Profile</p>
        </div>

        <div class="flex flex-col gap-4">
          <div className="relative flex bg-white rounded-xl p-5 max-w-full">
            <button
              className="absolute top-[15px] right-[15px] bg-transparent border-none cursor-pointer text-gray-500 text-xl hover:text-gray-800"
              onClick={handleEditBasicInfoClick}
            >
              <FaEdit />
            </button>

            {profile && (
              <>
                <div className="flex flex-col gap-1 h-full items-center pr-[50px]">
                  <div className="w-[140px] h-[140px] bg-gray-300 rounded-full border-2 border-dashed border-gray-300 flex justify-center items-center cursor-pointer relative overflow-hidden transition-colors duration-300 hover:border-blue-500 active:border-blue-700">
                    {user?.avatar && (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <h2 className="text-xl font-semibold m-0 text-gray-800">
                    {profile.first_name && profile.last_name
                      ? `${profile.first_name} ${profile.last_name}`
                      : "No Name"}
                  </h2>
                  <p className="text-gray-500 text-base m-0">
                    {profile.job_title || "No Job Title"}
                  </p>
                  <p className="text-gray-500 text-base m-0">
                    {profile.years_of_experience
                      ? `${profile.years_of_experience} years experience`
                      : "No Experience"}
                  </p>
                </div>

                <div className="flex-1">
                  <div className="border-b border-gray-500 pb-5">
                    <h3 className="text-gray-700 text-base font-medium mb-4">Thông tin cơ bản</h3>
                    <div className="grid grid-cols-2 justify-start gap-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center text-sm text-gray-700">
                          <FaEnvelope className="mr-2 text-gray-500" />
                          <span>{profile.email || "No Email"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <FaMapMarkerAlt className="mr-2 text-gray-500" />
                          <span>{profile.location || "No Location"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <FaPhone className="mr-2 text-gray-500" />
                          <span>{profile.phone || "No Phone"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center text-sm text-gray-700">
                          <FaBriefcase className="mr-2 text-gray-500" />
                          <span>{profile.job_level || "No Job Level"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <FaGraduationCap className="mr-2 text-gray-500" />
                          <span>{profile.education || "No Education"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5">
                    <h3 className="text-gray-700 text-base font-medium mb-4">Công việc mong muốn</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <FaEnvelope className="mr-2 text-gray-500" />
                        <span>Nơi làm việc: {profile.specific_address || "No Desired Location"}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <FaBriefcase className="mr-2 text-gray-500" />
                        <span>
                          Mức lương:{" "}
                          {profile.desired_salary
                            ? `$${profile.desired_salary}/Tháng`
                            : "No Desired Salary"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <UploadCV />
          <div className="relative flex bg-white rounded-[12px] p-5 pb-0 w-full">
            <button
              className="absolute top-[15px] right-[15px] bg-transparent border-none cursor-pointer text-gray-500 text-[1.2rem] hover:text-gray-800 transition-colors"
              onClick={handleEduInfoClick}
            >
              <FaEdit />
            </button>

            <div className="flex-1 p-0">
                <div className="mb-4">
                  <h3 className="text-gray-700 text-base font-medium mb-[15px]">Thông tin học vấn</h3>
                </div>

                {academicData.length > 0 ? (
                  academicData.map((academic, academic_id) => (
                    <div
                      key={academic_id}
                      className="mt-5 pb-5 border-b border-gray-200 last:border-none"
                    >
                      <h4 className="text-base font-semibold text-gray-800">
                        {academic?.school_name}
                      </h4>
                      <p className="text-sm text-gray-600 my-1">{academic?.industry}</p>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FaMedal className="text-gray-500 w-4 h-4" />
                          <span>{academic?.start_date} - {academic?.end_date}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <FaBook className="text-gray-500 w-4 h-4 shrink-0 mt-1" />
                          <p className="text-sm text-gray-700 leading-relaxed">{academic?.achievements}</p>
                        </div>

                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Không có thông tin học vấn.</p>
                )}
            </div>
          </div>
          <div className="relative flex bg-white rounded-[12px] p-5 pb-0 w-full">
            <button
              className="absolute top-[15px] right-[15px] bg-transparent border-none cursor-pointer text-gray-500 text-[1.2rem] hover:text-gray-800 transition-colors"
              onClick={handleExpClick}
            >
              <FaEdit />
            </button>

            <div className="flex-1">
              <h3 className="text-gray-700 text-base font-medium mb-[15px]">Kinh nghiệm làm việc</h3>

              {experienceList.length > 0 ? (
                experienceList.map((exp) => (
                  <div key={exp._id} className="mt-5 pb-5 border-b border-gray-200 last:border-none">
                    {/* Tiêu đề công việc và công ty */}
                    <div className="mb-2 text-sm">
                      <div>
                        <h3 className="text-base mb-2 font-semibold text-gray-800">{exp.position}</h3>
                        <p className="flex items-center text-sm text-gray-600">
                          <FaBuilding className="mr-2 text-gray-500" />
                          {exp.company}
                        </p>
                      </div> 
                    </div>

                    {/* Thời gian làm việc */}
                    <div className="flex items-center text-gray-600 mb-2">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      <span className="text-sm">Từ Tháng {exp.startMonth} đến Tháng {exp.endMonth}</span>
                    </div>

                    {/* Mô tả công việc */}
                    <div className="text-gray-600 whitespace-pre-line break-words">
                      {exp.describe}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Chưa có kinh nghiệm làm việc nào.</p>
              )}
            </div>
          </div>
          <div className="relative flex bg-white rounded-[12px] p-5 w-full">
            <button
              className="absolute top-[15px] right-[15px] bg-transparent border-none cursor-pointer text-gray-500 text-[1.2rem] hover:text-gray-800 transition-colors"
              onClick={handleSkillClick}
            >
              <FaEdit />
            </button>
            <div className="flex-1">
              <h3 className="text-gray-700 text-base font-medium mb-[15px]">Kỹ năng</h3>
              <div>
                <ul className="list-none space-y-2">
                  {skillsListDB.length > 0 ? (
                    skillsListDB.map((skill, index) => (
                      <li key={index} className="flex text-sm items-center text-gray-600">
                        <FaCheckCircle className="mr-2 text-green-500" />
                        {skill}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">Không có kỹ năng nào được thêm vào.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Form chỉnh sửa thông tin cơ bản *********************************************/}
        {isEditBasicInfoOpen && (
          <>
            <div className="user-info-edit-overlay">
              <div className="user-info-edit-container">
                {/* Header */}
                <div className="user-info-edit-header-form">
                  <div className="user-info-edit-header">
                    <h2>Thông Tin Cơ Bản</h2>
                    <button className="user-info-edit-close-btn" onClick={handleCloseBasicInfoEdit}>
                      &times;
                    </button>
                  </div>
                </div>

                {/* Nội dung Form */}
                <form className="user-info-edit-form">
                  <div className='user-info-edit-basic-info'>
                    <div className={`user-info-avatar ${image ? "has-image" : ""}`} onDrop={handleDrop} onDragOver={handleDragOver} onClick={handleAvatarClick}>
                      {!image ? (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            className="profile-avatar-input"
                            onChange={handleImageChange}
                          />
                        </>
                      ) : (
                        <><img src={image} alt="Uploaded" className="user-profile-image" /></>
                      )}
                    </div>
                    <div className='user-info-edit-right'>
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
                  <div className="user-info-edit-col-bigger">
                    <div className="date-picker-container">
                      <label htmlFor="date_of_birth" className="user-info-edit-label">
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
                          <div className="calendar-header">
                            <button type="button" onClick={() => changeMonth(-1)}>&lt;</button>

                            <span>
                              {/* Dropdown chọn tháng */}
                              <select
                                value={currentMonth.getMonth()}
                                onChange={(e) => handleMonthChange(Number(e.target.value))}
                              >
                                {Array.from({ length: 12 }).map((_, index) => (
                                  <option key={index} value={index}>
                                    {new Date(0, index).toLocaleString("default", { month: "long" })}
                                  </option>
                                ))}
                              </select>

                              {/* Dropdown chọn năm */}
                              <select
                                value={currentMonth.getFullYear()}
                                onChange={(e) => handleYearChange(Number(e.target.value))}
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

                            <button type="button" onClick={() => changeMonth(1)}>&gt;</button>
                          </div>

                          <div className="calendar-grid">
                            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                              <div key={day} className="calendar-day-name">
                                {day}
                              </div>
                            ))}
                            {getDaysInMonth(currentMonth.getMonth(), currentMonth.getFullYear()).map((date) => (
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
                      <div className="user-info-edit-select-display"
                        name="specific_address"
                        id="specific_address"
                        onClick={toggleMenu1}>
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
                      placeholder="Nhập địa chỉ cụ thể"
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
                      <option >Chọn cấp bậc</option>
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
                      <select id="industry"
                        name="current_industry"
                        value={profile.current_industry || ''}
                        onChange={handleInputChange}
                        className="user-info-edit-select">
                        <option >Chọn ngành nghề</option>
                        <option value="IT">IT</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Giáo dục">Giáo dục</option>
                      </select>
                    </div>
                    <div className="user-info-edit-row">
                      <label htmlFor="field" className="user-info-edit-label">
                        Lĩnh vực hiện tại <span className="user-info-edit-required">*</span>
                      </label>
                      <select id="field"
                        value={profile.current_field || ''}
                        name="current_field"
                        onChange={handleInputChange}
                        className="user-info-edit-select">
                        <option >Chọn lĩnh vực công ty</option>
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
                          type="number"
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
                  <button className="user-info-edit-cancel-btn" type="button" onClick={handleCloseBasicInfoEdit}>
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Form chỉnh sửa thông tin học vấn *********************************************/}
        {isEditEduInfoOpen && (
          <>
            <div className="user-info-edit-overlay">
              <div className="user-info-edit-container">
                {/* Header */}
                <div className="user-info-edit-header-form">
                  <div className="user-info-edit-header">
                    <h2>Thông Tin Học Vấn</h2>
                    <button className="user-info-edit-close-btn" onClick={handleCloseEduInfoEdit}>
                      &times;
                    </button>
                  </div>
                </div>
                {/* Nội dung Form */}
                <form className="user-info-edit-form">
                  <div className="user-info-edit-row">
                    <label htmlFor="major" className="user-info-edit-label">
                      Chuyên ngành <span className="user-info-edit-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="industry"
                      name="industry"
                      value={academic.industry}
                      onChange={handleInputChangeAcademic}
                      className="user-info-edit-input"
                      placeholder="Nhập chuyên ngành"
                    />
                  </div>
                  <div className="user-info-edit-col">
                    <div className="user-info-edit-row">
                      <label htmlFor="school" className="user-info-edit-label">
                        Trường <span className="user-info-edit-required">*</span>
                      </label>
                      <input
                        type="text"
                        id="school_name"
                        name="school_name"
                        className="user-info-edit-input"
                        placeholder="Nhập trường"
                        value={academic.school_name}
                        onChange={handleInputChangeAcademic}
                      />
                    </div>
                    <div className="user-info-edit-row">
                      <label htmlFor="degree" className="user-info-edit-label">
                        Bằng cấp <span className="user-info-edit-required">*</span>
                      </label>
                      <select
                        id="degree"
                        className="user-info-edit-select"
                        name="degree"
                        value={academic.degree}
                        onChange={handleInputChangeAcademic}
                      >
                        <option value="">Chọn bằng cấp</option>
                        <option value="Trung học">Trung học</option>
                        <option value="Trung cấp">Trung cấp</option>
                        <option value="Cao đẳng">Cao đẳng</option>
                        <option value="Cử nhân">Cử nhân</option>
                        <option value="Thạc sĩ">Thạc sĩ</option>
                        <option value="Tiến sĩ">Tiến sĩ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                  </div>
                  <div className="user-info-edit-col">
                    <div className="user-info-edit-row">
                      <label htmlFor="start-month" className="user-info-edit-label">
                        Từ tháng <span className="user-info-edit-required">*</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          id="start-month"
                          className="form-input"
                          placeholder="MM/YYYY"
                          name="start_date"
                          value={academic.start_date}
                          onChange={handleInputChangeAcademic}
                        />
                        <span className="icon-calendar">📅</span>
                      </div>
                    </div>
                    <div className="user-info-edit-row">
                      <label htmlFor="end-month" className="user-info-edit-label">
                        Đến tháng <span className="user-info-edit-required">*</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          id="end-month"
                          className="form-input"
                          placeholder="MM/YYYY"
                          name="end_date"
                          value={academic.end_date}
                          onChange={handleInputChangeAcademic}
                        />
                        <span className="icon-calendar">📅</span>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="achievement" className="user-info-edit-label">
                      Thành tựu <span className="user-info-edit-required">*</span>
                    </label>
                    <div className="textarea-wrapper">
                      <div id="achievement" className="form-textarea">
                        <textarea
                          className="company-profile-des-textarea"
                          placeholder="Nhập..."
                          name="achievements"
                          value={academic.achievements}
                          onChange={handleInputChangeAcademic}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </form>
                {/* Footer (Save/Cancel) */}
                <div className="user-info-edit-button-row">
                  <button onClick={() => { handleSaveAcademic(); handleCloseEduInfoEdit(); }} className="user-info-edit-save-btn" type="submit">
                    Lưu
                  </button>
                  <button className="user-info-edit-cancel-btn" type="button" onClick={handleCloseEduInfoEdit}>
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Form chỉnh sửa kinh nghiệm làm việc *********************************************/}
        {isEditExpOpen && (
          <>
            <div className="user-info-edit-overlay">
              <div className="user-info-edit-container">
                {/* Header */}
                <div className="user-info-edit-header-form">
                  <div className="user-info-edit-header">
                    <h2>Kinh nghiệm làm việc</h2>
                    <button className="user-info-edit-close-btn" onClick={handleCloseExpEdit}>
                      &times;
                    </button>
                  </div>
                </div>

                {/* Nội dung Form */}
                <form className="user-info-edit-form">
                  <div className="user-info-edit-col">
                    <div className="user-info-edit-row">
                      <label htmlFor="position" className="user-info-edit-label">
                        Chức danh <span className="user-info-edit-required">*</span>
                      </label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        className="user-info-edit-input"
                        placeholder="Nhập chức danh"
                        value={formDataexperience.position}
                        onChange={handleInputChangeExperience}
                      />
                    </div>
                    <div className="user-info-edit-row">
                      <label htmlFor="company" className="user-info-edit-label">
                        Công ty <span className="user-info-edit-required">*</span>
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        className="user-info-edit-input"
                        placeholder="Nhập công ty"
                        value={formDataexperience.company}
                        onChange={handleInputChangeExperience}
                      />
                    </div>
                  </div>
                  <div className="user-info-edit-col">
                    <div className="user-info-edit-row">
                      <label htmlFor="startMonth" className="user-info-edit-label">
                        Từ tháng <span className="user-info-edit-required">*</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          id="startMonth"
                          name="startMonth"
                          className="form-input"
                          placeholder="MM/YYYY"
                          value={formDataexperience.startMonth}
                          onChange={handleInputChangeExperience}
                        />
                        <span className="icon-calendar">📅</span>
                      </div>
                    </div>
                    <div className="user-info-edit-row">
                      <label htmlFor="endMonth" className="user-info-edit-label">
                        Đến tháng <span className="user-info-edit-required">*</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          name="endMonth"
                          id="endMonth"
                          className="form-input"
                          placeholder="MM/YYYY"
                          value={formDataexperience.endMonth}
                          onChange={handleInputChangeExperience}
                          disabled={isChecked}
                        />
                        <span className="icon-calendar">📅</span>
                      </div>
                    </div>
                  </div>
                  <div className="checkbox-container">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-custom"></span>
                      Công việc hiện tại
                    </label>
                  </div>
                  <div className="form-group">
                    <label htmlFor="description" className="user-info-edit-label">
                      Mô tả <span className="user-info-edit-required">*</span>
                    </label>
                    <div className="textarea-wrapper">
                      <div id="achievement" className="form-textarea">
                        <textarea
                          name="describe"
                          className="company-profile-des-textarea"
                          placeholder="Nhập mô tả..."
                          value={formDataexperience.describe}
                          onChange={handleInputChangeExperience}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </form>
                {/* Footer */}
                <div className="user-info-edit-button-row">
                  <button onClick={() => { handleSaveExperience(); handleCloseExpEdit(); }} className="user-info-edit-save-btn" type="submit">
                    Lưu
                  </button>
                  <button className="user-info-edit-cancel-btn" type="button" onClick={handleCloseExpEdit}>
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Form chỉnh sửa kỹ năng *********************************************/}
        {isEditSkillOpen && (
          <>
            <div className="user-info-edit-overlay">
              <div className="user-info-edit-container">
                {/* Header */}
                <div className="user-info-edit-header-form">
                  <div className="user-info-edit-header">
                    <h2>Kỹ năng</h2>
                    <button className="user-info-edit-close-btn" onClick={handleCloseSkillEdit}>
                      &times;
                    </button>
                  </div>
                </div>

                {/* Nội dung Form */}
                <form className="user-info-edit-form">
                  <div className="user-info-edit-row">
                    <label htmlFor="skill" className="user-info-edit-label">
                      Kỹ năng
                    </label>
                    <div className="user-info-edit-col-add">
                      <input
                        type="text"
                        id="skilluer"
                        name="skilluer"
                        className="user-info-edit-input"
                        placeholder="Nhập kỹ năng"
                        value={skill}  // Dùng state skilluer để điều khiển giá trị nhập vào
                        onChange={handleInputSkillChange}  // Cập nhật giá trị khi người dùng gõ
                      />
                      <button className="user-info-edit-save-btn" type="button" onClick={handleSubmit}>
                        Thêm
                      </button>
                    </div>
                  </div>

                  {/* Hiển thị danh sách kỹ năng đã thêm */}
                  {skillsList.length > 0 && (
                    <div className="skills-list-add">
                      <h3>Kỹ năng đã thêm:</h3>
                      <ul>
                        {skillsList.map((item, index) => (
                          <li key={index}>{item}</li>  // Hiển thị từng kỹ năng trong danh sách
                        ))}
                      </ul>
                    </div>
                  )}
                </form>

                {/* Footer (Save/Cancel) */}
                <div className="user-info-edit-button-row">
                  <button onClick={(e) => { handleSubmitSkill(e); handleCloseSkillEdit(); }} className="user-info-edit-save-btn" type="submit">
                    Lưu
                  </button>
                  <button className="user-info-edit-cancel-btn" type="button" onClick={handleCloseSkillEdit}>
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
    </>
  );
};

export default Profile;


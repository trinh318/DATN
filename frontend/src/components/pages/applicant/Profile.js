import React, { useState, useRef, useEffect } from "react";
import '../../../styles/profile.css';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaEdit, FaMedal, FaUniversity, FaBook, FaAward, FaBriefcase, FaCalendarAlt, FaBuilding, FaCheckCircle, FaStream, FaPlusCircle, FaTrash } from 'react-icons/fa';
import UploadCV from './UploadCV';
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { GraduationCap, BookMarked } from "lucide-react";
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import axios from 'axios';
import { getId } from '../../../libs/isAuth';
import { FaMars, FaVenus, FaGenderless } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa'
const genderOptions = [
  { value: 'male', label: 'Nam', icon: <FaMars /> },
  { value: 'female', label: 'Nữ', icon: <FaVenus /> },
  { value: 'other', label: 'Khác', icon: <FaGenderless /> },
];
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
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [isEditBasicInfoOpen, setIsEditBasicInfoOpen] = useState(false);

  const userId = getId();

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
      setImage(response.data.avatar || null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch user data.');
      setLoading(false);
    }
  };

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
        await fetchProfile();
        console.log("Đã fetch xong, profile mới:", profile);

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
  const [isEditingAcademic, setIsEditingAcademic] = useState(false); // true = edit, false = add
  const [editAcademicIndex, setEditAcademicIndex] = useState(null); // vị trí academic đang edit

  // Trạng thái cho các trường dữ liệu trong form
  const [major, setMajor] = useState("");
  const [school, setSchool] = useState("");
  const [degree, setDegree] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");

  const fetchAcademicData = async () => {
    try {
      if (!userId) throw new Error('User ID không tồn tại');

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không hợp lệ hoặc đã hết hạn');

      const response = await axios.get(`http://localhost:5000/api/academic/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.data.length === 0) {
        throw new Error('Không có thông tin học vấn cho người dùng này');
      } else {
        setAcademicData(response.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching academic data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEduInfoClick = () => {
    setAcademicData({
      school_name: "",
      industry: "",
      degree: "",
      start_date: "",
      end_date: "",
      achievements: "",
    });
    setIsEditingAcademic(false); // trạng thái thêm mới
    setEditAcademicIndex(null);
    setIsEditEduInfoOpen(true); // mở form
  };

  const handleEditEduInfoClick = (academic, index) => {
    setAcademic(academic);
    setIsEditingAcademic(true);
    setEditAcademicIndex(index);
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
    setAcademic(null);
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
      const userId = getId();
      if (!userId) {
        alert('Không xác định được người dùng. Vui lòng đăng nhập lại.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.');
        return;
      }

      const payload = {
        ...academic,
        user_id: userId,
      };

      let response;
      if (academic._id) {
        // Cập nhật thông tin học vấn
        response = await axios.put(
          `http://localhost:5000/api/academic/edit/${academic._id}`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        // Thêm mới thông tin học vấn
        response = await axios.post(
          'http://localhost:5000/api/academic/add',
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const { success, message } = response.data;

      if (success !== false) {
        alert(academic._id ? 'Cập nhật học vấn thành công!' : 'Thêm học vấn mới thành công!');
        console.log('Phản hồi:', response.data);
        // Reset hoặc cập nhật danh sách tại đây nếu cần
        await fetchAcademicData();
      } else {
        alert(`Không thể lưu thông tin: ${message || 'Lỗi không xác định từ server'}`);
      }
    } catch (error) {
      if (error.response) {
        console.error('Lỗi từ server:', error.response.data);
        alert(`Lỗi từ server: ${error.response.data.message || 'Lỗi không xác định'}`);
      } else if (error.request) {
        console.error('Không nhận được phản hồi:', error.request);
        alert('Không có phản hồi từ server. Vui lòng kiểm tra kết nối.');
      } else {
        console.error('Lỗi không xác định:', error.message);
        alert(`Lỗi: ${error.message}`);
      }
    }
  };

  const handleDeleteEduInfo = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa thông tin học vấn này?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/academic/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // nếu cần
        },
      });

      // Cập nhật lại state sau khi xóa
      setAcademicData(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa thông tin học vấn:", error);
      alert("Không thể xóa thông tin học vấn.");
    }
  };

  ///////////////////////////////END FORM THÔNG TIN HỌC VẤN////////////////////////



  ///////////////////////////////FORM KỸ NĂNG////////////////////////
  const [skill, setSkill] = useState("");  // Lưu trữ kỹ năng nhập vào
  const [skillsListDB, setSkillsListDB] = useState([]);
  const [skillsList, setSkillsList] = useState([]);  // Lưu trữ danh sách kỹ năng đã thêm
  const [isEditSkillOpen, setIsEditSkillOpen] = useState(false);  // Trạng thái hiển thị form chỉnh sửa kỹ năng

  const fetchSkills = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/profiles/skills/${userId}`);
      setSkillsList(response.data.skills || []);
      setSkillsListDB(response.data.skills || []);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  // Hàm để mở form chỉnh sửa kỹ năng
  const handleSkillClick = () => {
    setIsEditSkillOpen(true);
  };

  // Hàm để đóng form chỉnh sửa kỹ năng và reset lại trạng thái
  const handleCloseSkillEdit = () => {
    setIsEditSkillOpen(false);  // Đóng form
    setSkill("");  // Reset ô nhập liệu về rỗng
  };

  const handleRemoveSkill = (e, index) => {
    e.preventDefault(); // Ngăn form submit gây reload trang

    // Tạo danh sách mới bỏ qua skill bị xóa
    const updatedSkills = [...skillsList];
    updatedSkills.splice(index, 1);
    setSkillsList(updatedSkills);
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

  const arraysAreEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    return sorted1.every((value, index) => value === sorted2[index]);
  };

  const handleSubmitSkill = async (e) => {
    e.preventDefault();

    const userId = getId();

    if (Array.isArray(skillsList) && skillsList.every(skill => typeof skill === 'string' && skill.trim() !== '')) {
      try {
        const hasChanged = !arraysAreEqual(skillsList, skillsListDB);

        if (hasChanged) {
          await axios.put('http://localhost:5000/api/profiles/update-skills', {
            userId: userId,
            skills: skillsList,
          });

          await fetchSkills();
          alert("Cập nhật kỹ năng thành công!");
        } else {
          console.log("Không có thay đổi kỹ năng để cập nhật.");
        }
      } catch (error) {
        console.error("Error updating skills:", error);
        alert("Lỗi khi cập nhật kỹ năng.");
      }
    } else {
      console.log("Danh sách kỹ năng không hợp lệ.");
    }
  };


  ///////////////////////////////END FORM KỸ NĂNG////////////////////////




  ///////////////////////////////FORM KINH NGHIỆM////////////////////////
  const [isEditExpOpen, setIsEditExpOpen] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty()); // Mô tả công việc
  const [isChecked, setIsChecked] = useState(false); // Trạng thái checkbox
  const [editingExperienceId, setEditingExperienceId] = useState(null);

  const [formData, setFormData] = useState({
    position: "", // Chức danh
    company: "", // Công ty
    startMonth: "", // Từ tháng
    endMonth: "", // Đến tháng
  });
  const [academicData, setAcademicData] = useState([]);

  const handleEditExperience = (exp) => {
    setFormDataexperience({
      position: exp.position,
      company: exp.company,
      startMonth: exp.startMonth,
      endMonth: exp.endMonth,
      describe: exp.describe,
    });
    setIsChecked(exp.endMonth === null);
    setEditingExperienceId(exp._id); // Đặt ID để biết là đang edit
    setIsEditExpOpen(true);
  };

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

  const fetchExperiences = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/experience/${userId}`);

      setExperienceList(response.data.experiences || []);
      console.log("ha", response.data.experiences)
    } catch (error) {
      console.log('chưa có king nghiệm nào!')
    }
  };

  const handleSaveExperience = async () => {
    try {
      const userId = getId();
      const data = {
        ...formDataexperience,
        userId,
        endMonth: isChecked ? null : formDataexperience.endMonth,
      };

      const url = editingExperienceId
        ? `http://localhost:5000/api/experience/${editingExperienceId}/update`
        : `http://localhost:5000/api/experience/add`;

      const method = editingExperienceId ? 'put' : 'post';

      const response = await axios[method](url, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        alert(editingExperienceId ? 'Cập nhật thành công!' : 'Thêm kinh nghiệm thành công!');
        await fetchExperiences();
        handleCloseExperienceForm();
      } else {
        alert(`Lỗi: ${response.data.message || "Không xác định"}`);
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi khi lưu kinh nghiệm. Vui lòng thử lại.');
    }
  };

  const handleCloseExperienceForm = () => {
    setIsEditExpOpen(false);
    setEditorState(EditorState.createEmpty());
    setIsChecked(false);
    setFormDataexperience({
      position: "",
      company: "",
      describe: "",
      startMonth: "",
      endMonth: "",
    });
    setEditingExperienceId(null); // reset về chế độ thêm mới
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

  const handleDeleteExperience = async (experienceId) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xoá kinh nghiệm này?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/experience/${experienceId}/delete`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // nếu cần xác thực
        },
      });

      // Cập nhật lại danh sách
      setExperienceList((prev) => prev.filter((exp) => exp._id !== experienceId));
    } catch (error) {
      console.error('Lỗi khi xoá kinh nghiệm:', error);
      alert('Không thể xoá kinh nghiệm.');
    }
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
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Gọi khi component mount
  useEffect(() => {
    fetchAcademicData();
  }, []);

  useEffect(() => {
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
                    {profile.user_id?.avatar && (
                      <img
                        src={profile.user_id?.avatar}
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
          <div className="flex bg-white rounded-[12px] p-5 pb-0 w-full">
            <div className="flex-1 p-0 w-full">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-700 text-base font-medium">Thông tin học vấn</h3>
                <button
                  className="text-gray-500 text-[1.2rem] hover:text-gray-800 transition-colors"
                  onClick={handleAddEduInfoClick}
                >
                  <FaPlusCircle />
                </button>
              </div>

              {/* Academic Entries */}
              {academicData.length > 0 ? (
                academicData.map((academic, index) => (
                  <div
                    key={index}
                    className="mt-5 pb-5 border-b border-gray-200 last:border-none relative"
                  >
                    {/* Edit Button */}
                    {/* Edit + Delete Buttons */}
                    <div className="absolute top-0 right-0 flex gap-2">
                      <button
                        className="text-gray-500 text-[1.1rem] hover:text-blue-600 transition-colors"
                        onClick={() => handleEditEduInfoClick(academic, index)}
                        aria-label="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-gray-500 text-[1.1rem] hover:text-red-600 transition-colors"
                        onClick={() => handleDeleteEduInfo(academic._id)}
                        aria-label="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>

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
                        <p className="leading-relaxed">{academic?.achievements}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Không có thông tin học vấn.</p>
              )}
            </div>
          </div>

          <div className="relative bg-white rounded-[12px] p-5 w-full">
            {/* Nút Thêm ở góc phải tiêu đề */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-700 text-base font-medium">Kinh nghiệm làm việc</h3>
              <button
                className="text-gray-500 text-[1.2rem] hover:text-gray-800 transition-colors"
                onClick={handleExpClick}
              >
                <FaPlusCircle />
              </button>
            </div>

            {experienceList.length > 0 ? (
              experienceList.map((exp) => (
                <div
                  key={exp._id}
                  className="relative mt-4 pb-5 border-b border-gray-200 last:border-none"
                >
                  {/* Dòng chứa vị trí + nút chỉnh sửa */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-gray-800">{exp.position}</h3>
                    <div className="flex gap-2">
                      <button
                        className="text-gray-500 text-[1.1rem] hover:text-blue-600 transition-colors"
                        onClick={() => handleEditExperience(exp)}
                        aria-label="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-gray-500 text-[1.1rem] hover:text-red-600 transition-colors"
                        onClick={() => handleDeleteExperience(exp._id)}
                        aria-label="Xoá"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Tên công ty */}
                  <p className="flex items-center text-sm text-gray-600 mb-2">
                    <FaBuilding className="mr-2 text-gray-500" />
                    {exp.company}
                  </p>

                  {/* Thời gian làm việc */}
                  <div className="flex items-center text-gray-600 mb-2">
                    <FaCalendarAlt className="mr-2 text-gray-500" />
                    <span className="text-sm">
                      Từ Tháng {exp.startMonth} đến Tháng {exp.endMonth || 'nay'}
                    </span>
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
          <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div class="bg-white rounded-lg w-[780px] max-w-[780px] min-w-[400px] shadow-md flex flex-col h-[80%] overflow-hidden">
              {/* Header */}
              <div className="sticky top-0 z-20 bg-white px-5 pt-5 border-b border-gray-300">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-semibold text-gray-800">Thông Tin Cơ Bản</h2>
                  <button
                    className="text-2xl text-gray-600 hover:text-black cursor-pointer"
                    onClick={handleCloseBasicInfoEdit}
                  >
                    &times;
                  </button>
                </div>
              </div>
              {/* Nội dung Form */}
              <form className="flex-1 overflow-y-auto p-5 border-b border-gray-200 mb-5 space-y-4">
                <div className="flex">
                  {/* Avatar */}
                  <div
                    className={`w-[150px] h-[150px] rounded-full border-2 ${image ? "border-green-500" : "border-dashed border-gray-300"
                      } bg-gray-200 flex justify-center items-center cursor-pointer overflow-hidden transition-colors duration-300 hover:border-blue-500 active:border-blue-700`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={handleAvatarClick}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      ref={inputRef}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {image ? (
                      <img src={image} alt="Uploaded" className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-gray-500">Upload</span>
                    )}
                  </div>

                  {/* Form Info */}
                  <div className="flex-1 ml-8 flex flex-col gap-6">
                    {/* Họ & Tên */}
                    <div className="grid grid-cols-2 gap-5">
                      <div className="flex flex-col">
                        <label htmlFor="lastName" className="font-bold mb-2">
                          Họ <span className="text-red-500">*</span>
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

                    {/* Giới tính & Email */}
                    <div className="grid grid-cols-2 gap-5">
                      {/* Giới tính */}
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

                      {/* Email */}
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

                    {/* Điện thoại & Quốc tịch */}
                    <div className="grid grid-cols-2 gap-5">
                      {/* Phone */}
                      <div className="flex flex-col mb-4 relative">
                        <label htmlFor="phone" className="font-bold mb-2">
                          Điện thoại <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white">
                          <div
                            className="flex items-center mr-3 cursor-pointer"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          >
                            <img src={selectedCountry.flag} alt={selectedCountry.name} className="w-6 h-4 mr-2" />
                            <span className="text-sm">{selectedCountry.code}</span>
                            <span className="text-xs ml-1">&#9662;</span>
                          </div>
                          <input
                            type="text"
                            placeholder="Nhập số điện thoại"
                            value={profile.phone}
                            id="phone"
                            name="phone"
                            className="flex-1 outline-none text-sm"
                            onChange={handleInputChange}
                          />
                        </div>
                        {isDropdownOpen && (
                          <ul className="absolute z-50 top-full left-0 w-full max-h-60 overflow-y-auto mt-1 bg-white border border-gray-300 rounded shadow">
                            {countryData.map((country) => (
                              <li
                                key={country.code}
                                onClick={() => handleCountrySelect(country)}
                                className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-50"
                              >
                                <img src={country.flag} alt={country.name} className="w-6 h-4 mr-2" />
                                <span className="text-sm">{country.name}</span>
                                <span className="ml-auto text-sm">{country.code}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Quốc tịch */}
                      <div className="flex flex-col mb-4 relative">
                        <label htmlFor="nationality" className="font-bold mb-2">
                          Quốc tịch <span className="text-red-500">*</span>
                        </label>
                        <div
                          className="border border-gray-300 rounded px-3 py-2 text-sm bg-white cursor-pointer"
                          onClick={() => setDropdownVisible(!dropdownVisible)}
                        >
                          {selectedCountry ? (
                            <span>{selectedCountry.countryName === profile.nationality ? selectedCountry.countryName : profile.nationality}</span>
                          ) : (
                            "Chọn quốc tịch"
                          )}
                        </div>
                        {dropdownVisible && (
                          <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded shadow max-h-60 overflow-y-auto p-2">
                            {filteredCountries.map((country) => (
                              <div
                                key={country.countryCode}
                                onClick={() => handleCountrySelect(country)}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer rounded"
                              >
                                <span className="text-lg">{country.flag}</span>
                                <span className="text-sm">{country.countryName}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
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
                {/* Chức danh */}
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

                {/* Cấp bậc */}
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
                <button
                  type="submit"
                  onClick={() => {
                    handleSave();
                    handleCloseBasicInfoEdit();
                  }}
                  className="bg-[#5a8cb5] text-white px-5 py-2 rounded mr-2 w-[100px] hover:bg-blue-700 transition"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={handleCloseBasicInfoEdit}
                  className="bg-gray-300 text-black px-5 py-2 rounded w-[100px] hover:bg-gray-400 transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Form chỉnh sửa thông tin học vấn *********************************************/}
      {isEditEduInfoOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-[780px] max-w-[780px] min-w-[400px] shadow-lg flex flex-col h-[80%] overflow-hidden">

            {/* Header */}
            <div className="sticky top-0 bg-white z-20 px-5 pt-5 border-b border-gray-300">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold">Thông Tin Học Vấn</h2>
                <button className="text-2xl text-gray-600 hover:text-gray-900" onClick={handleCloseEduInfoEdit}>
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Form */}
            <form className="flex-1 overflow-y-auto px-5 pb-5 mt-5 border-b border-gray-300 space-y-4">

              {/* Chuyên ngành */}
              <div className="flex flex-col mb-4">
                <label htmlFor="major" className="font-bold mb-2">
                  Chuyên ngành <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={academic.industry}
                  onChange={handleInputChangeAcademic}
                  placeholder="Nhập chuyên ngành"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400 text-sm"
                />
              </div>

              {/* Trường và Bằng cấp */}
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col mb-4">
                  <label htmlFor="school" className="font-bold mb-2">
                    Trường <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="school_name"
                    name="school_name"
                    placeholder="Nhập trường"
                    value={academic.school_name}
                    onChange={handleInputChangeAcademic}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400 text-sm"
                  />
                </div>

                <div className="flex flex-col mb-4">
                  <label htmlFor="degree" className="font-bold mb-2">
                    Bằng cấp <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="degree"
                    name="degree"
                    value={academic.degree}
                    onChange={handleInputChangeAcademic}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring focus:border-blue-400 text-sm"
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

              {/* Từ tháng - Đến tháng */}
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col mb-4 relative">
                  <label htmlFor="start-month" className="font-bold mb-2">
                    Từ tháng <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="start-month"
                      name="start_date"
                      placeholder="MM/YYYY"
                      value={academic.start_date}
                      onChange={handleInputChangeAcademic}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400 text-sm"
                    />
                    <FaCalendarAlt className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col mb-4 relative">
                  <label htmlFor="end-month" className="font-bold mb-2">
                    Đến tháng <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="end-month"
                      name="end_date"
                      placeholder="MM/YYYY"
                      value={academic.end_date}
                      onChange={handleInputChangeAcademic}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400 text-sm"
                    />
                    <FaCalendarAlt className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Thành tựu */}
              <div className="flex flex-col mb-4">
                <label htmlFor="achievement" className="font-bold mb-2">
                  Thành tựu <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="achievement"
                  name="achievements"
                  placeholder="Nhập..."
                  value={academic.achievements}
                  onChange={handleInputChangeAcademic}
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400 text-sm resize-y"
                ></textarea>
              </div>
            </form>

            {/* Buttons */}
            <div className="flex justify-end gap-2 px-5 py-4">
              <button
                onClick={() => {
                  handleSaveAcademic();
                  handleCloseEduInfoEdit();
                }}
                className="bg-[#5a8cb5] text-white px-5 py-2 w-[100px] rounded hover:bg-blue-700 transition-all"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={handleCloseEduInfoEdit}
                className="bg-gray-300 text-black px-5 py-2 w-[100px] rounded hover:bg-gray-400 transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Form chỉnh sửa kinh nghiệm làm việc *********************************************/}
      {isEditExpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-[780px] max-w-[780px] min-w-[400px] shadow-lg flex flex-col h-[80%] overflow-hidden">

            {/* Header */}
            <div className="sticky top-0 bg-white z-20 px-5 pt-5 border-b border-gray-300">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold">Kinh nghiệm làm việc</h2>
                <button className="text-2xl text-gray-600 hover:text-gray-900" onClick={handleCloseExpEdit}>
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Form */}
            <form className="flex-1 overflow-y-auto px-5 pb-5 mt-5 border-b border-gray-300 space-y-4">
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col">
                  <label className="font-bold mb-2">
                    Chức danh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    placeholder="Nhập chức danh"
                    value={formDataexperience.position}
                    onChange={handleInputChangeExperience}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring focus:border-blue-400"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-bold mb-2">
                    Công ty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    placeholder="Nhập công ty"
                    value={formDataexperience.company}
                    onChange={handleInputChangeExperience}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col relative">
                  <label className="font-bold mb-2">
                    Từ tháng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="startMonth"
                    name="startMonth"
                    placeholder="MM/YYYY"
                    value={formDataexperience.startMonth}
                    onChange={handleInputChangeExperience}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded text-sm focus:outline-none focus:ring focus:border-blue-400"
                  />
                  <FaCalendarAlt className="absolute right-3 top-[38px] text-gray-500" />
                </div>

                <div className="flex flex-col relative">
                  <label className="font-bold mb-2">
                    Đến tháng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="endMonth"
                    name="endMonth"
                    placeholder="MM/YYYY"
                    value={formDataexperience.endMonth}
                    onChange={handleInputChangeExperience}
                    disabled={isChecked}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded text-sm focus:outline-none focus:ring focus:border-blue-400"
                  />
                  <FaCalendarAlt className="absolute right-3 top-[38px] text-gray-500" />
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-center mt-2">
                <label className="inline-flex items-center cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    className="hidden peer"
                  />
                  <span className="w-5 h-5 border-2 border-blue-500 rounded-sm mr-2 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all duration-200 relative">
                    {isChecked && <span className="absolute w-3 h-3 bg-white top-1 left-1 rounded-sm" />}
                  </span>
                  Công việc hiện tại
                </label>
              </div>

              {/* Mô tả */}
              <div className="flex flex-col">
                <label className="font-bold mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="describe"
                  placeholder="Nhập mô tả..."
                  value={formDataexperience.describe}
                  onChange={handleInputChangeExperience}
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400 text-sm resize-y"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-5 py-4">
              <button
                onClick={() => {
                  handleSaveExperience();
                  handleCloseExpEdit();
                }}
                className="bg-[#5a8cb5] text-white px-5 py-2 w-[100px] rounded hover:bg-blue-700 transition-all"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={handleCloseExpEdit}
                className="bg-gray-300 text-black px-5 py-2 w-[100px] rounded hover:bg-gray-400 transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Form chỉnh sửa kỹ năng *********************************************/}
      {isEditSkillOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-[780px] max-w-[780px] min-w-[400px] shadow-lg flex flex-col h-[80%] overflow-hidden">

            {/* Header */}
            <div className="sticky top-0 bg-white z-20 px-5 pt-5 border-b border-gray-300">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold">Kỹ năng</h2>
                <button className="text-2xl text-gray-600 hover:text-gray-900" onClick={handleCloseSkillEdit}>
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Form */}
            <form className="flex-1 overflow-y-auto px-5 pb-5 mt-5 border-b border-gray-300 space-y-4">
              <div className="flex flex-col mb-4">
                <label htmlFor="skill" className="font-bold mb-2">
                  Kỹ năng
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    id="skilluer"
                    name="skilluer"
                    placeholder="Nhập kỹ năng"
                    value={skill}
                    onChange={handleInputSkillChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {/* Danh sách kỹ năng */}
              {skillsList.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-base font-semibold mb-2 text-gray-700">Kỹ năng đã thêm:</h3>
                  <ul className="list-none pl-0 space-y-2">
                    {skillsList.map((item, index) => (
                      <li
                        key={index}
                        className="bg-gray-100 px-4 py-2 rounded shadow-sm text-sm flex justify-between items-center"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveSkill(e, index)}
                          className="text-gray-500 hover:text-red-600 transition"
                          aria-label="Xóa kỹ năng"
                        >
                          <FaTimes />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-5 py-4">
              <button
                type="submit"
                onClick={async (e) => {
                  await handleSubmitSkill(e);
                  handleCloseSkillEdit();
                }}
                className="bg-[#5a8cb5] text-white px-5 py-2 w-[100px] rounded hover:bg-blue-700 transition-all"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={handleCloseSkillEdit}
                className="bg-gray-300 text-black px-5 py-2 w-[100px] rounded hover:bg-gray-400 transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;

